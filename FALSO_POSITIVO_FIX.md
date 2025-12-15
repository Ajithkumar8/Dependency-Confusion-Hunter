# Correção de Falsos Positivos - v1.1.1

## Problema Identificado

A extensão estava gerando muitos falsos positivos ao detectar **módulos internos de código bundled/minificado** (especialmente de sites como Instagram/Facebook) como se fossem pacotes NPM vulneráveis.

### Exemplos de Falsos Positivos:
- ❌ `Lexical*` (LexicalComposerContext, LexicalHTML, LexicalSelection, etc.)
- ❌ `ReactDOM`
- ❌ `FalcoLoggerInternalState`
- ❌ `useLexicalEditable`
- ❌ Outros módulos internos do Meta/Facebook

## Correções Implementadas

### 1. **Detecção de Código Bundled/Minificado**
Adicionada função `isBundledOrMinified()` que identifica automaticamente quando o código fonte é um bundle (webpack, etc.) e **pula completamente a análise** desses arquivos.

**Indicadores detectados:**
- `__webpack_require__`
- `webpackChunk`
- Padrões IIFE de bundles
- Comentários numerados típicos de bundles
- Múltiplas declarações `"use strict"`
- Alta concentração de definições de módulos (ex: `__d("ModuleName", ...)`)

### 2. **Filtros de Prefixos de Módulos Internos**
Lista expandida de prefixos conhecidos de módulos internos:

```javascript
INTERNAL_MODULE_PREFIXES = [
  'lexical',       // Lexical editor framework (Meta)
  'react',         // React internals
  'falco',         // Meta internal logging
  'relay',         // Relay GraphQL framework (Meta)
  'fbjs',          // Facebook JavaScript utilities
  'jest',          // Jest internals
  'scheduler',     // React scheduler
  'workbox',       // Google Workbox
  'webpack',       // Webpack runtime
  'polyfill',      // Polyfills
  'regenerator',   // Babel regenerator
  'core-js',       // Core-js polyfills
  'babel-runtime', // Babel runtime
  'tslib'          // TypeScript lib
]
```

### 3. **Padrões de Módulos Internos (Regex)**
Padrões adicionados para detectar nomes de módulos internos comuns:

```javascript
INTERNAL_MODULE_PATTERNS = [
  /^lexical/i,           // LexicalComposerContext, LexicalHTML, etc.
  /^use[A-Z]/,           // React hooks: useLexicalEditable, useState, etc.
  /internal/i,           // FalcoLoggerInternalState, etc.
  /^falco/i,             // Falco* modules (Meta internal)
  /^fb[A-Z]/,            // FB* modules (Facebook)
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
  /manager$/i            // Manager modules (too generic)
]
```

### 4. **Palavras Reservadas Expandidas**
Adicionadas mais palavras genéricas comuns:

```javascript
'text', 'html', 'selection', 'clipboard', 'dragon', 'history',
'plain', 'editable', 'composer', 'editor', 'dom', 'node', 'element'
```

### 5. **Padrões de Extração Mais Estritos**
Os padrões regex para detectar imports/requires foram refinados para serem mais específicos e evitar capturar variáveis internas:

**Antes:**
```javascript
/require\(['"]([a-z0-9][a-z0-9-_]*)['"]\)/gi
```

**Depois:**
```javascript
/\brequire\s*\(\s*['"]([a-z0-9@][a-z0-9-_/]*)['"]\s*\)/gi
```

Mudanças:
- Adicionado `\b` (word boundary) para evitar falsos positivos em meio de palavras
- Espaços opcionais mais explícitos
- Caminhos com `/` permitidos apenas em contextos específicos

## Resultados dos Testes

Teste executado com 19 casos (15 falsos positivos + 4 pacotes válidos):

```
❌ FILTER | Lexical                             | Internal module prefix: lexical
❌ FILTER | FalcoLoggerInternalState            | Internal module prefix: falco
❌ FILTER | LexicalComposerContext              | Internal module prefix: lexical
❌ FILTER | LexicalHtml                         | Internal module prefix: lexical
❌ FILTER | LexicalSelection                    | Internal module prefix: lexical
❌ FILTER | LexicalUtils                        | Internal module prefix: lexical
❌ FILTER | LexicalText                         | Internal module prefix: lexical
❌ FILTER | LexicalExtension                    | Internal module prefix: lexical
❌ FILTER | LexicalHistory                      | Internal module prefix: lexical
❌ FILTER | LexicalClipboard                    | Internal module prefix: lexical
❌ FILTER | LexicalDragon                       | Internal module prefix: lexical
❌ FILTER | ReactDOM                            | Internal module prefix: react
❌ FILTER | LexicalReactProviderExtension       | Internal module prefix: lexical
❌ FILTER | useLexicalEditable                  | Internal module pattern: /^use[A-Z]/
❌ FILTER | LexicalPlainText                    | Internal module prefix: lexical
✅ PASS | express                             | Valid package name
✅ PASS | lodash                              | Valid package name
✅ PASS | my-custom-package                   | Valid package name
✅ PASS | valid-package-name                  | Valid package name

Summary: 15 packages filtered, 4 packages passed
```

**✅ 100% dos falsos positivos foram corrigidos!**
**✅ 100% dos pacotes válidos passaram!**

## Como Usar a Versão Corrigida

1. **Recarregar a extensão:**
   ```bash
   # Chrome/Edge
   1. Abra chrome://extensions/
   2. Clique em "Recarregar" na extensão

   # Ou reinstale:
   ./build.sh
   ```

2. **Limpar resultados anteriores:**
   - Abra o popup da extensão
   - Clique em "Clear All Findings"
   - Recarregue as páginas que você quer testar

3. **Verificar logs:**
   - Abra DevTools (F12)
   - Vá para a aba "Console"
   - Procure por mensagens `[Dependency Hunter]` para ver o que está sendo filtrado

## Configurações Recomendadas

Para reduzir ainda mais falsos positivos, considere:

1. **Desabilitar pacotes scoped** (se não for testá-los):
   - Configurações → `Show Scoped Packages: OFF`

2. **Ativar modo conservador** (se disponível em versões futuras):
   - Só detectará pacotes em `node_modules` paths explícitos

## Limitações Conhecidas

- Código altamente ofuscado ainda pode gerar alguns falsos positivos
- Pacotes privados com nomes similares a módulos internos podem ser filtrados (ajuste os padrões se necessário)
- Bundles customizados com padrões únicos podem precisar de filtros adicionais

## Contribuindo

Se você encontrar novos padrões de falsos positivos:

1. Identifique o nome do módulo falso
2. Identifique o padrão comum (prefixo, sufixo, formato)
3. Adicione ao array apropriado em `background.js`:
   - `INTERNAL_MODULE_PREFIXES` (para prefixos)
   - `INTERNAL_MODULE_PATTERNS` (para padrões regex)
   - `RESERVED_WORDS` (para palavras específicas)

---

**Versão:** 1.1.1
**Data:** 2025-11-01
**Autor:** OFJAAAH
**Status:** ✅ Testado e Funcionando
