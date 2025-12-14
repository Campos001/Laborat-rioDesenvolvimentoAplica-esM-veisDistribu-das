# 🚀 Guia Rápido de Início

## Passo a Passo Rápido

### 1. Instalar Serverless Framework Globalmente
```bash
npm install -g serverless
```

### 2. Instalar Dependências
```bash
cd serverless-crud-sns
npm install
```

### 3. Iniciar LocalStack
```bash
docker-compose up -d
```

Aguarde ~30 segundos para o LocalStack inicializar.

### 4. Criar Tabela DynamoDB
```bash
# Windows
create-table.bat

# Ou usando npm
npm run create-table
```

### 5. Iniciar Serverless Offline
```bash
serverless offline --stage local
```
API estará em: `http://localhost:3001`

### 6. Iniciar Subscriber (em novo terminal)
```bash
# Windows
start-subscriber.bat

# Linux/Mac
chmod +x start-subscriber.sh
./start-subscriber.sh
```

**Nota:** O subscriber cria o tópico SNS automaticamente!

### 7. Testar
```bash
# Criar item
curl -X POST http://localhost:3001/local/items \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Teste\", \"quantity\": 1}"

# Ver notificação no subscriber (deve aparecer no console)

# Listar itens
curl http://localhost:3001/local/items
```

## ⚠️ Problemas Comuns

### Erro: "serverless: command not found"
```bash
npm install -g serverless
```

### Erro: "Cannot connect to LocalStack"
```bash
# Verificar se está rodando
docker ps | grep localstack

# Se não estiver, iniciar
docker-compose up -d
```

### Erro: "Cannot do operations on a non-existent table"
```bash
# Criar tabela
create-table.bat
# ou
npm run create-table
```

### Erro: "Port 3001 already in use"
Pare o processo na porta 3001 ou mude a porta no `serverless.yml`.

### API não responde
Verifique se o serverless offline está rodando:
```bash
serverless offline --stage local
```

## 📝 Próximos Passos

1. Leia o `README.md` completo para mais detalhes
2. Teste todos os endpoints CRUD
3. Verifique as notificações SNS no subscriber
4. Valide no DynamoDB usando AWS CLI

