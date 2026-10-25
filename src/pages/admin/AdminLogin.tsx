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
    <div className="min-h-screen bg-[#F9F4EE] text-[#4A2818] flex flex-col justify-between font-sans selection:bg-[#EAD9CF] selection:text-[#4A2818]">
      
      {/* Top Bar with Return to Store */}
      <div className="p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#4A2818] hover:text-[#673D26] bg-[#FCFAF7] px-4 py-2 rounded-full border border-[#E8D8CC] shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#4A2818] text-[#F9F4EE] flex items-center justify-center">
            <Cake className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-lg text-[#4A2818] italic">NayaKart</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto px-4 my-8">
        
        {/* Demo Notice Box */}
        <div className="mb-6 bg-[#F2E7DC] border border-[#E8D8CC] rounded-[2rem] p-5 shadow-xs text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#4A2818]">
              <KeyRound className="w-4 h-4 stroke-[2.2]" />
              <span>Demo Test Credentials</span>
            </div>
            <span className="text-[10px] font-bold bg-[#4A2818] text-[#F9F4EE] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Evaluation
            </span>
          </div>

          <p className="text-xs text-[#7A6153] font-normal">
            Use these pre-configured demo credentials to access the admin portal:
          </p>

          <div className="bg-white/90 rounded-2xl p-3 border border-[#E8D8CC] text-xs font-mono space-y-1 text-[#4A2818]">
            <div><strong>Email:</strong> {DEMO_CREDENTIALS.email}</div>
            <div><strong>Password:</strong> {DEMO_CREDENTIALS.password}</div>
          </div>

          <button
            type="button"
            onClick={handleFillDemoCredentials}
            className="w-full mt-2 py-2.5 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 fill-[#F9F4EE]" />
            <span>Click to Auto-fill Demo Credentials</span>
          </button>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-[2rem] border border-[#E8D8CC] shadow-xs p-6 sm:p-8">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#F2E7DC] text-[#4A2818] flex items-center justify-center mx-auto mb-3 border border-[#E8D8CC]">
              <ShieldCheck className="w-6 h-6 text-[#4A2818]" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-[#4A2818]">
              Admin Sign In
            </h1>
            <p className="text-xs text-[#7A6153] mt-1 font-normal">
              Store inventory, categories, orders & settings control
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@demo.com"
                  className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-[#4A2818] outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-[#7A6153] absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Demo@123"
                  className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-[#4A2818] outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-[#7A6153] absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E8D8CC] text-center text-[11px] text-[#7A6153]">
            Prepared for Supabase Auth JWT Integration · Production RBAC ready
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-[#7A6153]">
        &copy; {new Date().getFullYear()} NayaKart · Trivandrum Main Market Road
      </div>

    </div>
  );
}
