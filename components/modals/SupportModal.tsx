import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
        setStatus('idle');
        setFormData({ name: '', email: '', phone: '', message: '' });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.name || !formData.email || !formData.message) return; // Basic validation

    setStatus('sending');
    
    // Simulate API call to email service
    setTimeout(() => {
      setStatus('success');
      // Here you would actually trigger the backend email service
      console.log("Email sent to support@e-tashleh.com:", formData);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#1A1814] border border-gold-500/20 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -z-10" />
            
            <AnimatePresence mode="wait">
                {status === 'success' ? (
                     <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-12 flex flex-col items-center text-center"
                     >
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{t.support.successTitle}</h3>
                        <p className="text-white/60 mb-8">{t.support.successMessage}</p>
                        <button 
                            onClick={onClose}
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                        >
                            {t.support.close}
                        </button>
                     </motion.div>
                ) : (
                  <form key="form" onSubmit={handleSubmit} className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                        <h3 className="text-xl font-bold text-white">{t.support.title}</h3>
                        <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                          <X size={24} />
                        </button>
                      </div>

                      {/* Form Content */}
                      <div className="p-6 space-y-4">
                        {/* Name */}
                        <div>
                            <label className={`block text-sm font-medium text-gold-200/80 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.support.name}</label>
                            <input 
                                type="text" 
                                required
                                className={`w-full px-4 py-3 rounded-xl border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 outline-none transition-all bg-white/5 text-white placeholder-white/20 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className={`block text-sm font-medium text-gold-200/80 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.support.email}</label>
                            <input 
                                type="email" 
                                required
                                className={`w-full px-4 py-3 rounded-xl border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 outline-none transition-all bg-white/5 text-white placeholder-white/20 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                         {/* Phone */}
                        <div>
                          <label className={`block text-sm font-medium text-gold-200/80 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.support.phone}</label>
                          <div className="flex gap-2">
                            <input 
                              type="tel" 
                              placeholder="5XXXXXXX"
                              className="flex-1 px-4 py-3 rounded-xl border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 outline-none transition-all text-left bg-white/5 text-white placeholder-white/20"
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                            <div className="relative w-1/3">
                              <select className={`w-full h-full appearance-none px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-medium outline-none focus:border-gold-500 ${language === 'ar' ? 'text-right pr-8' : 'text-left pl-8'}`}>
                                <option className="bg-[#1A1814]">{t.support.countries.sa}</option>
                                <option className="bg-[#1A1814]">{t.support.countries.ae}</option>
                                <option className="bg-[#1A1814]">{t.support.countries.kw}</option>
                              </select>
                              <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none ${language === 'ar' ? 'right-2' : 'left-2'}`} />
                            </div>
                          </div>
                        </div>

                        {/* Message */}
                        <div>
                          <label className={`block text-sm font-medium text-gold-200/80 mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.support.message}</label>
                          <textarea 
                            rows={4}
                            maxLength={100}
                            required
                            className={`w-full px-4 py-3 rounded-xl border border-white/10 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 outline-none transition-all bg-white/5 text-white placeholder-white/20 resize-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                          />
                          <div className={`text-xs text-white/30 mt-1 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                            {formData.message.length}/100 {t.support.charCount}
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(168,139,62,0.3)] hover:shadow-[0_6px_25px_rgba(168,139,62,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                          {status === 'sending' ? (
                              <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>{t.support.sending}</span>
                              </>
                          ) : (
                              <>
                                <span>{t.support.submit}</span>
                                <Send size={18} className={language === 'ar' ? 'rotate-180' : ''} />
                              </>
                          )}
                        </button>
                      </div>
                  </form>
                )}
            </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};