#!/bin/bash
set -e

echo "Starting PVG Auth Module (Strict Startup)"

# 1. Version checks
python3 -c "import sys; assert sys.version_info >= (3, 10), 'Python 3.10+ required'"
node -v | grep -q 'v18\|v20\|v22' || echo "Warning: Node 18+ recommended"

# 2. Dependency installations
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r backend/requirements.txt

if [ ! -d "node_modules" ]; then
    npm install
fi

# 3. Environment check
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Created .env from .env.example. Please configure it."
    fi
fi

# 4. Trap cleanup
cleanup() {
    echo "Cleaning up processes..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit
}
trap cleanup SIGINT SIGTERM

# 5. Start services
echo "Starting Backend on Port 8001..."
cd backend && uvicorn main:app --port 8001 --reload &
BACKEND_PID=$!

cd ..
echo "Starting Frontend on Port 5173..."
npm run dev:frontend &
FRONTEND_PID=$!

echo "========================================"
echo "Backend: http://localhost:8001"
echo "Frontend: http://localhost:5173"
echo "========================================"

wait
