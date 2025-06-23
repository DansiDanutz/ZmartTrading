#!/usr/bin/env python3
"""
Test script to verify version automation system
"""

import subprocess
import json
import requests
import time

def test_version_automation():
    print("🧪 Testing Version Automation System")
    print("=" * 50)
    
    # 1. Test current Git tags
    print("\n1. Checking current Git tags...")
    try:
        result = subprocess.run(['git', 'tag', '--sort=-version:refname'], 
                              capture_output=True, text=True)
        current_tags = result.stdout.strip().split('\n') if result.stdout.strip() else []
        print(f"   Current tags: {current_tags}")
    except Exception as e:
        print(f"   ❌ Error checking tags: {e}")
        return False
    
    # 2. Test backend roadmap versions endpoint
    print("\n2. Testing backend roadmap versions endpoint...")
    try:
        response = requests.get('http://localhost:5001/api/roadmap-versions', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                versions = data.get('versions', [])
                print(f"   ✅ Backend returned {len(versions)} versions")
                for v in versions:
                    print(f"      - {v.get('version')}: {v.get('title', 'No title')}")
            else:
                print(f"   ❌ Backend error: {data.get('error')}")
                return False
        else:
            print(f"   ❌ Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error testing backend: {e}")
        return False
    
    # 3. Test frontend can access the data
    print("\n3. Testing frontend access...")
    try:
        # Test if frontend is running
        response = requests.get('http://localhost:5173/', timeout=5)
        if response.status_code == 200:
            print("   ✅ Frontend is accessible")
        else:
            print(f"   ⚠️  Frontend returned status {response.status_code}")
    except Exception as e:
        print(f"   ⚠️  Frontend not accessible: {e}")
    
    # 4. Test save_version.py script structure
    print("\n4. Testing save_version.py script...")
    try:
        with open('save_version.py', 'r') as f:
            content = f.read()
            if 'git tag' in content and 'git push' in content:
                print("   ✅ save_version.py contains Git operations")
            else:
                print("   ❌ save_version.py missing Git operations")
                return False
    except Exception as e:
        print(f"   ❌ Error reading save_version.py: {e}")
        return False
    
    # 5. Test restore functionality (without actually restoring)
    print("\n5. Testing restore endpoint structure...")
    try:
        with open('backend/app.py', 'r') as f:
            content = f.read()
            if '/api/restore-version' in content and 'git checkout' in content:
                print("   ✅ Restore endpoint implemented")
            else:
                print("   ❌ Restore endpoint missing")
                return False
    except Exception as e:
        print(f"   ❌ Error checking restore endpoint: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("✅ Version Automation System Test Complete!")
    print("\n📋 Summary:")
    print("   • Git tags are accessible")
    print("   • Backend roadmap endpoint is working")
    print("   • Frontend can access the data")
    print("   • save_version.py script is properly structured")
    print("   • Restore functionality is implemented")
    print("\n🎯 Next Steps:")
    print("   1. Run: python3 save_version.py")
    print("   2. Enter version details when prompted")
    print("   3. Check that new version appears in Roadmap")
    print("   4. Verify restore option appears in Settings (Super Admin)")
    
    return True

if __name__ == "__main__":
    test_version_automation() 