# 🐇 RabbitMQ - Quick Start

## ⚡ Execução Rápida (2 Passos)

### Passo 1: Mostrar Mensagem na Fila

```bash
# 1. Iniciar serviços
cd rabbitmq-shopping
docker-compose up -d

# 2. PAUSAR consumers (para mensagens ficarem na fila)
pausar-consumers.bat

# 3. Resetar listas
curl -X POST http://localhost:3002/lists/reset

# 4. Fazer checkout (envia mensagem)
curl -X POST http://localhost:3002/lists/1/checkout

# 5. Abrir RabbitMQ Management: http://localhost:15672
#    Login: admin / admin123
#    Ir em: Queues > analytics_queue ou notification_queue
#    Clicar em: Get messages
#    Ver a mensagem na fila! ✅
```

### Passo 2: Consumir a Mensagem

```bash
# Retomar consumers (vai processar as mensagens da fila)
retomar-consumers.bat

# Ver logs em tempo real
docker logs -f notification_consumer
docker logs -f analytics_consumer

# Voltar ao RabbitMQ Management
# Ver que a mensagem foi consumida (fila vazia)
```

---

## 📋 Comandos Completos

### Iniciar tudo
```bash
docker-compose up -d
```

### Pausar consumers (para ver mensagens na fila)
```bash
pausar-consumers.bat
```

### Retomar consumers (para processar mensagens)
```bash
retomar-consumers.bat
```

### Testar API
```bash
# Listar listas
curl http://localhost:3002/lists

# Resetar listas
curl -X POST http://localhost:3002/lists/reset

# Fazer checkout
curl -X POST http://localhost:3002/lists/1/checkout
```

### Ver logs
```bash
# Notification Consumer
docker logs -f notification_consumer

# Analytics Consumer
docker logs -f analytics_consumer

# Todos os logs
docker-compose logs -f
```

### Parar tudo
```bash
docker-compose down
```

---

## 🌐 URLs Importantes

- **RabbitMQ Management:** http://localhost:15672 (admin/admin123)
- **List Service API:** http://localhost:3002
- **Health Check:** http://localhost:3002/health

---

## 🎯 Sequência Completa de Demonstração

```bash
# 1. Iniciar
docker-compose up -d

# 2. Pausar consumers
pausar-consumers.bat

# 3. Resetar e enviar mensagem
curl -X POST http://localhost:3002/lists/reset
curl -X POST http://localhost:3002/lists/1/checkout

# 4. Ver mensagem na fila (RabbitMQ Management UI)

# 5. Retomar consumers
retomar-consumers.bat

# 6. Ver logs processando
docker logs -f notification_consumer
```

