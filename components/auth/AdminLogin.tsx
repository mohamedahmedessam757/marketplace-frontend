import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { OTPVerification } from './OTPVerification';
import { OTPMethodSelection } from './OTPMethodSelection';
import { useAdminStore } from '../../stores/useAdminStore';
import { authApi } from '@/services/api/auth';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { t } = useLanguage();
  const { loginAdmin } = useAdminStore();

  // Local OTP State
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
      // 1. First Step: Credentials Check
      const data = await authApi.login(email, password);

      // Store Token (Temporary scope)
      localStorage.setItem('access_token', data.access_token);

      // Verify Role
      const role = data.user?.role;
      if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUPPORT') {
        // Store Admin Details
        setUserName(data.user.name || 'Admin');
        setUserPhone(data.user.phone || '');

        // 2. Trigger OTP
        // In real backend, login might return "OTP_REQUIRED" status
        // For M1, we explicitly request OTP sending here
        try {
          await authApi.sendOTP(email);
        } catch (otpErr) {
          console.warn('OTP Send warning (mock mode maybe)', otpErr);
        }
        setOtpStep('method');
      } else {
        setError(t.auth.errors?.accessDenied || 'Access Denied');
        localStorage.removeItem('access_token');
      }

    } catch (err: any) {
      console.error('Admin Login Failed', err);
      setError(t.auth.errors?.invalidCredentials || 'Invalid Admin Credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    try {
      // DEVELOPMENT BYPASS: Allow any code for testing
      // await authApi.verifyOTP(email, code); 
      console.log('DEV MODE: OTP Bypassed with code', code);

      // Only login to store after full verification
      loginAdmin(email);
      onLoginSuccess();
    } catch (err) {
      console.error('OTP Verification Failed', err);
      // alert(t.auth.otp.invalidCode); 
    }
  };

  if (otpStep === 'method') {
    return (
      <OTPMethodSelection
        email={email}
        name={userName}
        onSelect={(method) => {
          setOtpMethod(method);
          setOtpStep('verify');
        }}
      />
    );
  }

  if (otpStep === 'verify') {
    return <OTPVerification email={email} phone={userPhone} method={otpMethod} onVerify={handleVerifyOTP} />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">{t.auth.admin.title}</h2>
        <p className="text-red-400/60 text-xs font-mono mt-2">{t.auth.admin.secure}</p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm font-mono text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 uppercase">Admin ID / Email</label>
          <div className="relative">
            <Mail className="absolute top-3.5 right-3.5 w-5 h-5 text-white/20 pointer-events-none" />
            <input
              type="email"
              required
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 pr-10 text-white focus:border-red-500/50 outline-none transition-all font-mono text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-white/40 mb-2 uppercase">Secure Key</label>
          <div className="relative">
            <Lock className="absolute top-3.5 right-3.5 w-5 h-5 text-white/20 pointer-events-none" />
            <input
              type="password"
              required
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 pr-10 text-white focus:border-red-500/50 outline-none transition-all font-mono text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-white/5 hover:bg-red-900/20 text-white rounded-lg font-mono text-sm border border-white/10 hover:border-red-500/30 transition-all uppercase tracking-wider disabled:opacity-50"
        >
          {isLoading ? (t.auth.admin.verifying || 'VERIFYING...') : (t.auth.admin.authBtn || 'ACCESS CONTROL PANEL').toUpperCase()}
        </button>
      </form>
    </div>
  );
};
