@echo off
REM Script para configurar o bucket S3 no LocalStack (Windows)
REM Uso: setup-s3-bucket.bat

echo 🚀 Configurando bucket S3 no LocalStack...

REM Verificar se o LocalStack está rodando
curl -s http://localhost:4566/_localstack/health >nul 2>&1
if errorlevel 1 (
    echo ❌ LocalStack não está rodando. Execute: docker-compose up -d
    exit /b 1
)

echo ✅ LocalStack está rodando

REM Criar o bucket
echo 📦 Criando bucket shopping-images...
aws --endpoint-url=http://localhost:4566 s3 mb s3://shopping-images 2>nul

if errorlevel 1 (
    echo ℹ️  Bucket já existe ou erro ao criar
) else (
    echo ✅ Bucket criado com sucesso!
)

REM Listar buckets
echo.
echo 📋 Buckets disponíveis:
aws --endpoint-url=http://localhost:4566 s3 ls

echo.
echo ✅ Configuração concluída!
echo.
echo Para listar objetos no bucket:
echo   aws --endpoint-url=http://localhost:4566 s3 ls s3://shopping-images --recursive

pause

