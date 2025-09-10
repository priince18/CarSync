from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
# Assuming your db.py correctly sets up cars_collection
from db import cars_collection, users_collection, sales_collection, test_drives_collection
from bson import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS # Ensure CORS is imported and used in your main app.py
import json
import os
cars_bp = Blueprint('cars', __name__)

# Utility function to serialize a MongoDB document (keep this as it's essential for ObjectId)
def serialize(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, list):
        return [serialize(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: serialize(v) for k, v in obj.items()}
    else:
        return obj

def _id_variants(id_str: str):
    """Return list of possible representations for an id (string and ObjectId if valid)."""
    variants = [str(id_str)]
    try:
        if ObjectId.is_valid(str(id_str)):
            variants.append(ObjectId(str(id_str)))
    except Exception:
        pass
    return variants

@jwt_required()
def add_car():
    try:
        data = request.form.to_dict()
        images = request.files.getlist('images')

        print("DEBUG - Incoming data:", data)
        print("DEBUG - Incoming images:", images)

        seller_id = get_jwt_identity()
        # Upload images and get their filenames (for now)
        image_urls = []
        if 'image_urls' in data:
            try:
                image_urls = json.loads(data['image_urls'])  # comes as JSON string from frontend
            except:
                image_urls = [data['image_urls']]
        

        user = users_collection.find_one({"_id": ObjectId(seller_id)})

        city = None
        if user and "address" in user:
            if isinstance(user["address"], list) and len(user["address"]) > 1:
                city = user["address"][1]   # array format
            elif isinstance(user["address"], dict):
                city = user["address"].get("city")  # object format

        if not city:
            return jsonify({"error": "User city not found in address"}), 400


        # Handle features safely
        features_raw = data.get("features")
        features = []
        if features_raw:
            try:
                features = json.loads(features_raw) if isinstance(features_raw, str) else features_raw
            except Exception:
                features = [features_raw]

        new_car = {
            'make': data['company'],
            'model': data['model'],
            'city': city,   # ✅ always from user’s address
            'seller_id': seller_id,
            'year': int(data['year']),
            'price': int(data['price']),
            'kms_driven': int(data['kms_driven']),
            'fuel_type': data['fuel_type'],
            'images': image_urls,
            'features': features,
            'transmission': data['transmission'],
            'description': data.get('description', ''),
            'owner': data.get('owner', 'First'),
            'status': 'available',
            'created_at': datetime.utcnow()
        }

        result = cars_collection.insert_one(new_car)
        return jsonify({'message': 'Car listed successfully', 'car_id': str(result.inserted_id)}), 201

    except Exception as e:
        import traceback
        print("ERROR in add_car:", traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@cars_bp.route('/cars', methods=['GET', 'POST'])
def handle_cars():
    if request.method == 'POST':
        return add_car()
    else:
        return get_cars()

def get_cars():
    search = request.args.get('search', '').strip()
    brands = request.args.getlist('brand')
    models = request.args.getlist('model')
    minPrice = request.args.get('minPrice')
    maxPrice = request.args.get('maxPrice')
    years = request.args.getlist('year')
    kms = request.args.getlist('kms_driven')
    fuel_types = request.args.getlist('fuelType')
    transmissions = request.args.getlist('transmission')
    categories = request.args.getlist('category')
    owners = request.args.getlist('owner')
    city = request.args.get('city')
    sort_by = request.args.get('sortBy')

    # ✅ Always only show available cars
    query = {"status": "available"}

    # 🔎 Search filter
    if search:
        query['$or'] = [
            {'make': {'$regex': search, '$options': 'i'}},
            {'model': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]

    # Brand filter
    if brands:
        query['make'] = {'$in': brands}

    # Model filter
    if models:
        query['model'] = {'$in': models}

    # Price filter
    if minPrice or maxPrice:
        price_query = {}
        if minPrice and minPrice != "null":
            price_query['$gte'] = int(minPrice)
        if maxPrice and maxPrice != "null":
            price_query['$lte'] = int(maxPrice)
        query['price'] = price_query

    # Year filter
    if years:
        year_conditions = []
        for year_range in years:
            if '_above' in year_range:
                year_val = int(year_range.split('_')[0])
                year_conditions.append({'year': {'$gte': year_val}})
            elif 'before_' in year_range:
                year_val = int(year_range.split('_')[1])
                year_conditions.append({'year': {'$lt': year_val}})
            else:
                year_conditions.append({'year': int(year_range)})
        if year_conditions:
            query['$or'] = query.get('$or', []) + year_conditions

    # KMs filter
    if kms:
        km_conditions = []
        for km_range in kms:
            if km_range is None:
                continue
            val = str(km_range).replace(",", "").replace(" km", "").strip()

            if val.isdigit():
                km_conditions.append({'kms_driven': {'$lte': int(val)}})
                continue

            if '-' in val:
                parts = [p.strip() for p in val.split('-') if p.strip()]
                if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                    km_min = int(parts[0])
                    km_max = int(parts[1])
                    km_conditions.append({'kms_driven': {'$gte': km_min, '$lte': km_max}})
                continue

            if 'less' in val or 'lte' in val:
                num = ''.join(ch for ch in val if ch.isdigit())
                if num:
                    km_conditions.append({'kms_driven': {'$lte': int(num)}})
                continue

            if 'above' in val or 'gte' in val:
                num = ''.join(ch for ch in val if ch.isdigit())
                if num:
                    km_conditions.append({'kms_driven': {'$gte': int(num)}})
                continue

        if km_conditions:
            query['$or'] = query.get('$or', []) + km_conditions

    if fuel_types:
        query['fuel_type'] = {'$in': fuel_types}

    if transmissions:
        query['transmission'] = {'$in': transmissions}

    if categories:
        query['category'] = {'$in': categories}

    if owners:
        query['owner'] = {'$in': owners}

    if city:
        query['city'] = {'$regex': city, '$options': 'i'}

    # ✅ Sorting
    sort_query = {}
    if sort_by:
        if sort_by == 'lowToHigh':
            sort_query['price'] = 1
        elif sort_by == 'highToLow':
            sort_query['price'] = -1
        elif sort_by == 'newest':
            sort_query['year'] = -1
        elif sort_by == 'oldest':
            sort_query['year'] = 1
        elif sort_by == 'date_desc':
            sort_query['_id'] = -1

    if sort_query:
        cars = list(cars_collection.find(query).sort(list(sort_query.items())))
    else:
        cars = list(cars_collection.find(query))

    serialized_cars = serialize(cars)

    # 🔥 Get filter options dynamically from all available cars only
    all_cars = list(cars_collection.find({"status": "available"}))

    brands_list = sorted(list(set(car.get('make') for car in all_cars if car.get('make'))))

    if brands:
        models_list = sorted(list(set(
            car.get('model') for car in all_cars if car.get('make') in brands and car.get('model')
        )))
    else:
        models_list = sorted(list(set(car.get('model') for car in all_cars if car.get('model'))))

    owners_list = sorted(list(set(car.get('owner') for car in all_cars if car.get('owner'))))

    cities_list = sorted(list(set(
        car.get('city') for car in all_cars if car.get('city') and car.get('city').strip()
    )))

    return jsonify({
        'cars': serialized_cars,
        'filterOptions': {
            'brands': brands_list,
            'models': models_list,
            'owners': owners_list,
            'cities': cities_list
        }
    })

@cars_bp.route('/update-cars/<car_id>', methods=['PUT'])
@jwt_required()
def update_car(car_id):
    user_id = get_jwt_identity()
    car = cars_collection.find_one({"_id": ObjectId(car_id)})
    if not car:
        return jsonify({"error": "Car not found"}), 404
    # Only allow seller to edit
    if str(car.get("seller_id")) != str(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json
    update_fields = {
        "make": data.get("make"),
        "model": data.get("model"),
        "price": data.get("price"),
        "year": data.get("year"),
        "kms_driven": data.get("kms_driven"),
        "fuel_type": data.get("fuel_type"),
        "transmission": data.get("transmission"),
        "owner": data.get("owner"),
        "description": data.get("description"),
    }
    # Remove None values
    update_fields = {k: v for k, v in update_fields.items() if v is not None}

    cars_collection.update_one(
        {"_id": ObjectId(car_id)},
        {"$set": update_fields}
    )
    return jsonify({"message": "Car updated successfully"}), 200

@cars_bp.route('/user/like-car', methods=['POST'])
@jwt_required()
def like_car():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    car_id = data.get('carId')

    if not car_id:
        return jsonify({"error": "Missing carId"}), 400

    user = users_collection.find_one({'_id': ObjectId(current_user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    car_id_str = str(car_id) if isinstance(car_id, ObjectId) else car_id

    liked_cars = user.get('liked_cars', [])

    if car_id_str not in liked_cars:
        liked_cars.append(car_id_str)
        users_collection.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': {'liked_cars': liked_cars}}
        )
        cars_collection.update_one(
            {'_id': ObjectId(car_id_str)},
            {'$addToSet': {'liked_by_users': current_user_id}}
        )

    return jsonify({"message": "Car liked successfully"})

@cars_bp.route('/user/like-car/<string:car_id>', methods=['DELETE'])
@jwt_required()
def unlike_car(car_id):
    current_user_id = get_jwt_identity()

    user = users_collection.find_one({'_id': ObjectId(current_user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    car_id_str = str(car_id)

    liked_cars = user.get('liked_cars', [])

    if car_id_str in liked_cars:
        liked_cars.remove(car_id_str)
        users_collection.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': {'liked_cars': liked_cars}}
        )
        cars_collection.update_one(
            {'_id': ObjectId(car_id_str)},
            {'$pull': {'liked_by_users': current_user_id}}
        )
        return jsonify({"message": "Car unliked successfully"})
    else:
        return jsonify({"message": "Car not found in liked list"}), 404

@cars_bp.route('/user/liked-cars', methods=['GET'])
@jwt_required()
def get_liked_cars_for_user():
    current_user_id = get_jwt_identity()

    user = users_collection.find_one({'_id': ObjectId(current_user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    liked_car_ids = user.get('liked_cars', [])
    object_ids = [ObjectId(car_id) for car_id in liked_car_ids if ObjectId.is_valid(car_id)]

    liked_cars = list(cars_collection.find({'_id': {'$in': object_ids}}))
    serialized_liked_cars = serialize(liked_cars)
    
    return jsonify(serialized_liked_cars)

@cars_bp.route('/user/<string:user_id>/purchases', methods=['GET'])
@jwt_required()
def get_purchased_cars(user_id):
    current_user_id = get_jwt_identity()
    if str(current_user_id) != str(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Find sales where the current user is the buyer
    purchases = list(sales_collection.find({'buyer_id': {'$in': _id_variants(user_id)}}))

    # Fetch car details for each purchased car
    purchased_cars_details = []
    seen_ids = set()
    for purchase in purchases:
        try:
            car = cars_collection.find_one({'_id': ObjectId(purchase['car_id'])})
        except Exception:
            car = None
        if car:
            car_details = serialize(car)
            car_details['sale_price'] = purchase.get('sale_price')
            car_details['payment_method'] = purchase.get('payment_method')
            sale_dt = purchase.get('sale_date', purchase.get('_id').generation_time)
            try:
                car_details['sale_date'] = sale_dt.isoformat()
            except Exception:
                car_details['sale_date'] = str(sale_dt)
            purchased_cars_details.append(car_details)
            seen_ids.add(str(car.get('_id')))

    # Fallback: cars collection where buyer_id is set to current user
    fallback_cars = list(cars_collection.find({'buyer_id': {'$in': _id_variants(user_id)}}))
    for car in fallback_cars:
        if str(car.get('_id')) in seen_ids:
            continue
        car_details = serialize(car)
        # propagate sale fields if present on car
        if car.get('sale_price'):
            car_details['sale_price'] = car.get('sale_price')
        if car.get('payment_method'):
            car_details['payment_method'] = car.get('payment_method')
        if car.get('sale_date'):
            try:
                car_details['sale_date'] = car.get('sale_date').isoformat()
            except Exception:
                car_details['sale_date'] = str(car.get('sale_date'))
        purchased_cars_details.append(car_details)
    
    return jsonify(purchased_cars_details)
@cars_bp.route('/user/<string:user_id>/purchases', methods=['GET'])
@jwt_required()
def get_purchased(user_id):
    current_user_id = get_jwt_identity()
    if str(current_user_id) != str(user_id):
        return jsonify({'error': 'Unauthorized'}), 403

    # ✅ Only from sales collection
    purchases = list(sales_collection.find({'buyer_id': {'$in': _id_variants(user_id)}}))

    purchased_cars_details = []
    for purchase in purchases:
        try:
            car = cars_collection.find_one({'_id': ObjectId(purchase['car_id'])})
        except Exception:
            car = None

        if car:
            car_details = serialize(car)
            car_details['sale_price'] = purchase.get('sale_price')
            car_details['payment_method'] = purchase.get('payment_method')
            purchase_dt = purchase.get('sale_date', purchase.get('_id').generation_time)
            try:
                car_details['sale_date'] = purchase_dt.isoformat()
            except Exception:
                car_details['sale_date'] = str(purchase_dt)

            purchased_cars_details.append(car_details)

    return jsonify(purchased_cars_details)

@cars_bp.route('/user/<string:user_id>/sales', methods=['GET'])
@jwt_required()
def get_my_cars(user_id):
    current_user_id = get_jwt_identity()
    if str(current_user_id) != str(user_id):
        return jsonify({'error': 'Unauthorized'}), 403

    # Cars listed by the user
    my_cars = list(cars_collection.find({'seller_id': {'$in': _id_variants(user_id)}}))

    my_cars_details = []
    for car in my_cars:
        car_details = serialize(car)

        # Add sale-related fields if available
        if car.get('buyer_id'):
            car_details['sale_price'] = car.get('sale_price')
            car_details['payment_method'] = car.get('payment_method')
            if car.get('sale_date'):
                try:
                    car_details['sale_date'] = car.get('sale_date').isoformat()
                except Exception:
                    car_details['sale_date'] = str(car.get('sale_date'))
        else:
            car_details['status'] = 'Available'

        my_cars_details.append(car_details)

    return jsonify(my_cars_details)

@cars_bp.route('/cars/<string:car_id>', methods=['GET'])
def get_car_details(car_id):
    if not ObjectId.is_valid(car_id):
        return jsonify({"error": "Invalid car ID"}), 400
    car = cars_collection.find_one({'_id': ObjectId(car_id)})
    if not car:
        return jsonify({"error": "Car not found"}), 404

    # Fetch seller details if seller_id is present
    seller_info = None
    seller_id = car.get('seller_id')
    if seller_id and ObjectId.is_valid(str(seller_id)):
        seller = users_collection.find_one({'_id': ObjectId(seller_id)})
        if seller:
            seller_info = {
                '_id': str(seller.get('_id')),
                'name': seller.get('name') ,
                'email': seller.get('email'),
                'phone': seller.get('phone'),
                'address': str( str(seller.get('address').get('street'))+", "+seller.get('address').get('city')) + ", " + str(seller.get('address').get('state')) + ", " + str(seller.get('address').get('zip_code')),
                
            }
    car_serialized = serialize(car)
    if seller_info:
        car_serialized['seller'] = seller_info
    return jsonify(car_serialized)


@cars_bp.route("/cars/<string:car_id>/buy", methods=["POST"])
@jwt_required()
def buy_car(car_id):
    user_id = get_jwt_identity()
    data = request.json

    car = cars_collection.find_one({"_id": ObjectId(car_id)})
    if not car:
        return jsonify({"error": "Car not found"}), 404

    if str(car["seller_id"]) == str(user_id):
        return jsonify({"error": "You cannot buy your own car"}), 400

    if car.get("status") == "sold":
        return jsonify({"error": "Car already sold"}), 400

    # Insert into sales table
    sale_data = {
        "car_id": car_id,
        "seller_id": str(car["seller_id"]),
        "buyer_id": str(user_id),
        "sale_price": data.get("final_price", car["price"]),
        "sale_date": datetime.utcnow(),
        "payment_method": data.get("payment_method", "Cash")
    }
    sales_collection.insert_one(sale_data)

    # Update car status
    cars_collection.update_one(
        {"_id": ObjectId(car_id)},
        {"$set": {"status": "sold"}}
    )

    return jsonify({"message": "Car purchased successfully!"}), 200

@cars_bp.route('/cars/<string:car_id>/test-drive', methods=['POST'])
@jwt_required()
def book_test_drive(car_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    location = data.get('location')
    datetime_str = data.get('datetime')

    if not all([name, location, datetime_str]):
        return jsonify({"error": "Missing required fields: name, location, and datetime are required"}), 400

    car = cars_collection.find_one({'_id': ObjectId(car_id)})
    if not car:
        return jsonify({"error": "Car not found"}), 404

    try:
        test_drive_datetime = datetime.fromisoformat(datetime_str)
    except ValueError:
        return jsonify({"error": "Invalid datetime format"}), 400

    test_drive_data = {
        "car_id": ObjectId(car_id),
        "user_id": ObjectId(current_user_id),
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "scheduled_datetime": test_drive_datetime,
        "request_date": datetime.utcnow(),
        "status": "Confirmed"
    }
    result = test_drives_collection.insert_one(test_drive_data)
    return jsonify({
        "message": "Test drive request submitted successfully!",
        "booking_id": str(result.inserted_id)
    }), 201

@cars_bp.route('/test-drives/<string:booking_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_test_drive(booking_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    reason = data.get('reason')

    if not reason:
        return jsonify({"error": "Cancellation reason is required"}), 400

    # Find the test drive booking
    booking = test_drives_collection.find_one({
        '_id': ObjectId(booking_id),
        'user_id': ObjectId(current_user_id)
    })

    if not booking:
        return jsonify({"error": "Test drive booking not found"}), 404

    # Update the booking status to cancelled
    test_drives_collection.update_one(
        {'_id': ObjectId(booking_id)},
        {
            '$set': {
                'status': 'Cancelled',
                'cancellation_reason': reason,
                'cancelled_at': datetime.utcnow()
            }
        }
    )

    return jsonify({"message": "Test drive cancelled successfully"}), 200

@cars_bp.route('/test-drives/<string:booking_id>/reschedule', methods=['PUT'])
@jwt_required()
def reschedule_test_drive(booking_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    location = data.get('location')
    datetime_str = data.get('datetime')

    if not all([location, datetime_str]):
        return jsonify({"error": "Missing required fields: location and datetime are required"}), 400

    # Find the test drive booking
    booking = test_drives_collection.find_one({
        '_id': ObjectId(booking_id),
        'user_id': ObjectId(current_user_id)
    })

    if not booking:
        return jsonify({"error": "Test drive booking not found"}), 404

    try:
        test_drive_datetime = datetime.fromisoformat(datetime_str)
    except ValueError:
        return jsonify({"error": "Invalid datetime format"}), 400

    # Update the existing booking
    test_drives_collection.update_one(
        {'_id': ObjectId(booking_id)},
        {
            '$set': {
                'location': location,
                'scheduled_datetime': test_drive_datetime,
                'updated_at': datetime.utcnow()
            }
        }
    )

    return jsonify({"message": "Test drive rescheduled successfully"}), 200


@cars_bp.route('/user/<string:user_id>/test-drives', methods=['GET'])
@jwt_required()
def get_user_test_drives(user_id):
    current_user_id = get_jwt_identity()
    if str(current_user_id) != str(user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Find all test drives for the user
    test_drives = list(test_drives_collection.find({'user_id': ObjectId(user_id)}))
    
    # Fetch car details for each test drive
    test_drives_with_cars = []
    for test_drive in test_drives:
        car = cars_collection.find_one({'_id': test_drive['car_id']})
        if car:
            test_drive_data = serialize(test_drive)
            test_drive_data['car'] = serialize(car)
            test_drives_with_cars.append(test_drive_data)
    
    return jsonify(test_drives_with_cars)

@cars_bp.route('/cars/count', methods=['GET'])
def get_cars_count():
    try:
        count = cars_collection.count_documents({})
        return jsonify({'total_cars': count}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
UPLOAD_FOLDER = 'static/upload/carimage'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@cars_bp.route('/upload_images', methods=['POST'])
def upload_images():
    files = request.files.getlist('images')
    saved = []
    for f in files:
        path = os.path.join(UPLOAD_FOLDER, f.filename)
        f.save(path)
        saved.append(path)
    return jsonify({'uploaded': saved}), 200