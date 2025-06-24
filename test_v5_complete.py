#!/usr/bin/env python3
"""
Comprehensive V5 Testing Script
Tests all V5 functionality:
1. Automation system
2. Roadmap visual effects
3. Settings restore functionality
4. Backend API endpoints
"""

import subprocess
import requests
import time
import sys
import os
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=cwd)
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        return False, "", str(e)

def test_automation_system():
    """Test the automation system"""
    print("🧪 Testing Automation System...")
    
    # Test automation script exists
    if not os.path.exists("save_version_automation.py"):
        print("❌ save_version_automation.py not found")
        return False
    
    # Test simulation
    success, output, error = run_command("python3 save_version_automation.py --simulate")
    if success:
        print("✅ Automation simulation works")
        return True
    else:
        print(f"❌ Automation simulation failed: {error}")
        return False

def test_backend_api():
    """Test backend API endpoints"""
    print("🔧 Testing Backend API...")
    
    try:
        # Test roadmap versions endpoint
        response = requests.get("http://localhost:5001/api/roadmap-versions", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('versions'):
                versions = data['versions']
                print(f"✅ Roadmap API works - {len(versions)} versions found")
                
                # Check if V5 is included
                v5_found = any(v['version'] == 'V5' for v in versions)
                if v5_found:
                    print("✅ V5 version found in API response")
                    return True
                else:
                    print("❌ V5 version not found in API response")
                    return False
            else:
                print("❌ Roadmap API returned invalid data")
                return False
        else:
            print(f"❌ Roadmap API failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend API test failed: {e}")
        return False

def test_git_hook():
    """Test Git hook functionality"""
    print("🎣 Testing Git Hook...")
    
    hook_path = Path(".git/hooks/post-commit")
    if hook_path.exists():
        print("✅ Git post-commit hook exists")
        
        # Check if it's executable
        if os.access(hook_path, os.X_OK):
            print("✅ Git hook is executable")
            return True
        else:
            print("❌ Git hook is not executable")
            return False
    else:
        print("❌ Git post-commit hook not found")
        return False

def test_frontend_components():
    """Test frontend components exist"""
    print("🎨 Testing Frontend Components...")
    
    required_files = [
        "src/components/Roadmap.jsx",
        "src/components/Settings.jsx",
        "src/App.jsx"
    ]
    
    all_exist = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path} exists")
        else:
            print(f"❌ {file_path} not found")
            all_exist = False
    
    return all_exist

def test_restore_functionality():
    """Test restore functionality in backend"""
    print("⚙️ Testing Restore Functionality...")
    
    # Check if restore endpoint exists in backend
    backend_file = Path("backend/app.py")
    if backend_file.exists():
        with open(backend_file, 'r') as f:
            content = f.read()
            if '/api/restore-version' in content:
                print("✅ Restore endpoint found in backend")
                return True
            else:
                print("❌ Restore endpoint not found in backend")
                return False
    else:
        print("❌ Backend file not found")
        return False

def test_visual_effects():
    """Test visual effects in Roadmap component"""
    print("✨ Testing Visual Effects...")
    
    roadmap_file = Path("src/components/Roadmap.jsx")
    if roadmap_file.exists():
        with open(roadmap_file, 'r') as f:
            content = f.read()
            
            # Check for visual effects
            effects_found = []
            if 'hover:scale-110' in content:
                effects_found.append("hover scale")
            if 'transition-all duration-300' in content:
                effects_found.append("smooth transitions")
            if 'shadow-2xl' in content:
                effects_found.append("enhanced shadows")
            if 'gradient-to-r' in content:
                effects_found.append("gradients")
            if 'animate-fadeIn' in content:
                effects_found.append("fade animations")
            
            if len(effects_found) >= 3:
                print(f"✅ Visual effects found: {', '.join(effects_found)}")
                return True
            else:
                print(f"❌ Insufficient visual effects found: {effects_found}")
                return False
    else:
        print("❌ Roadmap component not found")
        return False

def main():
    """Run all tests"""
    print("🚀 V5 Complete System Test")
    print("=" * 50)
    
    tests = [
        ("Automation System", test_automation_system),
        ("Backend API", test_backend_api),
        ("Git Hook", test_git_hook),
        ("Frontend Components", test_frontend_components),
        ("Restore Functionality", test_restore_functionality),
        ("Visual Effects", test_visual_effects),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}:")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test failed with exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! V5 is ready for deployment.")
        return True
    else:
        print("⚠️ Some tests failed. Please fix issues before V5 deployment.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 