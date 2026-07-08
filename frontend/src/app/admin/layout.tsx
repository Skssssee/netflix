'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Film, Layers, Image as ImageIcon, Share2, Radio, LogOut } from 'lucide-react';
import { useEffect } from 'react';
import axios from 'axios';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/admin/login') return;
    const token = localStorage.getItem('adminToken');
    if (!token) { router.replace('/admin/login'); return; }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    router.replace('/admin/login');
  };

  // Render login page without sidebar
  if (pathname === '/admin/login') return <>{children}</>;

  const navItems = [
    { name: 'Dashboard',   href: '/admin',           icon: LayoutDashboard },
    { name: 'Categories',  href: '/admin/categories', icon: Layers },
    { name: 'Movies',      href: '/admin/movies',     icon: Film },
    { name: 'Hero Sliders',href: '/admin/sliders',    icon: ImageIcon },
    { name: 'Social Links',href: '/admin/socials',    icon: Share2 },
    { name: 'Channels',    href: '/admin/channels',   icon: Radio },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-red-600 tracking-wider font-outfit">MIZOFY ADMIN</h1>
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-red-600/10 text-red-500' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold capitalize">
            {pathname.split('/').pop() || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 font-poppins">suman</span>
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-sm">S</div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
