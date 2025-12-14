const AWS = require('aws-sdk');

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
 * Valida os dados de entrada para atualização de item
 */
function validateUpdate(data) {
  const errors = [];

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Nome deve ser uma string não vazia');
    }
  }

  if (data.quantity !== undefined) {
    if (typeof data.quantity !== 'number' || data.quantity < 1) {
      errors.push('Quantidade deve ser um número maior que zero');
    }
  }

  if (data.category !== undefined && typeof data.category !== 'string') {
    errors.push('Categoria deve ser uma string');
  }

  if (data.purchased !== undefined && typeof data.purchased !== 'boolean') {
    errors.push('Purchased deve ser um boolean');
  }

  return errors;
}

/**
 * Lambda handler para atualizar um item
 * PUT /items/{id}
 */
exports.handler = async (event) => {
  console.log('✏️ UPDATE Item - Event:', JSON.stringify(event, null, 2));

  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'ID do item é obrigatório',
        }),
      };
    }

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
    const validationErrors = validateUpdate(body);
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

    // Buscar item existente
    const getResult = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id: id },
    }).promise();

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Item não encontrado',
        }),
      };
    }

    // Atualizar item (mesclar com dados existentes)
    const updatedItem = {
      ...getResult.Item,
      ...body,
      id: id, // Garantir que o ID não seja alterado
      updatedAt: new Date().toISOString(),
    };

    // Se name foi fornecido, trim
    if (updatedItem.name) {
      updatedItem.name = updatedItem.name.trim();
    }

    // Salvar no DynamoDB
    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: updatedItem,
    }).promise();

    console.log('✅ Item atualizado no DynamoDB:', id);

    // Publicar notificação no SNS
    try {
      const snsMessage = {
        eventType: 'ITEM_UPDATED',
        timestamp: new Date().toISOString(),
        item: updatedItem,
        previousItem: getResult.Item,
      };

      await sns.publish({
        TopicArn: SNS_TOPIC_ARN,
        Message: JSON.stringify(snsMessage),
        Subject: 'Item Atualizado',
      }).promise();

      console.log('📢 Notificação SNS publicada:', id);
    } catch (snsError) {
      console.error('⚠️ Erro ao publicar no SNS (item ainda foi atualizado):', snsError);
      // Não falha a requisição se o SNS falhar
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Item atualizado com sucesso',
        item: updatedItem,
      }),
    };

  } catch (error) {
    console.error('❌ Erro ao atualizar item:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Erro ao atualizar item',
        details: error.message,
      }),
    };
  }
};

