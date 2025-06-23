import os
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.fernet import Fernet
import pyotp
import base64
from functools import wraps
from dotenv import load_dotenv
import requests
import time
import datetime
import secrets
import logging
from logging.handlers import RotatingFileHandler
import subprocess
import re

load_dotenv('ZBot.env')

app = Flask(__name__)

# Configure logging
if not os.path.exists('logs'):
    os.makedirs('logs')

# File handler for detailed logs
file_handler = RotatingFileHandler('logs/zmarttrading.log', maxBytes=10240000, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('ZmartTrading startup')

# Session configuration - CRITICAL FIX
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-this-in-production')
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Allow cross-site cookies
app.config['SESSION_COOKIE_DOMAIN'] = None  # Allow all domains for testing
app.config['PERMANENT_SESSION_LIFETIME'] = datetime.timedelta(hours=24)

# CORS configuration - CRITICAL FIX
CORS(app, 
     supports_credentials=True, 
     origins=['http://localhost:5173', 'http://localhost:5001'],  # Allow both ports
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Database configuration with absolute path
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'zmarttrading.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME')

# Debug email configuration
print(f"[DEBUG] Email configuration:")
print(f"[DEBUG] MAIL_USERNAME: {'✅ Set' if app.config['MAIL_USERNAME'] else '❌ Not set'}")
print(f"[DEBUG] MAIL_PASSWORD: {'✅ Set' if app.config['MAIL_PASSWORD'] else '❌ Not set'}")
print(f"[DEBUG] MAIL_DEFAULT_SENDER: {'✅ Set' if app.config['MAIL_DEFAULT_SENDER'] else '❌ Not set'}")

SUPERADMIN_EMAIL = 'seme@kryptostack.com'

mail = Mail(app)
db = SQLAlchemy(app)

# Encryption key for API secrets
FERNET_KEY = os.environ.get('FERNET_KEY')
if not FERNET_KEY:
    FERNET_KEY = Fernet.generate_key().decode()
    print(f"[INFO] Generated FERNET_KEY: {FERNET_KEY}")
fernet = Fernet(FERNET_KEY.encode())

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    is_superadmin = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    totp_secret = db.Column(db.String(32), nullable=True)
    is_2fa_enabled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class VerificationCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    code = db.Column(db.String(10), nullable=False)
    purpose = db.Column(db.String(50), nullable=False)  # 'password_reset', 'admin_creation', 'admin_confirmation'
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)

class APIKey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(64), nullable=False)
    key_enc = db.Column(db.String(512), nullable=False)
    secret_enc = db.Column(db.String(512), nullable=True)
    passphrase_enc = db.Column(db.String(512), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# Helpers
def log_activity(action, details=None, user_id=None):
    """Log user activity to database and file"""
    try:
        # Get user ID from session if not provided
        if user_id is None:
            user_id = session.get('user_id')
        
        # Get request information
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')
        
        # Create log entry
        log_entry = ActivityLog(
            user_id=user_id,
            action=action,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(log_entry)
        db.session.commit()
        
        # Also log to file
        app.logger.info(f"Activity: {action} - User: {user_id} - Details: {details} - IP: {ip_address}")
        
    except Exception as e:
        app.logger.error(f"Failed to log activity: {e}")

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            log_activity('LOGIN_FAILED', 'No session found')
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = User.query.get(session.get('user_id'))
        if not user or not (user.is_admin or user.is_superadmin):
            log_activity('ADMIN_ACCESS_DENIED', f'User {session.get("user_id")} attempted admin access')
            return jsonify({'error': 'Admin required'}), 403
        return f(*args, **kwargs)
    return decorated

def superadmin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = User.query.get(session.get('user_id'))
        if not user or not user.is_superadmin:
            log_activity('SUPERADMIN_ACCESS_DENIED', f'User {session.get("user_id")} attempted superadmin access')
            return jsonify({'error': 'SuperAdmin required'}), 403
        return f(*args, **kwargs)
    return decorated

def encrypt(text):
    if not text:
        return None
    return fernet.encrypt(text.encode()).decode()

def decrypt(token):
    if not token:
        return None
    return fernet.decrypt(token.encode()).decode()

def generate_verification_code():
    return ''.join(secrets.choice('0123456789') for _ in range(6))

def send_verification_email(email, code, purpose):
    try:
        subject_map = {
            'password_reset': 'Password Reset Code',
            'admin_creation': 'Admin Account Creation Code',
            'admin_confirmation': 'Admin Account Confirmation Code'
        }
        subject = subject_map.get(purpose, 'Verification Code')
        # Always send to MasterAdmin
        msg = Message(subject, recipients=[SUPERADMIN_EMAIL])
        msg.body = f'Your verification code is: {code}\n\nThis code will expire in 10 minutes.'
        mail.send(msg)
        return True
    except Exception as e:
        print(f"[WARN] Could not send email: {e}")
        return False

def create_verification_code(email, purpose):
    # Clean up expired codes
    VerificationCode.query.filter(
        VerificationCode.expires_at < datetime.datetime.utcnow()
    ).delete()
    db.session.commit()
    
    # Generate new code
    code = generate_verification_code()
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    
    verification_code = VerificationCode(
        email=email,
        code=code,
        purpose=purpose,
        expires_at=expires_at
    )
    db.session.add(verification_code)
    db.session.commit()
    
    return code

def verify_code(email, code, purpose):
    verification_code = VerificationCode.query.filter_by(
        email=email,
        code=code,
        purpose=purpose,
        used=False
    ).first()
    
    if not verification_code:
        return False
    
    if verification_code.expires_at < datetime.datetime.utcnow():
        return False
    
    verification_code.used = True
    db.session.commit()
    return True

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    is_superadmin = (email == SUPERADMIN_EMAIL)
    is_admin = data.get('is_admin', False)
    
    user = User(
        email=email,
        name=name,
        password_hash=generate_password_hash(password),
        is_superadmin=is_superadmin,
        is_admin=is_admin,
        is_active=is_superadmin  # Only SuperAdmin is active by default
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'Registered successfully'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    print(f"[DEBUG] Login attempt for: {email}")
    
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        print(f"[DEBUG] Login failed - Invalid credentials for: {email}")
        log_activity('LOGIN_FAILED', f'Invalid credentials for email: {email}')
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user.is_active:
        print(f"[DEBUG] Login failed - Account not active for: {email}")
        log_activity('LOGIN_FAILED', f'Account not active for email: {email}')
        return jsonify({'error': 'Account is not active. Please contact SuperAdmin.'}), 403
    
    # Set session data
    session.permanent = True
    session['user_id'] = user.id
    session['is_superadmin'] = user.is_superadmin
    session['is_admin'] = user.is_admin
    
    print(f"[DEBUG] Login successful - User ID: {user.id}, Email: {user.email}, Admin: {user.is_admin}")
    print(f"[DEBUG] Session after login: {dict(session)}")
    
    # Log successful login
    log_activity('LOGIN_SUCCESS', f'User logged in: {user.email} (ID: {user.id})', user.id)
    
    if user.is_2fa_enabled:
        return jsonify({'2fa_required': True})
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'is_superadmin': user.is_superadmin,
            'is_admin': user.is_admin
        }
    })

