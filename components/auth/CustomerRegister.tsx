import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Loader2, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { authApi } from '@/services/api/auth';
import { OTPVerification } from './OTPVerification';
import { OTPMethodSelection } from './OTPMethodSelection';

interface CustomerRegisterProps {
  onLoginClick: () => void;
  onRegisterSuccess: () => void;
  onTermsClick: () => void;
}

// FIX: Defined outside the main component to prevent re-mounting on every keystroke
const InputField = ({ icon: Icon, type, placeholder, value, onChange }: any) => (
  <div className="relative group">
    <Icon className="absolute top-3.5 right-3.5 w-5 h-5 text-white/40 group-focus-within:text-gold-500 transition-colors pointer-events-none" />
    <input
      type={type}
      required
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:border-gold-500 outline-none transition-all placeholder-white/20"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

export const CustomerRegister: React.FC<CustomerRegisterProps> = ({ onLoginClick, onRegisterSuccess, onTermsClick }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState<'none' | 'method' | 'verify'>('none');
  const [otpMethod, setOtpMethod] = useState<'email' | 'whatsapp'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError(t.auth.errors?.fillAll);
      return;
    }

    if (!formData.email.includes('@')) {
      setError(t.auth.errors?.invalidEmail);
      return;
    }

    if (formData.password.length < 6) {
      setError(t.auth.errors?.passwordShort);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.errors?.passwordMismatch);
      return;
    }

    if (!agreedToTerms) {
      setError(t.auth.register.termsError);
      return;
    }

    try {
      setIsLoading(true);
      // Real API Call
      await authApi.registerCustomer({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone
      });

      // Show OTP Step
      setOtpStep('method');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || t.auth.errors?.registrationFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (otpStep === 'method') {
    return (
      <div className="p-4">
        <OTPMethodSelection
          email={formData.email}
          name={formData.name}
          onSelect={(method) => {
            setOtpMethod(method);
            setOtpStep('verify');
          }}
        />
      </div>
    );
  }

  if (otpStep === 'verify') {
    return (
      <div className="p-4">
        {/* Using mock verify for now as requested (simulated OTP) */}
        <OTPVerification
          email={formData.email}
          phone={formData.phone}
          method={otpMethod}
          onVerify={(code) => {
            // For M1: Accept any code to allow flow completion
            onRegisterSuccess();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{t.auth.register.title}</h2>
        <p className="text-white/60 text-sm">{t.auth.register.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <InputField
          icon={User}
          type="text"
          placeholder={t.auth.register.name}
          value={formData.name}
          onChange={handleChange('name')}
        />

        <InputField
          icon={Mail}
          type="email"
          placeholder={t.auth.login.email}
          value={formData.email}
          onChange={handleChange('email')}
        />

        <InputField
          icon={Phone}
          type="tel"
          placeholder={t.auth.register.phone}
          value={formData.phone}
          onChange={handleChange('phone')}
        />

        <InputField
          icon={Lock}
          type="password"
          placeholder={t.auth.register.password}
          value={formData.password}
          onChange={handleChange('password')}
        />

        <InputField
          icon={Lock}
          type="password"
          placeholder={t.auth.register.confirmPassword}
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
        />

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start gap-3 px-1 py-2">
          <button
            type="button"
            onClick={() => setAgreedToTerms(!agreedToTerms)}
            className="pt-1 text-gold-500 hover:text-gold-400 transition-colors"
          >
            {agreedToTerms ? <CheckSquare size={20} /> : <Square size={20} className="text-white/30" />}
          </button>
          <div className="text-sm text-white/70 leading-relaxed">
            {t.auth.register.agreeToTerms}{' '}
            <button
              type="button"
              onClick={onTermsClick}
              className="text-gold-400 hover:text-gold-300 underline underline-offset-4 decoration-gold-500/30 hover:decoration-gold-500 transition-all font-medium"
            >
              {t.auth.register.termsLink}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm justify-center"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-white rounded-xl font-bold shadow-[0_4px_20px_rgba(168,139,62,0.3)] hover:shadow-[0_6px_25px_rgba(168,139,62,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : t.auth.register.submit}
        </button>
      </form>

      <div className="text-center pt-4 border-t border-white/5">
        <span className="text-white/50 text-sm">{t.auth.register.hasAccount} </span>
        <button onClick={onLoginClick} className="text-gold-400 font-bold hover:underline">
          {t.auth.register.login}
        </button>
      </div>
    </div>
  );
};