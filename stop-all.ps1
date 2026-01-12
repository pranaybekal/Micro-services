# E-Commerce Microservices Platform - Stop All Services

Write-Host "Stopping all services..." -ForegroundColor Red

# Get all jobs
$jobs = Get-Job

if ($jobs.Count -eq 0) {
    Write-Host "No running services found." -ForegroundColor Yellow
} else {
    Write-Host "Found $($jobs.Count) running service(s)" -ForegroundColor Yellow
    
    # Stop all jobs
    $jobs | Stop-Job
    
    # Remove all jobs
    $jobs | Remove-Job
    
    Write-Host "All services stopped!" -ForegroundColor Green
}

# Also kill any node processes on the ports (cleanup)
Write-Host ""
Write-Host "Cleaning up ports..." -ForegroundColor Yellow

$ports = @(3000, 3001, 3002, 3003, 3004, 3005, 5173)

foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "  Stopped process on port $port" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
