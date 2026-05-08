'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Membership {
  id: string;
  role: string;
  org: {
    id: string;
    name: string;
    slug: string;
    _count: { members: number; contacts: number; deals: number };
  };
}

export default function OrgsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/orgs').then((r) => r.json()).then(setMemberships);
    }
  }, [status]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName }),
      });
      const org = await res.json();
      router.push(`/orgs/${org.slug}`);
    } catch {
      toast.error('Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <span className="text-indigo-600 font-bold text-lg">🏢 NexusCRM</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-gray-400 hover:text-red-500">Logout</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Organizations</h1>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
            + New Organization
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border rounded-2xl p-5 mb-6 flex gap-3">
            <input value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Organization name" autoFocus required
              className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <button type="submit" disabled={creating}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        )}

        {memberships.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏢</div>
            <p className="text-gray-500 mb-4">No organizations yet. Create your first one.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {memberships.map((m) => (
              <Link key={m.id} href={`/orgs/${m.org.slug}`}
                className="bg-white border rounded-2xl p-5 hover:shadow-md transition hover:border-indigo-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {m.org.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{m.org.name}</h3>
                    <span className="text-xs text-gray-400 capitalize">{m.role.toLowerCase()}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>👥 {m.org._count.members} members</span>
                  <span>👤 {m.org._count.contacts} contacts</span>
                  <span>💼 {m.org._count.deals} deals</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
