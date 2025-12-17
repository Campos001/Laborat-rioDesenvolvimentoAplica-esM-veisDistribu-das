@echo off
REM Script para pausar os consumers e permitir visualizar mensagens na fila

echo ⏸️  Pausando consumers...
docker-compose stop notification-consumer analytics-consumer
echo ✅ Consumers pausados!
echo.
echo 💡 Agora você pode:
echo    1. Executar: node test-messages.js
echo    2. Ver as mensagens no RabbitMQ Management UI
echo    3. Quando terminar, execute: retomar-consumers.bat

