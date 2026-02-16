import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Store, Chrome, Smartphone } from 'lucide-react';
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

export const LoginPage: React.FC<LoginPageProps> = ({ onRegisterClick, onCustomerRegisterClick, onLoginSuccess, onForgotPasswordClick, initialTab = 'customer' }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'customer' | 'merchant'>(initialTab);
  const [otpStep, setOtpStep] = useState<'none' | 'method' | 'verify'>('none');
  const [otpMethod, setOtpMethod] = useState<'email' | 'whatsapp'>('email');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Authenticate
      const data = await authApi.login(email, password);

      // Store Token
      localStorage.setItem('access_token', data.access_token);

      // 2. Role Verification (Strict)
      const backendRole = data.user.role;

      if (activeTab === 'customer' && backendRole !== 'CUSTOMER') {
        throw new Error(t.auth.errors?.wrongAccountType);
      }

      if (activeTab === 'merchant' && backendRole !== 'VENDOR') {
        throw new Error(t.auth.errors?.wrongAccountType);
      }

      // Store user details for OTP display
      setUserName(data.user.name || '');
      setUserPhone(data.user.phone || '');

      // 2. OTP Verification (Mock for M1)
      // The user requested OTP method selection first.
      setOtpStep('method');

      // We do NOT call onLoginSuccess yet. It will be called by OTPVerification onVerify.
      // Store temp data if needed, or rely on token being in localStorage already.

    } catch (err: any) {
      console.error('Login Failed', err);
      if (err.message && (err.message.includes('Merchant') || err.message.includes('Customer'))) {
        setError(err.message);
      } else if (err.response?.status === 401) {
        setError(t.auth.errors?.invalidCredentials);
      } else {
        setError(t.auth.errors?.loginFailed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (otpStep === 'method') {
    return (
      <div className="p-4">
        <OTPMethodSelection
          email={email}
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
        {/* 
                  Passing email for display. 
                  In a real app, verify OTP against backend here.
                  For M1, we accept valid code and proceed.
               */}
        <OTPVerification
          email={email}
          phone={userPhone}
          method={otpMethod}
          onVerify={(code) => {
            // On success, finalize login
            let frontendRole: 'customer' | 'merchant' = activeTab;
            // (We already validated the role matches the tab)
            onLoginSuccess(frontendRole);
          }}
        />
      </div>
    );
  }

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
        <p className="text-white/60 text-sm">{t.auth.login.subtitle}</p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-gold-200 mb-2">{t.auth.login.email}</label>
          <div className="relative group">
            <Mail className="absolute top-3.5 right-3.5 w-5 h-5 text-white/40 group-focus-within:text-gold-500 transition-colors pointer-events-none" />
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:border-gold-500 outline-none transition-all placeholder-white/20"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gold-200 mb-2">{t.auth.login.password}</label>
          <div className="relative group">
            <Lock className="absolute top-3.5 right-3.5 w-5 h-5 text-white/40 group-focus-within:text-gold-500 transition-colors pointer-events-none" />
            <input
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:border-gold-500 outline-none transition-all placeholder-white/20"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs md:text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded bg-white/10 border-white/20 text-gold-500 focus:ring-gold-500" />
            <span className="text-white/70">{t.auth.login.rememberMe}</span>
          </label>
          <button type="button" onClick={onForgotPasswordClick} className="text-gold-400 hover:text-gold-300 transition-colors">
            {t.auth.login.forgotPassword}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-white rounded-xl font-bold shadow-[0_4px_20px_rgba(168,139,62,0.3)] hover:shadow-[0_6px_25px_rgba(168,139,62,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? 'Wait...' : t.auth.login.submit}
        </button>
      </form>

      {activeTab === 'customer' && (
        <>
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-white/30 text-xs uppercase">{t.auth.login.or}</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors">
              <Chrome size={18} className="text-red-500" />
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors">
              <Smartphone size={18} className="text-blue-400" />
              <span className="text-sm font-medium">Microsoft</span>
            </button>
          </div>

          <div className="text-center pt-4 border-t border-white/5 mt-4">
            <span className="text-white/50 text-sm">{t.auth.login.noAccount} </span>
            <button onClick={onCustomerRegisterClick} className="text-gold-400 font-bold hover:underline">
              {t.auth.login.registerNow}
            </button>
          </div>
        </>
      )}

      {activeTab === 'merchant' && (
        <div className="text-center pt-4 border-t border-white/5">
          <span className="text-white/50 text-sm">{t.auth.login.noAccount} </span>
          <button onClick={onRegisterClick} className="text-gold-400 font-bold hover:underline">
            {t.auth.login.registerNow}
          </button>
        </div>
      )}
    </div>
  );
};
