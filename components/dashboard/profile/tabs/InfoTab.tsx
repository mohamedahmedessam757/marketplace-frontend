import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '../../../../stores/useProfileStore';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { Loader2, CheckCircle2 } from 'lucide-react';

const InputGroup = ({ label, value, onChange, type = "text", placeholder = "", disabled = false }: any) => (
    <div className="space-y-2">
        <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full bg-[#151310] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none transition-colors placeholder-white/20 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
    </div>
);

export const InfoTab: React.FC = () => {
    const { user, loading, fetchProfile, updateUser } = useProfileStore();
    const { t, language } = useLanguage();
    const [success, setSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await updateUser(user);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-10 text-white/50">
                {t.dashboard.common?.notFound || 'User not found'}
            </div>
        );
    }

    return (
        <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#1A1814] flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                            {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </span>
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{user.name || user.email}</h2>
                    <p className="text-white/40 text-sm">{user.role}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <InputGroup
                    label={t.dashboard.profile.info.name}
                    value={user.name || ''}
                    onChange={(e: any) => updateUser({ name: e.target.value })}
                />
                <InputGroup
                    label={t.dashboard.profile.info.email}
                    value={user.email || ''}
                    onChange={() => { }}
                    disabled={true}
                />
                <InputGroup
                    label={t.dashboard.profile.info.phone}
                    value={user.phone || ''}
                    onChange={(e: any) => updateUser({ phone: e.target.value })}
                />
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-4">
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20"
                        >
                            <CheckCircle2 size={16} />
                            <span className="text-sm font-bold">{language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved Successfully'}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
                >
                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                    {t.dashboard.profile.info.save}
                </button>
            </div>
        </motion.div>
    );
};
