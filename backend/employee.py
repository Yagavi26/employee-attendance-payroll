from flask import Blueprint, request, jsonify
from database import get_db_connection

employee_bp = Blueprint('employee', __name__)

@employee_bp.route('/employees', methods=['GET'])
def get_employees():
    """
    View Employees Endpoint.
    PASTE YOUR GOOGLE COLAB 'SELECT' QUERIES HERE if you wish to override.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # SQL query to fetch all employees
        cursor.execute("SELECT * FROM Employee ORDER BY emp_id DESC")
        rows = cursor.fetchall()
        
        # Convert sqlite3 Row objects to dictionary list
        employees = []
        for r in rows:
            employees.append({
                'id': r['emp_id'],
                'name': r['name'],
                'email': f"{r['name'].lower().replace(' ', '')}@company.com",
                'phone': "+1 555-0100",
                'department': r['department'],
                'designation': r['designation'],
                'joining_date': r['joining_date'],
                'salary': round(r['daily_salary'] * 30.0, 2),
                'status': "Active"
            })
            
        conn.close()
        return jsonify(employees), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@employee_bp.route('/employees', methods=['POST'])
def add_employee():
    """
    Add Employee Endpoint.
    PASTE YOUR GOOGLE COLAB 'INSERT' QUERIES HERE.
    """
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    name = data.get('name')
    department = data.get('department')
    designation = data.get('designation')
    joining_date = data.get('joining_date')
    salary = data.get('salary', 0.0)
    daily_salary = round((float(salary) if salary else 0.0) / 30.0, 2)
    
    if not name or not department or not designation or not joining_date:
        return jsonify({'error': 'Missing required fields'}), 400
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # SQL query to insert new employee
        cursor.execute('''
            INSERT INTO Employee (name, department, designation, daily_salary, joining_date)
            VALUES (?, ?, ?, ?, ?)
        ''', (name, department, designation, daily_salary, joining_date))
        
        employee_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Employee added successfully',
            'id': employee_id
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@employee_bp.route('/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    """
    Update Employee Endpoint.
    PASTE YOUR GOOGLE COLAB 'UPDATE' QUERIES HERE.
    """
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    name = data.get('name')
    department = data.get('department')
    designation = data.get('designation')
    joining_date = data.get('joining_date')
    salary = data.get('salary', 0.0)
    daily_salary = round((float(salary) if salary else 0.0) / 30.0, 2)
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # SQL query to update employee records
        cursor.execute('''
            UPDATE Employee
            SET name = ?, department = ?, designation = ?, daily_salary = ?, joining_date = ?
            WHERE emp_id = ?
        ''', (name, department, designation, daily_salary, joining_date, emp_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Employee updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@employee_bp.route('/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    """
    Delete Employee Endpoint.
    PASTE YOUR GOOGLE COLAB 'DELETE' QUERIES HERE.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # SQL query to delete employee
        cursor.execute("DELETE FROM Employee WHERE emp_id = ?", (emp_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Employee deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
