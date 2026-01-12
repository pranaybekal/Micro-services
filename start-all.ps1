# E-Commerce Microservices Platform - Start All Services

Write-Host "Starting E-Commerce Platform..." -ForegroundColor Green
Write-Host ""

# Array to store job information
$jobs = @()

# Start API Gateway
Write-Host "Starting API Gateway..." -ForegroundColor Yellow
$jobs += Start-Job -ScriptBlock {
    Set-Location "U:\Web Development\Ecommerce\api-gateway"
    npm run dev
} -Name "API-Gateway"

# Start User Service
Write-Host "Starting User Service..." -ForegroundColor Yellow
$jobs += Start-Job -ScriptBlock {
    Set-Location "U:\Web Development\Ecommerce\services\user-service"
    npm run dev
} -Name "User-Service"

# Start Product Service
Write-Host "Starting Product Service..." -ForegroundColor Yellow
$jobs += Start-Job -ScriptBlock {
    Set-Location "U:\Web Development\Ecommerce\services\product-service"
    npm run dev
} -Name "Product-Service"

# Start Cart Service
Write-Host "Starting Cart Service..." -ForegroundColor Yellow
$jobs += Start-Job -ScriptBlock {
    Set-Location "U:\Web Development\Ecommerce\services\cart-service"
    npm run dev
} -Name "Cart-Service"

# Start Order Service
Write-Host "Starting Order Service..." -ForegroundColor Yellow
$jobs += Start-Job -ScriptBlock {
    Set-Location "U:\Web Development\Ecommerce\services\order-service"
    npm run dev
} -Name "Order-Service"

# Start Inventory Service
Write-Host "Starting Inventory Service..." -ForegroundColor Yellow
$jobs += Start-Job -ScriptBlock {
    Set-Location "U:\Web Development\Ecommerce\services\inventory-service"
    npm run dev
} -Name "Inventory-Service"

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
$jobs += Start-Job -ScriptBlock {
    Set-Location "U:\Web Development\Ecommerce\frontend"
    npm run dev
} -Name "Frontend"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
Get-Job | Format-Table -Property Id, Name, State

Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "  Frontend:       http://localhost:5173" -ForegroundColor White
Write-Host "  API Gateway:    http://localhost:3000" -ForegroundColor White
Write-Host "  User Service:   http://localhost:3001" -ForegroundColor White
Write-Host "  Product Service: http://localhost:3002" -ForegroundColor White
Write-Host "  Cart Service:   http://localhost:3003" -ForegroundColor White
Write-Host "  Order Service:  http://localhost:3004" -ForegroundColor White
Write-Host "  Inventory:      http://localhost:3005" -ForegroundColor White

Write-Host ""
Write-Host "Commands:" -ForegroundColor Cyan
Write-Host "  View logs: Receive-Job -Id <JobId> -Keep" -ForegroundColor Gray
Write-Host "  Stop all:  .\stop-all.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop monitoring (services will continue running)" -ForegroundColor Yellow

# Keep script running and show logs
try {
    while ($true) {
        Start-Sleep -Seconds 5
    }
} finally {
    Write-Host "Monitoring stopped. Services are still running in background." -ForegroundColor Yellow
}
