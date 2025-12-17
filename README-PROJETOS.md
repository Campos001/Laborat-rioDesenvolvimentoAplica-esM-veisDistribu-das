# 📚 Guia Rápido - Todos os Projetos

## 🎯 Projetos Disponíveis

1. **🐇 RabbitMQ - Mensageria** (15 pontos)
2. **☁️ Serverless CRUD SNS** (31 pontos)
3. **📱 Flutter Application 1** - Roteiro 06 (SQLite)

---

## 🐇 1. RabbitMQ - Mensageria

**Localização:** `rabbitmq-shopping/`

**Quick Start:** [README-QUICK-START.md](rabbitmq-shopping/README-QUICK-START.md)

### ⚡ Execução Rápida (2 Passos)

#### Passo 1: Mostrar Mensagem na Fila
```bash
cd rabbitmq-shopping
docker-compose up -d
pausar-consumers.bat
curl -X POST http://localhost:3002/lists/reset
curl -X POST http://localhost:3002/lists/1/checkout
# Ver em: http://localhost:15672 (Queues > Get messages)
```

#### Passo 2: Consumir Mensagem
```bash
retomar-consumers.bat
docker logs -f notification_consumer
```

**URLs:**
- RabbitMQ Management: http://localhost:15672 (admin/admin123)
- API: http://localhost:3002

---

## ☁️ 2. Serverless CRUD SNS

**Localização:** `serverless-crud-sns/`

**Quick Start:** [README-QUICK-START.md](serverless-crud-sns/README-QUICK-START.md)

### ⚡ Execução Rápida (3 Terminais)

**Terminal 1:**
```bash
cd serverless-crud-sns
docker-compose up -d
```

**Terminal 2:**
```bash
cd serverless-crud-sns
start-subscriber.bat
```

**Terminal 3:**
```bash
cd serverless-crud-sns
serverless offline --stage local
```

**URLs:**
- API: http://localhost:3001
- LocalStack: http://localhost:4566

---

## 📱 3. Flutter Application 1 - Roteiro 06

**Localização:** `Flutter/flutter_application_1/`

### ⚡ Execução Rápida
```bash
cd Flutter/flutter_application_1
flutter pub get
flutter run
```

**Funcionalidades:**
- CRUD completo de tarefas
- Persistência local com SQLite
- Filtro por status
- Contador de tarefas
- Campo de prioridade

---

## 📋 Guias Completos

- **Guia de Apresentação Completo:** [GUIA-APRESENTACAO-COMPLETA.md](GUIA-APRESENTACAO-COMPLETA.md)
- **Comandos Rápidos:** [comandos-rapidos.md](comandos-rapidos.md)

---

## 🚀 Preparar Tudo para Apresentação

```bash
# Executar script de preparação
preparar-apresentacao.bat
```

---

## 📝 Entregáveis

### RabbitMQ
- ✅ Código-fonte no Git
- ✅ Docker Compose configurado
- ✅ Producer e Consumers implementados
- ✅ README com instruções

### Serverless CRUD SNS
- ✅ Código-fonte no Git
- ✅ serverless.yml configurado
- ✅ Funções Lambda CRUD
- ✅ Tópico SNS e subscriber
- ✅ README com instruções
- ✅ Evidências de testes

---

**Boa apresentação! 🎓**

