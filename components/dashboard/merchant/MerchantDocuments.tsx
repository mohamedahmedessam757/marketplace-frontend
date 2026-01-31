

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle2, AlertTriangle, XCircle, Clock, UploadCloud, Eye, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useVendorStore, DocState } from '../../../stores/useVendorStore';
import { GlassCard } from '../../ui/GlassCard';

export const MerchantDocuments: React.FC = () => {
  const { t, language } = useLanguage();
  const { documents, setDocumentFile, simulateUpload } = useVendorStore();
  const [activeUpload, setActiveUpload] = useState<string | null>(null);

  const isAr = language === 'ar';

  const docKeys = ['cr', 'license', 'id', 'iban', 'authLetter'] as const;

  const handleFileChange = (key: any, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setDocumentFile(key, e.target.files[0]);
      simulateUpload(key);
      setActiveUpload(null);
    }
  };

  const getStatusBadge = (status: DocState['status']) => {
      switch(status) {
          case 'approved': return <span className="flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded text-[10px] border border-green-500/20"><CheckCircle2 size={12} /> {t.dashboard.merchant.documents.status.approved}</span>;
          case 'pending': return <span className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded text-[10px] border border-yellow-500/20"><Clock size={12} /> {t.dashboard.merchant.documents.status.pending}</span>;
          case 'rejected': return <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-[10px] border border-red-500/20"><XCircle size={12} /> {t.dashboard.merchant.documents.status.rejected}</span>;
          case 'expired': return <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-[10px] border border-red-500/20 animate-pulse"><AlertTriangle size={12} /> {t.dashboard.merchant.documents.status.expired}</span>;
          default: return null;
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{t.dashboard.merchant.documents.title}</h1>
                <p className="text-white/50 text-sm">{t.dashboard.merchant.documents.subtitle}</p>
            </div>
        </div>

        {/* Documents List */}
        <GlassCard className="p-0 overflow-hidden bg-[#151310] border-white/5">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/5 bg-white/5 text-xs text-white/40 uppercase tracking-wider">
                        <th className={`p-4 font-medium ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.documents.table.doc}</th>
                        <th className={`p-4 font-medium ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.documents.table.expiry}</th>
                        <th className={`p-4 font-medium ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.documents.table.status}</th>
                        <th className={`p-4 font-medium ${isAr ? 'text-right' : 'text-left'}`}>{t.dashboard.merchant.documents.table.actions}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {docKeys.map((key) => {
                        const doc = documents[key];
                        const isExpired = doc.status === 'expired';
                        
                        return (
                            <tr key={key} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm">{(t.auth.vendor.docs as any)[key]}</div>
                                            <div className="text-xs text-white/30">PDF, JPG (Max 5MB)</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className={`text-sm ${isExpired ? 'text-red-400 font-bold' : 'text-white/70'}`}>
                                        {doc.expiryDate || '-'}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(doc.status)}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {/* Update Action */}
                                        <label className={`
                                            p-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2 text-xs font-bold
                                            ${isExpired || doc.status === 'rejected' ? 'bg-gold-500 text-white shadow-lg' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}
                                        `}>
                                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(key, e)} />
                                            {isExpired || doc.status === 'rejected' ? <UploadCloud size={14} /> : <RefreshCw size={14} />}
                                            {(isExpired || doc.status === 'rejected') && <span>{t.dashboard.merchant.documents.actions.update}</span>}
                                        </label>
                                        
                                        {/* View Action */}
                                        {doc.status !== 'empty' && (
                                            <button className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                                                <Eye size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {doc.status === 'uploading' && (
                                        <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-gold-500" 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${doc.progress}%` }} 
                                            />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </GlassCard>

        {/* Warning Banner for Expired Docs */}
        {Object.values(documents).some((d: any) => d.status === 'expired' || d.status === 'rejected') && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-pulse">
                <AlertTriangle className="text-red-500" size={20} />
                <p className="text-sm text-red-200">
                    {language === 'ar' 
                        ? 'تنبيه: يوجد مستندات منتهية أو مرفوضة. يرجى تحديثها لضمان استمرار خدمات المتجر.'
                        : 'Warning: You have expired or rejected documents. Please update them to ensure store continuity.'}
                </p>
            </div>
        )}

    </div>
  );
};
