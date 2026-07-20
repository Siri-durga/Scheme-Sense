'use client';
import { TrendingUp, Wallet } from 'lucide-react';
import { BenefitsCalculation } from '@/types';
import { Lang } from '@/lib/i18n';

interface Props { data: BenefitsCalculation; lang: Lang; }

export default function BenefitsCalculator({ data, lang }: Props) {
  const isTE = lang === 'te';
  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg mb-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={20} />
            <h2 className={`font-bold text-lg ${isTE ? 'telugu' : ''}`}>
              {isTE ? 'సంభావ్య లబ్ధుల కాలిక్యులేటర్' : 'Potential Benefits Calculator'}
            </h2>
          </div>
          <p className={`text-green-100 text-sm ${isTE ? 'telugu' : ''}`}>
            {isTE
              ? `మీ ప్రొఫైల్ ఆధారంగా, మీరు ${data.total_schemes} పథకాలకు అర్హులు`
              : `Based on your profile, you qualify for ${data.total_schemes} schemes`}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <Wallet size={20} className="text-yellow-300" />
            <span className="text-sm text-green-100">
              {isTE ? 'మొత్తం అంచనా లబ్ధి' : 'Total Estimated Benefit'}
            </span>
          </div>
          <p className="text-4xl font-black text-yellow-300">
            ₹{data.total_benefit_inr.toLocaleString('en-IN')}
          </p>
          <p className="text-green-200 text-xs mt-0.5">
            {isTE ? 'గరిష్ట సంభావ్య మొత్తం' : 'Maximum potential amount'}
          </p>
        </div>
      </div>
    </div>
  );
}
