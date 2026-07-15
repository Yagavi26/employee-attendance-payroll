import React from 'react';
import { Users, IndianRupee, CalendarCheck, TrendingUp, UserPlus, FileSpreadsheet, PlusCircle } from 'lucide-react';
import { Employee, AttendanceRecord, PayrollRecord } from '../types';

interface DashboardProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  setView: (view: string) => void;
  triggerQuickAction: (action: string) => void;
}

export default function Dashboard({ employees, attendance, payroll, setView, triggerQuickAction }: DashboardProps) {
  // 1. Calculate Metrics
  const totalEmployees = Array.isArray(employees) ? employees.length : 0;
  const activeEmployees = Array.isArray(employees) ? employees.filter(e => e && e.status === 'Active').length : 0;
  const totalPayrollBudget = Array.isArray(employees)
    ? employees
        .filter(e => e && e.status === 'Active')
        .reduce((sum, e) => sum + (e.salary || 0), 0)
    : 0;

  // Today's Date
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = Array.isArray(attendance) ? attendance.filter(a => a && a.date === todayStr) : [];
  const presentOrLateCount = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  
  const attendancePercentage = todayAttendance.length > 0 
    ? Math.round((presentOrLateCount / todayAttendance.length) * 100) 
    : 100; // default rate if not logged yet is 100%

  // Recent 5 employees
  const recentEmployees = Array.isArray(employees) ? [...employees].slice(0, 4) : [];

  // Recent payroll entries
  const recentPayroll = Array.isArray(payroll) ? [...payroll].filter(p => p && p.status === 'Paid').slice(0, 3) : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">Welcome back, Administrator</h1>
        <p className="text-sm text-gray-500">Here's an overview of your organization's workforce health and payroll status for today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Employees */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Headcount</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalEmployees}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {activeEmployees} active / {totalEmployees - activeEmployees} inactive
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Users size={24} />
          </div>
        </div>

        {/* Total Salary Expense */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Base Budget</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              ₹{totalPayrollBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-gray-500 mt-1">For active headcount</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <IndianRupee size={24} />
          </div>
        </div>

        {/* Today's Attendance Rate */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Attendance</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{attendancePercentage}%</h3>
            <p className="text-xs text-blue-600 font-medium mt-1">
              {todayAttendance.length > 0 
                ? `${presentOrLateCount} of ${todayAttendance.length} checked-in` 
                : 'No logs for today yet'}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <CalendarCheck size={24} />
          </div>
        </div>

        {/* Average Salary */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Pay Rate</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              ₹{totalEmployees > 0 ? Math.round(totalPayrollBudget / activeEmployees).toLocaleString() : '0'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Per active resource</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Grid: Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Operations</h2>
          <div className="space-y-3">
            <button
              onClick={() => triggerQuickAction('add-employee')}
              className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Add New Employee</h4>
                  <p className="text-xs text-gray-500">Register new hire records</p>
                </div>
              </div>
              <PlusCircle size={16} className="text-gray-400" />
            </button>

            <button
              onClick={() => setView('attendance')}
              className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Mark Attendance</h4>
                  <p className="text-xs text-gray-500">Log clock-in rosters</p>
                </div>
              </div>
              <PlusCircle size={16} className="text-gray-400" />
            </button>

            <button
              onClick={() => setView('payroll')}
              className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Generate Payroll</h4>
                  <p className="text-xs text-gray-500">Run monthly calculations</p>
                </div>
              </div>
              <PlusCircle size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Recent Employees */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Newly Onboarded</h2>
            <button onClick={() => setView('employee')} className="text-xs text-blue-600 font-semibold hover:underline">
              View All
            </button>
          </div>
          {recentEmployees.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No employee records registered yet.</p>
          ) : (
            <div className="overflow-hidden border border-gray-100 rounded-lg">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {recentEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{emp.name}</div>
                          <div className="text-xs text-gray-400">{emp.designation}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{emp.department}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ₹{(emp.salary || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Disbursed Payroll */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Completed Disbursals</h2>
          <button onClick={() => setView('payroll')} className="text-xs text-blue-600 font-semibold hover:underline">
            Manage Payroll
          </button>
        </div>
        {recentPayroll.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-100 rounded-lg">
            No payments settled in this period.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {recentPayroll.map(p => (
              <div key={p.id} className="p-4 border border-emerald-100 bg-emerald-50/20 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-md">Paid</span>
                    <span className="text-xs text-gray-400 font-mono">{p.payment_date}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mt-2 text-sm">{p.employee_name}</h4>
                  <p className="text-xs text-gray-500">{p.designation} • {p.month}</p>
                </div>
                <div className="mt-4 flex justify-between items-end border-t border-emerald-100/50 pt-2">
                  <span className="text-xs text-gray-400">Net Settled</span>
                  <span className="text-sm font-bold text-gray-900">₹{p.net_salary.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
