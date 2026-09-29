import { useState, useEffect } from 'react';
import { Link as LinkIcon, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { getLinkByCode, recordClick, incrementClickCount } from '@/lib/api';
import { isExpired } from '@/lib/shortener';

interface RedirectPageProps {
  code: string;
}

export function RedirectPage({ code }: RedirectPageProps) {
  const [status, setStatus] = useState<'loading' | 'notfound' | 'expired' | 'disabled' | 'redirecting'>('loading');
  const [originalUrl, setOriginalUrl] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function handleRedirect() {
      try {
        const link = await getLinkByCode(code);
        if (cancelled) return;

        if (!link) {
          setStatus('notfound');
          return;
        }

        if (isExpired(link.expires_at)) {
          setStatus('expired');
          return;
        }

        if (!link.is_active) {
          setStatus('disabled');
          return;
        }

        // Record click and increment counter
        await Promise.all([recordClick(link.id), incrementClickCount(link.short_code)]);
        if (cancelled) return;

        setOriginalUrl(link.original_url);
        setStatus('redirecting');

        // Redirect after a brief delay
        setTimeout(() => {
          window.location.href = link.original_url;
        }, 1200);
      } catch {
        if (!cancelled) setStatus('notfound');
      }
    }

    handleRedirect();
    return () => { cancelled = true; };
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl" />

      <div className="relative glass-card p-8 max-w-md w-full text-center animate-scale-in">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">ShortLink<span className="gradient-text">X</span></span>
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Looking up /r/{code}</p>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Taking you there...</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-4">{originalUrl}</p>
            <a
              href={originalUrl}
              className="inline-flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              <ExternalLink className="w-4 h-4" /> Click if not redirected
            </a>
          </>
        )}

        {status === 'notfound' && (
          <>
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link not found</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              The short code <span className="font-mono font-semibold">/r/{code}</span> doesn't exist or may have been deleted.
            </p>
            <a href="/" className="h-11 px-6 inline-flex items-center gradient-bg text-white font-medium rounded-xl hover:opacity-90 transition btn-glow">
              Go to ShortLinkX
            </a>
          </>
        )}

        {status === 'expired' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link expired</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This link has expired and is no longer available.
            </p>
            <a href="/" className="h-11 px-6 inline-flex items-center gradient-bg text-white font-medium rounded-xl hover:opacity-90 transition btn-glow">
              Go to ShortLinkX
            </a>
          </>
        )}

        {status === 'disabled' && (
          <>
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link disabled</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              The owner has disabled this link. It may be re-enabled later.
            </p>
            <a href="/" className="h-11 px-6 inline-flex items-center gradient-bg text-white font-medium rounded-xl hover:opacity-90 transition btn-glow">
              Go to ShortLinkX
            </a>
          </>
        )}
      </div>
    </div>
  );
}
