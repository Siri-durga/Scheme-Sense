'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', full_name: '', preferred_language: 'en' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register(form);
      setAuth(res.data.user, res.data.access_token);
      toast.success('Account created! Complete your profile to find schemes.');
      router.push('/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white animate-fade-in">
      {/* Left Full-Bleed Illustration Panel */}
      <div className="hidden md:block md:w-1/2 min-h-screen relative bg-green-50 overflow-hidden">
        <Image 
          src="/login-illustration.png" 
          alt="Scheme Sense AI Citizens" 
          fill
          className="object-cover object-center"
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>

      {/* Right Authentication Panel */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md my-auto py-4 sm:py-6">
          <div className="text-center md:text-left mb-6">
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-4 shadow-sm">
              Scheme Sense AI
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">CREATE ACCOUNT</h2>
            <p className="text-gray-500 text-sm sm:text-base">Sign up to discover government schemes tailored to you.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 sm:py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition shadow-sm text-sm sm:text-base"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 sm:py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition shadow-sm text-sm sm:text-base"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 sm:py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition shadow-sm text-sm sm:text-base"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
              <select
                value={form.preferred_language}
                onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 sm:py-3 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition shadow-sm bg-white text-sm sm:text-base"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast('Google Sign-in coming soon!')}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] text-sm sm:text-base"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign Up with Google
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 hover:text-green-700 hover:underline font-semibold transition">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
