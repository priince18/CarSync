# server.py
import os
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp
from routes.cars import cars_bp
from routes.price_prediction import price_prediction_bp


def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = False
    
    # Initialize extensions
    jwt = JWTManager(app)
    
    # CORS configuration
    CORS(app,origins=["http://localhost:3000"], supports_credentials=True)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(cars_bp, url_prefix='/api')
    app.register_blueprint(price_prediction_bp, url_prefix='/api')

    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )
