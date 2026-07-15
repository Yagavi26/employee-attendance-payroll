export interface Employee {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  joining_date: string;
  salary: number;
  status: 'Active' | 'Inactive';
}

export interface AttendanceRecord {
  id?: number;
  employee_id: number;
  employee_name?: string;
  department?: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
  check_in?: string;
  check_out?: string;
}

export interface PayrollRecord {
  id?: number;
  employee_id: number;
  employee_name?: string;
  department?: string;
  designation?: string;
  month: string; // YYYY-MM
  base_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: 'Paid' | 'Unpaid';
  payment_date?: string;
}

export interface AttendanceReport {
  id: number;
  name: string;
  department: string;
  total_days: number;
  attended_days: number;
  percentage: number;
}

export interface HighestPaidReport {
  id: number;
  name: string;
  department: string;
  designation: string;
  salary: number;
}

export interface DepartmentReport {
  department: string;
  headcount: number;
  total_salary: number;
  avg_salary: number;
}
