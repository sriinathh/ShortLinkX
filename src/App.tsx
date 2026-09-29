import { useEffect, useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { RedirectPage } from '@/pages/RedirectPage';

type Route = 'landing' | 'auth' | 'dashboard' | 'redirect';

function getRouteFromHash(): { route: Route; param: string } {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { route: 'landing', param: '' };
  if (parts[0] === 'auth') return { route: 'auth', param: '' };
  if (parts[0] === 'dashboard') return { route: 'dashboard', param: '' };
  if (parts[0] === 'r' && parts[1]) return { route: 'redirect', param: parts[1] };

  return { route: 'landing', param: '' };
}

function navigate(route: Route) {
  if (route === 'landing') window.location.hash = '/';
  else if (route === 'auth') window.location.hash = '/auth';
  else if (route === 'dashboard') window.location.hash = '/dashboard';
}

function AppContent() {
  const { session, loading } = useAuth();
  const [{ route, param }, setRouteState] = useState(getRouteFromHash());

  useEffect(() => {
    const handler = () => setRouteState(getRouteFromHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Auto-redirect to dashboard when user signs in
  useEffect(() => {
    if (session && route === 'auth') {
      navigate('dashboard');
    }
    if (!session && route === 'dashboard' && !loading) {
      navigate('auth');
    }
  }, [session, route, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (route === 'redirect' && param) {
    return <RedirectPage code={param} />;
  }

  if (route === 'auth') {
    if (session) {
      return <DashboardPage />;
    }
    return <AuthPage onBack={() => navigate('landing')} />;
  }

  if (route === 'dashboard') {
    if (!session) {
      return <AuthPage onBack={() => navigate('landing')} />;
    }
    return <DashboardPage />;
  }

  return <LandingPage onNavigate={() => navigate('auth')} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
