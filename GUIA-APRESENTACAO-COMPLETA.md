# 🎓 Guia Completo de Apresentação - 3 Projetos

## 📋 Ordem de Apresentação

1. **🐇 Mensageria RabbitMQ** (15 pontos)
2. **📱 Offline First Mobile** (25 pontos)
3. **☁️ LocalStack S3** - Etapa 3 Opção B (31 pontos)

---

# 1️⃣ PROJETO 1: Mensageria com RabbitMQ

## 📍 Localização
```
rabbitmq-shopping/
```

## ⏱️ Tempo Estimado: 5-7 minutos

## 🎬 Roteiro Obrigatório (conforme Mensageria.md)

### **PASSO 1: Setup - Mostrar RabbitMQ Management Zerado** (1 min)

```bash
# 1. Subir todos os serviços
cd rabbitmq-shopping
docker-compose up -d

# 2. Aguardar 30 segundos para inicialização
# (Enquanto aguarda, explicar a arquitetura)
```

**O que mostrar:**
- Abrir navegador: **http://localhost:15672**
- Login: `admin` / `admin123`
- Ir em **Queues** → Mostrar filas vazias (`analytics_queue`, `notification_queue`)
- Ir em **Exchanges** → Mostrar exchange `shopping_events` (tipo: topic)
- Ir em **Overview** → Mostrar gráficos zerados

**Falar:**
> "Aqui temos o RabbitMQ Management UI completamente zerado. Vejam que não há mensagens nas filas ainda."

---

### **PASSO 2: Pausar Consumers e Disparar Checkout** (1-2 min)

**IMPORTANTE:** Primeiro vamos pausar os consumers para ver a mensagem na fila!

```bash
# 1. Pausar consumers (para mensagens ficarem na fila)
cd rabbitmq-shopping
pausar-consumers.bat

# 2. Resetar listas
curl -X POST http://localhost:3002/lists/reset

# 3. Fazer checkout (envia mensagem)
curl -X POST http://localhost:3002/lists/1/checkout
```

**O que destacar:**
- ⚡ **Resposta 202 Accepted** - API respondeu imediatamente!
- Mostrar o JSON de resposta:
```json
{
  "success": true,
  "message": "Checkout iniciado. Processamento em andamento.",
  "data": {
    "listId": "1",
    "status": "processing"
  }
}
```

**Falar:**
> "Vejam que a API respondeu instantaneamente com 202 Accepted. Agora vamos ver a mensagem na fila antes de ser processada."

---

### **PASSO 3: Mostrar Mensagem na Fila** (1-2 min)

**Voltar ao navegador (RabbitMQ Management):**

1. Ir em **Queues** → `analytics_queue`
   - Mostrar: **Mensagens na fila: 1** (Ready)
   - Clicar em **Get messages**
   - Deixar "Ack mode" como "Nack message requeue true"
   - Clicar em **Get Message(s)**
   - **Mostrar o JSON completo da mensagem!**

2. Ir em **Queues** → `notification_queue`
   - Mostrar: **Mensagens na fila: 1** (Ready)
   - Repetir o processo de Get messages
   - **Mostrar o JSON completo da mensagem!**

**Falar:**
> "Aqui vemos a mensagem na fila antes de ser processada. Vejam o conteúdo completo da mensagem JSON com todos os dados do checkout. A mensagem está aguardando para ser consumida."

---

### **PASSO 4: Consumir a Mensagem** (2-3 min)

**Agora vamos retomar os consumers para processar a mensagem:**

```bash
# Retomar consumers (vai processar as mensagens da fila)
retomar-consumers.bat
```

#### Terminal 1: Notification Consumer

```bash
docker logs -f notification_consumer
```

**Output esperado:**
```
═══════════════════════════════════════════════
📬 NOVA MENSAGEM RECEBIDA!
═══════════════════════════════════════════════
⏰ Timestamp: 2025-01-15T10:30:00.000Z
📋 Evento: CHECKOUT_COMPLETED
───────────────────────────────────────────────
📧 ENVIANDO COMPROVANTE...
   Para: joao@email.com
   Nome: João Silva
   Lista: Compras Semanais (ID: 1)
   Items: 3 itens
   Total: R$ 45.50

✉️  EMAIL ENVIADO COM SUCESSO!
✅ Mensagem processada com sucesso!
```

