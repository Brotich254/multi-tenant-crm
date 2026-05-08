'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import clsx from 'clsx';

const NAV = [
  { label: 'Dashboard', href: '', icon: '📊' },
  { label: 'Contacts', href: '/contacts', icon: '👤' },
  { label: 'Deals', href: '/deals', icon: '💼' },
  { label: 'Activities', href: '/activities', icon: '📋' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function OrgLayout({ slug, children }: { slug: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const base = `/orgs/${slug}`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <Link href="/orgs" className="text-xs text-gray-400 hover:text-gray-600 block mb-1">← All orgs</Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm">
              {slug[0].toUpperCase()}
            </div>
            <span className="font-semibold text-sm truncate">{slug}</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const href = `${base}${item.href}`;
            const active = item.href === '' ? pathname === base : pathname.startsWith(href);
            return (
              <Link key={item.label} href={href}
                className={clsx('flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition', {
                  'bg-indigo-50 text-indigo-700 font-medium': active,
                  'text-gray-600 hover:bg-gray-50': !active,
                })}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <div className="text-xs text-gray-400 mb-1 truncate">{session?.user?.email}</div>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="text-xs text-gray-400 hover:text-red-500 transition">Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
