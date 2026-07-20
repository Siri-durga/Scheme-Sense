'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setAuth(res.data.user, res.data.access_token);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type: 'user' | 'admin') => {
    if (type === 'admin') setForm({ email: 'admin@schemesense.ai', password: 'Admin@123' });
    else setForm({ email: 'demo@schemesense.ai', password: 'Demo@123' });
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-white animate-fade-in overflow-hidden">
      {/* Left Illustration Panel */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative bg-gradient-to-br from-green-50 to-green-100 items-center justify-center p-8 overflow-hidden">
        <div className="relative z-10 w-full max-w-lg">
          <h1 className="text-5xl font-black text-green-900 leading-tight tracking-tight mb-4">
            DISCOVER.<br />APPLY.<br />BENEFIT.
          </h1>
          <p className="text-xl text-green-800 mb-10 font-medium">
            Find government schemes you qualify for in seconds.
          </p>
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl ring-1 ring-green-900/5">
            <Image 
              src="/login-illustration.png" 
              alt="SchemeSense AI Citizens" 
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-green-200/40 blur-3xl" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-green-300/30 blur-3xl" />
        </div>
      </div>

      {/* Right Authentication Panel */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-semibold mb-6">
              <span className="text-base">🇮🇳</span> SchemeSense AI
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">WELCOME BACK</h2>
            <p className="text-gray-500">Sign in to discover government schemes tailored to you.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition shadow-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition shadow-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-green-600 focus:ring-green-500 border-gray-300 w-4 h-4" />
                <span className="text-gray-600">Remember Me</span>
              </label>
              <button type="button" className="text-green-600 hover:text-green-700 font-medium hover:underline transition">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast('Google Sign-in coming soon!')}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign In with Google
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
            <button onClick={() => fillDemo('user')} className="text-xs bg-white border border-green-200 text-green-700 rounded-lg px-3 py-2 hover:bg-green-50 transition">
              Demo Citizen
            </button>
            <button onClick={() => fillDemo('admin')} className="text-xs bg-white border border-green-200 text-green-700 rounded-lg px-3 py-2 hover:bg-green-50 transition">
              Demo Admin
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-green-600 hover:text-green-700 hover:underline font-semibold transition">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