**Falar:**
> "Agora retomamos os consumers. Vejam que a mensagem que estava na fila foi consumida e processada. O Consumer A (Notification Service) simula o envio de um comprovante por email."

#### Terminal 2: Analytics Consumer

```bash
docker logs -f analytics_consumer
```

**Output esperado:**
```
═══════════════════════════════════════════════
📊 PROCESSANDO ANALYTICS
═══════════════════════════════════════════════
╔═══════════════════════════════════════════════╗
║           📊 DASHBOARD ATUALIZADO            ║
╠═══════════════════════════════════════════════╣
║ Total de Checkouts:                       1 ║
║ Receita Total:      R$                45.50 ║
║ Total de Items:                           3 ║
║ Ticket Médio:       R$                45.50 ║
```

**Falar:**
> "E aqui temos o Consumer B (Analytics Service) calculando estatísticas em tempo real. Ambos os consumers processam a mesma mensagem de forma independente."

**Voltar ao RabbitMQ Management:**
- Mostrar que as filas estão vazias agora (mensagens foram consumidas)
- Mostrar os contadores de mensagens processadas (acks)

---

### **PASSO 5: RabbitMQ Management - Gráficos** (1 min)

#### Terminal 1: Notification Consumer

```bash
docker logs -f notification_consumer
```

**Output esperado:**
```
═══════════════════════════════════════════════
📬 NOVA MENSAGEM RECEBIDA!
═══════════════════════════════════════════════
⏰ Timestamp: 2025-01-15T10:30:00.000Z
📋 Evento: CHECKOUT_COMPLETED
───────────────────────────────────────────────
📧 ENVIANDO COMPROVANTE...
   Para: joao@email.com
   Nome: João Silva
   Lista: Compras Semanais (ID: 1)
   Items: 3 itens
   Total: R$ 45.50

✉️  EMAIL ENVIADO COM SUCESSO!
✅ Mensagem processada com sucesso!
```

**Falar:**
> "Aqui vemos o Consumer A (Notification Service) processando a mensagem. Ele simula o envio de um comprovante por email."

#### Terminal 2: Analytics Consumer

```bash
docker logs -f analytics_consumer
```

**Output esperado:**
```
═══════════════════════════════════════════════
📊 PROCESSANDO ANALYTICS
═══════════════════════════════════════════════
╔═══════════════════════════════════════════════╗
║           📊 DASHBOARD ATUALIZADO            ║
╠═══════════════════════════════════════════════╣
║ Total de Checkouts:                       1 ║
║ Receita Total:      R$                45.50 ║
║ Total de Items:                           3 ║
║ Ticket Médio:       R$                45.50 ║
```

**Falar:**
> "E aqui temos o Consumer B (Analytics Service) calculando estatísticas em tempo real. Ambos os consumers processam a mesma mensagem de forma independente."

---

### **PASSO 4: RabbitMQ Management - Gráficos** (1-2 min)

**Voltar ao navegador (RabbitMQ Management):**

1. Ir em **Queues** → `analytics_queue`
   - Mostrar: Mensagens processadas (acks)
   - Mostrar: Rate de mensagens (gráfico)
   - Mostrar: Contadores atualizados

2. Ir em **Queues** → `notification_queue`
   - Mostrar: Mesmas estatísticas

3. Ir em **Overview**
   - Mostrar: Gráfico de mensagens subindo e descendo
   - Mostrar: Message rates em tempo real

**Falar:**
> "Aqui vemos as evidências no RabbitMQ Management. Os gráficos mostram as mensagens sendo processadas em tempo real. Vejam que as mensagens são rapidamente consumidas e confirmadas (acks)."

---

### **PASSO 6: Múltiplos Checkouts (Opcional - se houver tempo)** (1 min)

```bash
# Resetar listas
curl -X POST http://localhost:3002/lists/reset

# Disparar vários checkouts
curl -X POST http://localhost:3002/lists/1/checkout
curl -X POST http://localhost:3002/lists/2/checkout
curl -X POST http://localhost:3002/lists/3/checkout
```

