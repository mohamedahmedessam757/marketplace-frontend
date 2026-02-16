import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Globe2, Smartphone, Monitor, LogOut, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProfileStore } from '../../../../stores/useProfileStore';
import { useLanguage } from '../../../../contexts/LanguageContext';

const InputGroup = ({ label, value, onChange, type = "text", placeholder = "", error = "" }: any) => (
    <div className="space-y-2">
        <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full bg-[#151310] border rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none transition-colors placeholder-white/20 ${error ? 'border-red-500/50' : 'border-white/10'}`}
        />
        {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
    </div>
);

export const SecurityTab: React.FC = () => {
    const { sessions, terminateSession, terminateAllSessions, updatePassword, detectCurrentSession } = useProfileStore();
    const { t, language } = useLanguage();

    // Password State
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [passStrength, setPassStrength] = useState(0);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        detectCurrentSession();
    }, []);

    const calculateStrength = (pass: string) => {
        setNewPass(pass);
        let score = 0;
        if (pass.length > 6) score++;
        if (pass.length > 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setPassStrength(score);
    };

    const handleUpdatePassword = async () => {
        setMsg(null);
        if (newPass !== confirmPass) {
            setMsg({ type: 'error', text: language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match' });
            return;
        }
        if (passStrength < 3) {
            setMsg({ type: 'error', text: language === 'ar' ? 'كلمة المرور ضعيفة جداً' : 'Password is too weak' });
            return;
        }

        setLoading(true);
        try {
            await updatePassword(currentPass, newPass);
            setMsg({ type: 'success', text: language === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully' });
            setCurrentPass('');
            setNewPass('');
            setConfirmPass('');
            setPassStrength(0);
        } catch (err: any) {
            setMsg({ type: 'error', text: err.message || (language === 'ar' ? 'فشل تحديث كلمة المرور' : 'Failed to update password') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
            {/* Password Section */}
            <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Lock size={20} className="text-gold-500" />
                    {t.dashboard.profile.security.update}
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <InputGroup
                        label={t.dashboard.profile.security.current}
                        type="password"
                        value={currentPass}
                        onChange={(e: any) => setCurrentPass(e.target.value)}
                    />
                    <div className="space-y-2">
                        <label className="text-xs text-white/40 uppercase tracking-wider">{t.dashboard.profile.security.new}</label>
                        <input
                            type="password"
                            value={newPass}
                            className="w-full bg-[#151310] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none transition-colors"
                            onChange={(e) => calculateStrength(e.target.value)}
                        />
                        {/* Password Strength Meter */}
                        <div className="flex gap-1 h-1 mt-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full transition-colors duration-300 ${i <= passStrength
                                        ? passStrength < 3 ? 'bg-red-500' : passStrength < 5 ? 'bg-yellow-500' : 'bg-green-500'
                                        : 'bg-white/10'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <InputGroup
                        label={t.dashboard.profile.security.confirm}
                        type="password"
                        value={confirmPass}
                        onChange={(e: any) => setConfirmPass(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        {msg && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-center gap-2 text-sm ${msg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
                            >
                                {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                {msg.text}
                            </motion.div>
                        )}
                    </div>
                    <button
                        onClick={handleUpdatePassword}
                        disabled={loading || !currentPass || !newPass}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {t.dashboard.profile.security.update}
                    </button>
                </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Active Sessions Section */}
            <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Globe2 size={20} className="text-gold-500" />
                    {t.dashboard.profile.security.activeSessions}
                </h3>

                <div className="space-y-3">
                    {sessions.length > 0 ? sessions.map(session => (
                        <div key={session.id} className="p-4 rounded-xl border border-white/5 bg-[#151310] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${session.device.toLowerCase().includes('phone') ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                    {session.device.toLowerCase().includes('phone') ? <Smartphone size={20} /> : <Monitor size={20} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-sm">{session.device}</span>
                                        {session.isCurrent && (
                                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                                                {t.dashboard.profile.security.thisDevice || 'This Device'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-white/40 mt-1 flex items-center gap-2">
                                        <span>{session.os}</span>
                                        <span>•</span>
                                        <span>{session.location}</span>
                                        <span>•</span>
                                        <span className="font-mono">{session.ip}</span>
                                        <span>•</span>
                                        <span>{session.lastActive}</span>
                                    </div>
                                </div>
                            </div>
                            {!session.isCurrent && (
                                <button
                                    onClick={() => terminateSession(session.id)}
                                    className="p-2 hover:bg-red-500/10 text-white/30 hover:text-red-500 rounded-lg transition-colors text-xs"
                                >
                                    {t.dashboard.profile.security.terminate}
                                </button>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-6 text-white/30">
                            {language === 'ar' ? 'جاري تحميل الجلسات...' : 'Loading sessions...'}
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <button
                        onClick={terminateAllSessions}
                        className="w-full py-4 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut size={18} />
                        {t.dashboard.profile.security.terminateAll}
                    </button>
                </div>
            </div>

            <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl flex items-center gap-3">
                <ShieldCheck size={20} className="text-green-500" />
                <span className="text-xs text-green-200/70">
                    {t.dashboard.profile.security.secureNote}
                </span>
            </div>

        </motion.div>
    );
};
