import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertCircle, Clock, Save, ShieldAlert, Check } from 'lucide-react';
import { Employee, AttendanceRecord } from '../types';

interface AttendanceProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  onMarkAttendance: (record: AttendanceRecord) => void;
  isLoading: boolean;
}

export default function Attendance({
  employees,
  attendance,
  onMarkAttendance,
  isLoading
}: AttendanceProps) {
  // 1. Local Date State (default to today)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Local state for temporary unsaved edits
  const [localRecords, setLocalRecords] = useState<{ [empId: number]: Partial<AttendanceRecord> }>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active employees list
  const activeEmployees = employees.filter(e => e.status === 'Active');

  // Load existing records for selectedDate or initialize defaults
  useEffect(() => {
    const recordsForDate = attendance.filter(a => a.date === selectedDate);
    const initialRecords: { [empId: number]: Partial<AttendanceRecord> } = {};

    activeEmployees.forEach(emp => {
      const existing = recordsForDate.find(a => a.employee_id === emp.id);
      if (existing) {
        initialRecords[emp.id!] = {
          status: existing.status,
          check_in: existing.check_in,
          check_out: existing.check_out
        };
      } else {
        // Default initialized values for unmarked days
        initialRecords[emp.id!] = {
          status: 'Present',
          check_in: '09:00',
          check_out: '17:00'
        };
      }
    });

    setLocalRecords(initialRecords);
  }, [selectedDate, attendance, employees]);

  // Handle local cell updates
  const updateLocalField = (empId: number, field: string, value: string) => {
    setLocalRecords(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: value,
        // Auto-clear hours if status is Absent or On Leave
        ...(field === 'status' && (value === 'Absent' || value === 'On Leave') ? { check_in: '', check_out: '' } : {}),
        // Auto-set standard hours if status changes to Present or Late and hours are empty
        ...(field === 'status' && (value === 'Present' || value === 'Late') && !prev[empId]?.check_in ? { check_in: '09:00', check_out: '17:00' } : {})
      }
    }));
  };

  // Submit and Persist to SQLite
  const saveRecord = async (empId: number) => {
    const local = localRecords[empId];
    if (local && local.status) {
      await onMarkAttendance({
        employee_id: empId,
        date: selectedDate,
        status: local.status as any,
        check_in: local.check_in || '',
        check_out: local.check_out || ''
      });
      triggerBannerNotification(`Attendance saved for employee ID #${empId}`);
    }
  };

  const saveAll = async () => {
    const promises = Object.keys(localRecords).map(async (empIdStr) => {
      const empId = parseInt(empIdStr);
      const local = localRecords[empId];
      if (local && local.status) {
        return onMarkAttendance({
          employee_id: empId,
          date: selectedDate,
          status: local.status as any,
          check_in: local.check_in || '',
          check_out: local.check_out || ''
        });
      }
    });

    await Promise.all(promises);
    triggerBannerNotification("All attendance logs updated successfully!");
  };

  const triggerBannerNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // 2. Calculated Summaries for Selected Date
  const filteredAtt = attendance.filter(a => a.date === selectedDate);
  const totalLogged = filteredAtt.length;
  const presentCount = filteredAtt.filter(a => a.status === 'Present').length;
  const absentCount = filteredAtt.filter(a => a.status === 'Absent').length;
  const lateCount = filteredAtt.filter(a => a.status === 'Late').length;
  const leaveCount = filteredAtt.filter(a => a.status === 'On Leave').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Daily Attendance Logs</h1>
          <p className="text-sm text-gray-500">View or modify daily check-in statuses, check-out hours, and sick leave registries.</p>
        </div>

        {/* Date Picker Control */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-500">Selected Date:</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Roster Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase">Headcount</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{activeEmployees.length}</p>
        </div>
        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/40 text-center">
          <p className="text-xs font-semibold text-emerald-800 uppercase">Present</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {totalLogged > 0 ? presentCount : '-'}
          </p>
        </div>
        <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100/40 text-center">
          <p className="text-xs font-semibold text-rose-800 uppercase">Absent</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">
            {totalLogged > 0 ? absentCount : '-'}
          </p>
        </div>
        <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/40 text-center">
          <p className="text-xs font-semibold text-amber-800 uppercase">Late Arrivals</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {totalLogged > 0 ? lateCount : '-'}
          </p>
        </div>
        <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100/40 text-center col-span-2 md:col-span-1">
          <p className="text-xs font-semibold text-blue-800 uppercase">On Leave</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {totalLogged > 0 ? leaveCount : '-'}
          </p>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-gray-500 font-medium">
            {totalLogged === 0 ? (
              <span className="text-amber-700 font-bold flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-lg">
                <ShieldAlert size={15} /> Pending Attendance Logs for This Date
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg">
                <CheckCircle2 size={15} /> All logs submitted and saved
              </span>
            )}
          </div>
          <button
            onClick={saveAll}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs transition"
          >
            <Save size={16} />
            <span>Save All Roster Changes</span>
          </button>
        </div>

        {/* Attendance Banner Status */}
        {successMsg && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in">
            <Check size={16} className="text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Clock-In Hour</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Clock-Out Hour</th>
                <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {activeEmployees.map((emp) => {
                const local = localRecords[emp.id!] || {};
                const status = local.status || 'Present';
                const isUnmarked = !attendance.some(a => a.employee_id === emp.id && a.date === selectedDate);

                return (
                  <tr key={emp.id} className="hover:bg-gray-50/45 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{emp.designation}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {emp.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={status}
                        onChange={(e) => updateLocalField(emp.id!, 'status', e.target.value)}
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                          status === 'Present' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                          status === 'Absent' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                          status === 'Late' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                          'bg-blue-50 border-blue-200 text-blue-800'
                        }`}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late Arrival</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        placeholder="HH:MM"
                        disabled={status === 'Absent' || status === 'On Leave'}
                        value={local.check_in || ''}
                        onChange={(e) => updateLocalField(emp.id!, 'check_in', e.target.value)}
                        className="w-20 px-2 py-1 bg-gray-50/50 border border-gray-200 rounded-md text-sm text-center font-mono disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-blue-700"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        placeholder="HH:MM"
                        disabled={status === 'Absent' || status === 'On Leave'}
                        value={local.check_out || ''}
                        onChange={(e) => updateLocalField(emp.id!, 'check_out', e.target.value)}
                        className="w-20 px-2 py-1 bg-gray-50/50 border border-gray-200 rounded-md text-sm text-center font-mono disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-blue-700"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold">
                      <button
                        onClick={() => saveRecord(emp.id!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition"
                      >
                        <Save size={12} />
                        <span>Save Line</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
