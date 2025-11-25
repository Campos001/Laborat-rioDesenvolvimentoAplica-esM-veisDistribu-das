@echo off
REM Script para retomar os consumers

echo ▶️  Retomando consumers...
docker-compose start notification-consumer analytics-consumer
echo ✅ Consumers retomados!
echo.
echo 💡 Os consumers vão processar todas as mensagens que estavam na fila

