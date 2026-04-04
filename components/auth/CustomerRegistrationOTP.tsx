import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, MessageSquare, RefreshCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CustomerRegistrationOTPProps {
    onVerify: () => void;
    email: string;
    phone: string;
}

export const CustomerRegistrationOTP: React.FC<CustomerRegistrationOTPProps> = ({ onVerify, email, phone }) => {
    const { t, language } = useLanguage();

    // Two separate OTP states
    const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
    const [whatsappOtp, setWhatsappOtp] = useState(['', '', '', '', '', '']);

    const [timer, setTimer] = useState(60);
    const [isVerifying, setIsVerifying] = useState(false);

    const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const whatsappInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = (
        type: 'email' | 'whatsapp',
        index: number,
        value: string
    ) => {
        if (isNaN(Number(value))) return;

        if (type === 'email') {
            const newOtp = [...emailOtp];
            newOtp[index] = value;
            setEmailOtp(newOtp);
            if (value && index < 5) emailInputRefs.current[index + 1]?.focus();
        } else {
            const newOtp = [...whatsappOtp];
            newOtp[index] = value;
            setWhatsappOtp(newOtp);
            if (value && index < 5) whatsappInputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        type: 'email' | 'whatsapp',
        index: number,
        e: React.KeyboardEvent
    ) => {
        if (e.key === 'Backspace') {
            if (type === 'email' && !emailOtp[index] && index > 0) {
                emailInputRefs.current[index - 1]?.focus();
            } else if (type === 'whatsapp' && !whatsappOtp[index] && index > 0) {
                whatsappInputRefs.current[index - 1]?.focus();
            }
        }
    };

    const isComplete = emailOtp.every(d => d !== '') && whatsappOtp.every(d => d !== '');

    const handleVerify = () => {
        setIsVerifying(true);
        // Simulate verification delay for both OTPs
        setTimeout(() => {
            onVerify();
            setIsVerifying(false);
        }, 1500);
    };

    const renderOtpBlock = (
        type: 'email' | 'whatsapp',
        icon: React.ReactNode,
        labelAr: string,
        labelEn: string,
        targetValue: string
    ) => {
        const otpArray = type === 'email' ? emailOtp : whatsappOtp;
        const refs = type === 'email' ? emailInputRefs : whatsappInputRefs;

        return (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6 transition-all hover:bg-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon}
                        <span className="text-sm font-medium text-white/90">
                            {language === 'ar' ? labelAr : labelEn}
                        </span>
                    </div>
                    <span className="text-xs font-mono text-gold-400" dir="ltr">{targetValue}</span>
                </div>

                <div className="flex gap-1.5 sm:gap-2 justify-center px-2" dir="ltr">
                    {otpArray.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { refs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(type, index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(type, index, e)}
                            className="flex-1 max-w-[56px] aspect-square rounded-xl bg-white/5 border border-white/10 text-center text-xl sm:text-2xl font-bold text-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all focus:bg-white/10"
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">{t.auth.otp.title}</h2>
                <div className="text-white/60 text-sm leading-relaxed">
                    {language === 'ar'
                        ? 'يرجى إدخال رموز التحقق المرسلة إلى كل من البريد الإلكتروني ورقم الواتساب الخاص بك لإتمام عملية التسجيل.'
                        : 'Please enter the verification codes sent to both your email and WhatsApp number to complete registration.'
                    }
                </div>
            </div>

            <div className="space-y-4">
                {renderOtpBlock('email', <Mail size={16} className="text-gold-500" />, 'أدخل الرمز المرسل إلى الإيميل', 'Enter code sent to Email', email)}
                {renderOtpBlock('whatsapp', <MessageSquare size={16} className="text-green-500" />, 'أدخل الرمز المرسل إلى الواتساب', 'Enter code sent to WhatsApp', phone)}
            </div>

            <button
                onClick={handleVerify}
                disabled={!isComplete || isVerifying}
                className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 disabled:from-white/10 disabled:to-white/5 disabled:text-white/30 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(168,139,62,0.3)] flex items-center justify-center gap-2"
            >
                {isVerifying ? <Loader2 className="animate-spin" /> : (language === 'ar' ? 'تأكيد التسجيل وإنشاء حساب' : 'Verify & Create Account')}
            </button>

            <div className="text-center">
                {timer > 0 ? (
                    <div className="text-white/40 text-sm font-mono">
                        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </div>
                ) : (
                    <button className="flex items-center justify-center gap-2 text-gold-400 hover:text-gold-300 text-sm mx-auto transition-colors">
                        <RefreshCcw size={14} />
                        {t.auth.otp.resend}
                    </button>
                )}
            </div>
        </motion.div>
    );
};
