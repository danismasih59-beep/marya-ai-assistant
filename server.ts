import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent state (simulating PostgreSQL + Room Memory sync)
interface TaskItem {
  id: string;
  title: string;
  description: string;
  due_at: string;
  priority: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  tags: string[];
}

interface RoomMemory {
  id: string;
  key: string;
  value: string;
  category: 'preference' | 'calendar' | 'task' | 'routine' | 'biometric';
  confidence: number;
  synced_with_cloud: boolean;
  updated_at: string;
}

interface SecurityAuditRecord {
  scan_id: string;
  overall_threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vulnerabilities_found: Array<{
    code: string;
    details: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
  }>;
  recommended_actions: string[];
  scanned_at: string;
}

let tasks: TaskItem[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    title: 'Deploy Myra FastAPI Service to Cloud Run',
    description: 'Containerize backend service and configure PostgreSQL Cloud SQL connection pool with secret manager.',
    due_at: '2026-08-29T14:00:00Z',
    priority: 5,
    status: 'IN_PROGRESS',
    created_at: '2026-08-27T08:30:00Z',
    updated_at: '2026-08-28T09:15:00Z',
    tags: ['Backend', 'GCP', 'DevOps']
  },
  {
    id: 'c9a646d3-9c61-4cd7-9b59-15264d09a16f',
    title: 'Verify Android SafetyNet & Play Integrity Key',
    description: 'Ensure device attestation API receives genuine tokens and rejects rooted emulator environments.',
    due_at: '2026-08-28T18:00:00Z',
    priority: 4,
    status: 'PENDING',
    created_at: '2026-08-27T10:00:00Z',
    updated_at: '2026-08-27T10:00:00Z',
    tags: ['Security', 'Android', 'Integrity']
  },
  {
    id: '7b2a59d1-817c-4860-93fb-728b9d3e8111',
    title: 'Sync Room Memory with PostgreSQL JSONB Store',
    description: 'Verify bi-directional differential synchronization between local Android SQLite and cloud Postgres.',
    due_at: '2026-08-30T10:00:00Z',
    priority: 3,
    status: 'PENDING',
    created_at: '2026-08-28T04:12:00Z',
    updated_at: '2026-08-28T04:12:00Z',
    tags: ['Sync', 'Room', 'Database']
  },
  {
    id: '1d4b68e9-28c0-424f-a912-6f34e89bbd02',
    title: 'Morning Workout & Cardio Session',
    description: 'Auto-scheduled by Myra AI Voice Orchestrator based on calendar availability.',
    due_at: '2026-08-29T07:00:00Z',
    priority: 2,
    status: 'PENDING',
    created_at: '2026-08-28T05:00:00Z',
    updated_at: '2026-08-28T05:00:00Z',
    tags: ['Routine', 'Health']
  },
  {
    id: 'e18f2940-5231-482a-9f44-998811223344',
    title: 'Configure FCM Push Credentials in Firebase Console',
    description: 'Set up server key and APNs certificates for instant security vulnerability alerts.',
    due_at: '2026-08-26T16:00:00Z',
    priority: 4,
    status: 'COMPLETED',
    created_at: '2026-08-25T11:00:00Z',
    updated_at: '2026-08-26T15:30:00Z',
    tags: ['Firebase', 'FCM', 'Infrastructure']
  }
];

