import { useState, useEffect } from 'react';
import { Link2, Tag, Folder as FolderIcon, Lock, Clock, Loader2, Sparkles, Check } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { generateShortCode, isValidUrl, normalizeUrl, isValidCustomCode, hashPassword } from '@/lib/shortener';
import { createLink, getFolders } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import type { Link, Folder } from '@/lib/types';

interface CreateLinkModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (link: Link) => void;
}

export function CreateLinkModal({ open, onClose, onCreated }: CreateLinkModalProps) {
  const { showToast } = useToast();
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [folderId, setFolderId] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [password, setPassword] = useState('');
  const [expiry, setExpiry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    if (open) {
      getFolders().then(setFolders).catch(() => {});
      setGeneratedCode(generateShortCode(6));
    }
  }, [open]);

  const reset = () => {
    setUrl('');
    setCustomCode('');
    setTitle('');
    setTags('');
    setFolderId('');
    setPassword('');
    setExpiry('');
    setShowAdvanced(false);
    setError('');
    setGeneratedCode(generateShortCode(6));
  };

  const handleSubmit = async () => {
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    const normalized = normalizeUrl(url);
    if (!isValidUrl(normalized)) {
      setError('Please enter a valid URL');
      return;
    }

    const code = customCode.trim() || generatedCode;
    if (customCode && !isValidCustomCode(customCode)) {
      setError('Custom alias must be 3-30 alphanumeric characters (dashes/underscores allowed)');
      return;
    }

    setLoading(true);
    try {
      const passwordHash = password ? await hashPassword(password) : null;
      const link = await createLink({
        original_url: normalized,
        short_code: code,
        title: title.trim() || undefined,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        folder_id: folderId || null,
        password_hash: passwordHash,
        expires_at: expiry ? new Date(expiry).toISOString() : null,
      });
      showToast('Short link created successfully!', 'success');
      onCreated(link);
      reset();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create link';
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setError('This short code is already taken. Try another one.');
        setGeneratedCode(generateShortCode(6));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Short Link" size="md">
      <div className="space-y-4">
        <Input
          label="Destination URL"
          placeholder="https://example.com/very/long/url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          icon={<Link2 className="w-4 h-4" />}
          error={error || undefined}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Custom alias <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder={generatedCode || 'my-link'}
              className="flex-1 h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 text-sm transition font-mono"
            />
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                const c = generateShortCode(6);
                setGeneratedCode(c);
                setCustomCode('');
              }}
            >
              <Sparkles className="w-4 h-4" /> Random
            </Button>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {customCode ? `Short link: /r/${customCode}` : `Will use: /r/${generatedCode}`}
          </p>
        </div>

        <Input
          label="Title"
          placeholder="My awesome link"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          icon={<Tag className="w-4 h-4" />}
        />

        <Input
          label="Tags (comma-separated)"
          placeholder="marketing, campaign, social"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          icon={<Tag className="w-4 h-4" />}
        />

        {folders.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Folder <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 text-sm transition"
            >
              <option value="">No folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline"
        >
          <FolderIcon className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} advanced options
        </button>

        {showAdvanced && (
          <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 animate-slide-down">
            <Input
              label="Password protection"
              type="password"
              placeholder="Leave empty for no password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />
            <Input
              label="Expiry date"
              type="datetime-local"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              icon={<Clock className="w-4 h-4" />}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            {!loading && <Check className="w-4 h-4" />}
            Create Link
          </Button>
        </div>
      </div>
    </Modal>
  );
}
