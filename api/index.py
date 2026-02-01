from flask import Flask, jsonify
import sys
import os
import traceback

# Add both api and backend directories to path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(parent_dir, 'backend')

sys.path.insert(0, backend_dir)
sys.path.insert(0, current_dir)

# Try to import and create the real app
app = None
import_error = None

try:
    from app import create_app
    app = create_app()
except Exception as e:
    import_error = {
        'error': str(e),
        'type': type(e).__name__,
        'traceback': traceback.format_exc()
    }

# If import failed, create a debug app
if app is None:
    app = Flask(__name__)
    
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'import_failed',
            'error': import_error,
            'backend_dir': backend_dir,
            'backend_exists': os.path.exists(backend_dir),
            'sys_path': sys.path[:5]
        }), 500
    
    @app.route('/api/<path:path>')
    def catch_all(path):
        return jsonify({
            'error': 'App initialization failed',
            'import_error': import_error,
            'path_requested': path
        }), 500
