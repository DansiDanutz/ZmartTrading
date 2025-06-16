import CryptoJS from 'crypto-js';

class APIStorage {
  constructor() {
    this.passwordHash = localStorage.getItem('zmart_password_hash');
    this.isAuthenticated = false;
    this.encryptionKey = null;
    this.SALT = 'ZmartTrading2024SecureSalt';
    
    // If we have a stored hash, we're initialized
    if (this.passwordHash) {
      this.isAuthenticated = true;
    }
  }

  initialize(password) {
    try {
      // Generate a strong password hash
      this.passwordHash = CryptoJS.SHA256(password).toString();
      
      // Generate a strong encryption key using PBKDF2
      const key = CryptoJS.PBKDF2(password, this.SALT, {
        keySize: 256 / 32,
        iterations: 1000
      });
      this.encryptionKey = key.toString();
      
      this.isAuthenticated = true;
      localStorage.setItem('zmart_password_hash', this.passwordHash);
      
      // Initialize empty API keys array if none exists
      if (!localStorage.getItem('zmart_api_keys')) {
        this.saveAPIKeys([]);
      }
    } catch (error) {
      console.error('Initialization failed:', error);
      throw new Error('Failed to initialize storage');
    }
  }

  verifyPassword(password) {
    try {
      const hash = CryptoJS.SHA256(password).toString();
      if (hash === this.passwordHash) {
        // Regenerate encryption key on successful verification
        const key = CryptoJS.PBKDF2(password, this.SALT, {
          keySize: 256 / 32,
          iterations: 1000
        });
        this.encryptionKey = key.toString();
        this.isAuthenticated = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  getAPIKeys() {
    if (!this.isAuthenticated) throw new Error('Not authenticated');
    try {
      const encrypted = localStorage.getItem('zmart_api_keys');
      if (!encrypted) return [];
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.encryptionKey).toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        console.error('Decryption returned empty result');
        return [];
      }
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to get API keys:', error);
      return [];
    }
  }

  saveAPIKeys(keys) {
    if (!this.isAuthenticated) throw new Error('Not authenticated');
    try {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(keys), this.encryptionKey).toString();
      localStorage.setItem('zmart_api_keys', encrypted);
      console.log('API keys saved successfully');
    } catch (error) {
      console.error('Failed to save API keys:', error);
      throw new Error('Failed to save API keys');
    }
  }

  // Encrypt data with IV
  encrypt(data) {
    try {
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return {
        iv: iv.toString(),
        data: encrypted.toString()
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data with IV
  decrypt(encryptedData) {
    try {
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, this.encryptionKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Get specific API key
  getAPIKey(service) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    const apiKeys = this.getAPIKeys();
    return apiKeys.find(key => key.name.toLowerCase() === service.toLowerCase());
  }

  // Clear all data
  clear() {
    // DO NOT remove from localStorage!
    this.isAuthenticated = false;
    this.encryptionKey = null;
    // Do NOT set this.passwordHash = null;
  }
}

// Create a single instance
const apiStorage = new APIStorage();

// Export the instance
export { apiStorage }; 