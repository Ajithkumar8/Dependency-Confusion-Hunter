// Options page script for Dependency Confusion Hunter
// Author: OFJAAAH

const defaultConfig = {
  discordWebhook: '',
  proxyUrl: '',
  autoCheck: true,
  notificationsEnabled: true,
  npmToken: '',
  npmRegistry: 'https://registry.npmjs.org',
  npmAuthEnabled: false,
  showScopedPackages: false,
  enableHistory: true,
  strictMode: true,
  minConfidence: 70,
  ignoreKnownDomains: true,
  customIgnoredDomains: []
};

// Load settings on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('resetBtn').addEventListener('click', resetSettings);
}

// Load settings from storage
function loadSettings() {
  chrome.runtime.sendMessage({ action: 'getConfig' }, (response) => {
    if (response && response.config) {
      const config = response.config;
      document.getElementById('discordWebhook').value = config.discordWebhook || '';
      document.getElementById('proxyUrl').value = config.proxyUrl || '';
      document.getElementById('autoCheck').checked = config.autoCheck !== false;
      document.getElementById('notificationsEnabled').checked = config.notificationsEnabled !== false;
      document.getElementById('npmToken').value = config.npmToken || '';
      document.getElementById('npmRegistry').value = config.npmRegistry || 'https://registry.npmjs.org';
      document.getElementById('npmAuthEnabled').checked = config.npmAuthEnabled === true;
      document.getElementById('showScopedPackages').checked = config.showScopedPackages === true;
      document.getElementById('enableHistory').checked = config.enableHistory !== false;
      document.getElementById('strictMode').checked = config.strictMode !== false;
      document.getElementById('minConfidence').value = config.minConfidence || 70;
      document.getElementById('ignoreKnownDomains').checked = config.ignoreKnownDomains !== false;
      document.getElementById('customIgnoredDomains').value = (config.customIgnoredDomains || []).join(', ');
    }
  });
}

// Save settings to storage
function saveSettings() {
  // Parse custom ignored domains
  const customDomainsStr = document.getElementById('customIgnoredDomains').value.trim();
  const customDomains = customDomainsStr
    ? customDomainsStr.split(',').map(d => d.trim().toLowerCase()).filter(d => d)
    : [];

  const config = {
    discordWebhook: document.getElementById('discordWebhook').value.trim(),
    proxyUrl: document.getElementById('proxyUrl').value.trim(),
    autoCheck: document.getElementById('autoCheck').checked,
    notificationsEnabled: document.getElementById('notificationsEnabled').checked,
    npmToken: document.getElementById('npmToken').value.trim(),
    npmRegistry: document.getElementById('npmRegistry').value.trim() || 'https://registry.npmjs.org',
    npmAuthEnabled: document.getElementById('npmAuthEnabled').checked,
    showScopedPackages: document.getElementById('showScopedPackages').checked,
    enableHistory: document.getElementById('enableHistory').checked,
    strictMode: document.getElementById('strictMode').checked,
    minConfidence: parseInt(document.getElementById('minConfidence').value) || 70,
    ignoreKnownDomains: document.getElementById('ignoreKnownDomains').checked,
    customIgnoredDomains: customDomains
  };

  // Validate Discord webhook URL
  if (config.discordWebhook && !isValidDiscordWebhook(config.discordWebhook)) {
    showAlert('URL do Discord Webhook inválida. Verifique e tente novamente.', 'error');
    return;
  }

  // Validate proxy URL
  if (config.proxyUrl && !isValidUrl(config.proxyUrl)) {
    showAlert('URL do Proxy inválida. Verifique e tente novamente.', 'error');
    return;
  }

  // Save to storage
  chrome.runtime.sendMessage({ action: 'updateConfig', config: config }, (response) => {
    if (response && response.success) {
      showAlert('Configurações salvas com sucesso!', 'success');
    } else {
      showAlert('Erro ao salvar configurações.', 'error');
    }
  });
}

// Reset settings to defaults
function resetSettings() {
  if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
    document.getElementById('discordWebhook').value = defaultConfig.discordWebhook;
    document.getElementById('proxyUrl').value = defaultConfig.proxyUrl;
    document.getElementById('autoCheck').checked = defaultConfig.autoCheck;
    document.getElementById('notificationsEnabled').checked = defaultConfig.notificationsEnabled;
    document.getElementById('npmToken').value = defaultConfig.npmToken;
    document.getElementById('npmRegistry').value = defaultConfig.npmRegistry;
    document.getElementById('npmAuthEnabled').checked = defaultConfig.npmAuthEnabled;
    document.getElementById('showScopedPackages').checked = defaultConfig.showScopedPackages;
    document.getElementById('enableHistory').checked = defaultConfig.enableHistory;
    document.getElementById('strictMode').checked = defaultConfig.strictMode;
    document.getElementById('minConfidence').value = defaultConfig.minConfidence;
    document.getElementById('ignoreKnownDomains').checked = defaultConfig.ignoreKnownDomains;
    document.getElementById('customIgnoredDomains').value = '';

    chrome.runtime.sendMessage({ action: 'updateConfig', config: defaultConfig }, (response) => {
      if (response && response.success) {
        showAlert('Configurações restauradas para o padrão!', 'success');
      }
    });
  }
}

// Show alert message
function showAlert(message, type = 'success') {
  const alertElement = document.getElementById('alert');
  alertElement.textContent = message;
  alertElement.className = `alert alert-${type} show`;

  setTimeout(() => {
    alertElement.classList.remove('show');
  }, 3000);
}

// Validate Discord webhook URL
function isValidDiscordWebhook(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'discord.com' || urlObj.hostname === 'discordapp.com';
  } catch {
    return false;
  }
}

// Validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
