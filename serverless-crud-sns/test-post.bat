@echo off
REM Script para testar POST /items

echo 🧪 Testando POST /items
echo.

curl -X POST http://localhost:3001/local/items ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Arroz\", \"quantity\": 2, \"category\": \"alimentos\"}"

echo.
echo.
echo ✅ Teste concluído!
pause

