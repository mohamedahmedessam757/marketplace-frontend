
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export type StatusType =
  | 'AWAITING_OFFERS'
  | 'AWAITING_PAYMENT'
  | 'PREPARATION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'DISPUTED'
  | 'REFUNDED'
  // Legacy/Extra compatibility
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RESOLVED';

interface BadgeProps {
  status: StatusType;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const { t } = useLanguage();

  const styles: Record<string, string> = {
    AWAITING_OFFERS: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    AWAITING_PAYMENT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    PREPARATION: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse", // Pulse for urgency (48h)
    SHIPPED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    DELIVERED: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
    CANCELLED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    RETURNED: "bg-red-500/10 text-red-400 border-red-500/20",
    DISPUTED: "bg-red-600/20 text-red-500 border-red-600/50 animate-pulse font-bold", // High Alert
    REFUNDED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",

    // Fallbacks
    RETURN_REQUESTED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    RETURN_APPROVED: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    RESOLVED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  const statusLabel = (t.common as any).status?.[status] || status;

  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm whitespace-nowrap ${styles[status] || styles.CANCELLED} ${className}`}>
      {statusLabel}
    </span>
  );
};
