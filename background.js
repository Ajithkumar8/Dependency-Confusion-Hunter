// Dependency Confusion Hunter - Background Service Worker
// Author: OFJAAAH

let findings = [];
let history = []; // Historical findings
let processedUrls = new Set();
let checkedPackages = new Set(); // Track already checked packages
let config = {
  discordWebhook: '',
  proxyUrl: '',
  autoCheck: true,
  notificationsEnabled: true,
  npmToken: '',
  npmRegistry: 'https://registry.npmjs.org',
  npmAuthEnabled: false,
  showScopedPackages: true, // Show scoped packages for bug bounty
  enableHistory: true,
  analyzeBundles: false, // Analyze bundled code (disabled by default - high false positive rate)
  analyzeManifests: true, // Analyze package.json, requirements.txt, etc.
  analyzeLockfiles: true, // Analyze lock files (yarn.lock, package-lock.json, etc.)
  ignoreKnownDomains: true, // Ignore Meta/Google/etc domains by default
  customIgnoredDomains: [], // User-defined domains to ignore
  minConfidence: 70, // Minimum confidence to show findings (0-100)
  strictMode: true // Only show high-confidence findings
};

// Built-in Node.js modules to ignore
const NODE_BUILTINS = [
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
  'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http',
  'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks',
  'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder',
  'sys', 'timers', 'tls', 'trace_events', 'tty', 'url', 'util', 'v8', 'vm',
  'wasi', 'worker_threads', 'zlib'
];

// Common public packages to ignore (reduce false positives)
const COMMON_PACKAGES = [
  'react', 'react-dom', 'vue', 'angular', 'jquery', 'lodash', 'axios',
  'express', 'webpack', 'babel', 'eslint', 'prettier', 'typescript',
  'next', 'nuxt', 'vite', 'rollup', 'parcel', 'gatsby', 'redux',
  'moment', 'dayjs', 'date-fns', 'ramda', 'underscore', 'immutable',
  'cordova', 'phonegap', 'ionic', 'capacitor', // Mobile frameworks
  'bootstrap', 'tailwindcss', 'material-ui', 'antd', // UI frameworks
  'jest', 'mocha', 'chai', 'jasmine', 'karma', // Testing frameworks
  'commander', 'yargs', 'chalk', 'colors', // CLI tools
  'body-parser', 'cors', 'dotenv', 'morgan', // Express middleware
  'socket.io', 'ws', 'mqtt', // WebSocket/messaging
  'mongoose', 'sequelize', 'typeorm', 'prisma', // ORMs
  'bcrypt', 'jsonwebtoken', 'passport', 'crypto-js', // Security
  'sharp', 'jimp', 'canvas', // Image processing
  'cheerio', 'puppeteer', 'playwright', // Web scraping
  'nodemon', 'pm2', 'concurrently', // Process management
  'glob', 'rimraf', 'mkdirp', 'fs-extra' // File system utilities
];

// Domains to ignore (these have lots of internal modules that generate false positives)
const IGNORED_DOMAINS = [
  'instagram.com',
  'facebook.com',
  'fb.com',
  'meta.com',
  'whatsapp.com',
  'messenger.com',
  'threads.net',
  'oculus.com',
  'workplace.com',
  // Google properties
  'google.com',
  'youtube.com',
  'googleapis.com',
  // Other major sites with heavy bundling
  'twitter.com',
  'x.com',
  'linkedin.com',
  'tiktok.com',
  'snapchat.com',
  'pinterest.com',
  'reddit.com',
  'amazon.com',
  'netflix.com',
  'spotify.com',
  'discord.com',
  'twitch.tv',
  'microsoft.com',
  'apple.com',
  'adobe.com'
];

// Known internal module prefixes from bundled code (Meta/Facebook, Google, etc.)
const INTERNAL_MODULE_PREFIXES = [
  'lexical',       // Lexical editor framework (Meta)
  'react',         // React internals
  'falco',         // Meta internal logging
  'relay',         // Relay GraphQL framework (Meta)
  'fbjs',          // Facebook JavaScript utilities
  'fbt',           // Facebook translation system
  'fbs',           // Facebook internal
  'fbid',          // Facebook ID system
  'graphql',       // GraphQL internals
  'jest',          // Jest internals
  'scheduler',     // React scheduler
  'workbox',       // Google Workbox
  'webpack',       // Webpack runtime
  'polyfill',      // Polyfills
  'regenerator',   // Babel regenerator
  'core-js',       // Core-js polyfills
  'babel-runtime', // Babel runtime
  'tslib',         // TypeScript lib
  'instagram',     // Instagram internal modules
  'igsrc',         // Instagram source
  'igcdn',         // Instagram CDN
  'fb-',           // Facebook prefix
  'ig-',           // Instagram prefix
  'meta-',         // Meta prefix
  'xig',           // Instagram internal
  'polarisnavigation', // Instagram navigation
  'polaris',       // Instagram framework
  'barcelona',     // Threads internal
  'bloks',         // Meta Bloks framework
  'rsrc',          // Meta resources
  'qpl',           // Meta QPL
  'mwax',          // Meta internal
  'lsdid',         // Meta internal
  'comet',         // Facebook Comet framework
  'mercury',       // Facebook Messenger internal
  'sticker',       // Meta stickers
  'story',         // Meta stories
  'reel',          // Meta reels
  'reels'          // Meta reels
];

