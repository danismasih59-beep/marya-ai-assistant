import React, { useState } from 'react';
import { 
  Activity, 
  Database, 
  Send, 
  Cpu, 
  HardDrive, 
  Radio, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Server,
  Zap,
  Smartphone,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SystemTelemetry, RoomMemoryItem, ThreatLevel } from '../types';

interface AutomationSectionProps {
  telemetry: SystemTelemetry;
  roomMemories: RoomMemoryItem[];
  onForceSync: () => void;
  onDispatchTestFCM: () => void;
  onViewAllMemories: () => void;
}

export const AutomationSection: React.FC<AutomationSectionProps> = ({
  telemetry,
  roomMemories,
  onForceSync,
  onDispatchTestFCM,
  onViewAllMemories
}) => {
  const [syncPercentage, setSyncPercentage] = useState(100);

  const getThreatBadge = (threat: ThreatLevel) => {
    switch (threat) {
      case ThreatLevel.LOW:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] glow-dot-success" />
            <span>Optimal (LOW)</span>
          </span>
        );
      case ThreatLevel.MEDIUM:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Warning (MEDIUM)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] glow-dot-error animate-pulse" />
            <span>Alert ({threat})</span>
          </span>
        );
    }
  };

  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col space-y-4">
      {/* Container Title */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6] glow-dot-success" />
          <h2 className="text-xl font-bold tracking-tight text-white">Automation &amp; Sync</h2>
        </div>
        <span className="text-[11px] font-mono text-[#4cd7f6] bg-[#4cd7f6]/10 px-2.5 py-1 rounded-lg border border-[#4cd7f6]/20">
          Live Telemetry
        </span>
      </div>

      {/* 1. Data Sync Progress Card */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#8083ff]/15 text-[#c0c1ff] border border-[#8083ff]/20">
              <RefreshCw className={`w-4 h-4 ${telemetry.isSyncing ? 'animate-spin text-[#4cd7f6]' : ''}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Data Sync</h3>
              <p className="text-[11px] text-[#908fa0]">Android Room ↔ PostgreSQL</p>
            </div>
          </div>
          <button
            onClick={onForceSync}
            disabled={telemetry.isSyncing}
            className="px-2.5 py-1 rounded-lg bg-[#191c1e] hover:bg-[#272a2c] text-[11px] font-mono text-[#c0c1ff] border border-white/10 hover:border-[#8083ff]/40 transition-all cursor-pointer"
          >
            {telemetry.isSyncing ? 'Syncing...' : 'Force Sync'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#c7c4d7] mb-1.5">
            <span>Differential Vector Pipeline</span>
            <span className="text-[#4cd7f6] font-semibold">{telemetry.isSyncing ? 'Synchronizing...' : '100% Synced'}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#101415] overflow-hidden border border-white/5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#494bd6] via-[#8083ff] to-[#4cd7f6] transition-all duration-500 shadow-sm"
              style={{ width: telemetry.isSyncing ? '65%' : '100%' }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#908fa0] mt-2">
            <span>Latency: {telemetry.latencyMs}ms</span>
            <span>Protobuf / JSONB</span>
          </div>
        </div>
      </div>

      {/* 2. Cloud Backup & Database Pool */}
      <div className="glass-card rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#03b5d3]/15 text-[#4cd7f6] border border-[#03b5d3]/20">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Cloud Backup</h3>
              <p className="text-[11px] text-[#908fa0]">Managed Cloud SQL / Postgres</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6] glow-dot-success" />
            <span className="text-xs font-mono text-[#4cd7f6]">Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-[#101415]/80 border border-white/5">
            <p className="text-[10px] font-mono text-[#908fa0]">AsyncPG Pool</p>
            <p className="text-sm font-mono font-semibold text-[#e0e3e5] mt-0.5">
              {telemetry.dbPoolActive} / {telemetry.dbPoolTotal} <span className="text-[10px] text-[#908fa0]">conns</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#101415]/80 border border-white/5">
            <p className="text-[10px] font-mono text-[#908fa0]">Last Snapshot</p>
            <p className="text-sm font-mono font-semibold text-[#c0c1ff] mt-0.5">18m ago</p>
          </div>
        </div>
      </div>

      {/* 3. FCM Push Dispatcher */}
      <div className="glass-card rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/20">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">FCM Push Gateway</h3>
              <p className="text-[11px] text-[#908fa0]">Firebase Cloud Messaging</p>
            </div>
          </div>
          <button
            onClick={onDispatchTestFCM}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#191c1e] hover:bg-[#272a2c] text-[11px] font-mono text-[#c7c4d7] hover:text-[#4cd7f6] border border-white/10 transition-all cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Test Push</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs font-mono text-[#908fa0]">
          <span className="flex items-center space-x-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#8083ff]" />
            <span>1 Bound Device (Pixel 9 Pro)</span>
          </span>
          <span className="text-[#4cd7f6]">Queue: 0 pending</span>
        </div>
      </div>

      {/* 4. Room Memory Cache Snapshot */}
      <div className="glass-card rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#8083ff]/15 text-[#c0c1ff] border border-[#8083ff]/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Room Memory Cache</h3>
              <p className="text-[11px] text-[#908fa0]">{roomMemories.length} vector embeddings</p>
            </div>
          </div>
          <button
            onClick={onViewAllMemories}
            className="text-xs font-mono text-[#c0c1ff] hover:text-[#4cd7f6] flex items-center space-x-1 transition-all"
          >
            <span>Inspect</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 divide-y divide-white/5">
          {roomMemories.slice(0, 3).map(mem => (
            <div key={mem.id} className="py-2 flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <p className="font-mono text-[#e0e3e5] truncate">{mem.key}</p>
                <p className="text-[11px] text-[#908fa0] truncate">{mem.value}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#191c1e] text-[#8083ff] border border-[#8083ff]/20 shrink-0">
                {mem.category}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
