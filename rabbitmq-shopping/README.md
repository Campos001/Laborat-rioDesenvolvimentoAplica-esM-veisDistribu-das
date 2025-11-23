# 🐇 Sistema de Mensageria com RabbitMQ

## 📋 Visão Geral

Sistema de microsserviços para Lista de Compras com processamento assíncrono de eventos usando RabbitMQ.

### 🏗️ Arquitetura

```
Cliente → List Service (Producer) → RabbitMQ → Consumers
                                      ↓
                        ┌─────────────┴──────────────┐
                        ↓                            ↓
              Notification Consumer        Analytics Consumer
```

## 🚀 Tecnologias

- **Node.js 18** - Runtime JavaScript
- **Express** - Framework web
- **RabbitMQ 3.12** - Message Broker
- **amqplib** - Cliente AMQP para Node.js
- **Docker & Docker Compose** - Containerização

## 📁 Estrutura do Projeto

```
rabbitmq-shopping/
├── docker-compose.yml
├── list-service/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── notification-consumer/
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
├── analytics-consumer/
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
└── demo.sh
```

## ⚙️ Instalação e Execução

### Pré-requisitos

- Docker e Docker Compose instalados
- Portas livres: 3002, 5672, 15672

### Passo a Passo

#### 1. Clone e Configure

```bash
# Criar estrutura de diretórios
mkdir -p rabbitmq-shopping/{list-service,notification-consumer,analytics-consumer}
cd rabbitmq-shopping

# Criar arquivos (copiar dos artifacts)
```

#### 2. Iniciar Serviços

```bash
# Subir todos os containers
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f
```

#### 3. Acessar RabbitMQ Management

Abra no navegador: **http://localhost:15672**

- **Usuário:** `admin`
- **Senha:** `admin123`

## 🎯 Demonstração em Sala de Aula

### Preparação (5 minutos)

```bash
# 1. Subir todos os serviços
docker-compose up -d

# 2. Aguardar 30 segundos
sleep 30

# 3. Verificar health
curl http://localhost:3002/health
```

### Roteiro da Demo

#### **MOMENTO 1: Mostrar RabbitMQ Zerado** 🟢

1. Abrir RabbitMQ Management UI
2. Navegar para **Queues** → Mostrar filas vazias
3. Ir em **Exchanges** → Mostrar exchange `shopping_events`

#### **MOMENTO 2: Disparar Checkout** 🚀

```bash
# Listar listas disponíveis
curl http://localhost:3002/lists

# Fazer checkout da lista #1
curl -X POST http://localhost:3002/lists/1/checkout

# Observar resposta 202 ACCEPTED (rápida!)
```

**Ponto de destaque:** ⚡ *"Vejam que a API respondeu imediatamente!"*

#### **MOMENTO 3: Evidências Visuais** 👀

##### Terminal do Notification Consumer:

```bash
docker logs -f notification_consumer
```

**Output esperado:**
```
═══════════════════════════════════════════════
📬 NOVA MENSAGEM RECEBIDA!
═══════════════════════════════════════════════
📧 ENVIANDO COMPROVANTE...
   Para: joao@email.com
   Lista: Compras Semanais (ID: 1)
✉️  EMAIL ENVIADO COM SUCESSO!
```

##### Terminal do Analytics Consumer:

```bash
docker logs -f analytics_consumer
```

**Output esperado:**
```
╔═══════════════════════════════════════════════╗
║           📊 DASHBOARD ATUALIZADO            ║
╠═══════════════════════════════════════════════╣
║ Total de Checkouts:                       1 ║
║ Receita Total:      R$                45.50 ║
```

#### **MOMENTO 4: RabbitMQ Management** 📊

1. Voltar ao navegador
2. Clicar em **Queues**
3. Mostrar:
   - ✅ Mensagem processada (acks)
   - 📈 Gráfico de taxa de mensagens
   - 🔢 Contadores de mensagens

#### **MOMENTO 5: Múltiplos Checkouts** 🔥

```bash
# Disparar vários checkouts
curl -X POST http://localhost:3002/lists/2/checkout
curl -X POST http://localhost:3002/lists/1/checkout

# Ver os logs em tempo real
docker-compose logs -f
```

## 🔧 Endpoints da API

