#!/usr/bin/env python3
"""
Test Email Sending
Tests if the email configuration is working properly
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/ZBot.env')

def test_email_config():
    print("🔧 Testing Email Configuration")
    print("=" * 50)
    
    # Check environment variables
    mail_username = os.environ.get('MAIL_USERNAME')
    mail_password = os.environ.get('MAIL_PASSWORD')
    
    print(f"MAIL_USERNAME: {'✅ Set' if mail_username else '❌ Not set'}")
    print(f"MAIL_PASSWORD: {'✅ Set' if mail_password else '❌ Not set'}")
    
    if not mail_username or not mail_password:
        print("\n❌ Email configuration is incomplete!")
        print("Please check your .env file")
        return False
    
    print(f"\n📧 Email: {mail_username}")
    print(f"🔑 Password: {'*' * len(mail_password)}")
    
    # Test Flask-Mail configuration
    try:
        from flask import Flask
        from flask_mail import Mail, Message
        
        app = Flask(__name__)
        app.config['MAIL_SERVER'] = 'smtp.gmail.com'
        app.config['MAIL_PORT'] = 587
        app.config['MAIL_USE_TLS'] = True
        app.config['MAIL_USERNAME'] = mail_username
        app.config['MAIL_PASSWORD'] = mail_password
        app.config['MAIL_DEFAULT_SENDER'] = mail_username
        
        mail = Mail(app)
        
        print("\n✅ Flask-Mail configuration successful")
        
        # Test sending a simple email
        with app.app_context():
            try:
                msg = Message('Test Email', recipients=[mail_username])
                msg.body = 'This is a test email from ZmartTrading Bot'
                mail.send(msg)
                print("✅ Test email sent successfully!")
                return True
            except Exception as e:
                print(f"❌ Failed to send test email: {e}")
                return False
                
    except Exception as e:
        print(f"❌ Flask-Mail configuration failed: {e}")
        return False

if __name__ == "__main__":
    success = test_email_config()
    sys.exit(0 if success else 1) 