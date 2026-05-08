'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OrgLayout from '@/components/OrgLayout';

interface Stats {
  totalContacts: number;
  totalDeals: number;
  totalValue: number;
  wonDeals: number;
  wonValue: number;
  dealsByStage: Record<string, number>;
  recentActivities: any[];
}

const STAGE_LABELS: Record<string, string> = {
  LEAD: 'Lead', QUALIFIED: 'Qualified', PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation', CLOSED_WON: 'Won', CLOSED_LOST: 'Lost',
};

export default function OrgDashboard({ params }: { params: { slug: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch(`/api/orgs/${params.slug}/stats`).then((r) => r.json()).then(setStats);
    }
  }, [status, params.slug]);

  if (!stats) return (
    <OrgLayout slug={params.slug}>
      <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
    </OrgLayout>
  );

  const winRate = stats.totalDeals > 0 ? Math.round((stats.wonDeals / stats.totalDeals) * 100) : 0;

  return (
    <OrgLayout slug={params.slug}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Contacts', value: stats.totalContacts, icon: '👤' },
            { label: 'Total Deals', value: stats.totalDeals, icon: '💼' },
            { label: 'Pipeline Value', value: `$${(stats.totalValue || 0).toLocaleString()}`, icon: '💰' },
            { label: 'Win Rate', value: `${winRate}%`, icon: '🏆' },
          ].map((s) => (
            <div key={s.label} className="bg-white border rounded-2xl p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pipeline by stage */}
          <div className="bg-white border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Pipeline by Stage</h2>
            <div className="space-y-3">
              {Object.entries(STAGE_LABELS).map(([stage, label]) => {
                const count = stats.dealsByStage[stage] || 0;
                const max = Math.max(...Object.values(stats.dealsByStage), 1);
                return (
                  <div key={stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white border rounded-2xl p-5">
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            {stats.recentActivities.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivities.map((a: any) => (
                  <div key={a.id} className="flex gap-3 text-sm">
                    <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-xs shrink-0">
                      {a.user?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-gray-700">{a.title}</p>
                      <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
