/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RemindersSection } from './components/RemindersSection';
import { AutomationSection } from './components/AutomationSection';
import { ScriptsNotesSection } from './components/ScriptsNotesSection';
import { AIOrchestratorStudio } from './components/AIOrchestratorStudio';
import { SecurityIntelligenceView } from './components/SecurityIntelligenceView';
import { ApiExplorerView } from './components/ApiExplorerView';
import { ArchitectureView } from './components/ArchitectureView';
import { FloatingActionButton } from './components/FloatingActionButton';
import { CreateTaskModal } from './components/CreateTaskModal';
import { MemoryInspectorModal } from './components/MemoryInspectorModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { 
  TaskResponse, 
  TaskStatus, 
  TaskCreate, 
  SystemTelemetry, 
  RoomMemoryItem, 
  FCMNotification, 
  ThreatLevel 
} from './types';
import { Check, ShieldAlert, Sparkles, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai-studio' | 'security' | 'api-explorer' | 'architecture'>('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ id: string; title: string; desc: string; type: 'success' | 'alert' } | null>(null);

  // Initial Tasks State
  const [tasks, setTasks] = useState<TaskResponse[]>([
    {
      id: 'task-1',
      user_id: 'user-danis-59',
      title: 'Review Google Play Integrity API Nonce Challenge',
      description: 'Validate hardware-backed KeyStore attestation against server-side cloud verification pipeline.',
      priority: 5,
      status: TaskStatus.IN_PROGRESS,
      due_at: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
      tags: ['Security', 'Android15', 'KeyStore'],
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: 'task-2',
      user_id: 'user-danis-59',
      title: 'Synchronize Room Memory Vectors with PostgreSQL',
      description: 'Execute differential hash comparison for user preferences, workout logs, and location beacons.',
      priority: 4,
      status: TaskStatus.PENDING,
      due_at: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
      tags: ['Coroutines', 'RoomDB', 'Sync'],
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
    },
    {
      id: 'task-3',
      user_id: 'user-danis-59',
      title: 'Configure FCM Push Notification Channel in Jetpack Compose',
      description: 'Set high-priority channel ID for real-time security alerts and calendar reminders.',
      priority: 3,
      status: TaskStatus.PENDING,
      due_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      tags: ['FCM', 'Compose', 'Notifications'],
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    },
    {
      id: 'task-4',
      user_id: 'user-danis-59',
      title: 'Optimize AsyncPG Connection Pool on Cloud SQL',
      description: 'Scale max connections from 10 to 20 with 30s timeout and automatic idle reconnection.',
      priority: 2,
      status: TaskStatus.COMPLETED,
      due_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      tags: ['Postgres', 'FastAPI', 'Infra'],
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    }
  ]);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    isSyncing: false,
    latencyMs: 38,
    dbPoolActive: 4,
    dbPoolTotal: 20,
    fcmConnected: true,
    lastBackup: '18 minutes ago',
    threatLevel: ThreatLevel.LOW
  });

  // Room Memory Vectors
  const [roomMemories, setRoomMemories] = useState<RoomMemoryItem[]>([
    {
      id: 'mem-1',
      key: 'gym_locker_code',
      value: 'Locker 4812 in Main Fitness Center, 2nd Floor',
      category: 'Personal',
      synced_at: new Date().toISOString()
    },
    {
      id: 'mem-2',
      key: 'preferred_running_route',
      value: '5K Marina Green loop starting at 6:30 AM',
      category: 'Health',
      synced_at: new Date().toISOString()
    },
    {
      id: 'mem-3',
      key: 'device_primary_fcm_token',
      value: 'fcm_tok_android_pixel9pro_8f9a2b',
      category: 'Device',
      synced_at: new Date().toISOString()
    },
    {
      id: 'mem-4',
      key: 'fastapi_gateway_endpoint',
      value: 'https://api.myra.ai/v1',
      category: 'System',
      synced_at: new Date().toISOString()
    }
  ]);

  // Notifications Feed
  const [notifications, setNotifications] = useState<FCMNotification[]>([
    {
      id: 'notif-1',
      title: 'Differential Memory Sync Completed',
      body: '4 Room vector records synchronized with Cloud PostgreSQL.',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      type: 'sync',
      read: false
    },
    {
      id: 'notif-2',
      title: 'SafetyNet Integrity Check Passed',
      body: 'Device meets hardware attestation standards.',
      timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
      type: 'security',
      read: false
    }
  ]);

  // Keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('ai-studio');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (title: string, desc: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ id: crypto.randomUUID(), title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch initial tasks from Express / FastAPI mock backend
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/v1/tasks', {
        headers: { 'Authorization': 'Bearer mock_access_token_xyz' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data);
        }
      }
    } catch (e) {
      console.warn('Backend tasks fetch fallback used');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTaskStatus = async (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus = currentStatus === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));

    try {
      await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_access_token_xyz'
        },
        body: JSON.stringify({ status: nextStatus })
      });
      showToast('Task Status Synchronized', `Task marked as ${nextStatus.toLowerCase()} across Room & Cloud.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer mock_access_token_xyz' }
      });
      showToast('Task Removed', 'Task deleted from PostgreSQL and differential sync queue.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (newTaskData: TaskCreate & { tags: string[] }) => {
    try {
      const res = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_access_token_xyz'
        },
        body: JSON.stringify(newTaskData)
      });

      if (res.ok) {
        const created: TaskResponse = await res.json();
        setTasks(prev => [created, ...prev]);
        showToast('Task Scheduled', `"${created.title}" stored in PostgreSQL and dispatched to Android.`);
      } else {
        // Fallback local creation
        const localTask: TaskResponse = {
          id: `task-${Date.now()}`,
          user_id: 'user-danis-59',
          title: newTaskData.title,
          description: newTaskData.description,
          priority: newTaskData.priority,
          status: TaskStatus.PENDING,
          due_at: newTaskData.due_at,
          tags: newTaskData.tags,
          created_at: new Date().toISOString()
        };
        setTasks(prev => [localTask, ...prev]);
        showToast('Task Scheduled', `"${newTaskData.title}" queued for cloud sync.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePriority = async (taskId: string, priority: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority } : t));
    showToast('Priority Updated', `Task updated to P${priority}.`);
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    setTelemetry(prev => ({ ...prev, isSyncing: true }));

    setTimeout(() => {
      setIsSyncing(false);
      setTelemetry(prev => ({
        ...prev,
        isSyncing: false,
        latencyMs: Math.floor(Math.random() * 25) + 20,
        lastBackup: 'Just now'
      }));

      const newNotif: FCMNotification = {
        id: `sync-${Date.now()}`,
        title: 'Room Vector Sync Successful',
        body: `Differential sync completed. ${tasks.length} tasks and ${roomMemories.length} memory keys verified.`,
        timestamp: new Date().toISOString(),
        type: 'sync',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      showToast('Differential Sync Complete', 'All Android Room SQLite records match PostgreSQL Cloud SQL.');
    }, 1200);
  };

  const handleDispatchTestFCM = () => {
    const testNotif: FCMNotification = {
      id: `fcm-${Date.now()}`,
      title: 'FCM Gateway Test Notification',
      body: 'High-priority push payload received by Pixel 9 Pro (com.myra.client).',
      timestamp: new Date().toISOString(),
      type: 'task',
      read: false
    };
    setNotifications(prev => [testNotif, ...prev]);
    showToast('FCM Push Dispatched', 'Test message delivered to bound Android device.');
  };

  const handleBroadcastSecurityFCM = (threatLevel: ThreatLevel, count: number) => {
    const alertNotif: FCMNotification = {
      id: `sec-${Date.now()}`,
      title: `Security Alert: Threat Level ${threatLevel}`,
      body: `${count} potential vulnerabilities detected on Android client during attestation audit.`,
      timestamp: new Date().toISOString(),
      type: 'security',
      read: false
    };
    setNotifications(prev => [alertNotif, ...prev]);
    showToast('Security Alert Dispatched', `Broadcasted Threat Level ${threatLevel} push notification to Android.`, 'alert');
  };

  const handleAddMemory = (newMem: { key: string; value: string; category: string }) => {
    const item: RoomMemoryItem = {
      id: `mem-${Date.now()}`,
      key: newMem.key,
      value: newMem.value,
      category: newMem.category,
      synced_at: new Date().toISOString()
    };
    setRoomMemories(prev => [item, ...prev]);
    showToast('Vector Embedding Saved', `Saved key "${newMem.key}" to Android Room.`);
  };

  const handleDeleteMemory = (id: string) => {
    setRoomMemories(prev => prev.filter(m => m.id !== id));
    showToast('Vector Removed', 'Memory key purged from cache.');
  };

  return (
    <div className="min-h-screen bg-[#101415] text-[#e0e3e5] selection:bg-[#8083ff]/30 selection:text-[#c0c1ff] pb-24 md:pb-12">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onOpenQuickPrompt={() => setActiveTab('ai-studio')}
        isSyncing={isSyncing}
        onTriggerSync={handleForceSync}
      />

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: Bento Grid Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* Reminders & Urgent Tasks Section (col-span-8) */}
            <RemindersSection
              tasks={tasks}
              onToggleStatus={handleToggleTaskStatus}
              onDeleteTask={handleDeleteTask}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onUpdatePriority={handleUpdatePriority}
            />

            {/* Automation & Live Telemetry Section (col-span-4) */}
            <AutomationSection
              telemetry={telemetry}
              roomMemories={roomMemories}
              onForceSync={handleForceSync}
              onDispatchTestFCM={handleDispatchTestFCM}
              onViewAllMemories={() => setIsMemoryModalOpen(true)}
            />

            {/* Scripts, Memory Notes & Hooks Section (col-span-12) */}
            <ScriptsNotesSection
              onExecutePrompt={(promptText) => {
                setActiveTab('ai-studio');
              }}
              onAddNote={(note) => {
                showToast('Environment Hook Created', `Hook "${note.title}" registered in orchestrator.`);
              }}
            />
          </div>
        )}

        {/* TAB 2: AI Voice & Orchestration Studio */}
        {activeTab === 'ai-studio' && (
          <div className="animate-in fade-in duration-200">
            <AIOrchestratorStudio
              roomMemories={roomMemories}
              onTaskCreatedFromAI={fetchTasks}
              onSecurityScanTriggered={() => setActiveTab('security')}
            />
          </div>
        )}

        {/* TAB 3: Security Intelligence & Integrity Center */}
        {activeTab === 'security' && (
          <div className="animate-in fade-in duration-200">
            <SecurityIntelligenceView
              onBroadcastSecurityFCM={handleBroadcastSecurityFCM}
            />
          </div>
        )}

        {/* TAB 4: OpenAPI / FastAPI Sandbox */}
        {activeTab === 'api-explorer' && (
          <div className="animate-in fade-in duration-200">
            <ApiExplorerView />
          </div>
        )}

        {/* TAB 5: Architecture & Code Blueprint */}
        {activeTab === 'architecture' && (
          <div className="animate-in fade-in duration-200">
            <ArchitectureView />
          </div>
        )}

      </main>

      {/* Floating Action Button (FAB) for rapid task & voice trigger */}
      <FloatingActionButton
        onOpenCreateTask={() => setIsCreateModalOpen(true)}
        onOpenVoicePrompt={() => setActiveTab('ai-studio')}
      />

      {/* Mobile Touch Bottom Nav */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Memory Vector Cache Inspector Modal */}
      <MemoryInspectorModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        memories={roomMemories}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
      />

      {/* Interactive Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className={`p-4 rounded-2xl glass-card border shadow-2xl flex items-start space-x-3 max-w-md ${
            toastMessage.type === 'alert' ? 'border-[#ffb4ab]/40 bg-[#1d2022]/95' : 'border-[#4cd7f6]/40 bg-[#1d2022]/95'
          }`}>
            <div className={`mt-0.5 p-1.5 rounded-xl ${
              toastMessage.type === 'alert' ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]' : 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
            }`}>
              {toastMessage.type === 'alert' ? <ShieldAlert className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white tracking-tight">{toastMessage.title}</p>
              <p className="text-xs text-[#c7c4d7] mt-0.5">{toastMessage.desc}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#908fa0] hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
