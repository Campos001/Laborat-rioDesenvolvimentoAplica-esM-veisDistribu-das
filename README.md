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
```

## 📋 Comandos Úteis

### Ver logs dos consumers
```bash
docker logs -f notification_consumer
docker logs -f analytics_consumer
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
└── analytics-consumer/     # Consumer B (Analytics)
```

## 🏗️ Arquitetura

```
Cliente → List Service (Producer) → RabbitMQ → Consumers
                                      ↓
                        ┌─────────────┴──────────────┐
                        ↓                            ↓
              Notification Consumer        Analytics Consumer
```

