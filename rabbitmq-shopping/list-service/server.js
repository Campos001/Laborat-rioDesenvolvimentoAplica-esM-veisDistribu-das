// list-service/server.js
const express = require('express');
const amqp = require('amqplib');
const AWS = require('aws-sdk');

const app = express();
app.use(express.json({ limit: '10mb' })); // Aumentar limite para imagens base64

const PORT = process.env.PORT || 3002;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
const LOCALSTACK_ENDPOINT = process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566';
const S3_BUCKET = process.env.S3_BUCKET || 'shopping-images';

// Configuração do S3 com LocalStack
const s3 = new AWS.S3({
  endpoint: LOCALSTACK_ENDPOINT,
  region: 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
  s3ForcePathStyle: true, // Necessário para LocalStack
  signatureVersion: 'v4'
});

// Função para garantir que o bucket existe
async function ensureBucketExists() {
  try {
    await s3.headBucket({ Bucket: S3_BUCKET }).promise();
    console.log(`✅ Bucket ${S3_BUCKET} já existe`);
  } catch (error) {
    if (error.statusCode === 404) {
      try {
        await s3.createBucket({ Bucket: S3_BUCKET }).promise();
        console.log(`✅ Bucket ${S3_BUCKET} criado com sucesso`);
      } catch (createError) {
        console.error(`❌ Erro ao criar bucket: ${createError.message}`);
      }
    } else {
      console.error(`❌ Erro ao verificar bucket: ${error.message}`);
    }
  }
}

let channel = null;
let connection = null;

// Mock database - dados iniciais
const initialLists = [
  ['1', { id: '1', userId: 'user123', name: 'Compras Semanais', items: ['Arroz', 'Feijão', 'Macarrão'], total: 45.50, status: 'active' }],
  ['2', { id: '2', userId: 'user456', name: 'Feira do Mês', items: ['Frutas', 'Verduras'], total: 78.20, status: 'active' }],
  ['3', { id: '3', userId: 'user123', name: 'Carnes e Aves', items: ['Frango', 'Carne Moída', 'Peixe'], total: 125.90, status: 'active' }],
  ['4', { id: '4', userId: 'user789', name: 'Limpeza', items: ['Detergente', 'Sabão', 'Água Sanitária'], total: 32.50, status: 'active' }],
  ['5', { id: '5', userId: 'user456', name: 'Padaria', items: ['Pão', 'Leite', 'Manteiga', 'Queijo'], total: 28.75, status: 'active' }]
];

const lists = new Map(initialLists);

const users = new Map([
  ['user123', { id: 'user123', email: 'joao@email.com', name: 'João Silva' }],
  ['user456', { id: 'user456', email: 'maria@email.com', name: 'Maria Santos' }],
  ['user789', { id: 'user789', email: 'pedro@email.com', name: 'Pedro Costa' }]
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

// POST /lists/reset - Resetar todas as listas para status 'active' (para testes)
app.post('/lists/reset', (req, res) => {
  // Resetar todas as listas para active
  lists.forEach((list) => {
    list.status = 'active';
    delete list.completedAt;
  });
  
  res.json({
    success: true,
    message: 'Todas as listas foram resetadas para status active',
    totalLists: lists.size
  });
});

// POST /upload - Upload de imagem para S3 LocalStack
app.post('/upload', async (req, res) => {
  try {
    const { imageBase64, fileName, itemId } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Imagem em Base64 é obrigatória'
      });
    }

    // Remover prefixo data:image se existir
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Gerar nome único do arquivo
    const timestamp = Date.now();
    const fileExtension = fileName?.split('.').pop() || 'jpg';
    const key = itemId 
      ? `items/${itemId}/${timestamp}.${fileExtension}`
      : `items/${timestamp}.${fileExtension}`;

    // Upload para S3 LocalStack
    const uploadParams = {
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    await s3.putObject(uploadParams).promise();

    // URL da imagem no LocalStack
    const imageUrl = `${LOCALSTACK_ENDPOINT}/${S3_BUCKET}/${key}`;

    console.log(`📸 Imagem enviada: ${key}`);

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      data: {
        imageUrl: imageUrl,
        key: key,
        bucket: S3_BUCKET
      }
    });

  } catch (error) {
    console.error('❌ Erro no upload:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload da imagem',
      details: error.message
    });
  }
});

// GET /images/:key - Obter imagem do S3 (opcional)
app.get('/images/:key(*)', async (req, res) => {
  try {
    const key = req.params.key;
    const params = {
      Bucket: S3_BUCKET,
      Key: key
    };

    const data = await s3.getObject(params).promise();
    res.setHeader('Content-Type', data.ContentType || 'image/jpeg');
    res.send(data.Body);

  } catch (error) {
    console.error('❌ Erro ao buscar imagem:', error.message);
    res.status(404).json({
      success: false,
      error: 'Imagem não encontrada'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'list-service',
    status: 'healthy',
    rabbitmq: channel ? 'connected' : 'disconnected',
    s3: {
      endpoint: LOCALSTACK_ENDPOINT,
      bucket: S3_BUCKET
    },
    timestamp: new Date().toISOString()
  });
});

// Inicializar servidor
async function start() {
  await setupRabbitMQ();
  await ensureBucketExists();
  
  app.listen(PORT, () => {
    console.log(`🚀 List Service rodando na porta ${PORT}`);
    console.log(`📍 Endpoints disponíveis:`);
    console.log(`   GET  http://localhost:${PORT}/lists`);
    console.log(`   GET  http://localhost:${PORT}/lists/:id`);
    console.log(`   POST http://localhost:${PORT}/lists/:id/checkout`);
    console.log(`   POST http://localhost:${PORT}/upload`);
    console.log(`   GET  http://localhost:${PORT}/images/:key`);
    console.log(`   GET  http://localhost:${PORT}/health`);
    console.log(`📦 S3 LocalStack: ${LOCALSTACK_ENDPOINT}`);
    console.log(`🪣 Bucket: ${S3_BUCKET}`);
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