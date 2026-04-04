
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { useReviewStore } from '../../../stores/useReviewStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Star, CheckCircle2, XCircle, Search, Loader2, MessageSquare, User, Store, Calendar } from 'lucide-react';

export const ReviewsControl: React.FC = () => {
    const { t, language } = useLanguage();
    const { reviews, fetchAdminReviews, updateReviewStatus, isLoading, error } = useReviewStore();
    const [tab, setTab] = useState<'PENDING' | 'PUBLISHED' | 'REJECTED'>('PENDING');

    useEffect(() => {
        fetchAdminReviews();
    }, []);

    const filteredReviews = reviews.filter(r => r.adminStatus === tab);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{t.admin.reviewsControl.title}</h1>
                    <p className="text-white/40 text-sm">{language === 'ar' ? 'إدراة ومراجعة تقييمات العملاء للمتاجر' : 'Manage and moderate customer reviews for stores'}</p>
                </div>
                <button 
                    onClick={() => fetchAdminReviews()}
                    disabled={isLoading}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white"
                >
                    <Loader2 size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-black/40 border border-white/5 rounded-2xl w-fit">
                {[
                    { id: 'PENDING', label: t.admin.reviewsControl.pending, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
                    { id: 'PUBLISHED', label: t.admin.reviewsControl.published, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
                    { id: 'REJECTED', label: t.admin.reviewsControl.rejected, color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20' },
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setTab(item.id as any)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${
                            tab === item.id ? `${item.color} ${item.bg} border shadow-[0_4px_20px_rgba(0,0,0,0.3)]` : 'text-white/30 border-transparent hover:text-white/60'
                        }`}
                    >
                        {item.label}
                        {tab === item.id && (
                            <motion.div layoutId="active-tab" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />
                        )}
                        <span className="ml-2 opacity-30 text-[10px]">({reviews.filter(r => r.adminStatus === item.id).length})</span>
                    </button>
                ))}
            </div>

            {/* Reviews List */}
            <div className="grid gap-6">
                {isLoading && reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 size={40} className="animate-spin text-gold-500/40" />
                        <p className="text-white/20 font-bold uppercase tracking-widest text-xs">{language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading Reviews...'}</p>
                    </div>
                ) : filteredReviews.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {filteredReviews.map(review => (
                            <motion.div
                                key={review.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <GlassCard className="p-8 group hover:border-white/20 transition-all border-white/5 relative overflow-hidden">
                                     <div className={`absolute top-0 right-0 w-1 h-full ${tab === 'PENDING' ? 'bg-amber-500/50' : tab === 'PUBLISHED' ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`} />
                                     
                                     <div className="flex flex-col lg:flex-row gap-8">
                                         {/* Left Column: Review Info */}
                                         <div className="flex-1 space-y-4">
                                             <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                 <div className="flex items-center gap-2 text-white/60">
                                                     <User size={14} className="text-gold-500" />
                                                     {review.customer?.name || 'Customer'}
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                     <Store size={14} />
                                                     {review.store?.name || 'Store'}
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                     <Calendar size={14} />
                                                     {new Date(review.createdAt).toLocaleDateString()}
                                                 </div>
                                                 <span>#ID: {review.id.slice(0,8)}</span>
                                             </div>

                                             <div className="flex gap-1.5 py-1">
                                                {[1,2,3,4,5].map(s => (
                                                    <Star 
                                                        key={s} 
                                                        size={20} 
                                                        fill={s <= review.rating ? "currentColor" : "none"} 
                                                        className={s <= review.rating ? "text-gold-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" : "text-white/5"} 
                                                    />
                                                ))}
                                             </div>

                                             <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl relative">
                                                <MessageSquare size={40} className="absolute top-2 right-4 text-white/[0.03] pointer-events-none" />
                                                <p className="text-white/80 text-base leading-relaxed italic relative z-10">"{review.comment}"</p>
                                             </div>
                                         </div>

                                         {/* Right Column: Actions */}
                                         <div className="lg:w-48 flex lg:flex-col justify-center gap-3">
                                             {tab === 'PENDING' && (
                                                 <>
                                                     <button 
                                                        onClick={() => updateReviewStatus(review.id, 'PUBLISHED')}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/5 group"
                                                     >
                                                         <CheckCircle2 size={16} />
                                                         {t.admin.reviewsControl.approve}
                                                     </button>
                                                     <button 
                                                        onClick={() => updateReviewStatus(review.id, 'REJECTED')}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/5"
                                                     >
                                                         <XCircle size={16} />
                                                         {t.admin.reviewsControl.reject}
                                                     </button>
                                                 </>
                                             )}
                                             
                                             {(tab === 'PUBLISHED' || tab === 'REJECTED') && (
                                                  <button 
                                                     onClick={() => updateReviewStatus(review.id, 'PENDING')}
                                                     className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white border border-white/10 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest"
                                                  >
                                                      {language === 'ar' ? 'إعادة للمراجعة' : 'Return to Pending'}
                                                  </button>
                                             )}
                                         </div>
                                     </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-3xl border border-dashed border-white/10"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10 mb-6 border border-white/5">
                            <Search size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white/40">{language === 'ar' ? 'لا توجد تقييمات في هذه القائمة' : 'No reviews in this list'}</h3>
                        <p className="text-white/20 text-sm mt-2">{language === 'ar' ? 'سيتم عرض التقييمات الجديدة هنا للمراجعة' : 'New reviews will appear here for moderation'}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
