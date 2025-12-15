# 🎯 Exemplos de Uso - Dependency Confusion Hunter

**Autor:** OFJAAAH

## 📚 Índice

1. [Cenários de Teste](#cenários-de-teste)
2. [Exemplos de Vulnerabilidades](#exemplos-de-vulnerabilidades)
3. [Fluxo de Trabalho](#fluxo-de-trabalho)
4. [Casos de Uso Reais](#casos-de-uso-reais)
5. [Mitigações](#mitigações)

---

## 🧪 Cenários de Teste

### Cenário 1: Aplicação Web Corporativa

**Contexto:** Você foi contratado para fazer pentest em uma aplicação web de uma empresa.

**Passos:**

1. Obtenha autorização por escrito
2. Instale a extensão
3. Configure o Discord webhook para receber alertas
4. Navegue pela aplicação alvo
5. Deixe a extensão trabalhar em segundo plano
6. Analise os resultados

**Resultado Esperado:**

```
🎯 Vulnerabilidade Encontrada!

Pacote: acme-corp-internal-api
Tipo: NPM
Status: ❌ Não existe no npm
Fonte: https://app.acmecorp.com/static/js/main.abc123.js

Risco: ALTO
- Pacote privado exposto
- Possível ataque de supply chain
- 47 dependências afetadas
```

### Cenário 2: Análise de Source Maps

**Contexto:** Site expõe source maps que revelam estrutura interna.

**Exemplo de Source Map:**

```javascript
// app.js.map
{
  "sources": [
    "node_modules/company-private-auth/index.js",
    "node_modules/internal-api-client/src/main.js",
    "node_modules/@acme/secret-crypto/lib/crypto.js"
  ]
}
```

**Detecção:**

A extensão irá:
1. ✅ Detectar o arquivo `.map`
2. ✅ Extrair os nomes dos pacotes
3. ✅ Verificar se existem no npm
4. ✅ Alertar sobre pacotes não encontrados

### Cenário 3: Webpack Bundles

**Contexto:** Aplicação usa webpack e expõe informações de módulos.

**Código Detectado:**

```javascript
// webpack bundle
(window["webpackJsonp"] = window["webpackJsonp"] || []).push([
  [0], {
    "./node_modules/company-utils/index.js": function(module, exports) {
      // código interno
    }
  }
]);
```

**Alertas:**

```
📦 Pacotes Encontrados:
- company-utils (NPM) - ❌ Não existe
- Fonte: bundle.js linha 1234
```

---

## 🔍 Exemplos de Vulnerabilidades

### Vulnerabilidade 1: Pacote Privado Exposto

**Descrição:** Empresa usa pacotes npm privados mas não configurou corretamente o scope.

**Código Vulnerável:**

```javascript
// package.json exposto
{
  "dependencies": {
    "company-auth": "^1.0.0",  // ❌ Deveria ser @company/auth
    "internal-logger": "^2.1.0" // ❌ Deveria estar em registry privado
  }
}
```

**Impacto:**

- Atacante pode criar `company-auth` no npm público
- Desenvolvedores podem instalar a versão maliciosa
- Comprometimento da supply chain

**Mitigação:**

```javascript
// Correto ✅
{
  "dependencies": {
    "@company/auth": "^1.0.0"  // Scoped package
  }
}
```

### Vulnerabilidade 2: Import Dinâmico

**Código Vulnerável:**

```javascript
// Carrega módulo baseado em configuração
const moduleName = config.dataProcessor; // "acme-data-processor"
const processor = await import(moduleName);
```

**Detecção:**

A extensão encontrará `acme-data-processor` e verificará se existe.

**Exploração Potencial:**

1. Atacante cria `acme-data-processor` no npm
2. Adiciona código malicioso
3. Aplicação baixa pacote malicioso

### Vulnerabilidade 3: Typosquatting + Confusion

**Cenário:**

```javascript
// Desenvolvedor erra o nome
import auth from 'company-autth'; // typo: autth em vez de auth
```

**Duplo Risco:**

1. Typo permite typosquatting
2. Pacote não existe = confusion attack

---

## 🔄 Fluxo de Trabalho

### Workflow Completo

```
┌─────────────────────────────────────────┐
│ 1. Reconhecimento                       │
│ - Identificar alvos autorizados         │
│ - Obter permissões                      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Configuração                         │
│ - Instalar extensão                     │
│ - Configurar Discord webhook            │
│ - Preparar relatório                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Coleta                               │
│ - Navegar na aplicação                  │
│ - Extensão coleta pacotes               │
│ - Verificação automática                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. Análise                              │
│ - Revisar alertas                       │
│ - Classificar por severidade            │
│ - Validar falsos positivos              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. Validação                            │
│ - Confirmar que pacotes não existem     │
│ - Verificar em múltiplos registros      │
│ - Documentar evidências                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 6. Relatório                            │
│ - Criar relatório de vulnerabilidades  │
│ - Incluir capturas de tela              │
│ - Sugerir mitigações                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 7. Disclosure Responsável               │
│ - Notificar empresa                     │
│ - Dar prazo para correção               │
│ - Não publicar pacotes maliciosos       │
└─────────────────────────────────────────┘
```

---

## 🌐 Casos de Uso Reais

### Caso 1: Alex Birsan - Pesquisador Original

**Contexto:** Alex Birsan descobriu a vulnerabilidade em 2021.

**Método:**
1. Analisou código open-source de empresas
2. Identificou pacotes privados referenciados
3. Criou versões benignas com telemetria
4. Publicou no npm/PyPI

**Resultado:**
- Mais de 35 empresas afetadas
- Incluindo Apple, Microsoft, Tesla
- Bug bounties de $130,000+

**Referência:** [Medium Article](https://medium.com/@alex.birsan/dependency-confusion-4a5d60fec610)

### Caso 2: Análise de GitHub Repositories

**Método:**

```bash
# Procurar por package.json em repos públicos
git clone https://github.com/company/public-repo
cd public-repo
find . -name "package.json" -exec cat {} \;
```

**Achados Comuns:**

```json
{
  "dependencies": {
    "company-internal-lib": "1.0.0",  // ❌ Vulnerável
    "@company/public-lib": "2.0.0"    // ✅ OK (scoped)
  }
}
```

### Caso 3: Source Maps em Produção

**Descoberta:**

```
https://app.example.com/static/js/main.js.map
```

**Conteúdo:**

```json
{
  "sources": [
    "../../../packages/company-core/src/index.ts",
    "../../../packages/company-auth/src/auth.ts",
    "../../node_modules/secret-internal-pkg/index.js"
  ]
}
```

**Extração:**

A extensão detecta automaticamente e extrai `secret-internal-pkg`.

---

## 🛡️ Mitigações

### Para Desenvolvedores

#### 1. Use Scoped Packages

```javascript
// ❌ Vulnerável
"dependencies": {
  "company-utils": "^1.0.0"
}

// ✅ Seguro
"dependencies": {
  "@company/utils": "^1.0.0"
}
```

#### 2. Configure Registry Privado

**npm (.npmrc):**

```ini
# Sempre usar registry privado para pacotes @company
@company:registry=https://npm.company.internal
```

**Python (pip.conf):**

```ini
[global]
index-url = https://pypi.company.internal
```

#### 3. Desabilite Source Maps em Produção

**Webpack:**

```javascript
module.exports = {
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map'
};
```

#### 4. Use .npmignore

```
# .npmignore
*.map
src/
tests/
.env
```

#### 5. Valide Checksums

**package-lock.json:**

```json
{
  "dependencies": {
    "@company/utils": {
      "version": "1.0.0",
      "resolved": "https://npm.company.internal/@company/utils/-/utils-1.0.0.tgz",
      "integrity": "sha512-abc123..." // ✅ Validar isso
    }
  }
}
```

### Para Empresas

#### 1. Auditoria de Dependências

```bash
# Auditar todos os projetos
find . -name "package.json" -exec npm audit {} \;
```

#### 2. Policy de Nomenclatura

- ✅ Sempre usar scope da empresa: `@company/`
- ✅ Registry privado para tudo interno
- ✅ Nunca usar nomes genéricos

#### 3. CI/CD Checks

```yaml
# .github/workflows/security.yml
- name: Check for private packages
  run: |
    # Verificar se não há pacotes sem scope
    if grep -r '"[a-z-]*":' package.json; then
      echo "Found unscoped package!"
      exit 1
    fi
```

#### 4. Treinamento

- Educar desenvolvedores sobre o risco
- Code review para package.json
- Alertas automáticos

---

## 📊 Template de Relatório

### Relatório de Vulnerabilidade

```markdown
# Relatório: Dependency Confusion

**Data:** 2024-01-15
**Testador:** OFJAAAH
**Alvo:** app.example.com
**Autorização:** Documento #12345

## Sumário Executivo

Foram identificados 5 pacotes privados que não existem em registros públicos,
representando risco de ataque de supply chain.

## Vulnerabilidades Encontradas

### #1 - company-internal-api (CRÍTICO)

**Descrição:** Pacote privado exposto em código JavaScript

**Localização:**
- URL: https://app.example.com/static/js/main.js
- Linha: 1234

**Evidência:**
```javascript
import api from 'company-internal-api';
```

**Verificação:**
- NPM Registry: ❌ Não existe
- PyPI: N/A

**Impacto:**
- Atacante pode criar pacote malicioso
- 100% dos usuários afetados
- Acesso a API interna

**Recomendação:**
- Usar @company/internal-api
- Configurar registry privado
- Remover source maps de produção

## Próximos Passos

1. Corrigir nomenclatura de pacotes
2. Implementar registry privado
3. Re-testar em 30 dias
```

---

## 🎓 Exercícios Práticos

### Exercício 1: Identificação

Abra o arquivo `test.html` e identifique quantos pacotes vulneráveis existem.

**Resposta:** 4 pacotes npm + 3 Python = 7 total

### Exercício 2: Análise

Analise o seguinte código:

```javascript
const packages = [
  'lodash',           // ✅ Existe
  'company-utils',    // ❓
  '@babel/core',      // ✅ Existe
  'internal-crypto'   // ❓
];
```

**Tarefa:** Use a extensão para verificar quais não existem.

### Exercício 3: Mitigação

Reescreva o código vulnerável de forma segura:

```javascript
// Vulnerável
import auth from 'company-auth';

// Seguro
import auth from '???';  // Complete você
```

**Resposta:** `@company/auth`

---

## 📚 Recursos Adicionais

### Artigos e Papers

- [Original Research - Alex Birsan](https://medium.com/@alex.birsan/dependency-confusion-4a5d60fec610)
- [OWASP - Supply Chain Attacks](https://owasp.org/www-community/attacks/Supply_Chain_Attack)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

### Ferramentas

- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [Dependabot](https://github.com/dependabot)

### Videos

- [Dependency Confusion Explained](https://www.youtube.com/results?search_query=dependency+confusion)
- [Supply Chain Security](https://www.youtube.com/results?search_query=supply+chain+security)

---

**Autor:** OFJAAAH
**Versão:** 1.0.0
**Licença:** Educational/Research

**⚠️ Use de forma ética e responsável!**
