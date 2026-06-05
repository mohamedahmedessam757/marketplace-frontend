import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MessageSquare, Mail, RefreshCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatApiErrorMessage } from '../../utils/formatApiErrorMessage';
import { OtpErrorCard } from './OtpErrorCard';

interface OTPVerificationProps {
  onVerify: (code: string) => void | Promise<void>;
  email: string;
  phone?: string;
  method?: 'email' | 'whatsapp';
  /** Masked phone when login-via-email sends OTP to WhatsApp */
  deliveryHint?: string;
  onResend?: () => void | Promise<void>;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  onVerify,
  email,
  phone,
  method = 'email',
  deliveryHint,
  onResend,
}) => {
  const { t, language } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const invalidCodeFallback =
    t.auth.errors?.invalidCode ||
    (language === 'ar' ? 'رمز التحقق غير صحيح' : 'Invalid verification code');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const clearOtpInputs = () => {
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    if (isVerifying || isNaN(Number(value))) return;
    setError(null);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (isVerifying) return;
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    const code = otp.join('');
    try {
      await onVerify(code);
    } catch (err: unknown) {
      setError(formatApiErrorMessage(err, invalidCodeFallback));
      clearOtpInputs();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!onResend || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      await onResend();
      setTimer(60);
      clearOtpInputs();
    } catch (err: unknown) {
      setError(
        formatApiErrorMessage(
          err,
          language === 'ar' ? 'تعذّر إعادة الإرسال' : 'Could not resend code',
        ),
      );
    } finally {
      setIsResending(false);
    }
  };

  const destination =
    method === 'whatsapp'
      ? phone || email
      : deliveryHint || email;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{t.auth.otp.title}</h2>
        <div className="text-white/60 text-sm">
          {method === 'email' && deliveryHint ? (
            <>
              {language === 'ar'
                ? 'تم إرسال رمز التحقق إلى واتساب الرقم المسجّل:'
                : 'Verification code sent to WhatsApp on your registered number:'}
              <br />
              <div className="text-gold-400 font-mono mt-1 text-lg" dir="ltr">
                {deliveryHint}
              </div>
            </>
          ) : (
            <>
              {t.auth.otp.subtitle} <br />
              <div className="text-gold-400 font-mono mt-1 text-lg" dir="ltr">
                {destination}
              </div>
            </>
          )}
        </div>
      </div>

      {error && <OtpErrorCard message={error} />}

      <div className="flex gap-2 justify-center direction-ltr" dir="ltr">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={isVerifying}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-10 h-12 md:w-12 md:h-14 rounded-xl bg-white/5 border border-white/10 text-center text-xl font-bold text-white focus:border-gold-500 outline-none transition-all focus:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={otp.some(d => !d) || isVerifying}
        className="w-full py-3 md:py-4 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(168,139,62,0.3)] flex items-center justify-center gap-2"
      >
        {isVerifying ? (
          <>
            <Loader2 className="animate-spin" />
            {t.auth.otp.verifying}
          </>
        ) : (
          t.auth.otp.verify
        )}
      </button>

      <div className="space-y-3">
        {timer > 0 ? (
          <div className="text-center text-white/40 text-sm font-mono">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>
        ) : (
          <button
            type="button"
            disabled={isVerifying || isResending || !onResend}
            onClick={handleResend}
            className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm transition-colors py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCcw size={14} className={isResending ? 'animate-spin' : ''} />
            {t.auth.otp.resend}
          </button>
        )}

        <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
          <div className="text-center text-white/30 text-xs">
            {method === 'whatsapp' ? (
              <span className="flex items-center justify-center gap-2 text-green-500/50">
                <MessageSquare size={12} />
                {t.auth.otp.whatsapp}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 text-gold-500/50">
                <Mail size={12} />
                {deliveryHint
                  ? (language === 'ar' ? 'التحقق عبر واتساب (الإيميل قريباً)' : 'WhatsApp verification (email provider coming soon)')
                  : t.auth.otp.emailAlt}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
