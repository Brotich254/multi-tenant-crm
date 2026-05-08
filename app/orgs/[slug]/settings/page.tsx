'use client';
import { useEffect, useState } from 'react';
import OrgLayout from '@/components/OrgLayout';
import toast from 'react-hot-toast';

export default function SettingsPage({ params }: { params: { slug: string } }) {
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetch(`/api/orgs/${params.slug}/members`).then((r) => r.json()).then(setMembers);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch(`/api/orgs/${params.slug}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
      fetch(`/api/orgs/${params.slug}/members`).then((r) => r.json()).then(setMembers);
    } catch (err: any) {
      toast.error(err.message || 'Failed to invite');
    } finally {
      setInviting(false);
    }
  };

  const ROLE_COLORS: Record<string, string> = {
    OWNER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-blue-100 text-blue-700',
    MEMBER: 'bg-gray-100 text-gray-600',
  };

  return (
    <OrgLayout slug={params.slug}>
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Members */}
        <div className="bg-white border rounded-2xl p-5 mb-6">
          <h2 className="font-semibold mb-4">Team Members</h2>
          <div className="space-y-3 mb-5">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-600">
                    {m.user?.name?.[0] || m.user?.email?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{m.user?.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[m.role]}`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleInvite} className="flex gap-3">
            <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Invite by email"
              className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <button type="submit" disabled={inviting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-indigo-700 transition">
              {inviting ? 'Inviting...' : 'Invite'}
            </button>
          </form>
        </div>

        {/* Org info */}
        <div className="bg-white border rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Organization</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Slug</span>
              <span className="font-mono text-gray-700">{params.slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Members</span>
              <span>{members.length}</span>
            </div>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
