
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { useReviewStore } from '../../../stores/useReviewStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Star, CheckCircle2, XCircle, Search, Loader2, MessageSquare, User, Store, Calendar, Zap, Plus, Trash2, Edit3, Settings2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ReviewsControl: React.FC = () => {
    const { t, language } = useLanguage();
    const { 
        reviews, 
        impactRules,
        fetchAdminReviews, 
        fetchImpactRules,
        createImpactRule,
        updateImpactRule,
        deleteImpactRule,
        updateReviewStatus, 
        subscribeToAdminReviews,
        unsubscribeFromAdminReviews,
        isLoading, 
        error 
    } = useReviewStore();
    const [tab, setTab] = useState<'PENDING' | 'PUBLISHED' | 'REJECTED' | 'IMPACT'>('PENDING');
    
    // Rule Management State
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<any>(null);
    const [ruleForm, setRuleForm] = useState({
        minRating: 0,
        maxRating: 5,
        actionType: 'NONE',
        actionLabelAr: '',
        actionLabelEn: '',
        suspendDurationDays: 7,
        isActive: true
    });

    useEffect(() => {
        fetchAdminReviews();
        fetchImpactRules();
        subscribeToAdminReviews();

        return () => {
            unsubscribeFromAdminReviews();
        };
    }, []);

    const handleOpenRuleModal = (rule?: any) => {
        if (rule) {
            setEditingRule(rule);
            setRuleForm({
                minRating: Number(rule.minRating),
                maxRating: Number(rule.maxRating),
                actionType: rule.actionType,
                actionLabelAr: rule.actionLabelAr,
                actionLabelEn: rule.actionLabelEn,
                suspendDurationDays: rule.suspendDurationDays || 7,
                isActive: rule.isActive
            });
        } else {
            setEditingRule(null);
            setRuleForm({
                minRating: 0,
                maxRating: 5,
                actionType: 'NONE',
                actionLabelAr: '',
                actionLabelEn: '',
                suspendDurationDays: 7,
                isActive: true
            });
        }
        setIsRuleModalOpen(true);
    };

    const handleSaveRule = async () => {
        let success = false;
        if (editingRule) {
            success = await updateImpactRule(editingRule.id, ruleForm);
        } else {
            success = await createImpactRule(ruleForm);
        }

        if (success) {
            setIsRuleModalOpen(false);
            setEditingRule(null);
        }
    };

    const filteredReviews = reviews.filter(r => r.adminStatus === tab);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{t.admin.reviewsControl.title}</h1>
                    <p className="text-white/40 text-sm">{language === 'ar' ? 'إدراة ومراجعة تقييمات العملاء للمتاجر' : 'Manage and moderate customer reviews for stores'}</p>
                </div>
                <button 
                    onClick={() => {
                        fetchAdminReviews();
                        fetchImpactRules();
                    }}
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
                    { id: 'IMPACT', label: t.admin.reviewsControl.impact, color: 'text-gold-400', bg: 'bg-gold-400/10 border-gold-400/20' },
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
                        {item.id !== 'IMPACT' && (
                            <span className="ml-2 opacity-30 text-[10px]">({reviews.filter(r => r.adminStatus === item.id).length})</span>
                        )}
                        {item.id === 'IMPACT' && (
                            <Zap size={14} className="ml-2 inline opacity-50" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Rendering */}
            <div className="grid gap-6">
                {isLoading && reviews.length === 0 && impactRules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 size={40} className="animate-spin text-gold-500/40" />
                        <p className="text-white/20 font-bold uppercase tracking-widest text-xs">{language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading Data...'}</p>
                    </div>
                ) : tab === 'IMPACT' ? (
                    /* IMPACT RULES TAB */
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                         <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white uppercase tracking-tighter flex items-center gap-3">
                                <Settings2 className="text-gold-500" />
                                {t.admin.reviewsControl.impact}
                            </h2>
                            <button 
                                onClick={() => handleOpenRuleModal()}
                                className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-black rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-gold-500/20"
                            >
                                <Plus size={18} />
                                {t.admin.reviewsControl.rules.add}
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {impactRules.map(rule => (
                                <GlassCard key={rule.id} className="p-6 group border-white/5 hover:border-gold-500/30 transition-all">
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        {/* Rating Range */}
                                        <div className="w-full md:w-48 bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                                            <span className="text-[10px] text-white/30 uppercase font-black mb-1">{t.admin.reviewsControl.rating}</span>
                                            <div className="flex items-center gap-3 text-2xl font-black text-white">
                                                <span>{Number(rule.minRating).toFixed(1)}</span>
                                                <span className="text-gold-500 text-sm opacity-50">→</span>
                                                <span>{Number(rule.maxRating).toFixed(1)}</span>
                                            </div>
                                        </div>

                                        {/* Rule Details */}
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${
                                                    rule.actionType === 'SUSPEND' ? 'bg-rose-500/10 text-rose-500' :
                                                    rule.actionType === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                                                    rule.actionType === 'FEATURED' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    'bg-white/5 text-white/40'
                                                }`}>
                                                    {rule.actionType === 'SUSPEND' ? <AlertTriangle size={18} /> : 
                                                     rule.actionType === 'WARNING' ? <ShieldCheck size={18} /> : 
                                                     rule.actionType === 'FEATURED' ? <Star size={18} fill="currentColor" /> : 
                                                     <Zap size={18} />}
                                                </div>
                                                <h3 className="font-bold text-white text-lg">
                                                    {language === 'ar' ? rule.actionLabelAr : rule.actionLabelEn}
                                                </h3>
                                                {!rule.isActive && (
                                                    <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase text-white/20 border border-white/5">
                                                        {t.admin.reviewsControl.rules.inactive}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white/40 text-xs italic">
                                                {rule.actionType === 'SUSPEND' 
                                                    ? (language === 'ar' ? `سيتم تحويل حالة المتجر إلى معلق لمدة ${rule.suspendDurationDays} أيام (يتطلب موافقة الأدمن)` : `Store will be set to SUSPENDED for ${rule.suspendDurationDays} days (Requires Admin Approval)`)
                                                    : (language === 'ar' ? `سيتم إرسال إشعار تلقائي للتاجر بهذا الإجراء` : `An automatic notification will be sent to the merchant regarding this action`)
                                                }
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleOpenRuleModal(rule)}
                                                className="p-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all border border-white/5"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه القاعدة؟' : 'Are you sure you want to delete this rule?')) {
                                                        deleteImpactRule(rule.id);
                                                    }
                                                }}
                                                className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}

                            {impactRules.length === 0 && (
                                <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <Settings2 size={40} className="mx-auto text-white/10 mb-4" />
                                    <p className="text-white/20 font-bold uppercase tracking-widest text-xs">No impact rules defined yet</p>
                                </div>
                            )}
                        </div>
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
                                             <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                 <div className="flex items-center gap-3 text-white/80 bg-white/5 pr-4 pl-1 py-1 rounded-full border border-white/5 group-hover:border-gold-500/30 transition-all">
                                                     <div className="w-6 h-6 rounded-full bg-gold-500/10 border border-gold-500/20 overflow-hidden flex items-center justify-center shrink-0">
                                                         {review.customer?.avatar ? (
                                                             <img src={review.customer.avatar} alt="" className="w-full h-full object-cover" />
                                                         ) : (
                                                             <User size={12} className="text-gold-500" />
                                                         )}
                                                     </div>
                                                     <span className="font-mono tracking-normal text-white">{review.customerCode}</span>
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                     <Store size={14} className="text-white/20" />
                                                     <span className="text-white/60">{review.store?.name || 'Store'}</span>
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                     <Calendar size={14} className="text-white/20" />
                                                     <span className="text-white/60">
                                                        {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                     </span>
                                                 </div>
                                                 <span className="px-2 py-0.5 bg-black/40 rounded border border-white/5 opacity-50">REF: {review.order?.orderNumber || review.id.slice(0,8)}</span>
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

            {/* RULE MODAL */}
            <AnimatePresence>
                {isRuleModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setIsRuleModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl"
                        >
                            <GlassCard className="p-8 border-white/10 shadow-2xl">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                                    <div className="p-2 bg-gold-500/10 rounded-xl">
                                        <Zap className="text-gold-500" />
                                    </div>
                                    {editingRule ? t.admin.reviewsControl.rules.edit : t.admin.reviewsControl.rules.add}
                                </h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t.admin.reviewsControl.rules.minRating}</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="0" 
                                            max="5"
                                            value={ruleForm.minRating}
                                            onChange={(e) => setRuleForm({ ...ruleForm, minRating: parseFloat(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t.admin.reviewsControl.rules.maxRating}</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="0" 
                                            max="5"
                                            value={ruleForm.maxRating}
                                            onChange={(e) => setRuleForm({ ...ruleForm, maxRating: parseFloat(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t.admin.reviewsControl.rules.actionType}</label>
                                        <select 
                                            value={ruleForm.actionType}
                                            onChange={(e) => setRuleForm({ ...ruleForm, actionType: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 outline-none transition-all appearance-none"
                                        >
                                            <option value="NONE">{t.admin.reviewsControl.rules.actions.NONE}</option>
                                            <option value="SUSPEND">{t.admin.reviewsControl.rules.actions.SUSPEND}</option>
                                            <option value="WARNING">{t.admin.reviewsControl.rules.actions.WARNING}</option>
                                            <option value="FEATURED">{t.admin.reviewsControl.rules.actions.FEATURED}</option>
                                        </select>
                                    </div>

                                    {ruleForm.actionType === 'SUSPEND' && (
                                        <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t.admin.reviewsControl.rules.duration}</label>
                                            <input 
                                                type="number" 
                                                value={ruleForm.suspendDurationDays}
                                                onChange={(e) => setRuleForm({ ...ruleForm, suspendDurationDays: parseInt(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 outline-none transition-all"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t.admin.reviewsControl.rules.actionLabelAr}</label>
                                        <input 
                                            type="text" 
                                            value={ruleForm.actionLabelAr}
                                            onChange={(e) => setRuleForm({ ...ruleForm, actionLabelAr: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-right focus:border-gold-500/50 outline-none transition-all"
                                            placeholder="مثال: إيقاف المتجر لمدة أسبوع"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t.admin.reviewsControl.rules.actionLabelEn}</label>
                                        <input 
                                            type="text" 
                                            value={ruleForm.actionLabelEn}
                                            onChange={(e) => setRuleForm({ ...ruleForm, actionLabelEn: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500/50 outline-none transition-all"
                                            placeholder="Example: Store Suspension (7 Days)"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center gap-4 py-4">
                                        <input 
                                            type="checkbox" 
                                            id="rule-active"
                                            checked={ruleForm.isActive}
                                            onChange={(e) => setRuleForm({ ...ruleForm, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded border-white/10 bg-white/5 text-gold-500 focus:ring-gold-500 focus:ring-offset-0"
                                        />
                                        <label htmlFor="rule-active" className="text-sm font-bold text-white/60 cursor-pointer">{t.admin.reviewsControl.rules.active}</label>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-12">
                                    <button 
                                        onClick={() => setIsRuleModalOpen(false)}
                                        className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-white/5 transition-all"
                                    >
                                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                    </button>
                                    <button 
                                        onClick={handleSaveRule}
                                        className="flex-1 px-8 py-4 bg-gold-500 hover:bg-gold-600 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-gold-500/20 transition-all"
                                    >
                                        {language === 'ar' ? 'حفظ القاعدة' : 'Save Rule'}
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
