#!/usr/bin/env python3
"""
Test script to verify login/logout cycle
"""

import requests
import json
import time

BASE_URL = 'http://localhost:5000/api'

def test_login_logout_cycle():
    print("=" * 60)
    print("🧪 TESTING LOGIN/LOGOUT CYCLE")
    print("=" * 60)
    
    # Create a session to maintain cookies
    session = requests.Session()
    
    # Test 1: Initial session check (should fail)
    print("\n1️⃣ Testing initial session...")
    try:
        response = session.get(f"{BASE_URL}/session")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Login
    print("\n2️⃣ Testing login...")
    login_data = {
        "email": "seme@kryptostack.com",
        "password": "Seme0504"
    }
    
    try:
        response = session.post(f"{BASE_URL}/login", json=login_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Login successful")
        else:
            print("❌ Login failed")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Test 3: Session check after login
    print("\n3️⃣ Testing session after login...")
    try:
        response = session.get(f"{BASE_URL}/session")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Session valid after login")
        else:
            print("❌ Session invalid after login")
    except Exception as e:
        print(f"❌ Session check error: {e}")
    
    # Test 4: Logout
    print("\n4️⃣ Testing logout...")
    try:
        response = session.post(f"{BASE_URL}/logout")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Logout successful")
        else:
            print("❌ Logout failed")
    except Exception as e:
        print(f"❌ Logout error: {e}")
    
    # Test 5: Session check after logout
    print("\n5️⃣ Testing session after logout...")
    try:
        response = session.get(f"{BASE_URL}/session")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 401:
            print("✅ Session properly cleared after logout")
        else:
            print("❌ Session not cleared after logout")
    except Exception as e:
        print(f"❌ Session check error: {e}")
    
    # Test 6: Login again
    print("\n6️⃣ Testing login again...")
    try:
        response = session.post(f"{BASE_URL}/login", json=login_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Second login successful")
        else:
            print("❌ Second login failed")
            return False
    except Exception as e:
        print(f"❌ Second login error: {e}")
        return False
    
    # Test 7: Session check after second login
    print("\n7️⃣ Testing session after second login...")
    try:
        response = session.get(f"{BASE_URL}/session")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Session valid after second login")
        else:
            print("❌ Session invalid after second login")
    except Exception as e:
        print(f"❌ Session check error: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 LOGIN/LOGOUT CYCLE TEST COMPLETED")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    test_login_logout_cycle() 