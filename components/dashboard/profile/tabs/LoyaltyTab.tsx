
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Gift, TrendingUp, History, Tag, Truck, CheckCircle2, Ticket, MessageSquare, ThumbsUp, Copy, Share2, Award, Zap } from 'lucide-react';
import { useLoyaltyStore } from '../../../../stores/useLoyaltyStore';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { GlassCard } from '../../../ui/GlassCard';

export const LoyaltyTab: React.FC = () => {
    const { tier, totalSpent, referralCode, transactions, reviews, fetchLoyaltyData, loading } = useLoyaltyStore();
    const { t, language } = useLanguage();
    const [activeSubTab, setActiveSubTab] = useState<'rewards' | 'reviews'>('rewards');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchLoyaltyData();
    }, []);

    const tiers = {
        BASIC: { min: 0, next: 1000, label: t.dashboard.profile.loyalty.tiers.basic, color: 'text-gray-400', bg: 'bg-gray-400/10' },
        SILVER: { min: 1000, next: 3000, label: t.dashboard.profile.loyalty.tiers.silver, color: 'text-slate-300', bg: 'bg-slate-300/10' },
        GOLD: { min: 3000, next: 10000, label: t.dashboard.profile.loyalty.tiers.gold, color: 'text-gold-500', bg: 'bg-gold-500/10' },
        VIP: { min: 10000, next: 20000, label: t.dashboard.profile.loyalty.tiers.vip, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        PARTNER: { min: 20000, next: Infinity, label: t.dashboard.profile.loyalty.tiers.partner, color: 'text-red-500', bg: 'bg-red-500/10' }
    };

    const currentTierInfo = tiers[tier || 'BASIC'];
    const progress = Math.min(100, Math.max(0, ((totalSpent - currentTierInfo.min) / (currentTierInfo.next - currentTierInfo.min)) * 100));
    const remainingToNext = currentTierInfo.next - totalSpent;

    const handleCopyReferral = () => {
        if (!referralCode) return;
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div key="loyalty" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">

            {/* Tier & Progress Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-gold-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-gold-500/10 transition-colors duration-700"></div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="relative">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-tr from-gold-500/40 to-transparent rounded-full blur-xl"
                            />
                            <div className={`w-24 h-24 rounded-full bg-gradient-to-tr from-[#1A1814] to-[#2A2824] border-2 border-gold-500/30 flex items-center justify-center shadow-2xl relative z-10`}>
                                <Award className={`${currentTierInfo.color} w-12 h-12`} />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gold-500 text-black text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                                {tier}
                            </div>
                        </div>

                        <div className="flex-1 w-full text-center md:text-start">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-white">{t.dashboard.profile.loyalty.currentLevel}</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${currentTierInfo.bg} ${currentTierInfo.color}`}>
                                    {currentTierInfo.label}
                                </span>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">{totalSpent.toLocaleString()} AED</span>
                                    {currentTierInfo.next !== Infinity && (
                                        <span className="text-gold-500/60">{t.dashboard.profile.loyalty.nextTier}: {currentTierInfo.next.toLocaleString()} AED</span>
                                    )}
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)] relative"
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1.5rem_1.5rem] animate-[progress_2s_linear_infinite]" />
                                    </motion.div>
                                </div>
                                {currentTierInfo.next !== Infinity && (
                                    <p className="text-xs text-white/30 italic">
                                        {t.dashboard.profile.loyalty.remainingToNext.replace('{amount}', remainingToNext.toLocaleString())}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Referral Card */}
                <GlassCard className="p-8 flex flex-col justify-center items-center text-center border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                        <Share2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{t.dashboard.profile.loyalty.referralProgram}</h3>
                    <p className="text-xs text-white/40 mb-6">{t.dashboard.profile.loyalty.referralDesc}</p>
                    
                    <div className="w-full relative group">
                        <input 
                            readOnly 
                            value={referralCode || '----'} 
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-center font-mono text-gold-500 text-lg uppercase tracking-widest outline-none focus:border-gold-500/50 transition-all"
                        />
                        <button 
                            onClick={handleCopyReferral}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors"
                        >
                            {copied ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Copy size={18} />}
                        </button>
                    </div>
                    <AnimatePresence>
                        {copied && (
                            <motion.span 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-[10px] text-emerald-400 mt-2 font-bold uppercase tracking-tighter"
                            >
                                {t.dashboard.profile.loyalty.copied}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </GlassCard>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-white/5 pb-4">
                <button
                    onClick={() => setActiveSubTab('rewards')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeSubTab === 'rewards' ? 'text-gold-500' : 'text-white/40 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <Zap size={16} />
                        {t.dashboard.profile.loyalty.tiersTab}
                    </div>
                    {activeSubTab === 'rewards' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500 rounded-t-full shadow-[0_-4px_10px_rgba(234,179,8,0.4)]" />}
                </button>
                <button
                    onClick={() => setActiveSubTab('reviews')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeSubTab === 'reviews' ? 'text-gold-500' : 'text-white/40 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <MessageSquare size={16} />
                        {t.dashboard.profile.loyalty.reviewsTab}
                    </div>
                    {activeSubTab === 'reviews' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500 rounded-t-full shadow-[0_-4px_10px_rgba(234,179,8,0.4)]" />}
                </button>
            </div>

            {activeSubTab === 'rewards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Simplified Tier Benefit Cards instead of point redemption for Phase 1 */}
                    {Object.entries(tiers).map(([key, info]) => (
                        <GlassCard key={key} className={`p-6 border-l-4 ${tier === key ? 'border-gold-500 bg-gold-500/5' : 'border-white/5'} transition-all`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${info.bg} ${info.color}`}>
                                    <Award size={24} />
                                </div>
                                {tier === key && <Badge text={t.dashboard.profile.loyalty.currentBadge} color="gold" />}
                            </div>
                            <h3 className={`text-xl font-bold ${info.color} mb-4`}>{info.label}</h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-xs text-white/50">
                                    <CheckCircle2 size={14} className="text-gold-500" />
                                    {t.dashboard.profile.loyalty.benefits.prioritySupport}
                                </li>
                                <li className="flex items-center gap-2 text-xs text-white/50">
                                    <CheckCircle2 size={14} className="text-gold-500" />
                                    {t.dashboard.profile.loyalty.benefits.exclusiveOffers}
                                </li>
                                {key !== 'BASIC' && (
                                    <li className="flex items-center gap-2 text-xs text-white/80 font-bold">
                                        <TrendingUp size={14} className="text-emerald-400" />
                                        {t.dashboard.profile.loyalty.benefits.commissionEarn.replace('{percent}', key === 'PARTNER' ? '6%' : '4%')}
                                    </li>
                                )}
                            </ul>
                        </GlassCard>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Review List */}
                    <div className="grid grid-cols-1 gap-4">
                        {reviews && reviews.length > 0 ? (
                            reviews.map((review: any) => (
                                <GlassCard key={review.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-white/10 transition-colors">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                                        <ThumbsUp size={28} className="text-gold-500/40" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-white text-lg">{review.store?.name || t.common.store}</h4>
                                                <div className="flex gap-1 text-gold-500 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-white/10"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                review.adminStatus === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' : 
                                                review.adminStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : 
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                                {review.adminStatus}
                                            </span>
                                        </div>
                                        <p className="text-white/70 text-sm leading-relaxed bg-white/5 p-4 rounded-xl italic border-l-2 border-gold-500/30">
                                            "{review.comment}"
                                        </p>
                                        <div className="mt-4 flex items-center justify-between text-[11px] text-white/30">
                                            <span>#ID: {review.id.slice(0,8)}</span>
                                            <span>{new Date(review.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                                    <MessageSquare size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-white/40 mb-2">{t.dashboard.profile.loyalty.noReviews}</h3>
                                <p className="text-white/20 text-sm">{t.dashboard.profile.loyalty.noReviewsDesc}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

interface BadgeProps { text: string; color: 'gold' | 'emerald' | 'rose' }
const Badge: React.FC<BadgeProps> = ({ text, color }) => {
    const colors = {
        gold: 'bg-gold-500/20 text-gold-500 border-gold-500/20',
        emerald: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20',
        rose: 'bg-rose-500/20 text-rose-500 border-rose-500/20'
    };
    return (
        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${colors[color]}`}>
            {text}
        </span>
    );
};
