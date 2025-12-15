# 🎯 Dependency Confusion Hunter - Modo Bug Bounty

## Versão: 1.2.0 (Bug Bounty Edition)

Esta extensão foi otimizada para **hunting em programas de bug bounty**, com foco em **ZERO falsos positivos** e **máxima cobertura** de detecção.

---

## 🆕 Novos Recursos

### 1. **Detecção de Manifestos e Lockfiles (100% Confiável)**

A extensão agora detecta automaticamente pacotes de **fontes confiáveis** sem falsos positivos:

#### **NPM/JavaScript:**
- ✅ `package.json` - Todas as dependências (dependencies, devDependencies, peerDependencies, optionalDependencies)
- ✅ `package-lock.json` - Todos os pacotes instalados (incluindo transitivos)
- ✅ `yarn.lock` - Lockfile do Yarn
- ✅ `pnpm-lock.yaml` - Lockfile do pnpm

#### **Python:**
- ✅ `requirements.txt` - Dependências Python
- ✅ `Pipfile` - Pipenv
- ✅ `Pipfile.lock` - Pipenv lockfile

#### **Outros Ecossistemas (preparado para futuro):**
- 📦 `Gemfile` / `Gemfile.lock` (Ruby)
- 📦 `composer.json` / `composer.lock` (PHP)
- 📦 `go.mod` / `go.sum` (Go)
- 📦 `Cargo.toml` / `Cargo.lock` (Rust)

### 2. **Sistema de Confidence Scoring**

Cada detecção agora possui um **nível de confiança**:

| Fonte | Confidence | Descrição |
|-------|------------|-----------|
| `package.json`, lockfiles, `requirements.txt` | **100%** ✅ | Fonte 100% confiável - SEM falsos positivos |
| `node_modules/` paths em código | **90%** ✅ | Muito alta confiança |
| `require()` / `import` statements | **70%** ⚠️ | Alta confiança com filtros aplicados |
| Outros padrões | **50-60%** ❓ | Média - verificar manualmente |

**Visualização no Popup:**
```
┌─────────────────────────────────────┐
│ my-private-package      NPM  ✅ 100% │
│ some-internal-lib       NPM  ⚠️ 70%  │
│ maybe-package           NPM  ❓ 50%  │
└─────────────────────────────────────┘
```

### 3. **Filtros Anti-Falso Positivo Aprimorados**

#### **Prefixos de Módulos Internos Bloqueados:**
```javascript
lexical, react, falco, relay, fbjs, jest, scheduler, workbox,
webpack, polyfill, regenerator, core-js, babel-runtime, tslib
```

#### **Padrões Bloqueados (Regex):**
- `/^lexical/i` - LexicalComposerContext, LexicalHTML, etc.
- `/^use[A-Z]/` - React hooks (useLexicalEditable, useState, etc.)
- `/internal/i` - Módulos internos (*InternalState, etc.)
- `/^falco/i`, `/^fb[A-Z]/`, `/^react[A-Z]/i` - Meta/Facebook internals
- `/state$/i`, `/context$/i`, `/provider$/i`, `/extension$/i` - Sufixos genéricos
- `/utils$/i`, `/helpers$/i`, `/logger$/i`, `/config$/i` - Termos muito genéricos

#### **Detecção de Código Bundled:**
A extensão detecta e **pula automaticamente** arquivos bundled/minificados (a menos que `analyzeBundles` esteja ativado):
- Webpack bundles (`__webpack_require__`, `webpackChunk`)
- Meta/Facebook bundles (`__d("ModuleName", ...)`)
- Código minificado (múltiplos "use strict", IIFEs, etc.)

---

## ⚙️ Configurações Recomendadas para Bug Bounty

Para maximizar a eficácia sem falsos positivos:

### 1. **Ativar Detecção de Pacotes Scoped**
```javascript
// options.html ou popup
showScopedPackages: true ✅
```
Organizações costumam usar pacotes scoped (`@company/internal-lib`) - estes são alvos perfeitos para dependency confusion!

