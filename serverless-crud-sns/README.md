# 📋 Etapa 3 - Opção A: CRUD Serverless com Notificações SNS

## 📊 Descrição

Sistema CRUD completo utilizando arquitetura serverless com:
- **AWS Lambda** para lógica de negócio
- **API Gateway** para exposição REST
- **DynamoDB** para persistência
- **Amazon SNS** para notificações
- **LocalStack** para simulação local dos serviços AWS

## 🛠️ Stack Tecnológica

| Tecnologia | Descrição |
|------------|-----------|
| Serverless Framework | Framework para deploy de aplicações serverless |
| LocalStack | Emulador local dos serviços AWS |
| AWS Lambda | Funções serverless para lógica de negócio |
| API Gateway | Exposição dos endpoints REST |
| DynamoDB | Banco de dados NoSQL para persistência |
| Amazon SNS | Serviço de notificações em tópico |
| Node.js | Runtime das funções Lambda |

## 📁 Estrutura do Projeto

```
serverless-crud-sns/
├── src/
│   ├── handlers/
│   │   ├── createItem.js      # POST /items
│   │   ├── listItems.js       # GET /items
│   │   ├── getItem.js         # GET /items/{id}
│   │   ├── updateItem.js      # PUT /items/{id}
│   │   └── deleteItem.js      # DELETE /items/{id}
│   └── subscriber/
│       └── sns-subscriber.js   # Subscriber SNS
├── docker-compose.yml          # LocalStack
├── serverless.yml              # Configuração Serverless
├── package.json                # Dependências
├── test-api.sh                # Script de testes (Linux/Mac)
├── test-api.bat               # Script de testes (Windows)
├── start-subscriber.sh        # Iniciar subscriber (Linux/Mac)
└── start-subscriber.bat       # Iniciar subscriber (Windows)
```

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** 18+ instalado
- **Docker** e **Docker Compose** instalados
- **Serverless Framework** instalado globalmente:
  ```bash
  npm install -g serverless
  ```
- **AWS CLI** instalado (opcional, para validação)

### 1. Instalar Dependências

```bash
cd serverless-crud-sns
npm install
```

### 2. Iniciar LocalStack

```bash
docker-compose up -d
```

Aguarde alguns segundos para o LocalStack inicializar completamente. Verifique os logs:

```bash
docker-compose logs -f localstack
```

O LocalStack estará disponível em: `http://localhost:4566`

### 3. Criar Tabela DynamoDB

```bash
# Windows
create-table.bat

# Ou usando npm
npm run create-table
```

**Nota:** O tópico SNS será criado automaticamente pelo subscriber.

### 4. Iniciar o Subscriber SNS

Em um **novo terminal**, execute:

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
- Processar notificações recebidas

### 5. Iniciar Serverless Offline

Em um **novo terminal**, execute:

```bash
serverless offline --stage local
```

A API estará disponível em: `http://localhost:3001`

**Usando script de teste:**

**Windows:**
```bash
test-api.bat
```

**Linux/Mac:**
```bash
chmod +x test-api.sh
./test-api.sh
```

**Ou manualmente com curl:**

```bash
# 1. Criar item
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arroz",
    "quantity": 2,
    "category": "alimentos"
  }'

# 2. Listar itens
curl -X GET http://localhost:3000/items

# 3. Buscar item por ID (substitua {id})
curl -X GET http://localhost:3000/items/{id}

# 4. Atualizar item
curl -X PUT http://localhost:3000/items/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arroz Integral",
    "quantity": 3
  }'

# 5. Deletar item
curl -X DELETE http://localhost:3000/items/{id}
```

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/items` | Criar novo item + notificação SNS |
| GET | `/items` | Listar todos os itens |
| GET | `/items/{id}` | Buscar item por ID |
| PUT | `/items/{id}` | Atualizar item existente + notificação SNS |
| DELETE | `/items/{id}` | Remover item |

### Exemplos de Requisições

#### POST /items
```json
{
  "name": "Feijão",
  "quantity": 1,
  "category": "alimentos",
  "purchased": false
}
```

#### PUT /items/{id}
```json
{
  "name": "Feijão Preto",
  "quantity": 2,
  "purchased": true
}
```

## 🔔 Notificações SNS

### Eventos que Disparam Notificações

1. **ITEM_CREATED** - Quando um item é criado (POST /items)
2. **ITEM_UPDATED** - Quando um item é atualizado (PUT /items/{id})

### Estrutura da Notificação

```json
{
  "eventType": "ITEM_CREATED",
  "timestamp": "2025-01-XX...",
  "item": {
    "id": "uuid",
    "name": "Arroz",
    "quantity": 2,
    "category": "alimentos",
    "purchased": false,
    "createdAt": "2025-01-XX...",
    "updatedAt": "2025-01-XX..."
  }
}
```

### Verificar Notificações

O subscriber SNS processa as notificações automaticamente e exibe no console:

```
📬 Nova notificação recebida:
   Tipo: ITEM_CREATED
   Timestamp: 2025-01-XX...
   ✅ Novo item criado: abc123
   Nome: Arroz
   Quantidade: 2
