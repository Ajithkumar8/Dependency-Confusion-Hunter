/**
 * VulnCorp Application Bundle
 * Main application code with private dependencies
 *
 * VULNERABLE: References internal packages not available on npm
 */

// ES6 Module style imports (simulated)
// These would normally be transpiled by webpack/babel

// VULNERABLE: Private data processor
// import { processData, transformData } from 'internal-data-processor-v2';
const dataProcessor = require('internal-data-processor-v2');

// VULNERABLE: Private API SDK
// import ApiClient from 'company-private-api-sdk';
const ApiClient = require('company-private-api-sdk');

// VULNERABLE: Cache manager
// import CacheManager from 'enterprise-cache-manager';
const CacheManager = require('enterprise-cache-manager');

/**
 * Main Application Class
 */
class VulnCorpApp {
  constructor() {
    this.apiClient = new ApiClient({
      baseUrl: 'https://api.vulncorp.internal',
      apiKey: 'secret-api-key-123'
    });

    this.cacheManager = new CacheManager({
      ttl: 3600,
      maxSize: 1000
    });

    this.dataProcessor = dataProcessor;

    console.log('[VulnCorp App] Application initialized');
    this.init();
  }

  async init() {
    console.log('[VulnCorp App] Starting initialization...');

    // Load user data
    await this.loadUserData();

    // Initialize analytics
    this.initAnalytics();

    // Setup data processing
    this.setupDataProcessing();

    console.log('[VulnCorp App] Initialization complete');
  }

  async loadUserData() {
    try {
      const cachedData = this.cacheManager.get('user-data');

      if (cachedData) {
        console.log('[VulnCorp App] Loaded user data from cache');
        return cachedData;
      }

      const userData = await this.apiClient.get('/api/user/me');
      this.cacheManager.set('user-data', userData);

      console.log('[VulnCorp App] User data loaded:', userData);
      return userData;
    } catch (error) {
      console.error('[VulnCorp App] Error loading user data:', error);
    }
  }

  initAnalytics() {
    console.log('[VulnCorp App] Initializing analytics...');
    // Analytics initialization code
  }

  setupDataProcessing() {
    console.log('[VulnCorp App] Setting up data processing pipeline...');

    // Process some mock data
    const mockData = [
      { id: 1, value: 100 },
      { id: 2, value: 200 },
      { id: 3, value: 300 }
    ];

    const processed = this.dataProcessor.processData(mockData);
    console.log('[VulnCorp App] Processed data:', processed);
  }
}

/**
 * Simulated require() for private packages
 */
function require(moduleName) {
  const modules = {
    'internal-data-processor-v2': {
      name: 'internal-data-processor-v2',
      version: '2.1.0',
      processData: function(data) {
        console.log('[VULNERABLE] Using internal-data-processor-v2');
        return data.map(item => ({
          ...item,
          processed: true,
          timestamp: Date.now()
        }));
      },
      transformData: function(data, schema) {
        return data;
      }
    },

    'company-private-api-sdk': function(config) {
      console.log('[VULNERABLE] Loading company-private-api-sdk');
      return {
        name: 'company-private-api-sdk',
        version: '3.0.5',
        config: config,
        get: async function(endpoint) {
          console.log('[API SDK] GET', endpoint);
          return { data: { name: 'Test User', id: 123 } };
        },
        post: async function(endpoint, data) {
          console.log('[API SDK] POST', endpoint, data);
          return { success: true };
        }
      };
    },

    'enterprise-cache-manager': function(options) {
      console.log('[VULNERABLE] Loading enterprise-cache-manager');
      const cache = new Map();
      return {
        name: 'enterprise-cache-manager',
        version: '1.5.2',
        get: function(key) {
          return cache.get(key);
        },
        set: function(key, value) {
          cache.set(key, value);
        },
        has: function(key) {
          return cache.has(key);
        },
        clear: function() {
          cache.clear();
        }
      };
    }
  };

  return modules[moduleName];
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  window.vulnCorpApp = new VulnCorpApp();
});

// Expose for debugging
window.VulnCorpApp = VulnCorpApp;

console.log('[VulnCorp] App bundle loaded');
console.log('[WARNING] This application uses the following PRIVATE packages:');
console.log('  - internal-data-processor-v2');
console.log('  - company-private-api-sdk');
console.log('  - enterprise-cache-manager');
console.log('[WARNING] These packages may be vulnerable to dependency confusion attacks!');

//# sourceMappingURL=app.bundle.js.map
