
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ShieldCheck, Lock, Activity, Globe, Eye, Server, AlertOctagon, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminAuditLogs } from './AdminAuditLogs';

export const SecurityAudit: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'config'>('overview');

  const SecurityStatusItem = ({ icon: Icon, label, status, detail }: any) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className="text-white font-bold text-sm">{label}</h4>
                <p className="text-xs text-white/40">{detail}</p>
            </div>
        </div>
        <div className={`flex items-center gap-2 text-xs font-bold uppercase ${status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
            {status === 'active' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {status === 'active' ? 'Enabled' : 'Disabled'}
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <ShieldCheck className="text-gold-500" size={32} />
                {t.admin.security.title}
            </h1>
            
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-gold-500 text-white' : 'text-white/50 hover:text-white'}`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('audit')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'audit' ? 'bg-gold-500 text-white' : 'text-white/50 hover:text-white'}`}
                >
                    Audit Trail
                </button>
                <button 
                    onClick={() => setActiveTab('config')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'config' ? 'bg-gold-500 text-white' : 'text-white/50 hover:text-white'}`}
                >
                    Configuration
                </button>
            </div>
        </div>

        {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Status Column */}
                <div className="space-y-4 lg:col-span-2">
                    <div className="grid md:grid-cols-2 gap-4">
                        <SecurityStatusItem 
                            icon={Lock} 
                            label={t.admin.security.stripe} 
                            status="active" 
                            detail="Webhook Signatures & Event Dedup"
                        />
                        <SecurityStatusItem 
                            icon={Activity} 
                            label={t.admin.security.ratelimit} 
                            status="active" 
                            detail="Redis-based throttling (100 req/min)"
                        />
                        <SecurityStatusItem 
                            icon={Globe} 
                            label="SQL Injection & XSS" 
                            status="active" 
                            detail="Helmet & Parameterized Queries"
                        />
                        <SecurityStatusItem 
                            icon={Server} 
                            label="Data Encryption" 
                            status="active" 
                            detail="AES-256 for Sensitive Data"
                        />
                    </div>

                    <GlassCard className="p-6 bg-[#1A1814] border-red-500/20">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <AlertOctagon className="text-red-500" />
                            {t.admin.security.threats} (Last 24h)
                        </h3>
                        <div className="space-y-3">
                            {[
                                { ip: '192.168.1.45', type: 'SQL Injection Attempt', time: '10 mins ago', action: 'Blocked' },
                                { ip: '10.0.0.9', type: 'Brute Force Login', time: '2 hours ago', action: 'Blocked' },
                                { ip: '45.23.12.1', type: 'Invalid Webhook Signature', time: '5 hours ago', action: 'Logged' },
                            ].map((threat, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-red-200">{threat.ip}</span>
                                        <span className="text-xs text-white/60">{threat.type}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-white/30 block">{threat.time}</span>
                                        <span className="text-[10px] text-red-400 font-bold uppercase">{threat.action}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <GlassCard className="p-6 text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#333" strokeWidth="2" />
                                <motion.path 
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 0.98 }}
                                    transition={{ duration: 1.5 }}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                    fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="100, 100" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-white">98%</span>
                                <span className="text-[10px] text-white/40 uppercase">Secure</span>
                            </div>
                        </div>
                        <h3 className="text-white font-bold">System Integrity</h3>
                        <p className="text-xs text-white/40 mt-1">All systems operational. No critical vulnerabilities detected.</p>
                    </GlassCard>

                    <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-white/60">{t.admin.security.blockedIps}</span>
                            <span className="text-xs font-bold text-red-400">24</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-1.5 mb-4">
                            <div className="bg-red-500 h-1.5 rounded-full w-[20%]" />
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-white/60">Failed Logins</span>
                            <span className="text-xs font-bold text-yellow-400">142</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-1.5">
                            <div className="bg-yellow-500 h-1.5 rounded-full w-[45%]" />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'audit' && (
            <AdminAuditLogs />
        )}

        {activeTab === 'config' && (
            <GlassCard className="p-8 bg-[#1A1814]">
                <div className="max-w-2xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Terminal size={20} className="text-gold-500" />
                        Security Configuration
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl">
                            <div>
                                <h4 className="text-white font-bold text-sm">Force 2FA for Admins</h4>
                                <p className="text-xs text-white/40">Require two-factor authentication for all dashboard access.</p>
                            </div>
                            <div className="w-12 h-6 bg-green-500 rounded-full p-1 cursor-pointer">
                                <div className="w-4 h-4 bg-white rounded-full float-right" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl">
                            <div>
                                <h4 className="text-white font-bold text-sm">Stripe Webhook Validation</h4>
                                <p className="text-xs text-white/40">Enforce strict signature checking on all payment events.</p>
                            </div>
                            <div className="w-12 h-6 bg-green-500 rounded-full p-1 cursor-pointer">
                                <div className="w-4 h-4 bg-white rounded-full float-right" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-white/10 rounded-xl">
                            <div>
                                <h4 className="text-white font-bold text-sm">Sensitive Data Masking</h4>
                                <p className="text-xs text-white/40">Mask emails, phones, and IBANs in logs and UI.</p>
                            </div>
                            <div className="w-12 h-6 bg-green-500 rounded-full p-1 cursor-pointer">
                                <div className="w-4 h-4 bg-white rounded-full float-right" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-white/40 uppercase mb-2">Max Login Attempts (Per Hour)</label>
                            <input type="number" className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white w-32" defaultValue={5} />
                        </div>
                    </div>
                </div>
            </GlassCard>
        )}
    </div>
  );
};