// Known internal module patterns (case-insensitive)
const INTERNAL_MODULE_PATTERNS = [
  /^lexical/i,           // LexicalComposerContext, LexicalHTML, etc.
  /^use[A-Z]/,           // React hooks: useLexicalEditable, useState, etc.
  /internal/i,           // FalcoLoggerInternalState, etc.
  /^falco/i,             // Falco* modules (Meta internal)
  /^fb[A-Z_]/i,          // FB* modules (Facebook)
  /^fbs[A-Z_]/i,         // FBS* modules (Facebook)
  /^fbt[A-Z_]/i,         // FBT* modules (Facebook)
  /^ig[A-Z_]/i,          // IG* modules (Instagram)
  /^xig/i,               // XIG* modules (Instagram)
  /state$/i,             // *State modules (often internal)
  /context$/i,           // *Context modules (often internal)
  /provider$/i,          // *Provider modules (often internal)
  /^react[A-Z]/i,        // ReactDOM, ReactFiberNode, etc.
  /extension$/i,         // *Extension modules (often internal)
  /^scheduler/i,         // React scheduler internals
  /^relay/i,             // Relay internals
  /utils$/i,             // *Utils (too generic)
  /helpers$/i,           // *Helpers (too generic)
  /runtime$/i,           // *Runtime modules
  /polyfill/i,           // Polyfill modules
  /^webpack[A-Z]/i,      // Webpack internals
  /^_[a-z]/i,            // Private modules starting with underscore
  /logger$/i,            // Logger modules
  /constants$/i,         // Constants modules (too generic)
  /config$/i,            // Config modules (too generic)
  /handler$/i,           // Handler modules (too generic)
  /manager$/i,           // Manager modules (too generic)
  /^polaris/i,           // Instagram Polaris framework
  /^barcelona/i,         // Threads internal
  /^bloks/i,             // Meta Bloks
  /^comet/i,             // Facebook Comet
  /^mercury/i,           // Facebook Messenger
  /^qpl/i,               // Meta QPL
  /^rsrc/i,              // Meta resources
  /^lsd/i,               // Meta LSD
  /^mwax/i,              // Meta internal
  /^css[A-Z_]/i,         // CSS modules
  /^html[A-Z_]/i,        // HTML modules
  /^dom[A-Z_]/i,         // DOM modules
  /^event[A-Z_]/i,       // Event modules
  /^animation/i,         // Animation modules
  /^gesture/i,           // Gesture modules
  /^navigation/i,        // Navigation modules
  /^modal/i,             // Modal modules
  /^dialog/i,            // Dialog modules
  /^tooltip/i,           // Tooltip modules
  /^menu/i,              // Menu modules
  /^button/i,            // Button modules
  /^icon/i,              // Icon modules
  /^image/i,             // Image modules
  /^video/i,             // Video modules
  /^audio/i,             // Audio modules
  /^player/i,            // Player modules
  /^feed/i,              // Feed modules
  /^post/i,              // Post modules
  /^comment/i,           // Comment modules
  /^like/i,              // Like modules
  /^share/i,             // Share modules
  /^follow/i,            // Follow modules
  /^profile/i,           // Profile modules
  /^user/i,              // User modules
  /^account/i,           // Account modules
  /^auth/i,              // Auth modules
  /^login/i,             // Login modules
  /^logout/i,            // Logout modules
  /^session/i,           // Session modules
  /^token/i,             // Token modules
  /^api/i,               // API modules
  /^endpoint/i,          // Endpoint modules
  /^request/i,           // Request modules
  /^response/i,          // Response modules
  /^fetch/i,             // Fetch modules
  /^xhr/i,               // XHR modules
  /^ajax/i,              // AJAX modules
  /^http/i,              // HTTP modules
  /^socket/i,            // Socket modules
  /^websocket/i,         // WebSocket modules
  /^storage/i,           // Storage modules
  /^cache/i,             // Cache modules
  /^cookie/i,            // Cookie modules
  /^local/i,             // Local modules
  /component$/i,         // *Component modules
  /service$/i,           // *Service modules
  /factory$/i,           // *Factory modules
  /adapter$/i,           // *Adapter modules
  /wrapper$/i,           // *Wrapper modules
  /container$/i,         // *Container modules
  /controller$/i,        // *Controller modules
  /reducer$/i,           // *Reducer modules
  /action$/i,            // *Action modules
  /selector$/i,          // *Selector modules
  /hook$/i,              // *Hook modules
  /effect$/i,            // *Effect modules
  /ref$/i,               // *Ref modules
  /memo$/i               // *Memo modules
];

// Python built-in modules
const PYTHON_BUILTINS = [
  'os', 'sys', 'json', 'time', 'datetime', 're', 'math', 'random', 'collections',
  'itertools', 'functools', 'urllib', 'http', 'socket', 'threading', 'multiprocessing',
  'subprocess', 'argparse', 'logging', 'unittest', 'pickle', 'csv', 'xml', 'email',
  'base64', 'hashlib', 'hmac', 'uuid', 'copy', 'io', 'pathlib', 'shutil', 'tempfile'
];

