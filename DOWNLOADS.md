# 📦 Downloads - Dependency Confusion Hunter

**Autor:** OFJAAAH
**Versão:** 1.0.0

---

## 📥 Arquivos Disponíveis

### 1️⃣ Extensão Apenas (Recomendado)

```
📦 dependency-confusion-hunter-v1.0.0.zip
📊 Tamanho: 18KB
```

**Contém:**
- ✅ Extensão Chrome completa
- ✅ Todos os arquivos necessários
- ✅ Ícones
- ✅ Scripts (background, content, popup, options)

**Ideal para:**
- Instalar e usar a extensão
- Deploy em produção
- Usuários finais

**Como usar:**
```bash
# 1. Extrair
unzip dependency-confusion-hunter-v1.0.0.zip -d extension/

# 2. Instalar no Chrome
# chrome://extensions/ → Carregar sem compactação
```

---

### 2️⃣ Pacote Completo (Desenvolvimento)

```
📦 dependency-confusion-hunter-FULL-v1.0.0.zip
📊 Tamanho: 74KB
```

**Contém:**
- ✅ Extensão Chrome completa
- ✅ Laboratório de testes (test-lab/)
- ✅ Documentação completa
- ✅ Scripts de build
- ✅ Exemplos e guias

**Ideal para:**
- Desenvolvimento
- Testes e validação
- Aprendizado
- Contribuidores

**Como usar:**
```bash
# 1. Extrair
unzip dependency-confusion-hunter-FULL-v1.0.0.zip -d full/

# 2. Instalar extensão
# chrome://extensions/ → Carregar sem compactação (pasta raiz)

# 3. Testar no lab
cd full/test-lab/
./start.sh
# Abrir: http://localhost:8080
```

---

## 🔐 Verificação de Integridade

### SHA256 Checksums

```
# Extensão Apenas
d046d5b4f671a639adc419afd8a6ac4906d47dc4bcf3e44e4566c5f7705679ae

# Pacote Completo
b0611134fd7b30ffe2691ca960e6e200d924ce853fd16d396fc3a1c3424b2e3f
```

### Verificar Download

**Linux/Mac:**
```bash
sha256sum dependency-confusion-hunter-v1.0.0.zip
# Compare com o checksum acima
```

**Windows (PowerShell):**
```powershell
Get-FileHash dependency-confusion-hunter-v1.0.0.zip -Algorithm SHA256
```

**Verificação automática:**
```bash
sha256sum -c CHECKSUMS.txt
```

---

## 📋 Conteúdo Detalhado

### Extensão Apenas (18KB)

```
dependency-confusion-hunter-v1.0.0.zip
├── manifest.json          # Configuração da extensão
├── background.js          # Service worker
├── content.js             # Script de análise
├── injected.js            # Script injetado
├── popup.html             # Interface popup
├── popup.js               # Lógica popup
├── options.html           # Página de configurações
├── options.js             # Lógica configurações
├── styles.css             # Estilos
└── icons/                 # Ícones (16px, 48px, 128px)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Pacote Completo (74KB)

```
dependency-confusion-hunter-FULL-v1.0.0.zip
├── [Todos os arquivos da extensão acima]
├── README.md              # Documentação principal
├── INSTALL.md             # Guia de instalação
├── EXAMPLES.md            # Exemplos de uso
├── NPM_AUTH.md            # Guia autenticação npm
├── QUICK_INSTALL.txt      # Instalação rápida
├── CHECKSUMS.txt          # Checksums SHA256
├── build.sh               # Script de build
├── create_icons.py        # Gerador de ícones
├── test.html              # Teste simples
└── test-lab/              # 🧪 Laboratório completo
    ├── README.md          # Guia do lab
    ├── index.html         # Aplicação VulnCorp
    ├── server.py          # Servidor HTTP
    ├── start.sh           # Início rápido
    └── static/
        ├── css/
        │   └── main.css
        └── js/
            ├── vendor.bundle.js
            ├── vendor.bundle.js.map
            ├── app.bundle.js
            ├── app.bundle.js.map
            ├── analytics.js
            ├── analytics.js.map
            ├── auth.js
            └── auth.js.map