@app.route('/api/session', methods=['GET'])
def get_session():
    print(f"[DEBUG] Session check - Session data: {dict(session)}")
    print(f"[DEBUG] Session ID: {session.get('user_id', 'No session ID')}")
    print(f"[DEBUG] Request cookies: {dict(request.cookies)}")
    print(f"[DEBUG] Request headers: {dict(request.headers)}")
    
    if 'user_id' not in session:
        print(f"[DEBUG] No user_id in session")
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        print(f"[DEBUG] User not found in database for ID: {session['user_id']}")
        return jsonify({'error': 'User not found'}), 404
    
    print(f"[DEBUG] Session valid for user: {user.email}")
    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'is_superadmin': user.is_superadmin,
            'is_admin': user.is_admin
        }
    })

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    user_id = session.get('user_id')
    user = User.query.get(user_id) if user_id else None
    user_email = user.email if user else 'Unknown'
    
    session.clear()
    response = jsonify({'message': 'Logged out'})
    # Expire the session cookie for API clients
    response.set_cookie('session', '', expires=0, path='/', httponly=True, samesite='Lax')
    
    # Log logout
    log_activity('LOGOUT', f'User logged out: {user_email} (ID: {user_id})', user_id)
    
    return response

# SuperAdmin Password Change
@app.route('/api/auth/request-password-change', methods=['POST'])
@login_required
@superadmin_required
def request_password_change():
    user = User.query.get(session['user_id'])
    code = create_verification_code(user.email, 'password_reset')
    
    # Log password change request
    log_activity('PASSWORD_CHANGE_REQUESTED', f'Password change requested for: {user.email}', user.id)
    
    if send_verification_email(user.email, code, 'password_reset'):
        return jsonify({'message': 'Verification code sent to MasterAdmin email (seme@kryptostack.com)'})
    else:
        log_activity('PASSWORD_CHANGE_EMAIL_FAILED', f'Failed to send email for: {user.email}', user.id)
        return jsonify({'error': 'Failed to send verification code'}), 500

@app.route('/api/auth/change-password', methods=['POST'])
@login_required
@superadmin_required
def change_password():
    data = request.json
    code = data.get('code')
    new_password = data.get('new_password')
    
    user = User.query.get(session['user_id'])
    
    if not verify_code(user.email, code, 'password_reset'):
        log_activity('PASSWORD_CHANGE_FAILED', f'Invalid code for: {user.email}', user.id)
        return jsonify({'error': 'Invalid or expired verification code'}), 400
    
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    # Log successful password change
    log_activity('PASSWORD_CHANGED', f'Password changed successfully for: {user.email}', user.id)
    
    return jsonify({'message': 'Password changed successfully'})

# Test endpoint for password change (bypasses email)
@app.route('/api/test/request-password-change', methods=['POST'])
@login_required
@superadmin_required
def test_request_password_change():
    user = User.query.get(session['user_id'])
    code = create_verification_code(user.email, 'password_reset')
    
    # Return the code directly for testing (don't send email)
    return jsonify({
        'message': 'Verification code created for testing',
        'code': code,
        'email': user.email
    })

@app.route('/api/test/change-password', methods=['POST'])
@login_required
@superadmin_required
def test_change_password():
    data = request.json
    code = data.get('code')
    new_password = data.get('new_password')
    
    user = User.query.get(session['user_id'])
    
    if not verify_code(user.email, code, 'password_reset'):
        return jsonify({'error': 'Invalid or expired verification code'}), 400
    
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'})

# Test endpoint to get verification code (for testing only)
@app.route('/api/test/get-verification-code', methods=['GET'])
@login_required
@superadmin_required
def test_get_verification_code():
    user = User.query.get(session['user_id'])
    
    # Get the most recent unused verification code for this user
    verification_code = VerificationCode.query.filter_by(
        email=user.email,
        purpose='password_reset',
        used=False
    ).order_by(VerificationCode.id.desc()).first()
    
    if not verification_code:
        return jsonify({'error': 'No verification code found'}), 404
    
    if verification_code.expires_at < datetime.datetime.utcnow():
        return jsonify({'error': 'Verification code has expired'}), 400
    
    return jsonify({
        'verification_code': verification_code.code,
        'email': user.email,
        'expires_at': verification_code.expires_at.isoformat()
    })

