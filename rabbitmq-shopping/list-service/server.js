// list-service/server.js
const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';

let channel = null;
let connection = null;

// Mock database
const lists = new Map([
  ['1', { id: '1', userId: 'user123', name: 'Compras Semanais', items: ['Arroz', 'Feijão', 'Macarrão'], total: 45.50, status: 'active' }],
  ['2', { id: '2', userId: 'user456', name: 'Feira do Mês', items: ['Frutas', 'Verduras'], total: 78.20, status: 'active' }]
]);

const users = new Map([
  ['user123', { id: 'user123', email: 'joao@email.com', name: 'João Silva' }],
  ['user456', { id: 'user456', email: 'maria@email.com', name: 'Maria Santos' }]
]);

// Configuração do RabbitMQ
async function setupRabbitMQ() {
  try {
    console.log('🐇 Conectando ao RabbitMQ...');
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Criar exchange do tipo 'topic'
    const EXCHANGE_NAME = 'shopping_events';
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    console.log('✅ RabbitMQ configurado com sucesso!');
    console.log(`📡 Exchange: ${EXCHANGE_NAME} (type: topic)`);
    
    // Lidar com fechamento de conexão
    connection.on('close', () => {
      console.error('❌ Conexão com RabbitMQ fechada. Tentando reconectar...');
      setTimeout(setupRabbitMQ, 5000);
    });

    connection.on('error', (err) => {
      console.error('❌ Erro na conexão RabbitMQ:', err.message);
    });

  } catch (error) {
    console.error('❌ Erro ao conectar RabbitMQ:', error.message);
    setTimeout(setupRabbitMQ, 5000);
  }
}

// Publicar mensagem no RabbitMQ
async function publishCheckoutEvent(listData, userData) {
  if (!channel) {
    throw new Error('Canal RabbitMQ não está disponível');
  }

  const EXCHANGE_NAME = 'shopping_events';
  const ROUTING_KEY = 'list.checkout.completed';

  const message = {
    eventType: 'CHECKOUT_COMPLETED',
    timestamp: new Date().toISOString(),
    listId: listData.id,
    userId: listData.userId,
    userEmail: userData.email,
    userName: userData.name,
    listName: listData.name,
    items: listData.items,
    totalAmount: listData.total,
    itemCount: listData.items.length
  };

  const messageBuffer = Buffer.from(JSON.stringify(message));

  channel.publish(
    EXCHANGE_NAME,
    ROUTING_KEY,
    messageBuffer,
    { persistent: true, contentType: 'application/json' }
  );

  console.log(`📤 Mensagem publicada [${ROUTING_KEY}]:`, {
    listId: message.listId,
    userEmail: message.userEmail,
    total: message.totalAmount
  });

  return message;
}

// ========== ROTAS ==========

// GET /lists - Listar todas as listas
app.get('/lists', (req, res) => {
  const allLists = Array.from(lists.values());
  res.json({ success: true, data: allLists });
});

// GET /lists/:id - Obter detalhes de uma lista
app.get('/lists/:id', (req, res) => {
  const list = lists.get(req.params.id);
  
  if (!list) {
    return res.status(404).json({ success: false, error: 'Lista não encontrada' });
  }

  res.json({ success: true, data: list });
});

// POST /lists/:id/checkout - Finalizar compra (EVENTO ASSÍNCRONO)
app.post('/lists/:id/checkout', async (req, res) => {
  const { id } = req.params;
  const list = lists.get(id);

  if (!list) {
    return res.status(404).json({ success: false, error: 'Lista não encontrada' });
  }

  if (list.status === 'completed') {
    return res.status(400).json({ success: false, error: 'Lista já foi finalizada' });
  }

  try {
    // Buscar dados do usuário
    const user = users.get(list.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    // Publicar evento no RabbitMQ (operação assíncrona)
    await publishCheckoutEvent(list, user);

    // Atualizar status da lista
    list.status = 'completed';
    list.completedAt = new Date().toISOString();

    // Retornar resposta imediata (202 Accepted)
    res.status(202).json({
      success: true,
      message: 'Checkout iniciado. Processamento em andamento.',
      data: {
        listId: list.id,
        status: 'processing',
        acceptedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro no checkout:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar checkout'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'list-service',
    status: 'healthy',
    rabbitmq: channel ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Inicializar servidor
async function start() {
  await setupRabbitMQ();
  
  app.listen(PORT, () => {
    console.log(`🚀 List Service rodando na porta ${PORT}`);
    console.log(`📍 Endpoints disponíveis:`);
    console.log(`   GET  http://localhost:${PORT}/lists`);
    console.log(`   GET  http://localhost:${PORT}/lists/:id`);
    console.log(`   POST http://localhost:${PORT}/lists/:id/checkout`);
    console.log(`   GET  http://localhost:${PORT}/health`);
  });
}

// Tratamento de shutdown gracioso
process.on('SIGINT', async () => {
  console.log('\n⏹️  Encerrando List Service...');
  if (channel) await channel.close();
  if (connection) await connection.close();
  process.exit(0);
});

start().catch(console.error);