```

---

## 🚀 Guia de Instalação Rápida

### Opção 1: Extensão Apenas (Mais Rápido)

```bash
# Download
# [baixar dependency-confusion-hunter-v1.0.0.zip]

# Extrair
unzip dependency-confusion-hunter-v1.0.0.zip -d ~/chrome-extensions/dependency-hunter/

# Instalar
# 1. Chrome → chrome://extensions/
# 2. Ativar "Modo do desenvolvedor"
# 3. "Carregar sem compactação"
# 4. Selecionar: ~/chrome-extensions/dependency-hunter/
```

### Opção 2: Pacote Completo (Com Lab)

```bash
# Download
# [baixar dependency-confusion-hunter-FULL-v1.0.0.zip]

# Extrair
unzip dependency-confusion-hunter-FULL-v1.0.0.zip -d ~/dependency-hunter/

# Instalar extensão
# Chrome → chrome://extensions/
# Carregar: ~/dependency-hunter/ (pasta raiz)

# Testar no lab
cd ~/dependency-hunter/test-lab/
./start.sh
# Abrir: http://localhost:8080
```

---

## 📚 Documentação

Após instalar, leia:

1. **README.md** - Visão geral e funcionalidades
2. **INSTALL.md** - Guia de instalação detalhado
3. **EXAMPLES.md** - Casos de uso práticos
4. **NPM_AUTH.md** - Como usar autenticação npm
5. **test-lab/README.md** - Como usar o laboratório

Ou leia online: [seu-repositório]

---

## 🎯 Qual Versão Escolher?

### Extensão Apenas (18KB) ✅

**Escolha se:**
- ✅ Só quer usar a extensão
- ✅ Já sabe como funciona
- ✅ Não precisa do lab de testes
- ✅ Quer instalação rápida

### Pacote Completo (74KB) ✅

**Escolha se:**
- ✅ Quer testar antes de usar
- ✅ Está aprendendo sobre Dependency Confusion
- ✅ Quer desenvolver/contribuir
- ✅ Precisa da documentação offline
- ✅ Quer o laboratório de testes

---

## 🔄 Atualização

Para atualizar:

```bash
# 1. Fazer backup das configurações (opcional)
# chrome://extensions/ → Dependency Hunter → Detalhes → "Dados da extensão"

# 2. Remover versão antiga
# chrome://extensions/ → Remover

# 3. Instalar nova versão
# Seguir guia de instalação acima

# Configurações são mantidas se usar mesmo diretório
```

---

## 🐛 Problemas no Download?

### ZIP corrompido

```bash
# Verificar integridade
unzip -t dependency-confusion-hunter-v1.0.0.zip

# Se falhar, baixe novamente
```

### Checksum não bate

```bash
# Verificar
sha256sum dependency-confusion-hunter-v1.0.0.zip

# Comparar com:
# d046d5b4f671a639adc419afd8a6ac4906d47dc4bcf3e44e4566c5f7705679ae

# Se diferente, arquivo foi alterado - NÃO INSTALE
```

---

## 📞 Suporte

Problemas com download ou instalação?

1. Verifique checksums
2. Leia QUICK_INSTALL.txt
3. Leia INSTALL.md
4. Entre em contato: OFJAAAH

---

## 📝 Changelog

### v1.0.0 (2024-10-30)

**Adicionado:**
- ✅ Extensão Chrome completa
- ✅ Detecção passiva npm/pip
- ✅ Interface popup
- ✅ Configurações
- ✅ Discord webhook
- ✅ Notificações
- ✅ Autenticação NPM
- ✅ Laboratório de testes
- ✅ Documentação completa

---

## ⚖️ Licença

Esta extensão é fornecida "como está" para fins educacionais e de pesquisa de segurança.

**Use de forma ética e responsável!**

---

## 📊 Estatísticas

| Item | Extensão Apenas | Pacote Completo |
|------|----------------|-----------------|
| Tamanho | 18KB | 74KB |
| Arquivos | 13 | 32 |
| Tempo Install | ~1min | ~2min |
| Documentação | ❌ | ✅ |
| Lab de Testes | ❌ | ✅ |
| Scripts Build | ❌ | ✅ |

---

**Desenvolvido com ❤️ por OFJAAAH**

**Versão:** 1.0.0
**Data:** 2024-10-30

🎯 **Boa caçada!**
