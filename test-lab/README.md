# 🧪 VulnCorp Test Laboratory

**Ambiente de teste para Dependency Confusion Hunter**
**Autor:** OFJAAAH

## 📋 Sobre

Este é um laboratório de teste completo para demonstrar e validar a extensão **Dependency Confusion Hunter**. A aplicação simula uma empresa fictícia (VulnCorp) que usa pacotes privados vulneráveis a ataques de Dependency Confusion.

## 🎯 Objetivo

Testar a extensão em um ambiente controlado com:
- ✅ Pacotes npm privados que não existem publicamente
- ✅ Pacotes Python (pip) privados
- ✅ Source maps que expõem estrutura interna
- ✅ Múltiplos padrões de import/require
- ✅ Código JavaScript realista

## 📦 Pacotes Vulneráveis Incluídos

### NPM Packages (7 pacotes)

1. **vulncorp-auth-service** v1.2.3
   - Serviço de autenticação interno
   - Localização: `vendor.bundle.js`, `auth.js`

2. **vulncorp-analytics-engine** v2.5.1
   - Motor de analytics
   - Localização: `vendor.bundle.js`, `analytics.js`

3. **secret-crypto-lib** v0.9.4
   - Biblioteca de criptografia
   - Localização: `vendor.bundle.js`

4. **vulncorp-logger** v1.0.8
   - Sistema de logging
   - Localização: `vendor.bundle.js`

5. **internal-data-processor-v2** v2.1.0
   - Processador de dados
   - Localização: `app.bundle.js`

6. **company-private-api-sdk** v3.0.5
   - SDK de API interna
   - Localização: `app.bundle.js`

7. **enterprise-cache-manager** v1.5.2
   - Gerenciador de cache
   - Localização: `app.bundle.js`

### Python Packages (3 pacotes)

1. **internal_ml_framework** v2.1.0
   - Framework de Machine Learning
   - Localização: `analytics.js`, source maps

2. **company_data_utils** v1.5.3
   - Utilidades de dados
   - Localização: `analytics.js`, source maps

3. **vulncorp_ml_models** v0.8.2
   - Modelos de ML
   - Localização: `analytics.js`, source maps

## 🚀 Como Usar

### Pré-requisitos

- Python 3.x instalado
- Google Chrome com a extensão Dependency Confusion Hunter instalada
- Extensão ativada e configurada

### Início Rápido

```bash
# Navegar para o diretório do lab
cd /root/PENTEST/confussedExtension/test-lab

# Iniciar o servidor
./start.sh

# Ou manualmente:
python3 server.py
```

O servidor iniciará em `http://localhost:8080`

### Passo a Passo

#### 1. Preparar a Extensão

```bash
# Certifique-se de que a extensão está instalada
# Navegue para chrome://extensions/
# Verifique se "Dependency Confusion Hunter" está ativa
```

#### 2. Iniciar o Laboratório

```bash
cd /root/PENTEST/confussedExtension/test-lab
./start.sh
```

Você verá:

```
╔════════════════════════════════════════════════════════════╗
║  🎯 VulnCorp Test Laboratory                               ║
║  Dependency Confusion Testing Environment                  ║
║  Author: OFJAAAH                                           ║
╚════════════════════════════════════════════════════════════╝

📋 Pre-flight checks...
✅ Python 3 found
✅ Chrome/Chromium found

🚀 Starting test server...
✅ Server ready at http://localhost:8080
```

#### 3. Abrir no Chrome

```
http://localhost:8080
```

#### 4. Aguardar Análise

- A extensão analisará automaticamente a página
- Aguarde 5-10 segundos
- Observe o console do navegador (F12) para ver os logs

#### 5. Verificar Resultados

- Clique no ícone da extensão
- Você deverá ver **10 pacotes** detectados
- Verifique se o badge mostra o número de vulnerabilidades

## 🔍 O Que Esperar

### Console do Navegador

```
[Dependency Confusion Hunter] Initialized by OFJAAAH
[VulnCorp] Vendor bundle loaded
[VULNERABLE] Loading private package: vulncorp-auth-service
[VULNERABLE] Loading private package: vulncorp-analytics-engine
[VULNERABLE] Loading private package: secret-crypto-lib
[VULNERABLE] Loading private package: vulncorp-logger
[VulnCorp] App bundle loaded
[WARNING] This application uses PRIVATE packages
[Analytics] Using Python packages: internal_ml_framework, company_data_utils, vulncorp_ml_models
```

### Extensão Popup

```
🎯 Dependency Hunter

Vulnerabilidades: 10
Arquivos Analisados: 4

Pacotes Vulneráveis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 vulncorp-auth-service (NPM)
   Fonte: vendor.bundle.js
   Status: ❌ Não existe publicamente

📦 vulncorp-analytics-engine (NPM)
   Fonte: vendor.bundle.js
   Status: ❌ Não existe publicamente

📦 internal-data-processor-v2 (NPM)
   Fonte: app.bundle.js
   Status: ❌ Não existe publicamente

[... mais 7 pacotes ...]
```

### Notificações

Se configuradas, você receberá:
- ✅ Notificações do Chrome para cada pacote encontrado
- ✅ Mensagens no Discord (se webhook configurado)
- ✅ Badge atualizado com contagem

## 📊 Estrutura do Lab

