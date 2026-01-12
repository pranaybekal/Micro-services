@echo off
echo Setting up E-Commerce Microservices Platform...

REM Create .env files from examples
echo Creating environment files...

if not exist "services\user-service\.env" (
    copy "services\user-service\.env.example" "services\user-service\.env" >nul
    echo Created services\user-service\.env
)

if not exist "services\product-service\.env" (
    copy "services\product-service\.env.example" "services\product-service\.env" >nul
    echo Created services\product-service\.env
)

if not exist "services\cart-service\.env" (
    copy "services\cart-service\.env.example" "services\cart-service\.env" >nul
    echo Created services\cart-service\.env
)

if not exist "services\order-service\.env" (
    copy "services\order-service\.env.example" "services\order-service\.env" >nul
    echo Created services\order-service\.env
)

if not exist "services\inventory-service\.env" (
    copy "services\inventory-service\.env.example" "services\inventory-service\.env" >nul
    echo Created services\inventory-service\.env
)

if not exist "api-gateway\.env" (
    copy "api-gateway\.env.example" "api-gateway\.env" >nul
    echo Created api-gateway\.env
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env" >nul
    echo Created frontend\.env
)

REM Install dependencies
echo.
echo Installing dependencies...

echo Installing API Gateway dependencies...
cd api-gateway
call npm install
cd ..

echo Installing User Service dependencies...
cd services\user-service
call npm install
cd ..\..

echo Installing Product Service dependencies...
cd services\product-service
call npm install
cd ..\..

echo Installing Cart Service dependencies...
cd services\cart-service
call npm install
cd ..\..

echo Installing Order Service dependencies...
cd services\order-service
call npm install
cd ..\..

echo Installing Inventory Service dependencies...
cd services\inventory-service
call npm install
cd ..\..

echo Installing Frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is running on localhost:5432
echo 2. Make sure Redis is running on localhost:6379
echo 3. Create databases manually or use Docker
echo 4. Use the provided PowerShell scripts to start services:
echo    - start-all.ps1 (starts all services)
echo    - stop-all.ps1 (stops all services)
echo.
echo Or use Docker: docker-compose up
echo.
pause
