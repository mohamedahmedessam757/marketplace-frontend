import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Store, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { OTPVerification } from './OTPVerification';
import { OTPMethodSelection } from './OTPMethodSelection';
import { authApi } from '@/services/api/auth';

interface LoginPageProps {
  onRegisterClick: () => void;
  onCustomerRegisterClick: () => void;
  onLoginSuccess: (role: 'customer' | 'merchant') => void;
  onForgotPasswordClick?: () => void;
  initialTab?: 'customer' | 'merchant';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onRegisterClick, onCustomerRegisterClick, onLoginSuccess, initialTab = 'customer' }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'customer' | 'merchant'>(initialTab);
  const [otpStep, setOtpStep] = useState<'none' | 'method' | 'verify'>('none');
  const [otpMethod, setOtpMethod] = useState<'email' | 'whatsapp'>('email');
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Initiate Mobile Login
      const data = await authApi.initiateMobileLogin(phone);

      // Access user data from response structure { exists: true, user: { ... } }
      const user = data.user;
      const backendRole = user.role;

      // 2. Role Verification (Strict)
      if (activeTab === 'customer' && backendRole !== 'CUSTOMER') {
        throw new Error(t.auth.errors?.wrongAccountType || 'Incorrect account type');
      }

      if (activeTab === 'merchant' && backendRole !== 'VENDOR') {
        throw new Error(t.auth.errors?.wrongAccountType || 'Incorrect account type');
      }

      // Store details for OTP flow
      setUserName(user.name);
      setUserEmail(user.email);

      // 3. Move to Method Selection
      setOtpStep('method');

    } catch (err: any) {
      console.error('Login Init Failed', err);
      if (err.response?.status === 401 || err.response?.status === 404) {
        setError(t.auth.errors?.accountNotFound || 'Account not found');
      } else if (err.message && (err.message.includes('Incorrect account type'))) {
        setError(err.message);
      } else {
        setError(t.auth.errors?.loginFailed || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (otpStep === 'method') {
    return (
      <div className="p-4">
        <OTPMethodSelection
          email={userEmail} // User's email from backend
          name={userName}
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
        <OTPVerification
          email={userEmail}
          phone={phone}
          method={otpMethod}
          onVerify={async (code) => {
            try {
              setIsLoading(true);
              const response = await authApi.verifyMobileLogin(phone, code);

              // Store Token
              localStorage.setItem('access_token', response.access_token);

              // Store User Info
              if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
              }

              // Proceed to Dashboard
              onLoginSuccess(activeTab);
            } catch (err: any) {
              console.error('Verify Failed', err);
              // Handle error (maybe show it in the OTP component, but for now we log it or set global error)
              // Ideally OTPVerification should handle async errors if we pass a promise.
              // For this fix, we will alert or set state if possible, but OTP verification component might be unmounted on success.
              alert(t.auth.errors?.invalidCode || 'Invalid verification code');
            } finally {
              setIsLoading(false);
            }
          }}
        />
      </div>
    );
  }

  const ArrowIcon = language === 'ar' ? ArrowRight : ArrowRight; // OTP component manages direction internally usually, keeping simple here.

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex p-1 bg-black/20 rounded-xl">
        <button
          onClick={() => setActiveTab('customer')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'customer' ? 'bg-gold-500 text-white shadow-lg' : 'text-white/50 hover:text-white'
            }`}
        >
          <User size={16} />
          {t.auth.tabs.customer}
        </button>
        <button
          onClick={() => setActiveTab('merchant')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'merchant' ? 'bg-gold-500 text-white shadow-lg' : 'text-white/50 hover:text-white'
            }`}
        >
          <Store size={16} />
          {t.auth.tabs.merchant}
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{t.auth.login.title}</h2>
        <p className="text-white/60 text-sm">
          {activeTab === 'customer'
            ? (t.auth.login.subtitle || 'Enter your mobile number to continue')
            : (t.auth.login.subtitle || 'Enter your registered mobile number')}
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm text-center flex items-center justify-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-gold-200 mb-2 font-medium">
            {t.auth.register?.phone || 'Mobile Number'}
          </label>
          <div className="relative group">
            <div className="absolute top-1/2 -translate-y-1/2 left-3 flex items-center gap-2 border-r border-white/10 pr-3 pointer-events-none">
              <Phone className="w-5 h-5 text-gold-500" />
            </div>
            <input
              type="tel"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-4 text-white focus:border-gold-500 outline-none transition-all placeholder-white/20 text-lg tracking-wide"
              placeholder="+966 50 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-white rounded-xl font-bold text-lg shadow-[0_4px_20px_rgba(168,139,62,0.3)] hover:shadow-[0_6px_25px_rgba(168,139,62,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {t.auth.login.submit}
            </>
          )}
        </button>
      </form>

      {/* Registration Links Only - No more social or forgot password */}
      <div className="text-center pt-6 border-t border-white/5">
        <span className="text-white/50 text-sm block mb-2">{t.auth.login.noAccount}</span>
        <button
          onClick={activeTab === 'customer' ? onCustomerRegisterClick : onRegisterClick}
          className="text-gold-400 font-bold hover:text-gold-300 transition-colors uppercase tracking-wider text-sm border border-gold-500/30 px-6 py-2 rounded-full hover:bg-gold-500/10"
        >
          {t.auth.login.registerNow}
        </button>
      </div>
    </div>
  );
};
