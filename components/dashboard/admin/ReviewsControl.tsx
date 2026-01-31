
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useReviewStore } from '../../../stores/useReviewStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Star, CheckCircle2, XCircle, Search } from 'lucide-react';

export const ReviewsControl: React.FC = () => {
  const { t, language } = useLanguage();
  const { reviews, approveReview, rejectReview } = useReviewStore();
  const [tab, setTab] = useState<'pending' | 'published' | 'rejected'>('pending');

  const filteredReviews = reviews.filter(r => r.status === tab);

  const isAr = language === 'ar';

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">{t.admin.reviewsControl.title}</h1>

        {/* Tabs */}
        <div className="flex gap-2">
            {[
                { id: 'pending', label: t.admin.reviewsControl.pending, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
                { id: 'published', label: t.admin.reviewsControl.published, color: 'text-green-400 border-green-500/30 bg-green-500/10' },
                { id: 'rejected', label: t.admin.reviewsControl.rejected, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
            ].map(t => (
                <button
                    key={t.id}
                    onClick={() => setTab(t.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                        tab === t.id ? t.color : 'text-white/40 border-transparent hover:bg-white/5'
                    }`}
                >
                    {t.label}
                </button>
            ))}
        </div>

        {/* Reviews List */}
        <div className="grid gap-4">
            {filteredReviews.map(review => (
                <GlassCard key={review.id} className="p-6 bg-[#151310] border-white/5">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-white">{review.merchantName}</span>
                                <span className="text-white/30 text-xs">• {review.partName}</span>
                                <span className="text-white/30 text-xs">• Order #{review.orderId}</span>
                            </div>
                            
                            <div className="flex gap-1 mb-3">
                                {[1,2,3,4,5].map(s => (
                                    <Star 
                                        key={s} 
                                        size={16} 
                                        fill={s <= review.rating ? "#FACC15" : "none"} 
                                        className={s <= review.rating ? "text-yellow-400" : "text-white/20"} 
                                    />
                                ))}
                            </div>
                            
                            <p className="text-white/80 text-sm italic mb-2">"{review.comment}"</p>
                            <div className="text-xs text-white/30">{review.date}</div>
                        </div>

                        {tab === 'pending' && (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => approveReview(review.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/20 rounded-lg transition-colors font-bold text-sm"
                                >
                                    <CheckCircle2 size={16} />
                                    {t.admin.reviewsControl.approve}
                                </button>
                                <button 
                                    onClick={() => rejectReview(review.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-lg transition-colors font-bold text-sm"
                                >
                                    <XCircle size={16} />
                                    {t.admin.reviewsControl.reject}
                                </button>
                            </div>
                        )}
                    </div>
                </GlassCard>
            ))}
            
            {filteredReviews.length === 0 && (
                <div className="text-center py-10 text-white/30 bg-white/5 rounded-xl border border-dashed border-white/10">
                    No reviews in this section.
                </div>
            )}
        </div>
    </div>
  );
};