### 2. **Ativar Análise de Manifestos**
```javascript
analyzeManifests: true ✅  // package.json, requirements.txt, etc.
analyzeLockfiles: true ✅  // yarn.lock, package-lock.json, etc.
```

### 3. **Bundles (Opcional)**
```javascript
analyzeBundles: true  // Analisa código bundled (pode gerar alguns falsos positivos)
// OU
analyzeBundles: false // Pula bundles (recomendado para evitar falsos positivos)
```

---

## 🎯 Como Usar para Bug Bounty

### **Passo 1: Preparação**
1. Instale a extensão atualizada
2. Vá em Configurações e ative:
   - ✅ `Show Scoped Packages: ON`
   - ✅ `Analyze Manifests: ON`
   - ✅ `Analyze Lockfiles: ON`
   - ❓ `Analyze Bundles: OFF` (para evitar falsos positivos)

### **Passo 2: Hunting**

#### **A. Sites que Expõem Manifestos (JACKPOT!)** 🎰
Procure por:
- `https://example.com/package.json`
- `https://example.com/yarn.lock`
- `https://example.com/requirements.txt`
- `https://api.example.com/static/package.json`

**Dica:** Muitos sites expõem acidentalmente seus manifestos em:
- `/static/package.json`
- `/assets/package.json`
- `/dist/package.json`
- `/build/package.json`

#### **B. APIs que Retornam Dependências**
Algumas APIs retornam informações de dependências:
```json
{
  "dependencies": {
    "@company/internal-api": "^1.0.0",  ← ALVO!
    "my-private-utils": "2.3.1"         ← ALVO!
  }
}
```

#### **C. Source Maps**
Arquivos `.js.map` frequentemente contêm paths de `node_modules`:
```javascript
{"sources": ["../node_modules/@company/secret-lib/index.js"]} ← ALVO!
```

### **Passo 3: Validação**
Quando encontrar um pacote com **Confidence 100%** ✅:
1. **Verifique novamente** no NPM/PyPI manualmente
2. **Tente criar** o pacote:
   ```bash
   npm init -y
   # Edit package.json com o nome encontrado
   npm publish
   ```
3. **Documente** a vulnerabilidade com:
   - Screenshot da extensão mostrando o pacote
   - Confidence score (100% = evidência sólida!)
   - Fonte onde foi encontrado
   - Prova de que não existe no registry público

---

## 📊 Interpretando os Resultados

### **Exemplo de Resultado:**

```
┌────────────────────────────────────────────────────────────┐
│ 🎯 Dependency Confusion Vulnerability                      │
├────────────────────────────────────────────────────────────┤
│ Package:     @acme-corp/internal-api                       │
│ Type:        NPM                                           │
│ Confidence:  ✅ 100%                                       │
│ Source:      https://example.com/package.json             │
│ Line:        15                                            │
│ Status:      ❌ Not Found in Public Registry              │
│ Registry:    https://registry.npmjs.org/@acme-corp/...    │
│                                                            │
│ Code Snippet:                                              │
│   14 |   "dependencies": {                                │
│ > 15 |     "@acme-corp/internal-api": "^2.1.0",          │
│   16 |     "express": "^4.18.0"                          │
│ └────────────────────────────────────────────────────────────┘
```

**✅ Este é um alvo de ALTA QUALIDADE para relatar!**

### **Comparação com Resultados de Baixa Confiança:**

```
┌────────────────────────────────────────────────────────────┐
│ Package:     LexicalComposerContext                        │
│ Confidence:  ❌ FILTRADO (não aparece)                     │
│ Motivo:      Padrão de módulo interno do Meta (Lexical)   │
└────────────────────────────────────────────────────────────┘
```

---

## 🔍 Técnicas Avançadas

### **1. Crawling Automatizado**
Use scripts para verificar paths comuns:
```bash
#!/bin/bash
DOMAIN="example.com"

for path in package.json yarn.lock requirements.txt; do
  curl -s "https://$DOMAIN/$path" | grep -q "{" && echo "Found: $path"
  curl -s "https://$DOMAIN/static/$path" | grep -q "{" && echo "Found: static/$path"
  curl -s "https://$DOMAIN/dist/$path" | grep -q "{" && echo "Found: dist/$path"
done
```

