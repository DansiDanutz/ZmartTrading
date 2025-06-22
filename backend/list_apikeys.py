#!/usr/bin/env python3
"""
List all API key names in the database for verification.
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app import db, APIKey, User, app

print("\n=== API KEYS IN DATABASE ===\n")

with app.app_context():
    api_keys = APIKey.query.all()
    if not api_keys:
        print("No API keys found.")
    else:
        for key in api_keys:
            user = User.query.get(key.user_id)
            print(f"ID: {key.id} | Name: {key.name} | User: {user.email if user else 'Unknown'}")

print("\n===========================\n") 