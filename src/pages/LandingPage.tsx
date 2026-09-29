import { useState } from 'react';
import {
  Link as LinkIcon,
  Zap,
  BarChart3,
  QrCode,
  Shield,
  Globe,
  Check,
  ArrowRight,
  Moon,
  Sun,
  Menu,
  X,
  Copy,
  Sparkles,
  Gauge,
  Layers,
  Lock,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { generateShortCode, isValidUrl, normalizeUrl, buildShortUrl } from '@/lib/shortener';

interface LandingPageProps {
  onNavigate: (page: 'auth') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const { session } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [shortResult, setShortResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShorten = () => {
    setError('');
    if (!urlInput.trim()) {
      setError('Please enter a URL');
      return;
    }
    const normalized = normalizeUrl(urlInput);
    if (!isValidUrl(normalized)) {
      setError('Please enter a valid URL');
      return;
    }
    const code = generateShortCode(6);
    setShortResult(buildShortUrl(code));
  };

  const handleCopy = () => {
    if (shortResult) {
      navigator.clipboard.writeText(shortResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Base62 short codes with Redis-cached redirects for sub-10ms response times.', color: 'text-amber-500' },
    { icon: BarChart3, title: 'Smart Analytics', desc: 'Real-time click tracking with geographic, device, and referrer breakdowns.', color: 'text-brand-500' },
    { icon: QrCode, title: 'QR Codes', desc: 'Auto-generated QR codes with custom colors. Download as PNG or SVG.', color: 'text-accent-500' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Password-protected links, expiry rules, and abuse detection built in.', color: 'text-emerald-500' },
    { icon: Globe, title: 'Custom Domains', desc: 'Use your own branded domain like go.company.com for professional links.', color: 'text-rose-500' },
    { icon: Layers, title: 'Link Management', desc: 'Organize with folders, tags, search, and bulk actions. Stay in control.', color: 'text-violet-500' },
  ];

  const stats = [
    { value: '2.4B+', label: 'Links Created' },
    { value: '99.99%', label: 'Uptime' },
    { value: '<10ms', label: 'Redirect Time' },
    { value: '190+', label: 'Countries' },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'CMO, TechFlow', text: 'ShortLinkX transformed how we track campaign performance. The analytics dashboard is incredible.', avatar: 'SC' },
    { name: 'Marcus Rodriguez', role: 'Lead Dev, CloudScale', text: 'The API is clean, the redirects are instant, and the QR codes saved us hours. Best shortener we have used.', avatar: 'MR' },
    { name: 'Priya Patel', role: 'Growth Lead, DataMint', text: 'Real-time analytics let us spot traffic spikes instantly. The dashboard feels like a premium product.', avatar: 'PP' },
  ];

  const pricing = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['100 links/month', 'Basic analytics', 'QR codes', 'Custom aliases', '1 user'],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$12',
      period: 'per month',
      features: ['Unlimited links', 'Advanced analytics', 'Custom domains', 'Password protection', 'Expiry rules', 'Bulk import', 'Priority support'],
      cta: 'Start Pro Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      features: ['Everything in Pro', 'SSO / SAML', 'Audit logs', 'SLA guarantee', 'Dedicated support', 'On-premise option'],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-slate-200/40 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">ShortLink<span className="gradient-text">X</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 dark:text-slate-300 hover:text-brand-500 transition">Features</a>
            <a href="#analytics" className="text-sm text-slate-600 dark:text-slate-300 hover:text-brand-500 transition">Analytics</a>
            <a href="#pricing" className="text-sm text-slate-600 dark:text-slate-300 hover:text-brand-500 transition">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {session ? (
              <button
                onClick={() => onNavigate('auth')}
                className="hidden sm:inline-flex items-center gap-2 h-9 px-4 gradient-bg text-white text-sm font-medium rounded-xl hover:opacity-90 transition btn-glow"
              >
                Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('auth')}
                  className="hidden sm:inline-flex items-center gap-2 h-9 px-4 gradient-bg text-white text-sm font-medium rounded-xl hover:opacity-90 transition btn-glow"
                >
                  Sign In <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden glass border-t border-slate-200/40 dark:border-slate-800/40 p-4 flex flex-col gap-3 animate-slide-down">
            <a href="#features" onClick={() => setMobileMenu(false)} className="text-sm py-2">Features</a>
            <a href="#analytics" onClick={() => setMobileMenu(false)} className="text-sm py-2">Analytics</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="text-sm py-2">Pricing</a>
            <button onClick={() => onNavigate('auth')} className="h-10 gradient-bg text-white text-sm font-medium rounded-xl">
              {session ? 'Dashboard' : 'Sign In'}
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 dark:opacity-30" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">Fast Links. Smart Analytics.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight animate-slide-up">
            Shorten links.
            <br />
            <span className="gradient-text">Track everything.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto animate-slide-up animate-delay-200">
            The premium URL shortener with real-time analytics, QR codes, and branded links.
            Built for teams who care about performance.
          </p>

          {/* Live Demo */}
          <div className="mt-10 max-w-2xl mx-auto animate-slide-up animate-delay-300">
            <div className="glass-card p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-4">
                <LinkIcon className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                  placeholder="Paste your long URL here..."
                  className="flex-1 h-12 bg-transparent outline-none text-base placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={handleShorten}
                className="h-12 px-6 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition btn-glow whitespace-nowrap"
              >
                Shorten
              </button>
            </div>

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

            {shortResult && (
              <div className="mt-4 glass-card p-4 flex items-center gap-3 animate-scale-in">
                <div className="flex-1 text-left">
                  <p className="text-xs text-slate-400 mb-0.5">Your short link</p>
                  <p className="font-mono text-brand-600 dark:text-brand-400 font-medium truncate">{shortResult}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 h-9 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}

            <p className="mt-3 text-xs text-slate-400">
              Demo only — sign up to save and track your links
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in animate-delay-500">
            <button
              onClick={() => onNavigate('auth')}
              className="h-12 px-8 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition btn-glow"
            >
              Get Started Free
            </button>
            <a
              href="#features"
              className="h-12 px-8 flex items-center gap-2 glass font-semibold rounded-xl hover:bg-white/90 dark:hover:bg-slate-900/90 transition"
            >
              Explore Features <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative py-12 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold gradient-text">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold">
              Everything you need to <span className="gradient-text">manage links</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From shortening to analytics to QR codes — ShortLinkX has it all in one beautiful platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass-card p-6 group hover:scale-[1.02] transition-all duration-300 cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section id="analytics" className="py-20 sm:py-28 bg-gradient-to-b from-transparent to-brand-50/50 dark:to-brand-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium mb-4">
                <Gauge className="w-4 h-4" /> Real-time Analytics
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold mb-6">
                See every click as it happens
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Beautiful charts show click timelines, geographic distribution, device breakdowns,
                and referrer sources. Know exactly where your traffic comes from.
              </p>
              <ul className="space-y-3">
                {['Live click counter with WebSocket updates', 'Country, device, browser & OS breakdown', 'Referrer tracking and traffic source analysis', 'Top performing links at a glance'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="glass-card p-6 animate-slide-up">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { label: 'Total Clicks', value: '48.2K', icon: BarChart3, color: 'text-brand-500' },
                  { label: 'Active Links', value: '127', icon: LinkIcon, color: 'text-accent-500' },
                  { label: 'Unique Visitors', value: '31.5K', icon: Globe, color: 'text-emerald-500' },
                  { label: 'Top Link', value: '12.4K', icon: Zap, color: 'text-amber-500' },
                ].map((card, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Click Timeline</p>
                <div className="flex items-end gap-2 h-32">
                  {[40, 65, 45, 80, 55, 90, 70, 100, 75, 85, 60, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 gradient-bg rounded-t-md transition-all hover:opacity-80"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold">
              Loved by <span className="gradient-text">teams worldwide</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-6">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 bg-gradient-to-b from-transparent to-accent-50/30 dark:to-accent-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold">
              Simple, <span className="gradient-text">transparent pricing</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((plan, i) => (
              <div
                key={i}
                className={`glass-card p-6 relative ${plan.popular ? 'ring-2 ring-brand-500 scale-[1.02]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 gradient-bg text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <p className="text-lg font-semibold">{plan.name}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">/{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate('auth')}
                  className={`mt-6 w-full h-11 rounded-xl font-semibold text-sm transition ${
                    plan.popular
                      ? 'gradient-bg text-white hover:opacity-90 btn-glow'
                      : 'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative glass-card p-12 text-center overflow-hidden">
            <div className="absolute inset-0 gradient-bg opacity-10" />
            <div className="relative">
              <Lock className="w-12 h-12 text-brand-500 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Ready to shorten smarter?
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of teams using ShortLinkX to manage, track, and optimize their links.
              </p>
              <button
                onClick={() => onNavigate('auth')}
                className="h-12 px-8 gradient-bg text-white font-semibold rounded-xl hover:opacity-90 transition btn-glow"
              >
                Create Your Free Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">ShortLinkX</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Fast Links. Smart Analytics.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Analytics', 'Pricing', 'QR Codes'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Status', 'Support'] },
            ].map((col, i) => (
              <div key={i}>
                <p className="font-semibold text-sm mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-500 transition">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">© 2026 ShortLinkX. All rights reserved.</p>
            <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
              <a href="#" className="hover:text-brand-500 transition">Privacy</a>
              <a href="#" className="hover:text-brand-500 transition">Terms</a>
              <a href="#" className="hover:text-brand-500 transition">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
