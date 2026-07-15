import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarCheck, 
  FileSpreadsheet, 
  BarChart3, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Eye, 
  EyeOff, 
  Lock, 
  Bell, 
  Check, 
  RefreshCw 
} from 'lucide-react';

import { Employee, AttendanceRecord, PayrollRecord } from './types';
import Dashboard from './components/Dashboard';
import EmployeeManagement from './components/EmployeeManagement';
import Attendance from './components/Attendance';
import Payroll from './components/Payroll';
import Reports from './components/Reports';
import Settings from './components/Settings';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('admin');
  const [passwordInput, setPasswordInput] = useState<string>('password');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active View / Page Route
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [quickAction, setQuickAction] = useState<string>('');

  // Primary Data Collections
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State Change Triggers (Primitives to prevent infinite useEffect loops)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fetch all records from SQLite on trigger change
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [empRes, attRes, payRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/attendance'),
          fetch('/api/payroll')
        ]);

        const [empData, attData, payData] = await Promise.all([
          empRes.json(),
          attRes.json(),
          payRes.json()
        ]);

        if (Array.isArray(empData)) {
          setEmployees(empData);
        } else {
          console.error("empData is not an array:", empData);
          setEmployees([]);
        }

        if (Array.isArray(attData)) {
          setAttendance(attData);
        } else {
          console.error("attData is not an array:", attData);
          setAttendance([]);
        }

        if (Array.isArray(payData)) {
          setPayroll(payData);
        } else {
          console.error("payData is not an array:", payData);
          setPayroll([]);
        }
      } catch (err) {
        console.error("Error synchronizing SQLite database files:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, refreshTrigger]);

  // Database Mutation Proxies
  const handleAddEmployee = async (newEmp: Employee) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmp)
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to append employee:", err);
    }
  };

  const handleUpdateEmployee = async (id: number, updated: Employee) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to update employee profile:", err);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to delete employee profile:", err);
    }
  };

  const handleMarkAttendance = async (record: AttendanceRecord) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to mark attendance logs:", err);
    }
  };

  const handleGeneratePayroll = async (month: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month })
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to compile payroll metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaySalary = async (id: number) => {
    const todayISO = new Date().toISOString().split('T')[0];
    try {
      const res = await fetch(`/api/payroll/${id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_date: todayISO })
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to disburse pay settlement:", err);
    }
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim().toLowerCase() === 'admin' && passwordInput === 'password') {
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError('Invalid username or password. Use "admin" / "password" for immediate login!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  const triggerQuickAction = (action: string) => {
    setQuickAction(action);
    setCurrentView('employee');
  };

  // Render Login Layout if Unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4">
        <main className="w-full max-w-[440px] transition-all">
          <div className="bg-white rounded-2xl p-10 flex flex-col border border-gray-200/50 shadow-md">
            {/* Corporate Logo */}
            <div className="flex justify-center mb-8">
              <div className="h-16 w-16 bg-blue-700/5 rounded-2xl flex items-center justify-center">
                <img 
                  className="h-10 w-10 object-contain" 
                  alt="Corporate HR Logo" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-Vvv_nbzP-7cjnpipZyqleYoWytr88Oi6ZYXSHQFMEdG3fn_TUzASIYOptPVHXNVzCqBUL0LyNg5QFaAt_2wpxTsvSehJpq6kKMcMt_3gpHn7MsjU3i7050XljoKaNkjor6xMvxAGY5oby9kttrMp7xktvefrJDparzZEMarm1RziAX2Gzs5L5p2sjYcDLlojO4cJ7l7CbW8-dwKL2UUhqyacL4aVVSyLgV0SlbsWMprxsiIrMOgMvw"
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-sm text-gray-500">Please enter your details to sign in</p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-xs font-semibold leading-relaxed">
                {loginError}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block" htmlFor="username">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/30 text-sm text-gray-900 focus:outline-none focus:border-blue-700 transition"
                    id="username"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter your username"
                    type="text"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-gray-200 bg-gray-50/30 text-sm text-gray-900 focus:outline-none focus:border-blue-700 transition"
                    id="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-700 transition"
                    type="button"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember and Forgot */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500 transition-all" type="checkbox" defaultChecked />
                  <span className="text-gray-500 font-medium group-hover:text-gray-800">Remember Me</span>
                </label>
                <a className="text-blue-700 font-bold hover:underline" href="#" onClick={(e) => { e.preventDefault(); alert('Default credentials are admin / password!'); }}>Forgot Password?</a>
              </div>

              {/* Login Button */}
              <button
                className="w-full bg-blue-700 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-800 transition shadow-md shadow-blue-700/10 flex items-center justify-center gap-2"
                type="submit"
              >
                <span>Login</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </form>

            {/* SSO Breakline */}
            <div className="mt-8 flex flex-col items-center">
              <div className="relative w-full flex items-center justify-center mb-6">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="absolute bg-white px-3 text-[10px] font-bold text-gray-400 uppercase">OR SIGN IN WITH</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3.5 w-full">
                <button 
                  onClick={() => setIsAuthenticated(true)}
                  className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 transition"
                >
                  <img alt="Google" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2GMp2vZJYeEKJ2iuUxD6bhQvSUDdxw3_xknzSZPYD9ASNJhVW506zlTAimYEGiYnlYWUEtjvtXXxXrap3mMVQnTQv3WXTHuhciq3O8v_yQcUtTBO4Do6FuCJyR6qVHRYXajPnKG8Tr7r3jSqJBdD6uTasfopBNni-CeqLAfNpwvRshal_UKSS2G0PmgZ9CywAZNkS51cswlIzftMgNwgKyGdytj8VprDeJhXnqbRTKUpa12G2cyAljg"/>
                  <span>Google</span>
                </button>
                <button 
                  onClick={() => setIsAuthenticated(true)}
                  className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-bold text-gray-600 transition"
                >
                  <span className="text-gray-500 font-mono text-base leading-none">❖</span>
                  <span>Microsoft</span>
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <footer className="mt-8 text-center text-xs text-gray-400 font-medium">
            © 2026 HR Portal Enterprise Suite. All rights reserved.
          </footer>
        </main>
      </div>
    );
  }

  // Navigation Items
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'employee', name: 'Employee Profiles', icon: Users },
    { id: 'attendance', name: 'Attendance log', icon: CalendarCheck },
    { id: 'payroll', name: 'Payroll lists', icon: FileSpreadsheet },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-700/5 rounded-lg flex items-center justify-center">
            <img 
              className="h-6 w-6 object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-Vvv_nbzP-7cjnpipZyqleYoWytr88Oi6ZYXSHQFMEdG3fn_TUzASIYOptPVHXNVzCqBUL0LyNg5QFaAt_2wpxTsvSehJpq6kKMcMt_3gpHn7MsjU3i7050XljoKaNkjor6xMvxAGY5oby9kttrMp7xktvefrJDparzZEMarm1RziAX2Gzs5L5p2sjYcDLlojO4cJ7l7CbW8-dwKL2UUhqyacL4aVVSyLgV0SlbsWMprxsiIrMOgMvw" 
              alt="HR Portal Logo" 
            />
          </div>
          <span className="font-bold text-gray-900 text-sm hidden sm:inline-block">HR Portal Enterprise Suite</span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Synchronize indicator */}
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-gray-50 rounded-lg transition"
            title="Sync SQLite db"
          >
            <RefreshCw size={17} className={isLoading ? 'animate-spin text-blue-700' : ''} />
          </button>

          {/* Profile pill */}
          <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
            <div className="h-8 w-8 bg-blue-700 text-white rounded-full flex items-center justify-center text-xs font-bold uppercase">
              AD
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-900 leading-none">Super Administrator</p>
              <p className="text-[10px] text-gray-400 leading-none mt-1">admin@company.com</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
            title="Settle out & logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex flex-1 relative">
        {/* Sticky Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col justify-between py-6 sticky top-16 h-[calc(100vh-64px)] shrink-0 z-30">
          <div className="space-y-1.5 px-4">
            {menuItems.map(item => {
              const IconComp = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setQuickAction('');
                  }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-700 text-white shadow-xs' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComp size={18} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Database Footer Indicator */}
          <div className="px-6 py-4 border-t border-gray-100 mx-4">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <div>
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Local SQLite</p>
                <p className="text-[9px] text-gray-400 mt-0.5">employee.db connected</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Container */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-hidden">
          {/* Mobile bottom navigation fallback bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 z-40 shadow-lg">
            {menuItems.map(item => {
              const IconComp = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setQuickAction('');
                  }}
                  className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-3.5 rounded-lg transition ${
                    isActive ? 'text-blue-700' : 'text-gray-400'
                  }`}
                >
                  <IconComp size={16} />
                  <span className="hidden sm:inline">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Live Router Switch */}
          <div className="pb-16 lg:pb-0">
            {currentView === 'dashboard' && (
              <Dashboard 
                employees={employees} 
                attendance={attendance} 
                payroll={payroll} 
                setView={setCurrentView} 
                triggerQuickAction={triggerQuickAction}
              />
            )}
            {currentView === 'employee' && (
              <EmployeeManagement 
                employees={employees} 
                onAddEmployee={handleAddEmployee} 
                onUpdateEmployee={handleUpdateEmployee} 
                onDeleteEmployee={handleDeleteEmployee}
                quickActionTrigger={quickAction}
                clearQuickAction={() => setQuickAction('')}
              />
            )}
            {currentView === 'attendance' && (
              <Attendance 
                employees={employees} 
                attendance={attendance} 
                onMarkAttendance={handleMarkAttendance}
                isLoading={isLoading}
              />
            )}
            {currentView === 'payroll' && (
              <Payroll 
                employees={employees} 
                payroll={payroll} 
                onGeneratePayroll={handleGeneratePayroll} 
                onPaySalary={handlePaySalary}
                isLoading={isLoading}
              />
            )}
            {currentView === 'reports' && <Reports />}
            {currentView === 'settings' && <Settings />}
          </div>
        </main>
      </div>
    </div>
  );
}
