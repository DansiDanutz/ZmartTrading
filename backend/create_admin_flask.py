#!/usr/bin/env python3
"""
Database initialization script for ZmartTrading
Creates the SuperAdmin user and sets up the database
"""

import os
import sys
from datetime import datetime
from werkzeug.security import generate_password_hash

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User

def create_superadmin():
    """Create the SuperAdmin user if it doesn't exist"""
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if SuperAdmin already exists
        superadmin = User.query.filter_by(email='seme@kryptostack.com').first()
        
        if superadmin:
            print("✅ SuperAdmin already exists")
            return True
        
        # Create SuperAdmin
        superadmin = User(
            email='seme@kryptostack.com',
            name='SuperAdmin',
            password_hash=generate_password_hash('Seme0504'),
            is_superadmin=True,
            is_admin=True,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.session.add(superadmin)
        db.session.commit()
        
        print("✅ SuperAdmin created successfully!")
        print("📧 Email: seme@kryptostack.com")
        print("🔑 Password: Seme0504")
        print("⚠️  Please change the password after first login!")
        
        return True

def main():
    print("🚀 Initializing ZmartTrading Database...")
    
    try:
        create_superadmin()
        print("\n🎉 Database initialization completed successfully!")
        print("\n📋 Next steps:")
        print("1. Start the backend: python app.py")
        print("2. Start the frontend: npm run dev")
        print("3. Login with: seme@kryptostack.com / Seme0504")
        print("4. Go to Settings to change password and manage admins")
        
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main() 