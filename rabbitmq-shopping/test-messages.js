// Script de teste para enviar mensagens ao RabbitMQ
// Execute: node test-messages.js

const http = require('http');

const API_URL = 'http://localhost:3002';
const DELAY_BETWEEN_REQUESTS = 2000; // 2 segundos entre cada requisição

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisição HTTP
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Função para resetar listas
async function resetLists() {
  log('\n🔄 Resetando listas...', 'yellow');
  try {
    const response = await makeRequest('POST', '/lists/reset');
    if (response.status === 200) {
      log('✅ Listas resetadas com sucesso!', 'green');
      return true;
    }
  } catch (error) {
    log(`❌ Erro ao resetar listas: ${error.message}`, 'red');
    return false;
  }
}

// Função para fazer checkout de uma lista
async function checkoutList(listId) {
  try {
    log(`\n📦 Fazendo checkout da lista ${listId}...`, 'blue');
    const response = await makeRequest('POST', `/lists/${listId}/checkout`);
    
    if (response.status === 202) {
      log(`✅ Checkout iniciado para lista ${listId}`, 'green');
      log(`   Status: ${response.data.data.status}`, 'magenta');
      log(`   Lista ID: ${response.data.data.listId}`, 'magenta');
      return true;
    } else if (response.status === 400) {
      log(`⚠️  Lista ${listId} já foi finalizada`, 'yellow');
      return false;
    } else {
      log(`❌ Erro no checkout: ${response.data.error || 'Erro desconhecido'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erro ao fazer checkout: ${error.message}`, 'red');
    return false;
  }
}

// Função para listar todas as listas
async function listAllLists() {
  try {
    const response = await makeRequest('GET', '/lists');
    if (response.status === 200) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    log(`❌ Erro ao listar: ${error.message}`, 'red');
    return [];
  }
}

// Função principal de teste
async function runTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║     🧪 SCRIPT DE TESTE - RABBITMQ MESSAGING          ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');
  
  log('\n📋 Verificando listas disponíveis...', 'yellow');
  const lists = await listAllLists();
  
  if (lists.length === 0) {
    log('❌ Nenhuma lista encontrada!', 'red');
    return;
  }
  
  log(`✅ Encontradas ${lists.length} listas`, 'green');
  
  // Resetar todas as listas primeiro
  await resetLists();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  log('\n════════════════════════════════════════════════════════', 'blue');
  log('🚀 INICIANDO TESTES DE CHECKOUT', 'yellow');
  log('════════════════════════════════════════════════════════', 'blue');
  log(`\n⏱️  Delay entre requisições: ${DELAY_BETWEEN_REQUESTS}ms`, 'magenta');
  log('\n⚠️  IMPORTANTE: Para ver mensagens na fila:', 'yellow');
  log('   Pause os consumers primeiro:', 'yellow');
  log('   Windows: pausar-consumers.bat', 'blue');
  log('   Linux/Mac: ./pausar-consumers.sh', 'blue');
  log('   Ou: docker-compose stop notification-consumer analytics-consumer', 'blue');
  log('\n💡 Abra o RabbitMQ Management UI em: http://localhost:15672', 'magenta');
  log('   Usuário: admin | Senha: admin123', 'magenta');
  log('   Vá em: Queues > analytics_queue / notification_queue > Get messages', 'magenta');
  log('   Ou: Overview para ver estatísticas em tempo real', 'magenta');
  log('\n⏳ Aguardando 3 segundos antes de começar...\n', 'yellow');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Fazer checkout de todas as listas disponíveis
  const listIds = lists.map(l => l.id);
  let successCount = 0;
  
  for (let i = 0; i < listIds.length; i++) {
    const listId = listIds[i];
    const success = await checkoutList(listId);
    if (success) successCount++;
    
    // Aguardar antes da próxima requisição (exceto na última)
    if (i < listIds.length - 1) {
      log(`\n⏳ Aguardando ${DELAY_BETWEEN_REQUESTS}ms antes da próxima requisição...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
  }
  
  log('\n════════════════════════════════════════════════════════', 'blue');
  log('📊 RESUMO DOS TESTES', 'yellow');
  log('════════════════════════════════════════════════════════', 'blue');
  log(`✅ Checkouts realizados: ${successCount}/${listIds.length}`, 'green');
  log(`\n💡 Verifique as mensagens no RabbitMQ Management UI:`, 'magenta');
  log('   http://localhost:15672', 'magenta');
  log('\n📡 Onde verificar:', 'yellow');
  log('   1. Queues > analytics_queue > Get messages (se consumers pausados)', 'blue');
  log('   2. Queues > notification_queue > Get messages (se consumers pausados)', 'blue');
  log('   3. Overview > ver estatísticas de mensagens em tempo real', 'blue');
  log('   4. Exchanges > shopping_events > ver mensagens publicadas', 'blue');
  log('\n⚠️  Se não ver mensagens na fila:', 'yellow');
  log('   - Pause os consumers: pausar-consumers.bat (ou .sh)', 'blue');
  log('   - Execute este script novamente', 'blue');
  log('   - Depois retome: retomar-consumers.bat (ou .sh)', 'blue');
  log('\n✅ Teste concluído!\n', 'green');
}

// Executar testes
runTests().catch(error => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  process.exit(1);
});

