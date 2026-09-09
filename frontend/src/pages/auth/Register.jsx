import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Camera, Lock, Mail, User as UserIcon, AlertCircle, ArrowRight, Shield } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const user = await register(name, email, password, role);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/team/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
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

      {/* ── Multi-Layer Dark Vignette & Glow ── */}
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

      {/* ── Centered Glassmorphism Card ── */}
      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="bg-slate-950/75 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 text-white">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-600 to-amber-400 border border-white/20 shadow-lg shadow-blue-950/60 mb-1">
              <Camera className="w-7 h-7 text-white stroke-[1.75]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Create an Account
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              Join PhotoShare as Studio Admin or Team Photographer
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-black/30 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@photoshare.com"
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
                  placeholder="At least 6 characters"
                  className="w-full bg-black/30 border border-white/15 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    role === 'ADMIN'
                      ? 'border-blue-400/50 bg-blue-500/20 text-blue-300 shadow-sm'
                      : 'border-white/10 bg-black/30 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Admin / Lead</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('TEAM_MEMBER')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    role === 'TEAM_MEMBER'
                      ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-sm'
                      : 'border-white/10 bg-black/30 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                  <span>Team Member</span>
                </button>
              </div>
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
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-300 hover:text-amber-200 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
