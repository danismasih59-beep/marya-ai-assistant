import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Tag, 
  Trash2, 
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  Sparkles,
  Play
} from 'lucide-react';
import { TaskResponse, TaskStatus } from '../types';

interface RemindersSectionProps {
  tasks: TaskResponse[];
  onToggleStatus: (taskId: string, currentStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenCreateModal: () => void;
  onUpdatePriority: (taskId: string, priority: number) => void;
}

export const RemindersSection: React.FC<RemindersSectionProps> = ({
  tasks,
  onToggleStatus,
  onDeleteTask,
  onOpenCreateModal,
  onUpdatePriority
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<number | 'ALL'>('ALL');

  const filteredTasks = tasks.filter(task => {
    const matchesTab = filterTab === 'ALL' || task.status === filterTab;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (task.tags && task.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    return matchesTab && matchesSearch && matchesPriority;
  });

  const getPriorityBadge = (priority: number) => {
    if (priority >= 4) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] glow-dot-error animate-pulse"></span>
          <span>P{priority} Urgent</span>
        </span>
      );
    }
    if (priority === 3) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>P{priority} Medium</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]"></span>
        <span>P{priority} Normal</span>
      </span>
    );
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return `Overdue (${date.toLocaleDateString([], { month: 'short', day: 'numeric' })})`;
    }
    if (diffHours <= 24) {
      return `Due in ${diffHours}h`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="col-span-12 lg:col-span-8 flex flex-col space-y-4">
      {/* Container Header */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#8083ff] glow-dot-primary" />
            <h2 className="text-xl font-bold tracking-tight text-white">Active Reminders &amp; Tasks</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#191c1e] text-[#c0c1ff] border border-[#8083ff]/30">
              {filteredTasks.length} items
            </span>
          </div>
          <p className="text-xs text-[#908fa0] mt-1">
            Synchronized with Android Room database and Postgres cloud orchestration
          </p>
        </div>

        <button
          id="btn-create-task-main"
          onClick={onOpenCreateModal}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl glass-button text-white text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(tab => (
            <button
              key={tab}
              id={`filter-tab-${tab.toLowerCase()}`}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                filterTab === tab
                  ? 'bg-[#8083ff]/25 text-[#c0c1ff] border border-[#8083ff]/40 shadow-sm'
                  : 'text-[#908fa0] hover:text-[#e0e3e5] hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab === 'ALL' ? 'All Tasks' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search and Priority Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#908fa0]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#101415] border border-white/10 text-xs text-[#e0e3e5] placeholder-[#908fa0] focus:outline-none focus:border-[#8083ff]/60"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-xl bg-[#101415] border border-white/10 text-xs text-[#c7c4d7] focus:outline-none focus:border-[#8083ff]/60"
          >
            <option value="ALL">All Priorities</option>
            <option value={5}>P5 Urgent</option>
            <option value={4}>P4 High</option>
            <option value={3}>P3 Medium</option>
            <option value={2}>P2 Low</option>
            <option value={1}>P1 Minor</option>
          </select>
        </div>
      </div>

      {/* Task List Items */}
      <div className="flex flex-col space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
            <AlertCircle className="w-8 h-8 text-[#908fa0] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-[#c7c4d7]">No tasks found</p>
            <p className="text-xs text-[#908fa0] mt-1">Try changing filters or ask Myra AI via voice prompt to schedule a task.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = task.status === TaskStatus.COMPLETED;
            const isInProgress = task.status === TaskStatus.IN_PROGRESS;

            return (
              <div
                key={task.id}
                id={`task-card-${task.id}`}
                className={`glass-card glass-card-hover rounded-2xl p-4 transition-all duration-200 border ${
                  isCompleted 
                    ? 'border-white/5 opacity-70 bg-[#141719]/40' 
                    : task.priority >= 4 
                      ? 'border-[#ffb4ab]/25 bg-[#1d2022]/80' 
                      : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left: Checkbox & Content */}
                  <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                    <button
                      id={`task-toggle-${task.id}`}
                      onClick={() => onToggleStatus(task.id, task.status)}
                      className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-[#4cd7f6] text-[#101415] shadow-[0_0_8px_rgba(76,215,246,0.5)]'
                          : isInProgress
                            ? 'border-2 border-[#8083ff] text-[#8083ff]'
                            : 'border-2 border-[#908fa0]/60 hover:border-[#c0c1ff] text-transparent'
                      }`}
                      aria-label={`Mark task ${task.title} as ${isCompleted ? 'pending' : 'completed'}`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : isInProgress ? <div className="w-1.5 h-1.5 rounded-full bg-[#8083ff]" /> : null}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-sm font-semibold tracking-tight transition-all ${
                          isCompleted ? 'line-through text-[#908fa0]' : 'text-[#e0e3e5]'
                        }`}>
                          {task.title}
                        </h3>
                        {getPriorityBadge(task.priority)}
                        {isInProgress && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#8083ff]/15 text-[#c0c1ff] border border-[#8083ff]/30">
                            In Progress
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className={`text-xs mt-1.5 line-clamp-2 ${isCompleted ? 'text-[#908fa0]' : 'text-[#c7c4d7]'}`}>
                          {task.description}
                        </p>
                      )}

                      {/* Metadata tags and due date */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] font-mono text-[#908fa0]">
                        {task.due_at && (
                          <span className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#4cd7f6]" />
                            <span>{formatDueDate(task.due_at)}</span>
                          </span>
                        )}
                        {task.tags && task.tags.map((tag, idx) => (
                          <span key={idx} className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#191c1e] text-[#c7c4d7] border border-white/5">
                            <Tag className="w-2.5 h-2.5 text-[#8083ff]" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Quick Priority adjust, Delete */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => onToggleStatus(task.id, task.status === TaskStatus.IN_PROGRESS ? TaskStatus.PENDING : TaskStatus.IN_PROGRESS)}
                      title={task.status === TaskStatus.IN_PROGRESS ? "Pause task" : "Start task"}
                      className="p-1.5 rounded-lg bg-[#191c1e] hover:bg-[#272a2c] text-[#c7c4d7] hover:text-[#c0c1ff] border border-white/5 transition-all text-xs"
                    >
                      <Play className={`w-3.5 h-3.5 ${task.status === TaskStatus.IN_PROGRESS ? 'text-[#4cd7f6] fill-[#4cd7f6]' : ''}`} />
                    </button>
                    <button
                      id={`task-delete-${task.id}`}
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg bg-[#191c1e] hover:bg-[#ffb4ab]/20 text-[#908fa0] hover:text-[#ffb4ab] border border-white/5 transition-all"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
