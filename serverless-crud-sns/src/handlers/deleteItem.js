const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
});

const TABLE_NAME = process.env.ITEMS_TABLE;

/**
 * Lambda handler para deletar um item
 * DELETE /items/{id}
 */
exports.handler = async (event) => {
  console.log('🗑️ DELETE Item - Event:', JSON.stringify(event, null, 2));

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

    // Verificar se o item existe
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

    // Deletar item
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { id: id },
    }).promise();

    console.log('✅ Item deletado do DynamoDB:', id);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Item deletado com sucesso',
        deletedItem: getResult.Item,
      }),
    };

  } catch (error) {
    console.error('❌ Erro ao deletar item:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Erro ao deletar item',
        details: error.message,
      }),
    };
  }
};

