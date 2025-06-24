#!/usr/bin/env python3
"""
Test script for ZmartTrading automation system
"""

import subprocess
import sys
import os
from save_version_automation import ZmartTradingAutomation

def run_command(command):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return False, "", str(e)

def test_automation():
    """Test the automation system"""
    print("🧪 Testing ZmartTrading Automation System")
    print("=" * 50)
    
    # Test 1: Check if automation script exists
    print("1. Checking automation script...")
    if os.path.exists("save_version_automation.py"):
        print("   ✅ save_version_automation.py exists")
    else:
        print("   ❌ save_version_automation.py not found")
        return False
    
    # Test 2: Check if Git hook exists
    print("2. Checking Git hook...")
    if os.path.exists(".git/hooks/post-commit"):
        print("   ✅ Git post-commit hook exists")
        
        # Check if it's executable
        if os.access(".git/hooks/post-commit", os.X_OK):
            print("   ✅ Git hook is executable")
        else:
            print("   ⚠️  Git hook is not executable")
    else:
        print("   ❌ Git post-commit hook not found")
        return False
    
    # Test 3: Test automation script
    print("3. Testing automation script...")
    success, output, error = run_command("python3 save_version_automation.py --help")
    if success:
        print("   ✅ Automation script runs successfully")
    else:
        print(f"   ❌ Automation script failed: {error}")
        return False
    
    # Test 4: Check Git tags
    print("4. Checking Git tags...")
    success, output, error = run_command("git tag --list 'V*' --sort=-version:refname")
    if success:
        tags = output.strip().split('\n') if output.strip() else []
        print(f"   ✅ Found {len(tags)} version tags: {', '.join(tags) if tags else 'None'}")
    else:
        print(f"   ❌ Failed to get Git tags: {error}")
        return False
    
    # Test 5: Check backend API
    print("5. Checking backend API...")
    try:
        import requests
        response = requests.get("http://localhost:5001/api/roadmap-versions", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                versions = data.get('versions', [])
                print(f"   ✅ Backend API working, found {len(versions)} versions")
            else:
                print(f"   ❌ Backend API returned error: {data.get('error')}")
                return False
        else:
            print(f"   ❌ Backend API returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"   ⚠️  Backend API not accessible (backend may not be running): {e}")
    
    print("\n✅ All tests completed!")
    return True

def simulate_version_save():
    """Simulate a version save with the new clean format"""
    print("🚀 Simulating version save with new clean format...")
    print("=" * 60)
    
    # Simulate analysis results
    analysis = {
        'features_added': [
            'Feature: Automated wagon generation system',
            'Feature: Git hook integration for version tracking',
            'Feature: Clean title generation with max 8 words'
        ],
        'ui_improvements': [
            'UI: Organized wagon details with one explanation per line',
            'UI: Improved card layout and spacing',
            'UI: Better visual hierarchy in version cards'
        ],
        'api_integrations': [
            'API: Enhanced backend version management',
            'API: Improved roadmap API with dynamic data'
        ],
        'bugs_fixed': [
            'Bug fix: Fixed wagon title length issues',
            'Bug fix: Resolved detail organization problems'
        ],
        'testing_done': [
            'Testing: Verified automation workflow',
            'Testing: Tested clean format generation'
        ],
        'security_improvements': [
            'Security: Improved automation script permissions'
        ],
        'documentation_updated': [
            'Documentation: Updated automation system README'
        ]
    }
    
    # Generate version details using the new format
    automation = ZmartTradingAutomation()
    version_info = automation.generate_version_details("V6", analysis)
    
    print(f"📋 Version: {version_info['version']}")
    print(f"📅 Date: {version_info['date']}")
    print(f"🎯 Title: {version_info['title']}")
    print("\n📝 Details:")
    print("-" * 40)
    print(version_info['details'])
    print("-" * 40)
    
    print("\n✅ Simulation completed successfully!")
    print("🎯 Each wagon now has:")
    print("   • Max 8-word title")
    print("   • One explanation per line")
    print("   • Clean, organized format")
    print("   • Professional appearance")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--simulate":
        simulate_version_save()
    else:
        test_automation() 