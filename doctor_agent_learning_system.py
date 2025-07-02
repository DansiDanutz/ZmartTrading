#!/usr/bin/env python3
"""
🧠 ZMart Trading Bot - Doctor Agent Learning System
================================================
Advanced self-learning module that learns from mistakes, stores solutions,
and collaborates with other doctor agents to build system immunity.
"""

import json
import sqlite3
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import os
import logging
import traceback
from pathlib import Path

class DoctorLearningSystem:
    def __init__(self, agent_id="doctor_24_7", knowledge_db="doctor_knowledge.db"):
        self.agent_id = agent_id
        self.knowledge_db = knowledge_db
        self.setup_logging()
        self.setup_knowledge_base()
        self.learned_solutions = {}
        self.problem_patterns = {}
        self.success_rate = {}
        
        # Learning configuration
        self.config = {
            'min_pattern_occurrences': 3,  # Minimum times a pattern must occur to be learned
            'solution_confidence_threshold': 0.8,  # Confidence level to auto-apply solutions
            'learning_window_hours': 168,  # 7 days learning window
            'max_stored_solutions': 1000,  # Maximum solutions to store
            'collaboration_sync_interval': 300  # 5 minutes between agent sync
        }
        
        self.logger.info(f"🧠 Doctor Learning System initialized for agent: {agent_id}")

    def setup_logging(self):
        """Setup learning system logging"""
        os.makedirs('doctor_learning', exist_ok=True)
        
        self.logger = logging.getLogger(f'DoctorLearning_{self.agent_id}')
        self.logger.setLevel(logging.INFO)
        
        # File handler for learning logs
        learning_log = f'doctor_learning/learning_{self.agent_id}_{datetime.now().strftime("%Y%m%d")}.log'
        file_handler = logging.FileHandler(learning_log)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s | %(levelname)s | %(funcName)s:%(lineno)d | %(message)s'
        ))
        self.logger.addHandler(file_handler)

    def setup_knowledge_base(self):
        """Initialize the knowledge database"""
        try:
            self.conn = sqlite3.connect(self.knowledge_db, check_same_thread=False)
            self.conn.execute('PRAGMA journal_mode=WAL')  # Enable concurrent access
            
            # Create knowledge tables
            self.conn.executescript('''
                CREATE TABLE IF NOT EXISTS problems (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    problem_hash TEXT UNIQUE NOT NULL,
                    problem_type TEXT NOT NULL,
                    problem_description TEXT NOT NULL,
                    error_signature TEXT,
                    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    occurrence_count INTEGER DEFAULT 1,
                    severity_level TEXT DEFAULT 'MEDIUM'
                );
                
                CREATE TABLE IF NOT EXISTS solutions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    problem_hash TEXT NOT NULL,
                    solution_description TEXT NOT NULL,
                    solution_steps TEXT NOT NULL,  -- JSON array of steps
                    success_count INTEGER DEFAULT 0,
                    failure_count INTEGER DEFAULT 0,
                    confidence_score REAL DEFAULT 0.0,
                    created_by TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_used TIMESTAMP,
                    FOREIGN KEY (problem_hash) REFERENCES problems (problem_hash)
                );
                
                CREATE TABLE IF NOT EXISTS learning_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    agent_id TEXT NOT NULL,
                    event_type TEXT NOT NULL,  -- 'PROBLEM_DETECTED', 'SOLUTION_APPLIED', 'LEARNING_UPDATED'
                    problem_hash TEXT,
                    solution_id INTEGER,
                    success BOOLEAN,
                    details TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS agent_collaboration (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source_agent TEXT NOT NULL,
                    target_agent TEXT,
                    message_type TEXT NOT NULL,  -- 'SHARE_SOLUTION', 'REQUEST_HELP', 'STATUS_UPDATE'
                    content TEXT NOT NULL,
                    status TEXT DEFAULT 'PENDING',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed_at TIMESTAMP
                );
                
                CREATE INDEX IF NOT EXISTS idx_problems_hash ON problems(problem_hash);
                CREATE INDEX IF NOT EXISTS idx_solutions_problem ON solutions(problem_hash);
                CREATE INDEX IF NOT EXISTS idx_learning_events_agent ON learning_events(agent_id);
                CREATE INDEX IF NOT EXISTS idx_collaboration_agents ON agent_collaboration(source_agent, target_agent);
            ''')
            
            self.conn.commit()
            self.logger.info("🗄️ Knowledge base initialized successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to setup knowledge base: {e}")
            raise

    def analyze_problem(self, error_type: str, error_message: str, context: Dict[str, Any]) -> str:
        """Analyze a problem and create a unique fingerprint"""
        try:
            # Create problem signature
            problem_components = [
                error_type.upper(),
                self.normalize_error_message(error_message),
                context.get('component', ''),
                context.get('operation', '')
            ]
            
            problem_signature = '|'.join(filter(None, problem_components))
            problem_hash = hashlib.md5(problem_signature.encode()).hexdigest()
            
            # Store or update problem in knowledge base
            self.store_problem(problem_hash, error_type, error_message, problem_signature, context)
            
            self.logger.info(f"🔍 Problem analyzed: {error_type} -> {problem_hash[:8]}")
            return problem_hash
            
        except Exception as e:
            self.logger.error(f"❌ Failed to analyze problem: {e}")
            return None

    def normalize_error_message(self, error_message: str) -> str:
        """Normalize error messages to identify patterns"""
        # Remove dynamic content like timestamps, PIDs, specific file paths
        import re
        
        normalized = error_message.lower()
        
        # Remove common dynamic elements
        patterns_to_remove = [
            r'\d{4}-\d{2}-\d{2}[\s\d:.-]*',  # Timestamps
            r'pid\s*\d+',  # Process IDs
            r'port\s*\d+',  # Port numbers
            r'/[a-zA-Z0-9_./]*\.py',  # File paths
            r'line\s*\d+',  # Line numbers
            r'\d+\.\d+\.\d+\.\d+',  # IP addresses
        ]
        
        for pattern in patterns_to_remove:
            normalized = re.sub(pattern, '', normalized)
        
        # Clean up extra whitespace
        normalized = ' '.join(normalized.split())
        
        return normalized

    def store_problem(self, problem_hash: str, problem_type: str, description: str, 
                     signature: str, context: Dict[str, Any]):
        """Store or update problem in knowledge base"""
        try:
            severity = self.assess_severity(problem_type, context)
            
            # Check if problem exists
            cursor = self.conn.execute(
                "SELECT occurrence_count FROM problems WHERE problem_hash = ?",
                (problem_hash,)
            )
            existing = cursor.fetchone()
            
            if existing:
                # Update existing problem
                new_count = existing[0] + 1
                self.conn.execute('''
                    UPDATE problems 
                    SET last_seen = CURRENT_TIMESTAMP, occurrence_count = ?
                    WHERE problem_hash = ?
                ''', (new_count, problem_hash))
                
                self.logger.info(f"📈 Problem updated: {problem_hash[:8]} (count: {new_count})")
            else:
                # Insert new problem
                self.conn.execute('''
                    INSERT INTO problems (problem_hash, problem_type, problem_description, 
                                        error_signature, severity_level)
                    VALUES (?, ?, ?, ?, ?)
                ''', (problem_hash, problem_type, description, signature, severity))
                
                self.logger.info(f"🆕 New problem stored: {problem_hash[:8]} ({severity})")
            
            self.conn.commit()
            
            # Log learning event
            self.log_learning_event('PROBLEM_DETECTED', problem_hash, None, True, 
                                  f"Problem: {problem_type} - {description[:100]}")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to store problem: {e}")

    def assess_severity(self, problem_type: str, context: Dict[str, Any]) -> str:
        """Assess problem severity based on type and context"""
        critical_types = ['BACKEND_DOWN', 'DATABASE_CRITICAL', 'API_CRITICAL', 'SECURITY_CRITICAL']
        warning_types = ['HIGH_CPU', 'HIGH_MEMORY', 'LOW_DISK']
        
        if problem_type in critical_types:
            return 'CRITICAL'
        elif problem_type in warning_types:
            return 'WARNING'
        elif context.get('affects_trading', False):
            return 'CRITICAL'
        elif context.get('system_component') in ['backend', 'frontend', 'database']:
            return 'HIGH'
        else:
            return 'MEDIUM'

    def learn_solution(self, problem_hash: str, solution_description: str, 
                      solution_steps: List[str], success: bool, execution_time: float = None):
        """Learn from a solution attempt"""
        try:
            if not problem_hash:
                return
            
            # Convert steps to JSON
            steps_json = json.dumps(solution_steps)
            
            # Check if solution exists
            cursor = self.conn.execute('''
                SELECT id, success_count, failure_count, confidence_score 
                FROM solutions 
                WHERE problem_hash = ? AND solution_steps = ?
            ''', (problem_hash, steps_json))
            
            existing = cursor.fetchone()
            
            if existing:
                solution_id, success_count, failure_count, confidence = existing
                
                # Update existing solution
                if success:
                    success_count += 1
                else:
                    failure_count += 1
                
                # Recalculate confidence score
                total_attempts = success_count + failure_count
                new_confidence = success_count / total_attempts if total_attempts > 0 else 0
                
                # Apply learning curve bonus for frequently successful solutions
                if success_count >= 5:
                    new_confidence = min(1.0, new_confidence + 0.1)
                
                self.conn.execute('''
                    UPDATE solutions 
                    SET success_count = ?, failure_count = ?, confidence_score = ?, last_used = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (success_count, failure_count, new_confidence, solution_id))
                
                self.logger.info(f"📚 Solution updated: {solution_id} (confidence: {new_confidence:.2f})")
                
            else:
                # Create new solution
                initial_confidence = 1.0 if success else 0.1
                success_count = 1 if success else 0
                failure_count = 0 if success else 1
                
                cursor = self.conn.execute('''
                    INSERT INTO solutions (problem_hash, solution_description, solution_steps, 
                                         success_count, failure_count, confidence_score, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (problem_hash, solution_description, steps_json, success_count, 
                      failure_count, initial_confidence, self.agent_id))
                
                solution_id = cursor.lastrowid
                self.logger.info(f"🆕 New solution learned: {solution_id} for problem {problem_hash[:8]}")
            
            self.conn.commit()
            
            # Log learning event
            self.log_learning_event('SOLUTION_APPLIED', problem_hash, solution_id, success,
                                  f"Solution: {solution_description[:100]}")
            
            # Check if we should share this solution with other agents
            if success and self.should_share_solution(problem_hash, solution_id):
                self.share_solution_with_agents(problem_hash, solution_id, solution_description)
            
        except Exception as e:
            self.logger.error(f"❌ Failed to learn solution: {e}")

    def get_learned_solution(self, problem_hash: str) -> Optional[Dict[str, Any]]:
        """Get the best learned solution for a problem"""
        try:
            cursor = self.conn.execute('''
                SELECT id, solution_description, solution_steps, confidence_score, 
                       success_count, failure_count, last_used
                FROM solutions 
                WHERE problem_hash = ? AND confidence_score >= ?
                ORDER BY confidence_score DESC, success_count DESC
                LIMIT 1
            ''', (problem_hash, self.config['solution_confidence_threshold']))
            
            result = cursor.fetchone()
            if result:
                solution_id, description, steps_json, confidence, success_count, failure_count, last_used = result
                
                solution = {
                    'id': solution_id,
                    'description': description,
                    'steps': json.loads(steps_json),
                    'confidence': confidence,
                    'success_count': success_count,
                    'failure_count': failure_count,
                    'last_used': last_used
                }
                
                self.logger.info(f"💡 Found learned solution: {solution_id} (confidence: {confidence:.2f})")
                return solution
            
            return None
            
        except Exception as e:
            self.logger.error(f"❌ Failed to get learned solution: {e}")
            return None

    def apply_learned_solution(self, problem_hash: str, solution: Dict[str, Any]) -> bool:
        """Apply a learned solution automatically"""
        try:
            steps = solution['steps']
            solution_id = solution['id']
            
            self.logger.info(f"🤖 Applying learned solution {solution_id} for problem {problem_hash[:8]}")
            
            success = True
            executed_steps = []
            
            for i, step in enumerate(steps):
                try:
                    step_result = self.execute_solution_step(step)
                    executed_steps.append({
                        'step': step,
                        'success': step_result,
                        'timestamp': datetime.now().isoformat()
                    })
                    
                    if not step_result:
                        success = False
                        self.logger.warning(f"⚠️ Solution step {i+1} failed: {step}")
                        break
                        
                except Exception as e:
                    executed_steps.append({
                        'step': step,
                        'success': False,
                        'error': str(e),
                        'timestamp': datetime.now().isoformat()
                    })
                    success = False
                    self.logger.error(f"❌ Solution step {i+1} error: {e}")
                    break
            
            # Update solution success/failure
            self.learn_solution(problem_hash, solution['description'], steps, success)
            
            # Log the application
            self.log_learning_event('SOLUTION_APPLIED', problem_hash, solution_id, success,
                                  f"Auto-applied solution with {len(executed_steps)} steps")
            
            return success
            
        except Exception as e:
            self.logger.error(f"❌ Failed to apply learned solution: {e}")
            return False

    def execute_solution_step(self, step: str) -> bool:
        """Execute a single solution step"""
        try:
            # Parse step command
            if step.startswith('restart_service:'):
                service = step.split(':', 1)[1]
                return self.restart_service(service)
            
            elif step.startswith('check_port:'):
                port = int(step.split(':', 1)[1])
                return self.check_port_availability(port)
            
            elif step.startswith('wait:'):
                seconds = int(step.split(':', 1)[1])
                time.sleep(seconds)
                return True
            
            elif step.startswith('cleanup_logs'):
                return self.cleanup_old_logs()
            
            elif step.startswith('backup_database'):
                return self.backup_critical_databases()
            
            elif step.startswith('check_disk_space'):
                return self.check_disk_space()
            
            else:
                self.logger.warning(f"⚠️ Unknown solution step: {step}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Failed to execute step '{step}': {e}")
            return False

    def restart_service(self, service: str) -> bool:
        """Restart a specific service"""
        try:
            import subprocess
            
            if service == 'backend':
                subprocess.run(['pkill', '-f', 'app.py'], stderr=subprocess.DEVNULL)
                time.sleep(2)
                os.chdir('backend')
                subprocess.Popen(['python3', 'app.py'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                os.chdir('..')
                return True
                
            elif service == 'frontend':
                subprocess.run(['pkill', '-f', 'npm.*start'], stderr=subprocess.DEVNULL)
                time.sleep(2)
                subprocess.Popen(['npm', 'start'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                return True
                
            return False
            
        except Exception as e:
            self.logger.error(f"❌ Failed to restart service {service}: {e}")
            return False

    def check_port_availability(self, port: int) -> bool:
        """Check if a port is available"""
        try:
            import socket
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(5)
                result = sock.connect_ex(('localhost', port))
                return result == 0
        except:
            return False

    def cleanup_old_logs(self) -> bool:
        """Cleanup old log files"""
        try:
            cutoff_date = datetime.now() - timedelta(days=7)
            cleaned_count = 0
            
            for log_dir in ['doctor_logs', 'doctor_treatments', 'doctor_learning']:
                if os.path.exists(log_dir):
                    for filename in os.listdir(log_dir):
                        file_path = os.path.join(log_dir, filename)
                        if os.path.isfile(file_path):
                            file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                            if file_time < cutoff_date:
                                os.remove(file_path)
                                cleaned_count += 1
            
            self.logger.info(f"🗑️ Cleaned {cleaned_count} old log files")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Log cleanup failed: {e}")
            return False

    def backup_critical_databases(self) -> bool:
        """Backup critical databases"""
        try:
            import subprocess
            backup_dir = f'doctor_backups/auto_backup_{datetime.now().strftime("%Y%m%d_%H%M")}'
            os.makedirs(backup_dir, exist_ok=True)
            
            critical_dbs = [
                'backend/instance/zmarttrading.db',
                'riskmetric_history.db',
                'real_timespend.db',
                'lifetime_age.db',
                self.knowledge_db
            ]
            
            backed_up = 0
            for db_path in critical_dbs:
                if os.path.exists(db_path):
                    backup_path = os.path.join(backup_dir, os.path.basename(db_path))
                    subprocess.run(['cp', db_path, backup_path])
                    backed_up += 1
            
            self.logger.info(f"💾 Backed up {backed_up} databases to {backup_dir}")
            return backed_up > 0
            
        except Exception as e:
            self.logger.error(f"❌ Database backup failed: {e}")
            return False

    def check_disk_space(self) -> bool:
        """Check if disk space is adequate"""
        try:
            import shutil
            total, used, free = shutil.disk_usage('/')
            free_percent = (free / total) * 100
            return free_percent > 10  # At least 10% free space
        except:
            return False

    def should_share_solution(self, problem_hash: str, solution_id: int) -> bool:
        """Determine if a solution should be shared with other agents"""
        try:
            # Check solution confidence and success rate
            cursor = self.conn.execute('''
                SELECT confidence_score, success_count, failure_count 
                FROM solutions 
                WHERE id = ?
            ''', (solution_id,))
            
            result = cursor.fetchone()
            if result:
                confidence, success_count, failure_count = result
                total_attempts = success_count + failure_count
                
                # Share if high confidence and multiple successes
                return (confidence >= 0.9 and success_count >= 3 and 
                       total_attempts >= 5)
            
            return False
            
        except Exception as e:
            self.logger.error(f"❌ Failed to check sharing criteria: {e}")
            return False

    def share_solution_with_agents(self, problem_hash: str, solution_id: int, description: str):
        """Share a successful solution with other doctor agents"""
        try:
            message_content = {
                'problem_hash': problem_hash,
                'solution_id': solution_id,
                'description': description,
                'shared_by': self.agent_id,
                'timestamp': datetime.now().isoformat()
            }
            
            # Store in collaboration table for other agents to pick up
            self.conn.execute('''
                INSERT INTO agent_collaboration (source_agent, message_type, content)
                VALUES (?, 'SHARE_SOLUTION', ?)
            ''', (self.agent_id, json.dumps(message_content)))
            
            self.conn.commit()
            self.logger.info(f"🤝 Shared solution {solution_id} with other agents")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to share solution: {e}")

    def sync_with_other_agents(self):
        """Synchronize learning with other doctor agents"""
        try:
            # Process incoming messages from other agents
            cursor = self.conn.execute('''
                SELECT id, source_agent, content 
                FROM agent_collaboration 
                WHERE message_type = 'SHARE_SOLUTION' 
                  AND status = 'PENDING'
                  AND source_agent != ?
                ORDER BY created_at
            ''', (self.agent_id,))
            
            messages = cursor.fetchall()
            processed_count = 0
            
            for msg_id, source_agent, content_json in messages:
                try:
                    content = json.loads(content_json)
                    problem_hash = content['problem_hash']
                    
                    # Check if we already have this solution
                    existing = self.conn.execute('''
                        SELECT id FROM solutions 
                        WHERE problem_hash = ? AND created_by = ?
                    ''', (problem_hash, source_agent)).fetchone()
                    
                    if not existing:
                        # Import the solution from other agent
                        self.import_solution_from_agent(content, source_agent)
                        processed_count += 1
                    
                    # Mark message as processed
                    self.conn.execute('''
                        UPDATE agent_collaboration 
                        SET status = 'PROCESSED', processed_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    ''', (msg_id,))
                    
                except Exception as e:
                    self.logger.error(f"❌ Failed to process message {msg_id}: {e}")
                    # Mark as failed
                    self.conn.execute('''
                        UPDATE agent_collaboration 
                        SET status = 'FAILED', processed_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    ''', (msg_id,))
            
            self.conn.commit()
            
            if processed_count > 0:
                self.logger.info(f"🔄 Synced {processed_count} solutions from other agents")
                
        except Exception as e:
            self.logger.error(f"❌ Failed to sync with other agents: {e}")

    def import_solution_from_agent(self, solution_data: Dict[str, Any], source_agent: str):
        """Import a solution shared by another agent"""
        try:
            problem_hash = solution_data['problem_hash']
            description = solution_data['description']
            
            # Get the full solution details from sharing agent's database
            # For now, create a placeholder solution that can be improved
            self.conn.execute('''
                INSERT INTO solutions (problem_hash, solution_description, solution_steps, 
                                     success_count, failure_count, confidence_score, created_by)
                VALUES (?, ?, ?, 1, 0, 0.5, ?)
            ''', (problem_hash, f"Shared: {description}", '["shared_solution"]', f"imported_from_{source_agent}"))
            
            self.logger.info(f"📥 Imported solution for {problem_hash[:8]} from {source_agent}")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to import solution from {source_agent}: {e}")

    def log_learning_event(self, event_type: str, problem_hash: str, solution_id: int, 
                          success: bool, details: str):
        """Log a learning event for analysis"""
        try:
            self.conn.execute('''
                INSERT INTO learning_events (agent_id, event_type, problem_hash, solution_id, success, details)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (self.agent_id, event_type, problem_hash, solution_id, success, details))
            
            self.conn.commit()
            
        except Exception as e:
            self.logger.error(f"❌ Failed to log learning event: {e}")

    def generate_learning_report(self) -> Dict[str, Any]:
        """Generate a comprehensive learning report"""
        try:
            report = {
                'agent_id': self.agent_id,
                'timestamp': datetime.now().isoformat(),
                'learning_stats': {},
                'top_problems': [],
                'best_solutions': [],
                'collaboration_stats': {},
                'recommendations': []
            }
            
            # Learning statistics
            cursor = self.conn.execute('''
                SELECT 
                    COUNT(*) as total_problems,
                    COUNT(CASE WHEN severity_level = 'CRITICAL' THEN 1 END) as critical_problems,
                    AVG(occurrence_count) as avg_occurrences
                FROM problems
            ''')
            
            stats = cursor.fetchone()
            if stats:
                report['learning_stats'] = {
                    'total_problems': stats[0],
                    'critical_problems': stats[1],
                    'average_occurrences': round(stats[2], 2) if stats[2] else 0
                }
            
            # Top recurring problems
            cursor = self.conn.execute('''
                SELECT problem_type, problem_description, occurrence_count, severity_level
                FROM problems 
                ORDER BY occurrence_count DESC 
                LIMIT 10
            ''')
            
            report['top_problems'] = [
                {
                    'type': row[0],
                    'description': row[1][:100],
                    'occurrences': row[2],
                    'severity': row[3]
                }
                for row in cursor.fetchall()
            ]
            
            # Best solutions
            cursor = self.conn.execute('''
                SELECT s.solution_description, s.confidence_score, s.success_count, 
                       p.problem_type, s.created_by
                FROM solutions s
                JOIN problems p ON s.problem_hash = p.problem_hash
                WHERE s.confidence_score >= 0.8
                ORDER BY s.confidence_score DESC, s.success_count DESC
                LIMIT 10
            ''')
            
            report['best_solutions'] = [
                {
                    'description': row[0][:100],
                    'confidence': round(row[1], 2),
                    'success_count': row[2],
                    'problem_type': row[3],
                    'created_by': row[4]
                }
                for row in cursor.fetchall()
            ]
            
            # Collaboration stats
            cursor = self.conn.execute('''
                SELECT 
                    COUNT(CASE WHEN source_agent = ? THEN 1 END) as shared_solutions,
                    COUNT(CASE WHEN source_agent != ? THEN 1 END) as received_solutions
                FROM agent_collaboration 
                WHERE message_type = 'SHARE_SOLUTION' AND status = 'PROCESSED'
            ''', (self.agent_id, self.agent_id))
            
            collab_stats = cursor.fetchone()
            if collab_stats:
                report['collaboration_stats'] = {
                    'solutions_shared': collab_stats[0],
                    'solutions_received': collab_stats[1]
                }
            
            # Generate recommendations
            report['recommendations'] = self.generate_recommendations()
            
            return report
            
        except Exception as e:
            self.logger.error(f"❌ Failed to generate learning report: {e}")
            return {'error': str(e)}

    def generate_recommendations(self) -> List[str]:
        """Generate smart recommendations based on learning data"""
        recommendations = []
        
        try:
            # Check for frequently occurring problems without good solutions
            cursor = self.conn.execute('''
                SELECT p.problem_type, p.occurrence_count
                FROM problems p
                LEFT JOIN solutions s ON p.problem_hash = s.problem_hash AND s.confidence_score >= 0.8
                WHERE p.occurrence_count >= 5 AND s.id IS NULL
                ORDER BY p.occurrence_count DESC
                LIMIT 5
            ''')
            
            unsolved_problems = cursor.fetchall()
            for problem_type, count in unsolved_problems:
                recommendations.append(
                    f"🔍 Focus on solving '{problem_type}' - occurs {count} times but no reliable solution found"
                )
            
            # Check for low-confidence solutions that need improvement
            cursor = self.conn.execute('''
                SELECT COUNT(*) 
                FROM solutions 
                WHERE confidence_score < 0.5 AND (success_count + failure_count) >= 3
            ''')
            
            low_confidence_count = cursor.fetchone()[0]
            if low_confidence_count > 0:
                recommendations.append(
                    f"💡 Review {low_confidence_count} low-confidence solutions for improvement opportunities"
                )
            
            # Check collaboration effectiveness
            cursor = self.conn.execute('''
                SELECT COUNT(*) 
                FROM agent_collaboration 
                WHERE created_at >= datetime('now', '-7 days') AND message_type = 'SHARE_SOLUTION'
            ''')
            
            recent_sharing = cursor.fetchone()[0]
            if recent_sharing == 0:
                recommendations.append(
                    "🤝 No recent solution sharing detected - consider increasing collaboration with other agents"
                )
            
            if not recommendations:
                recommendations.append("✅ Learning system is performing well - continue current practices")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to generate recommendations: {e}")
            recommendations.append("⚠️ Could not generate recommendations due to error")
        
        return recommendations

    def close(self):
        """Close the learning system"""
        try:
            if hasattr(self, 'conn'):
                self.conn.close()
            self.logger.info("🧠 Doctor Learning System closed")
        except Exception as e:
            self.logger.error(f"❌ Failed to close learning system: {e}")

# Integration function for main Doctor Agent
def enhance_doctor_with_learning(doctor_agent):
    """Enhance an existing doctor agent with learning capabilities"""
    try:
        # Add learning system to doctor agent
        doctor_agent.learning_system = DoctorLearningSystem(doctor_agent.__class__.__name__)
        
        # Override alert handling to include learning
        original_send_alert = doctor_agent.send_alert
        
        def learning_send_alert(alert_type, message):
            # Store the problem for learning
            problem_hash = doctor_agent.learning_system.analyze_problem(
                alert_type, message, {
                    'component': 'system',
                    'operation': 'monitoring',
                    'affects_trading': alert_type in ['BACKEND_DOWN', 'API_CRITICAL']
                }
            )
            
            # Try to apply learned solution
            if problem_hash:
                learned_solution = doctor_agent.learning_system.get_learned_solution(problem_hash)
                if learned_solution:
                    success = doctor_agent.learning_system.apply_learned_solution(problem_hash, learned_solution)
                    if success:
                        doctor_agent.logger.info(f"🧠 Auto-resolved {alert_type} using learned solution")
                        return  # Don't send alert if automatically resolved
            
            # Send original alert if no solution or solution failed
            original_send_alert(alert_type, message)
        
        doctor_agent.send_alert = learning_send_alert
        
        # Add periodic learning sync
        def sync_learning():
            doctor_agent.learning_system.sync_with_other_agents()
        
        doctor_agent.sync_learning = sync_learning
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to enhance doctor with learning: {e}")
        return False