let roomMemories: RoomMemory[] = [
  {
    id: '8a12bc34-56de-78fa-bcde-f0123456789a',
    key: 'preferred_wake_time',
    value: '06:30 AM (Mon-Fri), 08:00 AM (Weekends)',
    category: 'routine',
    confidence: 0.96,
    synced_with_cloud: true,
    updated_at: '2026-08-28T02:15:00Z'
  },
  {
    id: '9b23cd45-67ef-89ab-cdef-0123456789ab',
    key: 'primary_calendar_id',
    value: 'danismasih59@gmail.com',
    category: 'calendar',
    confidence: 0.99,
    synced_with_cloud: true,
    updated_at: '2026-08-28T01:10:00Z'
  },
  {
    id: 'ac34de56-78fa-90bc-def0-123456789abc',
    key: 'daily_focus_block',
    value: '09:00 AM - 12:30 PM (Deep Work, Do Not Disturb)',
    category: 'preference',
    confidence: 0.94,
    synced_with_cloud: true,
    updated_at: '2026-08-27T19:40:00Z'
  },
  {
    id: 'bd45ef67-89ab-01cd-ef01-23456789abcd',
    key: 'home_wifi_bssid',
    value: 'MyraSecure_Mesh_5G (Verified Device)',
    category: 'biometric',
    confidence: 0.98,
    synced_with_cloud: true,
    updated_at: '2026-08-27T14:22:00Z'
  }
];

let latestAudit: SecurityAuditRecord = {
  scan_id: crypto.randomUUID(),
  overall_threat_level: 'LOW',
  vulnerabilities_found: [],
  recommended_actions: ['Keep automatic security updates enabled', 'Maintain Play Protect verification active'],
  scanned_at: new Date().toISOString()
};

let registeredDevices = [
  {
    id: crypto.randomUUID(),
    fcm_token: 'fcm_tok_android_pixel9pro_8f9a2b',
    device_name: 'Pixel 9 Pro (Android 15)',
    os_version: 'Android 15 (AP2A.240805.005)',
    last_active_at: new Date().toISOString()
  }
];

let fcmNotifications = [
  {
    id: crypto.randomUUID(),
    title: 'Myra Cloud Synced',
    body: 'Local Room database synchronized 4 memory vectors with PostgreSQL.',
    type: 'sync' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: true
  },
  {
    id: crypto.randomUUID(),
    title: 'Security Scan Complete',
    body: 'Zero privilege escalations detected. Play Integrity verified.',
    type: 'security' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: true
  }
];

// Lazy Gemini SDK client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('Failed to initialize Gemini API client:', err);
    }
  }
  return geminiClient;
}

// ==========================================
// 1. AUTHENTICATION MODULE
// ==========================================
app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  const { email, password, device_id } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required' });
  }
  return res.status(201).json({
    message: 'User successfully registered in Myra Cloud',
    user_id: crypto.randomUUID(),
    email,
    created_at: new Date().toISOString()
  });
});

app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  return res.json({
    access_token: 'myra_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + Buffer.from(JSON.stringify({ sub: 'danismasih59@gmail.com', exp: Date.now() + 86400000 })).toString('base64'),
    refresh_token: 'myra_rf_9a8b7c6d5e4f3a2b1c',
    token_type: 'bearer',
    expires_in: 86400
  });
});

app.post('/api/v1/auth/devices/register', (req: Request, res: Response) => {
  const { fcm_token, device_name, os_version } = req.body;
  const newDevice = {
    id: crypto.randomUUID(),
    fcm_token: fcm_token || `fcm_tok_${Date.now()}`,
    device_name: device_name || 'Generic Android Device',
    os_version: os_version || 'Android 14',
    last_active_at: new Date().toISOString()
  };
  registeredDevices.push(newDevice);
  return res.status(200).json({
    status: 'registered',
    device_id: newDevice.fcm_token,
    registered_at: newDevice.last_active_at
  });
});

