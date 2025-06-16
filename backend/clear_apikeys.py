import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///zmarttrading.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class APIKey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(64), nullable=False)
    key_enc = db.Column(db.String(512), nullable=False)
    secret_enc = db.Column(db.String(512), nullable=True)
    passphrase_enc = db.Column(db.String(512), nullable=True)

with app.app_context():
    num_deleted = APIKey.query.delete()
    db.session.commit()
    print(f"Deleted {num_deleted} API keys from the database.") 