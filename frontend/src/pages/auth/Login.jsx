import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import {
  Shield,
  UserCheck,
  Building2,
  Users,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound
} from 'lucide-react';

export function Login() {
  // 3 Category Tabs: 'INTERNAL' | 'ADMIN' | 'CUSTOMER'
  const [activeCategory, setActiveCategory] = useState('INTERNAL');
  
  // View mode: 'LOGIN' | 'FORGOT'
  const [viewMode, setViewMode] = useState('LOGIN');

  // Internal User Selection via Dropdown (Only Sales Rep, Sales Manager, Finance)
  const internalRoles = [
    { label: 'Sales Representative', id: 'sales_rep', defaultEmail: 'sales_rep@dealflow360.com' },
    { label: 'Sales Manager', id: 'sales_manager', defaultEmail: 'sales_manager@dealflow360.com' },
    { label: 'Finance', id: 'finance', defaultEmail: 'finance@dealflow360.com' }
  ];

  const [selectedRole, setSelectedRole] = useState('sales_rep');

  // Login Form States - strictly empty by default with placeholders until user manually types
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation States
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle Tab Switch - strictly clear all fields and errors
  const handleCategorySwitch = (cat) => {
    setActiveCategory(cat);
    setAuthError('');
    setErrors({});
    setIdentifier('');
    setPassword('');
    if (cat === 'INTERNAL') {
      setSelectedRole('sales_rep');
    }
  };

  // Form Validation
  const validateLoginForm = () => {
    const errs = {};
    if (!identifier.trim()) {
      errs.identifier = 'Email ID is required';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const user = await login(identifier.trim(), password);
      if (user.role === 'CUSTOMER') {
        navigate('/portal/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotSuccessMessage('');
    setAuthError('');

    if (!forgotIdentifier.trim()) {
      setAuthError('Please enter your User ID or Role ID');
      return;
    }

    setForgotLoading(true);
    try {
      const payload = {
        identifier: forgotIdentifier.trim(),
        newPassword: forgotNewPassword || 'Password123!'
      };
      const res = await authService.forgotPassword(payload);
      setForgotSuccessMessage(res.message || 'Password reset successful. You may now log in.');
      setIdentifier(forgotIdentifier.trim());
      setPassword(forgotNewPassword || 'Password123!');
    } catch (err) {
      setAuthError(err.message || 'Unable to reset password for this user ID.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-[#1565C0] flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-md">
          360
        </div>
        <h2 className="mt-3 text-2xl font-black text-slate-900 tracking-tight">DealFlow360</h2>
        <p className="mt-0.5 text-xs uppercase font-bold text-slate-500 tracking-wider">
          Self-Governing B2B Sales Operations
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-7 px-6 shadow-md border border-slate-200 rounded-xl sm:px-8">
          
          {/* Top 3 Category Buttons: Internal Users | Admin | Customer */}
          <div className="mb-6">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select User Portal:
            </div>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => { handleCategorySwitch('INTERNAL'); setViewMode('LOGIN'); }}
                className={`py-2 px-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  activeCategory === 'INTERNAL'
                    ? 'bg-[#1565C0] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="truncate">Internal Users</span>
              </button>

              <button
                type="button"
                onClick={() => { handleCategorySwitch('ADMIN'); setViewMode('LOGIN'); }}
                className={`py-2 px-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  activeCategory === 'ADMIN'
                    ? 'bg-[#1565C0] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="truncate">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => { handleCategorySwitch('CUSTOMER'); setViewMode('LOGIN'); }}
                className={`py-2 px-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  activeCategory === 'CUSTOMER'
                    ? 'bg-[#1565C0] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate">Customer</span>
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          {forgotSuccessMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-md flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
              <div>
                <p className="font-semibold">{forgotSuccessMessage}</p>
                <button
                  type="button"
                  onClick={() => { setViewMode('LOGIN'); setForgotSuccessMessage(''); }}
                  className="mt-1 text-blue-700 underline font-bold"
                >
                  Proceed to Log In with updated credentials →
                </button>
              </div>
            </div>
          )}

          {/* 1. STANDARD LOGIN VIEW */}
          {viewMode === 'LOGIN' && (
            <form className="space-y-4" onSubmit={handleLoginSubmit} noValidate>
              
              {/* Internal Users: Clean Dropdown Menu + Email ID Section */}
              {activeCategory === 'INTERNAL' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Select Internal Role
                    </label>
                    <div className="relative">
                      <select
                        value={selectedRole}
                        onChange={(e) => {
                          const roleVal = e.target.value;
                          setSelectedRole(roleVal);
                        }}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#1565C0] cursor-pointer"
                      >
                        {internalRoles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Email ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          if (errors.identifier) setErrors({ ...errors, identifier: '' });
                        }}
                        className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm text-slate-900 font-medium focus:outline-none focus:ring-1 ${
                          errors.identifier
                            ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                            : 'border-slate-300 focus:ring-[#1565C0]'
                        }`}
                        placeholder="Enter email ID"
                      />
                      <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    {errors.identifier && (
                      <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.identifier}</p>
                    )}
                  </div>
                </>
              )}

              {/* Admin: Email ID Field (Empty by default with placeholder) */}
              {activeCategory === 'ADMIN' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errors.identifier) setErrors({ ...errors, identifier: '' });
                      }}
                      className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm text-slate-900 font-medium focus:outline-none focus:ring-1 ${
                        errors.identifier
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-[#1565C0]'
                      }`}
                      placeholder="Enter admin ID"
                    />
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.identifier && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.identifier}</p>
                  )}
                </div>
              )}

              {/* Customer: Email ID Field (Empty by default with placeholder) */}
              {activeCategory === 'CUSTOMER' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errors.identifier) setErrors({ ...errors, identifier: '' });
                      }}
                      className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm text-slate-900 font-medium focus:outline-none focus:ring-1 ${
                        errors.identifier
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-[#1565C0]'
                      }`}
                      placeholder="Enter customer ID"
                    />
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.identifier && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.identifier}</p>
                  )}
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    className={`w-full pl-9 pr-9 py-2 border rounded-md text-sm text-slate-900 font-medium focus:outline-none focus:ring-1 ${
                      errors.password
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-[#1565C0]'
                    }`}
                    placeholder="Enter password"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center text-slate-600 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 mr-2"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('FORGOT');
                    setForgotIdentifier(identifier);
                    setAuthError('');
                    setForgotSuccessMessage('');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button (Uniform Blue across all sections) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-bold text-white bg-[#1565C0] hover:bg-[#0D47A1] transition shadow-xs disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : 'Log In'}
              </button>
            </form>
          )}

          {/* 2. FORGOT PASSWORD VIEW */}
          {viewMode === 'FORGOT' && (
            <form className="space-y-4" onSubmit={handleForgotPasswordSubmit}>
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Account Password Recovery</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter your User ID to reset or update your access credentials.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email ID
                </label>
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter email ID"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  New Password <span className="text-slate-400 font-normal">(Leave blank to reset to Password123!)</span>
                </label>
                <input
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 font-medium focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setViewMode('LOGIN'); setAuthError(''); }}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Back to Log In
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {forgotLoading ? 'Processing...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          {/* Simple Clean Sign Up Link (No big section) */}
          <div className="mt-5 pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
            <span>New user? </span>
            <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-800 underline">
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;



