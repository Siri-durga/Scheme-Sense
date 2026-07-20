'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const { user, loadFromStorage, isLoading } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (user) router.replace('/dashboard');
      else router.replace('/login');
    }
  }, [user, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero">
      <div className="text-center">
        <div className="text-5xl mb-4">🇮🇳</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SchemeSense AI</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
