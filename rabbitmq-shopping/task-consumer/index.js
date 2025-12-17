// task-consumer/index.js
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
const EXCHANGE_NAME = 'task_events';
const QUEUE_NAME = 'task_queue';
const ROUTING_KEY = 'task.*'; // task.create, task.update, task.delete

async function startConsumer() {
  try {
    console.log('📱 Iniciando Task Consumer (Mobile App)...');
    console.log('🐇 Conectando ao RabbitMQ...');
    
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Garantir que o exchange existe
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // Criar fila
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Fazer binding da fila ao exchange com routing key
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    console.log('✅ Task Consumer configurado!');
    console.log(`📡 Escutando fila: ${QUEUE_NAME}`);
    console.log(`🔑 Routing Key: ${ROUTING_KEY}`);
    console.log(`📨 Exchange: ${EXCHANGE_NAME}`);
    console.log('⏳ Aguardando mensagens do app Flutter...\n');

    // Prefetch: processar 1 mensagem por vez
    channel.prefetch(1);

    // Consumir mensagens
    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        
        console.log('═══════════════════════════════════════════════');
        console.log('📱 NOVA TAREFA RECEBIDA DO MOBILE APP');
        console.log('═══════════════════════════════════════════════');
        console.log('⏰ Timestamp:', content.timestamp);
        console.log('📋 Operação:', content.operation);
        console.log('📱 Source:', content.source);
        console.log('───────────────────────────────────────────────');
        
        // PROCESSAR TAREFA
        await processTask(content);
        
        console.log('───────────────────────────────────────────────');
        console.log('✅ Tarefa processada com sucesso!');
        console.log('═══════════════════════════════════════════════\n');

        // Confirmar processamento (ACK)
        channel.ack(msg);

      } catch (error) {
        console.error('❌ Erro ao processar tarefa:', error.message);
        console.error('📄 Conteúdo da mensagem:', msg.content.toString());
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

// Processar tarefa recebida do mobile
async function processTask(data) {
  console.log('🔄 PROCESSANDO TAREFA...');
  console.log(`   Task ID: ${data.task.id}`);
  console.log(`   Título: ${data.task.title}`);
  console.log(`   Descrição: ${data.task.description || '(sem descrição)'}`);
  console.log(`   Completa: ${data.task.completed ? 'Sim' : 'Não'}`);
  console.log(`   Sincronizada: ${data.task.synced ? 'Sim' : 'Não'}`);
  console.log('');

  // Simular processamento baseado na operação
  switch (data.operation) {
    case 'CREATE':
      console.log('✨ Criando nova tarefa no servidor...');
      // Aqui você salvaria no banco de dados
      await simulateDatabaseOperation('CREATE', data.task);
      break;
      
    case 'UPDATE':
      console.log('✏️  Atualizando tarefa no servidor...');
      // Aqui você atualizaria no banco de dados
      await simulateDatabaseOperation('UPDATE', data.task);
      break;
      
    case 'DELETE':
      console.log('🗑️  Deletando tarefa no servidor...');
      // Aqui você deletaria do banco de dados
      await simulateDatabaseOperation('DELETE', data.task);
      break;
      
    default:
      console.log(`⚠️  Operação desconhecida: ${data.operation}`);
  }

  // Simular delay de processamento (200ms)
  await new Promise(resolve => setTimeout(resolve, 200));
  
  console.log('💾 Tarefa salva/atualizada no servidor!');
}

// Simular operação no banco de dados
async function simulateDatabaseOperation(operation, task) {
  // Aqui você faria a operação real no banco de dados
  // Exemplo: await database.save(task) ou await database.update(task)
  
  console.log(`   [SIMULADO] ${operation} task ${task.id} no banco de dados`);
  console.log(`   [SIMULADO] Título: "${task.title}"`);
  
  // Simular delay de banco (100ms)
  await new Promise(resolve => setTimeout(resolve, 100));
}

// Tratamento de shutdown gracioso
process.on('SIGINT', () => {
  console.log('\n⏹️  Encerrando Task Consumer...');
  process.exit(0);
});

// Iniciar consumer
startConsumer().catch(console.error);