# Admin Management
@app.route('/api/auth/create-admin', methods=['POST'])
@login_required
@superadmin_required
def create_admin():
    data = request.json
    email = data.get('email')
    name = data.get('name')
    temp_password = data.get('temp_password')
    
    if not email or not name or not temp_password:
        log_activity('ADMIN_CREATE_FAILED', f'Missing required fields for admin creation: {email}', session.get('user_id'))
        return jsonify({'error': 'Email, name, and temporary password required'}), 400
    
    if User.query.filter_by(email=email).first():
        log_activity('ADMIN_CREATE_FAILED', f'Email already exists: {email}', session.get('user_id'))
        return jsonify({'error': 'Email already registered'}), 400
    
    # Create inactive admin
    admin = User(
        email=email,
        name=name,
        password_hash=generate_password_hash(temp_password),
        is_admin=True,
        is_active=False
    )
    db.session.add(admin)
    db.session.commit()
    
    # Log admin creation
    log_activity('ADMIN_CREATED', f'Admin created: {email} ({name})', session.get('user_id'))
    
    # Send confirmation code to SuperAdmin
    code = create_verification_code(SUPERADMIN_EMAIL, 'admin_creation')
    if send_verification_email(SUPERADMIN_EMAIL, code, 'admin_creation'):
        return jsonify({'message': 'Admin created. Confirmation code sent to SuperAdmin email.'})
    else:
        log_activity('ADMIN_CREATE_EMAIL_FAILED', f'Failed to send confirmation email for: {email}', session.get('user_id'))
        return jsonify({'error': 'Failed to send confirmation code'}), 500

@app.route('/api/auth/confirm-admin', methods=['POST'])
@login_required
@superadmin_required
def confirm_admin():
    data = request.json
    code = data.get('code')
    admin_email = data.get('admin_email')
    
    if not verify_code(SUPERADMIN_EMAIL, code, 'admin_creation'):
        log_activity('ADMIN_CONFIRM_FAILED', f'Invalid confirmation code for: {admin_email}', session.get('user_id'))
        return jsonify({'error': 'Invalid or expired confirmation code'}), 400
    
    admin = User.query.filter_by(email=admin_email, is_admin=True).first()
    if not admin:
        log_activity('ADMIN_CONFIRM_FAILED', f'Admin not found: {admin_email}', session.get('user_id'))
        return jsonify({'error': 'Admin not found'}), 404
    
    admin.is_active = True
    db.session.commit()
    
    # Log admin confirmation
    log_activity('ADMIN_CONFIRMED', f'Admin confirmed: {admin_email} ({admin.name})', session.get('user_id'))
    
    # Send activation notification to admin
    try:
        msg = Message('Your Admin Account is Now Active', recipients=[admin.email])
        msg.body = f'Hello {admin.name},\n\nYour admin account has been activated by the SuperAdmin. You can now log in to the system.'
        mail.send(msg)
        log_activity('ADMIN_ACTIVATION_EMAIL_SENT', f'Activation email sent to: {admin_email}', session.get('user_id'))
    except Exception as e:
        print(f"[WARN] Could not send activation email: {e}")
        log_activity('ADMIN_ACTIVATION_EMAIL_FAILED', f'Failed to send activation email to: {admin_email}', session.get('user_id'))
    
    return jsonify({'message': 'Admin account activated successfully'})

@app.route('/api/auth/delete-admin', methods=['DELETE'])
@login_required
@superadmin_required
def delete_admin():
    data = request.json
    admin_id = data.get('admin_id')
    
    admin = User.query.filter_by(id=admin_id, is_admin=True).first()
    if not admin:
        log_activity('ADMIN_DELETE_FAILED', f'Admin not found for deletion: ID {admin_id}', session.get('user_id'))
        return jsonify({'error': 'Admin not found'}), 404
    
    if admin.is_superadmin:
        log_activity('ADMIN_DELETE_FAILED', f'Attempted to delete SuperAdmin: {admin.email}', session.get('user_id'))
        return jsonify({'error': 'Cannot delete SuperAdmin'}), 403
    
    admin_email = admin.email
    admin_name = admin.name
    
    db.session.delete(admin)
    db.session.commit()
    
    # Log admin deletion
    log_activity('ADMIN_DELETED', f'Admin deleted: {admin_email} ({admin_name})', session.get('user_id'))
    
    return jsonify({'message': 'Admin deleted successfully'})

@app.route('/api/auth/list-admins', methods=['GET'])
@login_required
@superadmin_required
def list_admins():
    # Log admin list request
    log_activity('ADMIN_LIST_REQUESTED', 'Admin list requested', session.get('user_id'))
    
    admins = User.query.filter_by(is_admin=True).all()
    return jsonify([{
        'id': admin.id,
        'email': admin.email,
        'name': admin.name,
        'is_active': admin.is_active,
        'is_superadmin': admin.is_superadmin,
        'created_at': admin.created_at.isoformat()
    } for admin in admins])

@app.route('/api/auth/activity-logs', methods=['GET'])
@login_required
@superadmin_required
def get_activity_logs():
    # Log activity logs request
    log_activity('ACTIVITY_LOGS_REQUESTED', 'Activity logs requested', session.get('user_id'))
    
    # Get query parameters for filtering
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    action_filter = request.args.get('action', '')
    user_filter = request.args.get('user_id', '', type=int)
    
    # Build query
    query = ActivityLog.query
    
    if action_filter:
        query = query.filter(ActivityLog.action.contains(action_filter))
    
    if user_filter:
        query = query.filter(ActivityLog.user_id == user_filter)
    
    # Order by most recent first
    query = query.order_by(ActivityLog.created_at.desc())
    
    # Paginate results
    pagination = query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )
    
    logs = []
    for log in pagination.items:
        user = User.query.get(log.user_id) if log.user_id else None
        logs.append({
            'id': log.id,
            'action': log.action,
            'details': log.details,
            'ip_address': log.ip_address,
            'user_agent': log.user_agent,
            'created_at': log.created_at.isoformat(),
            'user_email': user.email if user else 'Unknown',
            'user_name': user.name if user else 'Unknown'
        })
    
    return jsonify({
        'logs': logs,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    })