```
test-lab/
├── index.html              # Página principal da aplicação
├── server.py               # Servidor HTTP Python
├── start.sh                # Script de início rápido
├── README.md               # Esta documentação
├── static/
│   ├── css/
│   │   └── main.css        # Estilos da aplicação
│   └── js/
│       ├── vendor.bundle.js      # Bundle com auth, analytics, crypto, logger
│       ├── vendor.bundle.js.map  # Source map revelando estrutura
│       ├── app.bundle.js         # Bundle com data processor, API SDK, cache
│       ├── app.bundle.js.map     # Source map
│       ├── analytics.js          # Módulo de analytics (Python packages)
│       ├── analytics.js.map      # Source map
│       ├── auth.js               # Módulo de autenticação
│       └── auth.js.map           # Source map
└── api/                    # Diretório para API simulada (futuro)
```

## 🧪 Testes Avançados

### Teste 1: Verificar Source Maps

```bash
# Acessar source maps diretamente
curl http://localhost:8080/static/js/vendor.bundle.js.map

# Deve mostrar referências a node_modules/vulncorp-*
```

### Teste 2: Inspecionar Network

1. Abrir DevTools (F12)
2. Ir para aba "Network"
3. Recarregar página
4. Verificar arquivos `.js` e `.map` carregados

### Teste 3: Monitorar Extensão

1. Ir para `chrome://extensions/`
2. Clicar em "Detalhes" na extensão
3. Clicar em "Ver no console" (background page)
4. Observar logs de detecção em tempo real

### Teste 4: Discord Webhook

```bash
# Configure o webhook nas configurações da extensão
# Recarregue a página
# Verifique mensagens no Discord
```

## 🎓 Cenários de Aprendizado

### Cenário 1: Import Direto

```javascript
// vendor.bundle.js
const auth = __webpack_require__('vulncorp-auth-service');
```

**Lição:** Webpack expõe nomes de módulos diretamente

### Cenário 2: Source Maps

```json
// vendor.bundle.js.map
{
  "sources": [
    "webpack:///./node_modules/vulncorp-auth-service/index.js"
  ]
}
```

**Lição:** Source maps revelam estrutura interna de node_modules

### Cenário 3: Comentários

```javascript
// analytics.js
// Backend uses: internal_ml_framework, company_data_utils
```

**Lição:** Comentários podem expor dependências Python

### Cenário 4: Strings Literais

```javascript
const pythonPackages = [
  'internal_ml_framework',
  'company_data_utils'
];
```

**Lição:** Arrays de strings podem listar dependências

## 🐛 Troubleshooting

### Extensão não detecta nada

**Problema:** Nenhum pacote detectado

**Solução:**
1. Verifique se a extensão está ativa (`chrome://extensions/`)
2. Recarregue a extensão
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Recarregue a página do lab

### Servidor não inicia

**Problema:** `Address already in use`

**Solução:**
```bash
# Encontrar processo usando porta 8080
lsof -i :8080

# Matar processo
kill -9 <PID>

# Ou usar outra porta
# Edite server.py e mude PORT = 8080 para PORT = 8081
```

### Pacotes detectados mas não marcados como vulneráveis

**Problema:** Extensão detecta mas diz que existem

**Solução:**
- Isso indica que os pacotes podem realmente existir no npm!
- Verifique manualmente: `npm view nome-do-pacote`
- Os nomes foram escolhidos para provavelmente não existir

## 📈 Métricas Esperadas

Após análise completa, você deve ver:

| Métrica | Valor Esperado |
|---------|---------------|
| Pacotes NPM detectados | 7 |
| Pacotes Python detectados | 3 |
| Total de pacotes | 10 |
| Arquivos JS analisados | 4 |
| Source maps analisados | 4 |
| Tempo de análise | 5-10 segundos |

## 🎯 Próximos Passos

Após testar o laboratório:

1. ✅ Entenda como a extensão funciona
2. ✅ Teste em aplicações reais (com autorização!)
3. ✅ Configure Discord webhook
4. ✅ Experimente com seus próprios pacotes fictícios
5. ✅ Leia o `EXAMPLES.md` para mais cenários

## ⚠️ Avisos Importantes

- 🔴 Este é um ambiente de TESTE
- 🔴 Os pacotes são FICTÍCIOS
- 🔴 NÃO crie versões maliciosas destes pacotes
- 🟢 Use para aprender sobre a vulnerabilidade
- 🟢 Use para testar defesas
- 🟢 Use de forma ética

## 🤝 Contribuindo

Quer melhorar o lab? Sugestões:

- Adicionar mais padrões de import
- Criar APIs mockadas
- Simular WebSocket com pacotes privados
- Adicionar testes automatizados

## 📚 Recursos

- [README Principal](../README.md)
- [Guia de Instalação](../INSTALL.md)
- [Exemplos de Uso](../EXAMPLES.md)
- [Artigo Original - Alex Birsan](https://medium.com/@alex.birsan/dependency-confusion-4a5d60fec610)

## 📝 Checklist de Teste

- [ ] Servidor iniciado com sucesso
- [ ] Página carrega no Chrome
- [ ] Extensão ativa e funcionando
- [ ] Console mostra logs de carregamento
- [ ] Extensão detecta os 10 pacotes
- [ ] Badge mostra número correto
- [ ] Notificações aparecem (se ativadas)
- [ ] Discord webhook funciona (se configurado)
- [ ] Source maps são analisados
- [ ] Todos os 4 arquivos JS processados

---

**Desenvolvido com ❤️ por OFJAAAH**

**Boa caçada! 🎯**

---

## 🆘 Suporte

Problemas? Dúvidas?

1. Verifique o console do navegador
2. Verifique o console da extensão
3. Leia a documentação principal
4. Entre em contato com OFJAAAH