// JavaScript/Programming reserved words and common strings
const RESERVED_WORDS = [
  // JavaScript keywords
  'abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch',
  'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
  'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final',
  'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import',
  'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new',
  'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true',
  'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield',

  // Common programming terms
  'abort', 'abstract', 'as', 'async', 'call', 'callback', 'class', 'constructor',
  'data', 'default', 'define', 'element', 'error', 'event', 'exports', 'extends',
  'from', 'function', 'get', 'global', 'id', 'index', 'info', 'init', 'item',
  'key', 'length', 'load', 'map', 'method', 'module', 'name', 'node', 'object',
  'options', 'params', 'parent', 'prototype', 'require', 'result', 'return',
  'self', 'set', 'state', 'status', 'string', 'target', 'test', 'type', 'undefined',
  'using', 'value', 'values', 'version', 'window',

  // TypeScript/C/C++ specific
  'dllexport', 'dllimport', 'incdir', 'specint', 'typedef', 'unsigned', 'virtual',
  'friend', 'namespace', 'template', 'typename', 'explicit', 'mutable', 'operator',
  'register', 'signed', 'sizeof', 'struct', 'union', 'auto', 'extern', 'restrict',
  'inline', 'asm', 'bool', 'complex', 'imaginary', 'noreturn', 'alignas', 'alignof',

  // Java/Kotlin
  'enherits', 'inherits', 'java', 'kotlin', 'abstract', 'assert', 'strictfp',
  'volatile', 'transient', 'native', 'synchronized',

  // Common short words
  'an', 'at', 'be', 'by', 'do', 'es', 'go', 'in', 'is', 'it', 'no', 'of', 'on',
  'or', 'to', 'up', 'us', 'we', 'am', 'are', 'was', 'has', 'had', 'can', 'may',

  // Common numbers and ports
  '80', '443', '8080', '3000', '5000', '8000', '9000', '8443', '5432', '3306', '27017',

  // Other common non-package strings
  'refer', 'refers', 'contains', 'includes', 'extends', 'implements', 'non_intrinsic',

  // Common generic suffixes/prefixes
  'text', 'html', 'selection', 'clipboard', 'dragon', 'history', 'plain', 'editable',
  'composer', 'editor', 'dom', 'node', 'element'
];

