#!/usr/bin/env python3
"""
🔗 Doctor Agent Learning Integration Script
==========================================
Integrates the advanced learning system with the existing 24/7 Doctor Agent
"""

import os
import sys
import json
import time
from datetime import datetime
from doctor_agent_learning_system import DoctorLearningSystem, enhance_doctor_with_learning

def integrate_learning_with_doctor():
    """Integrate learning system with existing Doctor Agent"""
    
    print("🧠 Integrating Advanced Learning System with Doctor Agent...")
    
    # Create enhanced Doctor Agent with learning
    try:
        # Import the existing doctor agent
        sys.path.append('.')
        from doctor_agent_24_7 import DoctorAgent24_7
        
        # Create enhanced doctor class
        class LearningSuperDoctorAgent(DoctorAgent24_7):
            def __init__(self):
                super().__init__()
                
                # Initialize learning system
                self.learning_system = DoctorLearningSystem(agent_id="super_doctor_24_7")
                self.logger.info("🧠 Learning system integrated successfully")
                
                # Enhanced configuration for learning
                self.learning_config = {
                    'auto_apply_solutions': True,
                    'share_solutions': True,
                    'collaboration_enabled': True,
                    'challenge_documentation': True,
                    'learning_sync_interval': 300  # 5 minutes
                }
                
                # Learning statistics
                self.learning_stats = {
                    'problems_solved_automatically': 0,
                    'solutions_learned': 0,
                    'collaboration_events': 0,
                    'challenges_documented': 0
                }
                
                # Challenge storage
                self.challenge_notes = []
                self.setup_challenge_system()
            
            def setup_challenge_system(self):
                """Setup challenge documentation system"""
                os.makedirs('doctor_challenges', exist_ok=True)
                self.logger.info("📚 Challenge documentation system initialized")
            
            def send_alert(self, alert_type: str, message: str):
                """Enhanced alert handling with learning"""
                try:
                    # Analyze the problem for learning
                    problem_hash = self.learning_system.analyze_problem(
                        alert_type, 
                        message, 
                        {
                            'component': self.get_component_from_alert(alert_type),
                            'operation': 'monitoring',
                            'affects_trading': self.is_trading_critical(alert_type),
                            'system_component': self.get_system_component(alert_type),
                            'timestamp': datetime.now().isoformat()
                        }
                    )
                    
                    if problem_hash:
                        # Try to apply learned solution first
                        if self.learning_config['auto_apply_solutions']:
                            learned_solution = self.learning_system.get_learned_solution(problem_hash)
                            
                            if learned_solution:
                                self.logger.info(f"🧠 Found learned solution for {alert_type} (confidence: {learned_solution['confidence']:.2f})")
                                
                                success = self.learning_system.apply_learned_solution(problem_hash, learned_solution)
                                
                                if success:
                                    self.learning_stats['problems_solved_automatically'] += 1
                                    self.logger.info(f"✅ Auto-resolved {alert_type} using learned solution #{learned_solution['id']}")
                                    
                                    # Document successful auto-resolution
                                    self.document_auto_resolution(alert_type, message, learned_solution)
                                    return  # Don't send alert if automatically resolved
                                else:
                                    self.logger.warning(f"⚠️ Learned solution failed for {alert_type}")
                            else:
                                # No learned solution - this is a new challenge
                                self.document_new_challenge(alert_type, message, problem_hash)
                    
                    # Send original alert if no solution or solution failed
                    super().send_alert(alert_type, message)
                    
                except Exception as e:
                    self.logger.error(f"❌ Learning-enhanced alert handling failed: {e}")
                    # Fallback to original alert system
                    super().send_alert(alert_type, message)
            
            def get_component_from_alert(self, alert_type: str) -> str:
                """Determine component from alert type"""
                component_map = {
                    'BACKEND_DOWN': 'backend',
                    'FRONTEND_DOWN': 'frontend', 
                    'DATABASE_CRITICAL': 'database',
                    'API_CRITICAL': 'external_api',
                    'SECURITY_CRITICAL': 'security',
                    'HIGH_CPU': 'system',
                    'HIGH_MEMORY': 'system',
                    'LOW_DISK': 'system'
                }
                return component_map.get(alert_type, 'unknown')
            
            def is_trading_critical(self, alert_type: str) -> bool:
                """Determine if alert affects trading operations"""
                critical_alerts = [
                    'BACKEND_DOWN', 'DATABASE_CRITICAL', 'API_CRITICAL', 
                    'SECURITY_CRITICAL'
                ]
                return alert_type in critical_alerts
            
            def get_system_component(self, alert_type: str) -> str:
                """Get system component for context"""
                if 'BACKEND' in alert_type:
                    return 'backend'
                elif 'FRONTEND' in alert_type:
                    return 'frontend'
                elif 'DATABASE' in alert_type:
                    return 'database'
                elif 'API' in alert_type:
                    return 'api'
                else:
                    return 'system'
            
            def document_auto_resolution(self, alert_type: str, message: str, solution: dict):
                """Document successful automatic problem resolution"""
                try:
                    resolution_doc = {
                        'timestamp': datetime.now().isoformat(),
                        'alert_type': alert_type,
                        'alert_message': message,
                        'solution_id': solution['id'],
                        'solution_description': solution['description'],
                        'solution_confidence': solution['confidence'],
                        'resolution_method': 'automatic_learned_solution',
                        'impact': 'prevented_system_disruption'
                    }
                    
                    # Save to resolutions log
                    resolution_file = f"doctor_challenges/auto_resolutions_{datetime.now().strftime('%Y%m%d')}.json"
                    
                    if os.path.exists(resolution_file):
                        with open(resolution_file, 'r') as f:
                            resolutions = json.load(f)
                    else:
                        resolutions = []
                    
                    resolutions.append(resolution_doc)
                    
                    with open(resolution_file, 'w') as f:
                        json.dump(resolutions, f, indent=2)
                    
                    self.logger.info(f"📝 Documented auto-resolution for {alert_type}")
                    
                except Exception as e:
                    self.logger.error(f"❌ Failed to document auto-resolution: {e}")
            
            def document_new_challenge(self, alert_type: str, message: str, problem_hash: str):
                """Document a new challenge that needs manual resolution"""
                try:
                    challenge_doc = {
                        'timestamp': datetime.now().isoformat(),
                        'problem_hash': problem_hash,
                        'challenge_type': alert_type,
                        'challenge_description': message,
                        'status': 'new_challenge',
                        'resolution_steps': [],
                        'learning_notes': f"New {alert_type} challenge - requires manual intervention and solution learning",
                        'priority': self.assess_challenge_priority(alert_type),
                        'affects_trading': self.is_trading_critical(alert_type)
                    }
                    
                    # Save challenge for future learning
                    challenge_file = f"doctor_challenges/new_challenges_{datetime.now().strftime('%Y%m%d')}.json"
                    
                    if os.path.exists(challenge_file):
                        with open(challenge_file, 'r') as f:
                            challenges = json.load(f)
                    else:
                        challenges = []
                    
                    challenges.append(challenge_doc)
                    
                    with open(challenge_file, 'w') as f:
                        json.dump(challenges, f, indent=2)
                    
                    self.learning_stats['challenges_documented'] += 1
                    self.logger.info(f"📚 Documented new challenge: {alert_type} ({problem_hash[:8]})")
                    
                except Exception as e:
                    self.logger.error(f"❌ Failed to document new challenge: {e}")
            
            def assess_challenge_priority(self, alert_type: str) -> str:
                """Assess priority level of a new challenge"""
                if alert_type in ['BACKEND_DOWN', 'DATABASE_CRITICAL']:
                    return 'CRITICAL'
                elif alert_type in ['API_CRITICAL', 'SECURITY_CRITICAL']:
                    return 'HIGH'
                elif alert_type in ['HIGH_CPU', 'HIGH_MEMORY', 'LOW_DISK']:
                    return 'MEDIUM'
                else:
                    return 'LOW'
            
            def learn_from_manual_resolution(self, problem_hash: str, resolution_steps: list, 
                                           success: bool, notes: str = ""):
                """Learn from manual problem resolution"""
                try:
                    if not problem_hash or not resolution_steps:
                        return
                    
                    # Create solution description
                    solution_description = f"Manual resolution: {notes}" if notes else "Manual resolution steps"
                    
                    # Learn the solution
                    self.learning_system.learn_solution(
                        problem_hash=problem_hash,
                        solution_description=solution_description,
                        solution_steps=resolution_steps,
                        success=success
                    )
                    
                    self.learning_stats['solutions_learned'] += 1
                    self.logger.info(f"🎓 Learned from manual resolution: {problem_hash[:8]} ({'success' if success else 'failure'})")
                    
                    # Update challenge documentation
                    self.update_challenge_resolution(problem_hash, resolution_steps, success, notes)
                    
                except Exception as e:
                    self.logger.error(f"❌ Failed to learn from manual resolution: {e}")
            
            def update_challenge_resolution(self, problem_hash: str, resolution_steps: list, 
                                          success: bool, notes: str):
                """Update challenge documentation with resolution"""
                try:
                    today = datetime.now().strftime('%Y%m%d')
                    challenge_file = f"doctor_challenges/new_challenges_{today}.json"
                    
                    if os.path.exists(challenge_file):
                        with open(challenge_file, 'r') as f:
                            challenges = json.load(f)
                        
                        # Find and update the challenge
                        for challenge in challenges:
                            if challenge.get('problem_hash') == problem_hash:
                                challenge['status'] = 'resolved' if success else 'resolution_failed'
                                challenge['resolution_steps'] = resolution_steps
                                challenge['resolution_notes'] = notes
                                challenge['resolved_at'] = datetime.now().isoformat()
                                challenge['resolution_success'] = success
                                break
                        
                        with open(challenge_file, 'w') as f:
                            json.dump(challenges, f, indent=2)
                        
                        self.logger.info(f"📝 Updated challenge resolution: {problem_hash[:8]}")
                
                except Exception as e:
                    self.logger.error(f"❌ Failed to update challenge resolution: {e}")
            
            def collaborate_with_other_agents(self):
                """Enhanced collaboration with other doctor agents"""
                try:
                    if not self.learning_config['collaboration_enabled']:
                        return
                    
                    # Sync learning with other agents
                    self.learning_system.sync_with_other_agents()
                    self.learning_stats['collaboration_events'] += 1
                    
                    # Share high-confidence solutions
                    self.share_best_solutions()
                    
                    self.logger.info("🤝 Collaborated with other doctor agents")
                    
                except Exception as e:
                    self.logger.error(f"❌ Collaboration failed: {e}")
            
            def share_best_solutions(self):
                """Share best solutions with other agents"""
                try:
                    # Get high-confidence solutions to share
                    cursor = self.learning_system.conn.execute('''
                        SELECT problem_hash, id, solution_description, confidence_score
                        FROM solutions 
                        WHERE confidence_score >= 0.9 
                          AND success_count >= 3
                          AND created_by = ?
                        ORDER BY confidence_score DESC
                        LIMIT 5
                    ''', (self.learning_system.agent_id,))
                    
                    solutions_to_share = cursor.fetchall()
                    
                    for problem_hash, solution_id, description, confidence in solutions_to_share:
                        if self.learning_system.should_share_solution(problem_hash, solution_id):
                            self.learning_system.share_solution_with_agents(
                                problem_hash, solution_id, description
                            )
                    
                except Exception as e:
                    self.logger.error(f"❌ Failed to share best solutions: {e}")
            
            def generate_daily_learning_report(self):
                """Generate comprehensive daily learning report"""
                try:
                    # Get basic learning report
                    learning_report = self.learning_system.generate_learning_report()
                    
                    # Add enhanced statistics
                    learning_report.update({
                        'enhanced_stats': self.learning_stats.copy(),
                        'learning_config': self.learning_config.copy(),
                        'system_immunity_level': self.calculate_immunity_level(),
                        'challenge_summary': self.get_challenge_summary(),
                        'collaboration_effectiveness': self.assess_collaboration_effectiveness()
                    })
                    
                    # Save daily learning report
                    report_file = f"doctor_challenges/daily_learning_report_{datetime.now().strftime('%Y%m%d')}.json"
                    with open(report_file, 'w') as f:
                        json.dump(learning_report, f, indent=2)
                    
                    self.logger.info(f"📊 Generated daily learning report: {report_file}")
                    return learning_report
                    
                except Exception as e:
                    self.logger.error(f"❌ Failed to generate daily learning report: {e}")
                    return None
            
            def calculate_immunity_level(self) -> str:
                """Calculate system immunity level based on learning"""
                try:
                    # Get problem resolution rate
                    cursor = self.learning_system.conn.execute('''
                        SELECT 
                            COUNT(*) as total_problems,
                            COUNT(CASE WHEN s.confidence_score >= 0.8 THEN 1 END) as solved_problems
                        FROM problems p
                        LEFT JOIN solutions s ON p.problem_hash = s.problem_hash
                    ''')
                    
                    stats = cursor.fetchone()
                    if stats and stats[0] > 0:
                        resolution_rate = stats[1] / stats[0]
                        
                        if resolution_rate >= 0.9:
                            return "MAXIMUM_IMMUNITY"
                        elif resolution_rate >= 0.7:
                            return "HIGH_IMMUNITY"
                        elif resolution_rate >= 0.5:
                            return "MODERATE_IMMUNITY"
                        else:
                            return "BUILDING_IMMUNITY"
                    
                    return "INITIAL_LEARNING"
                    
                except Exception as e:
                    self.logger.error(f"❌ Failed to calculate immunity level: {e}")
                    return "UNKNOWN"
            
            def get_challenge_summary(self) -> dict:
                """Get summary of recent challenges"""
                try:
                    today = datetime.now().strftime('%Y%m%d')
                    challenge_file = f"doctor_challenges/new_challenges_{today}.json"
                    
                    if os.path.exists(challenge_file):
                        with open(challenge_file, 'r') as f:
                            challenges = json.load(f)
                        
                        return {
                            'total_challenges': len(challenges),
                            'resolved_challenges': len([c for c in challenges if c.get('status') == 'resolved']),
                            'critical_challenges': len([c for c in challenges if c.get('priority') == 'CRITICAL']),
                            'trading_affecting_challenges': len([c for c in challenges if c.get('affects_trading')])
                        }
                    
                    return {'total_challenges': 0, 'resolved_challenges': 0, 'critical_challenges': 0, 'trading_affecting_challenges': 0}
                    
                except Exception as e:
                    self.logger.error(f"❌ Failed to get challenge summary: {e}")
                    return {}
            
            def assess_collaboration_effectiveness(self) -> dict:
                """Assess how effective collaboration with other agents has been"""
                try:
                    cursor = self.learning_system.conn.execute('''
                        SELECT 
                            COUNT(CASE WHEN source_agent = ? AND status = 'PROCESSED' THEN 1 END) as solutions_shared,
                            COUNT(CASE WHEN source_agent != ? AND status = 'PROCESSED' THEN 1 END) as solutions_received,
                            COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_collaborations
                        FROM agent_collaboration 
                        WHERE created_at >= datetime('now', '-7 days')
                    ''', (self.learning_system.agent_id, self.learning_system.agent_id))
                    
                    stats = cursor.fetchone()
                    if stats:
                        return {
                            'solutions_shared': stats[0],
                            'solutions_received': stats[1],
                            'failed_collaborations': stats[2],
                            'collaboration_success_rate': (stats[0] + stats[1]) / max(1, sum(stats)) * 100
                        }
                    
                    return {'solutions_shared': 0, 'solutions_received': 0, 'failed_collaborations': 0, 'collaboration_success_rate': 0}
                    
                except Exception as e:
                    self.logger.error(f"❌ Failed to assess collaboration effectiveness: {e}")
                    return {}
            
            def run_24_7(self):
                """Enhanced 24/7 operation with learning integration"""
                self.logger.info("🧠 Starting Enhanced Learning Doctor Agent 24/7...")
                self.logger.info("🎓 Advanced learning and collaboration system active!")
                
                # Schedule learning tasks
                self.schedule_learning_tasks()
                
                # Start collaboration sync
                last_collaboration_sync = time.time()
                last_learning_report = time.time()
                
                # Main monitoring loop with learning
                while True:
                    try:
                        current_time = time.time()
                        
                        # Run scheduled tasks
                        self.check_and_run_daily_tasks()
                        
                        # Collaborate with other agents periodically
                        if current_time - last_collaboration_sync >= self.learning_config['learning_sync_interval']:
                            self.collaborate_with_other_agents()
                            last_collaboration_sync = current_time
                        
                        # Generate learning report daily
                        if current_time - last_learning_report >= 86400:  # 24 hours
                            self.generate_daily_learning_report()
                            last_learning_report = current_time
                        
                        # Run health check cycle
                        self.run_health_check_cycle()
                        
                        # Wait for next check
                        time.sleep(self.config['check_interval'])
                        
                    except KeyboardInterrupt:
                        self.logger.info("👋 Enhanced Doctor Agent shutting down gracefully...")
                        break
                    except Exception as e:
                        self.logger.error(f"❌ Unexpected error in enhanced main loop: {e}")
                        time.sleep(60)  # Wait before retrying
                
                # Close learning system
                self.learning_system.close()
            
            def schedule_learning_tasks(self):
                """Initialize learning task tracking"""
                super().schedule_daily_tasks()
                
                # Additional learning tasks
                self.last_learning_report = datetime.now().date()
                self.last_collaboration_sync = datetime.now()
        
        # Create and return the enhanced doctor agent
        return LearningSuperDoctorAgent
        
    except Exception as e:
        print(f"❌ Failed to create enhanced doctor agent: {e}")
        return None

