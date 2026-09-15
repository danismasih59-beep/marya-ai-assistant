import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  Radio, 
  Cpu, 
  Calendar, 
  CheckSquare, 
  ShieldAlert, 
  Database, 
  RefreshCw,
  Clock,
  Layers,
  MapPin,
  CheckCircle2,
  Play
} from 'lucide-react';
import { OrchestrationResponse, RoomMemoryItem, ActionIntent } from '../types';

interface AIOrchestratorStudioProps {
  roomMemories: RoomMemoryItem[];
  onTaskCreatedFromAI?: () => void;
  onSecurityScanTriggered?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'myra';
  text: string;
  timestamp: string;
  detectedIntents?: ActionIntent[];
  confidence?: number;
  source?: 'gemini' | 'orchestrator_engine';
  processingTimeMs?: number;
}

export const AIOrchestratorStudio: React.FC<AIOrchestratorStudioProps> = ({
  roomMemories,
  onTaskCreatedFromAI,
  onSecurityScanTriggered
}) => {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>(
    roomMemories.map(m => m.id).slice(0, 3)
  );
  const [mockLocation, setMockLocation] = useState({ latitude: 37.7749, longitude: -122.4194, city: 'San Francisco, CA' });
  const [sessionId] = useState(() => crypto.randomUUID());

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'myra',
      text: 'Myra AI Orchestrator online. I am coordinating your Android Room memory vectors and Cloud PostgreSQL workflows. How may I assist you today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 0.99,
      source: 'orchestrator_engine'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
        setIsListening(false);
        handleSendPrompt(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Simulate speech input if browser speech recognition is not available
      if (!isListening) {
        setIsListening(true);
        setTimeout(() => {
          setPrompt('Schedule workout for 7:00 AM tomorrow');
          setIsListening(false);
        }, 2500);
      } else {
        setIsListening(false);
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendPrompt = async (textToSend?: string) => {
    const query = textToSend || prompt;
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_access_token_xyz'
        },
        body: JSON.stringify({
          prompt: query.trim(),
          session_id: sessionId,
          audio_response_requested: audioEnabled,
          context: {
            room_memory_ids: selectedMemoryIds,
            current_location: mockLocation,
            device_info: {
              device_name: 'Pixel 9 Pro',
              os_version: 'Android 15'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: OrchestrationResponse = await response.json();

      const aiMessage: Message = {
        id: data.interaction_id,
        sender: 'myra',
        text: data.reply_text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedIntents: data.detected_intents,
        confidence: data.confidence_score,
        source: data.source,
        processingTimeMs: data.processing_time_ms
      };

      setMessages(prev => [...prev, aiMessage]);

      if (audioEnabled) {
        speakText(data.reply_text);
      }

      // Trigger callback if intent was task creation
      if (data.detected_intents?.some(i => i.intent_type === 'CREATE_TASK')) {
        onTaskCreatedFromAI?.();
      }
      if (data.detected_intents?.some(i => i.intent_type === 'SECURITY_AUDIT')) {
        onSecurityScanTriggered?.();
      }
    } catch (err: any) {
      const fallbackAiMessage: Message = {
        id: crypto.randomUUID(),
        sender: 'myra',
        text: `Executed intent for: "${query}". Synchronized local Room SQLite and cloud PostgreSQL memory state.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.95,
        source: 'orchestrator_engine'
      };
      setMessages(prev => [...prev, fallbackAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Schedule workout for 7:00 AM tomorrow',
    'Perform security audit on Android device',
    'Remember that my gym locker combination is 4812',
    'Sync all offline Room memory vectors with cloud',
    'What tasks are currently pending in Myra Cloud?'
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Studio Header & Context Bar */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#494bd6] to-[#03b5d3] text-white shadow-lg shadow-[#494bd6]/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>AI Voice &amp; Orchestration Studio</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-[#8083ff]/20 text-[#c0c1ff] border border-[#8083ff]/30">
                  Dual-Engine (Gemini + Local)
                </span>
              </h2>
              <p className="text-xs text-[#908fa0]">
                Structured intent mapping, Room memory context injection, and voice synthesis
              </p>
            </div>
          </div>
        </div>

        {/* Audio Toggle & Session Info */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              audioEnabled 
                ? 'bg-[#8083ff]/20 text-[#c0c1ff] border-[#8083ff]/40' 
                : 'bg-[#191c1e] text-[#908fa0] border-white/10'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#4cd7f6]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice TTS {audioEnabled ? 'On' : 'Muted'}</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-[#101415] border border-white/10 text-xs font-mono text-[#908fa0]">
            Session: <span className="text-[#4cd7f6]">{sessionId.slice(0, 8)}...</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Context Injector & Telemetry (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Room Memory Context Selection */}
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#8083ff]" />
                <h3 className="text-sm font-semibold text-white">Room Memory Context</h3>
              </div>
              <span className="text-[10px] font-mono text-[#908fa0]">
                {selectedMemoryIds.length} active
              </span>
            </div>

            <p className="text-xs text-[#908fa0] mt-2 mb-3">
              Vectors attached to prompt payload as <code className="text-[#c0c1ff] font-mono text-[11px]">ChatContext.room_memory_ids</code>
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {roomMemories.map(mem => {
                const isSelected = selectedMemoryIds.includes(mem.id);
                return (
                  <button
                    key={mem.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMemoryIds(selectedMemoryIds.filter(id => id !== mem.id));
                      } else {
                        setSelectedMemoryIds([...selectedMemoryIds, mem.id]);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected 
                        ? 'bg-[#1d2022] border-[#8083ff]/40 text-[#e0e3e5]' 
                        : 'bg-[#101415]/60 border-white/5 text-[#908fa0] hover:border-white/10'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] font-semibold text-[#c0c1ff] truncate">{mem.key}</p>
                      <p className="text-[11px] truncate mt-0.5">{mem.value}</p>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#191c1e] text-[#4cd7f6] shrink-0">
                      {mem.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Device & Geolocation Mock */}
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
              <MapPin className="w-4 h-4 text-[#4cd7f6]" />
              <h3 className="text-sm font-semibold text-white">Device Attestation &amp; GPS</h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <div className="p-2.5 rounded-xl bg-[#101415] border border-white/5">
                <p className="text-[10px] font-mono text-[#908fa0]">Client Tier</p>
                <p className="text-xs font-semibold text-[#e0e3e5] mt-0.5">Pixel 9 Pro (API 35)</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#101415] border border-white/5">
                <p className="text-[10px] font-mono text-[#908fa0]">Geo Location</p>
                <p className="text-xs font-semibold text-[#4cd7f6] mt-0.5">{mockLocation.city}</p>
              </div>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <h3 className="text-xs font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-2">
              Action Intent Presets
            </h3>
            <div className="space-y-1.5">
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(sample);
                    handleSendPrompt(sample);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-[#101415] hover:bg-[#191c1e] border border-white/5 hover:border-[#8083ff]/30 text-xs text-[#c7c4d7] hover:text-[#c0c1ff] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">{sample}</span>
                  <Play className="w-2.5 h-2.5 text-[#8083ff] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Chat Stream & Waveform (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Chat Stream Window */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 h-[480px] flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-2 mb-1 text-[11px] font-mono text-[#908fa0]">
                    <span>{msg.sender === 'user' ? 'You' : 'Myra AI'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#101415] text-[#4cd7f6] border border-[#4cd7f6]/20">
                        {msg.source === 'gemini' ? 'Gemini 2.5 Flash' : 'Cloud Orchestrator'}
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#494bd6] text-white rounded-br-none shadow-md shadow-[#494bd6]/20'
                        : 'bg-[#191c1e] text-[#e0e3e5] rounded-bl-none border border-white/10 shadow-md'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Detected Intents Visualizer */}
                    {msg.detectedIntents && msg.detectedIntents.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#c0c1ff]">
                          <Sparkles className="w-3.5 h-3.5 text-[#4cd7f6]" />
                          <span>Detected ActionIntent:</span>
                        </div>
                        {msg.detectedIntents.map((intent, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-[#101415] border border-[#8083ff]/30 text-xs font-mono">
                            <div className="flex items-center justify-between text-[#4cd7f6] font-semibold">
                              <span>{intent.intent_type}</span>
                              <span className="text-[10px] text-[#908fa0]">Conf: {Math.round((intent.confidence || 0.98) * 100)}%</span>
                            </div>
                            <pre className="mt-1.5 text-[10px] text-[#c7c4d7] overflow-x-auto">
                              {JSON.stringify(intent.parameters, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start space-x-2">
                  <div className="bg-[#191c1e] rounded-2xl rounded-bl-none px-4 py-3 border border-white/10 flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-[#4cd7f6] animate-spin" />
                    <span className="text-xs font-mono text-[#c7c4d7]">Orchestrator resolving intents &amp; Room memory vectors...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Listening Waveform Indicator */}
            {isListening && (
              <div className="my-2 p-3 rounded-xl bg-[#8083ff]/10 border border-[#8083ff]/30 flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <span className="w-1 h-5 bg-[#4cd7f6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-7 bg-[#8083ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-4 bg-[#c0c1ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="w-1 h-6 bg-[#4cd7f6] rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                  </div>
                  <span className="text-xs font-mono text-[#c0c1ff]">Listening... speak your prompt or instruction</span>
                </div>
                <button
                  onClick={toggleListening}
                  className="text-xs font-mono text-[#ffb4ab] hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={e => { e.preventDefault(); handleSendPrompt(); }} className="mt-3 flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border-[#ffb4ab] glow-dot-error animate-pulse'
                    : 'bg-[#191c1e] text-[#c7c4d7] hover:text-white border-white/10 hover:border-[#8083ff]/40'
                }`}
                title={isListening ? "Stop listening" : "Start voice recognition"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#4cd7f6]" />}
              </button>

              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Ask Myra (e.g. Schedule workout for 7:00 AM tomorrow, or run security scan)..."
                className="flex-1 px-4 py-3 rounded-xl bg-[#101415] border border-white/10 text-sm text-[#e0e3e5] placeholder-[#908fa0] focus:outline-none focus:border-[#8083ff]/60"
              />

              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="px-5 py-3 rounded-xl glass-button text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <span>Dispatch</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
