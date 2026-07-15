from flask import Blueprint, request, jsonify
from database import get_db_connection

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/attendance', methods=['GET'])
def get_attendance():
    """
    View Attendance Logs Endpoint.
    PASTE YOUR GOOGLE COLAB 'SELECT' OR 'JOIN' ATTENDANCE QUERIES HERE.
    """
    date_filter = request.args.get('date') # Optional YYYY-MM-DD filter
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # SQL query to join attendance with employee details
        query = '''
            SELECT a.attendance_id, a.emp_id, e.name, e.department, a.attendance_date, a.status
            FROM Attendance a
            JOIN Employee e ON a.emp_id = e.emp_id
        '''
        
        if date_filter:
            query += " WHERE a.attendance_date = ? ORDER BY e.name ASC"
            cursor.execute(query, (date_filter,))
        else:
            query += " ORDER BY a.attendance_date DESC, e.name ASC"
            cursor.execute(query)
            
        rows = cursor.fetchall()
        
        attendance_logs = []
        for r in rows:
            is_present = r['status'] == 'Present'
            attendance_logs.append({
                'id': r['attendance_id'],
                'employee_id': r['emp_id'],
                'employee_name': r['name'],
                'department': r['department'],
                'date': r['attendance_date'],
                'status': r['status'],
                'check_in': '09:00' if is_present else '',
                'check_out': '17:00' if is_present else ''
            })
            
        conn.close()
        return jsonify(attendance_logs), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@attendance_bp.route('/attendance', methods=['POST'])
def mark_attendance():
    """
    Mark or Update Attendance Log.
    PASTE YOUR GOOGLE COLAB 'INSERT OR REPLACE' ATTENDANCE QUERIES HERE.
    """
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    employee_id = data.get('employee_id')
    date = data.get('date') # Format: 'YYYY-MM-DD'
    status = data.get('status') # 'Present', 'Absent', 'Late', 'On Leave'
    
    if not employee_id or not date or not status:
        return jsonify({'error': 'Missing employee_id, date, or status'}), 400
        
    # Map frontend status to the CHECK constraint status: 'Present' or 'Absent'
    status_mapped = 'Present' if status in ['Present', 'Late'] else 'Absent'
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if attendance already exists for this employee on this date
        cursor.execute("SELECT attendance_id FROM Attendance WHERE emp_id = ? AND attendance_date = ?", (employee_id, date))
        row = cursor.fetchone()
        
        if row:
            cursor.execute('''
                UPDATE Attendance
                SET status = ?
                WHERE attendance_id = ?
            ''', (status_mapped, row['attendance_id']))
        else:
            cursor.execute('''
                INSERT INTO Attendance (emp_id, attendance_date, status)
                VALUES (?, ?, ?)
            ''', (employee_id, date, status_mapped))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Attendance marked successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
