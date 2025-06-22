#!/usr/bin/env python3
"""
Test script for API key functionality
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_api_key_endpoints():
    print("🔍 Testing API Key Functionality")
    print("=" * 50)
    
    # Test 1: Check if backend is responding
    try:
        response = requests.get(f"{BASE_URL}/api/session")
        print(f"✅ Backend is responding: {response.status_code}")
    except Exception as e:
        print(f"❌ Backend not responding: {e}")
        return
    
    # Test 2: Login as SuperAdmin
    login_data = {
        "email": "seme@kryptostack.com",
        "password": "Seme0504"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/login", json=login_data)
        if response.status_code == 200:
            print("✅ Login successful")
            cookies = response.cookies
        else:
            print(f"❌ Login failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Test 3: Check current API keys
    try:
        response = requests.get(f"{BASE_URL}/api/apikeys", cookies=cookies)
        print(f"✅ Get API keys: {response.status_code}")
        if response.status_code == 200:
            keys = response.json()
            print(f"   Current keys: {len(keys)}")
            for key in keys:
                print(f"   - {key.get('name', 'Unknown')}: {key.get('key', 'No key')[:10]}...")
    except Exception as e:
        print(f"❌ Get API keys error: {e}")
    
    # Test 4: Add a test API key
    test_key_data = {
        "name": "Test KuCoin API",
        "key": "test_api_key_123456789",
        "secret": "test_secret_abcdefghijk",
        "passphrase": "test_passphrase_123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/apikeys", json=test_key_data, cookies=cookies)
        print(f"✅ Add API key: {response.status_code}")
        if response.status_code == 201:
            print("   API key added successfully!")
        else:
            print(f"   Error response: {response.text}")
    except Exception as e:
        print(f"❌ Add API key error: {e}")
    
    # Test 5: Check API keys again
    try:
        response = requests.get(f"{BASE_URL}/api/apikeys", cookies=cookies)
        if response.status_code == 200:
            keys = response.json()
            print(f"✅ Updated keys count: {len(keys)}")
            for key in keys:
                print(f"   - {key.get('name', 'Unknown')}: {key.get('key', 'No key')[:10]}...")
    except Exception as e:
        print(f"❌ Get updated keys error: {e}")

if __name__ == "__main__":
    test_api_key_endpoints() 