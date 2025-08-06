from flask import Flask, request, jsonify, send_from_directory, redirect, session
from pymongo import MongoClient
from bcrypt import hashpw, gensalt, checkpw
import os
from dotenv import load_dotenv
from bson import ObjectId
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__,
           template_folder='.',
           static_folder='.',
           static_url_path='')

# Set secret key for session management
app.secret_key = os.getenv("SECRET_KEY", "super-secret-key-123")

# Session configuration
app.config.update(
    SESSION_COOKIE_SECURE=False,  # Set to False for development, True for production (HTTPS)
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=86400,  # 24 hours
    SESSION_COOKIE_NAME='pawpal_session'  # Explicitly name the session cookie
)

# CORS configuration
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})

# MongoDB configuration
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client[os.getenv("DB_NAME", "pawpal_db")]
users_collection = db['users']

# Routes
@app.route('/')
def home():
    return redirect('/login.html')

@app.route('/<path:filename>')
def serve_file(filename):
    if filename.endswith('.html'):
        return send_from_directory('.', filename)
    return send_from_directory('.', filename)

# API Endpoints
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = users_collection.find_one({'username': data['username']})

        if not user:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

        # Convert stored string to bytes
        stored_hash = user['password'].encode('utf-8')  # 👈 Encode to bytes
        input_password = data['password'].encode('utf-8')

        if not checkpw(input_password, stored_hash):
            return jsonify({"success": False, "message": "Invalid credentials"}), 401

        session.permanent = True  # 👈 Make session persistent
        session['user_id'] = str(user['_id'])
        return jsonify({
            "success": True,
            "redirect": "/pet.html",
            "user": {
                "first_name": user['first_name'],
                "second_name": user['second_name'],
                "username": user['username']
            }
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        required_fields = ['firstName', 'secondName', 'username', 'password']
        
        # Check if all required fields are present
        if not all(key in data for key in required_fields):
            return jsonify({"success": False, "message": "Missing fields"}), 400

        # Check if username already exists
        if users_collection.find_one({'username': data['username']}):
            return jsonify({"success": False, "message": "Username already exists"}), 409

        # Hash the password and store it as a string
        hashed_pw = hashpw(data['password'].encode('utf-8'), gensalt()).decode('utf-8')

        # Insert the new user into MongoDB
        users_collection.insert_one({
            'first_name': data['firstName'],
            'second_name': data['secondName'],
            'username': data['username'],
            'password': hashed_pw
        })

        return jsonify({"success": True, "redirect": "/login1.html"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/user')
def get_user():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        user = users_collection.find_one({'_id': ObjectId(session['user_id'])})
    except Exception as e:
        return jsonify({"error": "Invalid session", "details": str(e)}), 400
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "first_name": user['first_name'],
        "second_name": user['second_name'],
        "username": user['username']
    })

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True, "redirect": "/login.html"})

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)