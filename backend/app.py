import os
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.fernet import Fernet
import pyotp
import base64
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///zmarttrading.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME')

ADMIN_EMAIL = 'seme@kryptostack.com'

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
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    totp_secret = db.Column(db.String(32), nullable=True)
    is_2fa_enabled = db.Column(db.Boolean, default=False)

class APIKey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(64), nullable=False)
    key_enc = db.Column(db.String(512), nullable=False)
    secret_enc = db.Column(db.String(512), nullable=True)
    passphrase_enc = db.Column(db.String(512), nullable=True)

# Helpers
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = User.query.get(session.get('user_id'))
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin required'}), 403
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

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    is_admin = (email == ADMIN_EMAIL)
    user = User(
        email=email,
        password_hash=generate_password_hash(password),
        is_admin=is_admin
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Registered successfully'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    session['user_id'] = user.id
    if user.is_2fa_enabled:
        return jsonify({'2fa_required': True})
    return jsonify({'message': 'Login successful'})

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

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})

@app.route('/api/apikeys', methods=['GET'])
@login_required
def get_apikeys():
    user = User.query.get(session['user_id'])
    keys = APIKey.query.filter_by(user_id=user.id).all()
    return jsonify([
        {
            'id': k.id,
            'name': k.name,
            'key': decrypt(k.key_enc),
            'secret': decrypt(k.secret_enc),
            'passphrase': decrypt(k.passphrase_enc)
        } for k in keys
    ])

@app.route('/api/apikeys', methods=['POST'])
@login_required
def add_apikey():
    data = request.json
    name = data.get('name')
    key = data.get('key')
    secret = data.get('secret')
    passphrase = data.get('passphrase')
    user = User.query.get(session['user_id'])
    apikey = APIKey(
        user_id=user.id,
        name=name,
        key_enc=encrypt(key),
        secret_enc=encrypt(secret),
        passphrase_enc=encrypt(passphrase)
    )
    db.session.add(apikey)
    db.session.commit()
    return jsonify({'message': 'API key added'})

@app.route('/api/apikeys/<int:key_id>', methods=['DELETE'])
@login_required
def delete_apikey(key_id):
    user = User.query.get(session['user_id'])
    apikey = APIKey.query.filter_by(id=key_id, user_id=user.id).first()
    if not apikey:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(apikey)
    db.session.commit()
    return jsonify({'message': 'API key deleted'})

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
    # Optionally notify user by email
    if email != ADMIN_EMAIL:
        try:
            msg = Message('Your password was reset by admin', recipients=[email])
            msg.body = 'Your password was reset by the admin. If this was not you, please contact support.'
            mail.send(msg)
        except Exception as e:
            print(f"[WARN] Could not send email: {e}")
    return jsonify({'message': 'Password reset'})

@app.route('/api/admin/request_reset', methods=['POST'])
def request_admin_reset():
    data = request.json
    email = data.get('email')
    if email != ADMIN_EMAIL:
        return jsonify({'error': 'Not authorized'}), 403
    # Send a reset link or code to admin email
    # For demo, just send a code
    code = base64.urlsafe_b64encode(os.urandom(6)).decode()
    session['admin_reset_code'] = code
    try:
        msg = Message('Admin Password Reset Code', recipients=[ADMIN_EMAIL])
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
    user = User.query.filter_by(email=ADMIN_EMAIL).first()
    if not user:
        return jsonify({'error': 'Admin not found'}), 404
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    session.pop('admin_reset_code', None)
    return jsonify({'message': 'Admin password reset'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True) 