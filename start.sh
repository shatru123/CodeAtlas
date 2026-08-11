#!/usr/bin/env bash

# RepoMind — Single-Click Launch Script
# Builds & launches both .NET 8 Backend API (http://localhost:5055) and React Web UI (http://localhost:5173)

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "===================================================="
echo "      🚀 Launching RepoMind Knowledge Platform      "
echo "===================================================="

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
"$DOTNET_BIN" build repomind/backend/src/RepoMind.Api/RepoMind.Api.csproj --verbosity quiet

if [ $? -ne 0 ]; then
    echo "❌ Error building .NET backend API. Exiting."
    exit 1
fi

echo "2. Starting Backend API at http://localhost:5055..."
"$DOTNET_BIN" repomind/backend/src/RepoMind.Api/bin/Debug/net8.0/RepoMind.Api.dll --urls http://localhost:5055 &
BACKEND_PID=$!

echo "3. Starting React Web UI at http://localhost:5173..."
cd "$DIR/repomind/frontend"
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

# Cleanup on exit
trap "echo 'Stopping RepoMind services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM EXIT

wait
