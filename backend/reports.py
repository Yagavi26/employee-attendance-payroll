from flask import Blueprint, jsonify
from database import get_db_connection

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports/attendance', methods=['GET'])
def get_attendance_percentage_report():
    """
    Attendance Percentage Report Endpoint.
    PASTE YOUR GOOGLE COLAB ATTENDANCE AGGREGATION SQL/PYTHON QUERIES HERE.
    
    This returns the overall attendance rate (%) per employee, calculated as:
    (Total Present Days / Total Logged Days) * 100.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Aggregate present days vs total logs
        cursor.execute('''
            SELECT 
                e.emp_id, 
                e.name, 
                e.department,
                COUNT(a.attendance_id) as total_days,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as active_days
            FROM Employee e
            LEFT JOIN Attendance a ON e.emp_id = a.emp_id
            GROUP BY e.emp_id
        ''')
        rows = cursor.fetchall()
        
        report_data = []
        for r in rows:
            total = r['total_days']
            active = r['active_days'] or 0
            percentage = round((active / total * 100.0), 1) if total > 0 else 100.0
            
            report_data.append({
                'id': r['emp_id'],
                'name': r['name'],
                'department': r['department'],
                'total_days': total,
                'attended_days': active,
                'percentage': percentage
            })
            
        conn.close()
        return jsonify(report_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/reports/highest-paid', methods=['GET'])
def get_highest_paid_report():
    """
    Highest Paid Employee Report Endpoint.
    PASTE YOUR GOOGLE COLAB SALARY QUERY HERE.
    
    Returns the top-paid employees in the organization.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT emp_id, name, department, designation, daily_salary
            FROM Employee
            ORDER BY daily_salary DESC
            LIMIT 10
        ''')
        rows = cursor.fetchall()
        
        report_data = []
        for r in rows:
            report_data.append({
                'id': r['emp_id'],
                'name': r['name'],
                'department': r['department'],
                'designation': r['designation'],
                'salary': round(r['daily_salary'] * 30.0, 2)
            })
            
        conn.close()
        return jsonify(report_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/reports/departments', methods=['GET'])
def get_department_summary_report():
    """
    Department Summary Report Endpoint.
    PASTE YOUR GOOGLE COLAB DEPARTMENT ANALYSIS SQL HERE.
    
    Returns total headcount, total salary expenditure, and average salary per department.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                department,
                COUNT(emp_id) as head_count,
                SUM(daily_salary * 30.0) as total_salary,
                AVG(daily_salary * 30.0) as avg_salary
            FROM Employee
            GROUP BY department
        ''')
        rows = cursor.fetchall()
        
        report_data = []
        for r in rows:
            report_data.append({
                'department': r['department'],
                'headcount': r['head_count'],
                'total_salary': round(r['total_salary'], 2) if r['total_salary'] else 0.0,
                'avg_salary': round(r['avg_salary'], 2) if r['avg_salary'] else 0.0
            })
            
        conn.close()
        return jsonify(report_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
