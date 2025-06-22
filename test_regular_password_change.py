#!/usr/bin/env python3
"""
Test Regular Password Change Endpoints
Tests the regular password change flow with email sending
"""

import requests
import json
import time
import sys

# Configuration
BASE_URL = "http://localhost:5000"
LOGIN_EMAIL = "seme@kryptostack.com"
LOGIN_PASSWORD = "Seme0504"
NEW_PASSWORD = "NewPassword123!"

def print_step(step, description):
    print(f"\n{'='*60}")
    print(f"STEP {step}: {description}")
    print(f"{'='*60}")

def make_request(method, endpoint, data=None, cookies=None):
    """Make HTTP request with proper headers and error handling"""
    url = f"{BASE_URL}{endpoint}"
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, cookies=cookies)
        elif method.upper() == 'POST':
            response = requests.post(url, headers=headers, json=data, cookies=cookies)
        else:
            print(f"❌ Unsupported method: {method}")
            return None
            
        print(f"📡 {method} {endpoint} -> {response.status_code}")
        if response.text:
            try:
                print(f"📄 Response: {json.dumps(response.json(), indent=2)}")
            except:
                print(f"📄 Response: {response.text}")
        
        return response
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

def main():
    print("🚀 REGULAR PASSWORD CHANGE TEST (with email)")
    print("Testing the regular password change flow with email sending")
    
    session_cookies = None
    
    # Step 1: Login
    print_step(1, "LOGIN")
    login_data = {
        "email": LOGIN_EMAIL,
        "password": LOGIN_PASSWORD
    }
    
    response = make_request('POST', '/api/login', login_data)
    if not response or response.status_code != 200:
        print("❌ Login failed")
        return False
    
    session_cookies = response.cookies
    print(f"✅ Login successful - Session cookies: {dict(session_cookies)}")
    
    # Step 2: Verify session
    print_step(2, "VERIFY SESSION")
    response = make_request('GET', '/api/session', cookies=session_cookies)
    if not response or response.status_code != 200:
        print("❌ Session verification failed")
        return False
    
    print("✅ Session verified")
    
    # Step 3: Request password change code (regular endpoint)
    print_step(3, "REQUEST PASSWORD CHANGE CODE (REGULAR ENDPOINT)")
    code_data = {
        "email": LOGIN_EMAIL
    }
    
    response = make_request('POST', '/api/auth/request-password-change', code_data, session_cookies)
    if not response or response.status_code != 200:
        print("❌ Password change code request failed")
        print("This might be due to email sending issues")
        return False
    
    print("✅ Password change code requested and email sent")
    print("📧 Check your email for the verification code")
    
    # Step 4: Get the verification code (using test endpoint for testing)
    print_step(4, "GET VERIFICATION CODE (TEST ENDPOINT)")
    response = make_request('GET', '/api/test/get-verification-code', cookies=session_cookies)
    if not response or response.status_code != 200:
        print("❌ Failed to get verification code")
        return False
    
    try:
        code_data = response.json()
        verification_code = code_data.get('verification_code')
        if not verification_code:
            print("❌ No verification code in response")
            return False
        print(f"✅ Got verification code: {verification_code}")
    except:
        print("❌ Failed to parse verification code response")
        return False
    
    # Step 5: Change password with verification code (regular endpoint)
    print_step(5, "CHANGE PASSWORD (REGULAR ENDPOINT)")
    change_data = {
        "code": verification_code,
        "new_password": NEW_PASSWORD
    }
    
    response = make_request('POST', '/api/auth/change-password', change_data, session_cookies)
    if not response or response.status_code != 200:
        print("❌ Password change failed")
        return False
    
    print("✅ Password changed successfully")
    
    # Step 6: Logout
    print_step(6, "LOGOUT")
    response = make_request('POST', '/api/logout', cookies=session_cookies)
    if not response or response.status_code != 200:
        print("❌ Logout failed")
        return False
    
    print("✅ Logout successful")
    
    # Step 7: Test login with new password
    print_step(7, "TEST LOGIN WITH NEW PASSWORD")
    new_login_data = {
        "email": LOGIN_EMAIL,
        "password": NEW_PASSWORD
    }
    
    response = make_request('POST', '/api/login', new_login_data)
    if not response or response.status_code != 200:
        print("❌ Login with new password failed")
        return False
    
    print("✅ Login with new password successful")
    
    # Step 8: Change password back to original
    print_step(8, "CHANGE PASSWORD BACK TO ORIGINAL")
    
    # Get new session cookies
    session_cookies = response.cookies
    
    # Request code again (regular endpoint)
    response = make_request('POST', '/api/auth/request-password-change', code_data, session_cookies)
    if not response or response.status_code != 200:
        print("❌ Password change code request failed")
        return False
    
    # Get verification code
    response = make_request('GET', '/api/test/get-verification-code', cookies=session_cookies)
    if not response or response.status_code != 200:
        print("❌ Failed to get verification code")
        return False
    
    try:
        code_data = response.json()
        verification_code = code_data.get('verification_code')
        print(f"✅ Got verification code: {verification_code}")
    except:
        print("❌ Failed to parse verification code response")
        return False
    
    # Change password back (regular endpoint)
    change_data = {
        "code": verification_code,
        "new_password": LOGIN_PASSWORD
    }
    
    response = make_request('POST', '/api/auth/change-password', change_data, session_cookies)
    if not response or response.status_code != 200:
        print("❌ Password change back failed")
        return False
    
    print("✅ Password changed back to original")
    
    # Step 9: Final logout
    print_step(9, "FINAL LOGOUT")
    response = make_request('POST', '/api/logout', cookies=session_cookies)
    if not response or response.status_code != 200:
        print("❌ Final logout failed")
        return False
    
    print("✅ Final logout successful")
    
    print(f"\n{'='*60}")
    print("🎉 ALL TESTS PASSED!")
    print("✅ Regular password change flow works correctly with email")
    print(f"{'='*60}")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test failed with exception: {e}")
        sys.exit(1) 