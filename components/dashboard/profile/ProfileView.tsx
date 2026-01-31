
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { useProfileStore } from '../../../stores/useProfileStore';
import { useReviewStore } from '../../../stores/useReviewStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { User, Lock, Settings, Trash2, Shield, Bell, MapPin, Star, Plus, Home, Briefcase, Smartphone, Monitor, Globe2, ShieldCheck, LogOut } from 'lucide-react';

// FIX: Moved outside the component to prevent re-rendering and focus loss
const InputGroup = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
    <div className="space-y-2">
        <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-[#151310] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none transition-colors placeholder-white/20"
        />
    </div>
);

export const ProfileView: React.FC = () => {
    const { user, addresses, sessions, settings, updateUser, updateSettings, addAddress, removeAddress, setDefaultAddress, terminateSession, terminateAllSessions } = useProfileStore();
    const { reviews } = useReviewStore();
    const { t } = useLanguage();

    // Removed 'wallet' from activeTab state type
    const [activeTab, setActiveTab] = useState<'info' | 'security' | 'addresses' | 'reviews' | 'settings'>('info');

    // Address Form State
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ title: '', city: '', details: '' });

    // Security Form State
    const [passStrength, setPassStrength] = useState(0);

    // Removed Wallet from tabs array
    const tabs = [
        { id: 'info', icon: User, label: t.dashboard.profile.tabs.info },
        { id: 'security', icon: Shield, label: t.dashboard.profile.tabs.security },
        { id: 'addresses', icon: MapPin, label: t.dashboard.profile.tabs.addresses },
        { id: 'reviews', icon: Star, label: t.dashboard.profile.tabs.reviews },
        { id: 'settings', icon: Settings, label: t.dashboard.profile.tabs.settings },
    ];

    const handleAddAddress = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAddress.title && newAddress.city && newAddress.details) {
            addAddress({ ...newAddress, isDefault: false });
            setNewAddress({ title: '', city: '', details: '' });
            setShowAddAddress(false);
        }
    };

    const calculateStrength = (pass: string) => {
        let score = 0;
        if (pass.length > 6) score++;
        if (pass.length > 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setPassStrength(score);
    };

    return (
        <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${activeTab === tab.id ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-white/50 hover:bg-white/5 hover:text-white'}
                  `}
                    >
                        <tab.icon size={18} />
                        <span className="font-bold text-sm">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
                <GlassCard className="min-h-[500px] p-6 md:p-10">
                    <AnimatePresence mode="wait">

                        {/* TAB: PERSONAL INFO */}
                        {activeTab === 'info' && (
                            <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 p-[2px]">
                                        <div className="w-full h-full rounded-full bg-[#1A1814] flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white">MA</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{user.name}</h2>
                                        <p className="text-white/40 text-sm">{(t.dashboard.profile as any).accountType}</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <InputGroup label={t.dashboard.profile.info.name} value={user.name} onChange={(e: any) => updateUser({ name: e.target.value })} />
                                    <InputGroup label={t.dashboard.profile.info.email} value={user.email} onChange={(e: any) => updateUser({ email: e.target.value })} />
                                    <InputGroup label={t.dashboard.profile.info.phone} value={user.phone} onChange={(e: any) => updateUser({ phone: e.target.value })} />
                                </div>

                                <div className="pt-6 border-t border-white/5 flex justify-end">
                                    <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                        {t.dashboard.profile.info.save}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB: SECURITY */}
                        {activeTab === 'security' && (
                            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">

                                {/* Password Section */}
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <Lock size={20} className="text-gold-500" />
                                        {t.dashboard.profile.security.update}
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <InputGroup label={t.dashboard.profile.security.current} type="password" />
                                        <div className="space-y-2">
                                            <label className="text-xs text-white/40 uppercase tracking-wider">{t.dashboard.profile.security.new}</label>
                                            <input
                                                type="password"
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
                                        <InputGroup label={t.dashboard.profile.security.confirm} type="password" />
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-bold transition-all">
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
                                        {sessions.map(session => (
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
                                                        className="p-2 hover:bg-red-500/10 text-white/30 hover:text-red-500 rounded-lg transition-colors text-xs"
                                                    >
                                                        {t.dashboard.profile.security.terminate}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
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
                        )}

                        {/* TAB: ADDRESSES */}
                        {activeTab === 'addresses' && (
                            <motion.div key="addresses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-white">{t.dashboard.profile.addresses.title}</h3>
                                    <button
                                        onClick={() => setShowAddAddress(!showAddAddress)}
                                        className="flex items-center gap-2 text-gold-400 text-sm hover:text-white transition-colors"
                                    >
                                        <Plus size={16} />
                                        {t.dashboard.profile.addresses.add}
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {showAddAddress && (
                                        <motion.form
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            onSubmit={handleAddAddress}
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 overflow-hidden"
                                        >
                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                <InputGroup
                                                    label="Label (Home, Work)"
                                                    value={newAddress.title}
                                                    onChange={(e: any) => setNewAddress({ ...newAddress, title: e.target.value })}
                                                    placeholder="e.g. Home"
                                                />
                                                <InputGroup
                                                    label="City"
                                                    value={newAddress.city}
                                                    onChange={(e: any) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                    placeholder="e.g. Riyadh"
                                                />
                                                <div className="md:col-span-2">
                                                    <InputGroup
                                                        label="Full Address Details"
                                                        value={newAddress.details}
                                                        onChange={(e: any) => setNewAddress({ ...newAddress, details: e.target.value })}
                                                        placeholder="Street, Building No..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 py-2 text-white/60 hover:text-white">{(t.common as any).cancel}</button>
                                                <button type="submit" className="px-4 py-2 bg-gold-500 text-white rounded-lg font-bold hover:bg-gold-600">{t.dashboard.profile.addresses.save}</button>
                                            </div>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                                <div className="space-y-4">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`p-4 rounded-xl border transition-all ${addr.isDefault ? 'bg-gold-500/10 border-gold-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-2 rounded-lg ${addr.isDefault ? 'bg-gold-500 text-white' : 'bg-white/10 text-white/50'}`}>
                                                        {addr.title.toLowerCase().includes('office') ? <Briefcase size={20} /> : <Home size={20} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-white">{addr.title}</h4>
                                                            {addr.isDefault && (
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500 text-white font-medium">
                                                                    {t.dashboard.profile.addresses.default}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-white/60">{addr.city}, {addr.details}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!addr.isDefault && (
                                                        <button
                                                            onClick={() => setDefaultAddress(addr.id)}
                                                            className="text-xs text-white/40 hover:text-gold-400 px-2 py-1"
                                                        >
                                                            {(t.dashboard.profile.addresses as any).setDefault}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => removeAddress(addr.id)}
                                                        className="p-1.5 hover:bg-red-500/20 text-white/30 hover:text-red-500 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* TAB: REVIEWS */}
                        {activeTab === 'reviews' && (
                            <motion.div key="reviews" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <Star size={20} className="text-gold-500" />
                                    {t.dashboard.profile.reviews.title}
                                </h3>
                                <div className="space-y-4">
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-10 text-white/40">{t.dashboard.profile.reviews.noReviews}</div>
                                    ) : (
                                        reviews.map((review) => (
                                            <div key={review.id} className="p-6 bg-[#151310] border border-white/10 rounded-xl">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-white text-lg">{review.partName}</h4>
                                                        <p className="text-xs text-gold-400">{review.merchantName}</p>
                                                    </div>
                                                    <span className={`text-[10px] px-2 py-1 rounded border ${review.status === 'published' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'}`}>
                                                        {review.status === 'published' ? t.dashboard.reviews.published : t.dashboard.reviews.pending}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 mb-3">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} size={14} fill={s <= review.rating ? "#FACC15" : "none"} className={s <= review.rating ? "text-yellow-400" : "text-white/20"} />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-white/70 italic mb-3">"{review.comment}"</p>
                                                <div className="text-xs text-white/30 text-right">{review.date}</div>
                                            </div>
                                        )))}
                                </div>
                            </motion.div>
                        )}

                        {/* TAB: SETTINGS */}
                        {activeTab === 'settings' && (
                            <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gold-500/20 text-gold-500 rounded-lg"><Bell size={20} /></div>
                                        <div>
                                            <h4 className="font-bold text-white">{t.dashboard.profile.settings.notif}</h4>
                                            <p className="text-xs text-white/40">{(t.dashboard.profile.settings as any).notifDesc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateSettings({ notifications: !settings.notifications })}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.notifications ? 'bg-gold-500' : 'bg-white/10'}`}
                                    >
                                        <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" />
                                    </button>
                                </div>
                                <div className="pt-6 mt-8 border-t border-red-500/20">
                                    <h4 className="text-red-500 font-bold mb-4 flex items-center gap-2">
                                        <Trash2 size={16} />
                                        {t.dashboard.profile.settings.danger}
                                    </h4>
                                    <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-bold transition-colors">
                                        {t.dashboard.profile.settings.delete}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </GlassCard>
            </div>
        </div>
    );
};
