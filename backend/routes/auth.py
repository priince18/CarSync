# auth.py
import os
import re
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from db import users_collection
from bson.objectid import ObjectId
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token
import jwt

auth_bp = Blueprint('auth', __name__)

# Configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif','JPG'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    return True, "Password is valid"

def validate_phone(phone):
    """Validate phone number format"""
    # Remove all non-digits
    digits_only = re.sub(r'\D', '', phone)
    return len(digits_only) == 10

def serialize_user(user):
    """Serialize user object for JSON response"""
    return {
        'userId': str(user['_id']),
        'username': user.get('name', ''),
        'email': user.get('email', ''),
        'phone': user.get('phone', ''),
        'address': user.get('address', {}),
        'userProfilePic': user.get('userProfilePic', 'https://placehold.co/24x24/CCCCCC/000000?text=User'),
        'created_at': user.get('created_at', '').isoformat() if user.get('created_at') else None
    }

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        print(" Signup request received")
        data = request.get_json()
        print(f"📝 Request data: {data}")
        
        if not data:
            print("❌ No data provided in request")
            return jsonify({"message": "No data provided"}), 400

        # Extract and validate required fields
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        phone = data.get('phone', '').strip()
        
        # Address fields
        address = {
            'street': data.get('street', '').strip(),
            'city': data.get('city', '').strip(),
            'state': data.get('state', '').strip(),
            'zip_code': data.get('zip_code', '').strip()
        }

        print(f"📋 Extracted data:")
        print(f"   Name: {name}")
        print(f"   Email: {email}")
        print(f"   Phone: {phone}")
        print(f"   Address: {address}")

        # Validation
        if not name or len(name) < 2:
            print("❌ Name validation failed")
            return jsonify({"message": "Name must be at least 2 characters long"}), 400
        
        if not email or not validate_email(email):
            print("❌ Email validation failed")
            return jsonify({"message": "Please provide a valid email address"}), 400
        
        if not password:
            print("❌ Password validation failed - no password provided")
            return jsonify({"message": "Password is required"}), 400
        
        is_valid_password, password_message = validate_password(password)
        if not is_valid_password:
            print(f"❌ Password validation failed: {password_message}")
            return jsonify({"message": password_message}), 400
        
        if not phone or not validate_phone(phone):
            print("❌ Phone validation failed")
            return jsonify({"message": "Please provide a valid 10-digit phone number"}), 400
        
        # Address validation
        if any(address.values()) and not all(address.values()):
            return jsonify({"message": "If providing an address, all fields are required"}), 400
        
        if address['zip_code'] and not re.match(r'^\d{6}$', address['zip_code']):
            print("❌ ZIP code validation failed")
            return jsonify({"message": "Please provide a valid 6-digit ZIP code"}), 400

        print("✅ All validations passed")

        # Check if user already exists
        print(f"🔍 Checking if user with email {email} already exists")
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            print("❌ User already exists")
            return jsonify({"message": "Email already registered"}), 409

        existing_user_phone = users_collection.find_one({'phone': re.sub(r'\D', '', phone)})
        if existing_user_phone:
            print("❌ Phone number already exists")
            return jsonify({"message": "An account with this phone number already exists"}), 409

        print("✅ User doesn't exist, creating new user")

        # Create user
        hashed_password = generate_password_hash(password)
        user_data = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "phone": re.sub(r'\D', '', phone),  # Store only digits
            "address": address,
            "created_at": datetime.utcnow(),
            "userProfilePic": "https://placehold.co/24x24/CCCCCC/000000?text=User",
            "is_active": True,
            "last_login": None
        }

        print(f"💾 Inserting user data into database")
        result = users_collection.insert_one(user_data)
        
        if result.inserted_id:
            print(f"✅ User created successfully with ID: {result.inserted_id}")
            return jsonify({
                "message": "User registered successfully!",
                "userId": str(result.inserted_id)
            }), 201
        else:
            print("❌ Failed to create user - no inserted ID")
            return jsonify({"message": "Failed to create user"}), 500

    except Exception as e:
        print(f"❌ Signup error: {str(e)}")
        current_app.logger.error(f"Signup error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "No data provided"}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not validate_email(email):
            return jsonify({"message": "Please provide a valid email address"}), 400
        
        if not password:
            return jsonify({"message": "Password is required"}), 400

        # Find user
        user = users_collection.find_one({"email": email})
        if not user:
            return jsonify({"message": "Invalid email or password"}), 401

        # Check if user is active
        if not user.get('is_active', True):
            return jsonify({"message": "Account is deactivated"}), 401

        # Verify password
        if not (check_password_hash(user['password'], password)) or not(user['password'] != password):
            return jsonify({"message": "Invalid email or password"}), 401

        # Update last login
        users_collection.update_one(
            {"_id": user['_id']},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        # Create tokens
        access_token = create_access_token(
            identity=str(user['_id']), 
            expires_delta=timedelta(hours=24)
        )
        refresh_token = create_refresh_token(
            identity=str(user['_id']), 
            expires_delta=timedelta(days=30)
        )

        # Return user data and tokens
        user_data = serialize_user(user)
        return jsonify({
            "message": "Login successful!",
            "access_token": access_token,
            "refresh_token": refresh_token,
            **user_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """Refresh access token using refresh token"""
    try:
        from flask_jwt_extended import jwt_required, get_jwt_identity
        current_user_id = get_jwt_identity()
        
        # Create new access token
        new_access_token = create_access_token(
            identity=current_user_id,
            expires_delta=timedelta(hours=24)
        )
        
        return jsonify({
            "access_token": new_access_token
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Token refresh error: {str(e)}")
        return jsonify({"message": "Failed to refresh token"}), 500

@auth_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_details():
    """Get current user details"""
    try:
        current_user_id = get_jwt_identity()
        user = users_collection.find_one({"_id": ObjectId(current_user_id)})

        if not user:
            return jsonify({"message": "User not found"}), 404

        if not user.get('is_active', True):
            return jsonify({"message": "Account is deactivated"}), 401

        user_data = serialize_user(user)
        return jsonify({"user": user_data}), 200

    except Exception as e:
        current_app.logger.error(f"Get user details error: {str(e)}")
        return jsonify({"message": "Error fetching user details"}), 500

@auth_bp.route('/user/<user_id>', methods=['PUT'])
@jwt_required()
def update_user_profile(user_id):
    """Update user profile"""
    try:
        current_user_id = get_jwt_identity()
        
        # Ensure user can only update their own profile
        if current_user_id != user_id:
            return jsonify({"message": "Unauthorized: Cannot update another user's profile"}), 403

        data = request.get_json()
        if not data:
            return jsonify({"message": "No data provided"}), 400

        # Validate user exists
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "User not found"}), 404

        update_fields = {}

        # Validate and update name
        if 'name' in data:
            name = data['name'].strip()
            if len(name) >= 2:
                update_fields['name'] = name
            else:
                return jsonify({"message": "Name must be at least 2 characters long"}), 400

        # Validate and update email
        if 'email' in data:
            email = data['email'].strip().lower()
            if validate_email(email):
                # Check if email is already taken by another user
                existing_user = users_collection.find_one({
                    "email": email,
                    "_id": {"$ne": ObjectId(user_id)}
                })
                if existing_user:
                    return jsonify({"message": "Email already in use"}), 409
                update_fields['email'] = email
            else:
                return jsonify({"message": "Please provide a valid email address"}), 400

        # Validate and update phone
        if 'phone' in data:
            phone = data['phone'].strip()
            if validate_phone(phone):
                update_fields['phone'] = re.sub(r'\D', '', phone)
            else:
                return jsonify({"message": "Please provide a valid 10-digit phone number"}), 400

        # Update address
        if 'address' in data:
            address = data['address']
            current_address = user.get('address', {})
            
            updated_address = {
                'street': address.get('street', current_address.get('street', '')).strip(),
                'city': address.get('city', current_address.get('city', '')).strip(),
                'state': address.get('state', current_address.get('state', '')).strip(),
                'zip_code': address.get('zip_code', current_address.get('zip_code', '')).strip()
            }
            
            # Validate address
            if not all(updated_address.values()):
                return jsonify({"message": "All address fields are required"}), 400
            
            if not re.match(r'^\d{6}$', updated_address['zip_code']):
                return jsonify({"message": "Please provide a valid ZIP code"}), 400
            
            update_fields['address'] = updated_address

        if not update_fields:
            return jsonify({"message": "No valid fields to update"}), 400

        # Update user
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )

        if result.modified_count > 0:
            return jsonify({"message": "Profile updated successfully!"}), 200
        else:
            return jsonify({"message": "No changes made"}), 200

    except Exception as e:
        current_app.logger.error(f"Update profile error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@auth_bp.route('/user/<user_id>/upload-profile-pic', methods=['POST'])
@jwt_required()
def upload_profile_pic(user_id):
    """Upload profile picture"""
    try:
        current_user_id = get_jwt_identity()
        
        # Ensure user can only upload for themselves
        if current_user_id != user_id:
            return jsonify({"message": "Unauthorized: Cannot upload picture for another user"}), 403

        # Check if file is present
        if 'profilePic' not in request.files:
            return jsonify({"message": "No file provided"}), 400

        file = request.files['profilePic']
        if file.filename == '':
            return jsonify({"message": "No file selected"}), 400

        # Validate file
        if not allowed_file(file.filename):
            return jsonify({"message": "Invalid file type. Allowed: PNG, JPG, JPEG, GIF"}), 400

        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({"message": "File too large. Maximum size: 5MB"}), 400

        # Create upload directory
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'profile_pics')
        os.makedirs(upload_folder, exist_ok=True)

        # Generate unique filename
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"user_{user_id}_{timestamp}_{filename}"
        filepath = os.path.join(upload_folder, unique_filename)

        # Save file
        file.save(filepath)

        # Update database
        profile_pic_url = f"/static/uploads/profile_pics/{unique_filename}"
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"userProfilePic": profile_pic_url}}
        )

        if result.modified_count > 0:
            return jsonify({
                "message": "Profile picture uploaded successfully!",
                "profilePicUrl": profile_pic_url
            }), 200
        else:
            return jsonify({"message": "Failed to update profile picture"}), 500

    except Exception as e:
        current_app.logger.error(f"Upload profile pic error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client should discard tokens)"""
    try:
        # In a more advanced implementation, you might want to blacklist the token
        # For now, we'll just return a success message
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Logout error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "No data provided"}), 400

        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({"message": "Current password and new password are required"}), 400

        # Validate new password
        is_valid_password, password_message = validate_password(new_password)
        if not is_valid_password:
            return jsonify({"message": password_message}), 400

        # Get user
        user = users_collection.find_one({"_id": ObjectId(current_user_id)})
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Verify current password
        if not check_password_hash(user['password'], current_password):
            return jsonify({"message": "Current password is incorrect"}), 401

        # Update password
        hashed_new_password = generate_password_hash(new_password)
        result = users_collection.update_one(
            {"_id": ObjectId(current_user_id)},
            {"$set": {"password": hashed_new_password}}
        )

        if result.modified_count > 0:
            return jsonify({"message": "Password changed successfully!"}), 200
        else:
            return jsonify({"message": "Failed to update password"}), 500

    except Exception as e:
        current_app.logger.error(f"Change password error: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500