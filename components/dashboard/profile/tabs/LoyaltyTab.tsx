
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, TrendingUp, History, Tag, Truck, CheckCircle2, Ticket, MessageSquare, ThumbsUp } from 'lucide-react';
import { useLoyaltyStore } from '../../../../stores/useLoyaltyStore';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { GlassCard } from '../../../ui/GlassCard';

export const LoyaltyTab: React.FC = () => {
    const { points, transactions, fetchLoyaltyData, redeemPoints, loading } = useLoyaltyStore();
    const { t, language } = useLanguage();
    const [activeSubTab, setActiveSubTab] = useState<'rewards' | 'reviews'>('rewards');

    // Redeem State
    const [redeemLoading, setRedeemLoading] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Mock Reviews State
    const [reviews, setReviews] = useState<any[]>([
        { id: 1, store: 'Toyota Genuine Parts', rating: 5, comment: 'Excellent service and genuine parts!', date: '2024-02-01', status: 'PUBLISHED' },
        { id: 2, store: 'Al-Amoudi Spare Parts', rating: 4, comment: 'Good shipping speed but packaging could be better.', date: '2024-01-20', status: 'PUBLISHED' }
    ]);

    useEffect(() => {
        fetchLoyaltyData();
    }, []);

    const rewards = [
        { id: 'r1', cost: 500, title: language === 'ar' ? 'كوبون 50 ريال' : '50 SAR Coupon', desc: language === 'ar' ? 'احصل على خصم 50 ريال على طلبك القادم' : 'Get 50 SAR off your next order', icon: Ticket, code: 'LOYALTY50' },
        { id: 'r2', cost: 1000, title: language === 'ar' ? 'شحن مجاني' : 'Free Shipping', desc: language === 'ar' ? 'شحن قياسي مجاني لطلب واحد' : 'Free standard shipping on one order', icon: Truck, code: 'FREESHIP' },
        { id: 'r3', cost: 2000, title: language === 'ar' ? 'استرداد نقدي 250 ريال' : '250 SAR Cashback', desc: language === 'ar' ? 'أضف 250 ريال إلى محفظتك مباشرة' : 'Add 250 SAR to your wallet directly', icon: TrendingUp, code: 'CASHBACK250' },
        { id: 'r4', cost: 5000, title: language === 'ar' ? 'عضوية VIP' : 'VIP Status', desc: language === 'ar' ? 'فتح عروض حصرية لمدة شهر' : 'Unlock exclusive offers for 1 month', icon: Star, code: 'VIP_ACCESS' },
    ];

    const handleRedeem = async (reward: typeof rewards[0]) => {
        if (points < reward.cost) return;
        setRedeemLoading(reward.id);

        const success = await redeemPoints(reward.cost, `Redeemed: ${reward.title}`);

        if (success) {
            setSuccessMsg(language === 'ar' ? `تم استرداد ${reward.title} بنجاح! الكود: ${reward.code}` : `Successfully redeemed ${reward.title}! Code: ${reward.code}`);
            setTimeout(() => setSuccessMsg(null), 5000);
        }
        setRedeemLoading(null);
    };

    return (
        <motion.div key="loyalty" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveSubTab('rewards')}
                    className={`pb-2 text-sm font-bold transition-colors relative ${activeSubTab === 'rewards' ? 'text-gold-500' : 'text-white/40 hover:text-white'}`}
                >
                    {t.dashboard.loyalty?.title || (language === 'ar' ? 'برنامج الولاء' : 'Loyalty & Rewards')}
                    {activeSubTab === 'rewards' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />}
                </button>
                <button
                    onClick={() => setActiveSubTab('reviews')}
                    className={`pb-2 text-sm font-bold transition-colors relative ${activeSubTab === 'reviews' ? 'text-gold-500' : 'text-white/40 hover:text-white'}`}
                >
                    {t.dashboard.reviews?.title || (language === 'ar' ? 'تقييماتي' : 'My Reviews')}
                    {activeSubTab === 'reviews' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500" />}
                </button>
            </div>

            {activeSubTab === 'rewards' ? (
                <>
                    {/* Header Card */}
                    <div className="bg-gradient-to-r from-gold-600/20 to-gold-400/10 border border-gold-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-gold-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="bg-gradient-to-tr from-gold-400 to-gold-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-gold-500/20 mb-4 z-10">
                            <Star className="text-[#1A1814] w-8 h-8 fill-current" />
                        </div>

                        <h2 className="text-4xl font-bold text-white mb-2 z-10">{points}</h2>
                        <p className="text-gold-200 uppercase tracking-widest text-sm z-10">{t.dashboard.common?.earned || (language === 'ar' ? 'النقاط المكتسبة' : 'Points Earned')}</p>

                        {successMsg && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400 text-sm z-10">
                                <CheckCircle2 size={16} />
                                {successMsg}
                            </motion.div>
                        )}
                    </div>

                    {/* Rewards Catalog */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Gift size={20} className="text-gold-500" />
                            {t.dashboard.loyalty?.catalog || (language === 'ar' ? 'مكافآت الولاء' : 'Rewards Catalog')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {rewards.map((reward) => (
                                <GlassCard key={reward.id} className="p-6 flex flex-col items-center text-center hover:border-gold-500/50 transition-colors group">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-gold-500/20 group-hover:text-gold-500 transition-colors">
                                        <reward.icon size={24} />
                                    </div>
                                    <h4 className="font-bold text-white mb-1">{reward.title}</h4>
                                    <p className="text-white/40 text-xs mb-4">{reward.desc}</p>

                                    <div className="mt-auto pt-4 w-full border-t border-white/5">
                                        <button
                                            onClick={() => handleRedeem(reward)}
                                            disabled={points < reward.cost || !!redeemLoading}
                                            className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${points >= reward.cost
                                                ? 'bg-gold-500 hover:bg-gold-600 text-black'
                                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                                                }`}
                                        >
                                            {redeemLoading === reward.id ? '...' : `${reward.cost} ${language === 'ar' ? 'نقطة' : 'pts'}`}
                                        </button>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>

                    {/* Transactions List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2" dir="auto">
                            <History size={18} className="text-gold-500" />
                            {t.common?.history || (language === 'ar' ? 'سجل العمليات' : 'Transaction History')}
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-10 text-white/30 border border-white/5 rounded-xl">
                                {t.dashboard.common?.notFound || (language === 'ar' ? 'لا توجد معاملات' : 'No transactions found')}
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${tx.points > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {tx.points > 0 ? <TrendingUp size={16} /> : <Gift size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm text-start" dir="auto">{tx.description}</p>
                                            <p className="text-xs text-white/40 text-start" dir="auto">{new Date(tx.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${tx.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.points > 0 ? '+' : ''}{tx.points}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MessageSquare size={18} className="text-gold-500" />
                            {t.dashboard.reviews?.title || (language === 'ar' ? 'تقييماتي' : 'My Reviews')}
                        </h3>
                    </div>

                    {/* Review List */}
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <GlassCard key={review.id} className="p-4 flex gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                                    <ThumbsUp size={20} className="text-white/40" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-white">{review.store}</h4>
                                            <div className="flex gap-1 text-gold-500 text-xs">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-white/20"} />
                                                ))}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${review.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                            {review.status}
                                        </span>
                                    </div>
                                    <p className="text-white/70 text-sm mb-2">"{review.comment}"</p>
                                    <p className="text-white/30 text-xs">{new Date(review.date).toLocaleDateString()}</p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    {/* Zero State */}
                    {reviews.length === 0 && (
                        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5 border-dashed">
                            <MessageSquare size={32} className="mx-auto text-white/20 mb-4" />
                            <p className="text-white/40">{language === 'ar' ? 'لم تقم بإضافة أي تقييمات بعد' : 'You haven\'t posted any reviews yet.'}</p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};
