import { useState } from 'react';
import {
  Copy,
  Check,
  QrCode,
  ExternalLink,
  MoreVertical,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Lock,
  Clock,
  Tag as TagIcon,
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { buildShortUrl, formatNumber, timeAgo, isExpired } from '@/lib/shortener';
import { updateLink, deleteLink, incrementClickCount, recordClick } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import type { Link } from '@/lib/types';

interface LinkCardProps {
  link: Link;
  onQR: (link: Link) => void;
  onChanged: () => void;
}

export function LinkCard({ link, onQR, onChanged }: LinkCardProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const shortUrl = buildShortUrl(link.short_code);
  const expired = isExpired(link.expires_at);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVisit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Record a click and increment
    await Promise.all([recordClick(link.id), incrementClickCount(link.short_code)]);
    window.open(link.original_url, '_blank', 'noopener,noreferrer');
    onChanged();
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await updateLink(link.id, { is_active: !link.is_active });
      onChanged();
    } catch {
      showToast('Failed to update link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this short link? This cannot be undone.')) return;
    setLoading(true);
    try {
      await deleteLink(link.id);
      showToast('Link deleted', 'success');
      onChanged();
    } catch {
      showToast('Failed to delete link', 'error');
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-5 group hover:shadow-xl transition-all duration-200 cursor-default">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              /r/{link.short_code}
            </a>
            {link.password_hash && (
              <Badge variant="warning"><Lock className="w-3 h-3" /> Protected</Badge>
            )}
            {expired ? (
              <Badge variant="danger"><Clock className="w-3 h-3" /> Expired</Badge>
            ) : link.expires_at ? (
              <Badge variant="accent"><Clock className="w-3 h-3" /> {timeAgo(link.expires_at)}</Badge>
            ) : null}
            {!link.is_active && <Badge variant="danger">Disabled</Badge>}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-2">
            {link.title || link.original_url}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {link.original_url}
          </p>

          {link.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {link.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <TagIcon className="w-2.5 h-2.5" />{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="font-bold text-slate-700 dark:text-slate-200">{formatNumber(link.clicks_count)}</span> clicks
            </span>
            <span>Created {timeAgo(link.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition"
            title="Copy short URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onQR(link)}
            className="p-2 rounded-lg text-slate-400 hover:text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-950/30 transition"
            title="QR code"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={handleVisit}
            className="p-2 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
            title="Open original URL"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggle}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition disabled:opacity-50"
            title={link.is_active ? 'Disable link' : 'Enable link'}
          >
            {link.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-10 glass-card p-1 min-w-[140px] animate-scale-in">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
