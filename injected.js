// Injected script running in page context
// Author: OFJAAAH

(function() {
  'use strict';

  // Intercept require/import calls if available
  if (typeof require !== 'undefined' && require.cache) {
    Object.keys(require.cache).forEach(module => {
      if (module.includes('node_modules')) {
        const parts = module.split('node_modules/');
        if (parts[1]) {
          const pkgName = parts[1].split('/')[0];
          window.postMessage({
            type: 'DEPENDENCY_HUNTER_PACKAGE',
            package: pkgName,
            packageType: 'npm',
            source: window.location.href
          }, '*');
        }
      }
    });
  }

  // Monitor webpack modules
  if (window.webpackJsonp) {
    const original = window.webpackJsonp.push;
    window.webpackJsonp.push = function(args) {
      if (args && args[1]) {
        Object.keys(args[1]).forEach(moduleId => {
          const moduleStr = args[1][moduleId].toString();
          // Extract requires
          const requires = moduleStr.match(/require\(['"]([^'"]+)['"]\)/g);
          if (requires) {
            requires.forEach(req => {
              const match = req.match(/require\(['"]([^'"]+)['"]\)/);
              if (match && match[1] && !match[1].startsWith('.')) {
                window.postMessage({
                  type: 'DEPENDENCY_HUNTER_PACKAGE',
                  package: match[1],
                  packageType: 'npm',
                  source: window.location.href
                }, '*');
              }
            });
          }
        });
      }
      return original.apply(this, arguments);
    };
  }

  // Monitor global objects for package info
  if (window.__NEXT_DATA__) {
    console.log('[Dependency Hunter] Next.js detected');
  }

  if (window.__NUXT__) {
    console.log('[Dependency Hunter] Nuxt.js detected');
  }

  if (window.React) {
    console.log('[Dependency Hunter] React detected');
  }

  if (window.Vue) {
    console.log('[Dependency Hunter] Vue detected');
  }
})();
