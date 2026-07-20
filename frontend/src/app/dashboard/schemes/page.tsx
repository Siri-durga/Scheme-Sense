'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { schemesApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import SchemeCard from '@/components/scheme/SchemeCard';
import { MatchedScheme } from '@/types';
import { Lang, t } from '@/lib/i18n';

export default function SchemesPage() {
  const { user, loadFromStorage, isLoading } = useAuthStore();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [matches, setMatches] = useState<MatchedScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (user) setLang(user.preferred_language as Lang);
  }, [user, isLoading]);

  useEffect(() => {
    if (user) schemesApi.getMatches().then(r => { setMatches(r.data); setLoading(false); });
  }, [user]);

  const filtered = matches.filter(m => {
    if (filter === 'high') return m.match_score >= 80;
    if (filter === 'medium') return m.match_score >= 50 && m.match_score < 80;
    if (filter === 'low') return m.match_score < 50;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar lang={lang} onLangChange={setLang} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold text-gray-900 mb-2 ${lang === 'te' ? 'telugu' : ''}`}>
          {lang === 'te' ? 'మీ అర్హమైన పథకాలు' : 'Your Eligible Schemes'}
        </h1>
        <p className="text-gray-500 text-sm mb-5">{matches.length} schemes matched to your profile</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all','high','medium','low'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {f === 'all' ? 'All' : f === 'high' ? '≥80% Match' : f === 'medium' ? '50-79%' : '<50%'}
              {f === 'all' ? ` (${matches.length})` : ''}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-gray-200 rounded-xl loading" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(m => <SchemeCard key={m.scheme.id} match={m} lang={lang} />)}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-gray-500">No schemes in this filter. <button onClick={() => setFilter('all')} className="text-green-600 hover:underline">Show all</button></p>
          </div>
        )}
      </main>
    </div>
  );
}
