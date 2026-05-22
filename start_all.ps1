Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "PVG Unified ERP Startup Sequence" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

Write-Host "Cleaning up ghost processes (Freeing ports 8000, 5173)..." -ForegroundColor Yellow
$ports = @(8000, 5173)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $connections | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    }
}
Write-Host "Ports cleaned!" -ForegroundColor Green

Write-Host "`n[1/3] Starting Backend Server (Port 8000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

Write-Host "[2/3] Starting Frontend Portals (Port 5173)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev:frontend"

Write-Host "`n[3/3] Starting Ngrok Tunnels in a new window..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\ngrok_bin\ngrok.exe start --all --config=ngrok_dual.yml"

Write-Host "Waiting for Ngrok to establish tunnels..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $tunnels = (Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels").tunnels
    Write-Host "`nAll 3 services are launching successfully!" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host "Local Unified Portal: http://localhost:5173"
    
    foreach ($tunnel in $tunnels) {
        Write-Host "Ngrok Public URL ($($tunnel.name)): $($tunnel.public_url)" -ForegroundColor Magenta
    }
    Write-Host "==============================================" -ForegroundColor Cyan
} catch {
    Write-Host "Could not fetch Ngrok URLs automatically. Please check the minimized Ngrok window." -ForegroundColor Red
}
