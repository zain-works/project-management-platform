import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layers, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);
      setError(null);
      await login({ email, password, rememberMe });
      // Check if user has workspaces, if not go to onboarding
      navigate('/app', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setEmail(demoEmail);
      setPassword('Password123!');
      await login({ email: demoEmail, password: 'Password123!', rememberMe: true });
      navigate('/app', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with demo account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
            <Layers className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Kairo</span>
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome back to your workspace
        </h2>
        <p className="mt-2 text-xs text-slate-600">
          Or{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-500">
            create a new account for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-600 hover:text-brand-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-700">
                Remember this device for 30 days
              </label>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
              Sign In
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="block text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Fast Demo Accounts (Password123!)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex.owner@example.com')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center hover:bg-slate-100 transition-colors"
              >
                <div className="text-xs font-bold text-slate-800 truncate">Alex</div>
                <div className="text-[10px] text-purple-700 font-medium">Owner</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('sarah.admin@example.com')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center hover:bg-slate-100 transition-colors"
              >
                <div className="text-xs font-bold text-slate-800 truncate">Sarah</div>
                <div className="text-[10px] text-indigo-700 font-medium">Admin</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('marcus.pm@example.com')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center hover:bg-slate-100 transition-colors"
              >
                <div className="text-xs font-bold text-slate-800 truncate">Marcus</div>
                <div className="text-[10px] text-blue-700 font-medium">PM</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('elena.dev@example.com')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center hover:bg-slate-100 transition-colors"
              >
                <div className="text-xs font-bold text-slate-800 truncate">Elena</div>
                <div className="text-[10px] text-slate-600 font-medium">Member</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
