Write-Host "Starting PVG Auth Module (Strict Startup)"

# 1. Version checks
$py_ver = python --version 2>&1
if ($py_ver -match "Python 3\.([0-9]+)") {
    if ([int]$matches[1] -lt 10) { Write-Warning "Python 3.10+ required" }
}

# 2. Dependency installations
if (-Not (Test-Path "venv")) {
    python -m venv venv
}
.\venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt

if (-Not (Test-Path "node_modules")) {
    npm install
}

# 3. Environment check
if (-Not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item .env.example .env
        Write-Host "Created .env from .env.example. Please configure it." -ForegroundColor Yellow
    }
}

# 4. Trap cleanup
try {
    Write-Host "Starting Backend on Port 8001..."
    $backend = Start-Process -FilePath ".\venv\Scripts\python.exe" -ArgumentList "-m uvicorn main:app --port 8001 --reload" -WorkingDirectory "backend" -PassThru -NoNewWindow
    
    Write-Host "Starting Frontend on Port 5173..."
    $frontend = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev:frontend" -PassThru -NoNewWindow
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Backend: http://localhost:8001"
    Write-Host "Frontend: http://localhost:5173"
    Write-Host "========================================" -ForegroundColor Cyan
    
    Wait-Process -Id $backend.Id, $frontend.Id
} finally {
    Write-Host "Cleaning up..."
    if ($backend) { Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue }
    if ($frontend) { Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue }
}
