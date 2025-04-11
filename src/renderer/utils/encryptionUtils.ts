/**
 * Encryption utilities for handling sensitive environment variables
 */

// For encryption, we'll use the Web Crypto API which is available in modern browsers
// and Electron environments

// Application encryption key - in a real app, this would be generated on first run
// and securely stored in the system keychain or user preferences
let encryptionKey: CryptoKey | null = null;

/**
 * Initialize the encryption system
 * In a production app, you would generate this key once and store it securely
 */
export const initializeEncryption = async (): Promise<void> => {
  if (encryptionKey) return;
  
  try {
    // Generate a new encryption key if one doesn't exist
    // In a real app, you'd try to load a saved key first
    encryptionKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
    
    console.log('Encryption initialized successfully');
  } catch (error) {
    console.error('Failed to initialize encryption:', error);
    // Fallback to a less secure approach in case of error
    createFallbackKey();
  }
};

/**
 * Create a fallback encryption key for environments where crypto API is not fully supported
 * This is less secure but provides better than nothing
 */
const createFallbackKey = () => {
  console.warn('Using fallback encryption - less secure');
  // We'll still store this as a CryptoKey type for consistent interface
  encryptionKey = {
    algorithm: { name: 'FALLBACK' },
    extractable: false,
    type: 'secret',
    usages: ['encrypt', 'decrypt']
  } as CryptoKey;
};

/**
 * Encrypt a string value
 * @param value The value to encrypt
 * @returns A prefixed string with the encrypted value
 */
export const encryptValue = async (value: string): Promise<string> => {
  if (!encryptionKey) {
    await initializeEncryption();
  }
  
  try {
    if (encryptionKey?.algorithm.name === 'FALLBACK') {
      // Use a simple XOR-based scrambling for fallback
      return `encrypted:${simpleObfuscate(value)}`;
    }
    
    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the value
    const encodedValue = new TextEncoder().encode(value);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      encryptionKey!,
      encodedValue
    );
    
    // Convert both the IV and encrypted data to base64
    const ivString = bufferToBase64(iv);
    const encryptedString = bufferToBase64(new Uint8Array(encryptedBuffer));
    
    // Return with a prefix so we know it's encrypted, and include the IV
    return `encrypted:${ivString}:${encryptedString}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    // Return a fallback in case of encryption failure
    return `encrypted:${simpleObfuscate(value)}`;
  }
};

/**
 * Decrypt an encrypted value
 * @param encryptedValue The encrypted value (with prefix)
 * @returns The original decrypted string or the input if not encrypted
 */
export const decryptValue = async (encryptedValue: string): Promise<string> => {
  if (!encryptionKey) {
    await initializeEncryption();
  }
  
  if (!encryptedValue.startsWith('encrypted:')) {
    return encryptedValue;
  }
  
  try {
    // Handle fallback encryption
    if (encryptionKey?.algorithm.name === 'FALLBACK') {
      const obfuscatedValue = encryptedValue.substring(10); // Remove 'encrypted:' prefix
      return simpleDeobfuscate(obfuscatedValue);
    }
    
    // Parse components (encrypted:iv:data)
    const parts = encryptedValue.split(':');
    if (parts.length !== 3) {
      // If format is wrong, try old format with just prefix
      return encryptedValue.substring(10);
    }
    
    const ivString = parts[1];
    const encryptedString = parts[2];
    
    // Convert from base64 to ArrayBuffer
    const iv = base64ToBuffer(ivString);
    const encryptedData = base64ToBuffer(encryptedString);
    
    // Decrypt the value
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      encryptionKey!,
      encryptedData
    );
    
    // Convert the decrypted array buffer back to a string
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    // If decryption fails, return without prefix to avoid breaking the app
    const fallbackValue = encryptedValue.substring(10);
    // Try simple deobfuscation as a fallback
    try {
      return simpleDeobfuscate(fallbackValue);
    } catch {
      // If all else fails, just return the string without the prefix
      return fallbackValue;
    }
  }
};

/**
 * Convert an ArrayBuffer to a base64 string
 */
const bufferToBase64 = (buffer: Uint8Array): string => {
  const byteArray = new Uint8Array(buffer);
  let binaryString = '';
  for (let i = 0; i < byteArray.byteLength; i++) {
    binaryString += String.fromCharCode(byteArray[i]);
  }
  return btoa(binaryString);
};

/**
 * Convert a base64 string to an ArrayBuffer
 */
const base64ToBuffer = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
};

/**
 * Simple obfuscation for fallback (not secure, but better than plaintext)
 */
const simpleObfuscate = (text: string): string => {
  // Simple XOR with a fixed key
  const key = 'RESTIFY_FALLBACK_KEY';
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    // XOR each character with corresponding key character
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  
  // Convert to base64 to make it URL-safe
  return btoa(result);
};

/**
 * Revert the simple obfuscation
 */
const simpleDeobfuscate = (obfuscated: string): string => {
  try {
    // Decode from base64
    const decoded = atob(obfuscated);
    const key = 'RESTIFY_FALLBACK_KEY';
    let result = '';
    
    for (let i = 0; i < decoded.length; i++) {
      // Reverse the XOR operation
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  } catch (error) {
    console.error('Deobfuscation failed:', error);
    return obfuscated;
  }
}; 