'use client';
import { CheckCircle, TrendingUp, Sparkles, AlertCircle, Bookmark } from 'lucide-react';
import { DashboardStats } from '@/types';
import { t, Lang } from '@/lib/i18n';

interface Props { stats: DashboardStats; lang: Lang; }

export default function StatsGrid({ stats, lang }: Props) {
  const cards = [
    { label: t('totalEligible', lang), value: stats.total_eligible, icon: CheckCircle, color: 'green', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    { label: t('newlyLaunched', lang), value: stats.newly_launched, icon: Sparkles, color: 'green', bg: 'bg-white', text: 'text-green-600', border: 'border-gray-200' },
    { label: t('closingSoon', lang), value: stats.closing_soon, icon: AlertCircle, color: 'green', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    { label: t('savedSchemes', lang), value: stats.saved_count, icon: Bookmark, color: 'green', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(card => (
        <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${card.text} ${lang === 'te' ? 'telugu text-xs' : ''}`}>{card.label}</span>
            <card.icon size={18} className={card.text} />
          </div>
          <p className={`text-3xl font-black ${card.text}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
