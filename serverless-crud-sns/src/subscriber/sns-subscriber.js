const AWS = require('aws-sdk');

// Configuração para LocalStack - usar credenciais dummy
const localstackEndpoint = process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566';
const region = process.env.AWS_REGION || 'us-east-1';

const sns = new AWS.SNS({
  endpoint: localstackEndpoint,
  region: region,
  accessKeyId: 'test',
  secretAccessKey: 'test',
  s3ForcePathStyle: true,
});

const sqs = new AWS.SQS({
  endpoint: localstackEndpoint,
  region: region,
  accessKeyId: 'test',
  secretAccessKey: 'test',
  s3ForcePathStyle: true,
});

const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || 'arn:aws:sns:us-east-1:000000000000:items-notifications';
const QUEUE_NAME = 'items-notifications-queue';

/**
 * Criar tópico SNS se não existir
 */
async function createTopicIfNotExists() {
  try {
    await sns.getTopicAttributes({ TopicArn: SNS_TOPIC_ARN }).promise();
    console.log('✅ Tópico SNS já existe');
  } catch (error) {
    if (error.code === 'NotFound') {
      console.log('📢 Criando tópico SNS...');
      await sns.createTopic({ Name: 'items-notifications' }).promise();
      console.log('✅ Tópico SNS criado');
    } else {
      throw error;
    }
  }
}

/**
 * Subscriber SNS - Recebe notificações do tópico SNS
 * 
 * Este subscriber:
 * 1. Cria o tópico SNS (se não existir)
 * 2. Cria uma fila SQS
 * 3. Subscreve a fila no tópico SNS
 * 4. Processa mensagens recebidas
 */
async function setupSubscriber() {
  try {
    console.log('🔔 Configurando subscriber SNS...');

    // 0. Criar tópico SNS se não existir
    await createTopicIfNotExists();

    // 1. Criar fila SQS
    const queueUrl = await createQueue();
    console.log('✅ Fila SQS criada:', queueUrl);

    // 2. Obter ARN da fila
    const queueAttributes = await sqs.getQueueAttributes({
      QueueUrl: queueUrl,
      AttributeNames: ['QueueArn'],
    }).promise();

    const queueArn = queueAttributes.Attributes.QueueArn;
    console.log('✅ ARN da fila:', queueArn);

    // 3. Subscrever a fila no tópico SNS
    await sns.subscribe({
      TopicArn: SNS_TOPIC_ARN,
      Protocol: 'sqs',
      Endpoint: queueArn,
    }).promise();

    console.log('✅ Fila subscrita no tópico SNS');

    // 4. Configurar política da fila para receber mensagens do SNS
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { Service: 'sns.amazonaws.com' },
          Action: 'sqs:SendMessage',
          Resource: queueArn,
          Condition: {
            ArnEquals: {
              'aws:SourceArn': SNS_TOPIC_ARN,
            },
          },
        },
      ],
    };

    await sqs.setQueueAttributes({
      QueueUrl: queueUrl,
      Attributes: {
        Policy: JSON.stringify(policy),
      },
    }).promise();

    console.log('✅ Política da fila configurada');

    return queueUrl;
  } catch (error) {
    console.error('❌ Erro ao configurar subscriber:', error);
    throw error;
  }
}

/**
 * Cria uma fila SQS
 */
async function createQueue() {
  try {
    const result = await sqs.createQueue({
      QueueName: QUEUE_NAME,
    }).promise();
    return result.QueueUrl;
  } catch (error) {
    if (error.code === 'QueueAlreadyExists') {
      // Fila já existe, buscar URL
      const result = await sqs.getQueueUrl({
        QueueName: QUEUE_NAME,
      }).promise();
      return result.QueueUrl;
    }
    throw error;
  }
}

/**
 * Processa mensagens da fila SQS
 */
async function processMessages(queueUrl) {
  console.log('📨 Iniciando processamento de mensagens...');

  while (true) {
    try {
      // Receber mensagens da fila
      const result = await sqs.receiveMessage({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20, // Long polling
      }).promise();

      if (result.Messages && result.Messages.length > 0) {
        for (const message of result.Messages) {
          try {
            // Parse da mensagem SNS
            const snsMessage = JSON.parse(message.Body);
            const notification = JSON.parse(snsMessage.Message);

            // Processar notificação
            await handleNotification(notification);

            // Deletar mensagem da fila após processar
            await sqs.deleteMessage({
              QueueUrl: queueUrl,
              ReceiptHandle: message.ReceiptHandle,
            }).promise();

            console.log('✅ Mensagem processada e removida da fila');
          } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao receber mensagens:', error);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Aguardar antes de tentar novamente
    }
  }
}

/**
 * Processa uma notificação recebida
 */
async function handleNotification(notification) {
  console.log('\n📬 Nova notificação recebida:');
  console.log('   Tipo:', notification.eventType);
  console.log('   Timestamp:', notification.timestamp);

  switch (notification.eventType) {
    case 'ITEM_CREATED':
      console.log('   ✅ Novo item criado:', notification.item.id);
      console.log('   Nome:', notification.item.name);
      console.log('   Quantidade:', notification.item.quantity);
      // Aqui você pode adicionar lógica adicional, como:
      // - Enviar email
      // - Atualizar cache
      // - Registrar em log de auditoria
      break;

    case 'ITEM_UPDATED':
      console.log('   ✏️ Item atualizado:', notification.item.id);
      console.log('   Nome:', notification.item.name);
      if (notification.previousItem) {
        console.log('   Alterações detectadas');
      }
      // Lógica adicional para atualizações
      break;

    default:
      console.log('   ⚠️ Tipo de evento desconhecido:', notification.eventType);
  }

  console.log('   📋 Dados completos:', JSON.stringify(notification, null, 2));
}

/**
 * Inicializa o subscriber
 */
async function start() {
  try {
    console.log('🚀 Iniciando SNS Subscriber...');
    const queueUrl = await setupSubscriber();
    console.log('✅ Subscriber configurado com sucesso!');
    console.log('📡 Aguardando notificações...\n');
    await processMessages(queueUrl);
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  start();
}

module.exports = { start, setupSubscriber, processMessages };

