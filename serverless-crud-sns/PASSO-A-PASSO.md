# 🚀 Guia Passo a Passo - Como Rodar o Projeto

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- ✅ Node.js 18+ 
- ✅ Docker e Docker Compose
- ✅ AWS CLI (para comandos de validação)
- ✅ Serverless Framework globalmente: `npm install -g serverless`

## 🎯 Ordem de Execução

### **PASSO 1: Iniciar LocalStack**

O LocalStack simula os serviços AWS localmente.

```bash
cd serverless-crud-sns
docker-compose up -d
```

**Aguarde ~30 segundos** para o LocalStack inicializar completamente.

**Verificar se está rodando:**
```bash
curl http://localhost:4566/_localstack/health
```

Deve retornar JSON com serviços `available`.

---

### **PASSO 2: Instalar Dependências do Projeto**

```bash
npm install
```

---

### **PASSO 3: Criar Tabela DynamoDB**

O tópico SNS será criado automaticamente pelo subscriber. Apenas crie a tabela:

**Windows:**
```bash
create-table.bat
```

**Ou usando npm:**
```bash
npm run create-table
```

**Nota:** O subscriber cria o tópico SNS automaticamente quando iniciado.

---

### **PASSO 4: Iniciar o Serverless Offline**

Em um **terminal**, execute:

```bash
serverless offline --stage local
```

Você verá:
```
Server ready: http://localhost:3001 🚀
```

**Mantenha este terminal aberto!** O servidor precisa estar rodando.

---

### **PASSO 5: Iniciar o Subscriber SNS (Opcional mas Recomendado)**

Em um **NOVO terminal**, execute:

**Windows:**
```bash
start-subscriber.bat
```

**Linux/Mac:**
```bash
chmod +x start-subscriber.sh
./start-subscriber.sh
```

O subscriber irá:
- **Criar o tópico SNS automaticamente** (se não existir)
- Criar uma fila SQS
- Subscrever a fila no tópico SNS
- Mostrar notificações quando itens forem criados/atualizados

**Mantenha este terminal aberto também!**

---

### **PASSO 6: Testar a API**

Agora você pode testar os endpoints!

#### **6.1. Criar um Item (POST)**

**Windows CMD:**
```bash
curl -X POST http://localhost:3001/local/items ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Arroz\", \"quantity\": 2, \"category\": \"alimentos\"}"
```

**PowerShell:**
```powershell
.\test-post.ps1
```

**Ou use o script:**
```bash
test-post.bat
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Item criado com sucesso",
  "item": {
    "id": "abc123...",
    "name": "Arroz",
    "quantity": 2,
    "category": "alimentos",
    ...
  }
}
```

**✅ Verificar:** Se o subscriber estiver rodando, você verá a notificação no console!

#### **6.2. Listar Todos os Itens (GET)**

```bash
curl http://localhost:3001/local/items
```

#### **6.3. Buscar Item por ID (GET)**

```bash
# Substitua {id} pelo ID retornado ao criar
curl http://localhost:3001/local/items/{id}
```

#### **6.4. Atualizar Item (PUT)**

```bash
curl -X PUT http://localhost:3001/local/items/{id} ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Arroz Integral\", \"quantity\": 3}"
```

**✅ Verificar:** Notificação de atualização no subscriber!

#### **6.5. Deletar Item (DELETE)**

```bash
curl -X DELETE http://localhost:3001/local/items/{id}
```

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────┐
│  1. LocalStack (docker-compose up -d)   │
│     ✅ Porta 4566                       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. Setup LocalStack (setup-localstack) │
│     ✅ Tabela DynamoDB                  │
│     ✅ Tópico SNS                       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. Serverless Offline                  │
│     ✅ Porta 3001                       │
│     Terminal 1                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  4. Subscriber SNS (opcional)           │
│     ✅ Recebe notificações              │
│     Terminal 2                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  5. Testar API                          │
│     ✅ POST /items                      │
│     ✅ GET /items                       │
│     ✅ PUT /items/{id}                  │
│     ✅ DELETE /items/{id}               │
└─────────────────────────────────────────┘
```

---

## 🔍 Verificações Importantes

### ✅ Checklist Antes de Testar

- [ ] LocalStack está rodando (`docker ps | grep localstack`)
- [ ] Tabela DynamoDB foi criada (`create-table.bat` ou `npm run create-table`)
- [ ] Serverless offline está rodando (porta 3001)
- [ ] Subscriber está rodando (cria tópico SNS automaticamente)

---

## 🐛 Problemas Comuns

### Erro: "Cannot do operations on a non-existent table"
**Solução:** Execute `create-table.bat` ou `npm run create-table` para criar a tabela.

### Erro: "Port 3001 already in use"
**Solução:** Pare o processo na porta 3001 ou mude a porta no `serverless.yml`.

### Erro: "LocalStack não está rodando"
**Solução:** 
```bash
docker-compose down
docker-compose up -d
```

### Subscriber não recebe notificações
**Solução:** 
1. Verifique se o tópico SNS existe
2. Verifique se a fila SQS foi criada
3. Verifique os logs do subscriber

---

## 📝 Ordem de Parada

Quando terminar, pare na ordem inversa:

1. **Parar Subscriber:** `Ctrl+C` no terminal do subscriber
2. **Parar Serverless Offline:** `Ctrl+C` no terminal do serverless
3. **Parar LocalStack:**
   ```bash
   docker-compose down
   ```

---

## 🎓 Para Demonstração em Sala

### Roteiro Sugerido:

1. **Mostrar LocalStack rodando:**
   ```bash
   docker-compose ps
   curl http://localhost:4566/_localstack/health
   ```

2. **Mostrar recursos criados:**
   ```bash
   aws --endpoint-url=http://localhost:4566 dynamodb list-tables
   aws --endpoint-url=http://localhost:4566 sns list-topics
   ```

3. **Criar item via API:**
   ```bash
   curl -X POST http://localhost:3001/local/items ...
   ```

4. **Mostrar notificação no subscriber** (se estiver rodando)

5. **Verificar item no DynamoDB:**
   ```bash
   aws --endpoint-url=http://localhost:4566 dynamodb scan --table-name local-items
   ```

---

## ✅ Pronto!

Agora você tem tudo funcionando! 🎉

**Lembre-se:** Mantenha os terminais abertos enquanto estiver testando!

