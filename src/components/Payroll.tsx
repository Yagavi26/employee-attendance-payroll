import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Sparkles, AlertCircle, IndianRupee, ArrowUpRight, HelpCircle, FileSpreadsheet, PlayCircle } from 'lucide-react';
import { Employee, PayrollRecord } from '../types';

interface PayrollProps {
  employees: Employee[];
  payroll: PayrollRecord[];
  onGeneratePayroll: (month: string) => Promise<void>;
  onPaySalary: (id: number) => Promise<void>;
  isLoading: boolean;
}

export default function Payroll({
  employees,
  payroll,
  onGeneratePayroll,
  onPaySalary,
  isLoading
}: PayrollProps) {
  // 1. Current Month Period Selector
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  });

  const [localPayroll, setLocalPayroll] = useState<PayrollRecord[]>([]);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filter local payroll list by selectedMonth
  useEffect(() => {
    const filtered = payroll.filter(p => p.month === selectedMonth);
    setLocalPayroll(filtered);
  }, [selectedMonth, payroll]);

  // Execute Monthly Aggregations
  const handleGenerate = async () => {
    if (confirm(`Do you want to generate/recompute monthly salaries for all active employees for ${selectedMonth}? This will aggregate allowances and attendance absences.`)) {
      await onGeneratePayroll(selectedMonth);
      setSuccessBanner(`Payroll calculations settled and re-generated for the month of ${selectedMonth}.`);
      setTimeout(() => setSuccessBanner(null), 4000);
    }
  };

  const handlePayout = async (id: number, name: string) => {
    if (confirm(`Settle salary pay slip and disburse direct transfer for ${name}? This action is final.`)) {
      await onPaySalary(id);
      setSuccessBanner(`Salary disbursed and credited for ${name}!`);
      setTimeout(() => setSuccessBanner(null), 3000);
    }
  };

  // Metrics calculations for filtered month
  const totalNetOutflow = localPayroll.reduce((sum, p) => sum + p.net_salary, 0);
  const paidOutflow = localPayroll.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.net_salary, 0);
  const pendingOutflow = totalNetOutflow - paidOutflow;
  const totalEmployeesCount = employees.filter(e => e.status === 'Active').length;
  const calculationRate = totalEmployeesCount > 0 ? Math.round((localPayroll.length / totalEmployeesCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Payroll Calculations</h1>
          <p className="text-sm text-gray-500">Formulate employee allowances, calculate attendance-based deduction slashes, and disburse bank credits.</p>
        </div>

        {/* Period selection & Generation buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-700"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || totalEmployeesCount === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white text-sm font-semibold rounded-lg shadow-xs transition"
          >
            <Sparkles size={16} />
            <span>Generate / Recalculate</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <IndianRupee size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Gross Scheduled Net Outflow</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-0.5">
              ₹{totalNetOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">Calculated for {localPayroll.length} employees</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <ArrowUpRight size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Total Settled Outflow</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-0.5">
              ₹{paidOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">
              {localPayroll.filter(p => p.status === 'Paid').length} paid profiles
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Pending Settles</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-0.5">
              ₹{pendingOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="text-xs text-rose-600 font-medium mt-0.5">
              {localPayroll.filter(p => p.status === 'Unpaid').length} pending profiles
            </p>
          </div>
        </div>
      </div>

      {/* Main Payroll Grid */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Banner Alert Notification */}
        {successBanner && (
          <div className="m-4 p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-lg text-sm font-medium animate-in fade-in flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600" />
            <span>{successBanner}</span>
          </div>
        )}

        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center flex-wrap gap-2">
          <h3 className="font-bold text-gray-900 text-sm">
            Workforce Payroll Rollbook <span className="text-xs font-mono font-normal text-gray-400 bg-gray-100 py-0.5 px-2 rounded-lg ml-2">{selectedMonth}</span>
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            Generation rate: <strong className="text-gray-800">{calculationRate}%</strong> of active workforce logs
          </span>
        </div>

        {localPayroll.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileSpreadsheet size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-900">No payroll summaries found for {selectedMonth}</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              You haven't initialized salaries for this month cycle yet. Tap **"Generate / Recalculate"** to calculate records dynamically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Resource info</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Basic Pay</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Allowances (+)</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Deductions (-)</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Net Salary</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Disbursement status</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {localPayroll.map((pay) => (
                  <tr key={pay.id} className="hover:bg-gray-50/45 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{pay.employee_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{pay.designation} • {pay.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-600">
                      ₹{pay.base_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-emerald-600">
                      +₹{pay.allowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-rose-600">
                      -₹{pay.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                      ₹{pay.net_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        pay.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700 animate-pulse'
                      }`}>
                        {pay.status === 'Paid' ? `Paid (on ${pay.payment_date})` : 'Awaiting Settlement'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {pay.status === 'Unpaid' ? (
                        <button
                          onClick={() => handlePayout(pay.id!, pay.employee_name || '')}
                          className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold shadow-xs transition"
                        >
                          Disburse Credit
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold select-none">Disbursed ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Explanatory Info Tip */}
      <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex gap-3 text-xs text-gray-500">
        <HelpCircle size={20} className="text-blue-600 shrink-0" />
        <div>
          <h4 className="font-bold text-gray-700 mb-1">How deductions are formulated:</h4>
          <p>
            The automatic calculator references the **Attendance logs** during the selected period. Standard allowances represent a basic 10% premium. Any flagged **"Absent"** day triggers a paycheck penalty of 1/30th of the worker's basic salary, which is automatically subtracted before settlement disbursement.
          </p>
        </div>
      </div>
    </div>
  );
}
