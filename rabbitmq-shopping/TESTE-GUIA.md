# 🧪 Guia de Teste - Visualizar Mensagens no RabbitMQ

## 📋 O que foi criado:

1. **Rota de Reset** (`POST /lists/reset`) - Reseta todas as listas para permitir novos testes
2. **Mais listas de teste** - Agora há 5 listas ao invés de 2
3. **Script de teste automatizado** (`test-messages.js`) - Envia múltiplas mensagens com delay

## 🚀 Como usar:

### ⚠️ IMPORTANTE: Para ver mensagens na fila

As mensagens são processadas muito rápido pelos consumers. Para visualizá-las na fila, você precisa **pausar os consumers primeiro**:

### Opção 1: Pausar consumers (RECOMENDADO para visualizar)

**Windows:**
```bash
# 1. Pausar consumers
pausar-consumers.bat

# 2. Executar testes
node test-messages.js

# 3. Ver mensagens no RabbitMQ Management UI
# Abra: http://localhost:15672
# Vá em: Queues > analytics_queue ou notification_queue > Get messages

# 4. Quando terminar, retomar consumers
retomar-consumers.bat
```

**Linux/Mac:**
```bash
# 1. Pausar consumers
chmod +x pausar-consumers.sh retomar-consumers.sh
./pausar-consumers.sh

# 2. Executar testes
node test-messages.js

# 3. Ver mensagens no RabbitMQ Management UI
# Abra: http://localhost:15672
# Vá em: Queues > analytics_queue ou notification_queue > Get messages

# 4. Quando terminar, retomar consumers
./retomar-consumers.sh
```

### Opção 2: Comandos Docker diretos

```bash
# Pausar consumers
docker-compose stop notification-consumer analytics-consumer

# Executar testes
node test-messages.js

# Ver mensagens no RabbitMQ (http://localhost:15672)

# Retomar consumers
docker-compose start notification-consumer analytics-consumer
```

### Opção 3: Testar com consumers ativos (ver apenas Overview)

Se quiser ver apenas as estatísticas em tempo real sem pausar:

1. Iniciar os serviços:
```bash
docker-compose up
```

2. Abrir o RabbitMQ Management UI:
   - URL: **http://localhost:15672**
   - Usuário: `admin`
   - Senha: `admin123`

3. Executar o script de teste:
```bash
node test-messages.js
```

4. Ver no **Overview** os gráficos de mensagens em tempo real

## 📊 Onde visualizar as mensagens no RabbitMQ:

### Opção 1: Overview (Tempo Real)
1. Vá em **Overview** (página inicial)
2. Veja os gráficos de mensagens sendo processadas em tempo real
3. Observe as estatísticas de **Message rates**

### Opção 2: Exchanges
1. Vá em **Exchanges**
2. Clique em **shopping_events**
3. Veja as mensagens publicadas
4. Clique em **Publish message** para enviar manualmente

### Opção 3: Queues (Mais detalhado)
1. Vá em **Queues**
2. Veja as filas:
   - **analytics_queue** - Mensagens para analytics
   - **notification_queue** - Mensagens para notificações
3. Clique em uma fila para ver:
   - Mensagens na fila
   - Mensagens processadas
   - Rate de mensagens
   
### Opção 4: Get Messages (Ver conteúdo)
1. **IMPORTANTE:** Pause os consumers primeiro (veja seção "Como usar" acima)
2. Vá em **Queues** > escolha uma fila (`analytics_queue` ou `notification_queue`)
3. Clique em **Get messages**
4. Deixe **Ack mode** como "Nack message requeue true" (para não remover da fila)
5. Clique em **Get Message(s)** para ver o conteúdo JSON
6. Você verá o JSON completo da mensagem

## 🔄 Teste Manual (Alternativa)

Se preferir testar manualmente:

```bash
# 1. Resetar listas
curl -X POST http://localhost:3002/lists/reset

# 2. Fazer checkout (envia mensagem)
curl -X POST http://localhost:3002/lists/1/checkout
curl -X POST http://localhost:3002/lists/2/checkout
curl -X POST http://localhost:3002/lists/3/checkout
```

## 💡 Dicas:

- **Para ver mensagens na fila:** SEMPRE pause os consumers primeiro
- O script tem delay de 2 segundos entre requisições para facilitar visualização
- As mensagens são processadas muito rapidamente pelos consumers (por isso a fila fica vazia)
- Use o **Overview** para ver estatísticas em tempo real sem pausar consumers
- Use **Get Messages** nas filas para ver o conteúdo JSON completo (requer pausar consumers)
- Após visualizar, retome os consumers para processar as mensagens acumuladas

