import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award, GraduationCap, Building2, CalendarRange, TrendingUp, DollarSign } from 'lucide-react';
import { AttendanceReport, HighestPaidReport, DepartmentReport } from '../types';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'salaries' | 'departments'>('attendance');
  const [attendanceData, setAttendanceData] = useState<AttendanceReport[]>([]);
  const [salariesData, setSalariesData] = useState<HighestPaidReport[]>([]);
  const [departmentsData, setDepartmentsData] = useState<DepartmentReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch report data
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'attendance') {
        const res = await fetch('/api/reports/attendance');
        const data = await res.json();
        setAttendanceData(data);
      } else if (activeTab === 'salaries') {
        const res = await fetch('/api/reports/highest-paid');
        const data = await res.json();
        setSalariesData(data);
      } else {
        const res = await fetch('/api/reports/departments');
        const data = await res.json();
        setDepartmentsData(data);
      }
    } catch (e) {
      console.error("Error fetching report summaries:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  // Color arrays for dynamic Recharts palettes
  const COLORS = ['#1e40af', '#0058be', '#2170e4', '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Workforce Analytics Reports</h1>
          <p className="text-sm text-gray-500">Examine automated charts and SQLite aggregates on attendance frequency, highest earners, and department expenditures.</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'attendance'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <CalendarRange size={16} />
            <span>Attendance Rate %</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('salaries')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'salaries'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <TrendingUp size={16} />
            <span>Highest Paid Employees</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'departments'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <Building2 size={16} />
            <span>Department summaries</span>
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3">Compiling SQLite analytical aggregates...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Attendance Report Tab */}
          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Chart */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs lg:col-span-2 space-y-4">
                <h3 className="font-bold text-gray-950 text-base">Roster Attended Days Rate %</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} tickLine={false} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                      <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 2: List */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="font-bold text-gray-950 text-base">Attendance Percent Rankings</h3>
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                  {attendanceData.map((emp) => (
                    <div key={emp.id} className="py-2.5 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.department}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        emp.percentage >= 90 ? 'bg-emerald-50 text-emerald-700' :
                        emp.percentage >= 75 ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {emp.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Highest Paid salaries Tab */}
          {activeTab === 'salaries' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Chart */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs lg:col-span-2 space-y-4">
                <h3 className="font-bold text-gray-950 text-base">Top Earners Comparison Chart (₹)</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salariesData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Salary']} />
                      <Bar dataKey="salary" radius={[0, 4, 4, 0]}>
                        {salariesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 2: High earners List */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="font-bold text-gray-950 text-base">Top 10 Salary Tier Registry</h3>
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                  {salariesData.map((emp, index) => (
                    <div key={emp.id} className="py-2.5 flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">#{index + 1}</span>
                        <div>
                          <p className="font-bold text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.designation}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">₹{emp.salary.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Department summary Tab */}
          {activeTab === 'departments' && (
            <div className="space-y-6">
              {/* Top Summary Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {departmentsData.map((dept, index) => (
                  <div key={dept.department} className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{dept.department}</span>
                      <Building2 className="text-gray-400" size={16} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-gray-100">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Headcount</p>
                        <p className="text-base font-bold text-gray-900 mt-0.5">{dept.headcount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Total Pay</p>
                        <p className="text-base font-bold text-emerald-700 mt-0.5">₹{Math.round(dept.total_salary / 1000)}k</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase">Average Pay</p>
                        <p className="text-base font-bold text-blue-700 mt-0.5">₹{Math.round(dept.avg_salary / 1000)}k</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Headcount breakdown chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Department Expenses */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
                  <h3 className="font-bold text-gray-950 text-base">Salary Expenditures by Division (₹)</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentsData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="department" stroke="#9ca3af" fontSize={11} tickLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Budget']} />
                        <Bar dataKey="total_salary" fill="#1e40af" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Headcount distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
                  <h3 className="font-bold text-gray-950 text-base">Corporate Headcount Distribution (%)</h3>
                  <div className="h-72 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="headcount"
                          nameKey="department"
                        >
                          {departmentsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} active employee(s)`, 'Count']} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
