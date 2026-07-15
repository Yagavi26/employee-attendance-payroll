from flask import Flask, jsonify
from flask_cors import CORS
import os

from database import init_db
from employee import employee_bp
from attendance import attendance_bp
from payroll import payroll_bp
from reports import reports_bp

app = Flask(__name__)

# Enable CORS for all routes (important for React integration)
CORS(app)

# Register blueprints with '/api' prefixes matching the frontend routes
app.register_blueprint(employee_bp, url_prefix='/api')
app.register_blueprint(attendance_bp, url_prefix='/api')
app.register_blueprint(payroll_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'database': 'SQLite',
        'message': 'Employee Attendance and Payroll API is operational!'
    }), 200

if __name__ == '__main__':
    # Initialize SQLite database and tables
    if not os.path.exists('employee.db'):
        init_db()
        
    print("Flask Server starting on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
