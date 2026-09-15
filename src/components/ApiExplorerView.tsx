import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Code, 
  Send, 
  Layers, 
  Lock, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Database,
  ShieldCheck,
  Bot
} from 'lucide-react';

interface EndpointConfig {
  id: string;
  module: 'Authentication' | 'AI Orchestration' | 'Task Engine' | 'Security Intelligence';
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  authRequired: boolean;
  defaultPayload?: any;
}

export const ApiExplorerView: React.FC = () => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('ai-process');
  const [payloadText, setPayloadText] = useState<string>('{\n  "prompt": "Schedule workout for 7:00 AM tomorrow",\n  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",\n  "audio_response_requested": false,\n  "context": {\n    "room_memory_ids": ["8a12bc34-56de-78fa-bcde-f0123456789a"],\n    "current_location": { "latitude": 37.7749, "longitude": -122.4194 }\n  }\n}');
  const [bearerToken, setBearerToken] = useState<string>('mock_access_token_xyz');
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<{
    status: number;
    timeMs: number;
    data: any;
  } | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const endpoints: EndpointConfig[] = [
    // 1. Auth
    {
      id: 'auth-register',
      module: 'Authentication',
      method: 'POST',
      path: '/api/v1/auth/register',
      description: 'Register a new user profile with email and device ID.',
      authRequired: false,
      defaultPayload: {
        email: 'danismasih59@gmail.com',
        password: 'securePassword123!',
        device_id: 'fcm_tok_android_pixel9pro_8f9a2b'
      }
    },
    {
      id: 'auth-login',
      module: 'Authentication',
      method: 'POST',
      path: '/api/v1/auth/login',
      description: 'Authenticate user credentials and receive JWT access token.',
      authRequired: false,
      defaultPayload: {
        username: 'danismasih59@gmail.com',
        password: 'securePassword123!'
      }
    },
    {
      id: 'auth-device-register',
      module: 'Authentication',
      method: 'POST',
      path: '/api/v1/auth/devices/register',
      description: 'Bind Android FCM token and device parameters to active session.',
      authRequired: true,
      defaultPayload: {
        fcm_token: 'fcm_tok_android_pixel9pro_8f9a2b',
        device_name: 'Pixel 9 Pro',
        os_version: 'Android 15'
      }
    },
    // 2. AI Orchestration
    {
      id: 'ai-process',
      module: 'AI Orchestration',
      method: 'POST',
      path: '/api/v1/ai/process',
      description: 'Process multimodal prompts, map structured ActionIntent outputs, and inject Room Memory context.',
      authRequired: true,
      defaultPayload: {
        prompt: 'Schedule workout for 7:00 AM tomorrow',
        session_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        audio_response_requested: false,
        context: {
          room_memory_ids: ['8a12bc34-56de-78fa-bcde-f0123456789a'],
          current_location: { latitude: 37.7749, longitude: -122.4194 }
        }
      }
    },
    // 3. Task Engine
    {
      id: 'tasks-list',
      module: 'Task Engine',
      method: 'GET',
      path: '/api/v1/tasks',
      description: 'List user tasks with optional status and priority query filters.',
      authRequired: true
    },
    {
      id: 'tasks-create',
      module: 'Task Engine',
      method: 'POST',
      path: '/api/v1/tasks',
      description: 'Create a new scheduled task and push differential update to Android Room.',
      authRequired: true,
      defaultPayload: {
        title: 'Run weekly database index optimization',
        description: 'VACUUM ANALYZE on PostgreSQL tasks and ai_interactions tables.',
        priority: 4,
        due_at: new Date(Date.now() + 86400000 * 2).toISOString(),
        tags: ['DevOps', 'PostgreSQL']
      }
    },
    // 4. Security Intelligence
    {
      id: 'security-audit',
      module: 'Security Intelligence',
      method: 'POST',
      path: '/api/v1/security/audit',
      description: 'Execute security integrity check analyzing root status, dev options, and permission escalation.',
      authRequired: true,
      defaultPayload: {
        fcm_token: 'fcm_tok_android_pixel9pro_8f9a2b',
        app_permissions: [
          'android.permission.INTERNET',
          'android.permission.SYSTEM_ALERT_WINDOW'
        ],
        root_detected: false,
        developer_options_enabled: true
      }
    }
  ];

  const currentEndpoint = endpoints.find(e => e.id === selectedEndpointId) || endpoints[0];

  const handleSelectEndpoint = (endpoint: EndpointConfig) => {
    setSelectedEndpointId(endpoint.id);
    if (endpoint.defaultPayload) {
      setPayloadText(JSON.stringify(endpoint.defaultPayload, null, 2));
    } else {
      setPayloadText('');
    }
    setResponseResult(null);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (currentEndpoint.authRequired && bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
      }

      const options: RequestInit = {
        method: currentEndpoint.method,
        headers
      };

      if (currentEndpoint.method !== 'GET' && payloadText.trim()) {
        options.body = payloadText.trim();
      }

      const res = await fetch(currentEndpoint.path, options);
      const endTime = performance.now();
      const data = await res.json();

      setResponseResult({
        status: res.status,
        timeMs: Math.round(endTime - startTime),
        data
      });
    } catch (err: any) {
      setResponseResult({
        status: 500,
        timeMs: 0,
        data: { error: err.message }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCurl = () => {
    let curl = `curl -X ${currentEndpoint.method} "https://api.myra.ai${currentEndpoint.path}" \\\n`;
    curl += `  -H "Content-Type: application/json" \\\n`;
    if (currentEndpoint.authRequired) {
      curl += `  -H "Authorization: Bearer ${bearerToken}" \\\n`;
    }
    if (currentEndpoint.method !== 'GET' && payloadText.trim()) {
      curl += `  -d '${payloadText.trim().replace(/'/g, "\\'")}'`;
    }
    return curl;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-[#4cd7f6]/15 text-[#4cd7f6] border-[#4cd7f6]/30';
      case 'POST':
        return 'bg-[#8083ff]/20 text-[#c0c1ff] border-[#8083ff]/40';
      case 'PATCH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'DELETE':
        return 'bg-[#ffb4ab]/20 text-[#ffb4ab] border-[#ffb4ab]/30';
      default:
        return 'bg-white/10 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Sandbox Header */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#494bd6] to-[#03b5d3] text-white shadow-lg">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Myra Cloud OpenAPI / FastAPI Sandbox</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#191c1e] text-[#4cd7f6] border border-[#4cd7f6]/20">
                Swagger v3.1 / OpenAPI
              </span>
            </h2>
            <p className="text-xs text-[#908fa0]">
              Interactive request execution across Authentication, AI Orchestration, Tasks, and Security
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyCurl}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#1d2022] hover:bg-[#272a2c] text-xs font-mono text-[#c0c1ff] border border-white/10 hover:border-[#8083ff]/40 transition-all cursor-pointer"
        >
          {copiedCurl ? <Check className="w-3.5 h-3.5 text-[#4cd7f6]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedCurl ? 'cURL Copied' : 'Copy cURL Command'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Endpoints Menu (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <div className="glass-card rounded-2xl p-4 border border-white/10">
            <h3 className="text-xs font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-3 px-2">
              Endpoints by Module
            </h3>

            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
              {endpoints.map(ep => {
                const isSelected = ep.id === selectedEndpointId;
                return (
                  <button
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex flex-col space-y-1.5 ${
                      isSelected
                        ? 'bg-[#1d2022] border-[#8083ff]/50 text-white shadow-md'
                        : 'bg-[#101415]/60 border-white/5 text-[#908fa0] hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getMethodBadge(ep.method)}`}>
                          {ep.method}
                        </span>
                        <span className="font-mono text-[11px] text-[#e0e3e5] truncate">{ep.path}</span>
                      </div>
                      {ep.authRequired && <Lock className="w-3 h-3 text-[#8083ff] shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[#908fa0] line-clamp-1">{ep.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Console & Response (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Request Header Bar */}
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border ${getMethodBadge(currentEndpoint.method)}`}>
                  {currentEndpoint.method}
                </span>
                <span className="font-mono text-sm font-semibold text-white">{currentEndpoint.path}</span>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={isLoading}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl glass-button text-white text-xs font-semibold hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Play className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : 'fill-current'}`} />
                <span>{isLoading ? 'Executing...' : 'Execute Request'}</span>
              </button>
            </div>

            <p className="text-xs text-[#c7c4d7] mt-3">
              {currentEndpoint.description}
            </p>

            {/* Auth Bearer Token Input */}
            {currentEndpoint.authRequired && (
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-xs font-mono text-[#8083ff]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Bearer:</span>
                </div>
                <input
                  type="text"
                  value={bearerToken}
                  onChange={e => setBearerToken(e.target.value)}
                  placeholder="OAuth2 JWT token..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#101415] border border-white/10 text-xs font-mono text-[#e0e3e5] focus:outline-none focus:border-[#8083ff]/60"
                />
              </div>
            )}
          </div>

          {/* Request Body Payload Editor */}
          {currentEndpoint.method !== 'GET' && (
            <div className="glass-card rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-[#c7c4d7]">Request Body (application/json)</span>
                <span className="text-[10px] font-mono text-[#908fa0]">Pydantic BaseModel Payload</span>
              </div>
              <textarea
                rows={7}
                value={payloadText}
                onChange={e => setPayloadText(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#101415] border border-white/10 font-mono text-xs text-[#c0c1ff] focus:outline-none focus:border-[#8083ff]/60 leading-relaxed"
              />
            </div>
          )}

          {/* Response Inspector */}
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-[#4cd7f6]" />
                <h3 className="text-sm font-semibold text-white">Live Server Response</h3>
              </div>

              {responseResult && (
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded-md font-bold ${
                    responseResult.status < 300 
                      ? 'bg-[#4cd7f6]/15 text-[#4cd7f6]' 
                      : 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
                  }`}>
                    HTTP {responseResult.status}
                  </span>
                  <span className="text-[#908fa0] flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{responseResult.timeMs}ms</span>
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3">
              {responseResult ? (
                <pre className="p-4 rounded-xl bg-[#101415] border border-white/5 font-mono text-xs text-[#e0e3e5] overflow-x-auto max-h-72 leading-relaxed">
                  {JSON.stringify(responseResult.data, null, 2)}
                </pre>
              ) : (
                <div className="p-8 rounded-xl bg-[#101415] border border-white/5 text-center text-xs font-mono text-[#908fa0]">
                  Click &ldquo;Execute Request&rdquo; to dispatch live API call to Myra Cloud backend.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
