import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Get MongoDB URI from environment variable or use default
MONGO_URI = os.environ.get('MONGO_URI', "mongodb://localhost:27017/")
DB_NAME = os.environ.get('DB_NAME', "CarSync")

try:
    # Create MongoDB client with timeout
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    
    # Test the connection
    client.admin.command('ping')
    print(f"✅ Successfully connected to MongoDB at {MONGO_URI}")
    
    db = client[DB_NAME]
    users_collection = db["users"]
    cars_collection = db["cars"]
    sales_collection = db["sales"]
    criminal_records_collection = db["criminal_records"]
    test_drives_collection = db["test_drives"]
    
    print(f"✅ Database '{DB_NAME}' and collections initialized successfully")
    
except ConnectionFailure as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    print("Please make sure MongoDB is running on your system.")
    print("To start MongoDB:")
    print("  - Windows: Start MongoDB service or run 'mongod'")
    print("  - macOS: brew services start mongodb-community")
    print("  - Linux: sudo systemctl start mongod")
    
    # Create fallback collections (will work when MongoDB is available)
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db["users"]
    cars_collection = db["cars"]
    sales_collection = db["sales"]
    criminal_records_collection = db["criminal_records"]
    test_drives_collection = db["test_drives"]
    
except Exception as e:
    print(f"❌ Database initialization error: {e}")
    # Create fallback collections
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db["users"]
    cars_collection = db["cars"]
    sales_collection = db["sales"]
    criminal_records_collection = db["criminal_records"]
    test_drives_collection = db["test_drives"]
