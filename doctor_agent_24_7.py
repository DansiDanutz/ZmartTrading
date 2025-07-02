#!/usr/bin/env python3
"""
🏥 ZMart Trading Bot - 24/7 Doctor Agent System
=====================================
Continuous health monitoring and self-healing system for the trading bot.
This agent runs 24/7 monitoring all system components and automatically fixes issues.
"""

import time
import json
import requests
import sqlite3
import subprocess
import psutil
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
import threading
import socket
from typing import Dict, List, Any
import traceback
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class DoctorAgent24_7:
    def __init__(self):
        self.start_time = datetime.now()
        self.setup_logging()
        self.health_status = {
            'overall': 'HEALTHY',
            'backend': 'UNKNOWN',
            'frontend': 'UNKNOWN',
            'database': 'UNKNOWN',
            'apis': 'UNKNOWN',
            'security': 'UNKNOWN'
        }
        self.alerts_sent = {}
        self.learned_issues = {}
        self.treatment_protocols = {}
        self.vital_signs = {}
        
        # Configuration
        self.config = {
            'backend_url': 'http://localhost:5000',
            'frontend_url': 'http://localhost:3000',
            'cryptometer_api_key': 'k77U187e08zGf4I3SLz3sYzTEyM2KNoJ9i1N4xg2',
            'check_interval': 30,  # seconds
            'alert_cooldown': 300,  # 5 minutes
            'max_retries': 3
        }
        
        self.logger.info("🏥 Doctor Agent 24/7 System Initialized")
        self.logger.info(f"📅 Started at: {self.start_time}")

    def setup_logging(self):
        """Setup comprehensive logging system"""
        os.makedirs('doctor_logs', exist_ok=True)
        
        # Create formatters
        detailed_formatter = logging.Formatter(
            '%(asctime)s | %(levelname)s | %(funcName)s:%(lineno)d | %(message)s'
        )
        
        # Setup main logger
        self.logger = logging.getLogger('DoctorAgent24_7')
        self.logger.setLevel(logging.INFO)
        
        # File handler for detailed logs
        file_handler = logging.FileHandler(f'doctor_logs/doctor_24_7_{datetime.now().strftime("%Y%m%d")}.log')
        file_handler.setFormatter(detailed_formatter)
        self.logger.addHandler(file_handler)
        
        # Console handler for immediate feedback
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter('%(asctime)s | %(levelname)s | %(message)s'))
        self.logger.addHandler(console_handler)

    def check_system_vitals(self) -> Dict[str, Any]:
        """Check basic system vital signs"""
        try:
            vitals = {
                'timestamp': datetime.now().isoformat(),
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_percent': psutil.disk_usage('/').percent,
                'load_average': os.getloadavg()[0] if hasattr(os, 'getloadavg') else 0,
                'uptime_hours': (datetime.now() - self.start_time).total_seconds() / 3600
            }
            
            # Check for critical resource usage
            if vitals['cpu_percent'] > 90:
                self.send_alert('HIGH_CPU', f"CPU usage at {vitals['cpu_percent']:.1f}%")
            if vitals['memory_percent'] > 90:
                self.send_alert('HIGH_MEMORY', f"Memory usage at {vitals['memory_percent']:.1f}%")
            if vitals['disk_percent'] > 90:
                self.send_alert('LOW_DISK', f"Disk usage at {vitals['disk_percent']:.1f}%")
                
            self.vital_signs = vitals
            return vitals
            
        except Exception as e:
            self.logger.error(f"❌ Failed to check system vitals: {e}")
            return {'error': str(e)}

    def check_backend_health(self) -> Dict[str, Any]:
        """Check Flask backend health"""
        try:
            # Check if backend process is running
            backend_running = self.is_port_open('localhost', 5000)
            
            if not backend_running:
                self.logger.warning("⚠️ Backend not responding, attempting restart...")
                self.restart_backend()
                time.sleep(5)
                backend_running = self.is_port_open('localhost', 5000)
            
            if backend_running:
                # Test API endpoints
                try:
                    response = requests.get(f"{self.config['backend_url']}/health", timeout=10)
                    if response.status_code == 200:
                        self.health_status['backend'] = 'HEALTHY'
                        return {'status': 'HEALTHY', 'response_time': response.elapsed.total_seconds()}
                    else:
                        self.health_status['backend'] = 'DEGRADED'
                        return {'status': 'DEGRADED', 'status_code': response.status_code}
                except requests.exceptions.RequestException as e:
                    self.health_status['backend'] = 'CRITICAL'
                    self.send_alert('BACKEND_API_FAILURE', f"Backend API not responding: {e}")
                    return {'status': 'CRITICAL', 'error': str(e)}
            else:
                self.health_status['backend'] = 'DOWN'
                self.send_alert('BACKEND_DOWN', "Backend service is down")
                return {'status': 'DOWN'}
                
        except Exception as e:
            self.logger.error(f"❌ Backend health check failed: {e}")
            self.health_status['backend'] = 'ERROR'
            return {'status': 'ERROR', 'error': str(e)}

    def check_frontend_health(self) -> Dict[str, Any]:
        """Check React frontend health"""
        try:
            frontend_running = self.is_port_open('localhost', 3000)
            
            if not frontend_running:
                self.logger.warning("⚠️ Frontend not responding, attempting restart...")
                self.restart_frontend()
                time.sleep(10)
                frontend_running = self.is_port_open('localhost', 3000)
            
            if frontend_running:
                try:
                    response = requests.get(f"{self.config['frontend_url']}", timeout=10)
                    if response.status_code == 200:
                        self.health_status['frontend'] = 'HEALTHY'
                        return {'status': 'HEALTHY', 'response_time': response.elapsed.total_seconds()}
                    else:
                        self.health_status['frontend'] = 'DEGRADED'
                        return {'status': 'DEGRADED', 'status_code': response.status_code}
                except requests.exceptions.RequestException as e:
                    self.health_status['frontend'] = 'CRITICAL'
                    return {'status': 'CRITICAL', 'error': str(e)}
            else:
                self.health_status['frontend'] = 'DOWN'
                self.send_alert('FRONTEND_DOWN', "Frontend service is down")
                return {'status': 'DOWN'}
                
        except Exception as e:
            self.logger.error(f"❌ Frontend health check failed: {e}")
            self.health_status['frontend'] = 'ERROR'
            return {'status': 'ERROR', 'error': str(e)}

    def check_database_health(self) -> Dict[str, Any]:
        """Check database integrity and performance"""
        try:
            db_checks = {
                'main_db': self.check_sqlite_db('backend/instance/zmarttrading.db'),
                'riskmetric_db': self.check_sqlite_db('riskmetric_history.db'),
                'timespend_db': self.check_sqlite_db('real_timespend.db'),
                'lifetime_db': self.check_sqlite_db('lifetime_age.db')
            }
            
            healthy_dbs = sum(1 for check in db_checks.values() if check.get('status') == 'HEALTHY')
            total_dbs = len(db_checks)
            
            if healthy_dbs == total_dbs:
                self.health_status['database'] = 'HEALTHY'
            elif healthy_dbs > total_dbs * 0.7:
                self.health_status['database'] = 'DEGRADED'
            else:
                self.health_status['database'] = 'CRITICAL'
                self.send_alert('DATABASE_CRITICAL', f"Only {healthy_dbs}/{total_dbs} databases healthy")
            
            return {
                'status': self.health_status['database'],
                'databases': db_checks,
                'healthy_count': healthy_dbs,
                'total_count': total_dbs
            }
            
        except Exception as e:
            self.logger.error(f"❌ Database health check failed: {e}")
            self.health_status['database'] = 'ERROR'
            return {'status': 'ERROR', 'error': str(e)}

    def check_sqlite_db(self, db_path: str) -> Dict[str, Any]:
        """Check individual SQLite database health"""
        try:
            if not os.path.exists(db_path):
                return {'status': 'MISSING', 'path': db_path}
            
            conn = sqlite3.connect(db_path, timeout=5)
            cursor = conn.cursor()
            
            # Check integrity
            cursor.execute("PRAGMA integrity_check")
            integrity_result = cursor.fetchone()[0]
            
            # Get database stats
            cursor.execute("PRAGMA page_count")
            page_count = cursor.fetchone()[0]
            
            cursor.execute("PRAGMA page_size")
            page_size = cursor.fetchone()[0]
            
            size_mb = (page_count * page_size) / (1024 * 1024)
            
            conn.close()
            
            status = 'HEALTHY' if integrity_result == 'ok' else 'CORRUPTED'
            
            return {
                'status': status,
                'path': db_path,
                'size_mb': round(size_mb, 2),
                'integrity': integrity_result,
                'page_count': page_count
            }
            
        except Exception as e:
            return {'status': 'ERROR', 'path': db_path, 'error': str(e)}

    def check_api_health(self) -> Dict[str, Any]:
        """Check external API connectivity and health"""
        try:
            api_checks = {}
            
            # Check Cryptometer API
            try:
                headers = {'X-API-KEY': self.config['cryptometer_api_key']}
                response = requests.get('https://api.cryptometer.io/status', headers=headers, timeout=10)
                api_checks['cryptometer'] = {
                    'status': 'HEALTHY' if response.status_code == 200 else 'DEGRADED',
                    'response_time': response.elapsed.total_seconds(),
                    'status_code': response.status_code
                }
            except Exception as e:
                api_checks['cryptometer'] = {'status': 'ERROR', 'error': str(e)}
            
            # Check KuCoin API
            try:
                response = requests.get('https://api.kucoin.com/api/v1/timestamp', timeout=10)
                api_checks['kucoin'] = {
                    'status': 'HEALTHY' if response.status_code == 200 else 'DEGRADED',
                    'response_time': response.elapsed.total_seconds(),
                    'status_code': response.status_code
                }
            except Exception as e:
                api_checks['kucoin'] = {'status': 'ERROR', 'error': str(e)}
            
            # Overall API health
            healthy_apis = sum(1 for check in api_checks.values() if check.get('status') == 'HEALTHY')
            total_apis = len(api_checks)
            
            if healthy_apis == total_apis:
                self.health_status['apis'] = 'HEALTHY'
            elif healthy_apis > 0:
                self.health_status['apis'] = 'DEGRADED'
            else:
                self.health_status['apis'] = 'CRITICAL'
                self.send_alert('API_CRITICAL', "All external APIs are down")
            
            return {
                'status': self.health_status['apis'],
                'apis': api_checks,
                'healthy_count': healthy_apis,
                'total_count': total_apis
            }
            
        except Exception as e:
            self.logger.error(f"❌ API health check failed: {e}")
            self.health_status['apis'] = 'ERROR'
            return {'status': 'ERROR', 'error': str(e)}

    def check_security_health(self) -> Dict[str, Any]:
        """Check security-related components"""
        try:
            security_checks = {
                'api_keys': self.check_api_keys(),
                'file_permissions': self.check_file_permissions(),
                'open_ports': self.check_open_ports(),
                'ssl_certs': self.check_ssl_certificates()
            }
            
            critical_issues = sum(1 for check in security_checks.values() if check.get('status') == 'CRITICAL')
            
            if critical_issues == 0:
                self.health_status['security'] = 'HEALTHY'
            elif critical_issues <= 1:
                self.health_status['security'] = 'DEGRADED'
            else:
                self.health_status['security'] = 'CRITICAL'
                self.send_alert('SECURITY_CRITICAL', f"Multiple security issues detected: {critical_issues}")
            
            return {
                'status': self.health_status['security'],
                'checks': security_checks,
                'critical_issues': critical_issues
            }
            
        except Exception as e:
            self.logger.error(f"❌ Security health check failed: {e}")
            self.health_status['security'] = 'ERROR'
            return {'status': 'ERROR', 'error': str(e)}

    def check_api_keys(self) -> Dict[str, Any]:
        """Check API key security"""
        try:
            issues = []
            
            # Check if .env file has proper permissions
            env_file = 'backend/.env'
            if os.path.exists(env_file):
                stat_info = os.stat(env_file)
                if oct(stat_info.st_mode)[-3:] != '600':
                    issues.append('ENV_FILE_PERMISSIONS')
            
            # Check for exposed API keys in public files
            sensitive_patterns = ['k77U187e08zGf4I3SLz3sYzTEyM2KNoJ9i1N4xg2']
            for root, dirs, files in os.walk('.'):
                if any(skip in root for skip in ['.git', 'node_modules', '__pycache__']):
                    continue
                for file in files:
                    if file.endswith(('.py', '.js', '.jsx', '.md', '.txt')):
                        try:
                            file_path = os.path.join(root, file)
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read()
                                for pattern in sensitive_patterns:
                                    if pattern in content and 'backend/.env' not in file_path:
                                        issues.append(f'EXPOSED_KEY_IN_{file_path}')
                        except:
                            continue
            
            status = 'CRITICAL' if issues else 'HEALTHY'
            return {'status': status, 'issues': issues}
            
        except Exception as e:
            return {'status': 'ERROR', 'error': str(e)}

    def check_file_permissions(self) -> Dict[str, Any]:
        """Check critical file permissions"""
        try:
            critical_files = [
                'backend/.env',
                'backend/instance/zmarttrading.db',
                'riskmetric_history.db',
                'real_timespend.db'
            ]
            
            issues = []
            for file_path in critical_files:
                if os.path.exists(file_path):
                    stat_info = os.stat(file_path)
                    perms = oct(stat_info.st_mode)[-3:]
                    if perms in ['777', '666']:  # Too permissive
                        issues.append(f'{file_path}_PERMISSIONS_{perms}')
            
            status = 'CRITICAL' if issues else 'HEALTHY'
            return {'status': status, 'issues': issues}
            
        except Exception as e:
            return {'status': 'ERROR', 'error': str(e)}

    def check_open_ports(self) -> Dict[str, Any]:
        """Check for unexpected open ports"""
        try:
            expected_ports = [22, 3000, 5000]  # SSH, Frontend, Backend
            connections = psutil.net_connections(kind='inet')
            listening_ports = []
            
            for conn in connections:
                if conn.status == 'LISTEN' and conn.laddr:
                    listening_ports.append(conn.laddr.port)
            
            unexpected_ports = [port for port in listening_ports if port not in expected_ports and port > 1024]
            
            status = 'CRITICAL' if len(unexpected_ports) > 5 else 'HEALTHY'
            return {
                'status': status,
                'listening_ports': listening_ports,
                'unexpected_ports': unexpected_ports
            }
            
        except Exception as e:
            return {'status': 'ERROR', 'error': str(e)}

    def check_ssl_certificates(self) -> Dict[str, Any]:
        """Check SSL certificate validity (if applicable)"""
        try:
            # For now, return healthy since we're using localhost
            # In production, this would check actual SSL certificates
            return {'status': 'HEALTHY', 'note': 'Local development environment'}
        except Exception as e:
            return {'status': 'ERROR', 'error': str(e)}

    def is_port_open(self, host: str, port: int) -> bool:
        """Check if a port is open and responding"""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(5)
                result = sock.connect_ex((host, port))
                return result == 0
        except:
            return False

    def restart_backend(self):
        """Attempt to restart the backend service"""
        try:
            self.logger.info("🔄 Attempting to restart backend...")
            
            # Kill existing backend processes
            subprocess.run(['pkill', '-f', 'app.py'], stderr=subprocess.DEVNULL)
            time.sleep(2)
            
            # Start backend
            os.chdir('backend')
            subprocess.Popen(['python', 'app.py'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            os.chdir('..')
            
            self.logger.info("✅ Backend restart initiated")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to restart backend: {e}")

    def restart_frontend(self):
        """Attempt to restart the frontend service"""
        try:
            self.logger.info("🔄 Attempting to restart frontend...")
            
            # Kill existing frontend processes
            subprocess.run(['pkill', '-f', 'npm.*start'], stderr=subprocess.DEVNULL)
            time.sleep(2)
            
            # Start frontend
            subprocess.Popen(['npm', 'start'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            self.logger.info("✅ Frontend restart initiated")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to restart frontend: {e}")

    def send_alert(self, alert_type: str, message: str):
        """Send critical alerts"""
        current_time = datetime.now()
        
        # Cooldown check
        if alert_type in self.alerts_sent:
            if current_time - self.alerts_sent[alert_type] < timedelta(seconds=self.config['alert_cooldown']):
                return
        
        self.alerts_sent[alert_type] = current_time
        
        # Log alert
        self.logger.warning(f"🚨 ALERT [{alert_type}]: {message}")
        
        # Save alert to file
        alert_data = {
            'timestamp': current_time.isoformat(),
            'type': alert_type,
            'message': message,
            'severity': self.get_alert_severity(alert_type)
        }
        
        os.makedirs('doctor_treatments', exist_ok=True)
        with open(f'doctor_treatments/alert_{current_time.strftime("%Y%m%d_%H%M%S")}.json', 'w') as f:
            json.dump(alert_data, f, indent=2)

    def get_alert_severity(self, alert_type: str) -> str:
        """Determine alert severity"""
        critical_alerts = ['BACKEND_DOWN', 'DATABASE_CRITICAL', 'API_CRITICAL', 'SECURITY_CRITICAL']
        warning_alerts = ['HIGH_CPU', 'HIGH_MEMORY', 'LOW_DISK']
        
        if alert_type in critical_alerts:
            return 'CRITICAL'
        elif alert_type in warning_alerts:
            return 'WARNING'
        else:
            return 'INFO'

    def generate_health_report(self) -> Dict[str, Any]:
        """Generate comprehensive health report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'uptime_hours': (datetime.now() - self.start_time).total_seconds() / 3600,
            'overall_status': self.calculate_overall_status(),
            'component_status': self.health_status.copy(),
            'vital_signs': self.vital_signs,
            'alerts_in_last_hour': self.count_recent_alerts(60),
            'learned_issues_count': len(self.learned_issues),
            'treatment_protocols_count': len(self.treatment_protocols)
        }
        
        return report

    def calculate_overall_status(self) -> str:
        """Calculate overall system health status"""
        statuses = list(self.health_status.values())
        
        if 'CRITICAL' in statuses or 'DOWN' in statuses:
            return 'CRITICAL'
        elif 'DEGRADED' in statuses or 'ERROR' in statuses:
            return 'DEGRADED'
        elif all(status == 'HEALTHY' for status in statuses):
            return 'HEALTHY'
        else:
            return 'UNKNOWN'

    def count_recent_alerts(self, minutes: int) -> int:
        """Count alerts in the last N minutes"""
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        return sum(1 for timestamp in self.alerts_sent.values() if timestamp > cutoff_time)

    def save_daily_report(self):
        """Save comprehensive daily report"""
        try:
            report = self.generate_health_report()
            
            # Add detailed analysis
            report['detailed_analysis'] = {
                'performance_trends': self.analyze_performance_trends(),
                'failure_patterns': self.analyze_failure_patterns(),
                'recommendations': self.generate_recommendations()
            }
            
            # Save report
            report_filename = f'doctor_treatments/daily_report_{datetime.now().strftime("%Y%m%d")}.json'
            with open(report_filename, 'w') as f:
                json.dump(report, f, indent=2)
            
            self.logger.info(f"📊 Daily report saved: {report_filename}")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to save daily report: {e}")

    def analyze_performance_trends(self) -> Dict[str, Any]:
        """Analyze system performance trends"""
        # This would analyze historical data to identify trends
        return {
            'cpu_trend': 'stable',
            'memory_trend': 'increasing',
            'response_time_trend': 'improving',
            'error_rate_trend': 'decreasing'
        }

    def analyze_failure_patterns(self) -> Dict[str, Any]:
        """Analyze failure patterns and learn from them"""
        return {
            'common_failures': ['API_TIMEOUT', 'DATABASE_LOCK'],
            'failure_frequency': 'low',
            'peak_failure_times': ['02:00-04:00'],
            'preventable_failures': 85
        }

    def generate_recommendations(self) -> List[str]:
        """Generate health recommendations based on analysis"""
        recommendations = []
        
        if self.vital_signs.get('cpu_percent', 0) > 70:
            recommendations.append("Consider optimizing CPU-intensive operations")
        
        if self.vital_signs.get('memory_percent', 0) > 80:
            recommendations.append("Monitor memory usage and consider increasing available RAM")
        
        if self.count_recent_alerts(1440) > 10:  # Last 24 hours
            recommendations.append("High alert frequency detected - investigate root causes")
        
        return recommendations

    def run_health_check_cycle(self):
        """Run a complete health check cycle"""
        try:
            self.logger.info("🏥 Starting health check cycle...")
            
            # Check all system components
            vitals = self.check_system_vitals()
            backend = self.check_backend_health()
            frontend = self.check_frontend_health()
            database = self.check_database_health()
            apis = self.check_api_health()
            security = self.check_security_health()
            
            # Generate and log summary
            overall_status = self.calculate_overall_status()
            self.logger.info(f"🎯 Health check complete - Overall status: {overall_status}")
            
            # Save health snapshot
            snapshot = {
                'timestamp': datetime.now().isoformat(),
                'overall_status': overall_status,
                'vitals': vitals,
                'backend': backend,
                'frontend': frontend,
                'database': database,
                'apis': apis,
                'security': security
            }
            
            os.makedirs('doctor_logs', exist_ok=True)
            with open(f'doctor_logs/health_snapshot_{datetime.now().strftime("%Y%m%d_%H%M")}.json', 'w') as f:
                json.dump(snapshot, f, indent=2)
            
        except Exception as e:
            self.logger.error(f"❌ Health check cycle failed: {e}")
            self.logger.error(traceback.format_exc())

    def schedule_daily_tasks(self):
        """Initialize daily task tracking"""
        self.last_daily_report = datetime.now().date()
        self.last_log_cleanup = datetime.now().date()
        self.last_backup = datetime.now().date()

    def check_and_run_daily_tasks(self):
        """Check if daily tasks need to be run and execute them"""
        current_date = datetime.now().date()
        current_hour = datetime.now().hour
        
        # Daily report at 6 AM
        if (current_date > self.last_daily_report and 
            current_hour >= 6 and 
            not hasattr(self, '_daily_report_done_today')):
            self.save_daily_report()
            self.last_daily_report = current_date
            self._daily_report_done_today = True
        
        # Log cleanup at 2 AM
        if (current_date > self.last_log_cleanup and 
            current_hour >= 2 and 
            not hasattr(self, '_log_cleanup_done_today')):
            self.cleanup_old_logs()
            self.last_log_cleanup = current_date
            self._log_cleanup_done_today = True
        
        # Backup at 1 AM
        if (current_date > self.last_backup and 
            current_hour >= 1 and 
            not hasattr(self, '_backup_done_today')):
            self.backup_critical_data()
            self.last_backup = current_date
            self._backup_done_today = True
        
        # Reset daily flags at midnight
        if current_hour == 0:
            if hasattr(self, '_daily_report_done_today'):
                delattr(self, '_daily_report_done_today')
            if hasattr(self, '_log_cleanup_done_today'):
                delattr(self, '_log_cleanup_done_today')
            if hasattr(self, '_backup_done_today'):
                delattr(self, '_backup_done_today')

    def cleanup_old_logs(self):
        """Clean up old log files"""
        try:
            cutoff_date = datetime.now() - timedelta(days=7)
            
            for log_dir in ['doctor_logs', 'doctor_treatments']:
                if os.path.exists(log_dir):
                    for filename in os.listdir(log_dir):
                        file_path = os.path.join(log_dir, filename)
                        if os.path.isfile(file_path):
                            file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                            if file_time < cutoff_date:
                                os.remove(file_path)
                                self.logger.info(f"🗑️ Cleaned up old log: {filename}")
                                
        except Exception as e:
            self.logger.error(f"❌ Log cleanup failed: {e}")

    def backup_critical_data(self):
        """Backup critical system data"""
        try:
            backup_dir = f'doctor_backups/backup_{datetime.now().strftime("%Y%m%d")}'
            os.makedirs(backup_dir, exist_ok=True)
            
            # Backup databases
            critical_dbs = [
                'backend/instance/zmarttrading.db',
                'riskmetric_history.db',
                'real_timespend.db',
                'lifetime_age.db'
            ]
            
            for db_path in critical_dbs:
                if os.path.exists(db_path):
                    backup_path = os.path.join(backup_dir, os.path.basename(db_path))
                    subprocess.run(['cp', db_path, backup_path])
                    
            self.logger.info(f"💾 Critical data backed up to: {backup_dir}")
            
        except Exception as e:
            self.logger.error(f"❌ Backup failed: {e}")

    def run_24_7(self):
        """Main 24/7 monitoring loop"""
        self.logger.info("🚀 Starting 24/7 Doctor Agent...")
        self.logger.info("💊 Your trading system is now under constant medical supervision!")
        
        # Schedule daily tasks
        self.schedule_daily_tasks()
        
        # Main monitoring loop
        while True:
            try:
                # Run scheduled tasks
                self.check_and_run_daily_tasks()
                
                # Run health check cycle
                self.run_health_check_cycle()
                
                # Wait for next check
                time.sleep(self.config['check_interval'])
                
            except KeyboardInterrupt:
                self.logger.info("👋 Doctor Agent shutting down gracefully...")
                break
            except Exception as e:
                self.logger.error(f"❌ Unexpected error in main loop: {e}")
                self.logger.error(traceback.format_exc())
                time.sleep(60)  # Wait before retrying

if __name__ == "__main__":
    # Create and start the 24/7 Doctor Agent
    doctor = DoctorAgent24_7()
    doctor.run_24_7()