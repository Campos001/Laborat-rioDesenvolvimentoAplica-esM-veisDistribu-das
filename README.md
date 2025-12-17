# 🐇 Sistema de Mensageria com RabbitMQ

Sistema de microsserviços para Lista de Compras com processamento assíncrono de eventos usando RabbitMQ.

## 🚀 Como Rodar

### 1. Iniciar Serviços

```bash
cd rabbitmq-shopping
docker-compose up -d
```

### 2. Acessar RabbitMQ Management

Abra no navegador: **http://localhost:15672**
- **Usuário:** `admin`
- **Senha:** `admin123`

### 3. Testar o Sistema

```bash
# Listar listas disponíveis
curl http://localhost:3002/lists

# Resetar listas
curl -X POST http://localhost:3002/lists/reset

# Fazer checkout (envia mensagem para RabbitMQ)
curl -X POST http://localhost:3002/lists/1/checkout
```

## 📊 Ver Mensagens na Fila (2 Passos)

### Passo 1: Mostrar Mensagem na Fila

```bash
cd rabbitmq-shopping

# Pausar consumers (para mensagens ficarem na fila)
pausar-consumers.bat

# Resetar e enviar mensagem
curl -X POST http://localhost:3002/lists/reset
curl -X POST http://localhost:3002/lists/1/checkout

# Ver mensagem: http://localhost:15672 → Queues → Get messages
```

### Passo 2: Consumir Mensagem

```bash
# Retomar consumers (processa mensagens da fila)
retomar-consumers.bat

# Ver logs processando
docker logs -f notification_consumer
docker logs -f analytics_consumer
docker logs -f task_consumer
```

## 📋 Comandos Úteis

### Ver logs dos consumers
```bash
docker logs -f notification_consumer
docker logs -f analytics_consumer
docker logs -f task_consumer
docker-compose logs -f
```

### Parar serviços
```bash
docker-compose down
```

## 🌐 URLs Importantes

- **RabbitMQ Management:** http://localhost:15672 (admin/admin123)
- **List Service API:** http://localhost:3002
- **Health Check:** http://localhost:3002/health

## 📁 Estrutura do Projeto

```
rabbitmq-shopping/
├── docker-compose.yml
├── list-service/          # Producer (API REST)
├── notification-consumer/  # Consumer A (Notificações)
├── analytics-consumer/     # Consumer B (Analytics)
└── task-consumer/          # Consumer C (Tarefas do Mobile App)
```

## 🏗️ Arquitetura

```
Cliente → List Service (Producer) → RabbitMQ → Consumers
                                      ↓
                        ┌─────────────┴──────────────┐
                        ↓                            ↓
              Notification Consumer        Analytics Consumer

App Flutter → RabbitMQ → Task Consumer
              (task_events)
```

## 📱 Integração com Flutter

O sistema também recebe tarefas do app Flutter através da fila `task_queue`.

**Documentação completa:** [FLUTTER-INTEGRATION.md](rabbitmq-shopping/FLUTTER-INTEGRATION.md)

### Formato da Mensagem do Flutter

```json
{
  "operation": "CREATE|UPDATE|DELETE",
  "task": {
    "id": "...",
    "title": "...",
    "description": "...",
    "completed": false,
    "synced": false,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "source": "mobile_app"
}
```

### Ver Tarefas do Mobile

```bash
# Ver logs do consumer de tarefas
docker logs -f task_consumer
```

