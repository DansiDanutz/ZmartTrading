#!/usr/bin/env python3
"""
Simple password change test without email dependency
"""

import requests
import json

BASE_URL = 'http://localhost:5000/api'

def test_password_change_simple():
    print("=" * 60)
    print("🔐 SIMPLE PASSWORD CHANGE TEST")
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
    
    # Step 3: Request password change code
    print("\n3️⃣ Requesting password change verification code...")
    try:
        response = session.post(f"{BASE_URL}/auth/request-password-change")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Verification code request successful")
            print("📧 Check your email (seme@kryptostack.com) for the verification code")
        else:
            print("❌ Verification code request failed")
            return False
    except Exception as e:
        print(f"❌ Verification code request error: {e}")
        return False
    
    # Step 4: Wait for user to provide code
    print("\n4️⃣ Waiting for verification code...")
    print("Please check your email and enter the verification code:")
    code = input("Enter verification code: ").strip()
    
    if not code:
        print("❌ No code provided")
        return False
    
    # Step 5: Change password with verification code
    print("\n5️⃣ Changing password with verification code...")
    new_password = "NewSeme0504"  # New password for testing
    
    try:
        response = session.post(f"{BASE_URL}/auth/change-password", json={
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
    
    # Step 6: Test login with new password
    print("\n6️⃣ Testing login with new password...")
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
    
    print("\n" + "=" * 60)
    print("🎉 SIMPLE PASSWORD CHANGE TEST COMPLETED")
    print("=" * 60)
    
    return True

def test_password_reset_simple():
    print("\n" + "=" * 60)
    print("🔐 SIMPLE PASSWORD RESET TEST")
    print("=" * 60)
    
    # Step 1: Request reset code (no login required)
    print("\n1️⃣ Requesting password reset code...")
    try:
        response = requests.post(f"{BASE_URL}/auth/request-reset-code", json={
            "email": "seme@kryptostack.com"
        })
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Reset code request successful")
            print("📧 Check your email (seme@kryptostack.com) for the reset code")
        else:
            print("❌ Reset code request failed")
            return False
    except Exception as e:
        print(f"❌ Reset code request error: {e}")
        return False
    
    # Step 2: Wait for user to provide code
    print("\n2️⃣ Waiting for reset code...")
    print("Please check your email and enter the reset code:")
    code = input("Enter reset code: ").strip()
    
    if not code:
        print("❌ No code provided")
        return False
    
    # Step 3: Reset password with code
    print("\n3️⃣ Resetting password with code...")
    reset_password = "ResetSeme0504"  # Temporary password for testing
    
    try:
        response = requests.post(f"{BASE_URL}/auth/verify-reset-code", json={
            "email": "seme@kryptostack.com",
            "code": code,
            "new_password": reset_password
        })
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Password reset successful!")
            print(f"Reset password: {reset_password}")
        else:
            print("❌ Password reset failed")
            return False
    except Exception as e:
        print(f"❌ Password reset error: {e}")
        return False
    
    # Step 4: Test login with reset password
    print("\n4️⃣ Testing login with reset password...")
    try:
        response = requests.post(f"{BASE_URL}/login", json={
            "email": "seme@kryptostack.com",
            "password": reset_password
        })
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Login with reset password successful!")
        else:
            print("❌ Login with reset password failed")
            return False
    except Exception as e:
        print(f"❌ Login test error: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 SIMPLE PASSWORD RESET TEST COMPLETED")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    print("🔐 SIMPLE PASSWORD TESTING")
    print("=" * 60)
    
    # Test password change
    if test_password_change_simple():
        print("\n✅ Password change test PASSED")
    else:
        print("\n❌ Password change test FAILED")
    
    # Test password reset
    if test_password_reset_simple():
        print("\n✅ Password reset test PASSED")
    else:
        print("\n❌ Password reset test FAILED")
    
    print("\n" + "=" * 60)
    print("🎉 ALL SIMPLE PASSWORD TESTS COMPLETED")
    print("=" * 60) 