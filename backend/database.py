import sqlite3
import os

DATABASE_NAME = 'employee.db'

def get_db_connection():
    """
    Creates a connection to the SQLite database.
    Enable Row factory to allow accessing columns by name like dicts.
    """
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Initializes the SQLite database with required tables.
    PASTE YOUR GOOGLE COLAB TABLE CREATION SQL SCRIPTS HERE!
    """
    print("Initializing database...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
CREATE TABLE IF NOT EXISTS Employee (
    emp_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    daily_salary REAL NOT NULL,
    joining_date TEXT
)
""")

    cursor.execute("""
CREATE TABLE IF NOT EXISTS Attendance (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER,
    attendance_date TEXT,
    status TEXT CHECK(status IN ('Present','Absent')),
    FOREIGN KEY(emp_id) REFERENCES Employee(emp_id)
)
""")

    cursor.execute("""
CREATE TABLE IF NOT EXISTS Payroll (
    payroll_id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER,
    month INTEGER,
    year INTEGER,
    days_present INTEGER,
    gross_salary REAL,
    FOREIGN KEY(emp_id) REFERENCES Employee(emp_id)
)
""")
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

if __name__ == '__main__':
    init_db()
