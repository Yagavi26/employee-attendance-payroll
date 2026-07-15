# Python Flask Backend - Employee HR Portal

This directory contains the Python Flask project structure, database layers, and API routes designed to match the React frontend. It is pre-configured to use **SQLite** as requested.

## 📁 File Structure

- `app.py`: The entry point of the server. Sets up the Flask app, CORS, registers routers, and initializes the database.
- `database.py`: Database connection helpers and schema creation logic.
- `employee.py`: Blueprint for employee CRUD (Create, Read, Update, Delete) APIs.
- `attendance.py`: Blueprint for daily attendance logs and checks.
- `payroll.py`: Blueprint for monthly payroll generation and pay cycles.
- `reports.py`: Blueprint for aggregated reporting dashboards.

---

## 🚀 How to Paste Your Google Colab Code

Follow these simple steps to integrate your existing SQLite and Python code:

### 1. Database Schema (`database.py`)
Open `database.py` and scroll to `init_db()`.
Replace or append the SQL statements inside `cursor.execute(...)` with the exact `CREATE TABLE` queries you created in Colab.

### 2. Employee Queries (`employee.py`)
In your Colab notebook, find the queries where you insert or query employees.
- Paste your SELECT query into `get_employees()`.
- Paste your INSERT query into `add_employee()`.
- Paste your UPDATE query into `update_employee()`.
- Paste your DELETE query into `delete_employee()`.

### 3. Attendance Logic (`attendance.py`)
- Paste your SQL query to fetch/join attendance records into `get_attendance()`.
- Paste your SQL query to register attendance logs into `mark_attendance()`.

### 4. Payroll Generation (`payroll.py`)
- Scroll to `generate_payroll()`.
- Paste your custom payroll calculation formulas, deduction logics, and allowances rules inside the loop. It contains clear placeholders mapping to SQLite parameters.

### 5. Report Aggregations (`reports.py`)
- Put your data analysis/SQL queries for Attendance %, Highest Earners, and Department Summaries inside the respective routes.

---

## 🛠️ How to Run Locally

### 1. Install Dependencies
You will need Python 3.x installed. Run:
```bash
pip install flask flask-cors
```

### 2. Run the App
Launch the Flask backend server:
```bash
python app.py
```
This runs the backend on `http://127.0.0.1:5000`.

---

## 🔗 Port Matching

The React frontend calls `/api/*` endpoints. 
In local development, the React frontend proxy or fetch base-URL will direct queries to `http://localhost:5000/api`.
In our AI Studio live preview, we run a unified full-stack server using Express so that the app remains fully functional in the browser environment without needing separate terminal setups.
