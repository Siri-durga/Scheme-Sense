'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Lang } from '@/lib/i18n';
import { Users, BookOpen, TrendingUp, Eye, Plus, Trash2, Edit, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminStats { total_users: number; total_schemes: number; total_matches: number; total_views: number; }

export default function AdminPage() {
  const { user, loadFromStorage, isLoading } = useAuthStore();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'schemes' | 'users'>('overview');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newScheme, setNewScheme] = useState({ name: '', description: '', status: 'active', benefit_value_inr: 0, official_url: '', objective: '' });

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else if (user.role !== 'admin') { toast.error('Admin access required'); router.push('/dashboard'); }
    }
    if (user) setLang(user.preferred_language as Lang);
  }, [user, isLoading]);

  useEffect(() => {
    if (user?.role === 'admin') fetchAll();
  }, [user]);

  const fetchAll = async () => {
    const [s, sc, u] = await Promise.allSettled([adminApi.getStats(), adminApi.getSchemes(), adminApi.getUsers()]);
    if (s.status === 'fulfilled') setStats(s.value.data);
    if (sc.status === 'fulfilled') setSchemes(sc.value.data);
    if (u.status === 'fulfilled') setUsers(u.value.data);
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    await adminApi.deleteScheme(id);
    toast.success('Scheme deactivated');
    fetchAll();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createScheme({ ...newScheme, benefit_value_inr: Number(newScheme.benefit_value_inr) });
      toast.success('Scheme created!');
      setShowForm(false);
      setNewScheme({ name: '', description: '', status: 'active', benefit_value_inr: 0, official_url: '', objective: '' });
      fetchAll();
    } catch { toast.error('Failed to create scheme'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-14 bg-white border-b" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl loading" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar lang={lang} onLangChange={setLang} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck size={22} className="text-green-700" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview','schemes','users'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.total_users, icon: Users, color: 'green' },
              { label: 'Active Schemes', value: stats.total_schemes, icon: BookOpen, color: 'green' },
              { label: 'Total Matches', value: stats.total_matches, icon: TrendingUp, color: 'green' },
              { label: 'Total Views', value: stats.total_views, icon: Eye, color: 'green' },
            ].map(card => (
              <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{card.label}</span>
                  <card.icon size={18} className="text-gray-400" />
                </div>
                <p className="text-3xl font-black text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Schemes management */}
        {tab === 'schemes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Schemes ({schemes.length})</h2>
              <button onClick={() => setShowForm(s => !s)} className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
                <Plus size={15} /> Add Scheme
              </button>
            </div>

            {showForm && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                <h3 className="font-bold text-gray-800 mb-4">New Scheme</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ['name','Scheme Name','text',true],
                    ['objective','Objective','text',false],
                    ['official_url','Official URL','url',false],
                    ['benefit_value_inr','Benefit Value (₹)','number',false],
                  ].map(([field, label, type, req]) => (
                    <div key={field as string}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label as string}</label>
                      <input type={type as string} required={req as boolean}
                        value={(newScheme as any)[field as string]}
                        onChange={e => setNewScheme(s => ({ ...s, [field as string]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
                    <textarea required rows={3} value={newScheme.description}
                      onChange={e => setNewScheme(s => ({ ...s, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-700">Create</button>
                    <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 px-5 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Scheme Name','Department','Status','Benefit','Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schemes.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 line-clamp-1 max-w-56">{s.name}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{s.department?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">₹{(s.benefit_value_inr || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-green-700 transition">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name','Email','Role','Status','Joined'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.full_name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
