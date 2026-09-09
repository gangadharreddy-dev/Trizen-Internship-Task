import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Camera, AlertCircle, Shield, Users, Mail, Lock, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/team/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* ── Full-Bleed Dark Floral Background ── */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: 'url(/splash_bg.jpg)',
        }}
      />

      {/* ── Multi-Layer Dark Vignette & Atmospheric Glow ── */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/85" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.16) 0%, transparent 60%),
            radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.12) 0%, transparent 60%)
          `,
        }}
      />

      {/* ── Floating Centered Glassmorphism Card ── */}
      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="bg-slate-950/75 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 text-white transition-all duration-300">
          
          {/* Brand Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-600 to-amber-400 border border-white/20 shadow-lg shadow-blue-950/60 mb-1">
              <Camera className="w-7 h-7 text-white stroke-[1.75]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              PhotoShare
            </h1>

            <p className="text-xs text-slate-300 font-medium tracking-wide">
              Welcome Back • Sign in to your account
            </p>
          </div>

          {/* Quick Demo Credentials */}
          <div className="mb-5 p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90 text-center">
              ⚡ Quick Demo Credentials
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@photoshare.com', 'AdminPassword123!')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 text-blue-300 text-xs font-semibold transition-all shadow-sm active:scale-98"
              >
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('rahul@photoshare.com', 'TeamPassword123!')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-semibold transition-all shadow-sm active:scale-98"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Team Member</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-black/30 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/30 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('For demo, click one of the quick credential buttons above or register.')}
                className="text-amber-300 hover:text-amber-200 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center pt-5 mt-5 border-t border-white/10">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-300 hover:text-amber-200 font-semibold transition-colors">
                Register
              </Link>
            </p>
          </div>

          <div className="pt-3 text-center">
            <p className="text-[11px] text-slate-400/80 leading-relaxed">
              Customer looking for your event photos? Open your direct gallery link & enter your PIN. No account needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
