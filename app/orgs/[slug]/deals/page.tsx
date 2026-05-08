'use client';
import { useEffect, useState } from 'react';
import OrgLayout from '@/components/OrgLayout';
import toast from 'react-hot-toast';

const STAGES = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
const STAGE_LABELS: Record<string, string> = {
  LEAD: 'Lead', QUALIFIED: 'Qualified', PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation', CLOSED_WON: '✅ Won', CLOSED_LOST: '❌ Lost',
};
const STAGE_COLORS: Record<string, string> = {
  LEAD: 'bg-gray-100', QUALIFIED: 'bg-blue-50', PROPOSAL: 'bg-yellow-50',
  NEGOTIATION: 'bg-orange-50', CLOSED_WON: 'bg-green-50', CLOSED_LOST: 'bg-red-50',
};

const EMPTY_FORM = { title: '', value: '', stage: 'LEAD', priority: 'MEDIUM', notes: '', closeDate: '' };

export default function DealsPage({ params }: { params: { slug: string } }) {
  const [deals, setDeals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orgs/${params.slug}/deals`).then((r) => r.json()).then(setDeals);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/orgs/${params.slug}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, value: form.value ? parseFloat(form.value) : null }),
      });
      const deal = await res.json();
      setDeals((p) => [deal, ...p]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success('Deal created');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const moveStage = async (deal: any, newStage: string) => {
    setMovingId(deal.id);
    try {
      const res = await fetch(`/api/orgs/${params.slug}/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      const updated = await res.json();
      setDeals((p) => p.map((d) => d.id === deal.id ? updated : d));
      if (selected?.id === deal.id) setSelected(updated);
    } catch { toast.error('Failed to move deal'); }
    finally { setMovingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deal?')) return;
    await fetch(`/api/orgs/${params.slug}/deals/${id}`, { method: 'DELETE' });
    setDeals((p) => p.filter((d) => d.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success('Deleted');
  };

  const dealsByStage = (stage: string) => deals.filter((d) => d.stage === stage);
  const stageValue = (stage: string) => dealsByStage(stage).reduce((s, d) => s + (d.value || 0), 0);

  return (
    <OrgLayout slug={params.slug}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Deals Pipeline</h1>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
            + Add Deal
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border rounded-2xl p-5 mb-6 grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Deal Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Acme Corp — Enterprise Plan"
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Value ($)</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="10000"
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Stage</label>
              <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                {['LOW', 'MEDIUM', 'HIGH'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Close Date</label>
              <input type="date" value={form.closeDate} onChange={(e) => setForm({ ...form, closeDate: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" disabled={saving}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">
                {saving ? 'Saving...' : 'Create Deal'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-3">Cancel</button>
            </div>
          </form>
        )}

        {/* Kanban board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageDeals = dealsByStage(stage);
            return (
              <div key={stage} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold">{STAGE_LABELS[stage]}</span>
                    <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{stageDeals.length}</span>
                  </div>
                  {stageValue(stage) > 0 && (
                    <span className="text-xs text-gray-400">${stageValue(stage).toLocaleString()}</span>
                  )}
                </div>
                <div className={`rounded-2xl p-2 min-h-[200px] space-y-2 ${STAGE_COLORS[stage]}`}>
                  {stageDeals.map((deal) => (
                    <div key={deal.id}
                      className="bg-white border rounded-xl p-3 cursor-pointer hover:shadow-sm transition"
                      onClick={() => setSelected(deal)}>
                      <p className="font-medium text-sm truncate">{deal.title}</p>
                      {deal.value && <p className="text-indigo-600 text-sm font-semibold mt-1">${deal.value.toLocaleString()}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          deal.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                          deal.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>{deal.priority}</span>
                        {deal.closeDate && (
                          <span className="text-xs text-gray-400">{new Date(deal.closeDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deal detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="bg-white w-96 h-full overflow-y-auto p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {selected.value && <p className="text-2xl font-bold text-indigo-600 mb-4">${selected.value.toLocaleString()}</p>}

            <div className="space-y-3 text-sm mb-6">
              <div>
                <p className="text-xs text-gray-400">Stage</p>
                <p className="font-medium">{STAGE_LABELS[selected.stage]}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Priority</p>
                <p className="font-medium">{selected.priority}</p>
              </div>
              {selected.closeDate && (
                <div>
                  <p className="text-xs text-gray-400">Close Date</p>
                  <p className="font-medium">{new Date(selected.closeDate).toLocaleDateString()}</p>
                </div>
              )}
              {selected.notes && (
                <div>
                  <p className="text-xs text-gray-400">Notes</p>
                  <p className="text-gray-600">{selected.notes}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Move to Stage</p>
              <div className="flex flex-wrap gap-2">
                {STAGES.filter((s) => s !== selected.stage).map((s) => (
                  <button key={s} onClick={() => moveStage(selected, s)} disabled={movingId === selected.id}
                    className="text-xs border px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition disabled:opacity-50">
                    {STAGE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => handleDelete(selected.id)}
              className="w-full text-sm border border-red-200 text-red-500 py-2 rounded-xl hover:bg-red-50 transition">
              Delete Deal
            </button>
          </div>
        </div>
      )}
    </OrgLayout>
  );
}
