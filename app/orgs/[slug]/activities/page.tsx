'use client';
import { useEffect, useState } from 'react';
import OrgLayout from '@/components/OrgLayout';
import toast from 'react-hot-toast';

const TYPE_ICONS: Record<string, string> = {
  NOTE: '📝', EMAIL: '✉️', CALL: '📞', MEETING: '🤝',
  TASK: '✅', DEAL_MOVED: '🔄', CONTACT_CREATED: '👤', DEAL_CREATED: '💼',
};

const EMPTY_FORM = { type: 'NOTE', title: '', body: '' };

export default function ActivitiesPage({ params }: { params: { slug: string } }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/orgs/${params.slug}/activities`).then((r) => r.json()).then(setActivities);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/orgs/${params.slug}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const activity = await res.json();
      setActivities((p) => [activity, ...p]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success('Activity logged');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <OrgLayout slug={params.slug}>
      <div className="p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
            + Log Activity
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border rounded-2xl p-5 mb-6 space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {['NOTE', 'EMAIL', 'CALL', 'MEETING', 'TASK'].map((t) => (
                    <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Activity title"
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Notes (optional)</label>
              <textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Add details..."
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">
                {saving ? 'Saving...' : 'Log Activity'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-3">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {activities.length === 0 && <p className="text-center text-gray-400 py-10">No activities yet.</p>}
          {activities.map((a) => (
            <div key={a.id} className="bg-white border rounded-2xl p-4 flex gap-4">
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-lg shrink-0">
                {TYPE_ICONS[a.type] || '📋'}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-sm">{a.title}</p>
                  <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                {a.body && <p className="text-sm text-gray-500 mt-1">{a.body}</p>}
                <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                  {a.user?.name && <span>by {a.user.name}</span>}
                  {a.contact && <span>· {a.contact.firstName} {a.contact.lastName}</span>}
                  {a.deal && <span>· {a.deal.title}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </OrgLayout>
  );
}
