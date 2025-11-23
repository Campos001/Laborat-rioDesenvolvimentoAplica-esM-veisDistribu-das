// analytics-consumer/index.js
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
const EXCHANGE_NAME = 'shopping_events';
const QUEUE_NAME = 'analytics_queue';
const ROUTING_KEY = 'list.checkout.#';

// Mock "banco de dados" de analytics
const analyticsData = {
  totalCheckouts: 0,
  totalRevenue: 0,
  totalItems: 0,
  averageTicket: 0,
  checkoutsByUser: new Map()
};

async function startConsumer() {
  try {
    console.log('📊 Iniciando Analytics Consumer...');
    console.log('🐇 Conectando ao RabbitMQ...');
    
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Garantir que o exchange existe
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // Criar fila
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Fazer binding da fila ao exchange com routing key
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    console.log('✅ Analytics Consumer configurado!');
    console.log(`📡 Escutando fila: ${QUEUE_NAME}`);
    console.log(`🔑 Routing Key: ${ROUTING_KEY}`);
    console.log('⏳ Aguardando mensagens...\n');

    // Prefetch: processar 1 mensagem por vez
    channel.prefetch(1);

    // Consumir mensagens
    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        
        console.log('═══════════════════════════════════════════════');
        console.log('📊 PROCESSANDO ANALYTICS');
        console.log('═══════════════════════════════════════════════');
        console.log('⏰ Timestamp:', content.timestamp);
        console.log('📋 Evento:', content.eventType);
        console.log('───────────────────────────────────────────────');
        
        // PROCESSAR ESTATÍSTICAS
        await processAnalytics(content);
        
        console.log('───────────────────────────────────────────────');
        console.log('✅ Analytics atualizado!');
        console.log('═══════════════════════════════════════════════\n');

        // Confirmar processamento (ACK)
        channel.ack(msg);

      } catch (error) {
        console.error('❌ Erro ao processar analytics:', error.message);
        // Rejeitar e recolocar na fila
        channel.nack(msg, false, true);
      }
    });

    // Lidar com fechamento de conexão
    connection.on('close', () => {
      console.error('❌ Conexão fechada. Reconectando em 5s...');
      setTimeout(startConsumer, 5000);
    });

    connection.on('error', (err) => {
      console.error('❌ Erro na conexão:', err.message);
    });

  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    console.log('🔄 Tentando reconectar em 5s...');
    setTimeout(startConsumer, 5000);
  }
}

// Processar estatísticas
async function processAnalytics(data) {
  console.log('🔢 CALCULANDO ESTATÍSTICAS...');
  console.log(`   Lista ID: ${data.listId}`);
  console.log(`   Usuário: ${data.userName} (${data.userId})`);
  console.log(`   Valor: R$ ${data.totalAmount.toFixed(2)}`);
  console.log(`   Items: ${data.itemCount}`);
  console.log('');
  
  // Simular processamento (300ms)
  await new Promise(resolve => setTimeout(resolve, 300));

  // Atualizar estatísticas
  analyticsData.totalCheckouts++;
  analyticsData.totalRevenue += data.totalAmount;
  analyticsData.totalItems += data.itemCount;
  analyticsData.averageTicket = analyticsData.totalRevenue / analyticsData.totalCheckouts;

  // Atualizar por usuário
  const userStats = analyticsData.checkoutsByUser.get(data.userId) || {
    userId: data.userId,
    userName: data.userName,
    checkouts: 0,
    totalSpent: 0
  };
  
  userStats.checkouts++;
  userStats.totalSpent += data.totalAmount;
  analyticsData.checkoutsByUser.set(data.userId, userStats);

  // Exibir dashboard atualizado
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║           📊 DASHBOARD ATUALIZADO            ║');
  console.log('╠═══════════════════════════════════════════════╣');
  console.log(`║ Total de Checkouts: ${analyticsData.totalCheckouts.toString().padStart(22)} ║`);
  console.log(`║ Receita Total:      R$ ${analyticsData.totalRevenue.toFixed(2).padStart(20)} ║`);
  console.log(`║ Total de Items:     ${analyticsData.totalItems.toString().padStart(22)} ║`);
  console.log(`║ Ticket Médio:       R$ ${analyticsData.averageTicket.toFixed(2).padStart(20)} ║`);
  console.log('╠═══════════════════════════════════════════════╣');
  console.log('║           TOP USUÁRIOS                        ║');
  console.log('╠═══════════════════════════════════════════════╣');
  
  // Mostrar top 3 usuários
  const topUsers = Array.from(analyticsData.checkoutsByUser.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 3);

  topUsers.forEach((user, idx) => {
    const name = user.userName.padEnd(20).substring(0, 20);
    const spent = `R$ ${user.totalSpent.toFixed(2)}`.padStart(12);
    console.log(`║ ${idx + 1}. ${name} ${spent} ║`);
  });
  
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
  console.log('💾 Dashboard atualizado em tempo real!');
}

// Tratamento de shutdown gracioso
process.on('SIGINT', () => {
  console.log('\n⏹️  Encerrando Analytics Consumer...');
  console.log('\n📊 ESTATÍSTICAS FINAIS:');
  console.log(JSON.stringify(analyticsData, null, 2));
  process.exit(0);
});

// Iniciar consumer
startConsumer().catch(console.error);