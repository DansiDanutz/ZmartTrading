#!/usr/bin/env python3
"""
Test script for password change functionality
Tests both SuperAdmin password change and Admin password reset
"""

import requests
import json
import time

BASE_URL = 'http://localhost:5000/api'

def test_superadmin_password_change():
    print("=" * 60)
    print("🔐 TESTING SUPERADMIN PASSWORD CHANGE")
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
        else:
            print(f"❌ Login failed: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Step 2: Request password change verification code
    print("\n2️⃣ Requesting password change verification code...")
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
    
    # Step 3: Wait for user to provide code
    print("\n3️⃣ Waiting for verification code...")
    print("Please check your email and enter the verification code:")
    code = input("Enter verification code: ").strip()
    
    if not code:
        print("❌ No code provided")
        return False
    
    # Step 4: Change password with verification code
    print("\n4️⃣ Changing password with verification code...")
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
    
    # Step 5: Test login with new password
    print("\n5️⃣ Testing login with new password...")
    try:
        response = session.post(f"{BASE_URL}/login", json={
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
    
    # Request new verification code
    try:
        response = session.post(f"{BASE_URL}/auth/request-password-change")
        if response.status_code == 200:
            print("✅ New verification code requested")
        else:
            print("❌ Failed to request new verification code")
            return False
    except Exception as e:
        print(f"❌ Verification code request error: {e}")
        return False
    
    # Wait for new code
    print("Please check your email again and enter the new verification code:")
    code = input("Enter new verification code: ").strip()
    
    if not code:
        print("❌ No code provided")
        return False
    
    # Change back to original password
    try:
        response = session.post(f"{BASE_URL}/auth/change-password", json={
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
    
    print("\n" + "=" * 60)
    print("🎉 SUPERADMIN PASSWORD CHANGE TEST COMPLETED")
    print("=" * 60)
    
    return True

def test_admin_password_reset():
    print("\n" + "=" * 60)
    print("🔐 TESTING ADMIN PASSWORD RESET (Forgotten Password)")
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
    
    # Step 5: Change password back to original using SuperAdmin method
    print("\n5️⃣ Changing password back to original...")
    original_password = "Seme0504"
    
    # Login first
    session = requests.Session()
    try:
        response = session.post(f"{BASE_URL}/login", json={
            "email": "seme@kryptostack.com",
            "password": reset_password
        })
        if response.status_code != 200:
            print("❌ Failed to login for password change back")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Request verification code
    try:
        response = session.post(f"{BASE_URL}/auth/request-password-change")
        if response.status_code == 200:
            print("✅ Verification code requested for password change back")
        else:
            print("❌ Failed to request verification code")
            return False
    except Exception as e:
        print(f"❌ Verification code request error: {e}")
        return False
    
    # Wait for new code
    print("Please check your email again and enter the verification code:")
    code = input("Enter verification code: ").strip()
    
    if not code:
        print("❌ No code provided")
        return False
    
    # Change back to original password
    try:
        response = session.post(f"{BASE_URL}/auth/change-password", json={
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
    
    print("\n" + "=" * 60)
    print("🎉 ADMIN PASSWORD RESET TEST COMPLETED")
    print("=" * 60)
    
    return True

def main():
    print("🔐 PASSWORD CHANGE TESTING SUITE")
    print("=" * 60)
    
    # Test SuperAdmin password change
    if test_superadmin_password_change():
        print("\n✅ SuperAdmin password change test PASSED")
    else:
        print("\n❌ SuperAdmin password change test FAILED")
    
    # Test Admin password reset
    if test_admin_password_reset():
        print("\n✅ Admin password reset test PASSED")
    else:
        print("\n❌ Admin password reset test FAILED")
    
    print("\n" + "=" * 60)
    print("🎉 ALL PASSWORD TESTS COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    main() 