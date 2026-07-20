'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { schemesApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import SchemeCard from '@/components/scheme/SchemeCard';
import { SavedScheme } from '@/types';
import { Lang, t } from '@/lib/i18n';
import { Bookmark } from 'lucide-react';

export default function SavedPage() {
  const { user, loadFromStorage, isLoading } = useAuthStore();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [saved, setSaved] = useState<SavedScheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (user) setLang(user.preferred_language as Lang);
  }, [user, isLoading]);

  const fetchSaved = async () => {
    try {
      const res = await schemesApi.getSaved();
      setSaved(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (user) fetchSaved(); }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar lang={lang} onLangChange={setLang} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Bookmark size={22} className="text-green-600" />
          <h1 className={`text-2xl font-bold text-gray-900 ${lang === 'te' ? 'telugu' : ''}`}>
            {t('saved', lang)} ({saved.length})
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-52 bg-gray-200 rounded-xl loading" />)}
          </div>
        ) : saved.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {saved.map(s => (
              <SchemeCard key={s.id} scheme={s.scheme} lang={lang} saved={true} onSaveToggle={fetchSaved} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border">
            <Bookmark size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-600 mb-1">No saved schemes yet</h3>
            <p className="text-gray-400 text-sm">Click the bookmark icon on any scheme to save it here</p>
          </div>
        )}
      </main>
    </div>
  );
}