// ==========================================
// 2. AI ORCHESTRATION MODULE
// ==========================================
app.post('/api/v1/ai/process', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { prompt, session_id, audio_response_requested, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ detail: 'Prompt is required' });
  }

  const currentSessionId = session_id || crypto.randomUUID();
  const gemini = getGemini();

  let replyText = '';
  let detectedIntents: any[] = [];
  let confidenceScore = 0.95;
  let source: 'gemini' | 'orchestrator_engine' = 'orchestrator_engine';

  // Check if user is asking to create a task, schedule an event, run a scan, or check tasks
  const lowerPrompt = prompt.toLowerCase();

  if (gemini) {
    try {
      const systemInstruction = `You are Myra AI, a hyper-intelligent, proactive personal assistant orchestrator for Android and Cloud ecosystems.
Analyze user prompts and output concise, professional assistant replies.
Context memory available: ${JSON.stringify(roomMemories.map(m => `${m.key}: ${m.value}`))}
If the user asks to create a task, schedule a calendar event, perform a security audit, or query data, include structured intent logic.`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        }
      });

      replyText = response.text || '';
      source = 'gemini';
    } catch (err: any) {
      console.warn('Gemini request failed, falling back to local orchestrator:', err?.message);
    }
  }

  // Orchestrator Intent Resolution Engine
  if (lowerPrompt.includes('task') || lowerPrompt.includes('remind') || lowerPrompt.includes('todo') || lowerPrompt.includes('schedule workout')) {
    let taskTitle = prompt;
    if (lowerPrompt.includes('schedule your workout') || lowerPrompt.includes('workout')) {
      taskTitle = 'Morning Workout & Cardio Session';
    } else if (lowerPrompt.startsWith('remind me to')) {
      taskTitle = prompt.replace(/remind me to/i, '').trim();
      taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);
    } else if (lowerPrompt.startsWith('create task')) {
      taskTitle = prompt.replace(/create task/i, '').trim();
      taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);
    }

    const newTask: TaskItem = {
      id: crypto.randomUUID(),
      title: taskTitle || 'New Scheduled Task',
      description: `Created via Myra AI Voice Orchestrator from prompt: "${prompt}"`,
      due_at: new Date(Date.now() + 86400000 * (lowerPrompt.includes('tomorrow') ? 1 : 2)).toISOString(),
      priority: lowerPrompt.includes('urgent') || lowerPrompt.includes('high') ? 5 : 3,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['AI-Scheduled', 'VoiceEngine']
    };
    tasks.unshift(newTask);

    detectedIntents.push({
      intent_type: 'CREATE_TASK',
      parameters: {
        task_id: newTask.id,
        title: newTask.title,
        priority: newTask.priority,
        due_at: newTask.due_at
      },
      confidence: 0.98
    });

    if (!replyText) {
      replyText = `I have scheduled "${newTask.title}" for you with priority ${newTask.priority}. Added to your Android Room memory and synced with Myra Cloud.`;
    }
  } else if (lowerPrompt.includes('calendar') || lowerPrompt.includes('meeting') || lowerPrompt.includes('appointment')) {
    detectedIntents.push({
      intent_type: 'CREATE_CALENDAR_EVENT',
      parameters: {
        title: 'Meeting with Team',
        start_time: new Date(Date.now() + 3600000 * 3).toISOString(),
        calendar_id: 'danismasih59@gmail.com'
      },
      confidence: 0.96
    });
    if (!replyText) {
      replyText = `I have placed the event on your primary calendar and configured notifications across registered devices.`;
    }
  } else if (lowerPrompt.includes('security') || lowerPrompt.includes('scan') || lowerPrompt.includes('audit') || lowerPrompt.includes('root')) {
    detectedIntents.push({
      intent_type: 'SECURITY_AUDIT',
      parameters: {
        target: 'local_device',
        play_integrity_verify: true
      },
      confidence: 0.99
    });
    if (!replyText) {
      replyText = `Security audit initiated. Analyzing runtime privileges, SafetyNet attestations, and APK signatures. Overall threat level is currently LOW.`;
    }
  } else if (lowerPrompt.includes('memory') || lowerPrompt.includes('remember')) {
    const memoryKey = `mem_${Date.now().toString(36)}`;
    const newMemory: RoomMemory = {
      id: crypto.randomUUID(),
      key: memoryKey,
      value: prompt.replace(/remember that|remember/i, '').trim() || prompt,
      category: 'preference',
      confidence: 0.95,
      synced_with_cloud: true,
      updated_at: new Date().toISOString()
    };
    roomMemories.push(newMemory);
    detectedIntents.push({
      intent_type: 'ROOM_MEMORY_SYNC',
      parameters: {
        memory_id: newMemory.id,
        key: newMemory.key
      },
      confidence: 0.95
    });
    if (!replyText) {
      replyText = `Saved to local Room Memory vector database and committed to PostgreSQL cloud storage.`;
    }
  }

  if (!replyText) {
    replyText = `Myra AI Orchestrator processed your request: "${prompt}". All local Room memory entries and cloud task streams are synchronized.`;
  }

  const interactionId = crypto.randomUUID();
  const processingTimeMs = Date.now() - startTime;

  return res.json({
    interaction_id: interactionId,
    session_id: currentSessionId,
    reply_text: replyText,
    detected_intents: detectedIntents,
    audio_stream_url: audio_response_requested ? `https://api.myra.ai/v1/voice/stream/${interactionId}.opus` : null,
    confidence_score: confidenceScore,
    processing_time_ms: processingTimeMs,
    source
  });
});

