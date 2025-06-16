import requests
import json

def create_user():
    url = "http://localhost:5000/api/register"
    data = {
        "email": "seme@kryptostack.com",
        "password": "ZmartTrading2024"  # Using a secure password
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Register Status: {response.status_code}")
        print(f"Register Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Register Error: {str(e)}")
        return False

def add_kucoin_key(session):
    url = "http://localhost:5000/api/apikeys"
    data = {
        "name": "KuCoin",
        "key": "k77U187e08zGf4I3SLz3sYzTEyM2KNoJ9i1N4xg2",  # From project context
        "secret": "your_kucoin_secret",  # You need to provide this
        "passphrase": "your_kucoin_passphrase"  # You need to provide this
    }
    
    try:
        response = session.post(url, json=data)
        print(f"Add API Key Status: {response.status_code}")
        print(f"Add API Key Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Add API Key Error: {str(e)}")
        return False

def test_price_endpoint():
    # First, login to get session cookie
    login_url = "http://localhost:5000/api/login"
    login_data = {
        "email": "seme@kryptostack.com",
        "password": "ZmartTrading2024"  # Same password as used in create_user
    }
    
    session = requests.Session()
    
    try:
        # Try to login first
        login_response = session.post(login_url, json=login_data)
        if login_response.status_code != 200:
            print("Login failed, trying to create user...")
            if create_user():
                # Try login again after creating user
                login_response = session.post(login_url, json=login_data)
                if login_response.status_code != 200:
                    print(f"Login failed after user creation: {login_response.json()}")
                    return
            else:
                print("Failed to create user")
                return
        
        # Add KuCoin API key if not already added
        add_kucoin_key(session)
            
        # Now test the price endpoint with the session
        price_url = "http://localhost:5000/api/kucoin/price/XBTUSDTM"
        response = session.get(price_url)
        print(f"Price Status Code: {response.status_code}")
        print(f"Price Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_price_endpoint() 