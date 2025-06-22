#!/usr/bin/env python3
"""
Test script for ZmartTrading SuperAdmin and Admin Auth System
"""

import requests
import json
import time

BASE_URL = 'http://localhost:5000/api'

def test_auth_system():
    """Test the complete auth system"""
    print("🧪 Testing ZmartTrading Auth System...")
    
    # Test 1: Login as SuperAdmin
    print("\n1️⃣ Testing SuperAdmin Login...")
    login_data = {
        'email': 'seme@kryptostack.com',
        'password': 'Seme0504'
    }
    
    response = requests.post(f'{BASE_URL}/login', json=login_data)
    if response.status_code == 200:
        print("✅ SuperAdmin login successful")
        cookies = response.cookies
    else:
        print(f"❌ SuperAdmin login failed: {response.text}")
        return False
    
    # Test 2: Check session
    print("\n2️⃣ Testing Session Check...")
    response = requests.get(f'{BASE_URL}/session', cookies=cookies)
    if response.status_code == 200:
        user_data = response.json()['user']
        print(f"✅ Session valid - User: {user_data['email']}, SuperAdmin: {user_data['is_superadmin']}")
    else:
        print(f"❌ Session check failed: {response.text}")
        return False
    
    # Test 3: Create Admin
    print("\n3️⃣ Testing Admin Creation...")
    admin_data = {
        'email': 'testadmin@example.com',
        'name': 'Test Admin',
        'temp_password': 'temp123'
    }
    
    response = requests.post(f'{BASE_URL}/auth/create-admin', json=admin_data, cookies=cookies)
    if response.status_code == 200:
        print("✅ Admin creation successful")
        print("📧 Check SuperAdmin email for confirmation code")
    else:
        print(f"❌ Admin creation failed: {response.text}")
        return False
    
    # Test 4: List Admins
    print("\n4️⃣ Testing Admin List...")
    response = requests.get(f'{BASE_URL}/auth/list-admins', cookies=cookies)
    if response.status_code == 200:
        admins = response.json()
        print(f"✅ Found {len(admins)} admin(s)")
        for admin in admins:
            status = "SuperAdmin" if admin['is_superadmin'] else ("Active" if admin['is_active'] else "Pending")
            print(f"   - {admin['email']} ({admin['name']}) - {status}")
    else:
        print(f"❌ Admin list failed: {response.text}")
        return False
    
    # Test 5: Request Password Change
    print("\n5️⃣ Testing Password Change Request...")
    response = requests.post(f'{BASE_URL}/auth/request-password-change', cookies=cookies)
    if response.status_code == 200:
        print("✅ Password change request successful")
        print("📧 Check SuperAdmin email for verification code")
    else:
        print(f"❌ Password change request failed: {response.text}")
        return False
    
    # Test 6: Logout
    print("\n6️⃣ Testing Logout...")
    response = requests.post(f'{BASE_URL}/logout', cookies=cookies)
    if response.status_code == 200:
        print("✅ Logout successful")
    else:
        print(f"❌ Logout failed: {response.text}")
        return False
    
    # Test 7: Test Admin Login (should fail - not confirmed)
    print("\n7️⃣ Testing Admin Login (should fail - not confirmed)...")
    admin_login_data = {
        'email': 'testadmin@example.com',
        'password': 'temp123'
    }
    
    response = requests.post(f'{BASE_URL}/login', json=admin_login_data)
    if response.status_code == 403:
        print("✅ Admin login correctly blocked (account not active)")
    else:
        print(f"❌ Admin login should have been blocked: {response.text}")
    
    # Test 8: Test Forgot Password
    print("\n8️⃣ Testing Forgot Password...")
    reset_data = {
        'email': 'testadmin@example.com'
    }
    
    response = requests.post(f'{BASE_URL}/auth/request-reset-code', json=reset_data)
    if response.status_code == 200:
        print("✅ Forgot password request successful")
        print("📧 Check admin email for reset code")
    else:
        print(f"❌ Forgot password request failed: {response.text}")
    
    print("\n🎉 All tests completed!")
    print("\n📋 Manual Steps Required:")
    print("1. Check SuperAdmin email for admin creation confirmation code")
    print("2. Check SuperAdmin email for password change verification code")
    print("3. Check admin email for password reset code")
    print("4. Use the codes in the Settings page to complete the flows")
    
    return True

if __name__ == "__main__":
    try:
        test_auth_system()
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}") 