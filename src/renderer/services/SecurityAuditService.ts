import { ApiRequest, ApiResponse, RequestHeader } from '../types';

// Security issue types
export enum SecurityIssueType {
  CSRF = 'CSRF',
  XSS = 'XSS',
  SQLInjection = 'SQLInjection',
  HeaderValidation = 'HeaderValidation',
  SensitiveDataExposure = 'SensitiveDataExposure',
  ContentSecurityPolicy = 'ContentSecurityPolicy',
  CORS = 'CORS',
  RateLimiting = 'RateLimiting',
}

// Security issue severity
export enum SecurityIssueSeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

// Security issue interface
export interface SecurityIssue {
  type: SecurityIssueType;
  severity: SecurityIssueSeverity;
  description: string;
  remediation: string;
  location?: string; // Path in the request or response where the issue was found
}

// Security audit result interface
export interface SecurityAuditResult {
  issues: SecurityIssue[];
  status: 'not_started' | 'in_progress' | 'completed';
  timestamp?: number;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
    score: number; // 0-100, higher is better
  };
}

class SecurityAuditService {
  // Check for missing CSRF tokens
  private checkCSRF(request: ApiRequest): SecurityIssue | null {
    const method = request.method;
    const isStateChangingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    
    if (!isStateChangingMethod) return null;

    // Check for CSRF token in headers
    const csrfHeader = this.findHeader(request.headers, ['x-csrf-token', 'csrf-token', 'x-xsrf-token']);
    
    if (!csrfHeader) {
      return {
        type: SecurityIssueType.CSRF,
        severity: SecurityIssueSeverity.High,
        description: 'Missing CSRF protection token in a state-changing request.',
        remediation: 'Add a CSRF token to your request headers (e.g., X-CSRF-Token, X-XSRF-Token).',
      };
    }
    
    return null;
  }

  // Check for potential XSS vectors
  private checkXSS(request: ApiRequest, response: ApiResponse): SecurityIssue | null {
    // Check if we're sending potentially unsafe content in the request
    const bodyString = typeof request.body === 'string' 
      ? request.body 
      : request.body?.raw || '';
    
    if (bodyString.includes('<script>') || bodyString.includes('javascript:')) {
      return {
        type: SecurityIssueType.XSS,
        severity: SecurityIssueSeverity.High,
        description: 'Potential XSS payload detected in request body.',
        remediation: 'Ensure proper encoding of user input before sending to APIs.',
        location: 'request.body',
      };
    }

    // Check response headers for XSS protection
    const contentTypeHeader = response.headers['content-type'] || '';
    const xssProtectionHeader = response.headers['x-xss-protection'];
    
    if (contentTypeHeader.includes('html') && !xssProtectionHeader) {
      return {
        type: SecurityIssueType.XSS,
        severity: SecurityIssueSeverity.Medium,
        description: 'HTML response without X-XSS-Protection header.',
        remediation: 'Add X-XSS-Protection: 1; mode=block header to responses.',
        location: 'response.headers',
      };
    }
    
    return null;
  }

  // Check for potential SQL injection vectors
  private checkSQLInjection(request: ApiRequest): SecurityIssue | null {
    // Simple check for SQL injection patterns
    const sqlPatterns = ["'--", "'; --", "';", "' OR '1'='1", "' OR 1=1--", "\" OR \"\"=\""];
    
    // Look in URL params
    for (const param of request.params) {
      if (param.enabled && sqlPatterns.some(pattern => param.value.includes(pattern))) {
        return {
          type: SecurityIssueType.SQLInjection,
          severity: SecurityIssueSeverity.Critical,
          description: 'Potential SQL injection pattern detected in request parameters.',
          remediation: 'Use parameterized queries and input validation.',
          location: `request.params.${param.name}`,
        };
      }
    }
    
    // Look in body
    const bodyString = typeof request.body === 'string' 
      ? request.body 
      : request.body?.raw || '';
    
    if (sqlPatterns.some(pattern => bodyString.includes(pattern))) {
      return {
        type: SecurityIssueType.SQLInjection,
        severity: SecurityIssueSeverity.Critical,
        description: 'Potential SQL injection pattern detected in request body.',
        remediation: 'Use parameterized queries and input validation.',
        location: 'request.body',
      };
    }
    
    return null;
  }

  // Check security headers
  private checkSecurityHeaders(response: ApiResponse): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const { headers } = response;
    
