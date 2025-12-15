/**
 * VulnCorp Vendor Bundle
 * Contains third-party dependencies and internal libraries
 *
 * VULNERABLE: This bundle references private packages that don't exist publicly
 */

// Webpack-style module loader simulation
(function(modules) {
  var installedModules = {};

  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }

    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };

    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    module.l = true;
    return module.exports;
  }

  // Load modules
  __webpack_require__(0);

})({
  // Module 0: Main entry point
  0: function(module, exports, __webpack_require__) {
    // Import private authentication service
    const auth = __webpack_require__('vulncorp-auth-service');

    // Import analytics engine
    const analytics = __webpack_require__('vulncorp-analytics-engine');

    // Import crypto library
    const crypto = __webpack_require__('secret-crypto-lib');

    console.log('[VulnCorp] Vendor bundle loaded');
    console.log('[VulnCorp] Auth service:', auth);
    console.log('[VulnCorp] Analytics engine:', analytics);
    console.log('[VulnCorp] Crypto library:', crypto);
  },

  // Module: vulncorp-auth-service (PRIVATE PACKAGE)
  'vulncorp-auth-service': function(module, exports, __webpack_require__) {
    // Simulate private authentication service
    // This package DOES NOT exist on npm public registry

    const logger = __webpack_require__('vulncorp-logger');

    module.exports = {
      name: 'vulncorp-auth-service',
      version: '1.2.3',
      authenticate: function(username, password) {
        logger.log('Authentication attempt for: ' + username);
        return {
          token: 'jwt-token-abc123',
          user: username,
          authenticated: true
        };
      },
      validateToken: function(token) {
        return token === 'jwt-token-abc123';
      }
    };

    console.log('[VULNERABLE] Loading private package: vulncorp-auth-service');
  },

  // Module: vulncorp-analytics-engine (PRIVATE PACKAGE)
  'vulncorp-analytics-engine': function(module, exports) {
    // This package DOES NOT exist on npm public registry

    module.exports = {
      name: 'vulncorp-analytics-engine',
      version: '2.5.1',
      trackEvent: function(event, data) {
        console.log('[Analytics]', event, data);
      },
      trackPageView: function(page) {
        console.log('[Analytics] Page view:', page);
      },
      getUserMetrics: function() {
        return {
          activeUsers: 1234,
          pageViews: 5678,
          conversionRate: 0.23
        };
      }
    };

    console.log('[VULNERABLE] Loading private package: vulncorp-analytics-engine');
  },

  // Module: secret-crypto-lib (PRIVATE PACKAGE)
  'secret-crypto-lib': function(module, exports) {
    // This package DOES NOT exist on npm public registry

    module.exports = {
      name: 'secret-crypto-lib',
      version: '0.9.4',
      encrypt: function(data, key) {
        // Fake encryption
        return btoa(data);
      },
      decrypt: function(data, key) {
        // Fake decryption
        return atob(data);
      },
      hash: function(data) {
        return 'hash_' + data.length;
      }
    };

    console.log('[VULNERABLE] Loading private package: secret-crypto-lib');
  },

  // Module: vulncorp-logger (PRIVATE PACKAGE)
  'vulncorp-logger': function(module, exports) {
    // This package DOES NOT exist on npm public registry

    module.exports = {
      name: 'vulncorp-logger',
      version: '1.0.8',
      log: function(message) {
        console.log('[VulnCorp Logger]', new Date().toISOString(), message);
      },
      error: function(message) {
        console.error('[VulnCorp Logger]', new Date().toISOString(), message);
      },
      warn: function(message) {
        console.warn('[VulnCorp Logger]', new Date().toISOString(), message);
      }
    };

    console.log('[VULNERABLE] Loading private package: vulncorp-logger');
  }
});

// Expose to global scope for testing
window.VulnCorpVendor = {
  loaded: true,
  packages: [
    'vulncorp-auth-service',
    'vulncorp-analytics-engine',
    'secret-crypto-lib',
    'vulncorp-logger'
  ]
};

console.log('[VulnCorp] Vendor bundle initialization complete');
console.log('[WARNING] This bundle uses PRIVATE packages that may be vulnerable to dependency confusion attacks!');

//# sourceMappingURL=vendor.bundle.js.map
