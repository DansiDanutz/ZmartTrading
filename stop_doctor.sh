#!/bin/bash

# ZMart Trading Bot - Stop Doctor Agent Script

echo "🛑 Stopping ZMart Trading Bot Doctor Agent..."

# Find and kill Doctor Agent processes
DOCTOR_PIDS=$(pgrep -f "doctor_agent_24_7.py")

if [ -z "$DOCTOR_PIDS" ]; then
    echo "ℹ️  No Doctor Agent processes found running."
    exit 0
fi

echo "📊 Found Doctor Agent processes: $DOCTOR_PIDS"

# Try graceful shutdown first (SIGTERM)
echo "🔄 Attempting graceful shutdown..."
pkill -TERM -f "doctor_agent_24_7.py"

# Wait a moment for graceful shutdown
sleep 5

# Check if still running
if pgrep -f "doctor_agent_24_7.py" > /dev/null; then
    echo "⏰ Graceful shutdown timeout, forcing termination..."
    pkill -KILL -f "doctor_agent_24_7.py"
    sleep 2
fi

# Final check
if pgrep -f "doctor_agent_24_7.py" > /dev/null; then
    echo "❌ Failed to stop Doctor Agent!"
    echo "You may need to manually kill the processes:"
    echo "ps aux | grep doctor_agent_24_7.py"
    exit 1
else
    echo "✅ Doctor Agent stopped successfully!"
    echo "🏥 Your trading system is no longer under medical supervision."
    echo "⚠️  Remember to restart the Doctor Agent to resume monitoring!"
fi