import React, { useState } from 'react';
import { 
  Layers, 
  Smartphone, 
  Server, 
  Database, 
  ShieldCheck, 
  Radio, 
  Copy, 
  Check, 
  Code2, 
  Cpu, 
  Sparkles,
  ArrowRight,
  Workflow
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'kotlin_network' | 'compose_ui' | 'sqlmodel' | 'alembic' | 'fastapi'>('kotlin_network');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const codeSnippets = {
    kotlin_network: {
      title: 'Android Kotlin Network & Repository Layer (Retrofit + Kotlinx Serialization)',
      filename: 'com/myra/client/network/MyraApiService.kt',
      language: 'kotlin',
      code: `package com.myra.client.network

import com.myra.client.models.*
import kotlinx.coroutines.flow.Flow
import retrofit2.Response
import retrofit2.http.*

interface MyraApiService {

    @POST("api/v1/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<TokenResponse>

    @POST("api/v1/ai/process")
    suspend fun processIntent(
        @Header("Authorization") token: String,
        @Body request: OrchestrationRequest
    ): Response<OrchestrationResponse>

    @GET("api/v1/tasks")
    suspend fun getTasks(
        @Header("Authorization") token: String,
        @Query("status") status: String? = null,
        @Query("priority") priority: Int? = null
    ): Response<List<TaskResponse>>

    @POST("api/v1/tasks")
    suspend fun createTask(
        @Header("Authorization") token: String,
        @Body request: TaskCreate
    ): Response<TaskResponse>

    @PATCH("api/v1/tasks/{task_id}")
    suspend fun updateTaskStatus(
        @Header("Authorization") token: String,
        @Path("task_id") taskId: String,
        @Body statusUpdate: TaskStatusUpdate
    ): Response<TaskResponse>

    @POST("api/v1/security/audit")
    suspend fun executeSecurityAudit(
        @Header("Authorization") token: String,
        @Body auditRequest: SecurityAuditRequest
    ): Response<SecurityAuditResponse>
}`
    },
    compose_ui: {
      title: 'Android Jetpack Compose UI (Bento Grid & Glassmorphism Dashboard)',
      filename: 'com/myra/client/ui/TaskDashboardScreen.kt',
      language: 'kotlin',
      code: `package com.myra.client.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.myra.client.viewmodel.TaskViewModel

@Composable
fun TaskDashboardScreen(
    viewModel: TaskViewModel,
    onVoicePromptClick: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        containerColor = Color(0xFF101415),
        floatingActionButton = {
            FloatingActionButton(
                onClick = onVoicePromptClick,
                containerColor = Color(0xFF494BD6),
                contentColor = Color.White,
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(imageVector = Icons.Default.Mic, contentDescription = "Voice Prompt")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                TelemetryHeaderCard(syncState = uiState.syncStatus)
            }
            items(uiState.tasks, key = { it.id }) { task ->
                TaskGlassCard(
                    task = task,
                    onToggle = { viewModel.toggleTask(task.id) }
                )
            }
        }
    }
}`
    },
    sqlmodel: {
      title: 'PostgreSQL SQLModel ORM Schema (JSONB & Indexed)',
      filename: 'myra_cloud/models/schema.py',
      language: 'python',
      code: `from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSONB

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    device_id: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(index=True, nullable=False)
    description: Optional[str] = Field(default=None)
    priority: int = Field(default=3, index=True)
    status: str = Field(default="PENDING", index=True)
    due_at: Optional[datetime] = Field(default=None, index=True)
    tags: List[str] = Field(default=[], sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AIInteraction(SQLModel, table=True):
    __tablename__ = "ai_interactions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    session_id: str = Field(index=True)
    prompt: str = Field(nullable=False)
    reply_text: str = Field(nullable=False)
    confidence_score: float = Field(default=0.95)
    detected_intents: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSONB))
    created_at: datetime = Field(default_factory=datetime.utcnow)`
    },
    alembic: {
      title: 'Alembic Async Database Migrations (Asyncpg Engine)',
      filename: 'alembic/env.py',
      language: 'python',
      code: `import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from sqlmodel import SQLModel
from myra_cloud.models.schema import User, Task, AIInteraction

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata

def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    connectable = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        future=True
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

if context.is_offline_mode():
    pass
else:
    asyncio.run(run_migrations_online())`
    },
    fastapi: {
      title: 'FastAPI AI Orchestrator & Intent Dispatch Router',
      filename: 'myra_cloud/routers/ai_orchestrator.py',
      language: 'python',
      code: `from fastapi import APIRouter, Depends, HTTPException, status
from myra_cloud.schemas import OrchestrationRequest, OrchestrationResponse, ActionIntent
from myra_cloud.auth import get_current_user
from myra_cloud.models.schema import User
from google import genai
import os

router = APIRouter(prefix="/api/v1/ai", tags=["AI Orchestration"])

@router.post("/process", response_model=OrchestrationResponse)
async def process_multimodal_intent(
    request: OrchestrationRequest,
    current_user: User = Depends(get_current_user)
):
    # Context injection from Room Memory & Geolocation
    context_data = request.context or {}
    
    # Process with Gemini 2.5 Flash
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=request.prompt
    )
    
    return OrchestrationResponse(
        interaction_id="int_" + str(uuid.uuid4()),
        reply_text=response.text or "Intent processed successfully.",
        confidence_score=0.98,
        source="gemini",
        detected_intents=[
            ActionIntent(
                intent_type="SCHEDULE_WORKFLOW",
                parameters={"query": request.prompt},
                confidence=0.98
            )
        ]
    )`
    }
  };

  const currentSnippet = codeSnippets[selectedTab];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Blueprint Header */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#494bd6] to-[#03b5d3] text-white shadow-lg">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Myra AI Full-Stack Architecture Blueprint</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#191c1e] text-[#4cd7f6] border border-[#4cd7f6]/20">
                3-Tier Topology
              </span>
            </h2>
            <p className="text-xs text-[#908fa0]">
              Android Jetpack Compose Client, FastAPI Orchestrator, PostgreSQL JSONB, and GCP Infrastructure
            </p>
          </div>
        </div>
      </div>

      {/* 3-Tier Architecture Visual Map */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tier 1: Android Client */}
        <div className="glass-card rounded-2xl p-5 border border-[#8083ff]/30 relative overflow-hidden">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-[#8083ff]/20 text-[#c0c1ff]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#8083ff] uppercase">Tier 1</span>
              <h3 className="text-base font-bold text-white">Android Client Tier</h3>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-[#c7c4d7] font-mono">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8083ff]" />
              <span>Jetpack Compose &amp; Material 3</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8083ff]" />
              <span>MVVM with StateFlow &amp; Coroutines</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8083ff]" />
              <span>Room Vector Cache for Offline Persistence</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8083ff]" />
              <span>Voice Engine (SpeechRecognizer + TTS)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8083ff]" />
              <span>Play Integrity &amp; SafetyNet Attestation</span>
            </li>
          </ul>
        </div>

        {/* Tier 2: FastAPI Cloud */}
        <div className="glass-card rounded-2xl p-5 border border-[#4cd7f6]/30 relative overflow-hidden">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-[#4cd7f6]/20 text-[#4cd7f6]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#4cd7f6] uppercase">Tier 2</span>
              <h3 className="text-base font-bold text-white">Myra Cloud (FastAPI)</h3>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-[#c7c4d7] font-mono">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
              <span>AI Intent Orchestrator (Gemini 2.5)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
              <span>OAuth2 JWT Authentication &amp; Sessions</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
              <span>Task &amp; Calendar Engine with Reminders</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
              <span>Differential Memory Sync Pipeline</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
              <span>Security Intelligence Vulnerability Engine</span>
            </li>
          </ul>
        </div>

        {/* Tier 3: Infrastructure */}
        <div className="glass-card rounded-2xl p-5 border border-[#c0c1ff]/30 relative overflow-hidden">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-[#c0c1ff]/20 text-[#c0c1ff]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#c0c1ff] uppercase">Tier 3</span>
              <h3 className="text-base font-bold text-white">GCP Infrastructure</h3>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-[#c7c4d7] font-mono">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]" />
              <span>Managed Cloud SQL (PostgreSQL 16)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]" />
              <span>AsyncPG Pool &amp; JSONB Indexing</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]" />
              <span>Alembic Async Migrations</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]" />
              <span>Firebase Cloud Messaging (FCM Push)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]" />
              <span>Cloud Run Container Deployment</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Code Inspector Tabs */}
      <div className="glass-card rounded-2xl p-5 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {[
              { id: 'kotlin_network' as const, label: 'Android Retrofit Network', icon: Smartphone },
              { id: 'compose_ui' as const, label: 'Jetpack Compose UI', icon: Code2 },
              { id: 'sqlmodel' as const, label: 'SQLModel ORM Schema', icon: Database },
              { id: 'alembic' as const, label: 'Alembic Async Migrations', icon: Layers },
              { id: 'fastapi' as const, label: 'FastAPI AI Router', icon: Server }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#8083ff]/25 text-[#c0c1ff] border border-[#8083ff]/40 shadow-sm'
                      : 'text-[#908fa0] hover:text-[#e0e3e5] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleCopy(selectedTab, currentSnippet.code)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#191c1e] hover:bg-[#272a2c] text-xs font-mono text-[#c0c1ff] border border-white/10 hover:border-[#8083ff]/40 transition-all cursor-pointer"
          >
            {copiedId === selectedTab ? <Check className="w-3.5 h-3.5 text-[#4cd7f6]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === selectedTab ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#4cd7f6]">{currentSnippet.filename}</span>
            <span className="text-[10px] font-mono text-[#908fa0] uppercase">{currentSnippet.language}</span>
          </div>

          <pre className="p-4 rounded-xl bg-[#101415] border border-white/5 font-mono text-xs text-[#e0e3e5] overflow-x-auto max-h-[500px] leading-relaxed">
            {currentSnippet.code}
          </pre>
        </div>
      </div>
    </div>
  );
};
