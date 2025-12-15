# 🔐 Autenticação NPM - Guia Completo

**Autor:** OFJAAAH

## 📋 Sobre

A extensão Dependency Confusion Hunter agora suporta autenticação com o npm registry. Isso permite:

- ✅ Verificar pacotes em registros privados
- ✅ Usar tokens de autenticação npm
- ✅ Configurar registros npm customizados
- ✅ Permanecer autenticado durante as verificações

## 🔑 Como Gerar um Token NPM

### Método 1: Criar Token de Acesso (Recomendado)

1. **Login no npm:**

```bash
npm login
```

2. **Criar um token:**

```bash
npm token create
```

3. **Copiar o token gerado:**

```
┌────────────────┬──────────────────────────────────────┐
│ token          │ npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxx     │
├────────────────┼──────────────────────────────────────┤
│ cidr_whitelist │                                      │
├────────────────┼──────────────────────────────────────┤
│ readonly       │ no                                   │
├────────────────┼──────────────────────────────────────┤
│ created        │ 2024-01-15T10:00:00.000Z             │
└────────────────┴──────────────────────────────────────┘
```

4. **Cole o token na extensão** (Configurações → Autenticação NPM)

### Método 2: Token Read-Only (Mais Seguro)

Para criar um token apenas de leitura:

```bash
npm token create --read-only
```

### Método 3: Extrair Token Existente

Se você já está autenticado:

```bash
# Localizar o arquivo .npmrc
cat ~/.npmrc
```

Procure pela linha:

```
//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxx
```

## ⚙️ Configurar na Extensão

### Passo a Passo

1. **Abrir Configurações:**
   - Clique no ícone da extensão
   - Clique em "⚙️ Configurações"

2. **Seção "Autenticação NPM":**

   - **NPM Token:** Cole seu token aqui
     ```
     npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

   - **NPM Registry URL:** (padrão: `https://registry.npmjs.org`)
     - Para npm público: `https://registry.npmjs.org`
     - Para registry privado: `https://npm.suaempresa.com`

   - **Usar autenticação npm:** ✅ Marque esta opção

3. **Salvar Configurações:**
   - Clique em "💾 Salvar Configurações"

## 🏢 Registro Privado (Empresa)

Se sua empresa usa um registro npm privado:

### Configuração

```
NPM Registry URL: https://npm.empresa.internal
NPM Token: seu-token-privado
Usar autenticação npm: ✅
```

### Gerando Token no Registry Privado

Dependendo do seu registry (Nexus, Artifactory, Verdaccio):

**Nexus:**
```bash
npm login --registry=https://nexus.empresa.com/repository/npm-private/
```

**Artifactory:**
```bash
npm login --registry=https://artifactory.empresa.com/artifactory/api/npm/npm-repo/
```

**Verdaccio:**
```bash
npm adduser --registry=https://verdaccio.empresa.com/
```

## 🔒 Segurança do Token

### ⚠️ Avisos Importantes

1. **Nunca compartilhe seu token**
   - Trate como senha
   - Não coloque em repositórios
   - Não envie por email/chat

2. **Use tokens read-only quando possível**
   ```bash
   npm token create --read-only
   ```

3. **Configure expiração**
   ```bash
   npm token create --read-only --cidr=0.0.0.0/0 --expires=30d
   ```

4. **Revogue tokens não utilizados**
   ```bash
   npm token list
   npm token revoke <token-id>
   ```

### 🛡️ Boas Práticas

- ✅ Use tokens read-only para a extensão
- ✅ Configure expiração (ex: 30 dias)
- ✅ Revogue tokens ao desinstalar a extensão
- ✅ Monitore o uso dos tokens
- ✅ Use diferentes tokens para diferentes ferramentas

## 🧪 Testar a Configuração

### Verificação Manual

1. **Verificar se está autenticado:**

```bash
npm whoami --registry=https://registry.npmjs.org
```

2. **Testar acesso a pacote privado:**

