# 📦 Guia de Instalação - Dependency Confusion Hunter

**Autor:** OFJAAAH

## 🚀 Instalação Rápida

### Pré-requisitos

- Google Chrome ou Chromium
- Python 3 (para gerar ícones, se necessário)

### Passo a Passo

#### 1. Preparar os Arquivos

```bash
cd /root/PENTEST/confussedExtension
```

#### 2. Verificar Ícones

Os ícones já devem estar criados. Caso contrário:

```bash
python3 create_icons.py
```

Isso criará os ícones nas seguintes dimensões:
- `icons/icon16.png`
- `icons/icon48.png`
- `icons/icon128.png`

#### 3. Carregar a Extensão no Chrome

1. Abra o Chrome e navegue para:
   ```
   chrome://extensions/
   ```

2. Ative o **"Modo do desenvolvedor"** no canto superior direito

3. Clique em **"Carregar sem compactação"** (ou "Load unpacked")

4. Selecione a pasta: `/root/PENTEST/confussedExtension`

5. A extensão será carregada e aparecerá na lista

#### 4. Verificar Instalação

- O ícone da extensão deve aparecer na barra de ferramentas
- Clique no ícone para abrir o popup
- Você deve ver a interface principal

## ⚙️ Configuração Inicial

### Configurar Discord Webhook (Opcional)

1. Clique no ícone da extensão
2. Clique em **"⚙️ Configurações"**
3. Na seção "Notificações":
   - Cole sua URL do Discord Webhook
   - Exemplo: `https://discord.com/api/webhooks/123456789/abcdefg`

### Criar Webhook no Discord

1. Acesse seu servidor Discord
2. Vá em: **Configurações do Canal** → **Integrações** → **Webhooks**
3. Clique em **"Criar Webhook"**
4. Copie a URL do webhook
5. Cole na extensão

### Configurar Proxy (Opcional)

Se você estiver em uma rede corporativa ou usar ferramentas como Burp Suite:

1. Vá em **"⚙️ Configurações"**
2. Na seção "Proxy":
   - Digite: `http://proxy.example.com:8080`
   - Ou para Burp: `http://127.0.0.1:8080`

**Nota:** A configuração de proxy na extensão é apenas informativa. O proxy do sistema deve ser configurado no Chrome:
- `chrome://settings/` → Avançado → Sistema → Abrir configurações de proxy

## 🧪 Testar a Extensão

### Teste Manual

1. Abra o arquivo de teste:
   ```bash
   # Sirva o arquivo via HTTP
   cd /root/PENTEST/confussedExtension
   python3 -m http.server 8000
   ```

2. No Chrome, navegue para:
   ```
   http://localhost:8000/test.html
   ```

3. Aguarde alguns segundos

4. Clique no ícone da extensão

5. Você deve ver pacotes detectados na lista

### Teste em Sites Reais

Navegue em sites que usam JavaScript:
- GitHub
- Twitter/X
- Aplicações web da sua empresa (com autorização)

A extensão detectará automaticamente pacotes nos arquivos JavaScript.

## 🔍 Verificar Funcionamento

### Indicadores de que está funcionando:

1. **Badge no ícone**: Mostra o número de vulnerabilidades encontradas
2. **Notificações**: Alertas aparecem quando pacotes são detectados
3. **Console do navegador**: Mensagens de log da extensão
4. **Discord**: Mensagens enviadas para o webhook configurado

### Debug

Para ver logs detalhados:

1. Vá em `chrome://extensions/`
2. Encontre "Dependency Confusion Hunter"
3. Clique em **"Detalhes"**
4. Clique em **"Ver no console"** (background page)
5. Ou clique com botão direito no ícone → **"Inspecionar popup"**

## 📊 Estrutura de Arquivos

```
confussedExtension/
├── manifest.json          # ✅ Configuração da extensão
├── background.js          # ✅ Service worker
├── content.js            # ✅ Script de conteúdo
├── injected.js           # ✅ Script injetado
├── popup.html            # ✅ Interface popup
├── popup.js              # ✅ Lógica popup
├── options.html          # ✅ Página de configurações
├── options.js            # ✅ Lógica configurações
├── styles.css            # ✅ Estilos
├── icons/                # ✅ Ícones
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── test.html             # 🧪 Página de teste
├── create_icons.py       # 🛠️ Gerador de ícones
├── README.md             # 📖 Documentação
└── INSTALL.md            # 📦 Este arquivo
```

## 🐛 Solução de Problemas

### Extensão não carrega

**Problema:** Erro ao carregar a extensão

**Solução:**
1. Verifique se todos os arquivos estão presentes
2. Verifique se os ícones existem na pasta `icons/`
3. Verifique o console de erros em `chrome://extensions/`

### Nenhum pacote detectado

**Problema:** A extensão não encontra nenhum pacote

**Solução:**
1. Navegue em sites com JavaScript
2. Abra o console (F12) e procure por mensagens da extensão
3. Verifique se a extensão está ativada
4. Recarregue a página

### Notificações não aparecem

**Problema:** Sem alertas quando pacotes são encontrados

**Solução:**
1. Verifique permissões de notificação do Chrome
2. Vá em Configurações da extensão
3. Certifique-se de que "Notificações do navegador" está ativado

### Discord Webhook não funciona

**Problema:** Mensagens não chegam no Discord

**Solução:**
1. Verifique se a URL está correta
2. Teste o webhook manualmente:
   ```bash
   curl -X POST "SEU_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"content": "Teste"}'
   ```
3. Verifique permissões do webhook no Discord

### Erro de CORS

**Problema:** Erro ao verificar pacotes

**Solução:**
- Isso é esperado em algumas situações
- A extensão tem permissão para fazer requisições cross-origin
- Verifique se a permissão `<all_urls>` está ativa no manifest

## 🔐 Permissões Necessárias

A extensão requer as seguintes permissões:

- `storage` - Armazenar configurações e descobertas
- `webRequest` - Interceptar requisições de JS
- `notifications` - Mostrar alertas
- `activeTab` - Acessar aba ativa
- `scripting` - Injetar scripts
- `<all_urls>` - Analisar qualquer site

## ⚡ Otimizações

### Desempenho

A extensão é otimizada para:
- ✅ Análise passiva (não bloqueia carregamento)
- ✅ Deduplicação de URLs processadas
- ✅ Cache de pacotes já verificados
- ✅ Verificação assíncrona

### Privacidade

- ✅ Não envia dados para servidores externos (exceto webhook configurado)
- ✅ Apenas verifica existência de pacotes
- ✅ Não modifica requisições
- ✅ Não executa código malicioso

## 📝 Próximos Passos

Após instalar:

1. ✅ Configure o Discord Webhook
2. ✅ Teste com a página de teste
3. ✅ Navegue em aplicações web (com autorização)
4. ✅ Analise os resultados
5. ✅ Reporte vulnerabilidades encontradas de forma responsável

## 🤝 Suporte

Para problemas ou dúvidas:
- Verifique o README.md
- Consulte os logs no console
- Entre em contato com OFJAAAH

## ⚠️ Uso Responsável

Lembre-se:
- ✅ Use apenas em ambientes autorizados
- ✅ Obtenha permissão por escrito para pentests
- ✅ Reporte vulnerabilidades de forma responsável
- ❌ Não use para ataques não autorizados

---

**Desenvolvido com ❤️ por OFJAAAH**

**Boa caçada! 🎯**
