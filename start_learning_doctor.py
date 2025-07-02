#!/usr/bin/env python3
"""
🧠 Start Enhanced Learning Doctor Agent
=====================================
Starts the advanced learning Doctor Agent with self-improvement capabilities
"""

import os
import sys
import time
import signal
from datetime import datetime

def signal_handler(sig, frame):
    """Handle shutdown signals gracefully"""
    print("\n👋 Shutting down Enhanced Learning Doctor Agent...")
    sys.exit(0)

def main():
    """Start the enhanced learning doctor agent"""
    
    print("🧠 ZMart Trading Bot - Enhanced Learning Doctor Agent")
    print("=" * 60)
    print(f"🕐 Starting at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Import the integration system
        from integrate_learning_system import integrate_learning_with_doctor
        
        print("🔗 Loading enhanced doctor agent...")
        
        # Get the enhanced doctor class
        EnhancedDoctorClass = integrate_learning_with_doctor()
        
        if not EnhancedDoctorClass:
            print("❌ Failed to create enhanced doctor agent!")
            sys.exit(1)
        
        print("✅ Enhanced doctor agent loaded successfully!")
        print()
        print("🧠 Learning Capabilities Active:")
        print("   ✅ Problem pattern recognition")
        print("   ✅ Solution learning and auto-application")
        print("   ✅ Agent collaboration and knowledge sharing")
        print("   ✅ Challenge documentation and tracking")
        print("   ✅ Self-improvement and adaptation")
        print()
        
        # Create and start the enhanced doctor agent
        print("🚀 Initializing Enhanced Learning Doctor Agent...")
        doctor = EnhancedDoctorClass()
        
        print("🩺 System Status:")
        print(f"   📊 Agent ID: {doctor.learning_system.agent_id}")
        print(f"   🗄️ Knowledge DB: {doctor.learning_system.knowledge_db}")
        print(f"   🔄 Auto-apply solutions: {doctor.learning_config['auto_apply_solutions']}")
        print(f"   🤝 Collaboration enabled: {doctor.learning_config['collaboration_enabled']}")
        print(f"   📚 Challenge documentation: {doctor.learning_config['challenge_documentation']}")
        print()
        
        print("🏥 Your Enhanced Learning Doctor Agent is now ACTIVE!")
        print("💊 Advanced AI-powered system protection enabled!")
        print()
        print("📱 Management Commands:")
        print("   Status: ./check_learning_doctor_status.sh")
        print("   Stop:   ./stop_learning_doctor.sh")
        print("   Logs:   tail -f doctor_learning/*.log")
        print()
        print("📚 Learning Documentation:")
        print("   Commands: doctor_learning_docs/learning_commands.md")
        print("   Workflow: doctor_learning_docs/learning_workflow.md")
        print("   Integration: doctor_learning_docs/integration_guide.md")
        print()
        
        # Start the enhanced 24/7 operation
        doctor.run_24_7()
        
    except ImportError as e:
        print(f"❌ Failed to import required modules: {e}")
        print("💡 Make sure all learning system files are present:")
        print("   - doctor_agent_learning_system.py")
        print("   - integrate_learning_system.py")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ Failed to start enhanced doctor agent: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()