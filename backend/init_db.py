#!/usr/bin/env python3
"""
Simple database initialization script
"""

from app import app, db, User
from werkzeug.security import generate_password_hash
from datetime import datetime
from sqlalchemy import inspect

def init_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        # Debug: print all tables using SQLAlchemy inspector
        inspector = inspect(db.engine)
        print("[DEBUG] Tables in database:", inspector.get_table_names())
        
        # Check if SuperAdmin exists
        existing_user = User.query.filter_by(email='seme@kryptostack.com').first()
        
        if existing_user:
            print(f"✅ SuperAdmin already exists (ID: {existing_user.id})")
            return existing_user
        
        # Create SuperAdmin
        superadmin = User(
            email='seme@kryptostack.com',
            name='SuperAdmin',
            password_hash=generate_password_hash('Seme0504', method='pbkdf2:sha256'),
            is_superadmin=True,
            is_admin=True,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.session.add(superadmin)
        db.session.commit()
        
        print("✅ SuperAdmin created successfully!")
        print(f"📧 Email: {superadmin.email}")
        print(f"🔑 Password: Seme0504")
        print(f"🆔 User ID: {superadmin.id}")
        
        return superadmin

if __name__ == "__main__":
    print("🚀 Initializing ZmartTrading Database...")
    user = init_database()
    print("🎉 Database initialization completed!") 