### **2. Wayback Machine**
Versões antigas do site podem ter exposto manifestos:
```
https://web.archive.org/web/*/example.com/package.json
```

### **3. GitHub/GitLab Leaks**
Procure por repositórios vazados com:
```
site:github.com "@company-name" package.json
site:github.com "example.com" requirements.txt
```

### **4. JavaScript Bundle Analysis**
Mesmo com filtros, você pode manualmente buscar em bundles:
1. Abra o DevTools
2. Vá para Sources → Page
3. Procure por strings como:
   - `"@company/`
   - `require("my-internal-`
   - `/node_modules/@private/`

---

## 📈 Estatísticas e Métricas

A extensão rastreia:
- **Total de Findings:** Vulnerabilidades únicas encontradas
- **URLs Escaneadas:** Arquivos JavaScript/manifestos analisados
- **Packages Verificados:** Total de pacotes checados no registry
- **Histórico:** Todas as detecções anteriores

---

## 🛡️ Considerações Éticas

### ⚠️ **IMPORTANTE - Bug Bounty Ethics:**

1. **✅ PERMITIDO:**
   - Detectar pacotes vulneráveis em programas de bug bounty autorizados
   - Verificar se pacotes existem em registries públicos
   - Criar pacotes de PoC **inofensivos** (apenas log/beacon)

2. **❌ PROIBIDO:**
   - Publicar pacotes maliciosos
   - Exfiltrar dados sensíveis
   - Afetar usuários reais
   - Testar em alvos não autorizados

3. **📝 Divulgação Responsável:**
   - Relate imediatamente ao programa de bug bounty
   - NÃO publique o pacote até autorização
   - Documente TUDO (prints, logs, timestamps)
   - Aguarde resposta antes de disclosure público

---

## 🆘 Troubleshooting

### **Problema: Muitos Falsos Positivos**
**Solução:**
1. Desative `analyzeBundles`
2. Verifique se os filtros estão atualizados
3. Foque em resultados com Confidence ≥ 90%

### **Problema: Não Detecta Nada**
**Solução:**
1. Verifique se `analyzeManifests` está ativo
2. Tente acessar diretamente `/package.json`, `/yarn.lock`
3. Verifique o console do DevTools para ver logs da extensão

### **Problema: Package.json Não é Detectado**
**Solução:**
1. Verifique se a URL termina exatamente com `package.json`
2. Confira se o Content-Type é `application/json` ou `text/plain`
3. Teste abrindo a URL diretamente no navegador

---

## 📚 Recursos Adicionais

### **Referências sobre Dependency Confusion:**
- [Alex Birsan's Original Article](https://medium.com/@alex.birsan/dependency-confusion-4a5d60fec610)
- [OWASP Dependency Confusion](https://owasp.org/www-community/attacks/Dependency_Confusion)
- [Snyk's Dependency Confusion Guide](https://snyk.io/blog/detect-prevent-dependency-confusion-attacks/)

### **Ferramentas Complementares:**
- **`confused`**: CLI tool para detectar dependency confusion
- **`npm-audit`**: Auditoria de dependências NPM
- **`safety`**: Scanner de dependências Python

---

## 🏆 Hall of Fame (Exemplo)

### **Submissions Exitosas usando esta extensão:**

| Empresa | Tipo | Confidence | Bounty |
|---------|------|------------|--------|
| Example Corp | NPM (@example/internal-api) | 100% | $5,000 |
| ACME Inc | NPM (acme-utils-private) | 100% | $2,500 |
| Tech Startup | Python (mycompany-lib) | 100% | $1,000 |

*(Nota: Estes são exemplos fictícios)*

---

## 📞 Suporte e Feedback

**Encontrou um bug?** Abra uma issue no GitHub!
**Tem sugestões?** Pull requests são bem-vindos!
**Encontrou uma vulnerabilidade real?** Parabéns! 🎉

---

**Version:** 1.2.0 (Bug Bounty Edition)
**Author:** OFJAAAH
**License:** MIT
**Last Updated:** 2025-11-01

**⚡ Happy Hunting! ⚡**
