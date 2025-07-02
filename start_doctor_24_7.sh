#!/bin/bash

# ZMart Trading Bot - Doctor Agent 24/7 Startup Script
# This script starts the Doctor Agent with proper environment setup

echo "🏥 Starting ZMart Trading Bot Doctor Agent 24/7..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Install required Python packages if not already installed
echo "📦 Checking Python dependencies..."
python3 -c "import psutil, requests" 2>/dev/null || {
    echo "📦 Installing required Python packages..."
    pip3 install psutil requests --user
}

# Check if Doctor Agent script exists
if [ ! -f "doctor_agent_24_7.py" ]; then
    echo "❌ Doctor Agent script not found!"
    echo "Please ensure doctor_agent_24_7.py is in the current directory."
    exit 1
fi

# Kill any existing Doctor Agent processes
echo "🔄 Stopping any existing Doctor Agent processes..."
pkill -f "doctor_agent_24_7.py" 2>/dev/null || true
sleep 2

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p doctor_logs
mkdir -p doctor_treatments
mkdir -p doctor_backups

# Set proper permissions
chmod 755 doctor_agent_24_7.py
chmod 755 doctor_logs
chmod 755 doctor_treatments
chmod 755 doctor_backups

# Start the Doctor Agent
echo "🚀 Starting Doctor Agent 24/7..."
nohup python3 doctor_agent_24_7.py > doctor_logs/startup_$(date +%Y%m%d_%H%M%S).log 2>&1 &
DOCTOR_PID=$!

# Wait a moment to see if it started successfully
sleep 3

if ps -p $DOCTOR_PID > /dev/null; then
    echo "✅ Doctor Agent started successfully!"
    echo "📊 Process ID: $DOCTOR_PID"
    echo "📋 Logs: doctor_logs/"
    echo "🩺 Treatments: doctor_treatments/"
    echo "💾 Backups: doctor_backups/"
    echo ""
    echo "🏥 Your ZMart Trading Bot is now under 24/7 medical supervision!"
    echo "💊 The Doctor Agent will continuously monitor and protect your system."
    echo ""
    echo "📱 To check status: ./check_doctor_status.sh"
    echo "🛑 To stop: ./stop_doctor.sh"
    echo "📊 To view logs: tail -f doctor_logs/doctor_24_7_$(date +%Y%m%d).log"
else
    echo "❌ Failed to start Doctor Agent!"
    echo "Check the startup log for details:"
    echo "tail doctor_logs/startup_$(date +%Y%m%d)*.log"
    exit 1
fi