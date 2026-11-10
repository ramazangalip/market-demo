'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { LayoutDashboard, ShoppingCart, Package, Wallet, Store, Sun, Moon } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kasa', label: 'Hızlı Satış / Kasa', icon: ShoppingCart },
  { href: '/stok', label: 'Stok Yönetimi', icon: Package },
  { href: '/gelir-gider', label: 'Gelir - Gider', icon: Wallet },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 min-h-screen fixed left-0 top-0 z-40 transition-colors duration-200">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">MarketPOS</h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Akıllı Market Sistemi</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Theme Switcher */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              )}
              <span>{theme === 'dark' ? 'Koyu Tema' : 'Açık Tema'}</span>
            </div>
            <div className="w-9 h-5 bg-slate-200 dark:bg-emerald-600/40 rounded-full relative p-0.5 transition-colors">
              <div
                className={`w-4 h-4 rounded-full bg-white dark:bg-emerald-400 shadow-sm transition-transform duration-200 ${
                  theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          <div className="px-3 pt-2 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>MarketPOS v1.0</span>
            <span>2026</span>
          </div>
          <p className="px-3 pb-1 text-[10px] text-slate-400/80 dark:text-slate-500/80">
            Bu sistem{' '}
            <a
              href="https://visiondevstudio.com.tr/"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-slate-600 dark:hover:text-slate-300"
            >
              VisionDevStudio
            </a>{' '}
            tarafından tasarlanmıştır.
          </p>
        </div>
      </aside>

      {/* Mobile Top Bar with Theme Toggle */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <Store className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-white">MarketPOS</span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Temayı Değiştir"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 z-50 safe-area-bottom shadow-lg transition-colors duration-200">
        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400 scale-105' : ''}`} />
                <span className="truncate max-w-[64px]">{item.label.split('/')[0].trim()}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
