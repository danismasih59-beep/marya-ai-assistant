import React, { useState } from 'react';
import { 
  FileText, 
  Terminal, 
  Code2, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  Copy, 
  Check, 
  Tag,
  Bookmark,
  Play
} from 'lucide-react';
import { AssistantNote } from '../types';

interface ScriptsNotesSectionProps {
  onExecutePrompt: (promptText: string) => void;
  onAddNote: (note: { title: string; category: string; content: string; tags: string[] }) => void;
}

export const ScriptsNotesSection: React.FC<ScriptsNotesSectionProps> = ({
  onExecutePrompt,
  onAddNote
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Automation');
  const [newContent, setNewContent] = useState('');

  const [notes, setNotes] = useState<AssistantNote[]>([
    {
      id: 'note-1',
      title: 'Auto-Sync Android Room with PostgreSQL',
      category: 'Pipeline',
      content: 'Coroutine-based background worker in Kotlin polls differential vector hash every 15 minutes or when network state transitions to UNMETERED_WIFI.',
      created_at: '2026-08-28T04:30:00Z',
      priority: 'high',
      tags: ['WorkManager', 'Coroutines', 'RoomDB']
    },
    {
      id: 'note-2',
      title: 'FastAPI AI Intent Router Dispatcher',
      category: 'Orchestrator',
      content: 'Accepts ActionIntent payloads from @ai_router.post("/process"). Resolves CREATE_CALENDAR_EVENT, CREATE_TASK, and SYSTEM_SECURITY_SCAN with sub-50ms latency.',
      created_at: '2026-08-27T22:15:00Z',
      priority: 'normal',
      tags: ['FastAPI', 'ActionIntent', 'Pydantic']
    },
    {
      id: 'note-3',
      title: 'Zero-Trust SafetyNet & Root Detection Hook',
      category: 'Security',
      content: 'Device security audit verifies /system/bin/su absence, test-keys build tags, and executes Google Play Integrity attestation with nonce challenge.',
      created_at: '2026-08-27T18:00:00Z',
      priority: 'high',
      tags: ['PlayIntegrity', 'dm-verity', 'SafetyNet']
    }
  ]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const noteItem: AssistantNote = {
      id: `note-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      content: newContent,
      created_at: new Date().toISOString(),
      priority: 'normal',
      tags: [newCategory, 'MyraCloud']
    };

    setNotes([noteItem, ...notes]);
    onAddNote(noteItem);
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  return (
    <div className="col-span-12 flex flex-col space-y-4">
      {/* Container Header */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#8083ff] glow-dot-primary" />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Scripts, Memory Notes &amp; Hooks</h2>
            <p className="text-xs text-[#908fa0] mt-0.5">
              Live developer notes, orchestrator runbooks, and Android system hooks
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#1d2022] hover:bg-[#272a2c] text-xs font-semibold text-[#c0c1ff] border border-white/10 hover:border-[#8083ff]/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note / Hook</span>
          </button>
        </div>
      </div>

      {/* 3-Column Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {notes.map(note => (
          <div
            key={note.id}
            id={`script-card-${note.id}`}
            className="glass-card glass-card-hover rounded-2xl p-5 border border-white/10 flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#191c1e] text-[#4cd7f6] border border-[#4cd7f6]/20">
                  {note.category}
                </span>
                <button
                  onClick={() => handleCopy(note.id, note.content)}
                  className="p-1 rounded-md text-[#908fa0] hover:text-[#c0c1ff] hover:bg-white/5 transition-all"
                  title="Copy snippet"
                >
                  {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-[#4cd7f6]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <h3 className="text-sm font-semibold text-white tracking-tight mt-3 group-hover:text-[#c0c1ff] transition-colors">
                {note.title}
              </h3>

              <p className="text-xs text-[#c7c4d7] mt-2 line-clamp-4 leading-relaxed font-sans">
                {note.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] font-mono text-[#908fa0] bg-[#101415] px-1.5 py-0.5 rounded border border-white/5">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onExecutePrompt(`Execute action for: ${note.title}`)}
                className="flex items-center space-x-1 text-[11px] font-mono text-[#8083ff] hover:text-[#4cd7f6] transition-colors"
                title="Run via Myra AI Voice Orchestrator"
              >
                <span>Run</span>
                <Play className="w-2.5 h-2.5 fill-current" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg glass-card rounded-2xl p-6 border border-white/15 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create Environment Note / Hook</h3>
            <p className="text-xs text-[#908fa0] mb-4">Add architecture notes or automated assistant memory hooks</p>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#c7c4d7] mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Battery Optimizer Routine"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101415] border border-white/10 text-sm text-[#e0e3e5] focus:outline-none focus:border-[#8083ff]/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#c7c4d7] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#101415] border border-white/10 text-sm text-[#e0e3e5] focus:outline-none focus:border-[#8083ff]/60"
                  >
                    <option value="Pipeline">Pipeline</option>
                    <option value="Orchestrator">Orchestrator</option>
                    <option value="Security">Security</option>
                    <option value="Routine">Routine</option>
                    <option value="Database">Database</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#c7c4d7] mb-1">Content / Specification</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed technical execution logic or note..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#101415] border border-white/10 text-sm text-[#e0e3e5] focus:outline-none focus:border-[#8083ff]/60"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#191c1e] text-xs text-[#c7c4d7] hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl glass-button text-xs font-semibold text-white cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
