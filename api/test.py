from flask import Flask, jsonify
import sys
import os

app = Flask(__name__)

@app.route('/api/test')
def test():
    return jsonify({
        'status': 'ok',
        'python_version': sys.version,
        'cwd': os.getcwd(),
        'files': os.listdir('.'),
        'env_vars': {
            'SUPABASE_URL': os.environ.get('SUPABASE_URL', 'NOT SET'),
            'FLASK_SECRET_KEY': os.environ.get('FLASK_SECRET_KEY', 'NOT SET'),
        }
    })

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy'}), 200
