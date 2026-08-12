#!/usr/bin/env bash

# CodeAtlas — Single-Click Launch Script
# Builds & launches both .NET 8 Backend API (http://localhost:5055) and React Web UI (http://localhost:5173)

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "===================================================="
echo "      🚀 Launching CodeAtlas Knowledge Platform     "
echo "===================================================="

# Kill any existing processes bound to ports 5055, 5173, or 5195
echo "0. Checking and clearing ports 5055, 5173, and 5195..."
lsof -ti:5055,5173,5195 | xargs kill -9 2>/dev/null || true
sleep 1

# Determine .NET executable
DOTNET_BIN="$DIR/.dotnet/dotnet"
if [ ! -f "$DOTNET_BIN" ]; then
    DOTNET_BIN="dotnet"
fi

export DOTNET_CLI_HOME="$DIR/.dotnet"
export DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
export DOTNET_CLI_TELEMETRY_OPTOUT=1
export DOTNET_NOLOGO=1

echo "1. Building .NET Backend API..."
"$DOTNET_BIN" build codeatlas/backend/src/CodeAtlas.Api/CodeAtlas.Api.csproj --verbosity quiet

if [ $? -ne 0 ]; then
    echo "❌ Error building .NET backend API. Exiting."
    exit 1
fi

echo "2. Starting Backend API at http://localhost:5055..."
"$DOTNET_BIN" codeatlas/backend/src/CodeAtlas.Api/bin/Debug/net8.0/CodeAtlas.Api.dll --urls http://localhost:5055 &
BACKEND_PID=$!

echo "3. Starting React Web UI at http://localhost:5173..."
cd "$DIR/codeatlas/frontend"
npx vite --port 5173 --host 0.0.0.0 &
FRONTEND_PID=$!

echo "===================================================="
echo "  ✅ Both services are live and running!            "
echo "  🌐 Web UI:   http://localhost:5173                "
echo "  ⚙️ Backend:  http://localhost:5055                "
echo "===================================================="
echo "Press Ctrl+C to stop both services."

# Auto-open browser
sleep 2
if command -v open > /dev/null; then
    open "http://localhost:5173"
elif command -v xdg-open > /dev/null; then
    xdg-open "http://localhost:5173"
fi

cleanup() {
    echo "Stopping CodeAtlas services..."
    kill -9 $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    lsof -ti:5055,5173,5195 | xargs kill -9 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM EXIT

wait
