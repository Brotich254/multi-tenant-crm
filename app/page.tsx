import Link from 'next/link';
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">🏢 NexusCRM</h1>
        <p className="text-xl text-gray-500 mb-8">Multi-tenant CRM for growing teams</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition">Login</Link>
          <Link href="/register" className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-semibold">Get Started Free</Link>
        </div>
      </div>
    </div>
  );
}
