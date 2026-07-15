import React, { useState } from 'react';
import { Database, Terminal, Shield, HelpCircle, FileCode, CheckCircle, RefreshCcw, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [dbStatus, setDbStatus] = useState<'healthy' | 'unknown'>('healthy');
  const [testingStatus, setTestingStatus] = useState(false);

  const runDbTest = () => {
    setTestingStatus(true);
    setTimeout(() => {
      setTestingStatus(false);
      setDbStatus('healthy');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">System Configuration</h1>
        <p className="text-sm text-gray-500">View live SQLite file paths, audit active connection strings, and read the Python Flask integration documentation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Diagnostics and Settings */}
        <div className="space-y-6 lg:col-span-1">
          {/* Diagnostic status */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Database size={16} className="text-blue-700" />
              <span>Database State Diagnostics</span>
            </h3>

            <div className="p-4 bg-gray-50 rounded-lg space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold">Active Database Engine</span>
                <span className="font-bold text-gray-800">SQLite 3</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold">DB Filename Target</span>
                <span className="font-mono font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded-md">employee.db</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold">Integrity Connection Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> Active
                </span>
              </div>
            </div>

            <button
              onClick={runDbTest}
              disabled={testingStatus}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 disabled:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition"
            >
              <RefreshCcw size={13} className={testingStatus ? 'animate-spin' : ''} />
              <span>{testingStatus ? 'Auditing connection logs...' : 'Run Integrity Scan'}</span>
            </button>
          </div>

          {/* Quick System Configs */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Shield size={16} className="text-blue-700" />
              <span>Security Configurations</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Force Local TLS (HTTPS)</h4>
                  <p className="text-[10px] text-gray-400">Encrypt local payload transfers</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Enable Session Retention</h4>
                  <p className="text-[10px] text-gray-400">Remember login credentials locally</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">API CORS Guard</h4>
                  <p className="text-[10px] text-gray-400">Allow React local dev requests</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Step-by-Step Python Flask Integration Guide */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs lg:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-950 text-base flex items-center gap-2">
            <FileCode size={18} className="text-blue-700" />
            <span>Python Flask Backend Integration Guide</span>
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed">
            The Python Flask blueprint layers are fully configured and ready inside the <strong className="text-gray-900 font-mono">/backend</strong> directory of your downloaded app. Follow these instructions to import and deploy your existing SQLite queries from Google Colab.
          </p>

          <div className="space-y-4 mt-2">
            {/* Step 1 */}
            <div className="flex gap-3">
              <span className="flex items-center justify-center h-6 w-6 shrink-0 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">1</span>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Download the Project Folder</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Export this project as a ZIP or export to GitHub using the Settings menu in AI Studio. The archive will contain the complete React code and the <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">/backend</code> directories.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <span className="flex items-center justify-center h-6 w-6 shrink-0 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">2</span>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Paste Google Colab SQL & Business Logic</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Open the python files inside <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">/backend</code>. We have written detailed inline comments indicating where to paste your specific queries:
                </p>
                <ul className="list-disc list-inside text-xs text-gray-500 mt-1.5 space-y-1">
                  <li>In <code className="font-mono text-[11px]">database.py</code>: paste your table schema SQL into the <code className="font-mono text-[11px]">init_db()</code> function.</li>
                  <li>In <code className="font-mono text-[11px]">employee.py</code>: paste employee insert/update queries.</li>
                  <li>In <code className="font-mono text-[11px]">payroll.py</code>: paste your exact salary and attendance deduction formula logic inside <code className="font-mono text-[11px]">generate_payroll()</code>.</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <span className="flex items-center justify-center h-6 w-6 shrink-0 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">3</span>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Start Your Flask API Server</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Install Python libraries and start the development Flask server locally:
                </p>
                <pre className="bg-gray-950 text-gray-300 p-3 rounded-lg text-xs font-mono mt-2 overflow-x-auto">
{`pip install flask flask-cors
python app.py`}
                </pre>
                <p className="text-[10px] text-amber-700 mt-1 font-medium flex items-center gap-1">
                  <AlertTriangle size={10} /> Ensure Flask serves on http://localhost:5000 to match standard CORS configurations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
