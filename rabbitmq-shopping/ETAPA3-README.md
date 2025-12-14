# Etapa 3 - LocalStack S3 (Opção B)

## 📋 Descrição

Esta etapa implementa a integração do LocalStack para simular um bucket S3 da AWS localmente, permitindo que as fotos tiradas no aplicativo móvel sejam armazenadas "na nuvem" em vez de ficarem apenas no dispositivo.

## 🛠️ Tecnologias Utilizadas

- **Docker & Docker Compose** - Containerização do LocalStack
- **LocalStack** - Emulador local dos serviços AWS (S3)
- **AWS SDK (Node.js)** - SDK para interação com S3
- **Flutter** - Aplicativo móvel
- **Express.js** - Backend API
- **image_picker** - Plugin Flutter para captura de imagens

## 📁 Estrutura do Projeto

```
rabbitmq-shopping/
├── docker-compose.yml          # Configuração LocalStack + RabbitMQ
├── list-service/
│   ├── server.js               # Backend com endpoint /upload
│   ├── package.json            # Dependências (aws-sdk)
│   └── Dockerfile
└── localstack-data/            # Dados persistidos do LocalStack

Projeto Offline First/
├── lib/
│   ├── models/
│   │   └── shopping_item.dart  # Modelo com campo imageUrl
│   ├── services/
│   │   └── image_upload_service.dart  # Serviço de upload
│   ├── screens/
│   │   └── item_form_screen.dart      # Formulário com captura de foto
│   └── providers/
│       └── shopping_provider.dart     # Provider atualizado
└── pubspec.yaml                # Dependências (image_picker)
```

## 🚀 Como Executar

### 1. Preparar o Ambiente

#### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ instalado
- Flutter SDK instalado
- AWS CLI instalado (opcional, para validação)

### 2. Iniciar LocalStack

```bash
# Navegar para o diretório do projeto
cd rabbitmq-shopping

# Subir os containers (LocalStack + RabbitMQ + Backend)
docker-compose up -d

# Verificar se o LocalStack está rodando
docker ps | grep localstack
```

O LocalStack estará disponível em: `http://localhost:4566`

### 3. Criar o Bucket S3 Local

```bash
# Criar o bucket shopping-images
aws --endpoint-url=http://localhost:4566 s3 mb s3://shopping-images

# Verificar se o bucket foi criado
aws --endpoint-url=http://localhost:4566 s3 ls
```

**Nota:** O backend também cria o bucket automaticamente na primeira inicialização.

### 4. Instalar Dependências do Backend

```bash
cd list-service
npm install
```

### 5. Executar o Backend

```bash
# Se estiver usando Docker Compose, o backend já está rodando
# Caso contrário, execute manualmente:
npm start
```

O backend estará disponível em: `http://localhost:3002`

### 6. Configurar e Executar o App Flutter

```bash
cd "Projeto Offline First"

# Instalar dependências
flutter pub get

# Executar o app
flutter run
```

**Importante:** 
- Para Android Emulator, a URL do backend já está configurada como `http://10.0.2.2:3002`
- Para iOS Simulator ou dispositivo físico, altere em `lib/services/image_upload_service.dart`:
  ```dart
  static const String baseUrl = 'http://localhost:3002'; // ou seu IP local
  ```

### 7. Permissões do App (Android)

Adicione as permissões de câmera e armazenamento no arquivo `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

## 📸 Roteiro de Demonstração (Sala de Aula)

### 1. Infraestrutura
```bash
# Mostrar LocalStack subindo
docker-compose up
```
**Evidência:** Screenshot do terminal mostrando o container LocalStack iniciando.

### 2. Configuração
```bash
# Listar buckets
aws --endpoint-url=http://localhost:4566 s3 ls
```
**Evidência:** Screenshot mostrando o bucket `shopping-images` na lista.

### 3. Ação
1. Abrir o app mobile
2. Criar um novo item
3. Clicar em "Tirar Foto"
4. Capturar foto de um produto
5. Salvar o item

**Evidência:** Screenshot do app mostrando a foto capturada.

### 4. Validação
```bash
# Listar objetos no bucket
aws --endpoint-url=http://localhost:4566 s3 ls s3://shopping-images --recursive

