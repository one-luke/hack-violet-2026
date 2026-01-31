import os
from flask import Flask
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size
    
    # CORS - Allow all origins for development
    CORS(app, 
         resources={r"/*": {
             "origins": "*",
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type"],
         }})
    
    # Register blueprints
    from app.routes import profile, auth
    from app.routes.follows import follows_bp
    from app.routes.notifications import notifications_bp
    from app.routes.messages import messages_bp
    
    app.register_blueprint(profile.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(follows_bp, url_prefix='/api/follows')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    
    @app.route('/health')
    def health():
        return {'status': 'healthy'}, 200
    
    return app