# Admin Password Reset
@app.route('/api/auth/request-reset-code', methods=['POST'])
def request_reset_code():
    data = request.json
    email = data.get('email')
    user = User.query.filter_by(email=email, is_admin=True).first()
    if not user:
        log_activity('ADMIN_RESET_REQUEST_FAILED', f'Admin not found for reset: {email}')
        return jsonify({'error': 'Admin account not found'}), 404
    if not user.is_active:
        log_activity('ADMIN_RESET_REQUEST_FAILED', f'Inactive admin reset attempt: {email}')
        return jsonify({'error': 'Account is not active'}), 403
    
    # Log reset request
    log_activity('ADMIN_RESET_REQUESTED', f'Password reset requested for admin: {email}')
    
    code = create_verification_code(email, 'password_reset')
    # Always send to MasterAdmin
    if send_verification_email(email, code, 'password_reset'):
        return jsonify({'message': 'Reset code sent to MasterAdmin email (seme@kryptostack.com)'})
    else:
        log_activity('ADMIN_RESET_EMAIL_FAILED', f'Failed to send reset email for: {email}')
        return jsonify({'error': 'Failed to send reset code'}), 500

@app.route('/api/auth/verify-reset-code', methods=['POST'])
def verify_reset_code():
    data = request.json
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('new_password')
    
    user = User.query.filter_by(email=email, is_admin=True).first()
    if not user:
        log_activity('ADMIN_RESET_FAILED', f'Admin not found for reset verification: {email}')
        return jsonify({'error': 'Admin account not found'}), 404
    
    if not verify_code(email, code, 'password_reset'):
        log_activity('ADMIN_RESET_FAILED', f'Invalid reset code for: {email}')
        return jsonify({'error': 'Invalid or expired reset code'}), 400
    
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    # Log successful reset
    log_activity('ADMIN_RESET_SUCCESS', f'Password reset successful for admin: {email}')
    
    return jsonify({'message': 'Password reset successfully'})

@app.route('/api/2fa/setup', methods=['GET'])
@login_required
def setup_2fa():
    user = User.query.get(session['user_id'])
    if user.totp_secret:
        secret = user.totp_secret
    else:
        secret = pyotp.random_base32()
        user.totp_secret = secret
        db.session.commit()
    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="ZmartTradingBot")
    return jsonify({'secret': secret, 'otp_uri': otp_uri})

@app.route('/api/2fa/enable', methods=['POST'])
@login_required
def enable_2fa():
    data = request.json
    code = data.get('code')
    user = User.query.get(session['user_id'])
    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(code):
        return jsonify({'error': 'Invalid 2FA code'}), 400
    user.is_2fa_enabled = True
    db.session.commit()
    return jsonify({'message': '2FA enabled'})

@app.route('/api/2fa/verify', methods=['POST'])
@login_required
def verify_2fa():
    data = request.json
    code = data.get('code')
    user = User.query.get(session['user_id'])
    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(code):
        return jsonify({'error': 'Invalid 2FA code'}), 400
    return jsonify({'message': '2FA verified'})

@app.route('/api/apikeys', methods=['GET'])
@login_required
@admin_required
def get_apikeys():
    """Get all API keys - All admins can view"""
    try:
        user = User.query.get(session['user_id'])
        
        # Get all API keys from SuperAdmin user
        superadmin = User.query.filter_by(email=SUPERADMIN_EMAIL).first()
        if not superadmin:
            return jsonify({'error': 'SuperAdmin not found'}), 404
            
        api_keys = APIKey.query.filter_by(user_id=superadmin.id).all()
        
        keys_data = []
        for key in api_keys:
            keys_data.append({
                'id': key.id,
                'name': key.name,
                'key': decrypt(key.key_enc)[:8] + '...' if key.key_enc else None,
                'has_secret': bool(key.secret_enc),
                'has_passphrase': bool(key.passphrase_enc),
                'created_at': key.created_at.isoformat() if key.created_at else None,
                'can_edit': user.is_superadmin  # Only SuperAdmin can edit
            })
        
        log_activity('API_KEYS_VIEWED', f'Viewed {len(keys_data)} API keys')
        return jsonify({'api_keys': keys_data})
    except Exception as e:
        app.logger.error(f"Error getting API keys: {e}")
        return jsonify({'error': 'Failed to get API keys'}), 500

@app.route('/api/apikeys', methods=['POST'])
@login_required
@superadmin_required
def add_apikey():
    """Add new API key - SuperAdmin only"""
    try:
        data = request.get_json()
        name = data.get('name')
        key = data.get('key')
        secret = data.get('secret')
        passphrase = data.get('passphrase')
        
        if not name or not key:
            return jsonify({'error': 'Name and API key are required'}), 400
        
        # Always use SuperAdmin user for API keys
        superadmin = User.query.filter_by(email=SUPERADMIN_EMAIL).first()
        if not superadmin:
            return jsonify({'error': 'SuperAdmin not found'}), 404
        
        # Check if API key with this name already exists
        existing_key = APIKey.query.filter_by(user_id=superadmin.id, name=name).first()
        if existing_key:
            return jsonify({'error': f'API key with name "{name}" already exists'}), 400
        
        # Create new API key with encryption
        new_key = APIKey(
            user_id=superadmin.id,
            name=name,
            key_enc=encrypt(key),
            secret_enc=encrypt(secret) if secret else None,
            passphrase_enc=encrypt(passphrase) if passphrase else None
        )
        
        db.session.add(new_key)
        db.session.commit()
        
        log_activity('API_KEY_ADDED', f'Added API key: {name}')
        return jsonify({'message': 'API key added successfully', 'id': new_key.id}), 201
        
    except Exception as e:
        app.logger.error(f"Error adding API key: {e}")
        return jsonify({'error': 'Failed to add API key'}), 500

