# ⚡ Comandos Rápidos para Apresentação

## 🐇 RabbitMQ - Comandos Essenciais

### ⚡ Sequência Rápida (2 Passos)

#### Passo 1: Mostrar Mensagem na Fila
```bash
# 1. Iniciar serviços
cd rabbitmq-shopping
docker-compose up -d

# 2. PAUSAR consumers (para mensagens ficarem na fila)
pausar-consumers.bat

# 3. Resetar e enviar mensagem
curl -X POST http://localhost:3002/lists/reset
curl -X POST http://localhost:3002/lists/1/checkout

# 4. Ver mensagem na fila: http://localhost:15672
#    Queues > analytics_queue > Get messages
```

#### Passo 2: Consumir Mensagem
```bash
# Retomar consumers (processa mensagens da fila)
retomar-consumers.bat

# Ver logs processando
docker logs -f notification_consumer
docker logs -f analytics_consumer
```

---

### Comandos Individuais

### Iniciar serviços
```bash
cd rabbitmq-shopping
docker-compose up -d
```

### Pausar consumers (ver mensagens na fila)
```bash
pausar-consumers.bat
```

### Retomar consumers (processar mensagens)
```bash
retomar-consumers.bat
```

### Ver logs dos consumers
```bash
# Notification Consumer
docker logs -f notification_consumer

# Analytics Consumer
docker logs -f analytics_consumer

# Todos os logs
docker-compose logs -f
```

### Testar API
```bash
# Listar listas
curl http://localhost:3002/lists

# Fazer checkout
curl -X POST http://localhost:3002/lists/1/checkout

# Resetar listas
curl -X POST http://localhost:3002/lists/reset
```

### Parar serviços
```bash
docker-compose stop
```

---

## 📱 Offline First - Comandos Essenciais

### Rodar app
```bash
cd "Projeto Offline First"
flutter run
```

### Ver logs do app
```bash
flutter logs
```

### Limpar e rebuild
```bash
flutter clean
flutter pub get
flutter run
```

---

## ☁️ LocalStack S3 - Comandos Essenciais

### Iniciar LocalStack
```bash
cd rabbitmq-shopping
docker-compose up -d localstack
```

### Configurar AWS CLI para LocalStack
```bash
# Windows (PowerShell)
$env:AWS_ACCESS_KEY_ID="test"
$env:AWS_SECRET_ACCESS_KEY="test"
$env:AWS_DEFAULT_REGION="us-east-1"

# Linux/Mac
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
```

### Listar buckets
```bash
aws --endpoint-url=http://localhost:4566 s3 ls
```

### Listar objetos no bucket
```bash
aws --endpoint-url=http://localhost:4566 s3 ls s3://shopping-images/
```

### Criar bucket (se não existir)
```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://shopping-images
```

### Verificar saúde do LocalStack
```bash
curl http://localhost:4566/_localstack/health
```

---

## 🔧 Comandos Docker Úteis

### Ver containers rodando
```bash
docker ps
```

### Ver logs de um container específico
```bash
docker logs -f <container_name>
```

### Reiniciar um serviço
```bash
docker-compose restart <service_name>
```

### Parar tudo
```bash
docker-compose down
```

### Limpar tudo (incluindo volumes)
```bash
docker-compose down -v
```

---

## 📊 URLs Importantes

- **RabbitMQ Management:** http://localhost:15672
- **List Service API:** http://localhost:3002
- **LocalStack Endpoint:** http://localhost:4566
- **LocalStack Health:** http://localhost:4566/_localstack/health

---

## 🎯 Sequência Rápida de Teste

### Teste completo RabbitMQ (2 Passos)

#### Passo 1: Mostrar na Fila
```bash
# 1. Pausar consumers
pausar-consumers.bat

# 2. Resetar listas
curl -X POST http://localhost:3002/lists/reset

# 3. Fazer checkout
curl -X POST http://localhost:3002/lists/1/checkout

# 4. Ver mensagem na fila: http://localhost:15672
```

#### Passo 2: Consumir
```bash
# 1. Retomar consumers
retomar-consumers.bat

# 2. Ver logs (em outro terminal)
docker logs -f notification_consumer
docker logs -f analytics_consumer
```

### Teste completo S3 (copiar e colar)
```bash
# 1. Verificar LocalStack
curl http://localhost:4566/_localstack/health

# 2. Listar buckets
aws --endpoint-url=http://localhost:4566 s3 ls

# 3. Listar objetos
aws --endpoint-url=http://localhost:4566 s3 ls s3://shopping-images/
```