// CSS properties and HTML attributes blacklist
const CSS_HTML_PATTERNS = [
  // CSS properties
  /^(stroke|fill|padding|margin|border|font|color|background|display|position|flex|grid|align|justify|width|height|top|left|right|bottom|opacity|transform|transition|animation|cursor|overflow|z-index|text|line|letter|word)-/i,

  // HTML/ARIA attributes
  /^(aria|data|ng|v-|:|\[|@)/i,

  // Common CSS property patterns
  /^(webkit|moz|ms|o)-/i,
];

// Check if string matches CSS/HTML patterns
function isCssHtmlProperty(name) {
  if (!name) return false;

  // Check against CSS/HTML patterns
  for (const pattern of CSS_HTML_PATTERNS) {
    if (pattern.test(name)) {
      return true;
    }
  }

  // Specific CSS/HTML strings
  const cssHtmlStrings = [
    'stroke-width', 'stroke-miterlimit', 'stroke-opacity', 'stroke-dasharray',
    'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'fill-opacity',
    'fill-rule', 'font-size', 'font-family', 'font-weight', 'font-style',
    'text-align', 'text-decoration', 'text-transform', 'line-height',
    'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
    'margin-left', 'margin-right', 'margin-top', 'margin-bottom',
    'border-width', 'border-style', 'border-color', 'border-radius',
    'background-color', 'background-image', 'background-size',
    'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-label',
    'aria-labelledby', 'aria-describedby', 'aria-hidden', 'aria-level',
    'aria-expanded', 'aria-selected', 'aria-checked', 'aria-pressed',
    'data-id', 'data-value', 'data-name', 'data-type', 'data-index'
  ];

  return cssHtmlStrings.includes(name.toLowerCase());
}

// Check if URL belongs to an ignored domain
function isIgnoredDomain(url) {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check custom ignored domains from config
    if (config.customIgnoredDomains && Array.isArray(config.customIgnoredDomains)) {
      for (const domain of config.customIgnoredDomains) {
        if (hostname === domain || hostname.endsWith('.' + domain)) {
          console.log(`[Dependency Hunter] Skipping custom ignored domain: ${hostname}`);
          return true;
        }
      }
    }

    // Check if ignoreKnownDomains is disabled
    if (config.ignoreKnownDomains === false) {
      return false;
    }

    // Check against built-in ignored domains
    for (const domain of IGNORED_DOMAINS) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        console.log(`[Dependency Hunter] Skipping known domain: ${hostname}`);
        return true;
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

// Check if package name looks like an internal/bundled module
function looksLikeInternalModule(name) {
  if (!name) return false;

  // Camel case with capital letters in middle (internal module naming)
  // e.g., "LexicalComposerContext", "FalcoLoggerInternalState"
  if (/^[A-Z][a-z]+[A-Z]/.test(name)) {
    return true;
  }

  // Contains underscore followed by capital (internal naming)
  if (/_[A-Z]/.test(name)) {
    return true;
  }

  // Very long names are often internal modules
  if (name.length > 40) {
    return true;
  }

  // Contains numbers mixed with letters in unusual ways
  if (/[a-z]\d+[a-z]/i.test(name)) {
    return true;
  }

  return false;
}

// Load configuration on startup
chrome.storage.local.get(['config', 'findings', 'history'], (result) => {
  if (result.config) {
    config = { ...config, ...result.config };
  }
  if (result.findings) {
    findings = result.findings;
  }
  if (result.history) {
    history = result.history;
  }
  updateBadge();
});

// Listen for web requests to intercept JS, .map, and manifest files
chrome.webRequest.onCompleted.addListener(
  (details) => {
    const url = details.url;

    // Skip ignored domains (Meta, Google, etc.)
    if (isIgnoredDomain(url)) {
      return;
    }

    // Process different file types
    const isJsOrMap = url.match(/\.(js|map)(\?|$)/i);
    const isManifest = config.analyzeManifests && url.match(/(package\.json|requirements\.txt|Pipfile|Gemfile|composer\.json|go\.mod|Cargo\.toml)(\?|$)/i);
    const isLockfile = config.analyzeLockfiles && url.match(/(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|Pipfile\.lock|Gemfile\.lock|composer\.lock|go\.sum|Cargo\.lock)(\?|$)/i);

    if (!isJsOrMap && !isManifest && !isLockfile) return;

    // Avoid processing same URL multiple times
    if (processedUrls.has(url)) return;
    processedUrls.add(url);

    // Fetch and analyze the file
    analyzeFile(url, details.tabId);
  },
  { urls: ["<all_urls>"] }
);

// Analyze file content for package dependencies
async function analyzeFile(url, tabId) {
  try {
    // Note: Proxy configuration in browser extensions is handled at the browser level
    // The proxyUrl config is available for reference but not used in fetch()
    const response = await fetchWithTimeout(url, {}, 15000); // 15 second timeout for file downloads
    const content = await response.text();

    // Detect file type based on URL and content
    const fileType = detectFileType(url, content);

    // Extract package names
    const packages = extractPackages(content, url, fileType);

    if (packages.length > 0) {
      console.log(`[Dependency Hunter] Found ${packages.length} packages in ${url}`);

      // Check if packages exist
      for (const pkg of packages) {
        await checkPackageExists(pkg, url, tabId);
      }
    }
  } catch (error) {
    console.warn(`[Dependency Hunter] Error analyzing ${url}:`, error.message);
    // Continue processing - don't let one failed file break the entire extension
  }
}

// Detect file type (JavaScript/TypeScript vs Python vs Manifest)
function detectFileType(url, content) {
  // Check for manifest files (100% reliable sources)
  if (url.match(/package\.json$/i)) return 'package.json';
  if (url.match(/package-lock\.json$/i)) return 'package-lock.json';
  if (url.match(/yarn\.lock$/i)) return 'yarn.lock';
  if (url.match(/pnpm-lock\.yaml$/i)) return 'pnpm-lock.yaml';
  if (url.match(/requirements\.txt$/i)) return 'requirements.txt';
  if (url.match(/Pipfile$/i)) return 'Pipfile';
  if (url.match(/Pipfile\.lock$/i)) return 'Pipfile.lock';
  if (url.match(/Gemfile$/i)) return 'Gemfile';
  if (url.match(/Gemfile\.lock$/i)) return 'Gemfile.lock';
  if (url.match(/composer\.json$/i)) return 'composer.json';
  if (url.match(/composer\.lock$/i)) return 'composer.lock';
  if (url.match(/go\.mod$/i)) return 'go.mod';
  if (url.match(/go\.sum$/i)) return 'go.sum';
  if (url.match(/Cargo\.toml$/i)) return 'Cargo.toml';
  if (url.match(/Cargo\.lock$/i)) return 'Cargo.lock';

  // Check URL extension for code files
  if (url.match(/\.py$/i)) return 'python';
  if (url.match(/\.(js|jsx|ts|tsx|mjs|cjs|map)$/i)) return 'javascript';

  // Analyze content for Python indicators
  const pythonIndicators = [
    /^import\s+\w+$/m,
    /^from\s+\w+\s+import/m,
    /def\s+\w+\s*\(/,
    /class\s+\w+\s*:/,
    /__init__\.py/,
    /pip\s+install/,
    /#!\s*\/usr\/bin\/(env\s+)?python/
  ];

  // JavaScript indicators
  const jsIndicators = [
    /\bconst\s+\w+\s*=/,
    /\blet\s+\w+\s*=/,
    /\bvar\s+\w+\s*=/,
    /function\s*\(/,
    /=>\s*{/,
    /module\.exports/,
    /export\s+(default|const|function|class)/,
    /require\s*\(/,
    /__webpack/,
    /sourceMappingURL/
  ];

  let pythonScore = 0;
  let jsScore = 0;

  pythonIndicators.forEach(pattern => {
    if (pattern.test(content)) pythonScore++;
  });

  jsIndicators.forEach(pattern => {
    if (pattern.test(content)) jsScore++;
  });

  // If JavaScript score is higher, it's JavaScript
  if (jsScore > pythonScore) return 'javascript';

  // If Python score is higher, it's Python
  if (pythonScore > jsScore) return 'python';

  // Default to JavaScript for .js/.map files
  return 'javascript';
}

// Helper function to extract code snippet around a match
function extractCodeSnippet(content, matchIndex, matchLength, contextLines = 3) {
  const lines = content.split('\n');
  let currentPos = 0;
  let lineNumber = 0;

  // Find which line the match is on
  for (let i = 0; i < lines.length; i++) {
    if (currentPos + lines[i].length >= matchIndex) {
      lineNumber = i;
      break;
    }
    currentPos += lines[i].length + 1; // +1 for newline
  }

  // Get context lines before and after
  const startLine = Math.max(0, lineNumber - contextLines);
  const endLine = Math.min(lines.length - 1, lineNumber + contextLines);

  const snippetLines = [];
  for (let i = startLine; i <= endLine; i++) {
    snippetLines.push({
      lineNumber: i + 1,
      content: lines[i],
      isMatch: i === lineNumber
    });
  }

  return {
    snippet: snippetLines,
    matchLine: lineNumber + 1,
    matchedText: content.substr(matchIndex, matchLength)
  };
}

// Check if content looks like bundled/minified code (high chance of false positives)
function isBundledOrMinified(content) {
  // If analyzeBundles is enabled, don't skip bundles
  if (config.analyzeBundles) {
    return false;
  }

  // Check for webpack/bundle indicators
  const bundleIndicators = [
    /__webpack_require__/,
    /webpackChunk/,
    /\(function\s*\(\s*modules?\s*\)\s*{/,  // IIFE bundle pattern
    /\/\*\s*\d+\s*\*\//,                      // Numbered comments in bundles
    /"use strict";.*?"use strict";/s,        // Multiple "use strict"
    /;(function|var|let|const)\([a-z]\)/     // Minified pattern
  ];

  for (const indicator of bundleIndicators) {
    if (indicator.test(content)) {
      return true;
    }
  }

  // Check for high concentration of module definitions (Meta/FB bundles)
  // These bundles define modules with numeric IDs like __d("ModuleName", ...)
  const moduleDefCount = (content.match(/__d\s*\(\s*["'][^"']+["']/g) || []).length;
  if (moduleDefCount > 10) {
    return true;
  }

  return false;
}

// Extract package names from content
function extractPackages(content, sourceUrl, fileType = 'javascript') {
  const packageNames = new Map(); // Use Map to deduplicate by name+type

  // Extract from package.json (100% reliable - NO false positives)
  if (fileType === 'package.json') {
    try {
      const pkgJson = JSON.parse(content);
      const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies, ...pkgJson.peerDependencies, ...pkgJson.optionalDependencies };

      for (const [name, version] of Object.entries(deps)) {
        if (name && isValidPackageName(name)) {
          packageNames.set(`npm:${name}`, {
            name,
            type: 'npm',
            source: sourceUrl,
            codeSnippet: [{ lineNumber: 1, content: `"${name}": "${version}"`, isMatch: true }],
            matchLine: 1,
            matchedText: `"${name}": "${version}"`,
            confidence: 100 // 100% confidence from package.json
          });
        }
      }
    } catch (e) {
      console.error('[Dependency Hunter] Error parsing package.json:', e);
    }
    return Array.from(packageNames.values());
  }

  // Extract from package-lock.json (100% reliable)
  if (fileType === 'package-lock.json') {
    try {
      const lockJson = JSON.parse(content);
      const packages = lockJson.packages || lockJson.dependencies || {};

      for (const [path, info] of Object.entries(packages)) {
        // Extract package name from path (e.g., "node_modules/lodash" -> "lodash")
        const name = path.replace(/^node_modules\//, '').split('/node_modules/').pop();
        if (name && name !== '' && isValidPackageName(name)) {
          packageNames.set(`npm:${name}`, {
            name,
            type: 'npm',
            source: sourceUrl,
            codeSnippet: [{ lineNumber: 1, content: `"${name}"`, isMatch: true }],
            matchLine: 1,
            matchedText: name,
            confidence: 100
          });
        }
      }
    } catch (e) {
      console.error('[Dependency Hunter] Error parsing package-lock.json:', e);
    }
    return Array.from(packageNames.values());
  }

  // Extract from yarn.lock (100% reliable)
  if (fileType === 'yarn.lock') {
    // yarn.lock format: package-name@version:
    const yarnPattern = /^"?([^@\s]+(?:@[^\/\s]+\/[^@\s]+)?)"?@/gm;
    let match;
    while ((match = yarnPattern.exec(content)) !== null) {
      const name = match[1].replace(/^["']|["']$/g, '');
      if (name && isValidPackageName(name)) {
        packageNames.set(`npm:${name}`, {
          name,
          type: 'npm',
          source: sourceUrl,
          codeSnippet: [{ lineNumber: 1, content: match[0], isMatch: true }],
          matchLine: 1,
          matchedText: match[0],
          confidence: 100
        });
      }
    }
    return Array.from(packageNames.values());
  }

  // Extract from requirements.txt (100% reliable)
  if (fileType === 'requirements.txt') {
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      // Remove comments and whitespace
      const cleaned = line.split('#')[0].trim();
      if (!cleaned) return;

      // Extract package name (before ==, >=, etc.)
      const match = cleaned.match(/^([a-zA-Z0-9][a-zA-Z0-9_-]*)/);
      if (match) {
        const name = match[1].toLowerCase();
        if (isValidPythonPackageName(name)) {
          packageNames.set(`pip:${name}`, {
            name,
            type: 'pip',
            source: sourceUrl,
            codeSnippet: [{ lineNumber: idx + 1, content: line, isMatch: true }],
            matchLine: idx + 1,
            matchedText: line,
            confidence: 100
          });
        }
      }
    });
    return Array.from(packageNames.values());
  }

  // Only extract npm packages from JavaScript files
  if (fileType === 'javascript') {
    // Skip if content looks like bundled/minified code (high false positive rate)
    if (isBundledOrMinified(content)) {
      console.log(`[Dependency Hunter] Skipping bundled/minified code: ${sourceUrl}`);
      return [];
    }
    // Patterns for npm packages - MORE STRICT to avoid false positives in bundled code
    const npmPatterns = [
      // Only match require() with quotes - STRICT
      { pattern: /\brequire\s*\(\s*['"]([a-z0-9@][a-z0-9-_/]*)['"]\s*\)/gi, isScopedPackage: false },

      // Only match ES6 import statements - STRICT
      { pattern: /\bimport\s+(?:[\w{},\s*]+\s+from\s+)?['"]([a-z0-9@][a-z0-9-_/]*)['"]/gi, isScopedPackage: false },

      // Dynamic imports - STRICT
      { pattern: /\bimport\s*\(\s*['"]([a-z0-9@][a-z0-9-_/]*)['"]\s*\)/gi, isScopedPackage: false },

      // node_modules paths (most reliable)
      { pattern: /\/node_modules\/([a-z0-9][a-z0-9-_]*)\//gi, isScopedPackage: false },

      // Scoped packages in node_modules
      { pattern: /\/node_modules\/@([a-z0-9-]+)\/([a-z0-9-_]+)\//gi, isScopedPackage: true }
    ];

    // Extract npm packages
    for (const patternObj of npmPatterns) {
      let match;
      const pattern = patternObj.pattern;
      while ((match = pattern.exec(content)) !== null) {
        let pkgName;

        // Handle scoped packages (@org/package)
        if (patternObj.isScopedPackage) {
          pkgName = `@${match[1]}/${match[2]}`;
        } else {
          // Extract only the base package name (before first /)
          const fullPath = match[1];
          pkgName = fullPath.split('/')[0];
        }

        if (pkgName && isValidPackageName(pkgName)) {
          const key = `npm:${pkgName}`;
          if (!packageNames.has(key)) {
            // Extract code snippet
            const codeContext = extractCodeSnippet(content, match.index, match[0].length);

            // Calculate confidence based on pattern type
            let confidence = 50; // Base confidence for JS extraction
            if (match[0].includes('node_modules')) confidence = 90; // Very high if from node_modules path
            else if (match[0].includes('require(')) confidence = 70; // High for require()
            else if (match[0].includes('import')) confidence = 70; // High for import

            packageNames.set(key, {
              name: pkgName,
              type: 'npm',
              source: sourceUrl,
              codeSnippet: codeContext.snippet,
              matchLine: codeContext.matchLine,
              matchedText: codeContext.matchedText,
              confidence: confidence
            });
          }
        }
      }
    }
  }

  // Only extract Python packages from Python files
  if (fileType === 'python') {
    // Improved Python patterns - more specific to avoid false positives
    const pythonPatterns = [
      // Match Python import statements at the start of a line
      { pattern: /^import\s+([a-z0-9_]+)(?:\s|$|,|;)/gm },
      { pattern: /^from\s+([a-z0-9_]+)\s+import/gm },
      // Match pip install commands
      { pattern: /pip\s+install\s+([a-z0-9-_]+)/gi },
      // Match requirements.txt style entries
      { pattern: /^([a-z0-9-_]+)==[\d.]+/gm }
    ];

    // Extract Python packages
    for (const patternObj of pythonPatterns) {
      let match;
      const pattern = patternObj.pattern;
      while ((match = pattern.exec(content)) !== null) {
        const pkgName = match[1];
        if (pkgName && isValidPythonPackageName(pkgName)) {
          const key = `pip:${pkgName}`;
          if (!packageNames.has(key)) {
            // Extract code snippet
            const codeContext = extractCodeSnippet(content, match.index, match[0].length);

            // Calculate confidence for Python
            let confidence = 60; // Base confidence for Python code extraction
            if (match[0].includes('pip install')) confidence = 80; // High for pip install
            else if (match[0].match(/==/)) confidence = 80; // High for requirements format

            packageNames.set(key, {
              name: pkgName,
              type: 'pip',
              source: sourceUrl,
              codeSnippet: codeContext.snippet,
              matchLine: codeContext.matchLine,
              matchedText: codeContext.matchedText,
              confidence: confidence
            });
          }
        }
      }
    }
  }

  return Array.from(packageNames.values());
}

// Validate package name (improved)
function isValidPackageName(name) {
  if (!name || typeof name !== 'string') return false;

  // Store original name for pattern matching (case-sensitive)
  const originalName = name.trim();

  // Normalize name for most checks
  name = originalName.toLowerCase();

  // Check length (npm rules) - minimum 3 chars to avoid false positives
  if (name.length < 3 || name.length > 214) return false;

  // Ignore relative imports
  if (name.startsWith('.') || name.startsWith('/')) return false;

  // Ignore URLs
  if (name.startsWith('http') || name.includes('://')) return false;

  // Ignore node: protocol
  if (name.startsWith('node:')) return false;

  // Ignore built-in Node.js modules
  if (NODE_BUILTINS.includes(name)) return false;

  // Ignore common public packages (reduce false positives)
  if (COMMON_PACKAGES.includes(name)) return false;

  // Check if looks like internal bundled module (CamelCase, etc.)
  if (looksLikeInternalModule(originalName)) {
    console.log(`[Dependency Hunter] Skipping internal-looking module: ${originalName}`);
    return false;
  }

  // Check against internal module prefixes
  for (const prefix of INTERNAL_MODULE_PREFIXES) {
    if (name.startsWith(prefix.toLowerCase())) {
      console.log(`[Dependency Hunter] Skipping internal module prefix: ${name}`);
      return false;
    }
  }

  // Check against internal module patterns (use original name for case-sensitive patterns)
  for (const pattern of INTERNAL_MODULE_PATTERNS) {
    if (pattern.test(originalName)) {
      console.log(`[Dependency Hunter] Skipping internal module pattern: ${originalName}`);
      return false;
    }
  }

  // Ignore reserved words and common programming terms
  if (RESERVED_WORDS.includes(name)) {
    console.log(`[Dependency Hunter] Skipping reserved word: ${name}`);
    return false;
  }

  // Ignore CSS properties and HTML attributes
  if (isCssHtmlProperty(name)) {
    console.log(`[Dependency Hunter] Skipping CSS/HTML property: ${name}`);
    return false;
  }

  // Ignore strings that are purely numeric
  if (/^\d+$/.test(name)) {
    console.log(`[Dependency Hunter] Skipping numeric string: ${name}`);
    return false;
  }

  // Ignore very common generic words (one or two letters)
  if (name.length <= 2) {
    console.log(`[Dependency Hunter] Skipping short string: ${name}`);
    return false;
  }

  // Check if it's a scoped package (@org/package)
  if (name.startsWith('@')) {
    // If we're not showing scoped packages, skip
    if (!config.showScopedPackages) {
      console.log(`[Dependency Hunter] Skipping scoped package: ${name}`);
      return false;
    }
    // Validate scoped package format
    return /^@[a-z0-9-]+\/[a-z0-9-_]+$/.test(name);
  }

  // Validate regular package name (npm rules)
  // - lowercase
  // - no leading/trailing spaces
  // - alphanumeric, hyphens, underscores
  // - cannot start with . or _
  if (name.startsWith('.') || name.startsWith('_')) return false;

  // Must match npm package name pattern
  if (!/^[a-z0-9][a-z0-9-_]*$/.test(name)) {
    return false;
  }

  // Additional heuristics to reduce false positives
  // Ignore names that look like file extensions
  const fileExtensions = ['js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'json', 'html', 'xml', 'svg', 'png', 'jpg', 'gif', 'ico', 'woff', 'ttf', 'eot'];
  if (fileExtensions.includes(name)) {
    console.log(`[Dependency Hunter] Skipping file extension: ${name}`);
    return false;
  }

  // In strict mode, require hyphens or underscores (real packages usually have them)
  if (config.strictMode && name.length <= 6 && !name.includes('-') && !name.includes('_')) {
    console.log(`[Dependency Hunter] Strict mode: Skipping short word without separators: ${name}`);
    return false;
  }

  // Require at least one hyphen, underscore, or be longer than 4 chars for single words
  // This helps avoid common words like "call", "test", "load" etc.
  if (name.length <= 4 && !name.includes('-') && !name.includes('_')) {
    console.log(`[Dependency Hunter] Skipping common short word: ${name}`);
    return false;
  }

  return true;
}

function isValidPythonPackageName(name) {
  if (!name || typeof name !== 'string') return false;

  // Normalize
  name = name.trim().toLowerCase();

  // Check length - minimum 3 chars to avoid false positives
  if (name.length < 3 || name.length > 100) return false;

  // Ignore built-in modules
  if (PYTHON_BUILTINS.includes(name)) return false;

  // Ignore reserved words
  if (RESERVED_WORDS.includes(name)) {
    console.log(`[Dependency Hunter] Skipping reserved word (Python): ${name}`);
    return false;
  }

  // Ignore CSS/HTML properties
  if (isCssHtmlProperty(name)) {
    console.log(`[Dependency Hunter] Skipping CSS/HTML property (Python): ${name}`);
    return false;
  }

  // Python package names: lowercase, numbers, underscores
  // Cannot start with number
  if (/^\d/.test(name)) return false;

  // Must match Python package pattern
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    return false;
  }

  // Ignore very short names
  if (name.length <= 2) {
    console.log(`[Dependency Hunter] Skipping short Python package: ${name}`);
    return false;
  }

  // Require underscore or be longer than 4 chars
  // This helps avoid common words
  if (name.length <= 4 && !name.includes('_')) {
    console.log(`[Dependency Hunter] Skipping common short word (Python): ${name}`);
    return false;
  }

  return true;
}

// Fetch with timeout helper function
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// Check if package exists in registry
async function checkPackageExists(pkg, sourceUrl, tabId) {
  try {
    // Check if already processed this package
    const packageKey = `${pkg.type}:${pkg.name}`;
    if (checkedPackages.has(packageKey)) {
      return;
    }
    checkedPackages.add(packageKey);

    let exists = false;
    let registryUrl = '';

    if (pkg.type === 'npm') {
      // Use configured npm registry or default
      const npmRegistry = config.npmRegistry || 'https://registry.npmjs.org';
      registryUrl = `${npmRegistry}/${pkg.name}`;

      // Prepare headers
      const headers = {};

      // Add npm authentication if enabled and token is set
      if (config.npmAuthEnabled && config.npmToken) {
        headers['Authorization'] = `Bearer ${config.npmToken}`;
      }

      try {
        const response = await fetchWithTimeout(registryUrl, {
          method: 'HEAD',
          headers: headers
        }, 10000);
        exists = response.status === 200;

        // If unauthorized but we have a token, package might exist in private registry
        if (response.status === 401 && config.npmAuthEnabled) {
          console.log(`[Dependency Hunter] Package ${pkg.name} requires authentication`);
          return; // Skip this package as it's likely private
        }
      } catch (fetchError) {
        console.warn(`[Dependency Hunter] Failed to check npm package ${pkg.name}: ${fetchError.message}`);
        // On network error, assume package exists to avoid false positives
        return;
      }
    } else if (pkg.type === 'pip') {
      registryUrl = `https://pypi.org/pypi/${pkg.name}/json`;

      try {
        const response = await fetchWithTimeout(registryUrl, {
          method: 'HEAD'
        }, 10000);
        exists = response.status === 200;
      } catch (fetchError) {
        console.warn(`[Dependency Hunter] Failed to check pip package ${pkg.name}: ${fetchError.message}`);
        // On network error, assume package exists to avoid false positives
        return;
      }
    }

    if (!exists) {
      // Double-check with GET request to reduce false positives
      const doubleCheck = await verifyPackageDoesNotExist(pkg, registryUrl);

      if (!doubleCheck) {
        console.log(`[Dependency Hunter] Package ${pkg.name} exists after double-check`);
        return;
      }

      // Calculate final confidence score
      let confidence = pkg.confidence || 50;

      // Boost confidence for package.json/lock file sources
      if (sourceUrl.includes('package.json') || sourceUrl.includes('package-lock.json') ||
          sourceUrl.includes('yarn.lock') || sourceUrl.includes('requirements.txt')) {
        confidence = 100;
      }

      // Reduce confidence for generic short names
      if (pkg.name.length < 6 && !pkg.name.includes('-')) {
        confidence = Math.max(30, confidence - 20);
      }

      // Boost confidence for names with hyphens (typical npm pattern)
      if (pkg.name.includes('-') && pkg.name.length > 8) {
        confidence = Math.min(95, confidence + 10);
      }

      // Skip if below minimum confidence threshold
      if (confidence < config.minConfidence) {
        console.log(`[Dependency Hunter] Skipping ${pkg.name} (confidence ${confidence}% < ${config.minConfidence}%)`);
        return;
      }

      // Vulnerability found!
      const finding = {
        id: Date.now() + Math.random(),
        package: pkg.name,
        type: pkg.type,
        source: sourceUrl,
        timestamp: new Date().toISOString(),
        tabId: tabId,
        registryUrl: registryUrl,
        status: 'vulnerable',
        verified: true,
        firstSeen: new Date().toISOString(),
        codeSnippet: pkg.codeSnippet || [],
        matchLine: pkg.matchLine || 0,
        matchedText: pkg.matchedText || '',
        confidence: confidence
      };

      await saveFinding(finding);

      // Add to history if enabled
      if (config.enableHistory) {
        await addToHistory(finding);
      }

      // Send notification
      if (config.notificationsEnabled) {
        await sendNotification(finding);
      }

      // Send to Discord
      if (config.discordWebhook) {
        await sendToDiscord(finding);
      }

      // Update badge
      updateBadge();
    } else {
      console.log(`[Dependency Hunter] Package ${pkg.name} exists in registry`);
    }
  } catch (error) {
    console.error(`[Dependency Hunter] Error checking package ${pkg.name}:`, error);
    // Don't rethrow - continue processing other packages
  }
}

// Double-check package existence with GET request
async function verifyPackageDoesNotExist(pkg, registryUrl) {
  try {
    const headers = {};

    if (pkg.type === 'npm' && config.npmAuthEnabled && config.npmToken) {
      headers['Authorization'] = `Bearer ${config.npmToken}`;
    }

    const response = await fetchWithTimeout(registryUrl, {
      method: 'GET',
      headers: headers
    }, 10000);

    // If 200 or 304, package exists
    if (response.status === 200 || response.status === 304) {
      return false;
    }

    // If 404, package doesn't exist
    if (response.status === 404) {
      return true;
    }

    // For other status codes, try to parse response
    if (response.status === 401 || response.status === 403) {
      // Might be private package, log and skip
      console.log(`[Dependency Hunter] Package ${pkg.name} might be private (${response.status})`);
      return false;
    }

    // Unknown status, assume exists to avoid false positive
    console.warn(`[Dependency Hunter] Unknown status ${response.status} for ${pkg.name}`);
    return false;

  } catch (error) {
    // Network error, assume exists to avoid false positive
    console.warn(`[Dependency Hunter] Verification error for ${pkg.name}:`, error.message);
    return false;
  }
}

// Save finding to storage
async function saveFinding(finding) {
  // Check if already exists (deduplicate)
  const exists = findings.some(f => f.package === finding.package && f.type === finding.type);

  if (!exists) {
    findings.push(finding);
    await chrome.storage.local.set({ findings: findings });
  }
}

// Add finding to history
async function addToHistory(finding) {
  const historyEntry = {
    ...finding,
    sessionId: Date.now(),
    url: finding.source,
    detectedAt: new Date().toISOString()
  };

  history.push(historyEntry);

  // Keep only last 100 entries
  if (history.length > 100) {
    history = history.slice(-100);
  }

  await chrome.storage.local.set({ history: history });
}

// Send notification
async function sendNotification(finding) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Dependency Confusion Found!',
    message: `Package "${finding.package}" (${finding.type}) não existe publicamente!`,
    priority: 2
  });
}

// Send to Discord webhook
async function sendToDiscord(finding) {
  if (!config.discordWebhook) return;

  try {
    const embed = {
      embeds: [{
        title: '🎯 Dependency Confusion Vulnerability',
        color: 0xff0000,
        fields: [
          { name: 'Package', value: finding.package, inline: true },
          { name: 'Type', value: finding.type.toUpperCase(), inline: true },
          { name: 'Status', value: '❌ Not Found', inline: true },
          { name: 'Source', value: finding.source },
          { name: 'Registry Checked', value: finding.registryUrl },
          { name: 'Timestamp', value: finding.timestamp }
        ],
        footer: {
          text: 'Dependency Confusion Hunter by OFJAAAH'
        }
      }]
    };

    await fetch(config.discordWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed)
    });
  } catch (error) {
    console.error('Error sending to Discord:', error);
  }
}

// Update badge with findings count
function updateBadge() {
  const count = findings.length;
  chrome.action.setBadgeText({
    text: count > 0 ? count.toString() : ''
  });
  chrome.action.setBadgeBackgroundColor({
    color: count > 0 ? '#ff0000' : '#00ff00'
  });
}

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getFindings') {
    sendResponse({ findings: findings });
  } else if (request.action === 'getHistory') {
    sendResponse({ history: history });
  } else if (request.action === 'clearFindings') {
    findings = [];
    chrome.storage.local.set({ findings: [] });
    updateBadge();
    sendResponse({ success: true });
  } else if (request.action === 'clearHistory') {
    history = [];
    chrome.storage.local.set({ history: [] });
    sendResponse({ success: true });
  } else if (request.action === 'updateConfig') {
    config = { ...config, ...request.config };
    chrome.storage.local.set({ config: config });
    sendResponse({ success: true });
  } else if (request.action === 'getConfig') {
    sendResponse({ config: config });
  } else if (request.action === 'getStats') {
    sendResponse({
      stats: {
        totalFindings: findings.length,
        totalHistory: history.length,
        urlsProcessed: processedUrls.size,
        packagesChecked: checkedPackages.size
      }
    });
  } else if (request.action === 'exportFinding') {
    sendResponse({
      success: true,
      message: `Para criar o pacote ${request.finding.package}, use:\n` +
               `npm init -y\n` +
               `npm publish`
    });
  }
  return true;
});

// Initialize badge on startup
updateBadge();
