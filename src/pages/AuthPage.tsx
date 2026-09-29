import { useState } from 'react';
import { Link as LinkIcon, Mail, Lock, ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';

interface AuthPageProps {
  onBack: () => void;
}

export function AuthPage({ onBack }: AuthPageProps) {
  const { signIn, signUp, session } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (session) {
    // Dashboard will render when App sees session — just render a blank
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = mode === 'login' ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      showToast(mode === 'login' ? 'Welcome back!' : 'Account created successfully!', 'success');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-bg overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <LinkIcon className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">ShortLinkX</span>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              Shorten links.
              <br />
              Track everything.
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Join thousands of teams using ShortLinkX for premium link management with real-time analytics.
            </p>
          </div>

          <div className="flex gap-8">
            {[
              { value: '2.4B+', label: 'Links' },
              { value: '99.99%', label: 'Uptime' },
              { value: '<10ms', label: 'Speed' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-500 transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">ShortLink<span className="gradient-text">X</span></span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            {mode === 'login' ? 'Welcome back' : 'Get started free'}
          </div>

          <h2 className="text-3xl font-extrabold mb-2">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {mode === 'login' ? 'Enter your credentials to access your dashboard' : 'Start shortening and tracking in seconds'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition btn-glow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 text-center">
            Theme: {theme === 'dark' ? 'Dark' : 'Light'} mode active
          </div>
        </div>
      </div>
    </div>
  );
}
