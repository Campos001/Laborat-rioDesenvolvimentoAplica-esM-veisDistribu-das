@echo off
chcp 65001 >nul
echo ========================================
echo 🗑️  DELETAR PASTA "Projeto Offline First"
echo ========================================
echo.
echo ⚠️  ATENÇÃO: Esta ação é IRREVERSÍVEL!
echo.
echo A pasta "Projeto Offline First" será DELETADA permanentemente.
echo.
set /p confirmar="Tem certeza que deseja continuar? (S/N): "

if /i "%confirmar%" NEQ "S" (
    echo.
    echo ❌ Operação cancelada.
    pause
    exit /b 0
)

echo.
echo 🗑️  Deletando pasta...
echo.

if exist "Projeto Offline First" (
    rd /s /q "Projeto Offline First"
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Pasta "Projeto Offline First" deletada com sucesso!
    ) else (
        echo ❌ Erro ao deletar pasta. Pode estar em uso.
        echo.
        echo 💡 Tente:
        echo    1. Fechar todos os programas que podem estar usando a pasta
        echo    2. Fechar VS Code/Cursor se estiver aberto
        echo    3. Executar este script novamente
    )
) else (
    echo ⚠️  Pasta "Projeto Offline First" não encontrada.
    echo    Pode já ter sido deletada.
)

echo.
echo ========================================
pause

