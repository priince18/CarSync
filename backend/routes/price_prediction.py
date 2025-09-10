from flask import Blueprint, request, jsonify
import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from db import cars_collection  # ✅ use your cars collection

price_prediction_bp = Blueprint('price_prediction_bp', __name__)
def train_model_from_db():
    try:
        csv_path = os.path.join(os.path.dirname(__file__), "second_hand_cars_data.csv")
        df = pd.read_csv(csv_path)


        # 🔹 Force numeric conversion for year, kms_driven, price
        for col in ["year", "kms_driven", "price"]:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        # 🔹 Drop any rows where required numeric values are missing
        df = df.dropna(subset=["year", "kms_driven", "price"])

        # 🔹 Encode categorical variables
        df = pd.get_dummies(df, columns=["make", "model", "fuel_type", "transmission"], drop_first=True)

        X = df.drop("price", axis=1)
        y = df["price"]

        model = LinearRegression()
        model.fit(X, y)

        os.makedirs("models", exist_ok=True)
        joblib.dump(model, "models/car_price_model.pkl")
        joblib.dump(list(X.columns), "models/car_price_features.pkl")

        return {"message": "Model trained successfully from database"}
    except Exception as e:
        return {"error": str(e)}


@price_prediction_bp.route('/predict_price', methods=['POST'])
def predict_price():

    try:
        data = request.get_json()

        # Load model & features
        model = joblib.load("models/car_price_model.pkl")
        feature_names = joblib.load("models/car_price_features.pkl")

        # Convert input to DataFrame
        user_df = pd.DataFrame([data])

        # One-hot encode
        user_df = pd.get_dummies(user_df, columns=["make", "model", "fuel_type", "transmission"], drop_first=True)

        # Add missing columns
        for col in feature_names:
            if col not in user_df:
                user_df[col] = 0

        # Reorder columns
        user_df = user_df[feature_names]

        # Predict
        predicted_price = int(model.predict(user_df)[0])
        predicted_price = predicted_price + (1000-(predicted_price%1000)) 
        return jsonify({"predicted_price": (predicted_price)})
        # return jsonify({"predicted_price": int(round(float(predicted_price)))})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@price_prediction_bp.route('/train_model', methods=['POST'])
def train_model():
    try:
        
        msg = train_model_from_db()
        return jsonify({"message": msg})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
