import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cake, ShieldCheck, ArrowRight, Lock, Mail, KeyRound, Sparkles, ArrowLeft } from 'lucide-react';
import { authService, DEMO_CREDENTIALS } from '../../services/authService';

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid demo credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F0] text-[#351E28] flex flex-col justify-between font-body selection:bg-[#EAF05C]">
      
      {/* Top Bar with Return to Store */}
      <div className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#351E28] hover:text-[#FF5C34] bg-white px-4 py-2 rounded-full border border-[#351E28]/15 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#351E28] text-[#EAF05C] flex items-center justify-center">
            <Cake className="w-5 h-5" />
          </div>
          <span className="font-heading font-black text-lg text-[#351E28]">Bake & Joy</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto px-4 my-8">
        
        {/* Prominent Demo Notice Box as requested in Section 5.A */}
        <div className="mb-6 bg-[#EAF05C] border-2 border-[#351E28] rounded-3xl p-5 shadow-pop text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-heading font-black text-sm text-[#351E28] uppercase tracking-wider">
              <KeyRound className="w-4 h-4 stroke-[2.5]" />
              <span>Demo Test Credentials</span>
            </div>
            <span className="text-[10px] font-black bg-[#351E28] text-[#EAF05C] px-2 py-0.5 rounded-full uppercase">
              Evaluation
            </span>
          </div>

          <p className="text-xs text-[#351E28]/90 font-medium">
            Use these pre-configured demo credentials to access the admin portal:
          </p>

          <div className="bg-white/80 rounded-2xl p-3 border border-[#351E28]/15 text-xs font-mono space-y-1 text-[#351E28]">
            <div><strong>Email:</strong> {DEMO_CREDENTIALS.email}</div>
            <div><strong>Password:</strong> {DEMO_CREDENTIALS.password}</div>
          </div>

          <button
            type="button"
            onClick={handleFillDemoCredentials}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#351E28] hover:bg-[#4a2b38] text-[#EAF05C] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 fill-[#EAF05C]" />
            <span>Click to Auto-fill Demo Credentials</span>
          </button>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl border-2 border-[#351E28] shadow-card p-6 sm:p-8">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#D7EFFF] text-[#351E28] flex items-center justify-center mx-auto mb-3 border border-[#351E28]/15">
              <ShieldCheck className="w-6 h-6 text-[#FF5C34]" />
            </div>
            <h1 className="font-heading font-black text-2xl text-[#351E28]">
              Admin Sign In
            </h1>
            <p className="text-xs text-[#351E28]/60 mt-1">
              Store inventory, categories, orders & settings control
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@demo.com"
                  className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-[#351E28] outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-[#351E28]/50 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Demo@123"
                  className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-[#351E28] outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-[#351E28]/50 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-4 rounded-full bg-[#FF5C34] hover:bg-[#e44c26] text-white font-heading font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF5C34]/25 transition-all active:scale-95 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#351E28]/10 text-center text-[11px] text-[#351E28]/50">
            Prepared for Supabase Auth JWT Integration · Production RBAC ready
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-[#351E28]/60">
        &copy; {new Date().getFullYear()} Bake & Joy · Bangalore Main Market Road
      </div>

    </div>
  );
}
