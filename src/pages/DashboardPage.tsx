import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Link as LinkIcon,
  BarChart3,
  Globe,
  Zap,
  Search,
  Filter,
  ArrowUpDown,
  Inbox,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CreateLinkModal } from '@/components/CreateLinkModal';
import { LinkCard } from '@/components/LinkCard';
import { QRModal } from '@/components/ui/QRModal';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { getLinks, getAllClicksForUser } from '@/lib/api';
import { formatNumber, buildShortUrl } from '@/lib/shortener';
import type { Link, Click } from '@/lib/types';

type SortBy = 'newest' | 'clicks' | 'expiring';
type StatusFilter = 'all' | 'active' | 'disabled' | 'expired';

export function DashboardPage() {
  const [tab, setTab] = useState<'links' | 'analytics'>('links');
  const [createOpen, setCreateOpen] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [qrLink, setQrLink] = useState<Link | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [linksData, clicksData] = await Promise.all([
        getLinks(),
        getAllClicksForUser([]),
      ]);
      setLinks(linksData);
      if (linksData.length > 0) {
        const allClicks = await getAllClicksForUser(linksData.map((l) => l.id));
        setClicks(allClicks);
      } else {
        setClicks([]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen for search events from the top bar
  useEffect(() => {
    const handler = (e: Event) => setSearch((e as CustomEvent<string>).detail || '');
    window.addEventListener('slx-search', handler as EventListener);
    return () => window.removeEventListener('slx-search', handler as EventListener);
  }, []);

  const filteredLinks = useMemo(() => {
    let result = links;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.short_code.toLowerCase().includes(q) ||
          l.original_url.toLowerCase().includes(q) ||
          (l.title?.toLowerCase().includes(q) ?? false) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (statusFilter === 'active') result = result.filter((l) => l.is_active && !isExpiredLink(l));
    else if (statusFilter === 'disabled') result = result.filter((l) => !l.is_active);
    else if (statusFilter === 'expired') result = result.filter((l) => isExpiredLink(l));

    if (sortBy === 'newest') result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === 'clicks') result = [...result].sort((a, b) => b.clicks_count - a.clicks_count);
    else if (sortBy === 'expiring') result = [...result].filter((l) => l.expires_at).sort((a, b) => new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime());

    return result;
  }, [links, search, sortBy, statusFilter]);

  const stats = useMemo(() => {
    const totalClicks = links.reduce((sum, l) => sum + l.clicks_count, 0);
    const activeLinks = links.filter((l) => l.is_active && !isExpiredLink(l)).length;
    const uniqueVisitors = new Set(clicks.map((c) => c.ip_hash || c.id)).size;
    const topLink = links.length > 0 ? [...links].sort((a, b) => b.clicks_count - a.clicks_count)[0] : null;
    return { totalClicks, activeLinks, uniqueVisitors, topLink };
  }, [links, clicks]);

  const statCards = [
    { label: 'Total Clicks', value: formatNumber(stats.totalClicks), icon: BarChart3, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-950/30' },
    { label: 'Active Links', value: String(stats.activeLinks), icon: LinkIcon, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-950/30' },
    { label: 'Unique Visitors', value: formatNumber(stats.uniqueVisitors), icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Top Link', value: stats.topLink ? formatNumber(stats.topLink.clicks_count) : '0', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ];

  return (
    <DashboardLayout activeTab={tab} onTabChange={setTab} onCreateLink={() => setCreateOpen(true)}>
      <CreateLinkModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => refresh()}
      />

      <QRModal
        open={!!qrLink}
        onClose={() => setQrLink(null)}
        url={qrLink ? buildShortUrl(qrLink.short_code) : ''}
        shortCode={qrLink?.short_code || ''}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card p-4 sm:p-5">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold">{card.value}</p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {tab === 'links' ? (
        <>
          {/* Filters bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by URL, title, tag, or code..."
                className="w-full h-10 pl-10 pr-4 rounded-xl glass border border-slate-200/60 dark:border-slate-700/60 outline-none focus:border-brand-500 text-sm transition"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="h-10 pl-9 pr-8 rounded-xl glass border border-slate-200/60 dark:border-slate-700/60 outline-none focus:border-brand-500 text-sm transition appearance-none cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="h-10 pl-9 pr-8 rounded-xl glass border border-slate-200/60 dark:border-slate-700/60 outline-none focus:border-brand-500 text-sm transition appearance-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="clicks">Most Clicked</option>
                  <option value="expiring">Expiring Soon</option>
                </select>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="h-10 px-4 gradient-bg text-white text-sm font-medium rounded-xl hover:opacity-90 transition btn-glow flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Link</span>
              </button>
            </div>
          </div>

          {/* Links list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-5">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {search || statusFilter !== 'all' ? 'No links match your filters' : 'No links yet'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first short link to get started'}
              </p>
              {!search && statusFilter === 'all' && (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="h-11 px-6 gradient-bg text-white font-medium rounded-xl hover:opacity-90 transition btn-glow inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Your First Link
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {filteredLinks.length} {filteredLinks.length === 1 ? 'link' : 'links'}
              </p>
              {filteredLinks.map((link) => (
                <LinkCard key={link.id} link={link} onQR={setQrLink} onChanged={refresh} />
              ))}
            </div>
          )}
        </>
      ) : (
        <AnalyticsCharts clicks={clicks} links={links} />
      )}
    </DashboardLayout>
  );
}

function isExpiredLink(link: Link): boolean {
  if (!link.expires_at) return false;
  return new Date(link.expires_at).getTime() < Date.now();
}
