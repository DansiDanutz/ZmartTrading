#!/usr/bin/env python3
"""
Simple login test script
"""

import requests
import json

def test_login():
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Login System")
    print("=" * 40)
    
    # Test 1: Login with SuperAdmin
    print("\n1️⃣ Testing SuperAdmin login...")
    login_data = {
        "email": "seme@kryptostack.com",
        "password": "Seme0504"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/login",
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            
            # Get cookies from response
            cookies = response.cookies
            print(f"Cookies received: {dict(cookies)}")
            
            # Test 2: Check session
            print("\n2️⃣ Testing session check...")
            session_response = requests.get(
                f"{base_url}/api/session",
                cookies=cookies,
                timeout=10
            )
            
            print(f"Session Status Code: {session_response.status_code}")
            print(f"Session Response: {session_response.text}")
            
            if session_response.status_code == 200:
                print("✅ Session check successful!")
                return True
            else:
                print("❌ Session check failed!")
                return False
        else:
            print("❌ Login failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_login()
    if success:
        print("\n🎉 All tests passed! Login system is working.")
    else:
        print("\n💥 Tests failed! Login system has issues.") 