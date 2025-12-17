# 📱 Integração Flutter com RabbitMQ

## 📋 Formato da Mensagem

O app Flutter deve enviar mensagens no seguinte formato JSON:

```json
{
  "operation": "CREATE|UPDATE|DELETE",
  "task": {
    "id": "uuid-da-tarefa",
    "title": "Título da tarefa",
    "description": "Descrição da tarefa",
    "completed": false,
    "synced": false,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "source": "mobile_app"
}
```

## 🔌 Configuração no Flutter

### 1. Adicionar Dependência

No `pubspec.yaml`:

```yaml
dependencies:
  amqp_client: ^2.0.0  # ou outra biblioteca AMQP para Flutter
```

### 2. Criar Serviço de Mensageria

Crie um arquivo `lib/services/rabbitmq_service.dart`:

```dart
import 'dart:convert';
import 'package:amqp_client/amqp_client.dart';

class RabbitMQService {
  static const String RABBITMQ_HOST = 'SEU_IP_LOCAL'; // IP do seu PC
  static const int RABBITMQ_PORT = 5672;
  static const String RABBITMQ_USER = 'admin';
  static const String RABBITMQ_PASS = 'admin123';
  static const String EXCHANGE_NAME = 'task_events';
  
  AmqpClient? _client;
  AmqpChannel? _channel;
  
  Future<void> connect() async {
    try {
      _client = AmqpClient(
        host: RABBITMQ_HOST,
        port: RABBITMQ_PORT,
        username: RABBITMQ_USER,
        password: RABBITMQ_PASS,
      );
      
      await _client!.connect();
      _channel = await _client!.channel();
      
      // Declarar exchange
      await _channel!.exchangeDeclare(
        EXCHANGE_NAME,
        ExchangeType.TOPIC,
        durable: true,
      );
      
      print('✅ Conectado ao RabbitMQ');
    } catch (e) {
      print('❌ Erro ao conectar: $e');
      rethrow;
    }
  }
  
  Future<void> publishTask({
    required String operation, // CREATE, UPDATE, DELETE
    required Map<String, dynamic> task,
  }) async {
    if (_channel == null) {
      await connect();
    }
    
    final message = {
      'operation': operation,
      'task': task,
      'timestamp': DateTime.now().toIso8601String(),
      'source': 'mobile_app',
    };
    
    // Determinar routing key baseado na operação
    String routingKey;
    switch (operation) {
      case 'CREATE':
        routingKey = 'task.create';
        break;
      case 'UPDATE':
        routingKey = 'task.update';
        break;
      case 'DELETE':
        routingKey = 'task.delete';
        break;
      default:
        routingKey = 'task.unknown';
    }
    
    await _channel!.basicPublish(
      EXCHANGE_NAME,
      routingKey,
      jsonEncode(message),
      properties: AmqpBasicProperties(
        deliveryMode: 2, // Persistent
        contentType: 'application/json',
      ),
    );
    
    print('📤 Mensagem enviada: $operation - ${task['id']}');
  }
  
  Future<void> disconnect() async {
    await _channel?.close();
    await _client?.close();
  }
}
```

### 3. Usar no Provider/Service

```dart
final rabbitmq = RabbitMQService();

// Criar tarefa
await rabbitmq.publishTask(
  operation: 'CREATE',
  task: {
    'id': task.id,
    'title': task.title,
    'description': task.description,
    'completed': task.completed,
    'synced': false,
    'createdAt': task.createdAt.toIso8601String(),
    'updatedAt': task.updatedAt.toIso8601String(),
  },
);

// Atualizar tarefa
await rabbitmq.publishTask(
  operation: 'UPDATE',
  task: {
    'id': task.id,
    'title': task.title,
    // ... outros campos
  },
);

// Deletar tarefa
await rabbitmq.publishTask(
  operation: 'DELETE',
  task: {
    'id': task.id,
    // ... outros campos necessários
  },
);
```

## 🌐 Configuração de Rede

### Para Android Emulator

Use o IP: `10.0.2.2` (localhost do PC)

```dart
static const String RABBITMQ_HOST = '10.0.2.2';
```

### Para Dispositivo Físico

Use o IP local do seu PC na mesma rede WiFi:

```dart
static const String RABBITMQ_HOST = '192.168.1.XXX'; // Seu IP local
```

**Descobrir seu IP:**
- Windows: `ipconfig` → IPv4 Address
- Linux/Mac: `ifconfig` ou `ip addr`

## ✅ Testar Conexão

```dart
void main() async {
  final rabbitmq = RabbitMQService();
  
  try {
    await rabbitmq.connect();
    print('✅ Conectado!');
    
    // Testar envio
    await rabbitmq.publishTask(
      operation: 'CREATE',
      task: {
        'id': 'test-123',
        'title': 'Tarefa de teste',
        'description': 'Testando conexão',
        'completed': false,
        'synced': false,
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      },
    );
  } catch (e) {
    print('❌ Erro: $e');
  }
}
```

## 📊 Verificar no RabbitMQ

1. Abra: http://localhost:15672
2. Vá em: **Queues** → `task_queue`
3. Veja as mensagens sendo processadas

## 🔧 Troubleshooting

### Erro: "Connection refused"
- Verifique se o RabbitMQ está rodando: `docker ps`
- Verifique o IP usado no Flutter
- Verifique se a porta 5672 está acessível

### Erro: "Authentication failed"
- Verifique usuário/senha: `admin` / `admin123`

### Mensagens não aparecem
- Verifique se o `task-consumer` está rodando: `docker logs task_consumer`
- Verifique o exchange e routing key

