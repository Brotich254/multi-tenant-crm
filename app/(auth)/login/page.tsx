'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', { ...form, redirect: false });
    if (res?.error) toast.error('Invalid credentials');
    else router.push('/orgs');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-sm">
        <Link href="/" className="text-indigo-600 font-bold text-lg block mb-6">🏢 NexusCRM</Link>
        <h1 className="text-2xl font-bold mb-6">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <input type="password" placeholder="Password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          No account? <Link href="/register" className="text-indigo-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
