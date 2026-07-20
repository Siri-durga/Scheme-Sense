'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { schemesApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import StatsGrid from '@/components/dashboard/StatsGrid';
import BenefitsCalculator from '@/components/dashboard/BenefitsCalculator';
import SchemeCard from '@/components/scheme/SchemeCard';
import { DashboardStats, MatchedScheme, BenefitsCalculation } from '@/types';
import { Lang, t } from '@/lib/i18n';
import { Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, loadFromStorage, isLoading } = useAuthStore();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [matches, setMatches] = useState<MatchedScheme[]>([]);
  const [benefits, setBenefits] = useState<BenefitsCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (user) setLang(user.preferred_language as Lang);
  }, [user, isLoading]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, matchRes, benefitsRes] = await Promise.allSettled([
        schemesApi.getDashboardStats(),
        schemesApi.getMatches(),
        schemesApi.getBenefitsCalc(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (matchRes.status === 'fulfilled') setMatches(matchRes.value.data);
      if (benefitsRes.status === 'fulfilled') setBenefits(benefitsRes.value.data);
    } catch {}
    setLoading(false);
  };

  const handleCompute = async () => {
    setComputing(true);
    toast.loading('Finding your eligible schemes...', { id: 'compute' });
    try {
      await schemesApi.computeMatches();
      await fetchData();
      toast.success('Schemes updated!', { id: 'compute' });
    } catch {
      toast.error('Failed to compute matches', { id: 'compute' });
    }
    setComputing(false);
  };

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await schemesApi.search(q);
      setSearchResults(res.data);
    } catch {}
    setSearching(false);
  };

  const hasProfile = user?.profile?.age;

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-14 bg-white border-b" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl loading" />)}
          </div>
          <div className="h-32 bg-gray-200 rounded-2xl loading mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl loading" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar lang={lang} onLangChange={l => { setLang(l); }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className={`text-2xl font-bold text-gray-900 ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'te' ? `నమస్కారం, ${user?.full_name?.split(' ')[0]}! 👋` : `Welcome, ${user?.full_name?.split(' ')[0]}! 👋`}
            </h1>
            <p className={`text-gray-500 text-sm ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'te' ? 'మీ పథక డాష్‌బోర్డ్' : 'Your personalized scheme dashboard'}
            </p>
          </div>
          <div className="flex gap-2">
            {!hasProfile && (
              <Link href="/profile" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                {lang === 'te' ? 'ప్రొఫైల్ పూర్తి చేయండి' : 'Complete Profile →'}
              </Link>
            )}
            <button onClick={handleCompute} disabled={computing}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50">
              <RefreshCw size={14} className={computing ? 'animate-spin' : ''} />
              {lang === 'te' ? 'మ్యాచ్‌లు తాజా చేయండి' : 'Refresh Matches'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder={t('searchPlaceholder', lang)}
            className={`w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 transition text-sm ${lang === 'te' ? 'telugu' : ''}`}
          />
          {search && (
            <button onClick={() => { setSearch(''); setSearchResults([]); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>

        {/* Search results */}
        {search && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">
              {searching ? 'Searching...' : `Found ${searchResults.length} schemes`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map(s => <SchemeCard key={s.id} scheme={s} lang={lang} />)}
            </div>
            {!searching && searchResults.length === 0 && (
              <p className="text-gray-500 text-sm">No schemes found for "{search}"</p>
            )}
          </div>
        )}

        {/* Normal dashboard */}
        {!search && (
          <>
            {stats && <StatsGrid stats={stats} lang={lang} />}
            {benefits && benefits.total_schemes > 0 && <BenefitsCalculator data={benefits} lang={lang} />}

            {!hasProfile && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 text-center">
                <p className="text-2xl mb-2">📋</p>
                <h3 className={`font-bold text-gray-800 mb-1 ${lang === 'te' ? 'telugu' : ''}`}>
                  {t('completeProfile', lang)}
                </h3>
                <Link href="/profile" className="inline-block mt-2 bg-green-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-700 transition">
                  {lang === 'te' ? 'ఇప్పుడు ప్రొఫైల్ పూర్తి చేయండి' : 'Complete Profile Now'}
                </Link>
              </div>
            )}

            {matches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-bold text-gray-900 ${lang === 'te' ? 'telugu' : ''}`}>
                    {lang === 'te' ? 'మీ అర్హమైన పథకాలు' : 'Your Eligible Schemes'}
                    <span className="ml-2 text-sm font-normal text-gray-500">({matches.length})</span>
                  </h2>
                  <Link href="/dashboard/schemes" className="text-sm text-green-600 hover:underline">
                    {lang === 'te' ? 'అన్నీ చూడండి' : 'View all →'}
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches.slice(0, 6).map(m => (
                    <SchemeCard key={m.scheme.id} match={m} lang={lang} />
                  ))}
                </div>
              </div>
            )}

            {matches.length === 0 && hasProfile && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-4xl mb-3">🔍</p>
                <h3 className="font-bold text-gray-700 mb-1">{t('noMatches', lang)}</h3>
                <button onClick={handleCompute} className="mt-3 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm transition">
                  {lang === 'te' ? 'మళ్ళీ ప్రయత్నించండి' : 'Try Again'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
