import sys
import os

# Add both api and backend directories to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(parent_dir, 'backend')

sys.path.insert(0, backend_dir)
sys.path.insert(0, current_dir)

# Import and create the Flask app
try:
    from app import create_app
    app = create_app()
except Exception as e:
    # If there's an error, create a simple Flask app to report it
    from flask import Flask, jsonify
    app = Flask(__name__)
    
    @app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
    def catch_all(path):
        return jsonify({
            'error': 'Server initialization failed',
            'details': str(e),
            'path_info': {
                'current_dir': current_dir,
                'backend_dir': backend_dir,
                'sys_path': sys.path[:3]
            }
        }), 500
