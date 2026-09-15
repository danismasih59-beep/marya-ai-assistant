import React, { useState } from 'react';
import { X, Database, Plus, Trash2, CheckCircle2, Zap, Sparkles } from 'lucide-react';
import { RoomMemoryItem } from '../types';

interface MemoryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: RoomMemoryItem[];
  onAddMemory: (memory: { key: string; value: string; category: string }) => void;
  onDeleteMemory: (id: string) => void;
}

export const MemoryInspectorModal: React.FC<MemoryInspectorModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    onAddMemory({
      key: newKey.trim(),
      value: newValue.trim(),
      category: newCategory
    });

    setNewKey('');
    setNewValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-card rounded-2xl p-6 border border-white/15 shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#8083ff]/20 text-[#c0c1ff] border border-[#8083ff]/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Android Room Memory Vectors</h3>
              <p className="text-xs text-[#908fa0]">Offline key-value store synchronized with PostgreSQL</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#908fa0] hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
          {memories.map(mem => (
            <div
              key={mem.id}
              className="p-3.5 rounded-xl bg-[#101415] border border-white/10 flex items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-[#4cd7f6]">{mem.key}</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#191c1e] text-[#8083ff] border border-[#8083ff]/20">
                    {mem.category}
                  </span>
                  <span className="text-[9px] font-mono text-[#908fa0]">Synced: {new Date(mem.synced_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-[#e0e3e5] mt-1 font-sans leading-relaxed">{mem.value}</p>
              </div>

              <button
                onClick={() => onDeleteMemory(mem.id)}
                className="p-1.5 rounded-lg text-[#908fa0] hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-all shrink-0"
                title="Delete memory"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Memory Form */}
        <form onSubmit={handleAdd} className="pt-4 border-t border-white/10 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              placeholder="Memory Key (e.g. gym_locker_code)"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#101415] border border-white/10 text-xs font-mono text-[#e0e3e5] focus:outline-none focus:border-[#8083ff]/60"
            />
            <input
              type="text"
              required
              placeholder="Value / Content"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#101415] border border-white/10 text-xs text-[#e0e3e5] focus:outline-none focus:border-[#8083ff]/60"
            />
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#101415] border border-white/10 text-xs text-[#e0e3e5] focus:outline-none focus:border-[#8083ff]/60"
            >
              <option value="Personal">Personal</option>
              <option value="Security">Security</option>
              <option value="Health">Health</option>
              <option value="Work">Work</option>
              <option value="Device">Device</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#908fa0]">Vectors are automatically hashed for differential cloud synchronization.</span>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl glass-button text-xs font-semibold text-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vector</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