@app.route('/api/apikeys/<int:key_id>', methods=['DELETE'])
@login_required
@superadmin_required
def delete_apikey(key_id):
    """Delete API key - SuperAdmin only"""
    try:
        # Always use SuperAdmin user for API keys
        superadmin = User.query.filter_by(email=SUPERADMIN_EMAIL).first()
        if not superadmin:
            return jsonify({'error': 'SuperAdmin not found'}), 404
            
        api_key = APIKey.query.filter_by(id=key_id, user_id=superadmin.id).first()
        
        if not api_key:
            return jsonify({'error': 'API key not found'}), 404
        
        key_name = api_key.name
        db.session.delete(api_key)
        db.session.commit()
        
        log_activity('API_KEY_DELETED', f'Deleted API key: {key_name}')
        return jsonify({'message': 'API key deleted successfully'})
        
    except Exception as e:
        app.logger.error(f"Error deleting API key: {e}")
        return jsonify({'error': 'Failed to delete API key'}), 500

@app.route('/api/apikeys/<int:key_id>', methods=['PUT'])
@login_required
@superadmin_required
def update_apikey(key_id):
    """Update API key - SuperAdmin only"""
    try:
        data = request.get_json()
        name = data.get('name')
        key = data.get('key')
        secret = data.get('secret')
        passphrase = data.get('passphrase')
        
        # Always use SuperAdmin user for API keys
        superadmin = User.query.filter_by(email=SUPERADMIN_EMAIL).first()
        if not superadmin:
            return jsonify({'error': 'SuperAdmin not found'}), 404
            
        api_key = APIKey.query.filter_by(id=key_id, user_id=superadmin.id).first()
        
        if not api_key:
            return jsonify({'error': 'API key not found'}), 404
        
        # Check if new name conflicts with existing key
        if name and name != api_key.name:
            existing_key = APIKey.query.filter_by(user_id=superadmin.id, name=name).first()
            if existing_key:
                return jsonify({'error': f'API key with name "{name}" already exists'}), 400
        
        # Update fields
        if name:
            api_key.name = name
        if key:
            api_key.key_enc = encrypt(key)
        if secret is not None:  # Allow empty string to clear secret
            api_key.secret_enc = encrypt(secret) if secret else None
        if passphrase is not None:  # Allow empty string to clear passphrase
            api_key.passphrase_enc = encrypt(passphrase) if passphrase else None
        
        db.session.commit()
        
        log_activity('API_KEY_UPDATED', f'Updated API key: {api_key.name}')
        return jsonify({'message': 'API key updated successfully'})
        
    except Exception as e:
        app.logger.error(f"Error updating API key: {e}")
        return jsonify({'error': 'Failed to update API key'}), 500

@app.route('/api/apikeys/<int:key_id>/decrypt', methods=['GET'])
@login_required
@superadmin_required
def decrypt_apikey(key_id):
    """Get decrypted API key data - SuperAdmin only"""
    try:
        # Always use SuperAdmin user for API keys
        superadmin = User.query.filter_by(email=SUPERADMIN_EMAIL).first()
        if not superadmin:
            return jsonify({'error': 'SuperAdmin not found'}), 404
            
        api_key = APIKey.query.filter_by(id=key_id, user_id=superadmin.id).first()
        
        if not api_key:
            return jsonify({'error': 'API key not found'}), 404
        
        decrypted_data = {
            'id': api_key.id,
            'name': api_key.name,
            'key': decrypt(api_key.key_enc),
            'secret': decrypt(api_key.secret_enc) if api_key.secret_enc else None,
            'passphrase': decrypt(api_key.passphrase_enc) if api_key.passphrase_enc else None
        }
        
        log_activity('API_KEY_DECRYPTED', f'Decrypted API key: {api_key.name}')
        return jsonify(decrypted_data)
        
    except Exception as e:
        app.logger.error(f"Error decrypting API key: {e}")
        return jsonify({'error': 'Failed to decrypt API key'}), 500

@app.route('/api/apikeys/service/<service_name>', methods=['GET'])
@login_required
def get_service_apikey(service_name):
    """Get API key for specific service - for internal system use"""
    try:
        # Only SuperAdmin can access API keys
        user = User.query.get(session['user_id'])
        if not user.is_superadmin:
            return jsonify({'error': 'SuperAdmin access required'}), 403
        
        # Always use SuperAdmin user for API keys
        superadmin = User.query.filter_by(email=SUPERADMIN_EMAIL).first()
        if not superadmin:
            return jsonify({'error': 'SuperAdmin not found'}), 404
            
        api_key = APIKey.query.filter_by(user_id=superadmin.id, name=service_name.lower()).first()
        
        if not api_key:
            return jsonify({'error': f'API key for service "{service_name}" not found'}), 404
        
        # Return decrypted data for system use
        decrypted_data = {
            'name': api_key.name,
            'key': decrypt(api_key.key_enc),
            'secret': decrypt(api_key.secret_enc) if api_key.secret_enc else None,
            'passphrase': decrypt(api_key.passphrase_enc) if api_key.passphrase_enc else None
        }
        
        log_activity('SERVICE_API_KEY_ACCESSED', f'Accessed API key for service: {service_name}')
        return jsonify(decrypted_data)
        
    except Exception as e:
        app.logger.error(f"Error getting service API key: {e}")
        return jsonify({'error': 'Failed to get service API key'}), 500

