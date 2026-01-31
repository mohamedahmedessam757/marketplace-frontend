
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, UploadCloud, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useReviewStore } from '../../../stores/useReviewStore';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  merchantName: string;
  partName: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, orderId, merchantName, partName }) => {
  const { t } = useLanguage();
  const { addReview } = useReviewStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addReview({
        orderId,
        merchantName,
        partName,
        rating,
        comment,
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setRating(0);
        setComment('');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1A1814] border border-white/10 rounded-2xl w-full max-w-md p-6 relative overflow-hidden"
        >
            {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-4">
                        <Star size={32} fill="currentColor" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{t.dashboard.reviews.success}</h3>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">{t.dashboard.reviews.writeTitle}</h3>
                        <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
                    </div>

                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-white/60 text-sm mb-1">{merchantName}</p>
                            <p className="text-white font-bold">{partName}</p>
                        </div>

                        {/* Star Rating */}
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`p-2 transition-transform hover:scale-110 focus:outline-none ${rating >= star ? 'text-yellow-400' : 'text-white/20'}`}
                                >
                                    <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-xs text-white/40 mb-2">{t.dashboard.reviews.comment}</label>
                            <textarea 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-gold-500 outline-none resize-none h-24 placeholder-white/20 text-sm"
                                placeholder={t.dashboard.reviews.placeholder}
                            />
                        </div>

                        {/* Image Upload (Mock) */}
                        <div className="border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-white/30 hover:bg-white/5 hover:border-white/20 cursor-pointer transition-colors">
                            <UploadCloud size={24} className="mb-2" />
                            <span className="text-xs">Upload Images (Optional)</span>
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={rating === 0 || isSubmitting}
                            className="w-full py-3 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                            {t.dashboard.reviews.submit}
                        </button>
                    </div>
                </>
            )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
