import { SecretsProfile, Secret } from '../types';

// In a production app, you'd use a proper encryption library like CryptoJS
// This is a simplified version for demonstration purposes

/**
 * Service for managing secrets profiles
 */
export class SecretsService {
  private static readonly STORAGE_KEY = 'restify-secrets';

  /**
   * Load all secrets profiles from local storage
   */
  static loadProfiles(): SecretsProfile[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load secrets profiles:', error);
      return [];
    }
  }

  /**
   * Save all secrets profiles to local storage
   */
  static saveProfiles(profiles: SecretsProfile[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Failed to save secrets profiles:', error);
    }
  }

  /**
   * Encrypt a profile's secrets
   * In a real implementation, this would use proper encryption
   */
  static encryptProfile(profile: SecretsProfile, password: string): SecretsProfile {
    if (!password) {
      throw new Error('Password is required for encryption');
    }

    // In a real implementation, you'd encrypt each secret value
    // For this demo, we'll just mark it as encrypted
    return {
      ...profile,
      isEncrypted: true,
      updatedAt: Date.now(),
    };
  }

  /**
   * Decrypt a profile's secrets
   * In a real implementation, this would use proper decryption
   */
  static decryptProfile(profile: SecretsProfile, password: string): SecretsProfile {
    if (!password) {
      throw new Error('Password is required for decryption');
    }

    if (!profile.isEncrypted) {
      return profile;
    }

    // In a real implementation, you'd decrypt each secret value
    // For this demo, we'll just mark it as decrypted
    return {
      ...profile,
      isEncrypted: false,
      updatedAt: Date.now(),
    };
  }

  /**
   * Export a profile as .env format
   */
  static exportAsEnv(profile: SecretsProfile): string {
    return profile.secrets
      .map(secret => `${secret.key}=${secret.value}`)
      .join('\n');
  }

  /**
   * Import secrets from .env content
   */
  static importFromEnv(content: string, profileName: string): Partial<SecretsProfile> {
    const secrets: Secret[] = [];
    
    // Parse each line of the .env file
    const lines = content.split('\n');
    for (const line of lines) {
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) continue;
      
      // Parse key-value pairs
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const [, key, value = ''] = match;
        
        secrets.push({
          id: crypto.randomUUID(), // Use UUID v4 in a real implementation
          key,
          value,
          isMasked: true,
        });
      }
    }
    
    return {
      name: profileName,
      secrets,
      isEncrypted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
} 