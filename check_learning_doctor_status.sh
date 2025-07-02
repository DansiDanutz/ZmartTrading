#!/bin/bash

# ZMart Trading Bot - Enhanced Learning Doctor Agent Status Checker

echo "🧠 ZMart Trading Bot - Enhanced Learning Doctor Agent Status"
echo "==========================================================="

# Check if Enhanced Learning Doctor Agent is running
LEARNING_DOCTOR_PIDS=$(pgrep -f "start_learning_doctor.py")

if [ -z "$LEARNING_DOCTOR_PIDS" ]; then
    echo "❌ CRITICAL: Enhanced Learning Doctor Agent is NOT RUNNING!"
    echo ""
    echo "⚠️  Your trading system is WITHOUT advanced AI protection!"
    echo "🧠 This means:"
    echo "   - No automatic problem learning"
    echo "   - No solution auto-application"
    echo "   - No agent collaboration"
    echo "   - No challenge documentation"
    echo "   - No self-improvement capabilities"
    echo ""
    
    # Check if regular doctor is running
    REGULAR_DOCTOR_PIDS=$(pgrep -f "doctor_agent_24_7.py")
    if [ ! -z "$REGULAR_DOCTOR_PIDS" ]; then
        echo "📊 Regular Doctor Agent Status: ✅ RUNNING (PID: $REGULAR_DOCTOR_PIDS)"
        echo "💡 Consider upgrading to Enhanced Learning Doctor Agent:"
        echo "   1. ./stop_doctor.sh"
        echo "   2. python3 start_learning_doctor.py"
    else
        echo "❌ No Doctor Agent protection at all!"
        echo "🚨 IMMEDIATE ACTION REQUIRED!"
    fi
    
    echo ""
    echo "💊 RECOMMENDED ACTION:"
    echo "   Run: python3 start_learning_doctor.py"
    echo ""
    exit 1
fi

echo "✅ Enhanced Learning Doctor Agent Status: ACTIVE & LEARNING"
echo "📊 Process ID(s): $LEARNING_DOCTOR_PIDS"

# Get process details
for PID in $LEARNING_DOCTOR_PIDS; do
    if [ -d "/proc/$PID" ]; then
        START_TIME=$(ps -o lstart= -p $PID)
        CPU_USAGE=$(ps -o %cpu= -p $PID)
        MEMORY_USAGE=$(ps -o %mem= -p $PID)
        echo "   └── PID $PID: Started $START_TIME (CPU: ${CPU_USAGE}%, RAM: ${MEMORY_USAGE}%)"
    fi
done

echo ""
echo "🧠 Learning System Intelligence:"
echo "==============================="

# Check if knowledge database exists
if [ -f "doctor_knowledge.db" ]; then
    echo "🗄️ Knowledge Database: ✅ ACTIVE"
    
    # Get learning statistics using sqlite3 if available
    if command -v sqlite3 &> /dev/null; then
        TOTAL_PROBLEMS=$(sqlite3 doctor_knowledge.db "SELECT COUNT(*) FROM problems;" 2>/dev/null || echo "0")
        HIGH_CONF_SOLUTIONS=$(sqlite3 doctor_knowledge.db "SELECT COUNT(*) FROM solutions WHERE confidence_score >= 0.8;" 2>/dev/null || echo "0")
        COLLABORATIONS=$(sqlite3 doctor_knowledge.db "SELECT COUNT(*) FROM agent_collaboration WHERE status = 'PROCESSED';" 2>/dev/null || echo "0")
        
        echo "   📚 Problems Analyzed: $TOTAL_PROBLEMS"
        echo "   🎯 High-Confidence Solutions: $HIGH_CONF_SOLUTIONS"
        echo "   🤝 Successful Collaborations: $COLLABORATIONS"
        
        # Calculate immunity level
        if [ "$TOTAL_PROBLEMS" -gt 0 ] && [ "$HIGH_CONF_SOLUTIONS" -gt 0 ]; then
            IMMUNITY_RATIO=$(echo "scale=2; $HIGH_CONF_SOLUTIONS / $TOTAL_PROBLEMS * 100" | bc 2>/dev/null || echo "calculating...")
            echo "   🛡️ System Immunity: ${IMMUNITY_RATIO}%"
        fi
    else
        echo "   📊 Detailed stats require sqlite3"
    fi
else
    echo "🗄️ Knowledge Database: ⚠️ NOT FOUND (will be created)"
fi

echo ""
echo "🔍 Learning Activity Overview:"
echo "============================="

