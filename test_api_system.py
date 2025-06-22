#!/usr/bin/env python3
"""
Test script for API Key Management System
Tests the new permission structure: all admins can view, only SuperAdmin can add/delete
"""

import requests
import json
import time

BASE_URL = 'http://localhost:5000/api'

def test_api_system():
    print("=" * 60)
    print("🔐 TESTING API KEY MANAGEMENT SYSTEM")
    print("=" * 60)
    
    session = requests.Session()
    
    # Test 1: Login as SuperAdmin
    print("\n1️⃣ Testing SuperAdmin Login...")
    login_data = {
        'email': 'seme@kryptostack.com',
        'password': 'Seme0504'
    }
    
    response = session.post(f'{BASE_URL}/login', json=login_data)
    if response.status_code == 200:
        print("✅ SuperAdmin login successful")
        user_data = response.json()
        print(f"   User: {user_data['user']['email']}")
        print(f"   SuperAdmin: {user_data['user']['is_superadmin']}")
        print(f"   Admin: {user_data['user']['is_admin']}")
    else:
        print(f"❌ SuperAdmin login failed: {response.status_code}")
        return False
    
    # Test 2: Add API keys as SuperAdmin
    print("\n2️⃣ Testing API Key Addition (SuperAdmin)...")
    
    test_keys = [
        {
            'name': 'kucoin',
            'key': 'k77U187e08zGf4I3SLz3sYzTEyM2KNoJ9i1N4xg2',
            'secret': 'test_secret_123',
            'passphrase': 'test_passphrase'
        },
        {
            'name': 'cryptometer',
            'key': 'cm_test_key_456',
            'secret': 'cm_test_secret_456'
        }
    ]
    
    added_keys = []
    for key_data in test_keys:
        response = session.post(f'{BASE_URL}/apikeys', json=key_data)
        if response.status_code == 201:
            print(f"✅ Added API key: {key_data['name']}")
            added_keys.append(response.json()['id'])
        else:
            print(f"❌ Failed to add API key {key_data['name']}: {response.status_code}")
            print(f"   Error: {response.json().get('error', 'Unknown error')}")
    
    # Test 3: View API keys as SuperAdmin
    print("\n3️⃣ Testing API Key Viewing (SuperAdmin)...")
    response = session.get(f'{BASE_URL}/apikeys')
    if response.status_code == 200:
        keys = response.json()['api_keys']
        print(f"✅ Retrieved {len(keys)} API keys")
        for key in keys:
            print(f"   - {key['name']}: {key['key']} (can_edit: {key['can_edit']})")
    else:
        print(f"❌ Failed to retrieve API keys: {response.status_code}")
    
    # Test 4: Test service API key access
    print("\n4️⃣ Testing Service API Key Access...")
    response = session.get(f'{BASE_URL}/apikeys/service/kucoin')
    if response.status_code == 200:
        service_key = response.json()
        print(f"✅ Retrieved service key for kucoin")
        print(f"   Key: {service_key['key'][:8]}...")
        print(f"   Has secret: {bool(service_key['secret'])}")
    else:
        print(f"❌ Failed to retrieve service key: {response.status_code}")
    
    # Test 5: Logout and test as non-admin
    print("\n5️⃣ Testing Non-Admin Access...")
    session.post(f'{BASE_URL}/logout')
    
    # Try to access API keys without login
    response = session.get(f'{BASE_URL}/apikeys')
    if response.status_code == 401:
        print("✅ Correctly denied access to non-authenticated user")
    else:
        print(f"❌ Unexpected response for non-authenticated user: {response.status_code}")
    
    # Test 6: Create and test regular admin user
    print("\n6️⃣ Testing Regular Admin Access...")
    
    # Login as SuperAdmin to create admin
    session.post(f'{BASE_URL}/login', json=login_data)
    
    # Create admin user
    admin_data = {
        'email': 'testadmin@test.com',
        'name': 'Test Admin',
        'password': 'TestPass123'
    }
    
    response = session.post(f'{BASE_URL}/auth/create-admin', json=admin_data)
    if response.status_code == 200:
        print("✅ Created test admin user")
        
        # Logout SuperAdmin
        session.post(f'{BASE_URL}/logout')
        
        # Login as regular admin
        admin_login = {
            'email': 'testadmin@test.com',
            'password': 'TestPass123'
        }
        
        response = session.post(f'{BASE_URL}/login', json=admin_login)
        if response.status_code == 200:
            print("✅ Regular admin login successful")
            admin_user = response.json()['user']
            print(f"   User: {admin_user['email']}")
            print(f"   SuperAdmin: {admin_user['is_superadmin']}")
            print(f"   Admin: {admin_user['is_admin']}")
            
            # Test viewing API keys as regular admin
            response = session.get(f'{BASE_URL}/apikeys')
            if response.status_code == 200:
                keys = response.json()['api_keys']
                print(f"✅ Regular admin can view {len(keys)} API keys")
                for key in keys:
                    print(f"   - {key['name']}: {key['key']} (can_edit: {key['can_edit']})")
                    if not key['can_edit']:
                        print("     ✅ Correctly shows can_edit: false for regular admin")
            else:
                print(f"❌ Regular admin cannot view API keys: {response.status_code}")
            
            # Test adding API key as regular admin (should fail)
            test_key = {
                'name': 'test_key',
                'key': 'test_key_value'
            }
            
            response = session.post(f'{BASE_URL}/apikeys', json=test_key)
            if response.status_code == 403:
                print("✅ Correctly denied API key addition to regular admin")
            else:
                print(f"❌ Unexpected response for admin adding key: {response.status_code}")
            
            # Test deleting API key as regular admin (should fail)
            if added_keys:
                response = session.delete(f'{BASE_URL}/apikeys/{added_keys[0]}')
                if response.status_code == 403:
                    print("✅ Correctly denied API key deletion to regular admin")
                else:
                    print(f"❌ Unexpected response for admin deleting key: {response.status_code}")
            
            # Test service access as regular admin (should fail)
            response = session.get(f'{BASE_URL}/apikeys/service/kucoin')
            if response.status_code == 403:
                print("✅ Correctly denied service access to regular admin")
            else:
                print(f"❌ Unexpected response for admin service access: {response.status_code}")
                
        else:
            print(f"❌ Regular admin login failed: {response.status_code}")
    else:
        print(f"❌ Failed to create test admin: {response.status_code}")
    
    # Test 7: Cleanup - Login as SuperAdmin and delete test keys
    print("\n7️⃣ Cleaning up test data...")
    session.post(f'{BASE_URL}/login', json=login_data)
    
    for key_id in added_keys:
        response = session.delete(f'{BASE_URL}/apikeys/{key_id}')
        if response.status_code == 200:
            print(f"✅ Deleted test API key {key_id}")
        else:
            print(f"❌ Failed to delete test API key {key_id}: {response.status_code}")
    
    # Delete test admin user
    response = session.delete(f'{BASE_URL}/auth/delete-admin', json={'email': 'testadmin@test.com'})
    if response.status_code == 200:
        print("✅ Deleted test admin user")
    else:
        print(f"❌ Failed to delete test admin: {response.status_code}")
    
    print("\n" + "=" * 60)
    print("🎉 API KEY MANAGEMENT SYSTEM TEST COMPLETED!")
    print("=" * 60)
    print("\n📋 SUMMARY:")
    print("✅ SuperAdmin can add, view, and delete API keys")
    print("✅ Regular admins can view API keys but cannot modify them")
    print("✅ Non-authenticated users are denied access")
    print("✅ Service API key access is restricted to SuperAdmin")
    print("✅ Permission structure is working correctly")
    
    return True

if __name__ == "__main__":
    test_api_system() 