@echo off
rem Abre o EmiteJa com o menu em janelas (JOptionPane).
chcp 65001 >nul
cd /d "%~dp0"

where javac >nul 2>nul || (
    echo JDK nao encontrado. Instale o JDK 17 ou superior e tente de novo.
    pause
    exit /b 1
)

javac -encoding UTF-8 -d out -sourcepath src src\emiteja\app\Main.java || (
    echo Erro de compilacao.
    pause
    exit /b 1
)

java -cp out emiteja.app.Main
