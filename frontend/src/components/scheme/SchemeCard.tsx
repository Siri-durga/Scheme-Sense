'use client';
import Link from 'next/link';
import { Bookmark, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { MatchedScheme, SchemeListItem } from '@/types';
import { t, Lang } from '@/lib/i18n';
import { schemesApi } from '@/lib/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  match?: MatchedScheme;
  scheme?: SchemeListItem;
  lang: Lang;
  saved?: boolean;
  onSaveToggle?: () => void;
}

export default function SchemeCard({ match, scheme: schemeProp, lang, saved, onSaveToggle }: Props) {
  const scheme = match?.scheme ?? schemeProp!;
  const score = match?.match_score;
  const [isSaved, setIsSaved] = useState(saved ?? false);
  const [saving, setSaving] = useState(false);

  const name = lang === 'te' && scheme.name_te ? scheme.name_te : scheme.name;
  const desc = scheme.description;

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isSaved) {
        await schemesApi.unsave(scheme.id);
        setIsSaved(false);
        toast.success('Removed from saved');
      } else {
        await schemesApi.save(scheme.id);
        setIsSaved(true);
        toast.success('Scheme saved!');
      }
      onSaveToggle?.();
    } catch {
      toast.error('Action failed');
    } finally {
      setSaving(false);
    }
  };

  const statusColor = scheme.status === 'active' ? 'bg-green-100 text-green-700' :
    scheme.status === 'upcoming' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600';

  const scoreColor = !score ? '' : score >= 80 ? 'text-green-600' : score >= 50 ? 'text-green-500' : 'text-gray-500';

  return (
    <Link href={`/scheme/${scheme.id}`}>
      <div className="scheme-card bg-white border border-gray-200 rounded-xl p-5 cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1">
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${statusColor}`}>
              {scheme.status === 'active' ? t('open', lang) : scheme.status === 'upcoming' ? t('upcoming', lang) : t('closed', lang)}
            </span>
            {scheme.state_specific && (
              <span className="inline-block ml-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                {scheme.state_specific}
              </span>
            )}
          </div>
          <button onClick={handleSave} disabled={saving} className="p-1.5 hover:bg-gray-100 rounded-lg transition flex-shrink-0" title="Save scheme">
            <Bookmark size={16} className={isSaved ? 'fill-green-600 text-green-600' : 'text-gray-400'} />
          </button>
        </div>

        <h3 className={`font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 ${lang === 'te' ? 'telugu' : ''}`}>
          {name}
        </h3>

        {scheme.department && (
          <p className="text-xs text-green-700 font-medium mb-2">{scheme.department.name}</p>
        )}

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{desc}</p>

        {/* Match score bar */}
        {score !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">{t('matchScore', lang)}</span>
              <span className={`text-sm font-bold ${scoreColor}`}>{score.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full match-bar ${score >= 80 ? 'bg-green-600' : score >= 50 ? 'bg-green-400' : 'bg-green-200'}`}
                style={{ width: `${Math.min(score, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">{t('benefits', lang)}</p>
            <p className="text-sm font-bold text-green-700">
              {scheme.benefit_value_inr > 0 ? `₹${scheme.benefit_value_inr.toLocaleString('en-IN')}` : 'See details'}
            </p>
          </div>
          {scheme.app_end_date && (
            <div className="text-right">
              <p className="text-xs text-gray-400">{t('deadline', lang)}</p>
              <p className="text-xs font-medium text-green-800 bg-green-100 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                <Clock size={11} />
                {new Date(scheme.app_end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
