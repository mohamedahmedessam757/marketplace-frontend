import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { useReviewStore } from '../../../stores/useReviewStore';
import { useVendorStore } from '../../../stores/useVendorStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Star, MessageSquare, User, Calendar, Quote, TrendingUp, Award, ThumbsUp, Loader2, Search } from 'lucide-react';

export const MerchantReviews: React.FC = () => {
    const { t, language } = useLanguage();
    const { reviews, fetchMerchantReviews, isLoading } = useReviewStore();
    const { performance } = useVendorStore();
    const isAr = language === 'ar';

    useEffect(() => {
        fetchMerchantReviews();
    }, []);

    // Calculate stats
    const averageRating = performance?.rating || 0;
    const totalReviews = reviews.length;
    const fiveStars = reviews.filter(r => r.rating === 5).length;
    const fiveStarPercentage = totalReviews > 0 ? (fiveStars / totalReviews) * 100 : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header / Summary Card */}
            <div className="grid lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-1 p-8 bg-gradient-to-br from-gold-500/10 to-transparent border-gold-500/20 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-4">
                        <div className="text-6xl font-black text-white">{averageRating.toFixed(1)}</div>
                        <div className="absolute -top-2 -right-4 bg-gold-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-gold-500/20">
                            {isAr ? 'ممتاز' : 'EXCELLENT'}
                        </div>
                    </div>
                    
                    <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star 
                                key={s} 
                                size={24} 
                                fill={s <= Math.round(averageRating) ? "currentColor" : "none"} 
                                className={s <= Math.round(averageRating) ? "text-gold-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" : "text-white/10"} 
                            />
                        ))}
                    </div>
                    
                    <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
                        {isAr ? `بناءً على ${totalReviews} تقييم` : `Based on ${totalReviews} reviews`}
                    </p>
                </GlassCard>

                <GlassCard className="lg:col-span-2 p-8 grid md:grid-cols-3 gap-8">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <ThumbsUp size={18} />
                            </div>
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">{isAr ? 'رضا العملاء' : 'CUSTOMER SATISFACTION'}</span>
                        </div>
                        <div className="text-3xl font-black text-white">{fiveStarPercentage.toFixed(0)}%</div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${fiveStarPercentage}%` }}
                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            />
                        </div>
                        <p className="text-[10px] text-white/30">{isAr ? 'نسبة التقييمات 5 نجوم' : 'Percentage of 5-star ratings'}</p>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <TrendingUp size={18} />
                            </div>
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">{isAr ? 'نمو السمعة' : 'REPUTATION GROWTH'}</span>
                        </div>
                        <div className="text-3xl font-black text-white">+{totalReviews > 0 ? (totalReviews * 0.5).toFixed(1) : 0}</div>
                        <p className="text-xs text-white/60 leading-tight">{isAr ? 'تأثير التقييمات على ظهورك في نتائج البحث' : 'Impact of reviews on your search ranking visibility'}</p>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <Award size={18} />
                            </div>
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">{isAr ? 'ترتيب المتجر' : 'STORE RANK'}</span>
                        </div>
                        <div className="text-3xl font-black text-white">TOP 5%</div>
                        <div className="flex -space-x-2">
                             {[...Array(4)].map((_, i) => (
                                 <div key={i} className="w-8 h-8 rounded-full bg-gold-500/20 border-2 border-[#1A1814] flex items-center justify-center">
                                     <Star size={12} className="text-gold-500" fill="currentColor" />
                                 </div>
                             ))}
                        </div>
                     </div>
                </GlassCard>
            </div>

            {/* List Header */}
            <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <Quote className="text-gold-500 rotate-180" size={24} />
                    {isAr ? 'آراء العملاء' : 'Customer Feedback'}
                </h3>
            </div>

            {/* Reviews List */}
            <div className="grid gap-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 size={40} className="animate-spin text-gold-500/40" />
                        <p className="text-white/20 font-bold uppercase tracking-widest text-xs">{isAr ? 'جاري تحميل الآراء...' : 'Loading Feedback...'}</p>
                    </div>
                ) : reviews.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {reviews.map((review, idx) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <GlassCard className="p-6 md:p-10 border-white/5 hover:border-gold-500/20 transition-all group relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-8 bg-gold-500/5 rounded-full blur-2xl -mr-4 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                     
                                     <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                         {/* User Info & Rating */}
                                         <div className="md:w-64 space-y-4">
                                             <div className="flex items-center gap-4">
                                                 <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold-500/60 transition-colors group-hover:text-gold-500 group-hover:border-gold-500/30">
                                                     <User size={28} />
                                                 </div>
                                                 <div>
                                                     <h4 className="font-black text-white text-base truncate uppercase tracking-tighter">{review.customer?.name || 'Customer'}</h4>
                                                     <div className="flex items-center gap-2 text-[10px] text-white/30 font-black uppercase tracking-widest">
                                                         <Calendar size={12} />
                                                         {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                     </div>
                                                 </div>
                                             </div>
                                             
                                             <div className="flex gap-1">
                                                 {[1, 2, 3, 4, 5].map(s => (
                                                     <Star 
                                                         key={s} 
                                                         size={18} 
                                                         fill={s <= review.rating ? "currentColor" : "none"} 
                                                         className={s <= review.rating ? "text-gold-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" : "text-white/5"} 
                                                     />
                                                 ))}
                                             </div>
                                         </div>

                                         {/* Comment */}
                                         <div className="flex-1 flex flex-col justify-center">
                                             <div className="relative">
                                                 <MessageSquare size={60} className="absolute -top-6 -left-6 text-white/[0.02] pointer-events-none group-hover:text-gold-500/[0.03] transition-colors" />
                                                 <p className="text-white/80 text-lg md:text-xl font-medium leading-relaxed italic relative z-10">
                                                     "{review.comment}"
                                                 </p>
                                             </div>
                                         </div>
                                     </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <GlassCard className="py-32 flex flex-col items-center justify-center text-center opacity-50 grayscale border-dashed">
                        <Search size={48} className="text-white/10 mb-4" />
                        <h4 className="text-white/60 font-bold uppercase tracking-widest">{isAr ? 'لا توجد تقييمات منشورة بعد' : 'No published reviews yet'}</h4>
                        <p className="text-white/20 text-xs mt-2">{isAr ? 'عندما يقوم العملاء بتقييم طلباتهم ويوافق المسؤول عليها ستظهر هنا' : 'Once customers rate their orders and admin approves, they will appear here'}</p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
};
