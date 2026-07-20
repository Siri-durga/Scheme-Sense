'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authApi, schemesApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Lang, t, STATES } from '@/lib/i18n';
import { UserProfile } from '@/types';
import toast from 'react-hot-toast';
import { Save, RefreshCw } from 'lucide-react';

const GENDERS = [['male','Male / పురుషుడు'],['female','Female / స్త్రీ'],['other','Other / ఇతర']];
const CATEGORIES = [['General','General'],['OBC','OBC'],['SC','SC'],['ST','ST']];
const EDUCATIONS = [['below_10th','Below 10th'],['10th','10th Pass'],['12th','12th Pass'],['diploma','Diploma'],['graduation','Graduation'],['post_graduation','Post Graduation'],['phd','PhD']];
const MARITAL = [['single','Single'],['married','Married'],['widowed','Widowed'],['divorced','Divorced']];
const OCCUPATIONS = [['student','Student'],['farmer','Farmer'],['employee','Employee (Private)'],['government','Government Employee'],['entrepreneur','Entrepreneur / Self Employed'],['artisan','Artisan / Craftsman'],['daily_wage','Daily Wage Worker'],['homemaker','Homemaker'],['unemployed','Unemployed']];

const Field = ({ label, children, lang }: { label: string; children: React.ReactNode; lang: Lang }) => (
  <div>
    <label className={`block text-sm font-medium text-gray-700 mb-1 ${lang === 'te' ? 'telugu' : ''}`}>{label}</label>
    {children}
  </div>
);

export default function ProfilePage() {
  const { user, loadFromStorage, isLoading, setUser } = useAuthStore();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [saving, setSaving] = useState(false);
  const [computing, setComputing] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    age: undefined, gender: '', state: '', district: '', occupation: '',
    income_annual: undefined, education_level: '', category: '',
    has_disability: false, marital_status: '', is_student: false,
    is_farmer: false, is_bpl: false,
  });

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (user) {
      setLang(user.preferred_language as Lang);
      if (user.profile) {
        setProfile({ ...user.profile });
      }
    }
  }, [user, isLoading]);

  const handleChange = (field: string, val: any) => setProfile(p => ({ ...p, [field]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile(profile);
      const meRes = await authApi.me();
      setUser(meRes.data);
      toast.success(t('profileSaved', lang));

      // Auto-compute matches after profile save
      setComputing(true);
      toast.loading('Computing your eligible schemes...', { id: 'compute' });
      await schemesApi.computeMatches();
      toast.success('Schemes computed! Check your dashboard.', { id: 'compute' });
      setComputing(false);
    } catch (err: any) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar lang={lang} onLangChange={setLang} />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h1 className={`text-2xl font-bold text-gray-900 mb-1 ${lang === 'te' ? 'telugu' : ''}`}>
            {t('profile', lang)}
          </h1>
          <p className={`text-gray-500 text-sm mb-6 ${lang === 'te' ? 'telugu' : ''}`}>
            {lang === 'te'
              ? 'మీ అర్హమైన పథకాలను కనుగొనడానికి మీ సమాచారం పూర్తి చేయండి'
              : 'Fill in your details to discover schemes you qualify for'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t('age', lang)} lang={lang}>
              <input type="number" min={1} max={120} value={profile.age || ''} onChange={e => handleChange('age', parseInt(e.target.value) || undefined)} className={inputCls} placeholder="e.g. 25" />
            </Field>

            <Field label={t('gender', lang)} lang={lang}>
              <select value={profile.gender || ''} onChange={e => handleChange('gender', e.target.value)} className={inputCls}>
                <option value="">Select gender</option>
                {GENDERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>

            <Field label={t('state', lang)} lang={lang}>
              <select value={profile.state || ''} onChange={e => handleChange('state', e.target.value)} className={inputCls}>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <Field label={t('district', lang)} lang={lang}>
              <input type="text" value={profile.district || ''} onChange={e => handleChange('district', e.target.value)} className={inputCls} placeholder="e.g. Visakhapatnam" />
            </Field>

            <Field label={t('occupation', lang)} lang={lang}>
              <select value={profile.occupation || ''} onChange={e => handleChange('occupation', e.target.value)} className={inputCls}>
                <option value="">Select occupation</option>
                {OCCUPATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>

            <Field label={t('income', lang)} lang={lang}>
              <input type="number" min={0} value={profile.income_annual || ''} onChange={e => handleChange('income_annual', parseInt(e.target.value) || undefined)} className={inputCls} placeholder="e.g. 250000" />
              <p className="text-xs text-gray-400 mt-0.5">Annual family income in ₹</p>
            </Field>

            <Field label={t('education', lang)} lang={lang}>
              <select value={profile.education_level || ''} onChange={e => handleChange('education_level', e.target.value)} className={inputCls}>
                <option value="">Select education</option>
                {EDUCATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>

            <Field label={t('category', lang)} lang={lang}>
              <select value={profile.category || ''} onChange={e => handleChange('category', e.target.value)} className={inputCls}>
                <option value="">Select category</option>
                {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>

            <Field label={t('marital', lang)} lang={lang}>
              <select value={profile.marital_status || ''} onChange={e => handleChange('marital_status', e.target.value)} className={inputCls}>
                <option value="">Select status</option>
                {MARITAL.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
          </div>

          {/* Checkboxes */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'is_student', label: t('isStudent', lang) },
              { key: 'is_farmer', label: t('isFarmer', lang) },
              { key: 'is_bpl', label: t('isBpl', lang) },
              { key: 'has_disability', label: t('disability', lang) },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={!!(profile as any)[item.key]}
                  onChange={e => handleChange(item.key, e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className={`text-sm text-gray-700 ${lang === 'te' ? 'telugu' : ''}`}>{item.label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || computing}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 text-sm"
          >
            {saving || computing ? (
              <><RefreshCw size={16} className="animate-spin" /> {computing ? 'Computing matches...' : 'Saving...'}</>
            ) : (
              <><Save size={16} /> {t('saveProfile', lang)}</>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
