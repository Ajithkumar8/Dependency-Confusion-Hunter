// Popup script for Dependency Confusion Hunter
// Author: OFJAAAH

let allFindings = [];
let filteredFindings = [];
let history = [];
let currentTab = 'findings';

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadFindings();
  loadHistory();
  setupEventListeners();
  setupTabs();
});

// Setup event listeners
function setupEventListeners() {
  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadFindings();
    loadHistory();
  });
  document.getElementById('clearBtn').addEventListener('click', clearFindings);
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
  document.getElementById('searchInput').addEventListener('input', filterFindings);
  document.getElementById('typeFilter').addEventListener('change', filterFindings);
  document.getElementById('confidenceFilter').addEventListener('change', filterFindings);
  document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
  document.getElementById('exportHistoryBtn').addEventListener('click', exportHistory);
}

// Setup tab functionality
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      switchTab(tab);
    });
  });
}

// Switch tabs
function switchTab(tab) {
  currentTab = tab;

  // Update buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    }
  });

  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  if (tab === 'findings') {
    document.getElementById('findingsTab').classList.add('active');
  } else if (tab === 'history') {
    document.getElementById('historyTab').classList.add('active');
    renderHistory();
  }
}

// Load findings from background
async function loadFindings() {
  chrome.runtime.sendMessage({ action: 'getFindings' }, (response) => {
    if (response && response.findings) {
      allFindings = response.findings;
      filteredFindings = allFindings;
      updateStats();
      renderFindings();
    }
  });
}

// Load history from background
async function loadHistory() {
  chrome.runtime.sendMessage({ action: 'getHistory' }, (response) => {
    if (response && response.history) {
      history = response.history;
      updateStats();
    }
  });
}

// Update statistics
function updateStats() {
  document.getElementById('vulnerableCount').textContent = allFindings.length;
  document.getElementById('scannedCount').textContent = new Set(allFindings.map(f => f.source)).size;
  document.getElementById('historyCount').textContent = history.length;
}

