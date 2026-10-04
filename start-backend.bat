@echo off
title Smart Farming Spring Boot Backend
cd /d "%~dp0demo"
echo ========================================================
echo  Starting AgroSense Spring Boot Backend on http://localhost:8080
echo ========================================================
call mvnw.cmd spring-boot:run
pause
