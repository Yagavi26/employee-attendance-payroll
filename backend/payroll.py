from flask import Blueprint, request, jsonify
from database import get_db_connection

payroll_bp = Blueprint('payroll', __name__)

# Single-process in-memory tracker for payment status to match strict database schema
PAID_PAYROLLS = set()
PAID_DATES = {}

@payroll_bp.route('/payroll', methods=['GET'])
def get_payroll():
    """
    View Payroll Records Endpoint.
    PASTE YOUR GOOGLE COLAB 'SELECT' OR 'JOIN' PAYROLL QUERIES HERE.
    """
    month_filter = request.args.get('month') # Optional filter like '2026-07'
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = '''
            SELECT p.payroll_id, p.emp_id, e.name, e.department, e.designation, p.month, p.year, p.days_present, p.gross_salary, e.daily_salary
            FROM Payroll p
            JOIN Employee e ON p.emp_id = e.emp_id
        '''
        
        if month_filter and '-' in month_filter:
            parts = month_filter.split('-')
            year_val = int(parts[0])
            month_val = int(parts[1])
            query += " WHERE p.month = ? AND p.year = ? ORDER BY e.name ASC"
            cursor.execute(query, (month_val, year_val))
        else:
            query += " ORDER BY p.year DESC, p.month DESC, e.name ASC"
            cursor.execute(query)
            
        rows = cursor.fetchall()
        
        payroll_records = []
        for r in rows:
            p_id = r['payroll_id']
            base_sal = round(r['daily_salary'] * 30, 2)
            gross = r['gross_salary']
            allowances = round(gross * 0.1, 2)
            deductions = max(0.0, round(base_sal - gross, 2))
            net_salary = gross
            
            payroll_records.append({
                'id': p_id,
                'employee_id': r['emp_id'],
                'employee_name': r['name'],
                'department': r['department'],
                'designation': r['designation'],
                'month': f"{r['year']}-{r['month']:02d}",
                'base_salary': base_sal,
                'allowances': allowances,
                'deductions': deductions,
                'net_salary': net_salary,
                'status': 'Paid' if p_id in PAID_PAYROLLS else 'Unpaid',
                'payment_date': PAID_DATES.get(p_id, '')
            })
            
        conn.close()
        return jsonify(payroll_records), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payroll_bp.route('/payroll/generate', methods=['POST'])
def generate_payroll():
    """
    Generate Payroll for a Specific Month.
    PASTE YOUR GOOGLE COLAB PAYROLL CALCULATION CODE HERE.
    """
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    month = data.get('month') # Format: 'YYYY-MM'
    
    if not month or '-' not in month:
        return jsonify({'error': 'Missing or invalid month parameter'}), 400
        
    try:
        parts = month.split('-')
        year_val = int(parts[0])
        month_val = int(parts[1])
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Fetch all employees
        cursor.execute("SELECT emp_id, name, daily_salary, department FROM Employee")
        employees = cursor.fetchall()
        
        generated_count = 0
        
        for emp in employees:
            emp_id = emp['emp_id']
            daily_salary = emp['daily_salary']
            
            # Count Present days from Attendance table for this employee and month
            # Since attendance_date is text like YYYY-MM-DD, we filter by LIKE 'YYYY-MM%'
            cursor.execute('''
                SELECT COUNT(*) as present_days 
                FROM Attendance 
                WHERE emp_id = ? AND status = 'Present' AND attendance_date LIKE ?
            ''', (emp_id, f"{month}%"))
            days_present = cursor.fetchone()['present_days']
            
            # Formula: gross_salary = daily_salary * days_present
            gross_salary = round(daily_salary * days_present, 2)
            
            # Store or update the record
            cursor.execute('''
                SELECT payroll_id FROM Payroll 
                WHERE emp_id = ? AND month = ? AND year = ?
            ''', (emp_id, month_val, year_val))
            row = cursor.fetchone()
            
            if row:
                cursor.execute('''
                    UPDATE Payroll
                    SET days_present = ?, gross_salary = ?
                    WHERE payroll_id = ?
                ''', (days_present, gross_salary, row['payroll_id']))
            else:
                cursor.execute('''
                    INSERT INTO Payroll (emp_id, month, year, days_present, gross_salary)
                    VALUES (?, ?, ?, ?, ?)
                ''', (emp_id, month_val, year_val, days_present, gross_salary))
            
            generated_count += 1
            
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': f'Payroll generated successfully for {generated_count} employees for {month}.',
            'generated_count': generated_count
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payroll_bp.route('/payroll/<int:payroll_id>/pay', methods=['POST'])
def mark_paid(payroll_id):
    """
    Mark a specific payroll line item as Paid.
    """
    data = request.json or {}
    payment_date = data.get('payment_date') or ""
    
    try:
        PAID_PAYROLLS.add(payroll_id)
        PAID_DATES[payroll_id] = payment_date
        return jsonify({'message': 'Payroll item paid successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
