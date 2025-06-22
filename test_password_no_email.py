#!/usr/bin/env python3
"""
Password change test using test endpoints (no email required)
"""

import requests
import json

BASE_URL = 'http://localhost:5000/api'

def test_password_change_no_email():
    print("=" * 60)
    print("🔐 PASSWORD CHANGE TEST (NO EMAIL)")
    print("=" * 60)
    
    # Create a session to maintain cookies
    session = requests.Session()
    
    # Step 1: Login as SuperAdmin
    print("\n1️⃣ Logging in as SuperAdmin...")
    login_data = {
        "email": "seme@kryptostack.com",
        "password": "Seme0504"
    }
    
    try:
        response = session.post(f"{BASE_URL}/login", json=login_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Login successful")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Login failed: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Step 2: Check session
    print("\n2️⃣ Checking session...")
    try:
        response = session.get(f"{BASE_URL}/session")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Session valid")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Session invalid: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Session check error: {e}")
        return False
    
    # Step 3: Request password change code (test endpoint)
    print("\n3️⃣ Requesting password change verification code (test endpoint)...")
    try:
        response = session.post(f"{BASE_URL}/test/request-password-change")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            code = data.get('code')
            email = data.get('email')
            print(f"✅ Verification code created!")
            print(f"📧 Email: {email}")
            print(f"🔑 Code: {code}")
        else:
            print("❌ Verification code request failed")
            return False
    except Exception as e:
        print(f"❌ Verification code request error: {e}")
        return False
    
    # Step 4: Change password with verification code
    print("\n4️⃣ Changing password with verification code...")
    new_password = "NewSeme0504"  # New password for testing
    
    try:
        response = session.post(f"{BASE_URL}/test/change-password", json={
            "code": code,
            "new_password": new_password
        })
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Password changed successfully!")
            print(f"New password: {new_password}")
        else:
            print("❌ Password change failed")
            return False
    except Exception as e:
        print(f"❌ Password change error: {e}")
        return False
    
    # Step 5: Test login with new password
    print("\n5️⃣ Testing login with new password...")
    try:
        response = requests.post(f"{BASE_URL}/login", json={
            "email": "seme@kryptostack.com",
            "password": new_password
        })
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Login with new password successful!")
        else:
            print("❌ Login with new password failed")
            return False
    except Exception as e:
        print(f"❌ Login test error: {e}")
        return False
    
    # Step 6: Change password back to original
    print("\n6️⃣ Changing password back to original...")
    original_password = "Seme0504"
    
    # Login with new password first
    session2 = requests.Session()
    try:
        response = session2.post(f"{BASE_URL}/login", json={
            "email": "seme@kryptostack.com",
            "password": new_password
        })
        if response.status_code != 200:
            print("❌ Failed to login with new password")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Request new verification code
    try:
        response = session2.post(f"{BASE_URL}/test/request-password-change")
        if response.status_code == 200:
            data = response.json()
            code = data.get('code')
            print(f"✅ New verification code created: {code}")
        else:
            print("❌ Failed to request new verification code")
            return False
    except Exception as e:
        print(f"❌ Verification code request error: {e}")
        return False
    
    # Change back to original password
    try:
        response = session2.post(f"{BASE_URL}/test/change-password", json={
            "code": code,
            "new_password": original_password
        })
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Password changed back to original successfully!")
        else:
            print("❌ Failed to change password back")
            return False
    except Exception as e:
        print(f"❌ Password change back error: {e}")
        return False
    
    # Step 7: Test login with original password
    print("\n7️⃣ Testing login with original password...")
    try:
        response = requests.post(f"{BASE_URL}/login", json={
            "email": "seme@kryptostack.com",
            "password": original_password
        })
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Login with original password successful!")
        else:
            print("❌ Login with original password failed")
            return False
    except Exception as e:
        print(f"❌ Login test error: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 PASSWORD CHANGE TEST COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    print("🔐 PASSWORD CHANGE TEST (NO EMAIL)")
    print("=" * 60)
    
    if test_password_change_no_email():
        print("\n✅ Password change test PASSED")
    else:
        print("\n❌ Password change test FAILED")
    
    print("\n" + "=" * 60)
    print("🎉 TEST COMPLETED")
    print("=" * 60) 