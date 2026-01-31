import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MessageSquare, Mail, RefreshCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface OTPVerificationProps {
  onVerify: (code: string) => void;
  email: string;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({ onVerify, email }) => {
  const { t } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    setIsVerifying(true);
    const code = otp.join('');
    setTimeout(() => {
      onVerify(code);
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{t.auth.otp.title}</h2>
        <p className="text-white/60 text-sm">
          {t.auth.otp.subtitle} <br />
          <span className="text-gold-400 font-mono mt-1 block">{email}</span>
        </p>
      </div>

      <div className="flex gap-2 justify-center direction-ltr" dir="ltr">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-12 md:w-12 md:h-14 rounded-xl bg-white/5 border border-white/10 text-center text-xl font-bold text-white focus:border-gold-500 outline-none transition-all focus:bg-white/10"
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={otp.some(d => !d) || isVerifying}
        className="w-full py-3 md:py-4 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(168,139,62,0.3)] flex items-center justify-center gap-2"
      >
        {isVerifying ? <Loader2 className="animate-spin" /> : t.auth.otp.verify}
      </button>

      <div className="space-y-3">
        {timer > 0 ? (
          <div className="text-center text-white/40 text-sm font-mono">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>
        ) : (
          <button className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm transition-colors py-2">
            <RefreshCcw size={14} />
            {t.auth.otp.resend}
          </button>
        )}

        <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
          <button className="flex items-center justify-center gap-2 text-green-400 hover:text-green-300 text-sm py-2 bg-green-500/5 hover:bg-green-500/10 rounded-lg transition-colors border border-green-500/10">
            <MessageSquare size={16} />
            {t.auth.otp.whatsapp}
          </button>
          <button className="flex items-center justify-center gap-2 text-gold-200 hover:text-white text-sm py-2">
            <Mail size={16} />
            {t.auth.otp.emailAlt}
          </button>
        </div>
      </div>
    </motion.div>
  );
};