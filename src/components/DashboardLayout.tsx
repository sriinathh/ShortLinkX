import { useState, useEffect, type ReactNode } from 'react';
import {
  Link as LinkIcon,
  LayoutDashboard,
  BarChart3,

  LogOut,
  Moon,
  Sun,
  Search,
  Menu,
  X,
  Plus,
  Command as CommandIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CommandPalette, type CommandAction } from './ui/CommandPalette';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: 'links' | 'analytics';
  onTabChange: (tab: 'links' | 'analytics') => void;
  onCreateLink: () => void;
}

export function DashboardLayout({ children, activeTab, onTabChange, onCreateLink }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const navItems = [
    { id: 'links' as const, label: 'My Links', icon: LayoutDashboard },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  ];

  const commandActions: CommandAction[] = [
    { id: 'create-link', label: 'Create new short link', icon: <Plus className="w-4 h-4" />, section: 'Actions', action: onCreateLink, shortcut: 'N' },
    { id: 'goto-links', label: 'Go to My Links', icon: <LayoutDashboard className="w-4 h-4" />, section: 'Navigation', action: () => onTabChange('links') },
    { id: 'goto-analytics', label: 'Go to Analytics', icon: <BarChart3 className="w-4 h-4" />, section: 'Navigation', action: () => onTabChange('analytics') },
    { id: 'toggle-theme', label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`, icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, section: 'Settings', action: toggleTheme },
    { id: 'sign-out', label: 'Sign out', icon: <LogOut className="w-4 h-4" />, section: 'Account', action: signOut },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Keyboard shortcut for command palette */}
      <CommandPaletteHandler onOpen={() => setPaletteOpen(true)} />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        actions={commandActions}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 glass border-r border-slate-200/40 dark:border-slate-800/40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">ShortLink<span className="gradient-text">X</span></span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 mt-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === item.id
                  ? 'gradient-bg text-white btn-glow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200/40 dark:border-slate-800/40">
          <button
            onClick={onCreateLink}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium gradient-bg text-white hover:opacity-90 transition btn-glow"
          >
            <Plus className="w-5 h-5" /> Create Link
          </button>

          <div className="mt-3 flex items-center gap-3 p-2 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.email}</p>
              <p className="text-xs text-slate-400">Free Plan</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass border-b border-slate-200/40 dark:border-slate-800/40 h-16 flex items-center gap-4 px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search links..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Quick search could trigger a custom event
                  window.dispatchEvent(new CustomEvent('slx-search', { detail: (e.target as HTMLInputElement).value }));
                }
              }}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-sm transition"
            />
          </div>

          <div className="flex-1 sm:flex-none" />

          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <CommandIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick actions</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded text-[10px]">⌘K</kbd>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

function CommandPaletteHandler({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpen]);
  return null;
}
