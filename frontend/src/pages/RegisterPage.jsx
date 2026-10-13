import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(email, password, fullName);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create student account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/[0.08] shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20 border border-primary/25">
            <Bot className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-on-surface tracking-tight">Create Student Account</h1>
          <p className="text-xs text-on-surface-variant font-sans">Join the Agentic AI Study Assistant platform</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/25 text-xs text-error font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-on-surface">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-outline absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-surface-lowest text-on-surface text-sm pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.12] focus:outline-none focus:border-primary transition font-sans placeholder:text-outline"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-on-surface">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-outline absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@university.edu"
                className="w-full bg-surface-lowest text-on-surface text-sm pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.12] focus:outline-none focus:border-primary transition font-mono placeholder:text-outline"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-on-surface">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-outline absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-lowest text-on-surface text-sm pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.12] focus:outline-none focus:border-primary transition font-mono placeholder:text-outline"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-heading font-bold text-sm shadow-lg shadow-brand-500/25 glow-button transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign Up</span>}
          </button>
        </form>

        <div className="text-center text-xs text-on-surface-variant font-sans">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
