import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaCheck, FaExclamationTriangle, FaSkull, FaInfoCircle, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { ApiRequest, ApiResponse } from '../../../types';
import SecurityAuditService, { SecurityAuditResult, SecurityIssue, SecurityIssueSeverity } from '../../../services/SecurityAuditService';

interface SecurityAuditPanelProps {
  request: ApiRequest | null;
  response: ApiResponse | null;
}

const SecurityAuditPanel: React.FC<SecurityAuditPanelProps> = ({ request, response }) => {
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedIssues, setExpandedIssues] = useState<{ [key: string]: boolean }>({});

  // Run security audit
  const runSecurityAudit = async () => {
    if (!request || !response) return;

    setLoading(true);
    try {
      const result = await SecurityAuditService.performSecurityAudit(request, response);
      setAuditResult(result);
    } catch (error) {
      console.error('Error running security audit:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle issue expansion
  const toggleIssue = (index: number) => {
    setExpandedIssues({
      ...expandedIssues,
      [index]: !expandedIssues[index],
    });
  };

  // Get color based on severity
  const getSeverityColor = (severity: SecurityIssueSeverity): string => {
    switch (severity) {
      case SecurityIssueSeverity.Critical:
        return '#ff5252';
      case SecurityIssueSeverity.High:
        return '#ff9800';
      case SecurityIssueSeverity.Medium:
        return '#ffd600';
      case SecurityIssueSeverity.Low:
        return '#4caf50';
      default:
        return '#8f8f8f';
    }
  };

  // Get icon based on severity
  const getSeverityIcon = (severity: SecurityIssueSeverity) => {
    switch (severity) {
      case SecurityIssueSeverity.Critical:
        return <FaSkull size={16} />;
      case SecurityIssueSeverity.High:
        return <FaExclamationTriangle size={16} />;
      case SecurityIssueSeverity.Medium:
        return <FaExclamationTriangle size={16} />;
      case SecurityIssueSeverity.Low:
        return <FaInfoCircle size={16} />;
      default:
        return <FaInfoCircle size={16} />;
    }
  };

  // Get gradient color for score
  const getScoreGradient = (score: number): string => {
    if (score >= 90) return 'linear-gradient(90deg, #43A047 0%, #66BB6A 100%)';
    if (score >= 70) return 'linear-gradient(90deg, #7CB342 0%, #9CCC65 100%)';
    if (score >= 50) return 'linear-gradient(90deg, #FDD835 0%, #FFEE58 100%)';
    if (score >= 30) return 'linear-gradient(90deg, #FB8C00 0%, #FFA726 100%)';
    return 'linear-gradient(90deg, #E53935 0%, #EF5350 100%)';
  };

  // Render when no audit has been run
  const renderInitialState = () => (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div 
        style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: '#2a2a2a', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <FaShieldAlt size={36} color="#7e7e7e" />
      </div>
      <h2 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontWeight: 500, fontSize: '20px' }}>Security Audit</h2>
      <p style={{ margin: '0 0 24px 0', color: '#999', textAlign: 'center', maxWidth: '400px' }}>
        Run a security audit to check for CSRF, XSS, SQL Injection, and common security header issues.
      </p>
      <button
        onClick={runSecurityAudit}
        disabled={!request || !response || loading}
        style={{
          background: 'linear-gradient(90deg, #4a6bff 0%, #45a6ff 100%)',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 20px',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(74, 107, 255, 0.3)',
          transition: 'all 0.2s ease',
          opacity: (!request || !response || loading) ? 0.7 : 1,
        }}
      >
        {loading ? (
          <>
            <div style={{ animation: 'spin 1.5s linear infinite' }}>
              <FaShieldAlt size={18} />
            </div>
            <span>Running Audit...</span>
          </>
        ) : (
          <>
            <FaShieldAlt size={18} />
            <span>Run Security Audit</span>
          </>
        )}
      </button>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Render security score
  const renderSecurityScore = () => {
    if (!auditResult) return null;
    
    const { score } = auditResult.summary;
    
    return (
      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div 
          style={{ 
            width: '140px', 
            height: '140px', 
            borderRadius: '50%', 
            background: getScoreGradient(score), 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
            margin: '12px 0',
          }}
        >
          <div style={{ 
            position: 'absolute', 
            top: '6px', 
            left: '6px', 
            right: '6px', 
            bottom: '6px', 
            borderRadius: '50%',
            background: '#1e1e1e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}>
            <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>{score}</span>
            <span style={{ fontSize: '14px', color: '#999' }}>Score</span>
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '16px', 
          marginTop: '12px',
          width: '100%',
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: '#2a2a2a',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '70px',
          }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff5252' }}>{auditResult.summary.critical}</span>
            <span style={{ fontSize: '12px', color: '#999' }}>Critical</span>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: '#2a2a2a',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '70px',
          }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9800' }}>{auditResult.summary.high}</span>
            <span style={{ fontSize: '12px', color: '#999' }}>High</span>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: '#2a2a2a',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '70px',
          }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffd600' }}>{auditResult.summary.medium}</span>
            <span style={{ fontSize: '12px', color: '#999' }}>Medium</span>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: '#2a2a2a',
            borderRadius: '8px',
            padding: '12px',
            minWidth: '70px',
          }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>{auditResult.summary.low}</span>
            <span style={{ fontSize: '12px', color: '#999' }}>Low</span>
          </div>
        </div>
      </div>
    );
  };

  // Render security issues
  const renderIssues = () => {
    if (!auditResult || auditResult.issues.length === 0) return null;

    return (
      <>
        <h3 style={{ margin: '24px 0 16px 0', color: '#e0e0e0', fontWeight: 500, borderBottom: '1px solid #333', paddingBottom: '8px' }}>
          Security Issues ({auditResult.issues.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {auditResult.issues.map((issue, index) => (
            <div 
              key={`issue-${index}`}
              style={{ 
                background: '#2a2a2a', 
                borderRadius: '8px',
                overflow: 'hidden',
                borderLeft: `4px solid ${getSeverityColor(issue.severity)}`,
              }}
            >
              <div 
                style={{ 
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => toggleIssue(index)}
              >
                <div style={{ marginRight: '12px', color: getSeverityColor(issue.severity) }}>
                  {getSeverityIcon(issue.severity)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{issue.type}</span>
                    <span 
                      style={{ 
                        fontSize: '12px', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        background: getSeverityColor(issue.severity),
                        color: issue.severity === SecurityIssueSeverity.Low ? '#000' : '#fff',
                        fontWeight: 'bold',
                      }}
                    >
                      {issue.severity}
                    </span>
                  </div>
                  <div style={{ color: '#999', fontSize: '14px', marginTop: '4px' }}>{issue.description}</div>
                </div>
                <div style={{ marginLeft: '12px', color: '#666' }}>
                  {expandedIssues[index] ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                </div>
              </div>
              
              {expandedIssues[index] && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid #333', marginTop: '4px' }}>
                  <div style={{ margin: '16px 0 8px 0' }}>
                    <span style={{ color: '#999', fontSize: '14px' }}>Remediation:</span>
                    <p style={{ margin: '4px 0 0 0', color: '#e0e0e0', fontSize: '14px' }}>{issue.remediation}</p>
                  </div>
                  
                  {issue.location && (
                    <div style={{ margin: '16px 0 8px 0' }}>
                      <span style={{ color: '#999', fontSize: '14px' }}>Location:</span>
                      <div 
                        style={{ 
                          margin: '8px 0 0 0', 
                          background: '#222', 
                          padding: '8px 12px', 
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          color: '#e0e0e0',
                          overflowX: 'auto',
                        }}
                      >
                        {issue.location}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

  // Render the security audit results
  const renderAuditResult = () => {
    if (!auditResult) return renderInitialState();

    return (
      <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontWeight: 500, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaShieldAlt size={18} />
            Security Audit Results
          </h2>
          <button
            onClick={runSecurityAudit}
            style={{
              background: '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              color: '#e0e0e0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '13px',
            }}
          >
            {loading ? 'Running...' : 'Re-run Audit'}
          </button>
        </div>
        <p style={{ margin: '0 0 20px 0', color: '#999', fontSize: '14px' }}>
          Completed {auditResult.timestamp ? new Date(auditResult.timestamp).toLocaleString() : ''}
        </p>
        
        {renderSecurityScore()}
        {renderIssues()}
        
        {auditResult.issues.length === 0 && (
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              margin: '40px 0',
              color: '#4caf50',
              textAlign: 'center',
            }}
          >
            <div 
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'rgba(76, 175, 80, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <FaCheck size={36} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', color: '#e0e0e0' }}>No Security Issues Found</h3>
            <p style={{ color: '#999', maxWidth: '400px' }}>
              Great job! Your API request and response passed all security checks.
            </p>
          </div>
        )}
      </div>
    );
  };

  return renderAuditResult();
};

export default SecurityAuditPanel; 