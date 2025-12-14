#!/bin/bash

# Script para configurar o bucket S3 no LocalStack
# Uso: ./setup-s3-bucket.sh

echo "🚀 Configurando bucket S3 no LocalStack..."

# Verificar se o LocalStack está rodando
if ! curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
    echo "❌ LocalStack não está rodando. Execute: docker-compose up -d"
    exit 1
fi

echo "✅ LocalStack está rodando"

# Criar o bucket
echo "📦 Criando bucket shopping-images..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://shopping-images 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Bucket criado com sucesso!"
elif [ $? -eq 254 ]; then
    echo "ℹ️  Bucket já existe"
else
    echo "❌ Erro ao criar bucket"
    exit 1
fi

# Listar buckets
echo ""
echo "📋 Buckets disponíveis:"
aws --endpoint-url=http://localhost:4566 s3 ls

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "Para listar objetos no bucket:"
echo "  aws --endpoint-url=http://localhost:4566 s3 ls s3://shopping-images --recursive"

