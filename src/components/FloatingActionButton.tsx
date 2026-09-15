import React from 'react';
import { Plus, Bot, Sparkles } from 'lucide-react';

interface FloatingActionButtonProps {
  onOpenCreateTask: () => void;
  onOpenVoicePrompt: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onOpenCreateTask,
  onOpenVoicePrompt
}) => {
  return (
    <div className="fixed bottom-20 md:bottom-8 right-6 z-40 flex flex-col items-end space-y-3">
      {/* Quick Voice Assistant Bubble */}
      <button
        id="fab-voice-prompt"
        onClick={onOpenVoicePrompt}
        title="Open Myra AI Voice Orchestrator"
        className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#1d2022] hover:bg-[#272a2c] text-xs font-mono text-[#c0c1ff] border border-[#8083ff]/40 shadow-xl shadow-black/50 transition-all transform hover:scale-105 cursor-pointer"
      >
        <Bot className="w-4 h-4 text-[#4cd7f6] animate-pulse" />
        <span className="hidden sm:inline">Ask Myra</span>
      </button>

      {/* Main Elevated Glass FAB */}
      <button
        id="fab-create-task"
        onClick={onOpenCreateTask}
        title="Quick Create Task"
        className="w-14 h-14 rounded-full glass-button flex items-center justify-center text-white shadow-2xl shadow-[#494bd6]/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
        aria-label="Create new task"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
