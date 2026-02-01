import os
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv

# Only load .env in development (Vercel sets env vars directly)
if os.getenv('VERCEL') != '1':
    load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size
    
    # Enable debug mode to see errors
    app.config['DEBUG'] = True
    app.config['PROPAGATE_EXCEPTIONS'] = True
    
    # CORS - Allow all origins for development
    CORS(app, 
         resources={r"/*": {
             "origins": "*",
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type"],
         }})
    
    # Add error handler for better debugging
    @app.errorhandler(Exception)
    def handle_exception(e):
        import traceback
        return jsonify({
            'error': str(e),
            'type': type(e).__name__,
            'traceback': traceback.format_exc()
        }), 500
    
    # Register blueprints
    from app.routes import profile, auth
    from app.routes.follows import follows_bp
    from app.routes.notifications import notifications_bp
    from app.routes.messages import messages_bp
    from app.routes.insights import insights_bp
    
    app.register_blueprint(profile.bp, url_prefix='/api/profile')
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(follows_bp, url_prefix='/api/follows')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(insights_bp, url_prefix='/api')
    
    @app.route('/api/health')
    def health():
        return {'status': 'healthy'}, 200
    
    @app.route('/api/')
    @app.route('/api')
    def root():
        from flask import request
        return jsonify({
            'message': 'API is running',
            'path': request.path,
            'full_path': request.full_path,
            'url': request.url,
            'routes': [str(rule) for rule in app.url_map.iter_rules()]
        }), 200
    
    return app