def create_learning_documentation():
    """Create documentation for the learning system"""
    
    print("📚 Creating learning system documentation...")
    
    docs = {
        'learning_commands.md': """# 🧠 Doctor Agent Learning Commands

## Manual Learning Commands

### Learn from Manual Resolution
```python
# After manually fixing a problem, teach the system:
doctor.learn_from_manual_resolution(
    problem_hash="abc123def456",
    resolution_steps=[
        "restart_service:backend",
        "wait:5", 
        "check_port:5000"
    ],
    success=True,
    notes="Backend needed restart after high memory usage"
)
```

### Document New Challenge
```python
# When encountering a new type of problem:
doctor.document_new_challenge(
    alert_type="NEW_ERROR_TYPE",
    message="Description of the new problem",
    problem_hash="generated_hash"
)
```

## Learning System API

### Check Learned Solutions
```python
solution = doctor.learning_system.get_learned_solution(problem_hash)
if solution:
    print(f"Confidence: {solution['confidence']}")
    print(f"Steps: {solution['steps']}")
```

### Generate Learning Report
```python
report = doctor.generate_daily_learning_report()
print(f"Problems solved automatically: {report['enhanced_stats']['problems_solved_automatically']}")
print(f"System immunity level: {report['system_immunity_level']}")
```

## Challenge Documentation

### View Recent Challenges
```bash
# Check new challenges
cat doctor_challenges/new_challenges_$(date +%Y%m%d).json

# Check auto-resolutions  
cat doctor_challenges/auto_resolutions_$(date +%Y%m%d).json

# View learning report
cat doctor_challenges/daily_learning_report_$(date +%Y%m%d).json
```

### Challenge File Structure
- `doctor_challenges/new_challenges_YYYYMMDD.json` - New problems to solve
- `doctor_challenges/auto_resolutions_YYYYMMDD.json` - Successfully auto-resolved issues
- `doctor_challenges/daily_learning_report_YYYYMMDD.json` - Daily learning analysis
""",
        
        'learning_workflow.md': """# 🔄 Learning System Workflow

## Problem Detection & Learning Flow

```
1. Problem Detected
   ├── Analyze Problem → Create Problem Hash
   ├── Check for Learned Solution
   │   ├── Found: Apply Automatically
   │   │   ├── Success: Update Solution Confidence
   │   │   └── Failure: Learn from Failure
   │   └── Not Found: Document as New Challenge
   └── Share Solution with Other Agents (if successful)

2. Manual Resolution
   ├── Document Resolution Steps
   ├── Learn Solution for Future Use
   ├── Update Challenge Status
   └── Test Solution Confidence

3. Collaboration
   ├── Share High-Confidence Solutions
   ├── Receive Solutions from Other Agents
   ├── Sync Learning Databases
   └── Update Collaboration Stats
```

## Learning Levels

### Level 1: Problem Recognition
- System identifies and categorizes problems
- Creates unique fingerprints for problem types
- Tracks occurrence frequency and patterns

### Level 2: Solution Learning
- Learns from manual interventions
- Builds confidence scores for solutions
- Tests solution effectiveness over time

### Level 3: Auto-Resolution
- Automatically applies high-confidence solutions
- Self-heals without human intervention
- Reduces alert fatigue and downtime

### Level 4: Collaboration
- Shares knowledge with other doctor agents
- Benefits from collective learning experience
- Builds distributed immunity across systems

### Level 5: Predictive Prevention
- Identifies patterns before problems occur
- Proactively applies preventive measures
- Optimizes system performance continuously
""",
        
        'integration_guide.md': """# 🔗 Integration Guide for Learning Doctor Agent

## Quick Integration

### 1. Stop Current Doctor Agent
```bash
./stop_doctor.sh
```

### 2. Run Integration Script
```bash
python3 integrate_learning_system.py
```

### 3. Start Enhanced Doctor Agent
```bash
./start_learning_doctor.sh
```

## Manual Integration Steps

### 1. Import Learning System
```python
from doctor_agent_learning_system import DoctorLearningSystem
from integrate_learning_system import integrate_learning_with_doctor

# Add to existing doctor agent
enhanced_doctor_class = integrate_learning_with_doctor()
doctor = enhanced_doctor_class()
```

### 2. Configure Learning
```python
doctor.learning_config = {
    'auto_apply_solutions': True,      # Auto-apply learned solutions
    'share_solutions': True,           # Share with other agents
    'collaboration_enabled': True,     # Enable agent collaboration  
    'challenge_documentation': True,   # Document new challenges
    'learning_sync_interval': 300      # Sync every 5 minutes
}
```

### 3. Start Enhanced Monitoring
```python
doctor.run_24_7()  # Includes learning capabilities
```

## Verification

### Check Learning System Status
```python
# Verify learning system is active
print(f"Learning System: {'✅ Active' if hasattr(doctor, 'learning_system') else '❌ Not Found'}")

# Check learning statistics
print(f"Problems solved automatically: {doctor.learning_stats['problems_solved_automatically']}")
print(f"Solutions learned: {doctor.learning_stats['solutions_learned']}")
print(f"Challenges documented: {doctor.learning_stats['challenges_documented']}")
```

### Monitor Learning Activity
```bash
# Watch learning logs
tail -f doctor_learning/learning_super_doctor_24_7_$(date +%Y%m%d).log

# Check knowledge database
sqlite3 doctor_knowledge.db "SELECT COUNT(*) FROM problems;"
sqlite3 doctor_knowledge.db "SELECT COUNT(*) FROM solutions WHERE confidence_score >= 0.8;"
```

## Troubleshooting

### Learning System Not Starting
1. Check Python dependencies: `pip3 install sqlite3`
2. Verify file permissions: `chmod +x integrate_learning_system.py`
3. Check logs: `tail doctor_learning/learning_*.log`

### Solutions Not Auto-Applying
1. Check confidence threshold in config
2. Verify problem hash matching
3. Review solution step execution logs

### Collaboration Not Working
1. Ensure multiple doctor agents are running
2. Check database permissions
3. Verify sync interval configuration
"""
    }
    
    # Create documentation files
    os.makedirs('doctor_learning_docs', exist_ok=True)
    
    for filename, content in docs.items():
        filepath = f'doctor_learning_docs/{filename}'
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"📝 Created: {filepath}")
    
    print("✅ Learning system documentation created!")

if __name__ == "__main__":
    print("🧠 Doctor Agent Learning Integration")
    print("=" * 50)
    
    # Create enhanced doctor agent class
    enhanced_doctor_class = integrate_learning_with_doctor()
    
    if enhanced_doctor_class:
        print("✅ Enhanced Doctor Agent class created successfully!")
        print("🧠 Learning capabilities integrated:")
        print("   - Problem pattern recognition")
        print("   - Solution learning and auto-application") 
        print("   - Agent collaboration and knowledge sharing")
        print("   - Challenge documentation and tracking")
        print("   - Self-improvement and adaptation")
        print()
        
        # Create documentation
        create_learning_documentation()
        print()
        
        print("🚀 To use the enhanced doctor agent:")
        print("   1. Stop current doctor: ./stop_doctor.sh")
        print("   2. Start enhanced version: python3 start_learning_doctor.py")
        print("   3. Monitor learning: tail -f doctor_learning/*.log")
        print()
        print("📚 Documentation available in: doctor_learning_docs/")
        
    else:
        print("❌ Failed to create enhanced doctor agent!")
        print("Please check the error messages above.")