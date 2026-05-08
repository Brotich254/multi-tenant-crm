'use client';
import { useEffect, useState } from 'react';
import OrgLayout from '@/components/OrgLayout';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  LEAD: 'bg-blue-100 text-blue-700',
  PROSPECT: 'bg-yellow-100 text-yellow-700',
  CUSTOMER: 'bg-green-100 text-green-700',
  CHURNED: 'bg-red-100 text-red-700',
};

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', company: '', title: '', status: 'LEAD', notes: '' };

export default function ContactsPage({ params }: { params: { slug: string } }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const fetchContacts = () => {
    const params2 = new URLSearchParams();
    if (search) params2.set('q', search);
    if (statusFilter) params2.set('status', statusFilter);
    fetch(`/api/orgs/${params.slug}/contacts?${params2}`).then((r) => r.json()).then(setContacts);
  };

  useEffect(() => { fetchContacts(); }, [search, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/orgs/${params.slug}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const contact = await res.json();
      setContacts((p) => [contact, ...p]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success('Contact created');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/orgs/${params.slug}/contacts/${id}`, { method: 'DELETE' });
    setContacts((p) => p.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success('Deleted');
  };

  return (
    <OrgLayout slug={params.slug}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Contacts</h1>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
            + Add Contact
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border rounded-2xl p-5 mb-6 grid grid-cols-2 gap-3">
            {[
              { key: 'firstName', label: 'First Name', required: true },
              { key: 'lastName', label: 'Last Name' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'phone', label: 'Phone' },
              { key: 'company', label: 'Company' },
              { key: 'title', label: 'Job Title' },
            ].map(({ key, label, type, required }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 block mb-1">{label}</label>
                <input type={type || 'text'} required={required} value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                {['LEAD', 'PROSPECT', 'CUSTOMER', 'CHURNED'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" disabled={saving}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Contact'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3">Cancel</button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts..."
            className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
            <option value="">All Status</option>
            {['LEAD', 'PROSPECT', 'CUSTOMER', 'CHURNED'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-gray-500 text-xs uppercase">
              <tr>
                {['Name', 'Company', 'Email', 'Status', 'Deals', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelected(c)}>
                  <td className="px-4 py-3 font-medium">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-gray-500">{c.company || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{c._count?.deals || 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      className="text-xs text-gray-300 hover:text-red-400 transition">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {contacts.length === 0 && <p className="text-center text-gray-400 py-10">No contacts found.</p>}
        </div>
      </div>

      {/* Contact detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="bg-white w-96 h-full overflow-y-auto p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{selected.firstName} {selected.lastName}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Email', value: selected.email },
                { label: 'Phone', value: selected.phone },
                { label: 'Company', value: selected.company },
                { label: 'Title', value: selected.title },
                { label: 'Status', value: selected.status },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ) : null)}
              {selected.notes && (
                <div>
                  <p className="text-xs text-gray-400">Notes</p>
                  <p className="text-gray-600">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </OrgLayout>
  );
}