**Mostrar:**
- Logs dos consumers processando múltiplas mensagens
- Gráficos no RabbitMQ subindo

---

## ✅ Checklist de Avaliação (Mensageria.md)

- ✅ Producer implementado (List Service publica eventos)
- ✅ Consumer A (Notification) - Processa e loga
- ✅ Consumer B (Analytics) - Calcula estatísticas
- ✅ Exchange Topic configurado
- ✅ Response 202 Accepted
- ✅ Demonstração funcional (logs + RabbitMQ UI)
- ✅ Docker Compose orquestrando tudo

---

# 2️⃣ PROJETO 2: Offline First Mobile

## 📍 Localização
```
Projeto Offline First/
```

## ⏱️ Tempo Estimado: 7-10 minutos

## 🎬 Roteiro Obrigatório (conforme Offline-First.md)

### **PASSO 1: Prova de Vida Offline** (2-3 min)

**Preparação:**
```bash
# 1. Garantir que o backend está rodando
# (Se usar backend separado, iniciar antes)

# 2. Abrir o app no celular/emulador
cd "Projeto Offline First"
flutter run
```

**Demonstração:**

1. **Colocar celular em "Modo Avião"** ✈️
   - Mostrar que o app detecta offline
   - Mostrar indicador visual: 🔴 "Modo Offline" (vermelho/laranja)

2. **Criar 2 itens offline:**
   - Abrir formulário
   - Criar item 1: "Arroz" - Quantidade: 2
   - Salvar → Mostrar que aparece na lista
   - Criar item 2: "Feijão" - Quantidade: 1
   - Salvar → Mostrar que aparece na lista

3. **Editar 1 item existente:**
   - Clicar em um item
   - Alterar quantidade (ex: de 2 para 5)
   - Salvar

4. **Mostrar indicadores visuais:**
   - Itens aparecem com ícone de "pendente" ou "nuvem cortada" ☁️❌
   - Mostrar status de sincronização na UI

**Falar:**
> "Agora vou demonstrar o funcionamento offline. Coloquei o celular em modo avião e vou criar e editar itens. Vejam que os dados são salvos localmente e aparecem imediatamente, mesmo sem internet."

---

### **PASSO 2: Persistência - Fechar e Reabrir App** (1-2 min)

**Demonstração:**

1. **Fechar o app completamente:**
   - Swipe up (Android) ou fechar (iOS)
   - Matar o processo completamente

2. **Abrir o app novamente (ainda offline):**
   - Os dados devem estar lá!
   - Mostrar que os 2 itens criados ainda aparecem
   - Mostrar que a edição foi mantida
   - Mostrar que ainda está em modo offline

**Falar:**
> "Agora vou fechar o app completamente e reabrir. Vejam que os dados persistem porque estão salvos no SQLite local. Mesmo sem internet, tudo continua funcionando."

---

### **PASSO 3: Sincronização Automática** (2-3 min)

**Demonstração:**

1. **Tirar do "Modo Avião":**
   - Desativar modo avião
   - Mostrar que o app detecta a rede automaticamente
   - Mostrar indicador mudando: 🟢 "Modo Online" (verde)
   - Mostrar notificação: "🟢 Conectado - Sincronizando..."

2. **Observar sincronização:**
   - Os ícones de "pendente" mudam para "sincronizado" ✅
   - Mostrar logs no terminal (se houver)
   - Mostrar tela de status de sincronização (se houver)

3. **Validar no backend:**
   - Abrir Postman ou terminal
   - Fazer GET na API para listar itens
   - Mostrar que os itens criados offline agora estão no servidor

**Falar:**
> "Agora vou tirar do modo avião. O app detecta automaticamente a conexão e inicia a sincronização. Vejam que os ícones mudam de 'pendente' para 'sincronizado'. Os dados criados offline foram enviados para o servidor."

---

### **PASSO 4: Prova de Conflito (LWW - Last Write Wins)** (2-3 min)

**Preparação:**
- Ter o app aberto e online
- Ter Postman/terminal pronto

**Demonstração:**