```bash
npm view @suaempresa/pacote-privado --registry=https://npm.empresa.com
```

### Verificação na Extensão

1. Navegue para uma página com JavaScript
2. Abra console do DevTools (F12)
3. Procure por logs da extensão
4. Deve ver mensagens de autenticação

```
[Dependency Hunter] Using npm authentication
[Dependency Hunter] Checking package: @empresa/pacote-privado
[Dependency Hunter] Using registry: https://npm.empresa.com
```

## 🔧 Troubleshooting

### Token não funciona

**Problema:** Erro 401 Unauthorized

**Soluções:**

1. Verificar se o token está correto
   ```bash
   npm token list
   ```

2. Testar o token manualmente
   ```bash
   curl -H "Authorization: Bearer npm_xxxxx" https://registry.npmjs.org/-/whoami
   ```

3. Recriar o token
   ```bash
   npm token create --read-only
   ```

### Registry privado não responde

**Problema:** Timeout ou erro de rede

**Soluções:**

1. Verificar se está na VPN (se necessário)
2. Verificar URL do registry
3. Testar conectividade
   ```bash
   curl https://npm.empresa.com
   ```

### CORS errors

**Problema:** Erro de CORS no console

**Solução:**
- Isso é esperado em alguns registros privados
- A extensão tem permissões especiais
- Verifique se `<all_urls>` está ativo no manifest

## 📊 Exemplos de Uso

### Exemplo 1: npm Público com Autenticação

```
Configuração:
- NPM Token: npm_abc123...
- NPM Registry: https://registry.npmjs.org
- Autenticação: ✅ Ativada

Resultado:
- Verifica pacotes públicos
- Pode acessar pacotes scoped privados (@usuario/*)
```

### Exemplo 2: Registro Corporativo

```
Configuração:
- NPM Token: NpmToken.abc-def-ghi
- NPM Registry: https://nexus.empresa.com/repository/npm-group/
- Autenticação: ✅ Ativada

Resultado:
- Verifica pacotes no registro privado
- Detecta pacotes privados que vazaram para público
```

### Exemplo 3: Dual Registry (Público + Privado)

**Limitação:** A extensão verifica apenas UM registry por vez.

**Workaround:**
1. Configure para público (sem auth)
2. Execute varredura
3. Reconfigure para privado (com auth)
4. Execute varredura novamente

## 🎓 Casos de Uso

### Pentest em Empresa

1. Obtenha autorização
2. Configure token do registry interno
3. Navegue nas aplicações
4. Identifique pacotes privados que não deveriam estar no código público

### Bug Bounty

1. Use sem autenticação (registry público)
2. Procure por pacotes que não existem
3. Reporte de forma responsável

### Auditoria de Segurança

1. Configure com token corporativo
2. Verifique se pacotes internos vazaram
3. Documente achados
4. Recomende uso de scoped packages (@empresa/*)

## 📚 Referências

- [npm Token Documentation](https://docs.npmjs.com/about-access-tokens)
- [npm Registry Authentication](https://docs.npmjs.com/cli/v9/using-npm/registry)
- [Creating and Viewing Access Tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens)

## 🔄 Rotação de Tokens

Recomenda-se rotacionar tokens regularmente:

```bash
# Listar tokens
npm token list

# Criar novo token
npm token create --read-only --expires=30d

# Atualizar na extensão
# (Configurações → Autenticação NPM → Novo Token)

# Revogar token antigo
npm token revoke <old-token-id>
```

## ⚡ Dicas Rápidas

```bash
# Ver quem está autenticado
npm whoami

# Ver configuração do registry
npm config get registry

# Listar todos os tokens
npm token list

# Criar token com expiração
npm token create --read-only --expires=90d

# Revogar todos os tokens
npm token revoke --all

# Testar token via curl
curl -H "Authorization: Bearer npm_xxxxx" \
  https://registry.npmjs.org/-/whoami
```

---

**Desenvolvido com ❤️ por OFJAAAH**

**Use de forma ética e responsável! 🔐**
