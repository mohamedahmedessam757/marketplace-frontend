
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Building2, Bell, Globe, Save, AlertTriangle, CheckCircle2, ShieldCheck, Activity, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useVendorStore } from '../../../stores/useVendorStore';
import { useAuditStore } from '../../../stores/useAuditStore'; // Use real Audit Store
import { GlassCard } from '../../ui/GlassCard';
import { SecurityUtils } from '../../../utils/security';

export const MerchantSettings: React.FC = () => {
    const { t, language, toggleLanguage } = useLanguage();
    const { account, bankDetails, settings, updateAccount, updateBankDetails, updateSettings } = useVendorStore();
    const { getLogsByActor } = useAuditStore(); // Get Logs

    const [activeTab, setActiveTab] = useState<'account' | 'security' | 'banking' | 'prefs' | 'audit'>('account');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showIBAN, setShowIBAN] = useState(false);

    const isAr = language === 'ar';

    const handleSave = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const tabs = [
        { id: 'account', label: t.dashboard.merchant.merchantSettings.tabs.account, icon: User },
        { id: 'security', label: t.dashboard.merchant.merchantSettings.tabs.security, icon: Lock },
        { id: 'banking', label: t.dashboard.merchant.merchantSettings.tabs.banking, icon: Building2 },
        { id: 'prefs', label: t.dashboard.merchant.merchantSettings.tabs.prefs, icon: Bell },
        { id: 'audit', label: t.dashboard.merchant.audit.title, icon: Activity },
    ];

    // Get logs for 'MERCHANT' (simulated ID, real app uses dynamic ID)
    const auditLogs = getLogsByActor('MERCHANT');

    const InputGroup = ({ label, value, onChange, type = "text", disabled = false, warning = false }: any) => (
        <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`
            w-full bg-[#1A1814] border rounded-xl px-4 py-3 text-white outline-none transition-colors 
            ${warning ? 'border-orange-500/30 focus:border-orange-500' : 'border-white/10 focus:border-gold-500'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
            />
        </div>
    );

    return (
        <div className="grid lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${activeTab === tab.id ? 'bg-gold-500 text-white shadow-lg' : 'text-white/50 hover:bg-white/5 hover:text-white'}
                    `}
                    >
                        <tab.icon size={18} />
                        <span className="font-bold text-sm">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
                <GlassCard className="min-h-[500px] p-6 md:p-10">
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center gap-2"
                        >
                            <CheckCircle2 size={18} />
                            {t.dashboard.merchant.profile.saveSuccess}
                        </motion.div>
                    )}

                    {/* Account Info */}
                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-6">{t.dashboard.merchant.merchantSettings.tabs.account}</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <InputGroup label={t.auth.vendor.account.name} value={account.name} onChange={(e: any) => updateAccount('name', e.target.value)} />
                                <InputGroup label={t.auth.vendor.account.email} value={SecurityUtils.maskEmail(account.email)} disabled />
                                <InputGroup label={t.auth.vendor.account.phone} value={SecurityUtils.maskPhone(account.phone)} disabled />
                            </div>
                            <p className="text-xs text-white/30 italic">{t.dashboard.merchant.merchantSettings.sensitiveInfo}</p>
                        </div>
                    )}

                    {/* Security */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-6">{t.dashboard.merchant.merchantSettings.tabs.security}</h2>
                            <div className="max-w-md space-y-4">
                                <InputGroup label={t.dashboard.profile.security.current} type="password" />
                                <InputGroup label={t.dashboard.profile.security.new} type="password" />
                                <InputGroup label={t.dashboard.profile.security.confirm} type="password" />
                            </div>
                            <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl flex items-center gap-3 mt-6">
                                <ShieldCheck size={20} className="text-green-500" />
                                <span className="text-xs text-green-200/70">{t.dashboard.profile.security.secureNote}</span>
                            </div>
                        </div>
                    )}

                    {/* Banking (Sensitive - Masked) */}
                    {activeTab === 'banking' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-2">{t.dashboard.merchant.merchantSettings.banking.title}</h2>
                            <p className="text-white/50 text-sm mb-6">{t.dashboard.merchant.merchantSettings.banking.desc}</p>

                            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3 mb-6">
                                <AlertTriangle size={20} className="text-orange-500 shrink-0" />
                                <p className="text-xs text-orange-200 leading-relaxed font-bold">
                                    {t.dashboard.merchant.merchantSettings.banking.warning}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <InputGroup
                                    label={t.dashboard.merchant.merchantSettings.banking.bankName}
                                    value={bankDetails.bankName}
                                    onChange={(e: any) => updateBankDetails({ bankName: e.target.value })}
                                    warning
                                />
                                <InputGroup
                                    label={t.dashboard.merchant.merchantSettings.banking.holder}
                                    value={bankDetails.accountHolder}
                                    onChange={(e: any) => updateBankDetails({ accountHolder: e.target.value })}
                                    warning
                                />
                                <div className="md:col-span-2 relative">
                                    <InputGroup
                                        label={t.dashboard.merchant.merchantSettings.banking.label}
                                        value={showIBAN ? bankDetails.iban : SecurityUtils.maskIBAN(bankDetails.iban)}
                                        onChange={(e: any) => updateBankDetails({ iban: e.target.value })}
                                        warning
                                        disabled={!showIBAN}
                                    />
                                    <button
                                        onClick={() => setShowIBAN(!showIBAN)}
                                        className="absolute top-8 right-3 text-white/30 hover:text-white"
                                    >
                                        {showIBAN ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Audit Log (Connected to Store) */}
                    {activeTab === 'audit' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-6">{t.dashboard.merchant.audit.title}</h2>
                            <div className="overflow-hidden border border-white/10 rounded-xl">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-xs uppercase text-white/40">
                                        <tr>
                                            <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.audit.action}</th>
                                            <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.audit.ip}</th>
                                            <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.audit.date}</th>
                                            <th className={`p-4 ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.audit.status}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm text-white/70">
                                        {auditLogs.length > 0 ? auditLogs.map((log, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-bold text-white">{log.action}</td>
                                                <td className="p-4 font-mono text-xs">{log.metadata?.ip || 'N/A'}</td>
                                                <td className="p-4">{new Date(log.timestamp).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <span className="text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs border border-green-500/20">Success</span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-white/30">No activity recorded yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-white/30 mt-4 text-center">
                                {t.dashboard.merchant.audit.note}
                            </p>
                        </div>
                    )}

                    {/* Preferences */}
                    {activeTab === 'prefs' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-6">{t.dashboard.merchant.merchantSettings.prefs.notifTitle}</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-white font-medium">{t.dashboard.merchant.merchantSettings.prefs.whatsapp}</span>
                                        <button
                                            onClick={() => updateSettings({ whatsapp: !settings.notifications.whatsapp })}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.notifications.whatsapp ? 'bg-green-500' : 'bg-white/10'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${settings.notifications.whatsapp ? (isAr ? '-translate-x-6' : 'translate-x-6') : ''}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-white font-medium">{t.dashboard.merchant.merchantSettings.prefs.email}</span>
                                        <button
                                            onClick={() => updateSettings({ email: !settings.notifications.email })}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.notifications.email ? 'bg-green-500' : 'bg-white/10'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${settings.notifications.email ? (isAr ? '-translate-x-6' : 'translate-x-6') : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white mb-6">{t.dashboard.merchant.merchantSettings.prefs.lang}</h2>
                                <button
                                    onClick={toggleLanguage}
                                    className="flex items-center justify-between w-full p-4 bg-white/5 rounded-xl border border-white/5 hover:border-gold-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <Globe size={20} className="text-gold-500" />
                                        <span className="text-white font-medium">{language === 'ar' ? 'العربية' : 'English'}</span>
                                    </div>
                                    <div className="text-xs text-white/40">Click to Switch</div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    {activeTab !== 'audit' && (
                        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-bold shadow-lg shadow-gold-500/20 transition-all active:scale-95"
                            >
                                <Save size={18} />
                                {t.dashboard.merchant.storeProfile.actions.save}
                            </button>
                        </div>
                    )}

                </GlassCard>
            </div>
        </div>
    );
};
