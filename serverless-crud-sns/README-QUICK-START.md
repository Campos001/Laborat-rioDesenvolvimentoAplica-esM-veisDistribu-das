# ☁️ Serverless CRUD SNS - Quick Start

## ⚡ Execução Rápida (3 Terminais)

### Terminal 1: LocalStack
```bash
cd serverless-crud-sns
docker-compose up -d
```

### Terminal 2: Subscriber SNS
```bash
cd serverless-crud-sns
start-subscriber.bat
```

### Terminal 3: Serverless Offline
```bash
cd serverless-crud-sns
serverless offline --stage local
```

---

## 📋 Comandos Completos

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar LocalStack
```bash
docker-compose up -d
```

### 3. Criar tabela DynamoDB
```bash
create-table.bat
```

### 4. Iniciar Subscriber (novo terminal)
```bash
start-subscriber.bat
```

### 5. Iniciar API (novo terminal)
```bash
serverless offline --stage local
```

### 6. Testar API
```bash
# Criar item
curl -X POST http://localhost:3001/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Arroz", "quantity": 2}'

# Listar itens
curl http://localhost:3001/items

# Buscar item
curl http://localhost:3001/items/{id}

# Atualizar item
curl -X PUT http://localhost:3001/items/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Arroz Integral"}'

# Deletar item
curl -X DELETE http://localhost:3001/items/{id}
```

---

## 🌐 URLs Importantes

- **API:** http://localhost:3001
- **LocalStack:** http://localhost:4566
- **Health Check:** http://localhost:4566/_localstack/health

---

## ✅ Verificar Funcionamento

### Ver notificações SNS
- Olhar no terminal do subscriber
- Deve aparecer quando criar ou atualizar item

### Ver dados no DynamoDB
```bash
aws --endpoint-url=http://localhost:4566 dynamodb scan --table-name local-items
```

### Ver tópico SNS
```bash
aws --endpoint-url=http://localhost:4566 sns list-topics
```

---

## 🐛 Troubleshooting

### LocalStack não inicia
```bash
docker-compose logs localstack
docker-compose restart localstack
```

### API não responde
- Verificar se serverless offline está rodando
- Verificar porta (pode ser 3001 ou 3000)

### Subscriber não recebe notificações
- Verificar se subscriber está rodando
- Verificar se tópico SNS foi criado

