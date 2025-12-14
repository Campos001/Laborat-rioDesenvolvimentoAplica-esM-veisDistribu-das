const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
});

const sns = new AWS.SNS({
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
});

const TABLE_NAME = process.env.ITEMS_TABLE;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

/**
 * Valida os dados de entrada para criação de item
 */
function validateItem(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Nome é obrigatório e deve ser uma string não vazia');
  }

  if (data.quantity !== undefined) {
    if (typeof data.quantity !== 'number' || data.quantity < 1) {
      errors.push('Quantidade deve ser um número maior que zero');
    }
  }

  if (data.category && typeof data.category !== 'string') {
    errors.push('Categoria deve ser uma string');
  }

  return errors;
}

/**
 * Lambda handler para criar um novo item
 * POST /items
 */
exports.handler = async (event) => {
  console.log('📝 CREATE Item - Event:', JSON.stringify(event, null, 2));

  try {
    // Parse do body
    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (e) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Body inválido. Deve ser um JSON válido.',
        }),
      };
    }

    // Validação
    const validationErrors = validateItem(body);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          errors: validationErrors,
        }),
      };
    }

    // Criar item
    const item = {
      id: uuidv4(),
      name: body.name.trim(),
      quantity: body.quantity || 1,
      category: body.category || 'geral',
      purchased: body.purchased || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Salvar no DynamoDB
    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: item,
    }).promise();

    console.log('✅ Item criado no DynamoDB:', item.id);

    // Publicar notificação no SNS
    try {
      const snsMessage = {
        eventType: 'ITEM_CREATED',
        timestamp: new Date().toISOString(),
        item: item,
      };

      await sns.publish({
        TopicArn: SNS_TOPIC_ARN,
        Message: JSON.stringify(snsMessage),
        Subject: 'Novo Item Criado',
      }).promise();

      console.log('📢 Notificação SNS publicada:', item.id);
    } catch (snsError) {
      console.error('⚠️ Erro ao publicar no SNS (item ainda foi criado):', snsError);
      // Não falha a requisição se o SNS falhar
    }

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Item criado com sucesso',
        item: item,
      }),
    };

  } catch (error) {
    console.error('❌ Erro ao criar item:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
      }),
    };
  }
};

