@echo off
REM Script para preparar ambiente para apresentação
echo ========================================
echo 🎓 PREPARANDO AMBIENTE PARA APRESENTAÇÃO
echo ========================================
echo.

echo [1/3] Subindo serviços RabbitMQ...
cd rabbitmq-shopping
docker-compose up -d
echo ✅ RabbitMQ iniciado
echo.

echo [2/3] Aguardando inicialização (30 segundos)...
timeout /t 30 /nobreak
echo.

echo [3/3] Verificando saúde dos serviços...
curl -s http://localhost:3002/health
echo.
echo.

echo ========================================
echo ✅ AMBIENTE PRONTO!
echo ========================================
echo.
echo 📋 Próximos passos:
echo    1. Abrir RabbitMQ: http://localhost:15672
echo    2. Login: admin / admin123
echo    3. Executar: test-messages.js (se necessário)
echo.
echo 💡 Para ver logs:
echo    docker-compose logs -f
echo.

cd ..

