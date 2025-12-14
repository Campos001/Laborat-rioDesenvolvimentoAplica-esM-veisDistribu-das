const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
});

const TABLE_NAME = process.env.ITEMS_TABLE;

/**
 * Lambda handler para buscar um item por ID
 * GET /items/{id}
 */
exports.handler = async (event) => {
  console.log('🔍 GET Item - Event:', JSON.stringify(event, null, 2));

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

    // Buscar item no DynamoDB
    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id: id },
    }).promise();

    if (!result.Item) {
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        item: result.Item,
      }),
    };

  } catch (error) {
    console.error('❌ Erro ao buscar item:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Erro ao buscar item',
        details: error.message,
      }),
    };
  }
};

