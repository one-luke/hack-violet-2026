import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size
    
    # CORS
    CORS(app, origins=os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(','))
    
    # Register blueprints
    from app.routes import profile, auth
    app.register_blueprint(profile.bp)
    app.register_blueprint(auth.bp)
    
    @app.route('/health')
    def health():
        return {'status': 'healthy'}, 200
    
    return app
