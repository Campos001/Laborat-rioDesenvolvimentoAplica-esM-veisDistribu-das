// Script para criar tabela DynamoDB no LocalStack
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
});

const TABLE_NAME = 'local-items';

async function createTable() {
  try {
    console.log('📦 Criando tabela DynamoDB...');
    
    const result = await dynamodb.createTable({
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }).promise();

    console.log('✅ Tabela criada com sucesso!');
    console.log('   Nome:', TABLE_NAME);
    console.log('   Status:', result.TableDescription.TableStatus);
    
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('ℹ️  Tabela já existe');
    } else {
      console.error('❌ Erro ao criar tabela:', error.message);
      process.exit(1);
    }
  }
}

createTable();

