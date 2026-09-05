import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { UserPlus, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

export function Signup() {
  const [role, setRole] = useState('SALES_REP');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier.trim()) {
      setError('User Role ID is required (e.g. sales_rep_2, customer4)');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const cleanId = identifier.trim().toLowerCase();
      const res = await authService.signup({
        name: role.replace(/_/g, ' '),
        role,
        identifier: cleanId,
        email: `${cleanId}@dealflow360.com`,
        password,
        phone: phone || null
      });

      if (res.success) {
        setSuccess('User created successfully! Automatically signing in...');
        const user = await login(cleanId, password);
        const customerProfile = {
          id: res.data?.user?.id || user?.id,
          name: res.data?.user?.name || cleanId,
          email: res.data?.user?.email || `${cleanId}@dealflow360.com`,
          role: user?.role || role,
          customerId: res.data?.user?.customerId,
          companyName: res.data?.user?.companyName || (cleanId.charAt(0).toUpperCase() + cleanId.slice(1) + ' Inc.')
        };
        localStorage.setItem('dealflow360_portal_user', JSON.stringify(customerProfile));
        setTimeout(() => {
          if (user.role === 'CUSTOMER') {
            navigate('/portal/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-[#1565C0] flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-md">
          360
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">Create Platform Account</h2>
        <p className="mt-1 text-xs uppercase font-bold text-slate-500 tracking-wider">
          DealFlow360 Autonomous Sales Operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-md border border-slate-200 rounded-xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-md font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 font-medium bg-white focus:ring-1 focus:ring-[#1565C0]"
              >
                <option value="SALES_REP">Sales Representative (Internal)</option>
                <option value="SALES_MANAGER">Sales Manager (Internal)</option>
                <option value="FINANCE">Finance Approver (Internal)</option>
                <option value="ADMIN">System Administrator</option>
                <option value="CUSTOMER">Customer Partner (External)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Role User ID (No personal names)
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:ring-1 focus:ring-[#1565C0]"
                placeholder="e.g. sales_rep_west, customer4, finance_lead"
              />
              <p className="text-[10px] text-slate-400 mt-1">This role identifier will be your permanent login ID.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:ring-1 focus:ring-[#1565C0]"
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Contact Phone <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:ring-1 focus:ring-[#1565C0]"
                placeholder="+91 9876543210"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-bold text-white bg-[#1565C0] hover:bg-[#0D47A1] transition shadow-xs disabled:opacity-50"
            >
              {loading ? 'Creating & Authenticating...' : 'Auto-Create User & Enter Workspace'}
            </button>
          </form>

          <div className="mt-5 text-center border-t border-slate-100 pt-4">
            <Link to="/login" className="text-xs font-bold text-blue-600 hover:text-blue-800">
              ← Already have an account? Return to Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const [identifier, setIdentifier] = useState('customer1');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!identifier.trim()) {
      setError('Please provide your Role / User ID');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword({
        identifier: identifier.trim(),
        newPassword: newPassword || 'Password123!'
      });
      setMessage(res.message || 'Password reset successfully.');
    } catch (err) {
      setError(err.message || 'Password reset failed. Account not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-[#1565C0] flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-md">
          360
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">Password Recovery</h2>
        <p className="mt-1 text-xs uppercase font-bold text-slate-500 tracking-wider">
          DealFlow360 Security Verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-md border border-slate-200 rounded-xl sm:px-10">
          {message && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-md mb-4 flex items-start gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
              <div>
                <p>{message}</p>
                <Link to="/login" className="mt-1 inline-block font-bold text-blue-700 underline">
                  Return to Log In →
                </Link>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md mb-4 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                User Role / Identifier
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:ring-1 focus:ring-[#1565C0]"
                placeholder="e.g. sales_rep, admin, customer1, customer2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                New Password <span className="text-slate-400 font-normal">(Leave blank to reset to Password123!)</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:ring-1 focus:ring-[#1565C0]"
                placeholder="New password (min 6 characters)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-md text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 transition shadow-xs disabled:opacity-50"
            >
              {loading ? 'Updating Credentials...' : 'Reset User Password'}
            </button>
          </form>

          <div className="mt-5 text-center border-t border-slate-100 pt-4">
            <Link to="/login" className="text-xs font-bold text-blue-600 hover:text-blue-800">
              ← Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
