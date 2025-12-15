// Dependency Confusion Hunter - Content Script
// Author: OFJAAAH

(function() {
  'use strict';

  // Monitor all script tags in the page
  function scanPageScripts() {
    const scripts = document.querySelectorAll('script[src]');

    scripts.forEach(script => {
      const src = script.src;
      if (src && (src.endsWith('.js') || src.endsWith('.map'))) {
        // Send to background for analysis
        try {
          chrome.runtime.sendMessage({
            action: 'analyzeUrl',
            url: src
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.debug('[Dependency Hunter] Error sending message:', chrome.runtime.lastError.message);
            }
          });
        } catch (e) {
          console.debug('[Dependency Hunter] Exception sending message:', e.message);
        }
      }
    });
  }

  // Monitor console for source map references
  function monitorConsoleSourceMaps() {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn
    };

    // Intercept console methods
    ['log', 'error', 'warn'].forEach(method => {
      console[method] = function(...args) {
        // Look for .map file references
        args.forEach(arg => {
          if (typeof arg === 'string' && arg.includes('.map')) {
            const mapUrls = arg.match(/https?:\/\/[^\s]+\.map/g);
            if (mapUrls) {
              mapUrls.forEach(url => {
                try {
                  chrome.runtime.sendMessage({
                    action: 'analyzeUrl',
                    url: url
                  }, (response) => {
                    if (chrome.runtime.lastError) {
                      console.debug('[Dependency Hunter] Error sending message:', chrome.runtime.lastError.message);
                    }
                  });
                } catch (e) {
                  console.debug('[Dependency Hunter] Exception sending message:', e.message);
                }
              });
            }
          }
        });

        originalConsole[method].apply(console, args);
      };
    });
  }

  // Monitor dynamic script injections
  function monitorDynamicScripts() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          // Check if node is an Element before accessing tagName
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SCRIPT' && node.src) {
            try {
              chrome.runtime.sendMessage({
                action: 'analyzeUrl',
                url: node.src
              }, (response) => {
                if (chrome.runtime.lastError) {
                  console.debug('[Dependency Hunter] Error sending message:', chrome.runtime.lastError.message);
                }
              });
            } catch (e) {
              console.debug('[Dependency Hunter] Exception sending message:', e.message);
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Check for webpack/vite/bundler artifacts
  function scanBundlerArtifacts() {
    // Look for webpack chunk loading
    if (window.webpackJsonp || window.__webpack_require__) {
      console.log('[Dependency Hunter] Webpack detected');
    }

    // Look for source maps in window
    const scripts = document.scripts;
    for (let script of scripts) {
      if (script.textContent.includes('//# sourceMappingURL=')) {
        const match = script.textContent.match(/\/\/# sourceMappingURL=([^\s]+)/);
        if (match && match[1]) {
          let mapUrl = match[1];
          if (!mapUrl.startsWith('http')) {
            mapUrl = new URL(mapUrl, window.location.href).href;
          }
          try {
            chrome.runtime.sendMessage({
              action: 'analyzeUrl',
              url: mapUrl
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.debug('[Dependency Hunter] Error sending message:', chrome.runtime.lastError.message);
              }
            });
          } catch (e) {
            console.debug('[Dependency Hunter] Exception sending message:', e.message);
          }
        }
      }
    }
  }

  // Extract package info from error stack traces
  function monitorErrorStacks() {
    window.addEventListener('error', (event) => {
      if (event.error && event.error.stack) {
        const stack = event.error.stack;
        // Look for node_modules references
        const moduleMatches = stack.match(/node_modules\/([^\/\s]+)/g);
        if (moduleMatches) {
          moduleMatches.forEach(match => {
            const pkg = match.replace('node_modules/', '');
            try {
              chrome.runtime.sendMessage({
                action: 'checkPackage',
                package: pkg,
                type: 'npm',
                source: window.location.href
              }, (response) => {
                if (chrome.runtime.lastError) {
                  console.debug('[Dependency Hunter] Error sending message:', chrome.runtime.lastError.message);
                }
              });
            } catch (e) {
              console.debug('[Dependency Hunter] Exception sending message:', e.message);
            }
          });
        }
      }
    });
  }

  // Scan Performance API for resource timing
  function scanResourceTiming() {
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');

      resources.forEach(resource => {
        if (resource.name.match(/\.(js|map)(\?|$)/i)) {
          try {
            chrome.runtime.sendMessage({
              action: 'analyzeUrl',
              url: resource.name
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.debug('[Dependency Hunter] Error sending message:', chrome.runtime.lastError.message);
              }
            });
          } catch (e) {
            console.debug('[Dependency Hunter] Exception sending message:', e.message);
          }
        }
      });
    }
  }

  // Inject script to access page context
  function injectPageContextScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => script.remove();
  }

  // Listen for messages from injected script
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    if (event.data.type === 'DEPENDENCY_HUNTER_PACKAGE') {
      try {
        chrome.runtime.sendMessage({
          action: 'checkPackage',
          package: event.data.package,
          type: event.data.packageType,
          source: event.data.source
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.debug('[Dependency Hunter] Error sending message:', chrome.runtime.lastError.message);
          }
        });
      } catch (e) {
        console.debug('[Dependency Hunter] Exception sending message:', e.message);
      }
    }
  });

  // Initialize all scanners
  function init() {
    console.log('[Dependency Confusion Hunter] Initialized by OFJAAAH');

    // Run scanners
    scanPageScripts();
    scanBundlerArtifacts();
    scanResourceTiming();

    // Setup monitors
    monitorDynamicScripts();
    monitorErrorStacks();

    // Inject page context script
    injectPageContextScript();

    // Rescan after page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          scanPageScripts();
          scanBundlerArtifacts();
          scanResourceTiming();
        }, 1000);
      });
    }
  }

  // Start
  init();
})();
