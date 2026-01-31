from flask import Flask, jsonify
import sys
import os

# Create a minimal Flask app for debugging
app = Flask(__name__)

@app.route('/api/<path:path>')
def catch_all(path):
    # Add both api and backend directories to path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    backend_dir = os.path.join(parent_dir, 'backend')
    
    return jsonify({
        'message': 'API endpoint hit',
        'path': path,
        'python_version': sys.version,
        'cwd': os.getcwd(),
        'current_dir': current_dir,
        'parent_dir': parent_dir,
        'backend_dir': backend_dir,
        'backend_exists': os.path.exists(backend_dir),
        'files_in_cwd': os.listdir('.'),
        'env_check': {
            'SUPABASE_URL': 'SET' if os.environ.get('SUPABASE_URL') else 'NOT SET',
            'SUPABASE_SERVICE_KEY': 'SET' if os.environ.get('SUPABASE_SERVICE_KEY') else 'NOT SET',
            'FLASK_SECRET_KEY': 'SET' if os.environ.get('FLASK_SECRET_KEY') else 'NOT SET',
        }
    }), 200

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy'}), 200
