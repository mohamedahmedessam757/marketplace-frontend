
import React from 'react';
import { useVendorStore } from '../../../stores/useVendorStore';
import { GlassCard } from '../../ui/GlassCard';
import { ShieldAlert, Lock, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface MerchantStatusGuardProps {
  children: React.ReactNode;
}

export const MerchantStatusGuard: React.FC<MerchantStatusGuardProps> = ({ children }) => {
  const { vendorStatus, setVendorStatus } = useVendorStore();
  const { t } = useLanguage();

  // 1. PENDING REVIEW
  if (vendorStatus === 'PENDING_REVIEW' || vendorStatus === 'PENDING_DOCUMENTS') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="max-w-md w-full text-center p-10 border-gold-500/20">
          <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold-500 animate-pulse">
            <Clock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">{t.auth.vendor.status.pending_review.title}</h2>
          <p className="text-white/60 leading-relaxed mb-8">
            {t.auth.vendor.status.pending_review.desc}
          </p>
          
          <button 
            onClick={() => setVendorStatus('ACTIVE')}
            className="group flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 rounded-xl transition-all"
          >
            <CheckCircle2 size={16} className="text-white/40 group-hover:text-green-400" />
            <span className="text-xs font-mono text-white/40 group-hover:text-green-400 font-bold uppercase tracking-wider">
              [DEV] Simulate Admin Approval
            </span>
          </button>
        </GlassCard>
      </div>
    );
  }

  // 2. LICENSE EXPIRED - RESTRICTED ACCESS
  // We handle this "Restricted" state here. If this guard wraps the main dashboard,
  // we need to be careful. The strategy here is:
  // If LICENSE_EXPIRED, we render a restricted view unless the child is allowed.
  // Ideally, the DashboardLayout handles nav, and here we block the content.
  // HOWEVER, simpler approach for now: Show a banner on top of children, OR block specific pages.
  // Since this wraps all merchant routes, let's allow rendering but maybe overlay?
  // No, let's rely on the MerchantMarketplace page itself to block new orders, 
  // and here we just handle full blocks like Suspended/Blocked.
  // *Modification*: We pass children through for LICENSE_EXPIRED to allow Docs/Orders access,
  // but individual pages will check status if they need to block write access.

  // 3. SUSPENDED
  if (vendorStatus === 'SUSPENDED') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="max-w-md w-full text-center p-10 border-red-500/20 bg-red-900/5">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">{t.auth.vendor.status.suspended.title}</h2>
          <p className="text-white/60 leading-relaxed">
            {t.auth.vendor.status.suspended.desc}
          </p>
        </GlassCard>
      </div>
    );
  }

  // 4. BLOCKED
  if (vendorStatus === 'BLOCKED') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="max-w-md w-full text-center p-10 border-red-500/20 bg-black">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/30">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">{t.auth.vendor.status.blocked.title}</h2>
          <p className="text-white/60 leading-relaxed">
            {t.auth.vendor.status.blocked.desc}
          </p>
        </GlassCard>
      </div>
    );
  }

  // 5. ACTIVE or LICENSE_EXPIRED (Partial Access)
  return <>{children}</>;
};
