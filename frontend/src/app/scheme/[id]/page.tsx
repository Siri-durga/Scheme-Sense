'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { schemesApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Scheme, MatchedScheme } from '@/types';
import { Lang, t } from '@/lib/i18n';
import { ExternalLink, CheckCircle, XCircle, FileText, Calendar, Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SchemeDetailPage() {
  const { user, loadFromStorage, isLoading } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [lang, setLang] = useState<Lang>('en');
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [match, setMatch] = useState<MatchedScheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (user) setLang(user.preferred_language as Lang);
  }, [user, isLoading]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      schemesApi.getById(id),
      schemesApi.getMatches(),
    ]).then(([schemeRes, matchRes]) => {
      setScheme(schemeRes.data);
      const found = matchRes.data.find((m: MatchedScheme) => m.scheme.id === id);
      if (found) setMatch(found);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      if (saved) { await schemesApi.unsave(id); setSaved(false); toast.success('Removed'); }
      else { await schemesApi.save(id); setSaved(true); toast.success('Saved!'); }
    } catch { toast.error('Failed'); }
  };

  if (loading || !scheme) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-14 bg-white border-b" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded loading w-2/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded loading w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded loading w-3/4" />
        </div>
      </div>
    );
  }

  const name = lang === 'te' && scheme.name_te ? scheme.name_te : scheme.name;
  const desc = lang === 'te' && scheme.description_te ? scheme.description_te : scheme.description;
  const docs = lang === 'te' && scheme.required_docs_te?.length ? scheme.required_docs_te : scheme.required_docs;
  const benefits = lang === 'te' && Object.keys(scheme.benefits_te || {}).length ? scheme.benefits_te : scheme.benefits;

  const statusBg = scheme.status === 'active' ? 'bg-green-100 text-green-700' :
    scheme.status === 'upcoming' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar lang={lang} onLangChange={setLang} />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition">
          <ArrowLeft size={15} /> Back
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBg}`}>
                  {scheme.status === 'active' ? t('open', lang) : scheme.status === 'upcoming' ? t('upcoming', lang) : t('closed', lang)}
                </span>
                {scheme.state_specific && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">{scheme.state_specific}</span>
                )}
                {scheme.category_tags?.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{tag}</span>
                ))}
              </div>
              <h1 className={`text-xl font-bold text-gray-900 mb-1 ${lang === 'te' ? 'telugu' : ''}`}>{name}</h1>
              {scheme.department && (
                <p className="text-green-700 text-sm font-medium">{scheme.department.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition ${saved ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                {saved ? 'Saved' : 'Save'}
              </button>
              {scheme.official_url && (
                <a href={scheme.official_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition">
                  <ExternalLink size={14} /> {t('applyNow', lang)}
                </a>
              )}
            </div>
          </div>

          {/* Match score */}
          {match && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{t('matchScore', lang)}</span>
                <span className={`font-bold text-lg ${match.match_score >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {match.match_score.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${match.match_score >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${match.match_score}%` }} />
              </div>
              {match.ai_explanation && (
                <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3">
                  <p className={`text-sm text-green-800 ${lang === 'te' ? 'telugu' : ''}`}>
                    💡 {match.ai_explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main content */}
          <div className="md:col-span-2 space-y-4">
            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-800 mb-2">{t('objective', lang)}</h2>
              <p className={`text-gray-600 text-sm leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
                {scheme.objective || desc}
              </p>
            </div>

            {/* Benefits */}
            {Object.keys(benefits || {}).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-800 mb-3">{t('benefits', lang)}</h2>
                <div className="space-y-2">
                  {Object.entries(benefits || {}).map(([k, v]) => (
                    <div key={k} className="flex gap-3 items-start">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{k}: </span>
                        <span className={`text-sm text-gray-700 ${lang === 'te' ? 'telugu' : ''}`}>{v as string}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {scheme.benefit_value_inr > 0 && (
                  <div className="mt-3 bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-600">Estimated Benefit Value</p>
                    <p className="text-2xl font-black text-green-700">₹{scheme.benefit_value_inr.toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Eligibility breakdown */}
            {match && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-800 mb-3">{t('eligibilityBreakdown', lang)}</h2>
                <div className="space-y-2">
                  {match.matched_rules.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                      <span className={`text-gray-700 ${lang === 'te' ? 'telugu' : ''}`}>{r.label}</span>
                    </div>
                  ))}
                  {match.failed_rules.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <XCircle size={15} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-400 line-through">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required docs */}
            {docs?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={16} /> {t('requiredDocs', lang)}
                </h2>
                <ul className="space-y-1.5">
                  {docs.map((doc, i) => (
                    <li key={i} className={`flex items-center gap-2 text-sm text-gray-700 ${lang === 'te' ? 'telugu' : ''}`}>
                      <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Important dates */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar size={16} /> {t('importantDates', lang)}
              </h2>
              <div className="space-y-3">
                {scheme.launch_date && (
                  <div>
                    <p className="text-xs text-gray-400">{t('launchDate', lang)}</p>
                    <p className="text-sm font-medium text-gray-700">{new Date(scheme.launch_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                )}
                {scheme.app_start_date && (
                  <div>
                    <p className="text-xs text-gray-400">{t('appStart', lang)}</p>
                    <p className="text-sm font-medium text-gray-700">{new Date(scheme.app_start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                )}
                {scheme.app_end_date && (
                  <div>
                    <p className="text-xs text-gray-400">{t('deadline', lang)}</p>
                    <p className="text-sm font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-md inline-flex items-center">{new Date(scheme.app_end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Apply button */}
            {scheme.official_url && (
              <a href={scheme.official_url} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition">
                {t('applyNow', lang)} ↗
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