// ==========================================
// 3. TASK ENGINE MODULE
// ==========================================
app.get('/api/v1/tasks', (req: Request, res: Response) => {
  const { status, limit, priority } = req.query;
  let filtered = [...tasks];
  if (status) {
    filtered = filtered.filter(t => t.status === status);
  }
  if (priority) {
    filtered = filtered.filter(t => t.priority === Number(priority));
  }
  if (limit) {
    filtered = filtered.slice(0, Number(limit));
  }
  return res.json(filtered);
});

app.post('/api/v1/tasks', (req: Request, res: Response) => {
  const { title, description, due_at, priority, tags } = req.body;
  if (!title) {
    return res.status(400).json({ detail: 'Title is required' });
  }

  const now = new Date().toISOString();
  const newTask: TaskItem = {
    id: crypto.randomUUID(),
    title,
    description: description || '',
    due_at: due_at || new Date(Date.now() + 86400000).toISOString(),
    priority: Math.min(5, Math.max(1, Number(priority) || 1)),
    status: 'PENDING',
    created_at: now,
    updated_at: now,
    tags: Array.isArray(tags) ? tags : ['General']
  };

  tasks.unshift(newTask);
  return res.status(201).json(newTask);
});

app.patch('/api/v1/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, title, description, priority, due_at } = req.body;

  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ detail: `Task ${id} not found` });
  }

  const task = tasks[taskIndex];
  if (status !== undefined) task.status = status;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = Number(priority);
  if (due_at !== undefined) task.due_at = due_at;
  task.updated_at = new Date().toISOString();

  tasks[taskIndex] = task;
  return res.json(task);
});

app.delete('/api/v1/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id);
  return res.json({ status: 'deleted', id });
});

