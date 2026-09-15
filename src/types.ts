export type UUID = string;

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface TaskCreate {
  title: string;
  description?: string;
  due_at?: string;
  priority: number; // 1 to 5
}

export interface TaskResponse extends TaskCreate {
  id: UUID;
  user_id?: string;
  status: TaskStatus;
  created_at: string;
  updated_at?: string;
  tags?: string[];
}

export interface ActionIntent {
  intent_type: string; // e.g. "CREATE_TASK", "FETCH_CALENDAR", "CREATE_CALENDAR_EVENT", "SECURITY_SCAN"
  parameters: Record<string, any>;
  confidence?: number;
}

export interface ChatContext {
  room_memory_ids?: UUID[];
  current_location?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
  device_info?: {
    device_name: string;
    os_version: string;
    battery_level?: number;
  };
}

export interface OrchestrationRequest {
  prompt: string;
  session_id: UUID;
  audio_response_requested?: boolean;
  context?: ChatContext;
}

export interface OrchestrationResponse {
  interaction_id: UUID;
  session_id: UUID;
  reply_text: string;
  detected_intents: ActionIntent[];
  audio_stream_url?: string | null;
  confidence_score: number;
  processing_time_ms?: number;
  source?: 'gemini' | 'orchestrator_engine';
}

export interface SecurityAuditRequest {
  fcm_token: string;
  app_permissions: string[];
  root_detected: boolean;
  developer_options_enabled: boolean;
  device_name?: string;
  os_version?: string;
}

export interface VulnerabilityFinding {
  code: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
}

export interface SecurityAuditResponse {
  scan_id: UUID;
  overall_threat_level: ThreatLevel;
  vulnerabilities_found: VulnerabilityFinding[];
  recommended_actions: string[];
  scanned_at?: string;
}

export interface DeviceRegisterRequest {
  fcm_token: string;
  device_name: string;
  os_version: string;
}

export interface RoomMemoryItem {
  id: UUID;
  key: string;
  value: string;
  category: string;
  confidence?: number;
  synced_with_cloud?: boolean;
  synced_at?: string;
  updated_at?: string;
}

export interface AssistantNote {
  id: UUID;
  title: string;
  category: string;
  content: string;
  created_at: string;
  priority: 'low' | 'normal' | 'high';
  tags: string[];
}

export interface SystemTelemetry {
  isSyncing: boolean;
  latencyMs: number;
  dbPoolActive: number;
  dbPoolTotal: number;
  fcmConnected?: boolean;
  lastBackup?: string;
  threatLevel?: ThreatLevel;
  syncProgress?: number;
  lastCloudBackup?: string;
  fcmQueuePending?: number;
  roomMemoryRecords?: number;
  securityStatus?: ThreatLevel;
  geminiConnected?: boolean;
}

export interface FCMNotification {
  id: UUID;
  title: string;
  body: string;
  type: 'security' | 'task' | 'ai' | 'sync';
  timestamp: string;
  read: boolean;
}
