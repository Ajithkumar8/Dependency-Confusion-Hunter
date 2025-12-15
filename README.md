<div align="center">

# 🎯 Dependency Confusion Hunter

<img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Extension">
<img src="https://img.shields.io/badge/Manifest-V3-green?style=for-the-badge" alt="Manifest V3">
<img src="https://img.shields.io/badge/Version-1.2.0-blue?style=for-the-badge" alt="Version">
<img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">

### 🔍 Passive Scanner for Dependency Confusion Vulnerabilities

<p>
<img src="https://img.shields.io/badge/NPM-Registry_Check-CB3837?style=flat-square&logo=npm">
<img src="https://img.shields.io/badge/PyPI-Registry_Check-3775A9?style=flat-square&logo=pypi">
<img src="https://img.shields.io/badge/Discord-Webhook_Support-5865F2?style=flat-square&logo=discord">
</p>

[![Twitter](https://img.shields.io/badge/Twitter-@ofjaaah-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/ofjaaah)
[![YouTube](https://img.shields.io/badge/YouTube-OFJAAAH-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/c/OFJAAAH)

---

**Automatically detect packages vulnerable to Dependency Confusion attacks while browsing**

</div>

---

## 📋 About

**Dependency Confusion Hunter** is a Chrome extension that passively monitors web pages for packages that may be vulnerable to Dependency Confusion attacks. It analyzes JavaScript files and source maps to identify internal/private dependencies that don't exist in public registries (npm, PyPI).

### 🎯 What is Dependency Confusion?

Dependency Confusion is a supply chain attack where an attacker publishes a malicious package to a public registry with the same name as an internal/private package. If the package manager isn't configured correctly, it may download the malicious public package instead of the private one.

```javascript
// Example: Internal package that doesn't exist on npm
import { auth } from 'company-internal-auth';  // ⚠️ Vulnerable!

// An attacker can publish 'company-internal-auth' to npm
// and compromise systems that try to install it
```

---

## ⚡ Features

<table>
<tr>
<td>

### 🔍 Detection
- ✅ Passive monitoring (no interference)
- ✅ JavaScript file analysis
- ✅ Source map (.map) parsing
- ✅ NPM & PyPI registry checks
- ✅ Scoped packages support (@scope/pkg)

</td>
<td>

### 🛠️ Tools
- 📊 Real-time dashboard
- 🔔 Browser notifications
- 💬 Discord webhook alerts
- 🌐 Proxy support (Burp Suite)
- 📝 One-click command export

</td>
</tr>
</table>

---

## 🚀 Installation

### Method 1: Load Unpacked (Developer Mode)

```bash
# 1. Clone this repository
git clone https://github.com/KingOfBugbounty/Dependency-Confusion-Hunter.git

# 2. Open Chrome and go to
chrome://extensions/

# 3. Enable "Developer mode" (top right)

# 4. Click "Load unpacked"

# 5. Select the cloned folder
```

### Method 2: Generate Icons (if missing)

```bash
python3 create_icons.py
```

---

## 🔧 Configuration

### Discord Webhook (Optional)

Receive instant alerts on Discord:

1. Go to your Discord channel → Settings → Integrations → Webhooks
2. Create a new webhook
3. Copy the webhook URL
4. Paste in extension settings

### Proxy Support (Optional)

Route traffic through Burp Suite or corporate proxy:

```
http://127.0.0.1:8080
```

---

## 📖 How to Use

```
1️⃣  Install the extension
         ↓
2️⃣  Browse websites normally
         ↓
3️⃣  Extension analyzes JS files passively
         ↓
4️⃣  Get alerts for vulnerable packages
         ↓
5️⃣  Click extension icon to see results
```

---

## 🎯 Detection Patterns

### NPM Packages

```javascript
// All these patterns are detected:
require('package-name')
import x from 'package-name'
import('package-name')
import { x } from '@scope/package'
// References in node_modules/
```

### Python Packages

```python
# These patterns are detected:
import package_name
from package_name import x
pip install package-name
```

---

## 📊 Dashboard

<table>
<tr>
<td align="center"><b>📈 Statistics</b></td>
<td align="center"><b>📋 Vulnerability List</b></td>
<td align="center"><b>⚙️ Actions</b></td>
</tr>
<tr>
<td>• Total packages found<br>• Files analyzed<br>• Vulnerabilities count</td>
<td>• Package name<br>• Registry type (npm/pip)<br>• Source URL</td>
<td>• Copy package name<br>• Copy npm publish cmd<br>• Open registry</td>
</tr>
</table>

---

## 🛡️ Security & Ethics

### ✅ Intended Use

- Authorized penetration testing
- Bug bounty programs
- Security research
- Educational purposes
- CTF competitions

### ❌ DO NOT Use For

- Unauthorized exploitation
- Publishing malicious packages
- Supply chain attacks
- Compromising systems without permission

---

## 📁 Project Structure

```
Dependency-Confusion-Hunter/
├── manifest.json       # Extension configuration
├── background.js       # Service worker (main logic)
├── content.js          # Page content analyzer
├── injected.js         # Injected script context
├── popup.html/js       # Extension popup UI
├── options.html/js     # Settings page
├── styles.css          # Styles
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── create_icons.py     # Icon generator script
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No detections | Check if site has JavaScript files |
| No notifications | Check Chrome notification permissions |
| Discord not working | Verify webhook URL is correct |
| Extension not loading | Ensure Manifest V3 is supported |

---

## 📚 References

- [Alex Birsan - Dependency Confusion](https://medium.com/@alex.birsan/dependency-confusion-4a5d60fec610)
- [NPM Registry API](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md)
- [PyPI JSON API](https://warehouse.pypa.io/api-reference/json.html)

---

<div align="center">

## 🙏 Credits

**Developed by OFJAAAH**

[![Twitter](https://img.shields.io/badge/Follow-@ofjaaah-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/ofjaaah)
[![GitHub](https://img.shields.io/badge/GitHub-KingOfBugbounty-181717?style=flat-square&logo=github)](https://github.com/KingOfBugbounty)

---

<img src="https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
<img src="https://img.shields.io/badge/Made%20for-Bug%20Bounty-red?style=for-the-badge&logo=hackerone">

**⚠️ For authorized security testing only. Always obtain proper permission.**

</div>
