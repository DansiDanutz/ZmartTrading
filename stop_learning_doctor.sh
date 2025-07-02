#!/bin/bash

# ZMart Trading Bot - Stop Enhanced Learning Doctor Agent

echo "🛑 Stopping Enhanced Learning Doctor Agent..."

# Find and kill learning doctor processes
LEARNING_DOCTOR_PIDS=$(pgrep -f "start_learning_doctor.py")

if [ -z "$LEARNING_DOCTOR_PIDS" ]; then
    echo "ℹ️  No Enhanced Learning Doctor Agent processes found running."
    
    # Check for regular doctor agent
    REGULAR_DOCTOR_PIDS=$(pgrep -f "doctor_agent_24_7.py")
    if [ ! -z "$REGULAR_DOCTOR_PIDS" ]; then
        echo "📊 Found regular Doctor Agent processes: $REGULAR_DOCTOR_PIDS"
        echo "🔄 Use ./stop_doctor.sh to stop the regular Doctor Agent"
    fi
    
    exit 0
fi

echo "📊 Found Enhanced Learning Doctor Agent processes: $LEARNING_DOCTOR_PIDS"

# Try graceful shutdown first (SIGTERM)
echo "🔄 Attempting graceful shutdown..."
pkill -TERM -f "start_learning_doctor.py"

# Wait a moment for graceful shutdown
sleep 5

# Check if still running
if pgrep -f "start_learning_doctor.py" > /dev/null; then
    echo "⏰ Graceful shutdown timeout, forcing termination..."
    pkill -KILL -f "start_learning_doctor.py"
    sleep 2
fi

# Also stop any related processes
pkill -TERM -f "doctor_agent_learning_system" 2>/dev/null || true
pkill -TERM -f "integrate_learning_system" 2>/dev/null || true

# Final check
if pgrep -f "start_learning_doctor.py" > /dev/null; then
    echo "❌ Failed to stop Enhanced Learning Doctor Agent!"
    echo "You may need to manually kill the processes:"
    echo "ps aux | grep learning_doctor"
    exit 1
else
    echo "✅ Enhanced Learning Doctor Agent stopped successfully!"
    echo ""
    echo "🧠 Learning system has been shut down:"
    echo "   📚 Knowledge base preserved"
    echo "   🗄️ All learning data saved"
    echo "   📊 Challenge documentation maintained"
    echo ""
    echo "🔄 To restart enhanced learning:"
    echo "   python3 start_learning_doctor.py"
    echo ""
    echo "⚠️  Your trading system is now without advanced AI protection!"
    echo "💡 Consider restarting soon to maintain system immunity."
fi