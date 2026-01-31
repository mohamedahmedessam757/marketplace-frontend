

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, Clock, FileText, UploadCloud, Edit3, Save, CheckCircle2, User, Phone, Mail, Shield, Lock, Smartphone, Globe, LogOut } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useVendorStore } from '../../../stores/useVendorStore';
import { useProfileStore } from '../../../stores/useProfileStore';
import { GlassCard } from '../../ui/GlassCard';

export const MerchantProfile: React.FC = () => {
    const { t, language } = useLanguage();
    const { storeInfo, account, profile, updateStoreInfo, updateProfile } = useVendorStore();
    const { sessions, terminateSession, terminateAllSessions } = useProfileStore();

    const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');
    const [isEditing, setIsEditing] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    const isAr = language === 'ar';

    const handleSave = () => {
        setIsEditing(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
    };

    const InputGroup = ({ label, value, onChange, disabled = false, type = "text", warning = false }: any) => (
        <div className="space-y-2">
            <div className="flex justify-between">
                <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={!isEditing || disabled}
                className={`
            w-full bg-[#1A1814] border rounded-xl px-4 py-3 text-white outline-none transition-colors 
            ${isEditing ? 'border-white/10 focus:border-gold-500' : 'border-transparent text-white/70'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
            />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Store className="text-gold-500" size={32} />
                        {t.dashboard.merchant.storeProfile.title}
                    </h1>

                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'details' ? 'bg-gold-500 text-white' : 'text-white/50 hover:text-white'}`}
                        >
                            {t.dashboard.merchant.tabs.details}
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'security' ? 'bg-gold-500 text-white' : 'text-white/50 hover:text-white'}`}
                        >
                            {t.dashboard.merchant.tabs.security}
                        </button>
                    </div>
                </div>

                {activeTab === 'details' && (
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${isEditing
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                            }`}
                    >
                        {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
                        {isEditing ? t.dashboard.merchant.storeProfile.actions.save : t.dashboard.merchant.storeProfile.actions.edit}
                    </button>
                )}
            </div>

            {showSaveSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3"
                >
                    <CheckCircle2 size={20} />
                    {t.dashboard.merchant.profile.saveSuccess}
                </motion.div>
            )}

            {activeTab === 'details' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <GlassCard className="p-6 text-center relative group">
                            <div className="w-32 h-32 mx-auto bg-white/5 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mb-4 overflow-hidden relative">
                                {profile.logo ? (
                                    <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Store size={40} className="text-white/20" />
                                )}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <UploadCloud className="text-white" />
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{storeInfo.storeName || t.dashboard.merchant.storeProfile.fields.name}</h2>
                            <div className="text-gold-400 text-xs font-bold bg-gold-500/10 inline-block px-3 py-1 rounded-full border border-gold-500/20">
                                {t.dashboard.merchant.profile.verified}
                            </div>

                            <div className="mt-6 flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map(s => <div key={s} className="w-1.5 h-1.5 rounded-full bg-green-500" />)}
                            </div>
                            <p className="text-xs text-white/40 mt-1">5.0 {t.dashboard.merchant.profile.rating}</p>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4 pb-2 border-b border-white/5">
                                {t.dashboard.merchant.storeProfile.sections.contact}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                    <User size={18} className="text-gold-500" />
                                    <div>
                                        <div className="text-[10px] text-white/40">{t.dashboard.merchant.profile.manager}</div>
                                        <div className="text-white text-sm font-medium">{account.name}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                    <Phone size={18} className="text-gold-500" />
                                    <div>
                                        <div className="text-[10px] text-white/40">{t.dashboard.merchant.profile.mobile}</div>
                                        <div className="text-white text-sm font-mono">{account.phone}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                    <Mail size={18} className="text-gold-500" />
                                    <div>
                                        <div className="text-[10px] text-white/40">{t.dashboard.merchant.profile.email}</div>
                                        <div className="text-white text-sm">{account.email}</div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard className="p-6 md:p-8">
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">
                                {t.dashboard.merchant.storeProfile.sections.basic}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <InputGroup
                                    label={t.dashboard.merchant.storeProfile.fields.name}
                                    value={storeInfo.storeName}
                                    onChange={(e: any) => updateStoreInfo('storeName', e.target.value)}
                                    warning
                                />
                                <InputGroup
                                    label={t.dashboard.merchant.storeProfile.fields.categories}
                                    value={profile.categories.join(', ')}
                                    disabled
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-white/40 uppercase tracking-wider">{t.dashboard.merchant.storeProfile.fields.bio}</label>
                                <textarea
                                    value={storeInfo.bio}
                                    onChange={(e) => updateStoreInfo('bio', e.target.value)}
                                    disabled={!isEditing}
                                    rows={4}
                                    className={`
                                    w-full bg-[#1A1814] border rounded-xl px-4 py-3 text-white outline-none transition-colors resize-none
                                    ${isEditing ? 'border-white/10 focus:border-gold-500' : 'border-transparent text-white/70'}
                                `}
                                />
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 md:p-8">
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                                <Clock size={20} className="text-gold-500" />
                                {t.dashboard.merchant.storeProfile.sections.hours}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <InputGroup
                                    label={t.dashboard.merchant.profile.openTime}
                                    type="time"
                                    value={profile.workingHours.start}
                                    onChange={(e: any) => updateProfile({ workingHours: { ...profile.workingHours, start: e.target.value } })}
                                />
                                <InputGroup
                                    label={t.dashboard.merchant.profile.closeTime}
                                    type="time"
                                    value={profile.workingHours.end}
                                    onChange={(e: any) => updateProfile({ workingHours: { ...profile.workingHours, end: e.target.value } })}
                                />
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2 text-white/60 mb-2">
                                    <MapPin size={16} />
                                    <span className="text-sm">{t.dashboard.merchant.profile.location}</span>
                                </div>
                                <div className="h-32 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white/20">
                                    {t.dashboard.merchant.profile.location}
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 md:p-8 bg-[#1A1814]/50">
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                                <FileText size={20} className="text-gold-500" />
                                {t.dashboard.merchant.storeProfile.sections.docs}
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: t.dashboard.merchant.storeProfile.fields.cr, status: 'Active', date: '2025-12-01' },
                                    { label: t.dashboard.merchant.storeProfile.fields.license, status: 'Active', date: '2024-10-15' },
                                ].map((doc, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-white/40" size={18} />
                                            <div>
                                                <div className="text-sm font-bold text-white">{doc.label}</div>
                                                <div className="text-[10px] text-white/40">{t.dashboard.merchant.storeProfile.fields.expiry}: {doc.date}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/10">{t.common.active}</span>
                                            {isEditing && (
                                                <button className="text-xs text-gold-400 hover:underline">{t.dashboard.merchant.documents.actions.update}</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <GlassCard className="p-8">
                    <div className="max-w-2xl mx-auto space-y-10">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Lock size={20} className="text-gold-500" />
                                {t.dashboard.profile.security.update}
                            </h3>
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">{t.dashboard.profile.security.current}</label>
                                        <input type="password" className="w-full bg-[#1A1814] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">{t.dashboard.profile.security.new}</label>
                                        <input type="password" className="w-full bg-[#1A1814] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">{t.dashboard.profile.security.confirm}</label>
                                        <input type="password" className="w-full bg-[#1A1814] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-colors">
                                        {t.dashboard.merchant.storeProfile.actions.save}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-white/10" />

                        <div>
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Globe size={20} className="text-gold-500" />
                                {t.dashboard.profile.security.activeSessions}
                            </h3>

                            <div className="space-y-3 mb-6">
                                {sessions.map(session => (
                                    <div key={session.id} className="p-4 rounded-xl border border-white/5 bg-[#151310] flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${session.device.toLowerCase().includes('phone') ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                {session.device.toLowerCase().includes('phone') ? <Smartphone size={20} /> : <Shield size={20} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-sm">{session.device}</span>
                                                    {session.isCurrent && (
                                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                                                            {t.dashboard.profile.security.thisDevice}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-white/40 mt-1 flex items-center gap-2">
                                                    <span>{session.os}</span>
                                                    <span>•</span>
                                                    <span>{session.location}</span>
                                                    <span>•</span>
                                                    <span className="font-mono">{session.ip}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {!session.isCurrent && (
                                            <button
                                                onClick={() => terminateSession(session.id)}
                                                className="p-2 hover:bg-red-500/10 text-white/30 hover:text-red-500 rounded-lg transition-colors text-xs border border-transparent hover:border-red-500/20"
                                            >
                                                {t.dashboard.profile.security.terminate}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={terminateAllSessions}
                                className="w-full py-4 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                {t.dashboard.profile.security.terminateAll}
                            </button>
                        </div>

                    </div>
                </GlassCard>
            )}
        </div>
    );
};
