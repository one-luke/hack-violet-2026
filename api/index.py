from flask import Flask, jsonify
import sys
import os

# Add both api and backend directories to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(parent_dir, 'backend')

sys.path.insert(0, backend_dir)
sys.path.insert(0, current_dir)

# Try to import and create the real app
try:
    from app import create_app
    app = create_app()
    print("Successfully created Flask app from backend")
except Exception as e:
    # If import fails, create a debug app
    print(f"Failed to import backend app: {str(e)}")
    app = Flask(__name__)
    
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'error',
            'error': str(e),
            'error_type': type(e).__name__,
            'backend_dir': backend_dir,
            'backend_exists': os.path.exists(backend_dir),
            'backend_files': os.listdir(backend_dir) if os.path.exists(backend_dir) else [],
        }), 500
    
    @app.route('/api/<path:path>')
    def catch_all(path):
        return jsonify({
            'error': 'App initialization failed',
            'details': str(e),
            'path_requested': path
        }), 500
