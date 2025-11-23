// notification-consumer/index.js
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
const EXCHANGE_NAME = 'shopping_events';
const QUEUE_NAME = 'notification_queue';
const ROUTING_KEY = 'list.checkout.#';

async function startConsumer() {
  try {
    console.log('🔔 Iniciando Notification Consumer...');
    console.log('🐇 Conectando ao RabbitMQ...');
    
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Garantir que o exchange existe
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // Criar fila
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Fazer binding da fila ao exchange com routing key
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    console.log('✅ Notification Consumer configurado!');
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
        console.log('📬 NOVA MENSAGEM RECEBIDA!');
        console.log('═══════════════════════════════════════════════');
        console.log('⏰ Timestamp:', content.timestamp);
        console.log('📋 Evento:', content.eventType);
        console.log('───────────────────────────────────────────────');
        
        // SIMULAR ENVIO DE EMAIL/NOTIFICAÇÃO
        await simulateEmailSending(content);
        
        console.log('───────────────────────────────────────────────');
        console.log('✅ Mensagem processada com sucesso!');
        console.log('═══════════════════════════════════════════════\n');

        // Confirmar processamento (ACK)
        channel.ack(msg);

      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error.message);
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

// Simular envio de email
async function simulateEmailSending(data) {
  console.log('📧 ENVIANDO COMPROVANTE...');
  console.log(`   Para: ${data.userEmail}`);
  console.log(`   Nome: ${data.userName}`);
  console.log(`   Lista: ${data.listName} (ID: ${data.listId})`);
  console.log(`   Items: ${data.itemCount} itens`);
  console.log(`   Total: R$ ${data.totalAmount.toFixed(2)}`);
  console.log('');
  
  // Simular delay de envio de email (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('✉️  EMAIL ENVIADO COM SUCESSO!');
  console.log(`   "Enviando comprovante da lista [${data.listId}] para o usuário [${data.userEmail}]"`);
}

// Tratamento de shutdown gracioso
process.on('SIGINT', () => {
  console.log('\n⏹️  Encerrando Notification Consumer...');
  process.exit(0);
});

// Iniciar consumer
startConsumer().catch(console.error);