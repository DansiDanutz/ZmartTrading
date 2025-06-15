import axios from 'axios';
import { apiStorage } from './apiStorage';

class APIService {
  constructor() {
    this.axios = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // KuCoin API calls
  async kucoinRequest(endpoint, method = 'GET', params = {}) {
    const apiKey = await apiStorage.getAPIKey('kucoin');
    if (!apiKey) throw new Error('KuCoin API key not found');

    const timestamp = Date.now();
    const signature = this.generateKucoinSignature(endpoint, method, timestamp, apiKey.secret);

    return this.axios({
      method,
      url: `https://api.kucoin.com${endpoint}`,
      headers: {
        'KC-API-KEY': apiKey.key,
        'KC-API-SIGN': signature,
        'KC-API-TIMESTAMP': timestamp,
        'KC-API-PASSPHRASE': apiKey.passphrase
      },
      data: method !== 'GET' ? params : undefined,
      params: method === 'GET' ? params : undefined
    });
  }

  // Cryptometer API calls
  async cryptometerRequest(endpoint, method = 'GET', params = {}) {
    const apiKey = await apiStorage.getAPIKey('cryptometer');
    if (!apiKey) throw new Error('Cryptometer API key not found');

    return this.axios({
      method,
      url: `https://api.cryptometer.io${endpoint}`,
      headers: {
        'X-API-KEY': apiKey.key
      },
      data: method !== 'GET' ? params : undefined,
      params: method === 'GET' ? params : undefined
    });
  }

  // Generate KuCoin signature
  generateKucoinSignature(endpoint, method, timestamp, secret) {
    const str = `${timestamp}${method}${endpoint}`;
    return CryptoJS.HmacSHA256(str, secret).toString(CryptoJS.enc.Base64);
  }

  // Example API methods
  async getKucoinBalance() {
    return this.kucoinRequest('/api/v1/accounts');
  }

  async getCryptometerData(symbol) {
    return this.cryptometerRequest(`/v1/market-data/${symbol}`);
  }
}

export const apiService = new APIService(); 