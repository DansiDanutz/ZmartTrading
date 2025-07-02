#!/bin/bash

# ZMart Trading Bot - Doctor Agent Status Checker
# Enhanced version with comprehensive health reporting

echo "🏥 ZMart Trading Bot - Doctor Agent Status Report"
echo "=================================================="

# Check if Doctor Agent is running
DOCTOR_PIDS=$(pgrep -f "doctor_agent_24_7.py")

if [ -z "$DOCTOR_PIDS" ]; then
    echo "❌ CRITICAL: Doctor Agent is NOT RUNNING!"
    echo ""
    echo "⚠️  Your trading system is WITHOUT medical supervision!"
    echo "🚨 This means:"
    echo "   - No automated health monitoring"
    echo "   - No automatic system recovery"
    echo "   - No security monitoring" 
    echo "   - No performance optimization"
    echo ""
    echo "💊 RECOMMENDED ACTION:"
    echo "   Run: ./start_doctor_24_7.sh"
    echo ""
    exit 1
fi

echo "✅ Doctor Agent Status: ACTIVE & MONITORING"
echo "📊 Process ID(s): $DOCTOR_PIDS"

# Get process details
for PID in $DOCTOR_PIDS; do
    if [ -d "/proc/$PID" ]; then
        START_TIME=$(ps -o lstart= -p $PID)
        CPU_USAGE=$(ps -o %cpu= -p $PID)
        MEMORY_USAGE=$(ps -o %mem= -p $PID)
        echo "   └── PID $PID: Started $START_TIME (CPU: ${CPU_USAGE}%, RAM: ${MEMORY_USAGE}%)"
    fi
done

echo ""
echo "🔍 System Health Overview:"
echo "=========================="

# Check vital signs
if command -v python3 &> /dev/null; then
    python3 -c "
import psutil
import os

# System vitals
cpu = psutil.cpu_percent(interval=1)
memory = psutil.virtual_memory().percent
disk = psutil.disk_usage('/').percent

print(f'🫀 CPU Usage: {cpu:.1f}%')
print(f'🧠 Memory Usage: {memory:.1f}%')
print(f'💾 Disk Usage: {disk:.1f}%')

# Check critical thresholds
if cpu > 90:
    print('⚠️  WARNING: High CPU usage!')
if memory > 90:
    print('⚠️  WARNING: High memory usage!')
if disk > 90:
    print('⚠️  WARNING: Low disk space!')
"
fi

echo ""
echo "📋 Recent Activity:"
echo "=================="

# Show recent log entries
if [ -f "doctor_logs/doctor_24_7_$(date +%Y%m%d).log" ]; then
    echo "📄 Latest log entries:"
    tail -5 "doctor_logs/doctor_24_7_$(date +%Y%m%d).log" | while read line; do
        echo "   $line"
    done
else
    echo "📄 No recent log file found"
fi

echo ""

# Check for recent alerts
ALERT_COUNT=$(find doctor_treatments -name "alert_*.json" -mtime -1 2>/dev/null | wc -l)
if [ $ALERT_COUNT -gt 0 ]; then
    echo "🚨 Recent Alerts (last 24h): $ALERT_COUNT"
    echo "📋 Latest alerts:"
    find doctor_treatments -name "alert_*.json" -mtime -1 2>/dev/null | sort -r | head -3 | while read alert_file; do
        if [ -f "$alert_file" ]; then
            ALERT_TYPE=$(basename "$alert_file" .json | sed 's/alert_[0-9]*_[0-9]*_//')
            echo "   🔔 $(basename "$alert_file" .json)"
        fi
    done
else
    echo "✅ No recent alerts (last 24h)"
fi

echo ""
echo "📊 Service Status:"
echo "=================="

# Check backend status
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend (Flask): HEALTHY"
else
    echo "❌ Backend (Flask): NOT RESPONDING"
fi

# Check frontend status
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend (React): HEALTHY"
else
    echo "❌ Frontend (React): NOT RESPONDING"
fi

echo ""
echo "🩺 Doctor's Prescription:"
echo "========================"

if [ $ALERT_COUNT -gt 5 ]; then
    echo "💊 High alert frequency detected - investigate root causes"
fi

if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "💊 Backend service needs attention"
fi

if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "💊 Frontend service needs attention"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "💊 Consider cleaning up disk space (${DISK_USAGE}% used)"
fi

echo "✅ Doctor Agent is actively protecting your trading system!"
echo ""
echo "📱 Commands:"
echo "   View live logs: tail -f doctor_logs/doctor_24_7_$(date +%Y%m%d).log"
echo "   Stop doctor:    ./stop_doctor.sh"
echo "   Restart doctor: ./start_doctor_24_7.sh"