```

## ✅ Validação de Dados

### Criação (POST /items)
- `name`: Obrigatório, string não vazia
- `quantity`: Opcional, número >= 1 (padrão: 1)
- `category`: Opcional, string (padrão: "geral")
- `purchased`: Opcional, boolean (padrão: false)

### Atualização (PUT /items/{id})
- Todos os campos são opcionais
- Apenas os campos fornecidos serão atualizados
- Validações aplicadas apenas aos campos fornecidos

## 🧪 Testes

### Teste Manual

1. **Criar item:**
   ```bash
   curl -X POST http://localhost:3000/items \
     -H "Content-Type: application/json" \
     -d '{"name": "Teste", "quantity": 1}'
   ```

2. **Verificar notificação no subscriber** (deve aparecer no console)

3. **Listar itens:**
   ```bash
   curl http://localhost:3000/items
   ```

4. **Atualizar item:**
   ```bash
   curl -X PUT http://localhost:3000/items/{id} \
     -H "Content-Type: application/json" \
     -d '{"name": "Teste Atualizado"}'
   ```

5. **Verificar nova notificação no subscriber**

6. **Deletar item:**
   ```bash
   curl -X DELETE http://localhost:3000/items/{id}
   ```

### Validar DynamoDB (se AWS CLI estiver instalado)

```bash
# Listar tabelas
aws --endpoint-url=http://localhost:4566 dynamodb list-tables

# Ver itens na tabela
aws --endpoint-url=http://localhost:4566 dynamodb scan \
  --table-name local-items
```

**Ou use o script Node.js:**
```bash
node -e "const AWS=require('aws-sdk'); const db=new AWS.DynamoDB.DocumentClient({endpoint:'http://localhost:4566',region:'us-east-1',accessKeyId:'test',secretAccessKey:'test'}); db.scan({TableName:'local-items'}).promise().then(r=>console.log(JSON.stringify(r.Items,null,2))).catch(e=>console.log('Erro:',e.message));"
```

## 📸 Roteiro de Demonstração (Sala de Aula)

### 1. Infraestrutura
```bash
docker-compose up
```
**Evidência:** Screenshot do LocalStack iniciando

### 2. Deploy
```bash
serverless deploy --stage local
```
**Evidência:** Screenshot do deploy concluído

### 3. Configuração
```bash
# Verificar tabela DynamoDB
aws --endpoint-url=http://localhost:4566 dynamodb list-tables

# Verificar tópico SNS
aws --endpoint-url=http://localhost:4566 sns list-topics
```
**Evidência:** Screenshot mostrando tabela e tópico criados

### 4. Ação - Criar Item
```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Produto Demo", "quantity": 1}'
```
**Evidência:** Screenshot da resposta da API

### 5. Validação - Notificação SNS
**Evidência:** Screenshot do subscriber mostrando a notificação recebida

### 6. Validação - DynamoDB
```bash
aws --endpoint-url=http://localhost:4566 dynamodb scan --table-name local-items
```
**Evidência:** Screenshot mostrando o item salvo no DynamoDB

## 🐛 Troubleshooting

### LocalStack não inicia
```bash
# Verificar logs
docker-compose logs localstack

# Reiniciar
docker-compose restart localstack
```

### Erro no deploy
```bash
# Verificar se LocalStack está rodando
curl http://localhost:4566/_localstack/health

# Limpar e tentar novamente
serverless remove --stage local
serverless deploy --stage local
```

### Subscriber não recebe notificações
- Verificar se o subscriber está rodando
- Verificar se o tópico SNS foi criado
- Verificar logs do subscriber
- Verificar se a fila SQS foi criada e subscrita

### API não responde
- Verificar se o serverless-offline está rodando
- Verificar porta 3000 (pode estar em outra porta)
- Verificar logs: `serverless logs -f createItem --stage local`

## 📝 Entregáveis

✅ 1. Código-fonte do projeto no repositório Git  
✅ 2. Arquivo serverless.yml com configuração completa  
✅ 3. Funções Lambda implementadas para cada operação CRUD  
✅ 4. Configuração do tópico SNS e subscriber  
✅ 5. README.md com instruções de execução  
✅ 6. Evidências de testes (screenshots ou logs)  

## 📚 Referências

- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [LocalStack Documentation](https://docs.localstack.cloud/)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [DynamoDB](https://docs.aws.amazon.com/dynamodb/)
- [Amazon SNS](https://docs.aws.amazon.com/sns/)

## 👥 Autores

Desenvolvido para a Etapa 3 do Laboratório de Desenvolvimento de Aplicações Móveis e Distribuídas - PUC Minas.

---

**Data de Entrega:** [Preencher]  
**Evidências:** Screenshots anexados na pasta `screenshots/`