1. **Edição simultânea:**
   - **No app:** Editar um item (ex: mudar quantidade para 10)
   - **No Postman:** Fazer PUT no mesmo item (ex: mudar quantidade para 20)
   - Fazer quase ao mesmo tempo

2. **Mostrar resolução:**
   - Explicar que a última escrita vence (LWW)
   - Se o servidor tiver versão mais recente → sobrescreve local
   - Se o local for mais recente → sobe para servidor
   - Mostrar qual versão prevaleceu

3. **Validar:**
   - Mostrar o item final no app
   - Mostrar o item final no servidor (via API)
   - Confirmar que estão sincronizados

**Falar:**
> "Agora vou demonstrar a resolução de conflitos usando a estratégia Last-Write-Wins. Vou editar o mesmo item no app e no servidor simultaneamente. A versão com timestamp mais recente prevalece."

---

## ✅ Checklist de Avaliação (Offline-First.md)

- ✅ Persistência Local (SQLite) implementada
- ✅ Detector de Conectividade (connectivity_plus) funcionando
- ✅ Fila de Sincronização (sync_queue) implementada
- ✅ Resolução de Conflitos (LWW) implementada
- ✅ Indicadores visuais (online/offline)
- ✅ Sincronização automática ao reconectar
- ✅ Dados persistem após fechar app

---

# 3️⃣ PROJETO 3: LocalStack S3 (Etapa 3 - Opção B)

## 📍 Localização
```
rabbitmq-shopping/  (LocalStack já está no docker-compose.yml)
Projeto Offline First/  (App mobile com upload)
```

## ⏱️ Tempo Estimado: 5-7 minutos

## 🎬 Roteiro Obrigatório (conforme Etapa3.pdf - Opção B)

### **PASSO 1: Infraestrutura - Mostrar LocalStack Subindo** (1 min)

```bash
cd rabbitmq-shopping

# Subir LocalStack (já está no docker-compose.yml)
docker-compose up -d localstack

# Aguardar inicialização
# (Enquanto aguarda, explicar o que é LocalStack)
```

**O que mostrar:**
- Terminal com `docker-compose up`
- Mostrar logs do LocalStack inicializando
- Mostrar que o container está rodando: `docker ps | grep localstack`

**Falar:**
> "Aqui estamos subindo o LocalStack, que é um emulador local dos serviços AWS. Ele simula o S3 da AWS localmente, permitindo que testemos a integração sem custos."

---

### **PASSO 2: Configuração - Listar Buckets** (1 min)

```bash
# Configurar AWS CLI para apontar para LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Listar buckets (deve mostrar shopping-images)
aws --endpoint-url=http://localhost:4566 s3 ls

# Ou criar o bucket se não existir
aws --endpoint-url=http://localhost:4566 s3 mb s3://shopping-images
```

**Alternativa (se não tiver AWS CLI):**
```bash
# Usar o script de setup
# Windows:
setup-s3-bucket.bat

# Linux/Mac:
./setup-s3-bucket.sh
```

**O que mostrar:**
- Terminal mostrando o bucket `shopping-images` listado
- Confirmar que o bucket existe

**Falar:**
> "Aqui configuramos o AWS CLI para apontar para o LocalStack. Vejam que o bucket 'shopping-images' existe e está pronto para receber imagens."

---

### **PASSO 3: Ação - Tirar Foto e Salvar no App** (2-3 min)

**Preparação:**
- Ter o app mobile aberto
- Ter o backend rodando (list-service com endpoint /upload)

**Demonstração:**

1. **No app mobile:**
   - Abrir formulário de criar/editar item
   - Clicar no botão de câmera 📷
   - Tirar uma foto de um produto (ou escolher da galeria)
   - Preencher dados do item (nome, quantidade, etc.)
   - Salvar o item

2. **Mostrar no app:**
   - Item aparece na lista
   - Foto aparece no card do item
   - Mostrar que está sincronizado (se online)

**Falar:**
> "Agora vou tirar uma foto de um produto no app e salvar. A foto será enviada para o backend, que a salvará no S3 local do LocalStack."

---

### **PASSO 4: Validação - Listar Objetos no Bucket** (1-2 min)

**Opção 1: Via Terminal (AWS CLI)**

