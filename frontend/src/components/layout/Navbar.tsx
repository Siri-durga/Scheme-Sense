'use client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { t, Lang } from '@/lib/i18n';
import { useState } from 'react';
import { Bell, LogOut, User, LayoutDashboard, BookOpen, Bookmark, MessageSquare, ShieldCheck, Globe, Search, Compass } from 'lucide-react';

interface NavbarProps { lang: Lang; onLangChange: (l: Lang) => void; }

export default function Navbar({ lang, onLangChange }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/login'); };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard', lang) },
    { href: '/dashboard/schemes', icon: BookOpen, label: t('mySchemes', lang) },
    { href: '/dashboard/saved', icon: Bookmark, label: t('saved', lang) },
    { href: '/chat', icon: MessageSquare, label: t('chat', lang) },
    { href: '/guidance', icon: Compass, label: t('guidance', lang) },
    { href: '/profile', icon: User, label: t('profile', lang) },
    ...(user?.role === 'admin' ? [{ href: '/admin', icon: ShieldCheck, label: t('admin', lang) }] : []),
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="india-stripe" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-green-700 transition">
              SS
            </div>
            <span className="font-bold text-green-700 text-lg hidden sm:block">{t('appName', lang)}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => onLangChange(lang === 'en' ? 'te' : 'en')}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              title="Switch Language"
            >
              <Globe size={14} />
              <span className="hidden sm:inline">{lang === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* User menu */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setMenuOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 hover:bg-green-100 transition"
                  >
                    <User size={14} />
                    <span className="hidden sm:inline max-w-24 truncate">{user?.full_name?.split(' ')[0]}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link href="/profile" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={14} /> {t('profile', lang)}
                      </Link>
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                        <LogOut size={14} /> {t('logout', lang)}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  <User size={14} />
                  <span>{t('login', lang)}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex overflow-x-auto gap-1 pb-2 pt-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                pathname === item.href ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <item.icon size={13} />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