@app.route('/api/admin/reset_password', methods=['POST'])
@login_required
@admin_required
def admin_reset_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('new_password')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    # Always notify MasterAdmin only
    try:
        msg = Message('A password was reset by admin', recipients=[SUPERADMIN_EMAIL])
        msg.body = f'Password for user {email} was reset by an admin.'
        mail.send(msg)
    except Exception as e:
        print(f"[WARN] Could not send email: {e}")
    return jsonify({'message': 'Password reset'})

@app.route('/api/admin/request_reset', methods=['POST'])
def request_admin_reset():
    data = request.json
    email = data.get('email')
    if email != SUPERADMIN_EMAIL:
        return jsonify({'error': 'Not authorized'}), 403
    # Send a reset code to MasterAdmin only
    code = base64.urlsafe_b64encode(os.urandom(6)).decode()
    session['admin_reset_code'] = code
    try:
        msg = Message('Admin Password Reset Code', recipients=[SUPERADMIN_EMAIL])
        msg.body = f'Your admin password reset code: {code}'
        mail.send(msg)
    except Exception as e:
        print(f"[WARN] Could not send email: {e}")
    return jsonify({'message': 'Reset code sent'})

@app.route('/api/admin/confirm_reset', methods=['POST'])
def confirm_admin_reset():
    data = request.json
    code = data.get('code')
    new_password = data.get('new_password')
    if code != session.get('admin_reset_code'):
        return jsonify({'error': 'Invalid code'}), 400
    user = User.query.filter_by(email=SUPERADMIN_EMAIL).first()
    if not user:
        return jsonify({'error': 'Admin not found'}), 404
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    session.pop('admin_reset_code', None)
    return jsonify({'message': 'Admin password reset'})

