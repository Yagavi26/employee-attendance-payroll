import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, SlidersHorizontal, UserPlus, Phone, Mail, IndianRupee, Calendar } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeManagementProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (id: number, employee: Employee) => void;
  onDeleteEmployee: (id: number) => void;
  quickActionTrigger?: string;
  clearQuickAction?: () => void;
}

export default function EmployeeManagement({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  quickActionTrigger,
  clearQuickAction
}: EmployeeManagementProps) {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(quickActionTrigger === 'add-employee');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form local state
  const initialFormState = {
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    joining_date: new Date().toISOString().split('T')[0],
    salary: 5000,
    status: 'Active' as const
  };
  const [form, setForm] = useState(initialFormState);

  // Sync quick action additions
  React.useEffect(() => {
    if (quickActionTrigger === 'add-employee') {
      setIsAddModalOpen(true);
      if (clearQuickAction) clearQuickAction();
    }
  }, [quickActionTrigger]);

  const departments = ['All', 'Engineering', 'Human Resources', 'Marketing', 'Product', 'Sales', 'Finance'];

  // Handle forms
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'salary' ? parseFloat(value) || 0 : value
    }));
  };

  const submitAddForm = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEmployee(form);
    setIsAddModalOpen(false);
    setForm(initialFormState);
  };

  const submitEditForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee && editingEmployee.id) {
      onUpdateEmployee(editingEmployee.id, form);
      setEditingEmployee(null);
    }
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department,
      designation: emp.designation,
      joining_date: emp.joining_date,
      salary: emp.salary,
      status: emp.status
    });
  };

  // Filter Logic
  const filteredEmployees = employees.filter(emp => {
    if (!emp) return false;
    const matchesSearch = (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.designation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Employee Records</h1>
          <p className="text-sm text-gray-500">Add, edit, view, or manage personnel classifications across active business units.</p>
        </div>
        <button
          onClick={() => {
            setForm(initialFormState);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm transition"
        >
          <UserPlus size={16} />
          <span>Onboard Employee</span>
        </button>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, role, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700 transition"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Dept Filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-gray-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-gray-50/50 border border-gray-200 rounded-lg text-sm py-1.5 px-3 focus:outline-none focus:border-blue-700"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-50/50 border border-gray-200 rounded-lg text-sm py-1.5 px-3 focus:outline-none focus:border-blue-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12 px-4">
            <SlidersHorizontal size={36} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-900">No employees match filters</h3>
            <p className="text-sm text-gray-500 mt-1">Try broadening your queries or add new hiring profiles above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Employee Info</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Department & Role</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Onboarding Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Base Pay</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/40 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{emp.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{emp.email}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{emp.phone || 'No phone'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-800">{emp.designation}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{emp.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {emp.joining_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      ₹{(emp.salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
                          title="Edit Details"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (emp.id && confirm(`Are you sure you want to delete ${emp.name}? This will remove all linked logs.`)) {
                              onDeleteEmployee(emp.id);
                            }
                          }}
                          className="p-1.5 text-gray-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                          title="Terminate / Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Employee */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Onboard New Employee</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={submitAddForm} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="E.g. Alan Turing"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Corporate Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="+1 555-0100"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Department *</label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  >
                    {departments.slice(1).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Designation / Role *</label>
                  <input
                    type="text"
                    name="designation"
                    required
                    value={form.designation}
                    onChange={handleInputChange}
                    placeholder="E.g. Senior Software Engineer"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Hiring / Joining Date *</label>
                  <input
                    type="date"
                    name="joining_date"
                    required
                    value={form.joining_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Basic Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    name="salary"
                    required
                    min="0"
                    value={form.salary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status *</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                >
                  Confirm Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Employee */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Modify Employee Profile</h3>
              <button onClick={() => setEditingEmployee(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={submitEditForm} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Corporate Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Department *</label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  >
                    {departments.slice(1).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Designation / Role *</label>
                  <input
                    type="text"
                    name="designation"
                    required
                    value={form.designation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Hiring / Joining Date *</label>
                  <input
                    type="date"
                    name="joining_date"
                    required
                    value={form.joining_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Basic Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    name="salary"
                    required
                    min="0"
                    value={form.salary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status *</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
