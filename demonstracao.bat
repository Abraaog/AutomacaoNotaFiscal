@echo off
rem Roda o roteiro completo no console: venda, duplicidade, pendente, rejeicao e cancelamento.
chcp 65001 >nul
cd /d "%~dp0"

where javac >nul 2>nul || (
    echo JDK nao encontrado. Instale o JDK 17 ou superior e tente de novo.
    pause
    exit /b 1
)

javac -encoding UTF-8 -d out -sourcepath src src\emiteja\app\Demonstracao.java || (
    echo Erro de compilacao.
    pause
    exit /b 1
)

java -Dstdout.encoding=UTF-8 -cp out emiteja.app.Demonstracao
echo.
pause
