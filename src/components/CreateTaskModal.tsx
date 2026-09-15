import React, { useState } from 'react';
import { X, Calendar, Clock, Tag, Plus, Sparkles } from 'lucide-react';
import { TaskCreate } from '../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskCreate & { tags: string[] }) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(3);
  const [dueAt, setDueAt] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Android', 'Orchestration']);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      due_at: new Date(dueAt).toISOString(),
      tags
    });

    setTitle('');
    setDescription('');
    setPriority(3);
    setTags(['Android', 'Orchestration']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-card rounded-2xl p-6 border border-white/15 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2 rounded-xl bg-[#8083ff]/20 text-[#c0c1ff] border border-[#8083ff]/30">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Create Task / Reminder</h3>
            <p className="text-xs text-[#908fa0]">Dispatches to Myra Cloud and synchronizes with Android Room</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#c7c4d7] mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule meeting with Android security team"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#101415] border border-white/10 text-sm text-[#e0e3e5] placeholder-[#908fa0] focus:outline-none focus:border-[#8083ff]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c7c4d7] mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Detailed instructions or context for Myra AI..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#101415] border border-white/10 text-sm text-[#e0e3e5] placeholder-[#908fa0] focus:outline-none focus:border-[#8083ff]/60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-[#c7c4d7] mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={e => setPriority(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#101415] border border-white/10 text-sm text-[#e0e3e5] focus:outline-none focus:border-[#8083ff]/60"
              >
                <option value={5}>P5 - Urgent (SafetyNet Alert / Immediate)</option>
                <option value={4}>P4 - High Priority</option>
                <option value={3}>P3 - Medium / Standard</option>
                <option value={2}>P2 - Low Priority</option>
                <option value={1}>P1 - Minor / Backlog</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#c7c4d7] mb-1">Due Date &amp; Time</label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={e => setDueAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#101415] border border-white/10 text-sm text-[#e0e3e5] focus:outline-none focus:border-[#8083ff]/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c7c4d7] mb-1">Tags</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add tag (e.g. Sync, Security)..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#101415] border border-white/10 text-xs text-[#e0e3e5] focus:outline-none focus:border-[#8083ff]/60"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-[#191c1e] text-xs font-mono text-[#c0c1ff] border border-white/10 hover:bg-[#272a2c] cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-[#191c1e] text-xs font-mono text-[#c7c4d7] border border-white/10"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[#908fa0] hover:text-[#ffb4ab] ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#191c1e] text-xs text-[#c7c4d7] hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl glass-button text-xs font-semibold text-white cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create &amp; Sync</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
