@echo off
rem Compila e roda todos os testes do EmiteJa (sem IntelliJ, so com o JDK).
chcp 65001 >nul
cd /d "%~dp0"

where javac >nul 2>nul || (
    echo JDK nao encontrado. Instale o JDK 17 ou superior e tente de novo.
    pause
    exit /b 1
)

javac -encoding UTF-8 -d out -sourcepath "src;teste" teste\emiteja\teste\ExecutarTestes.java || (
    echo Erro de compilacao.
    pause
    exit /b 1
)

java -Dstdout.encoding=UTF-8 -cp out emiteja.teste.ExecutarTestes
set RESULTADO=%ERRORLEVEL%
echo.
pause
exit /b %RESULTADO%