```bash
# Listar objetos no bucket
aws --endpoint-url=http://localhost:4566 s3 ls s3://shopping-images/

# Ver detalhes de um objeto específico
aws --endpoint-url=http://localhost:4566 s3 ls s3://shopping-images/ --recursive
```

**Opção 2: Via Navegador (LocalStack Web UI)**

Se o LocalStack tiver interface web:
- Abrir: `http://localhost:4566/_localstack/health`
- Ou usar ferramenta como `localstack-s3-browser`

**Opção 3: Via Backend (Endpoint de listagem)**

```bash
# Se houver endpoint para listar imagens
curl http://localhost:3002/images
```

**O que mostrar:**
- Lista de objetos no bucket
- Nome do arquivo (ex: `item-123-20250115-103000.jpg`)
- Tamanho do arquivo
- Data de criação

**Falar:**
> "Agora vou validar que a imagem foi salva. Vejam que ao listar os objetos do bucket 'shopping-images', a foto que acabamos de tirar está lá. A imagem foi salva 'na nuvem local' em vez de ficar apenas no dispositivo."

---

### **PASSO 5: Verificar URL da Imagem (Opcional)** (1 min)

**No app:**
- Mostrar que o item tem uma `imageUrl`
- Mostrar que a URL aponta para o LocalStack (ex: `http://localhost:4566/shopping-images/...`)

**No backend:**
- Mostrar logs do upload
- Mostrar que a URL foi retornada

**Falar:**
> "O app agora armazena a URL da imagem no S3. Quando o item é exibido, a imagem é carregada do S3 local, simulando o comportamento de uma aplicação em produção na AWS."

---

## ✅ Checklist de Avaliação (Etapa3.pdf - Opção B)

- ✅ Docker Compose configurado com LocalStack
- ✅ Bucket S3 criado e configurado
- ✅ Endpoint de upload implementado no backend
- ✅ Integração no app mobile para envio de fotos
- ✅ Validação: Imagem salva no bucket S3 local
- ✅ Demonstração funcional completa

---

# 📝 Dicas Gerais para a Apresentação

## ⚠️ Antes da Apresentação

1. **Testar tudo antes:**
   - Rodar todos os projetos
   - Verificar que não há erros
   - Ter os comandos prontos em arquivos de texto

2. **Preparar terminais:**
   - Terminal 1: Docker Compose
   - Terminal 2: Logs dos consumers (RabbitMQ)
   - Terminal 3: Comandos de teste
   - Terminal 4: AWS CLI (para S3)

3. **Preparar navegadores:**
   - Aba 1: RabbitMQ Management (http://localhost:15672)
   - Aba 2: (Opcional) LocalStack Health

4. **Ter o app mobile pronto:**
   - Instalado e funcionando
   - Backend rodando
   - Permissões de câmera concedidas

## 🎯 Durante a Apresentação

1. **Falar claramente:**
   - Explicar o que está fazendo
   - Destacar os pontos importantes
   - Mencionar os conceitos técnicos

2. **Mostrar evidências:**
   - Sempre mostrar os resultados visuais
   - Apontar para os logs
   - Destacar os indicadores visuais

3. **Seguir o roteiro:**
   - Não pular etapas obrigatórias
   - Manter a ordem sugerida
   - Respeitar os tempos estimados

4. **Se algo der errado:**
   - Manter a calma
   - Explicar o que aconteceu
   - Ter planos B (screenshots, vídeos)

## 📊 Resumo dos Tempos

- **Projeto 1 (RabbitMQ):** 5-7 minutos
- **Projeto 2 (Offline First):** 7-10 minutos
- **Projeto 3 (LocalStack S3):** 5-7 minutos
- **Total:** ~20-25 minutos

## 🎓 Pontos a Destacar

### RabbitMQ:
- Arquitetura assíncrona
- Padrão Pub/Sub
- Processamento em background
- Escalabilidade

### Offline First:
- Experiência do usuário
- Resiliência (funciona sem internet)
- Sincronização inteligente
- Resolução de conflitos

### LocalStack S3:
- Simulação de cloud local
- Redução de custos (desenvolvimento)
- Preparação para produção
- Integração mobile-backend

---

**Boa sorte na apresentação! 🚀**

