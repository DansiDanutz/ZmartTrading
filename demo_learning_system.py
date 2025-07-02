#!/usr/bin/env python3
"""
🎓 Doctor Agent Learning System Demo
===================================
Demonstrates how the enhanced Doctor Agent learns from problems and solutions
"""

import time
import json
import os
from datetime import datetime
from doctor_agent_learning_system import DoctorLearningSystem

def run_learning_demo():
    """Run a comprehensive learning system demonstration"""
    
    print("🎓 Doctor Agent Learning System - Live Demo")
    print("=" * 50)
    print(f"📅 Demo Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Initialize learning system
    print("🧠 Initializing Learning System...")
    learning_system = DoctorLearningSystem(agent_id="demo_doctor")
    print("✅ Learning system initialized!")
    print()
    
    # Demo scenarios
    demo_scenarios = [
        {
            'name': 'Backend Service Crash',
            'error_type': 'BACKEND_DOWN',
            'error_message': 'Backend service not responding on port 5000',
            'context': {
                'component': 'backend',
                'operation': 'health_check',
                'affects_trading': True,
                'system_component': 'backend'
            },
            'solution_steps': [
                'restart_service:backend',
                'wait:5',
                'check_port:5000'
            ],
            'solution_description': 'Restart backend service and verify port availability'
        },
        {
            'name': 'High Memory Usage',
            'error_type': 'HIGH_MEMORY',
            'error_message': 'Memory usage at 92.5%',
            'context': {
                'component': 'system',
                'operation': 'monitoring',
                'affects_trading': False,
                'system_component': 'system'
            },
            'solution_steps': [
                'cleanup_logs',
                'wait:3',
                'check_disk_space'
            ],
            'solution_description': 'Clean up old logs and temporary files to free memory'
        },
        {
            'name': 'Database Connection Error',
            'error_type': 'DATABASE_CRITICAL',
            'error_message': 'SQLite database locked or corrupted',
            'context': {
                'component': 'database',
                'operation': 'query',
                'affects_trading': True,
                'system_component': 'database'
            },
            'solution_steps': [
                'backup_database',
                'wait:2',
                'restart_service:backend'
            ],
            'solution_description': 'Backup database and restart backend to unlock connections'
        },
        {
            'name': 'API Rate Limit Exceeded',
            'error_type': 'API_CRITICAL',
            'error_message': 'Cryptometer API rate limit exceeded',
            'context': {
                'component': 'external_api',
                'operation': 'api_call',
                'affects_trading': True,
                'system_component': 'api'
            },
            'solution_steps': [
                'wait:60',
                'check_port:443'
            ],
            'solution_description': 'Wait for rate limit reset and verify API connectivity'
        }
    ]
    
    print("🎯 Starting Learning Demonstrations...")
    print()
    
    for i, scenario in enumerate(demo_scenarios, 1):
        print(f"📚 Demo {i}: {scenario['name']}")
        print("-" * 40)
        
        # Simulate problem detection
        print(f"🔍 Analyzing problem: {scenario['error_type']}")
        problem_hash = learning_system.analyze_problem(
            scenario['error_type'],
            scenario['error_message'],
            scenario['context']
        )
        
        print(f"🆔 Problem Hash: {problem_hash[:8]}...")
        
        # Check if we already have a solution
        existing_solution = learning_system.get_learned_solution(problem_hash)
        
        if existing_solution:
            print(f"🧠 Found existing solution (confidence: {existing_solution['confidence']:.2f})")
            print(f"📋 Solution steps: {existing_solution['steps']}")
            
            # Simulate applying the solution
            print("🤖 Applying learned solution...")
            success = learning_system.apply_learned_solution(problem_hash, existing_solution)
            print(f"✅ Solution applied: {'SUCCESS' if success else 'FAILED'}")
        else:
            print("🆕 New problem detected - no existing solution found")
            
            # Simulate manual resolution and learning
            print("👤 Simulating manual resolution...")
            print(f"🔧 Resolution steps: {scenario['solution_steps']}")
            
            # Learn from the manual resolution
            success = True  # Simulate successful manual fix
            learning_system.learn_solution(
                problem_hash=problem_hash,
                solution_description=scenario['solution_description'],
                solution_steps=scenario['solution_steps'],
                success=success
            )
            
            print(f"🎓 Learned new solution (success: {success})")
        
        print()
        time.sleep(2)  # Pause between demos
    
    print("🔄 Testing Learning Effectiveness...")
    print("-" * 40)
    
    # Re-test first scenario to show learning in action
    first_scenario = demo_scenarios[0]
    print(f"🔄 Re-testing: {first_scenario['name']}")
    
    problem_hash = learning_system.analyze_problem(
        first_scenario['error_type'],
        first_scenario['error_message'],
        first_scenario['context']
    )
    
    learned_solution = learning_system.get_learned_solution(problem_hash)
    
    if learned_solution:
        print(f"🧠 System now knows how to solve this problem!")
        print(f"🎯 Confidence level: {learned_solution['confidence']:.2f}")
        print(f"📊 Success count: {learned_solution['success_count']}")
        print(f"🔧 Auto-applying solution...")
        
        success = learning_system.apply_learned_solution(problem_hash, learned_solution)
        print(f"⚡ Auto-resolution: {'SUCCESS' if success else 'FAILED'}")
    else:
        print("❌ Learning failed - solution not found")
    
    print()
    print("📊 Generating Learning Report...")
    print("-" * 40)
    
    # Generate learning report
    report = learning_system.generate_learning_report()
    
    print(f"📚 Total Problems Learned: {report['learning_stats']['total_problems']}")
    print(f"🎯 High-Confidence Solutions: {len(report['best_solutions'])}")
    print(f"🔄 Auto-Resolution Rate: {report['learning_stats'].get('total_problems', 0) and len(report['best_solutions']) / report['learning_stats']['total_problems'] * 100:.1f}%")
    
    print()
    print("📋 Top Problems:")
    for problem in report['top_problems'][:3]:
        print(f"   • {problem['type']}: {problem['occurrences']} times ({problem['severity']})")
    
    print()
    print("🎯 Best Solutions:")
    for solution in report['best_solutions'][:3]:
        print(f"   • {solution['description'][:50]}... (confidence: {solution['confidence']})")
    
    print()
    print("💡 AI Recommendations:")
    for recommendation in report['recommendations']:
        print(f"   • {recommendation}")
    
    print()
    print("🤝 Testing Agent Collaboration...")
    print("-" * 40)
    
    # Simulate sharing a solution with other agents
    if report['best_solutions']:
        best_solution = report['best_solutions'][0]
        print(f"📤 Sharing solution: {best_solution['description'][:50]}...")
        
        # Find the problem hash for this solution
        cursor = learning_system.conn.execute('''
            SELECT problem_hash FROM solutions 
            WHERE solution_description = ? AND confidence_score = ?
            LIMIT 1
        ''', (best_solution['description'], best_solution['confidence']))
        
        result = cursor.fetchone()
        if result:
            problem_hash = result[0]
            
            # Simulate sharing
            learning_system.share_solution_with_agents(
                problem_hash, 
                1,  # solution_id
                best_solution['description']
            )
            print("✅ Solution shared with other doctor agents")
        
        # Simulate collaboration sync
        learning_system.sync_with_other_agents()
        print("🔄 Synced with other doctor agents")
    
    print()
    print("💾 Saving Learning Data...")
    print("-" * 40)
    
    # Save demo report
    demo_report = {
        'demo_date': datetime.now().isoformat(),
        'demo_scenarios': len(demo_scenarios),
        'learning_report': report,
        'demo_status': 'completed'
    }
    
    os.makedirs('doctor_challenges', exist_ok=True)
    with open(f'doctor_challenges/learning_demo_report_{datetime.now().strftime("%Y%m%d_%H%M")}.json', 'w') as f:
        json.dump(demo_report, f, indent=2)
    
    print("📊 Demo report saved to doctor_challenges/")
    
    # Close learning system
    learning_system.close()
    
    print()
    print("🎉 Learning System Demo Complete!")
    print("=" * 50)
    print()
    print("🧠 What you've seen:")
    print("   ✅ Problem analysis and pattern recognition")
    print("   ✅ Solution learning from manual interventions")
    print("   ✅ Automatic problem resolution using learned solutions")
    print("   ✅ Confidence scoring and solution improvement")
    print("   ✅ Agent collaboration and knowledge sharing")
    print("   ✅ Comprehensive reporting and recommendations")
    print()
    print("🚀 Your Enhanced Learning Doctor Agent will:")
    print("   • Learn from every problem encountered")
    print("   • Automatically resolve recurring issues")
    print("   • Share knowledge with other agents")
    print("   • Continuously improve its capabilities")
    print("   • Provide intelligent recommendations")
    print()
    print("💡 To start your Enhanced Learning Doctor Agent:")
    print("   python3 start_learning_doctor.py")
    print()
    print("📚 View generated learning data:")
    print("   ls -la doctor_challenges/")
    print("   sqlite3 doctor_knowledge.db '.tables'")

def show_knowledge_database():
    """Show the contents of the knowledge database"""
    try:
        import sqlite3
        
        if not os.path.exists('doctor_knowledge.db'):
            print("❌ Knowledge database not found. Run the demo first.")
            return
        
        print()
        print("🗄️ Knowledge Database Contents:")
        print("=" * 40)
        
        conn = sqlite3.connect('doctor_knowledge.db')
        
        # Show problems
        cursor = conn.execute("SELECT problem_type, occurrence_count, severity_level FROM problems ORDER BY occurrence_count DESC")
        problems = cursor.fetchall()
        
        print("📚 Learned Problems:")
        for problem_type, count, severity in problems:
            print(f"   • {problem_type}: {count} times ({severity})")
        
        print()
        
        # Show solutions
        cursor = conn.execute('''
            SELECT s.solution_description, s.confidence_score, s.success_count, p.problem_type
            FROM solutions s
            JOIN problems p ON s.problem_hash = p.problem_hash
            ORDER BY s.confidence_score DESC
        ''')
        solutions = cursor.fetchall()
        
        print("🎯 Learned Solutions:")
        for description, confidence, success_count, problem_type in solutions:
            print(f"   • {problem_type}: {description[:40]}... (confidence: {confidence:.2f}, successes: {success_count})")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error accessing knowledge database: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--show-db":
        show_knowledge_database()
    else:
        run_learning_demo()
        
        # Optionally show database contents
        print()
        response = input("🤔 Would you like to see the knowledge database contents? (y/n): ")
        if response.lower() in ['y', 'yes']:
            show_knowledge_database()