import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import portalService from '../../services/portalService';
import { Shield, Lock, ArrowRight, UserCheck } from 'lucide-react';

export function CustomerPortalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setEmail('customer1@dealflow360.com');
    setPassword('Password123!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Try unified auth context
      try {
        const authUser = await login(email.trim(), password);
        if (authUser && authUser.role === 'CUSTOMER') {
          localStorage.setItem('dealflow360_portal_user', JSON.stringify(authUser));
          navigate('/portal/dashboard');
          return;
        }
      } catch (authErr) {
        // Continue to dedicated portalService fallback
      }

      // 2. Fall back to portalService
      const res = await portalService.login(email.trim(), password);
      if (res.success && res.data) {
        localStorage.setItem('dealflow360_token', res.data.token);
        localStorage.setItem('dealflow360_user', JSON.stringify(res.data.user));
        localStorage.setItem('dealflow360_primary_role', 'CUSTOMER');
        localStorage.setItem('dealflow360_portal_user', JSON.stringify(res.data.user));
        window.location.href = '/portal/dashboard';
      } else {
        throw new Error(res.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Customer authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-[#1565C0] flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-md">
          360
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">Customer Procurement Portal</h2>
        <p className="mt-1 text-xs uppercase font-semibold text-slate-500 tracking-wider">
          DealFlow360 Partner Negotiation & Order Acceptance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer1@dealflow360.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1565C0]"
                />
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1565C0]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md text-sm font-bold text-white bg-[#1565C0] hover:bg-[#0D47A1] transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Log In to Customer Portal'}
            </button>

            {/* Quick Demo Credential Filler */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-medium text-slate-500 hover:text-blue-600 underline"
              >
                Use Demo Customer: customer1@dealflow360.com / Password123!
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <Link to="/login" className="text-xs font-bold text-blue-600 hover:text-blue-800">
              ← Return to Main Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerPortalLogin;
