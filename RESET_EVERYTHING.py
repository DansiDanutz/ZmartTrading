#!/usr/bin/env python3
"""
Complete reset script for ZmartTrading
This will clean everything and start fresh
"""

import os
import sys
import subprocess
import time

def run_command(command, description):
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            if result.stdout:
                print(f"Output: {result.stdout.strip()}")
        else:
            print(f"❌ {description} failed")
            if result.stderr:
                print(f"Error: {result.stderr.strip()}")
        return result.returncode == 0
    except Exception as e:
        print(f"❌ {description} failed with exception: {e}")
        return False

def main():
    print("=" * 60)
    print("🚀 ZMARTTRADING COMPLETE RESET")
    print("=" * 60)
    
    # Step 1: Kill all Python processes
    print("\n1️⃣ Stopping all Python processes...")
    run_command("taskkill /f /im python.exe /t", "Killing Python processes")
    
    # Step 2: Remove all database files
    print("\n2️⃣ Cleaning database files...")
    db_files = [
        "zmarttrading.db",
        "backend/zmarttrading.db", 
        "backend/instance/zmarttrading.db"
    ]
    
    for db_file in db_files:
        if os.path.exists(db_file):
            os.remove(db_file)
            print(f"✅ Removed: {db_file}")
        else:
            print(f"ℹ️  Not found: {db_file}")
    
    # Step 3: Create fresh database and admin
    print("\n3️⃣ Creating fresh database and admin user...")
    if run_command("cd backend && python create_admin_flask.py", "Creating admin user"):
        print("✅ Database and admin user created successfully!")
    else:
        print("❌ Failed to create admin user")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 RESET COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    
    print("\n📋 NEXT STEPS:")
    print("1. Open a NEW PowerShell window")
    print("2. Run: cd C:\\Users\\dansi\\Desktop\\ZmartTrading\\backend")
    print("3. Run: python app.py")
    print("4. Open another PowerShell window")
    print("5. Run: cd C:\\Users\\dansi\\Desktop\\ZmartTrading")
    print("6. Run: npm run dev")
    print("7. Go to http://localhost:5173 (or whatever port Vite shows)")
    print("8. Login with: seme@kryptostack.com / Seme0504")
    
    print("\n⚠️  IMPORTANT:")
    print("- Do NOT use '&&' in PowerShell")
    print("- Run each command separately")
    print("- Make sure you're in the correct directory")
    
    print("\n🔧 If you still have issues:")
    print("- Check that no other Python processes are running")
    print("- Make sure you're using the correct PowerShell commands")
    print("- The backend should show: 'Running on http://localhost:5000'")
    
    return True

if __name__ == "__main__":
    main() 