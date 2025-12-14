const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
});

const TABLE_NAME = process.env.ITEMS_TABLE;

/**
 * Lambda handler para listar todos os itens
 * GET /items
 */
exports.handler = async (event) => {
  console.log('📋 LIST Items - Event:', JSON.stringify(event, null, 2));

  try {
    // Buscar todos os itens
    const result = await dynamodb.scan({
      TableName: TABLE_NAME,
    }).promise();

    const items = result.Items || [];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        count: items.length,
        items: items,
      }),
    };

  } catch (error) {
    console.error('❌ Erro ao listar itens:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Erro ao buscar itens',
        details: error.message,
      }),
    };
  }
};