    // Check Content-Security-Policy
    if (!headers['content-security-policy']) {
      issues.push({
        type: SecurityIssueType.ContentSecurityPolicy,
        severity: SecurityIssueSeverity.Medium,
        description: 'Missing Content-Security-Policy header.',
        remediation: 'Add a Content-Security-Policy header to control resource loading.',
        location: 'response.headers',
      });
    }
    
    // Check CORS headers
    if (headers['access-control-allow-origin'] === '*') {
      issues.push({
        type: SecurityIssueType.CORS,
        severity: SecurityIssueSeverity.Medium,
        description: 'Overly permissive CORS policy (Access-Control-Allow-Origin: *).',
        remediation: 'Restrict CORS to specific origins instead of using wildcard.',
        location: 'response.headers.access-control-allow-origin',
      });
    }
    
    // Check for sensitive information exposure
    const sensitiveHeaders = ['server', 'x-powered-by'];
    for (const header of sensitiveHeaders) {
      if (headers[header]) {
        issues.push({
          type: SecurityIssueType.SensitiveDataExposure,
          severity: SecurityIssueSeverity.Low,
          description: `Header '${header}' may expose server implementation details.`,
          remediation: 'Remove or obfuscate headers that reveal server implementation details.',
          location: `response.headers.${header}`,
        });
      }
    }
    
    return issues;
  }

  // Helper to find a header regardless of case sensitivity
  private findHeader(headers: RequestHeader[] | Record<string, string>, possibleNames: string[]): string | null {
    if (Array.isArray(headers)) {
      for (const header of headers) {
        if (header.enabled && possibleNames.some(name => header.name.toLowerCase() === name.toLowerCase())) {
          return header.value;
        }
      }
    } else {
      for (const name in headers) {
        if (possibleNames.some(possible => name.toLowerCase() === possible.toLowerCase())) {
          return headers[name];
        }
      }
    }
    return null;
  }

  // Calculate security score based on issues found
  private calculateSecurityScore(issues: SecurityIssue[]): number {
    // Start with 100 points
    let score = 100;
    
    // Deduct points based on severity
    for (const issue of issues) {
      switch (issue.severity) {
        case SecurityIssueSeverity.Critical:
          score -= 25;
          break;
        case SecurityIssueSeverity.High:
          score -= 15;
          break;
        case SecurityIssueSeverity.Medium:
          score -= 7;
          break;
        case SecurityIssueSeverity.Low:
          score -= 3;
          break;
      }
    }
    
    // Ensure score isn't negative
    return Math.max(0, score);
  }

  // Run all security checks
  public async performSecurityAudit(request: ApiRequest, response: ApiResponse): Promise<SecurityAuditResult> {
    const issues: SecurityIssue[] = [];
    
    // Start with status as in_progress
    const result: SecurityAuditResult = {
      issues: [],
      status: 'in_progress',
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
        score: 100,
      },
    };
    
    try {
      // Run all checks
      const csrfIssue = this.checkCSRF(request);
      if (csrfIssue) issues.push(csrfIssue);
      
      const xssIssue = this.checkXSS(request, response);
      if (xssIssue) issues.push(xssIssue);
      
      const sqlInjectionIssue = this.checkSQLInjection(request);
      if (sqlInjectionIssue) issues.push(sqlInjectionIssue);
      
      const securityHeaderIssues = this.checkSecurityHeaders(response);
      issues.push(...securityHeaderIssues);
      
      // Count issues by severity
      const criticalIssues = issues.filter(i => i.severity === SecurityIssueSeverity.Critical).length;
      const highIssues = issues.filter(i => i.severity === SecurityIssueSeverity.High).length;
      const mediumIssues = issues.filter(i => i.severity === SecurityIssueSeverity.Medium).length;
      const lowIssues = issues.filter(i => i.severity === SecurityIssueSeverity.Low).length;
      
      // Calculate security score
      const score = this.calculateSecurityScore(issues);
      
      // Update result
      result.issues = issues;
      result.status = 'completed';
      result.timestamp = Date.now();
      result.summary = {
        critical: criticalIssues,
        high: highIssues,
        medium: mediumIssues,
        low: lowIssues,
        total: issues.length,
        score,
      };
    } catch (error) {
      console.error('Error performing security audit:', error);
    }
    
    return result;
  }
}

export default new SecurityAuditService(); 