# Ou verificar via navegador (se tiver interface web do LocalStack)
# http://localhost:4566/_localstack/health
```
**Evidência:** Screenshot mostrando a imagem salva no bucket S3 local.

## 🔍 Endpoints da API

### POST /upload
Upload de imagem para S3 LocalStack.

**Request:**
```json
{
  "imageBase64": "base64_encoded_image_string",
  "fileName": "image.jpg",
  "itemId": "optional_item_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Imagem enviada com sucesso",
  "data": {
    "imageUrl": "http://localhost:4566/shopping-images/items/1234567890.jpg",
    "key": "items/1234567890.jpg",
    "bucket": "shopping-images"
  }
}
```

### GET /images/:key
Obter imagem do S3 (opcional).

**Exemplo:**
```
GET http://localhost:3002/images/items/1234567890.jpg
```

### GET /health
Health check do serviço.

**Response:**
```json
{
  "service": "list-service",
  "status": "healthy",
  "rabbitmq": "connected",
  "s3": {
    "endpoint": "http://localhost:4566",
    "bucket": "shopping-images"
  },
  "timestamp": "2025-01-XX..."
}
```

## 🧪 Testes Manuais

### Teste 1: Upload via cURL
```bash
# Converter imagem para base64
base64 -i imagem.jpg > imagem_base64.txt

# Fazer upload
curl -X POST http://localhost:3002/upload \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "'$(cat imagem_base64.txt)'",
    "fileName": "teste.jpg"
  }'
```

### Teste 2: Verificar no S3
```bash
# Listar objetos
aws --endpoint-url=http://localhost:4566 s3 ls s3://shopping-images --recursive

# Baixar objeto
aws --endpoint-url=http://localhost:4566 s3 cp s3://shopping-images/items/teste.jpg ./teste_download.jpg
```

## 📝 Funcionalidades Implementadas

✅ Docker Compose com LocalStack configurado  
✅ Endpoint `/upload` no backend que recebe imagem em Base64  
✅ Integração com SDK AWS para salvar no S3 LocalStack  
✅ Captura de foto no app mobile (câmera e galeria)  
✅ Upload automático quando usuário tira foto  
✅ Visualização da imagem no formulário  
✅ Armazenamento da URL da imagem no modelo ShoppingItem  
✅ Validação via AWS CLI  

## 🐛 Troubleshooting

### LocalStack não inicia
```bash
# Verificar logs
docker-compose logs localstack

# Reiniciar container
docker-compose restart localstack
```

### Backend não conecta ao LocalStack
- Verificar se o LocalStack está rodando: `docker ps`
- Verificar variável de ambiente `LOCALSTACK_ENDPOINT`
- Verificar se a porta 4566 está livre

### App não consegue fazer upload
- Verificar se o backend está rodando na porta 3002
- Verificar URL no `image_upload_service.dart` (10.0.2.2 para Android emulator)
- Verificar permissões de câmera no dispositivo

### Imagem não aparece no bucket
- Verificar logs do backend: `docker-compose logs list-service`
- Verificar se o bucket foi criado: `aws --endpoint-url=http://localhost:4566 s3 ls`
- Verificar permissões do bucket

## 📚 Referências

- [LocalStack Documentation](https://docs.localstack.cloud/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Flutter image_picker](https://pub.dev/packages/image_picker)
- [Docker Compose](https://docs.docker.com/compose/)

## 👥 Autores

Desenvolvido para a Etapa 3 do Laboratório de Desenvolvimento de Aplicações Móveis e Distribuídas - PUC Minas.

---

**Data de Entrega:** [Preencher]  
**Evidências:** Screenshots anexados na pasta `screenshots/`

