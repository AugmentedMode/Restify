import { SecretsProfile, Secret } from '../types';
import CryptoJS from 'crypto-js';

// In a production app, you'd use a proper encryption library like CryptoJS
// This is a simplified version for demonstration purposes

/**
 * Service for managing secrets profiles with real encryption
 */
export class SecretsService {
  private static readonly STORAGE_KEY = 'restify-secrets';
  private static readonly SALT = 'restify-secrets-salt'; // In a production app, use a more secure approach

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
   * Generate a strong encryption key from the user's password
   * This uses PBKDF2 to create a more secure key from the password
   */
  private static generateKey(password: string): string {
    // Use PBKDF2 to derive a key from the password with 1000 iterations
    return CryptoJS.PBKDF2(password, this.SALT, { 
      keySize: 256 / 32, 
      iterations: 1000 
    }).toString();
  }

  /**
   * Encrypt a single value
   */
  private static encryptValue(value: string, password: string): string {
    const key = this.generateKey(password);
    return CryptoJS.AES.encrypt(value, key).toString();
  }

  /**
   * Decrypt a single value
   */
  private static decryptValue(encryptedValue: string, password: string): string {
    const key = this.generateKey(password);
    const bytes = CryptoJS.AES.decrypt(encryptedValue, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Encrypt a profile's secrets with real AES-256 encryption
   */
  static encryptProfile(profile: SecretsProfile, password: string): SecretsProfile {
    if (!password) {
      throw new Error('Password is required for encryption');
    }

    try {
      // Make a deep copy of secrets and encrypt each value
      const encryptedSecrets = profile.secrets.map(secret => ({
        ...secret,
        value: this.encryptValue(secret.value, password)
      }));
      
      return {
        ...profile,
        secrets: encryptedSecrets,
        isEncrypted: true,
        updatedAt: Date.now(),
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt the profile. Please try again.');
    }
  }

  /**
   * Decrypt a profile's secrets
   */
  static decryptProfile(profile: SecretsProfile, password: string): SecretsProfile {
    if (!password) {
      throw new Error('Password is required for decryption');
    }

    if (!profile.isEncrypted) {
      return profile;
    }

    try {
      // Make a deep copy of secrets and decrypt each value
      const decryptedSecrets = profile.secrets.map(secret => {
        try {
          return {
            ...secret,
            value: this.decryptValue(secret.value, password)
          };
        } catch (error) {
          throw new Error('Invalid password or corrupted data');
        }
      });
      
      return {
        ...profile,
        secrets: decryptedSecrets,
        isEncrypted: false,
        updatedAt: Date.now(),
      };
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt the profile. Incorrect password or corrupted data.');
    }
  }

  /**
   * Test if a password can decrypt a profile
   * Used to validate passwords without modifying the profile
   */
  static validatePassword(profile: SecretsProfile, password: string): boolean {
    if (!profile.isEncrypted || profile.secrets.length === 0) {
      return true;
    }

    try {
      // Try to decrypt the first secret as a test
      const secret = profile.secrets[0];
      this.decryptValue(secret.value, password);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Export a profile as .env format
   * If the profile is encrypted, it must be decrypted first
   */
  static exportAsEnv(profile: SecretsProfile): string {
    if (profile.isEncrypted) {
      throw new Error('Profile must be decrypted before exporting');
    }

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
          id: crypto.randomUUID(), // Use UUID v4
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