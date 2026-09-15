import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  AlertTriangle, 
  Terminal, 
  Smartphone, 
  Lock, 
  Radio, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Bell,
  Cpu,
  KeyRound,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ThreatLevel, SecurityAuditResponse, VulnerabilityFinding } from '../types';

interface SecurityIntelligenceViewProps {
  onBroadcastSecurityFCM: (threatLevel: ThreatLevel, count: number) => void;
}

export const SecurityIntelligenceView: React.FC<SecurityIntelligenceViewProps> = ({
  onBroadcastSecurityFCM
}) => {
  const [rootDetected, setRootDetected] = useState(false);
  const [developerOptionsEnabled, setDeveloperOptionsEnabled] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'android.permission.INTERNET',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.RECORD_AUDIO',
    'android.permission.SYSTEM_ALERT_WINDOW'
  ]);
  const [isScanning, setIsScanning] = useState(false);

  const [auditResult, setAuditResult] = useState<SecurityAuditResponse>({
    scan_id: crypto.randomUUID(),
    overall_threat_level: ThreatLevel.MEDIUM,
    vulnerabilities_found: [
      {
        code: 'ADB_DEBUGGING_ENABLED',
        details: 'USB Debugging and Developer Options active on Pixel 9 Pro.',
        severity: 'medium',
        mitigation: 'Disable USB debugging for sensitive production operations in Settings > Developer Options.'
      },
      {
        code: 'OVERLAY_PERMISSION_ACTIVE',
        details: 'android.permission.SYSTEM_ALERT_WINDOW active (Window overlay hook).',
        severity: 'medium',
        mitigation: 'Verify which sideloaded packages have draw-over-other-apps permissions.'
      }
    ],
    recommended_actions: [
      'Turn off Developer Mode in system settings when not debugging',
      'Audit 3rd-party accessibility service hooks',
      'Re-verify device integrity via SafetyNet/Play Integrity API'
    ],
    scanned_at: new Date().toISOString()
  });

  const allAvailablePermissions = [
    { name: 'android.permission.INTERNET', risk: 'low' },
    { name: 'android.permission.ACCESS_FINE_LOCATION', risk: 'medium' },
    { name: 'android.permission.RECORD_AUDIO', risk: 'medium' },
    { name: 'android.permission.SYSTEM_ALERT_WINDOW', risk: 'high' },
    { name: 'android.permission.BIND_ACCESSIBILITY_SERVICE', risk: 'critical' },
    { name: 'android.permission.PACKAGE_USAGE_STATS', risk: 'high' }
  ];

  const handleTogglePermission = (permName: string) => {
    if (selectedPermissions.includes(permName)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permName));
    } else {
      setSelectedPermissions([...selectedPermissions, permName]);
    }
  };

  const handleRunAudit = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/v1/security/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock_access_token_xyz'
        },
        body: JSON.stringify({
          fcm_token: 'fcm_tok_android_pixel9pro_8f9a2b',
          app_permissions: selectedPermissions,
          root_detected: rootDetected,
          developer_options_enabled: developerOptionsEnabled,
          device_name: 'Pixel 9 Pro'
        })
      });

      if (response.ok) {
        const data: SecurityAuditResponse = await response.json();
        setAuditResult(data);
        if (data.overall_threat_level === ThreatLevel.HIGH || data.overall_threat_level === ThreatLevel.CRITICAL) {
          onBroadcastSecurityFCM(data.overall_threat_level, data.vulnerabilities_found.length);
        }
      }
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const getThreatColor = (threat: ThreatLevel) => {
    switch (threat) {
      case ThreatLevel.LOW:
        return { text: 'text-[#4cd7f6]', bg: 'bg-[#4cd7f6]/15', border: 'border-[#4cd7f6]/40', glow: 'glow-dot-success' };
      case ThreatLevel.MEDIUM:
        return { text: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/40', glow: '' };
      case ThreatLevel.HIGH:
        return { text: 'text-[#ffb4ab]', bg: 'bg-[#ffb4ab]/15', border: 'border-[#ffb4ab]/40', glow: 'glow-dot-error' };
      case ThreatLevel.CRITICAL:
        return { text: 'text-rose-400', bg: 'bg-rose-500/25', border: 'border-rose-500/60', glow: 'glow-dot-error' };
    }
  };

  const threatStyle = getThreatColor(auditResult.overall_threat_level);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Module Title */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Security Intelligence &amp; Integrity Center</span>
              <span className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded-full ${threatStyle.bg} ${threatStyle.text} border ${threatStyle.border}`}>
                Threat Level: {auditResult.overall_threat_level}
              </span>
            </h2>
            <p className="text-xs text-[#908fa0]">
              Continuous device attestation, root elevation scanner, and FCM alert dispatcher
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isScanning}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl glass-button text-white text-xs font-semibold hover:opacity-95 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Analyzing Device Attestations...' : 'Execute Security Audit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Device Parameter Toggles (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Attestation Controls */}
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-[#4cd7f6]" />
                <h3 className="text-sm font-semibold text-white">Client Device Telemetry</h3>
              </div>
              <span className="text-[10px] font-mono text-[#908fa0]">Target: Pixel 9 Pro</span>
            </div>

            <div className="space-y-3.5 mt-4">
              
              {/* Root Detection Toggle */}
              <div className="p-3 rounded-xl bg-[#101415] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#e0e3e5]">Root Privilege Escalation</p>
                  <p className="text-[11px] text-[#908fa0]">Simulate su binary / Magisk injection</p>
                </div>
                <button
                  onClick={() => setRootDetected(!rootDetected)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    rootDetected
                      ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/50'
                      : 'bg-[#191c1e] text-[#908fa0] border border-white/10'
                  }`}
                >
                  {rootDetected ? 'Rooted (Detected)' : 'Enforcing (Clean)'}
                </button>
              </div>

              {/* Developer Options Toggle */}
              <div className="p-3 rounded-xl bg-[#101415] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#e0e3e5]">Developer Options &amp; ADB</p>
                  <p className="text-[11px] text-[#908fa0]">USB Debugging socket status</p>
                </div>
                <button
                  onClick={() => setDeveloperOptionsEnabled(!developerOptionsEnabled)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    developerOptionsEnabled
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#191c1e] text-[#908fa0] border border-white/10'
                  }`}
                >
                  {developerOptionsEnabled ? 'Active (ADB ON)' : 'Disabled'}
                </button>
              </div>

              {/* SafetyNet / Play Integrity Attestation Status */}
              <div className="p-3 rounded-xl bg-[#101415] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#e0e3e5]">Play Integrity Verdict</p>
                  <p className="text-[11px] text-[#908fa0]">Hardware-backed KeyStore attestation</p>
                </div>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                  rootDetected ? 'text-[#ffb4ab] bg-[#ffb4ab]/10' : 'text-[#4cd7f6] bg-[#4cd7f6]/10'
                }`}>
                  {rootDetected ? 'NO_INTEGRITY' : 'MEETS_STRONG_INTEGRITY'}
                </span>
              </div>

            </div>
          </div>

          {/* Android Permissions Audit Checkbox List */}
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2">Granted Android Runtime Permissions</h3>
            <p className="text-xs text-[#908fa0] mb-3">Toggled permissions sent to <code className="text-[#c0c1ff] font-mono">/api/v1/security/audit</code></p>

            <div className="space-y-2">
              {allAvailablePermissions.map(perm => {
                const isChecked = selectedPermissions.includes(perm.name);
                return (
                  <div
                    key={perm.name}
                    onClick={() => handleTogglePermission(perm.name)}
                    className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between cursor-pointer transition-all ${
                      isChecked ? 'bg-[#1d2022] border-[#8083ff]/30 text-[#e0e3e5]' : 'bg-[#101415] border-white/5 text-[#908fa0]'
                    }`}
                  >
                    <span className="truncate pr-2">{perm.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase shrink-0 ${
                      perm.risk === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                      perm.risk === 'high' ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]' :
                      perm.risk === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-[#908fa0]'
                    }`}>
                      {perm.risk}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Threat Assessment & Findings (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Main Threat Level Gauge Card */}
          <div className={`glass-card rounded-2xl p-6 border ${threatStyle.border} relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#908fa0]">Posture Status</span>
                <h3 className={`text-2xl font-extrabold tracking-tight mt-1 ${threatStyle.text}`}>
                  Threat Level: {auditResult.overall_threat_level}
                </h3>
                <p className="text-xs text-[#c7c4d7] mt-1">
                  Scan ID: <span className="font-mono text-[#908fa0]">{auditResult.scan_id}</span>
                </p>
              </div>

              <div className={`w-16 h-16 rounded-2xl ${threatStyle.bg} border ${threatStyle.border} flex items-center justify-center`}>
                {auditResult.overall_threat_level === ThreatLevel.LOW ? (
                  <ShieldCheck className="w-8 h-8 text-[#4cd7f6]" />
                ) : auditResult.overall_threat_level === ThreatLevel.MEDIUM ? (
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                ) : (
                  <ShieldX className="w-8 h-8 text-[#ffb4ab] animate-pulse" />
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#908fa0]">
              <span>Vulnerabilities Detected: {auditResult.vulnerabilities_found.length}</span>
              <span>Scanned: {new Date(auditResult.scanned_at || Date.now()).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Vulnerabilities Registry */}
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-3">Vulnerability Findings &amp; Mitigations</h3>

            {auditResult.vulnerabilities_found.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#101415] border border-white/5 text-center">
                <ShieldCheck className="w-6 h-6 text-[#4cd7f6] mx-auto mb-1.5" />
                <p className="text-xs text-[#e0e3e5] font-semibold">Zero Critical Vulnerabilities</p>
                <p className="text-[11px] text-[#908fa0] mt-0.5">Android device passes all enterprise hardware &amp; software security rules.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditResult.vulnerabilities_found.map((vuln, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#101415] border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#ffb4ab]">{vuln.code}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#ffb4ab]/15 text-[#ffb4ab]">
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[#e0e3e5] mt-1.5">{vuln.details}</p>
                    <div className="mt-2.5 p-2 rounded-lg bg-[#191c1e] border border-white/5 text-[11px] text-[#c7c4d7]">
                      <span className="text-[#4cd7f6] font-semibold font-mono">Mitigation: </span>
                      {vuln.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Actions */}
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-2">Recommended Hardening Actions</h3>
            <ul className="space-y-2">
              {auditResult.recommended_actions.map((action, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-[#c7c4d7]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4cd7f6] mt-0.5 shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
