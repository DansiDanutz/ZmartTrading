import os
import subprocess
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv('ZBot.env')

# Set environment variables
os.environ['FERNET_KEY'] = 'explXneJoPm4Yb4HaIxMAfMHc7cPfw4Y3WLpTQIe3eY='
os.environ['SECRET_KEY'] = 'e3ebb9deae77b1976180e0fdadfa3c6041430cab7641d04071fdd9c75a2be4ca'

# Start Flask app
subprocess.run(['python', 'app.py']) 