@app.route('/api/kucoin/contracts', methods=['GET'])
@login_required
def get_kucoin_contracts():
    """Get all available KuCoin futures contracts"""
    try:
        # Get user's API keys
        user = User.query.get(session['user_id'])
        api_key = APIKey.query.filter_by(user_id=user.id, name='KuCoin').first()
        if not api_key:
            return jsonify({'error': 'KuCoin API key not found'}), 404

        # Decrypt API credentials
        key = decrypt(api_key.key_enc)
        secret = decrypt(api_key.secret_enc)
        passphrase = decrypt(api_key.passphrase_enc)

        # Make request to KuCoin API
        url = 'https://api-futures.kucoin.com/api/v1/contracts/active'
        headers = {
            'KC-API-KEY': key,
            'KC-API-SECRET': secret,
            'KC-API-PASSPHRASE': passphrase,
            'KC-API-TIMESTAMP': str(int(time.time() * 1000))
        }
        
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch contracts from KuCoin', 'status': response.status_code}), response.status_code
        
        data = response.json()
        if 'data' not in data:
            return jsonify({'error': 'Unexpected KuCoin response'}), 500
            
        return jsonify({
            'contracts': data['data'],
            'count': len(data['data'])
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/kucoin/funding-rate/<symbol>', methods=['GET'])
@login_required
def get_kucoin_funding_rate(symbol):
    """Get funding rate for a specific symbol"""
    try:
        # Get user's API keys
        user = User.query.get(session['user_id'])
        api_key = APIKey.query.filter_by(user_id=user.id, name='KuCoin').first()
        if not api_key:
            return jsonify({'error': 'KuCoin API key not found'}), 404

        # Decrypt API credentials
        key = decrypt(api_key.key_enc)
        secret = decrypt(api_key.secret_enc)
        passphrase = decrypt(api_key.passphrase_enc)

        # Make request to KuCoin API
        url = f'https://api-futures.kucoin.com/api/v1/contracts/{symbol}/funding-rate'
        headers = {
            'KC-API-KEY': key,
            'KC-API-SECRET': secret,
            'KC-API-PASSPHRASE': passphrase,
            'KC-API-TIMESTAMP': str(int(time.time() * 1000))
        }
        
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch funding rate from KuCoin', 'status': response.status_code}), response.status_code
        
        data = response.json()
        if 'data' not in data:
            return jsonify({'error': 'Unexpected KuCoin response'}), 500
            
        return jsonify({
            'symbol': symbol,
            'funding_rate': data['data']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/kucoin/funding-rates', methods=['GET'])
@login_required
def get_kucoin_funding_rates():
    """Get funding rates for all active contracts"""
    try:
        # Get user's API keys
        user = User.query.get(session['user_id'])
        api_key = APIKey.query.filter_by(user_id=user.id, name='KuCoin').first()
        if not api_key:
            return jsonify({'error': 'KuCoin API key not found'}), 404

        # Decrypt API credentials
        key = decrypt(api_key.key_enc)
        secret = decrypt(api_key.secret_enc)
        passphrase = decrypt(api_key.passphrase_enc)

        # First get all active contracts
        contracts_url = 'https://api-futures.kucoin.com/api/v1/contracts/active'
        headers = {
            'KC-API-KEY': key,
            'KC-API-SECRET': secret,
            'KC-API-PASSPHRASE': passphrase,
            'KC-API-TIMESTAMP': str(int(time.time() * 1000))
        }
        
        contracts_response = requests.get(contracts_url, headers=headers)
        if contracts_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch contracts from KuCoin', 'status': contracts_response.status_code}), contracts_response.status_code
        
        contracts_data = contracts_response.json()
        if 'data' not in contracts_data:
            return jsonify({'error': 'Unexpected KuCoin response'}), 500
        
        # Get funding rates for each contract
        funding_rates = []
        for contract in contracts_data['data']:
            symbol = contract['symbol']
            try:
                # Get funding rate for this symbol
                funding_url = f'https://api-futures.kucoin.com/api/v1/contracts/{symbol}/funding-rate'
                funding_response = requests.get(funding_url, headers=headers)
                
                if funding_response.status_code == 200:
                    funding_data = funding_response.json()
                    if 'data' in funding_data:
                        funding_rates.append({
                            'symbol': symbol,
                            'funding_rate': funding_data['data'].get('fundingRate', 0),
                            'next_funding_time': funding_data['data'].get('nextFundingTime'),
                            'mark_price': contract.get('markPrice'),
                            'index_price': contract.get('indexPrice'),
                            'price_change_24h': contract.get('priceChgPct', 0)
                        })
            except Exception as e:
                # Continue with other symbols if one fails
                continue
        
        return jsonify({
            'funding_rates': funding_rates,
            'total_count': len(funding_rates)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/kucoin/market-stats', methods=['GET'])
@login_required
def get_kucoin_market_stats():
    """Get overall market statistics"""
    try:
        # Get user's API keys
        user = User.query.get(session['user_id'])
        api_key = APIKey.query.filter_by(user_id=user.id, name='KuCoin').first()
        if not api_key:
            return jsonify({'error': 'KuCoin API key not found'}), 404

        # Decrypt API credentials
        key = decrypt(api_key.key_enc)
        secret = decrypt(api_key.secret_enc)
        passphrase = decrypt(api_key.passphrase_enc)

        # Make request to KuCoin API
        url = 'https://api-futures.kucoin.com/api/v1/contracts/active'
        headers = {
            'KC-API-KEY': key,
            'KC-API-SECRET': secret,
            'KC-API-PASSPHRASE': passphrase,
            'KC-API-TIMESTAMP': str(int(time.time() * 1000))
        }
        
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch market stats from KuCoin', 'status': response.status_code}), response.status_code
        
        data = response.json()
        if 'data' not in data:
            return jsonify({'error': 'Unexpected KuCoin response'}), 500
        
        # Calculate market statistics
        contracts = data['data']
        total_volume = sum(float(contract.get('volumeOf24h', 0)) for contract in contracts)
        total_turnover = sum(float(contract.get('turnoverOf24h', 0)) for contract in contracts)
        total_open_interest = sum(float(contract.get('openInterest', 0)) for contract in contracts)
        
        # Get top gainers and losers
        sorted_contracts = sorted(contracts, key=lambda x: float(x.get('priceChgPct', 0)), reverse=True)
        top_gainers = sorted_contracts[:5]
        top_losers = sorted_contracts[-5:]
        
        return jsonify({
            'total_contracts': len(contracts),
            'total_volume_24h': total_volume,
            'total_turnover_24h': total_turnover,
            'total_open_interest': total_open_interest,
            'top_gainers': top_gainers,
            'top_losers': top_losers
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/kucoin/price/<symbol>', methods=['GET'])
@login_required
def get_kucoin_price(symbol):
    try:
        # Get user's API keys
        user = User.query.get(session['user_id'])
        api_key = APIKey.query.filter_by(user_id=user.id, name='KuCoin').first()
        if not api_key:
            return jsonify({'error': 'KuCoin API key not found'}), 404

        # Decrypt API credentials
        key = decrypt(api_key.key_enc)
        secret = decrypt(api_key.secret_enc)
        passphrase = decrypt(api_key.passphrase_enc)

        # Make request to KuCoin API
        url = f'https://api-futures.kucoin.com/api/v1/contracts/{symbol}'
        headers = {
            'KC-API-KEY': key,
            'KC-API-SECRET': secret,
            'KC-API-PASSPHRASE': passphrase,
            'KC-API-TIMESTAMP': str(int(time.time() * 1000))
        }
        
        response = requests.get(url, headers=headers)
        print('--- KuCoin API Response ---')
        print('Status:', response.status_code)
        print('Headers:', response.headers)
        print('Body:', response.text)
        print('--------------------------')
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch price from KuCoin', 'kucoin_status': response.status_code, 'kucoin_body': response.text}), response.status_code
        
        data = response.json()
        # Defensive: print the data structure
        print('Parsed JSON:', data)
        if 'data' not in data or 'lastTradePrice' not in data['data']:
            return jsonify({'error': 'Unexpected KuCoin response', 'data': data}), 500
        
        # Return comprehensive data
        contract_data = data['data']
        return jsonify({
            'symbol': symbol,
            'price': contract_data['lastTradePrice'],
            'mark_price': contract_data.get('markPrice'),
            'index_price': contract_data.get('indexPrice'),
            'high_24h': contract_data.get('highPrice'),
            'low_24h': contract_data.get('lowPrice'),
            'volume_24h': contract_data.get('volumeOf24h'),
            'turnover_24h': contract_data.get('turnoverOf24h'),
            'open_interest': contract_data.get('openInterest'),
            'price_change_24h': contract_data.get('priceChg'),
            'price_change_pct_24h': contract_data.get('priceChgPct'),
            'funding_rate': contract_data.get('fundingFeeRate'),
            'max_leverage': contract_data.get('maxLeverage'),
            'status': contract_data.get('status'),
            'timestamp': contract_data.get('timestamp', None),
            'raw': contract_data
        })
    except Exception as e:
        import traceback
        print('Exception in get_kucoin_price:', traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/roadmap', methods=['GET'])
def get_roadmap():
    """Get roadmap data for the frontend"""
    try:
        # Read roadmap data from ROADMAP.md file
        roadmap_file = '../ROADMAP.md'
        if os.path.exists(roadmap_file):
            with open(roadmap_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse the roadmap content
            lines = content.split('\n')
            date = ''
            achievements = []
            
            for line in lines:
                if line.startswith('**Date:**'):
                    date = line.replace('**Date:**', '').strip()
                elif line.startswith('- ✅'):
                    achievement = line.replace('- ✅', '').strip()
                    achievements.append(achievement)
            
            roadmap_data = {
                'date': date or '2025-06-23',
                'achievements': achievements
            }
            
            return jsonify({
                'success': True,
                'roadmap': roadmap_data
            })
        else:
            # Fallback data if file doesn't exist
            return jsonify({
                'success': True,
                'roadmap': {
                    'date': '2025-06-23',
                    'achievements': [
                        '✅ Project bootstrapped with React, Vite, and Tailwind CSS',
                        '✅ Secure API key manager with password hashing and encryption',
                        '✅ Complete authentication system with SuperAdmin and regular admins',
                        '✅ Admin management system with activity logging',
                        '✅ Version automation system with Git integration',
                        '✅ Startup and shutdown automation scripts',
                        '✅ API key security improvements and management'
                    ]
                }
            })
            
    except Exception as e:
        app.logger.error(f"Error getting roadmap: {e}")
        return jsonify({'error': 'Failed to get roadmap data'}), 500

@app.route('/api/roadmap-versions', methods=['GET'])
def roadmap_versions():
    try:
        # Accurate version information based on actual Git history and achievements
        static_versions = [
            {
                'version': 'V1',
                'title': 'Project Foundation & Strategy Documentation',
                'date': '2025-06-12',
                'details': '''🚀 **Project Foundation: Initial ZmartBot Strategy & Documentation Setup**
• Initial commit with complete ZmartBot trading strategy documentation
• Comprehensive PDF documentation: Cryptometer API reference, RiskMetric methodology, KuCoin integration guide
• Position management formulas and historical trades data structure
• Basic dashboard UI components and project structure
• All core strategy documents and reference materials established'''
            },
            {
                'version': 'V2',
                'title': 'Complete Authentication & Admin Management System',
                'date': '2025-06-22',
                'details': '''🔐 **Major Authentication & Admin Management: Fully Tested & Stable**
• Complete user authentication system with secure login/logout flows
• Admin user management with role-based access control (admin/superadmin)
• Password reset functionality with email notifications (tested and working)
• Comprehensive admin settings panel with user management capabilities
• Session management with CSRF protection and secure cookie handling
• Extensive testing suite: 15+ test files covering all authentication flows
• Frontend/backend improvements with polished UI and responsive design
• All flows tested and stable - previous version preserved in Git history'''
            },
            {
                'version': 'V3',
                'title': 'API Management & Version Control System',
                'date': '2025-06-23',
                'details': '''📊 **Complete API Management & Version Control: Production Ready**
• KuCoin API integration with live price feeds and real-time data
• API key management system with secure storage and validation
• Complete admin management system with user roles and permissions
• Version control automation with Git tag integration
• Roadmap UI with dynamic version cards and expandable details
• Comprehensive documentation system with automated updates
• Startup guides and version automation scripts for deployment
• Database management and API testing suite (20+ test files)
• All systems tested and production-ready'''
            },
            {
                'version': 'V4',
                'title': 'Roadmap Automation & UI Polish',
                'date': '2025-06-24',
                'details': '''🎯 **Roadmap Automation & Professional UI Polish: Complete**
• Automated roadmap system with Git integration for version tracking
• Professional dark theme UI with green accent (#00FF94) design system
• Enhanced Roadmap component with expandable version cards and detailed explanations
• Super Admin version restore functionality in Settings tab
• Backend API enhancements with detailed version information
• Responsive sidebar navigation with active state indicators
• Complete version management system with restore capabilities
• All UI components polished and professional-grade
• Full integration of version control with user interface'''
            },
        ]
        
        # Try to get Git versions and merge with static data
        try:
            tags = subprocess.check_output(['git', 'tag', '--sort=version:refname'], text=True).splitlines()
            git_versions = []
            
            for tag in tags:
                if tag.startswith('V'):
                    try:
                        # Get tag details
                        commit_info = subprocess.check_output(['git', 'show', tag, '--no-patch', '--pretty=format:%s||%b'], text=True)
                        subject, body = commit_info.split('||', 1)
                        
                        # Find matching static version
                        static_version = next((v for v in static_versions if v['version'] == tag.upper()), None)
                        
                        if static_version:
                            git_versions.append(static_version)
                        else:
                            # Create new version from Git data
                            git_versions.append({
                                'version': tag.upper(),
                                'title': subject.strip(),
                                'date': tag,
                                'details': body.strip() if body.strip() else subject.strip()
                            })
                    except Exception as e:
                        print(f"Error processing tag {tag}: {e}")
                        continue
            
            # If we have Git versions, use them; otherwise use static versions
            if git_versions:
                return jsonify({'success': True, 'versions': git_versions})
            else:
                return jsonify({'success': True, 'versions': static_versions})
                
        except Exception as e:
            print(f"Error getting Git versions: {e}")
            # Fallback to static versions
            return jsonify({'success': True, 'versions': static_versions})
            
    except Exception as e:
        print(f"Error in roadmap_versions: {e}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/restore-version', methods=['POST'])
@login_required
def restore_version():
    try:
        user = User.query.get(session['user_id'])
        if not user or not getattr(user, 'is_superadmin', False):
            return jsonify({'error': 'Super admin privileges required'}), 403
        data = request.get_json()
        version = data.get('version')
        if not version or not re.match(r'^V\d+$', version):
            return jsonify({'error': 'Invalid version'}), 400
        # Perform git checkout
        result = subprocess.run(['git', 'checkout', version], capture_output=True, text=True)
        if result.returncode != 0:
            return jsonify({'error': result.stderr.strip()}), 500
        return jsonify({'success': True, 'message': f'Restored to {version}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001) 