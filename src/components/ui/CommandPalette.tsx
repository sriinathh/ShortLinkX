import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';

export interface CommandAction {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  section: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  actions: CommandAction[];
}

export function CommandPalette({ open, onClose, actions }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const sections = Array.from(new Set(filtered.map((a) => a.section)));

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const action = filtered[selected];
      if (action) {
        action.action();
        onClose();
      }
    }
  };

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-xl overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={handleKey}
            placeholder="Type a command or search..."
            className="flex-1 h-14 bg-transparent text-base outline-none placeholder:text-slate-400"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">
            <Command className="w-3 h-3" /> K
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">No results found</p>
          )}
          {sections.map((section) => (
            <div key={section}>
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {section}
              </p>
              {filtered
                .filter((a) => a.section === section)
                .map((action) => {
                  runningIndex++;
                  const idx = runningIndex;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelected(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                        selected === idx
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {action.icon || <ArrowRight className="w-4 h-4" />}
                      <span className="flex-1 text-left text-sm">{action.label}</span>
                      {action.shortcut && (
                        <kbd className="text-xs text-slate-400">{action.shortcut}</kbd>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
