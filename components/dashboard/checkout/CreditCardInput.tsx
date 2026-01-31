
import React from 'react';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

export const CreditCardInput: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="bg-[#0F0E0C] p-6 rounded-xl border border-white/10">
       <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-2">
               <h3 className="text-white font-bold">{t.dashboard.checkout.payment.title}</h3>
               <Lock size={14} className="text-green-400" />
           </div>
           <div className="flex gap-2">
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-5 brightness-200" alt="Visa" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5" alt="Mastercard" />
           </div>
       </div>

       <div className="space-y-4">
           <div>
               <label className="block text-xs text-white/40 mb-1">{t.dashboard.checkout.payment.card}</label>
               <div className="relative group">
                   <CreditCard className="absolute top-3.5 left-3.5 w-5 h-5 text-gold-500 group-focus-within:text-gold-400 transition-colors" />
                   <input 
                       type="text" 
                       placeholder="0000 0000 0000 0000" 
                       className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white font-mono placeholder-white/20 focus:border-gold-500 outline-none transition-colors"
                   />
               </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div>
                   <label className="block text-xs text-white/40 mb-1">{t.dashboard.checkout.payment.expiry}</label>
                   <input 
                       type="text" 
                       placeholder="MM/YY" 
                       className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white font-mono placeholder-white/20 focus:border-gold-500 outline-none transition-colors"
                   />
               </div>
               <div>
                   <label className="block text-xs text-white/40 mb-1">{t.dashboard.checkout.payment.cvv}</label>
                   <div className="relative">
                       <input 
                           type="text" 
                           placeholder="123" 
                           className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white font-mono placeholder-white/20 focus:border-gold-500 outline-none transition-colors"
                       />
                       <ShieldCheck className="absolute top-3 right-3 w-4 h-4 text-white/20" />
                   </div>
               </div>
           </div>

           <div>
               <label className="block text-xs text-white/40 mb-1">{t.dashboard.checkout.payment.holder}</label>
               <input 
                   type="text" 
                   placeholder="MOHAMMED ALI" 
                   className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-white/20 focus:border-gold-500 outline-none transition-colors uppercase"
               />
           </div>
       </div>

       <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] text-white/30">
               <Lock size={10} />
               TLS 1.2 Encrypted
           </div>
           <div className="flex items-center gap-2 text-[10px] text-green-400 bg-green-500/5 px-2 py-1 rounded border border-green-500/10">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
               {t.dashboard.checkout.payment.secure}
           </div>
       </div>
    </div>
  );
};
