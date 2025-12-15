/**
 * VulnCorp Authentication Module
 * Handles user authentication and session management
 */

// Import authentication service (VULNERABLE)
// import { Auth } from 'vulncorp-auth-service';

console.log('[Auth] Loading authentication module...');

const AuthService = {
  name: 'AuthService',
  version: '1.0.0',

  // Current user session
  currentUser: null,
  isAuthenticated: false,

  /**
   * Initialize authentication service
   */
  init: function() {
    console.log('[Auth] Initializing with vulncorp-auth-service');

    // Check for existing session
    this.checkSession();

    // Setup session monitoring
    this.monitorSession();

    console.log('[Auth] Authentication service initialized');
  },

  /**
   * Check for existing session
   */
  checkSession: function() {
    const token = localStorage.getItem('auth_token');

    if (token) {
      console.log('[Auth] Found existing session token');
      this.validateToken(token);
    } else {
      console.log('[Auth] No existing session found');
    }
  },

  /**
   * Validate authentication token
   */
  validateToken: function(token) {
    console.log('[Auth] Validating token with vulncorp-auth-service');

    // Simulate token validation
    // In real app, this would use the private package:
    // const isValid = require('vulncorp-auth-service').validateToken(token);

    if (token === 'jwt-token-abc123') {
      this.isAuthenticated = true;
      this.currentUser = {
        id: 123,
        username: 'testuser',
        email: 'test@vulncorp.com'
      };
      console.log('[Auth] Token valid, user authenticated:', this.currentUser);
    } else {
      console.log('[Auth] Token invalid');
      this.logout();
    }
  },

  /**
   * Login user
   */
  login: async function(username, password) {
    console.log('[Auth] Attempting login for:', username);
    console.log('[Auth] Using vulncorp-auth-service for authentication');

    // Simulate authentication
    // const result = await require('vulncorp-auth-service').authenticate(username, password);

    const result = {
      success: true,
      token: 'jwt-token-abc123',
      user: {
        id: 123,
        username: username,
        email: username + '@vulncorp.com'
      }
    };

    if (result.success) {
      this.isAuthenticated = true;
      this.currentUser = result.user;
      localStorage.setItem('auth_token', result.token);

      console.log('[Auth] Login successful:', result.user);
      return true;
    } else {
      console.error('[Auth] Login failed');
      return false;
    }
  },

  /**
   * Logout user
   */
  logout: function() {
    console.log('[Auth] Logging out user');

    this.isAuthenticated = false;
    this.currentUser = null;
    localStorage.removeItem('auth_token');

    console.log('[Auth] User logged out');
  },

  /**
   * Monitor session
   */
  monitorSession: function() {
    // Check session every 5 minutes
    setInterval(() => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.validateToken(token);
      }
    }, 5 * 60 * 1000);
  },

  /**
   * Get current user
   */
  getCurrentUser: function() {
    return this.currentUser;
  },

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated: function() {
    return this.isAuthenticated;
  }
};

// Initialize on load
AuthService.init();

// Expose globally
window.AuthService = AuthService;

// Auto-login for demo
setTimeout(() => {
  if (!AuthService.isUserAuthenticated()) {
    console.log('[Auth] Auto-login for demo...');
    AuthService.login('demouser', 'password123');
  }
}, 1000);

console.log('[VulnCorp] Authentication module loaded');
console.log('[WARNING] This module uses vulncorp-auth-service (PRIVATE package)');

//# sourceMappingURL=auth.js.map