// Render findings list
function renderFindings() {
  const container = document.getElementById('findingsList');

  if (filteredFindings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>${allFindings.length === 0 ? 'Nenhuma vulnerabilidade encontrada ainda.' : 'Nenhum resultado para os filtros aplicados.'}</p>
        ${allFindings.length === 0 ? '<p class="help-text">Navegue em sites que usam JavaScript e a extensão irá detectar automaticamente.</p>' : ''}
      </div>
    `;
    return;
  }

  container.innerHTML = filteredFindings.map(finding => `
    <div class="finding-card" data-id="${finding.id}" data-package="${escapeHtml(finding.package)}" data-type="${finding.type}" data-registry="${escapeHtml(finding.registryUrl || '')}">
      <div class="finding-header">
        <span class="package-name">${escapeHtml(finding.package)}</span>
        <span class="package-type type-${finding.type}">${finding.type.toUpperCase()}</span>
        ${finding.confidence !== undefined ? `
        <span class="confidence-badge confidence-${getConfidenceClass(finding.confidence)}" title="Confiança: ${finding.confidence}%">
          ${getConfidenceIcon(finding.confidence)} ${finding.confidence}%
        </span>
        ` : ''}
      </div>
      <div class="finding-details">
        <div class="detail-row">
          <span class="label">Fonte:</span>
          <span class="value" title="${escapeHtml(finding.source)}">${truncateUrl(finding.source)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Encontrado:</span>
          <span class="value">${formatTimestamp(finding.timestamp)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Status:</span>
          <span class="value status-vulnerable">❌ Não existe publicamente</span>
        </div>
        ${finding.matchLine ? `
        <div class="detail-row">
          <span class="label">Linha:</span>
          <span class="value">${finding.matchLine}</span>
        </div>
        ` : ''}
      </div>
      ${finding.codeSnippet && finding.codeSnippet.length > 0 ? `
      <details class="code-details">
        <summary>💻 Ver código onde foi detectado</summary>
        <div class="code-snippet-container">
          <pre class="code-snippet"><code>${renderCodeSnippet(finding.codeSnippet)}</code></pre>
        </div>
      </details>
      ` : ''}
      <div class="finding-actions">
        <button class="btn-action btn-copy-name">📋 Copiar Nome</button>
        <button class="btn-action btn-copy-command">💻 Comando Create</button>
        <button class="btn-action btn-open-registry">🔗 Ver Registry</button>
      </div>
    </div>
  `).join('');

  // Add event listeners for action buttons
  setupFindingActionListeners();
}

// Filter findings
function filterFindings() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const typeFilter = document.getElementById('typeFilter').value;
  const confidenceFilter = parseInt(document.getElementById('confidenceFilter').value) || 0;

  filteredFindings = allFindings.filter(finding => {
    const matchesSearch = finding.package.toLowerCase().includes(searchTerm) ||
                          finding.source.toLowerCase().includes(searchTerm);
    const matchesType = typeFilter === 'all' || finding.type === typeFilter;
    const matchesConfidence = (finding.confidence || 50) >= confidenceFilter;
    return matchesSearch && matchesType && matchesConfidence;
  });

  // Sort by confidence (highest first)
  filteredFindings.sort((a, b) => (b.confidence || 50) - (a.confidence || 50));

  renderFindings();
}

// Setup event listeners for finding action buttons
function setupFindingActionListeners() {
  const container = document.getElementById('findingsList');

  // Event delegation for dynamically created buttons
  container.addEventListener('click', (e) => {
    const button = e.target.closest('.btn-action');
    if (!button) return;

    const card = button.closest('.finding-card');
    if (!card) return;

    const packageName = card.dataset.package;
    const packageType = card.dataset.type;
    const registryUrl = card.dataset.registry;

    if (button.classList.contains('btn-copy-name')) {
      copyPackageName(packageName);
    } else if (button.classList.contains('btn-copy-command')) {
      copyCreateCommand(packageName, packageType);
    } else if (button.classList.contains('btn-open-registry')) {
      openRegistry(registryUrl);
    }
  });
}

// Clear all findings
function clearFindings() {
  if (confirm('Tem certeza que deseja limpar todas as vulnerabilidades encontradas?')) {
    chrome.runtime.sendMessage({ action: 'clearFindings' }, () => {
      allFindings = [];
      filteredFindings = [];
      updateStats();
      renderFindings();
    });
  }
}

// Open settings page
function openSettings() {
  chrome.runtime.openOptionsPage();
}

// Copy package name to clipboard
function copyPackageName(packageName) {
  navigator.clipboard.writeText(packageName).then(() => {
    showNotification('Nome copiado!', 'success');
  }).catch(err => {
    console.error('Failed to copy:', err);
    showNotification('Erro ao copiar', 'error');
  });
}

// Copy create command
function copyCreateCommand(packageName, type) {
  let command = '';
  if (type === 'npm') {
    command = `mkdir ${packageName} && cd ${packageName} && npm init -y && npm publish`;
  } else if (type === 'pip') {
    command = `mkdir ${packageName} && cd ${packageName} && python setup.py sdist && twine upload dist/*`;
  }

  navigator.clipboard.writeText(command).then(() => {
    showNotification('Comando copiado!', 'success');
  }).catch(err => {
    console.error('Failed to copy:', err);
    showNotification('Erro ao copiar', 'error');
  });
}

// Open registry URL
function openRegistry(url) {
  if (url) {
    chrome.tabs.create({ url: url });
  } else {
    showNotification('URL do registry não disponível', 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncateUrl(url, maxLength = 50) {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d atrás`;
}

// Render history
function renderHistory() {
  const container = document.getElementById('historyList');

  if (history.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Nenhum histórico disponível.</p>
        <p class="help-text">O histórico mostra todas as detecções anteriores de pacotes vulneráveis.</p>
      </div>
    `;
    return;
  }

  // Group by package name
  const grouped = {};
  history.forEach(entry => {
    const key = `${entry.package}-${entry.type}`;
    if (!grouped[key]) {
      grouped[key] = {
        package: entry.package,
        type: entry.type,
        count: 0,
        sources: new Set(),
        firstSeen: entry.detectedAt || entry.timestamp,
        lastSeen: entry.detectedAt || entry.timestamp,
        entries: []
      };
    }
    grouped[key].count++;
    grouped[key].sources.add(entry.source || entry.url);
    grouped[key].entries.push(entry);

    // Update last seen
    const entryDate = new Date(entry.detectedAt || entry.timestamp);
    const lastSeenDate = new Date(grouped[key].lastSeen);
    if (entryDate > lastSeenDate) {
      grouped[key].lastSeen = entry.detectedAt || entry.timestamp;
    }
  });

  // Sort by last seen (most recent first)
  const sortedGroups = Object.values(grouped).sort((a, b) => {
    return new Date(b.lastSeen) - new Date(a.lastSeen);
  });

  container.innerHTML = sortedGroups.map(group => `
    <div class="finding-card history-card">
      <div class="finding-header">
        <span class="package-name">${escapeHtml(group.package)}</span>
        <span class="package-type type-${group.type}">${group.type.toUpperCase()}</span>
      </div>
      <div class="finding-details">
        <div class="detail-row">
          <span class="label">Detecções:</span>
          <span class="value">${group.count}x</span>
        </div>
        <div class="detail-row">
          <span class="label">Fontes Únicas:</span>
          <span class="value">${group.sources.size}</span>
        </div>
        <div class="detail-row">
          <span class="label">Primeira vez:</span>
          <span class="value">${formatTimestamp(group.firstSeen)}</span>
        </div>
        <div class="detail-row">
          <span class="label">Última vez:</span>
          <span class="value">${formatTimestamp(group.lastSeen)}</span>
        </div>
      </div>
      <details class="history-details">
        <summary>Ver todas as detecções (${group.count})</summary>
        <div class="history-entries">
          ${group.entries.map(entry => `
            <div class="history-entry">
              <div class="entry-time">${formatTimestamp(entry.detectedAt || entry.timestamp)}</div>
              <div class="entry-source">${truncateUrl(entry.source || entry.url, 40)}</div>
            </div>
          `).join('')}
        </div>
      </details>
    </div>
  `).join('');
}

// Clear history
function clearHistory() {
  if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
    chrome.runtime.sendMessage({ action: 'clearHistory' }, () => {
      history = [];
      updateStats();
      renderHistory();
      showNotification('Histórico limpo!', 'success');
    });
  }
}

// Export history
function exportHistory() {
  if (history.length === 0) {
    showNotification('Nenhum histórico para exportar', 'error');
    return;
  }

  // Create CSV
  const csv = [
    ['Pacote', 'Tipo', 'Data/Hora', 'Fonte', 'Registry'].join(','),
    ...history.map(entry => [
      entry.package,
      entry.type,
      entry.detectedAt || entry.timestamp,
      entry.source || entry.url,
      entry.registryUrl || ''
    ].join(','))
  ].join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dependency-hunter-history-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  showNotification('Histórico exportado!', 'success');
}

// Render code snippet with line numbers and highlighting
function renderCodeSnippet(snippetLines) {
  if (!snippetLines || snippetLines.length === 0) {
    return '<span class="code-empty">Snippet de código não disponível</span>';
  }

  return snippetLines.map(line => {
    const lineClass = line.isMatch ? 'code-line code-line-highlight' : 'code-line';
    const lineNum = String(line.lineNumber).padStart(4, ' ');
    const content = escapeHtml(line.content || '');

    return `<div class="${lineClass}"><span class="line-number">${lineNum}</span><span class="line-content">${content}</span></div>`;
  }).join('');
}

// Get confidence level class for styling
function getConfidenceClass(confidence) {
  if (confidence >= 90) return 'high';
  if (confidence >= 70) return 'medium';
  return 'low';
}

// Get confidence icon
function getConfidenceIcon(confidence) {
  if (confidence >= 90) return '✅';
  if (confidence >= 70) return '⚠️';
  return '❓';
}
