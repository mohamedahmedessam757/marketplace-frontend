import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { verificationTasksApi } from '@/services/api/verificationTasks';
import { getCurrentUser } from '../../utils/auth';
import { AdminLogin } from '../auth/AdminLogin';

interface VerifyLinkPageProps {
  token: string;
  onNavigateToTask: (taskId: string) => void;
  onNavigateLogin: () => void;
}

function PageShell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-[#0d0c0a] flex items-center justify-center p-4">
      <div
        className={`w-full ${wide ? 'max-w-md' : 'max-w-sm'} bg-[#1A1814]/90 border border-gold-500/20 rounded-2xl p-8 text-center shadow-2xl`}
      >
        {children}
      </div>
    </div>
  );
}

export const VerifyLinkPage: React.FC<VerifyLinkPageProps> = ({
  token,
  onNavigateToTask,
  onNavigateLogin,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkInfo, setLinkInfo] = useState<{ taskId: string; orderNumber?: string } | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  const activate = useCallback(async () => {
    const user = getCurrentUser();
    if (!user || user.role !== 'VERIFICATION_OFFICER') {
      setNeedsLogin(true);
      return;
    }
    try {
      setActivating(true);
      setError(null);
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      };
      let lat: number | undefined;
      let lng: number | undefined;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          /* optional */
        }
      }
      const { data } = await verificationTasksApi.activateLink(token, { lat, lng, deviceInfo });
      onNavigateToTask(data.taskId);
    } catch (e: any) {
      setError(e?.response?.data?.message || (isAr ? 'تعذر تفعيل الرابط' : 'Could not activate link'));
    } finally {
      setActivating(false);
    }
  }, [token, isAr, onNavigateToTask]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await verificationTasksApi.validatePublicLink(token);
        if (cancelled) return;
        setLinkInfo({ taskId: data.taskId, orderNumber: data.orderNumber });
        const user = getCurrentUser();
        if (!user || user.role !== 'VERIFICATION_OFFICER') setNeedsLogin(true);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.response?.data?.message || (isAr ? 'رابط غير صالح' : 'Invalid link'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, isAr]);

  useEffect(() => {
    if (!loading && linkInfo && !needsLogin) activate();
  }, [loading, linkInfo, needsLogin, activate]);

  if (loading) {
    return (
      <PageShell>
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin mx-auto" />
        <p className="text-white/60 text-sm mt-4">{isAr ? 'جاري التحقق...' : 'Validating...'}</p>
      </PageShell>
    );
  }

  if (needsLogin && linkInfo) {
    return (
      <PageShell wide>
        <ShieldCheck className="w-12 h-12 text-gold-500 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-white mb-2">
          {isAr ? 'وصول مهمة مطابقة' : 'Verification task access'}
        </h1>
        {linkInfo.orderNumber && (
          <p className="text-gold-400/80 text-sm font-mono mb-4">#{linkInfo.orderNumber}</p>
        )}
        <AdminLogin onLoginSuccess={() => setNeedsLogin(false)} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-300 text-sm">{error}</p>
        <button type="button" onClick={onNavigateLogin} className="mt-6 px-6 py-2 rounded-xl border border-white/20 text-white text-sm">
          {isAr ? 'تسجيل الدخول' : 'Sign in'}
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Loader2 className="w-10 h-10 text-gold-500 animate-spin mx-auto" />
      <p className="text-white/60 text-sm mt-4">
        {activating ? (isAr ? 'تفعيل...' : 'Activating...') : isAr ? 'توجيه...' : 'Redirecting...'}
      </p>
    </PageShell>
  );
};