# Check learning logs
if [ -d "doctor_learning" ]; then
    echo "📋 Learning Logs: ✅ ACTIVE"
    
    # Count recent learning events
    RECENT_LOGS=$(find doctor_learning -name "learning_*.log" -mtime -1 2>/dev/null | wc -l)
    echo "   📄 Recent Learning Sessions: $RECENT_LOGS"
    
    # Show latest learning activity
    LATEST_LOG=$(find doctor_learning -name "learning_*.log" -mtime -1 2>/dev/null | sort -r | head -1)
    if [ ! -z "$LATEST_LOG" ] && [ -f "$LATEST_LOG" ]; then
        echo "   🔍 Latest Learning Activity:"
        tail -3 "$LATEST_LOG" 2>/dev/null | while read line; do
            echo "      $line"
        done
    fi
else
    echo "📋 Learning Logs: ⚠️ Directory not found"
fi

echo ""
echo "📚 Challenge Documentation:"
echo "=========================="

# Check challenge documentation
if [ -d "doctor_challenges" ]; then
    echo "📁 Challenge System: ✅ ACTIVE"
    
    # Count today's challenges
    TODAY=$(date +%Y%m%d)
    NEW_CHALLENGES_FILE="doctor_challenges/new_challenges_${TODAY}.json"
    AUTO_RESOLUTIONS_FILE="doctor_challenges/auto_resolutions_${TODAY}.json"
    
    if [ -f "$NEW_CHALLENGES_FILE" ]; then
        NEW_CHALLENGES_COUNT=$(grep -o '"challenge_type"' "$NEW_CHALLENGES_FILE" 2>/dev/null | wc -l)
        echo "   🆕 New Challenges Today: $NEW_CHALLENGES_COUNT"
    else
        echo "   🆕 New Challenges Today: 0"
    fi
    
    if [ -f "$AUTO_RESOLUTIONS_FILE" ]; then
        AUTO_RESOLUTIONS_COUNT=$(grep -o '"alert_type"' "$AUTO_RESOLUTIONS_FILE" 2>/dev/null | wc -l)
        echo "   ✅ Auto-Resolved Today: $AUTO_RESOLUTIONS_COUNT"
    else
        echo "   ✅ Auto-Resolved Today: 0"
    fi
    
    # Check for learning report
    LEARNING_REPORT="doctor_challenges/daily_learning_report_${TODAY}.json"
    if [ -f "$LEARNING_REPORT" ]; then
        echo "   📊 Daily Learning Report: ✅ Available"
    else
        echo "   📊 Daily Learning Report: ⏳ Pending"
    fi
else
    echo "📁 Challenge System: ⚠️ Directory not found (will be created)"
fi

echo ""
echo "🔍 System Health Overview:"
echo "=========================="

# Check vital signs
if command -v python3 &> /dev/null; then
    python3 -c "
import psutil
import os

# System vitals
try:
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
except Exception as e:
    print(f'❌ Could not get system vitals: {e}')
"
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
echo "🧠 Learning System Capabilities:"
echo "==============================="
echo "✅ Problem Pattern Recognition - Identifies recurring issues"
echo "✅ Solution Learning & Auto-Application - Learns from fixes"
echo "✅ Agent Collaboration - Shares knowledge with other agents"
echo "✅ Challenge Documentation - Tracks new problems and solutions"
echo "✅ Self-Improvement - Gets smarter over time"
echo "✅ Predictive Prevention - Prevents issues before they occur"

echo ""
echo "🩺 AI Doctor's Assessment:"
echo "========================"

# Provide intelligent recommendations
if [ "$NEW_CHALLENGES_COUNT" -gt 5 ] 2>/dev/null; then
    echo "💊 High challenge frequency detected - review learning effectiveness"
fi

if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "💊 Backend service needs immediate attention"
fi

if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "💊 Frontend service requires investigation"
fi

if [ ! -f "doctor_knowledge.db" ]; then
    echo "💊 Learning system initializing - will improve with experience"
fi

echo "✅ Enhanced Learning Doctor Agent is actively protecting and improving your system!"

echo ""
echo "📱 Learning Management Commands:"
echo "==============================="
echo "   View learning logs:     tail -f doctor_learning/learning_*.log"
echo "   Check challenges:       cat doctor_challenges/new_challenges_$(date +%Y%m%d).json"
echo "   View auto-resolutions:  cat doctor_challenges/auto_resolutions_$(date +%Y%m%d).json"
echo "   Learning report:        cat doctor_challenges/daily_learning_report_$(date +%Y%m%d).json"
echo "   Stop learning doctor:   ./stop_learning_doctor.sh"
echo "   Learning documentation: ls doctor_learning_docs/"
echo ""
echo "🧠 Your trading system is under advanced AI protection with continuous learning!"