### List Service (Port 3002)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/lists` | Lista todas as listas |
| GET | `/lists/:id` | Detalhes de uma lista |
| POST | `/lists/:id/checkout` | **Finaliza compra (assíncrono)** |
| GET | `/health` | Health check |

### Exemplo de Request

```bash
# Checkout
curl -X POST http://localhost:3002/lists/1/checkout \
  -H "Content-Type: application/json"

# Response (202 Accepted)
{
  "success": true,
  "message": "Checkout iniciado. Processamento em andamento.",
  "data": {
    "listId": "1",
    "status": "processing",
    "acceptedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

## 📊 Conceitos Técnicos Demonstrados

### 1. **Exchange Topic**
- Exchange: `shopping_events`
- Tipo: `topic`
- Routing Key: `list.checkout.completed`

### 2. **Pattern de Roteamento**
- Consumers usam: `list.checkout.#`
- Permite extensibilidade (ex: `list.checkout.cancelled`)

### 3. **Garantias de Entrega**
- **Persistent Messages**: Mensagens sobrevivem a restart
- **Durable Queues**: Filas persistem
- **Manual ACK**: Confirmação explícita

### 4. **Padrão Pub/Sub**
- 1 Producer → N Consumers
- Cada consumer processa independentemente
- Falha em um não afeta outros

## 🔍 Monitoramento

### Comandos Úteis

```bash
# Ver logs de um serviço específico
docker logs -f notification_consumer
docker logs -f analytics_consumer

# Ver todas as mensagens processadas
docker-compose logs | grep "MENSAGEM RECEBIDA"

# Reiniciar um consumer
docker-compose restart notification-consumer

# Ver estatísticas
curl http://localhost:15672/api/queues | jq '.'
```

### RabbitMQ Management UI

- **Overview**: Visão geral do cluster
- **Connections**: Conexões ativas
- **Channels**: Canais de comunicação
- **Exchanges**: Pontos de roteamento
- **Queues**: Filas e mensagens
- **Admin**: Gerenciar usuários e permissões

## 🧪 Testes

```bash
# Teste de carga: 10 checkouts seguidos
for i in {1..10}; do
  curl -X POST http://localhost:3002/lists/1/checkout
  echo "Checkout $i disparado"
  sleep 0.5
done

# Ver processamento em tempo real
docker-compose logs -f
```

## ⚠️ Troubleshooting

### RabbitMQ não conecta

```bash
# Verificar se está rodando
docker ps | grep rabbitmq

# Reiniciar RabbitMQ
docker-compose restart rabbitmq

# Ver logs
docker logs shopping_rabbitmq
```

### Consumer não processa mensagens

```bash
# Verificar se está rodando
docker ps

# Ver logs detalhados
docker logs notification_consumer -f

# Reiniciar consumer
docker-compose restart notification-consumer
```

### Limpar filas

Acesse RabbitMQ Management → Queues → Click na fila → **Purge Messages**

## 🛑 Parar e Limpar

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (limpa dados)
docker-compose down -v

# Remover tudo (incluindo imagens)
docker-compose down --rmi all -v
```

## 📚 Recursos Adicionais

### Documentação
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [AMQP Concepts](https://www.rabbitmq.com/tutorials/amqp-concepts.html)
- [amqplib Documentation](https://amqp-node.github.io/amqplib/)

### Conceitos Importantes

**Exchange Types:**
- **Direct**: Roteamento exato
- **Topic**: Pattern matching (`*` e `#`)
- **Fanout**: Broadcast para todas as filas
- **Headers**: Roteamento por headers

**Routing Keys:**
- `list.checkout.completed` - Checkout finalizado
- `list.checkout.#` - Todos os eventos de checkout
- `list.*` - Todos os eventos de lista

## 🎓 Pontos de Avaliação

✅ **Producer implementado** - List Service publica eventos  
✅ **Consumer A (Notification)** - Processa e loga notificações  
✅ **Consumer B (Analytics)** - Calcula estatísticas  
✅ **Exchange Topic** - Roteamento correto  
✅ **Response 202 Accepted** - API assíncrona  
✅ **Demonstração funcional** - Logs e RabbitMQ UI  
✅ **Docker Compose** - Orquestração completa  

## 👥 Contribuição

Este é um projeto educacional para demonstração de mensageria com RabbitMQ.

---

**Desenvolvido para a disciplina de Microsserviços** 🎓