// ==========================================
// 4. SECURITY INTELLIGENCE MODULE
// ==========================================
app.post('/api/v1/security/audit', (req: Request, res: Response) => {
  const { fcm_token, app_permissions, root_detected, developer_options_enabled, device_name } = req.body;

  let threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  const vulnerabilities: any[] = [];
  const recommendedActions: string[] = [];

  if (root_detected) {
    threatLevel = 'HIGH';
    vulnerabilities.push({
      code: 'ROOT_DEVICE',
      details: 'Device displays rooted privilege escalation (/system/bin/su binary detected).',
      severity: 'high',
      mitigation: 'Revoke su binaries and re-enable Android verified boot (dm-verity).'
    });
    recommendedActions.push('Re-verify device integrity via SafetyNet / Play Integrity API');
  }

  if (developer_options_enabled) {
    if (threatLevel === 'LOW') threatLevel = 'MEDIUM';
    vulnerabilities.push({
      code: 'ADB_DEBUGGING_ENABLED',
      details: 'USB Debugging and Developer Options active in settings.',
      severity: 'medium',
      mitigation: 'Disable USB debugging for sensitive production operations.'
    });
    recommendedActions.push('Turn off Developer Mode in system settings');
  }

  const riskyPermissions = (app_permissions || []).filter((p: string) =>
    p.includes('ACCESSIBILITY') || p.includes('PACKAGE_USAGE_STATS') || p.includes('SYSTEM_ALERT_WINDOW')
  );

  if (riskyPermissions.length > 0) {
    if (threatLevel === 'LOW') threatLevel = 'MEDIUM';
    vulnerabilities.push({
      code: 'OVERLAY_OR_ACCESSIBILITY_PERM',
      details: `High-privilege Android permissions detected: ${riskyPermissions.join(', ')}`,
      severity: 'medium',
      mitigation: 'Review installed sideloaded apps requesting accessibility overlays.'
    });
    recommendedActions.push('Audit 3rd-party accessibility service hooks');
  }

  if (vulnerabilities.length === 0) {
    recommendedActions.push('Device configuration meets zero-trust enterprise benchmarks');
    recommendedActions.push('Play Protect active with daily signature sync');
  }

  latestAudit = {
    scan_id: crypto.randomUUID(),
    overall_threat_level: threatLevel,
    vulnerabilities_found: vulnerabilities,
    recommended_actions: recommendedActions,
    scanned_at: new Date().toISOString()
  };

  return res.json(latestAudit);
});

app.get('/api/v1/security/audit', (req: Request, res: Response) => {
  return res.json(latestAudit);
});

// ==========================================
// 5. MEMORY SYNC & FCM DISPATCH MODULE
// ==========================================
app.get('/api/v1/memory', (req: Request, res: Response) => {
  return res.json(roomMemories);
});

app.post('/api/v1/memory/sync', (req: Request, res: Response) => {
  const { memories } = req.body;
  if (Array.isArray(memories)) {
    for (const mem of memories) {
      const idx = roomMemories.findIndex(m => m.id === mem.id || m.key === mem.key);
      if (idx >= 0) {
        roomMemories[idx] = { ...roomMemories[idx], ...mem, synced_with_cloud: true, updated_at: new Date().toISOString() };
      } else {
        roomMemories.push({
          id: mem.id || crypto.randomUUID(),
          key: mem.key || `key_${Date.now()}`,
          value: mem.value || '',
          category: mem.category || 'preference',
          confidence: mem.confidence || 0.9,
          synced_with_cloud: true,
          updated_at: new Date().toISOString()
        });
      }
    }
  }
  return res.json({
    status: 'synchronized',
    synced_records: roomMemories.length,
    sync_timestamp: new Date().toISOString()
  });
});

app.post('/api/v1/notifications/fcm/dispatch', (req: Request, res: Response) => {
  const { title, body, type } = req.body;
  const newNotif = {
    id: crypto.randomUUID(),
    title: title || 'Myra Notification',
    body: body || 'Real-time alert triggered.',
    type: type || 'ai',
    timestamp: new Date().toISOString(),
    read: false
  };
  fcmNotifications.unshift(newNotif);
  return res.json({
    status: 'delivered',
    message_id: `fcm_msg_${crypto.randomUUID()}`,
    target_devices: registeredDevices.length,
    notification: newNotif
  });
});

app.get('/api/v1/notifications', (req: Request, res: Response) => {
  return res.json(fcmNotifications);
});

// ==========================================
// 6. SYSTEM TELEMETRY & STATUS
// ==========================================
app.get('/api/v1/telemetry', (req: Request, res: Response) => {
  return res.json({
    syncProgress: 100,
    isSyncing: false,
    lastCloudBackup: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    dbPoolActive: 4,
    dbPoolTotal: 20,
    fcmQueuePending: 0,
    roomMemoryRecords: roomMemories.length,
    securityStatus: latestAudit.overall_threat_level,
    latencyMs: 14,
    geminiConnected: !!process.env.GEMINI_API_KEY
  });
});

// Start Express Server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Myra Cloud FastAPI/Express Server running on port ${PORT}`);
  });
}

startServer();
