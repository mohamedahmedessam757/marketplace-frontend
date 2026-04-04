
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useVendorStore } from '../../../stores/useVendorStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Store, CheckCircle2, XCircle, FileText, Activity, Star, Eye, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storesApi } from '../../../services/api/stores';
// import { toast } from 'react-hot-toast'; // Removed to avoid dependency issue
import { DocumentReviewModal } from '../../modals/DocumentReviewModal'; // Import New Modal

interface AdminStoreProfileProps {
    vendorId: string;
    onBack: () => void;
}

export const AdminStoreProfile: React.FC<AdminStoreProfileProps> = ({ vendorId, onBack }) => {
    const { t, language } = useLanguage();
    const { currentStoreProfile, subscribeToStoreProfile, unsubscribeFromStoreProfile, silentFetchStoreProfile, isLoadingStores } = useAdminStore();

    // Local state for modal
    const [selectedDoc, setSelectedDoc] = useState<{ type: 'cr' | 'license', title: string, url: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'contract'>('overview');

    const handleStatusUpdate = async (newStatus: 'ACTIVE' | 'BLOCKED' | 'REJECTED', reason?: string) => {
        if (!vendorId) return;
        setIsUpdating(true);
        try {
            await storesApi.updateStatus(vendorId, newStatus, reason);
            // toast.success(...) -> Replaced with alert for safety
            const msg = newStatus === 'ACTIVE' ? 'Store Approved Successfully' : 
                        newStatus === 'REJECTED' ? 'Store Rejected Successfully' : 
                        'Store Blocked Successfully';
            window.alert(msg);
            // Store updates automatically via realtime subscription
            setIsRejectModalOpen(false);
            setRejectionReason('');
        } catch (error) {
            console.error(error);
            window.alert('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const isAr = language === 'ar';
    const ArrowIcon = isAr ? ChevronRight : ChevronLeft;

    React.useEffect(() => {
        if (vendorId) subscribeToStoreProfile(vendorId);
        return () => unsubscribeFromStoreProfile();
    }, [vendorId]);

    if (isLoadingStores || !currentStoreProfile) {
        return <div className="p-12 text-center text-white/50 animate-pulse">Loading Store Profile...</div>;
    }

    const vendor = currentStoreProfile;

    const allDocTypes = ['CR', 'LICENSE', 'ID', 'IBAN', 'AUTH_LETTER'];
    const getDoc = (type: string) => vendor.documents?.find((d: any) => d.docType === type);

    const docStatusColor = (status: string) => {
        if (status === 'approved') return 'text-green-400 border-green-500/20 bg-green-500/10';
        if (status === 'rejected') return 'text-red-400 border-red-500/20 bg-red-500/10';
        return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
    };

    const handleDocAction = async (status: 'approved' | 'rejected') => {
        if (!selectedDoc || !vendorId) return;
        try {
            await storesApi.updateDocumentStatus(vendorId, selectedDoc.type, status);
            setSelectedDoc(null);
            silentFetchStoreProfile(vendorId); // Refresh UI
            window.alert(`Document ${status} successfully`);
        } catch (error) {
            console.error(error);
            window.alert('Failed to update document');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1A1814] border border-red-500/20 rounded-2xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
                    >
                         {/* Background Glow */}
                         <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 blur-[80px] rounded-full" />
                         
                         <div className="relative z-10 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                <XCircle size={32} className="text-red-500" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">
                                {isAr ? 'سبب رفض المتجر' : 'Store Rejection Reason'}
                            </h3>
                            <p className="text-white/60 text-sm mb-6">
                                {isAr ? 'يرجى كتابة سبب واضح للرفض ليتم إرساله للتاجر' : 'Please provide a clear reason to be sent to the merchant'}
                            </p>

                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder={isAr ? 'مثال: السجل التجاري منتهي أو غير واضح...' : 'Example: Commercial register is expired or unclear...'}
                                className="w-full h-32 bg-[#0F0E0C] border border-white/10 rounded-xl p-4 text-white text-sm focus:border-red-500/50 focus:outline-none transition-all mb-6 resize-none"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsRejectModalOpen(false)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                                >
                                    {isAr ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('REJECTED', rejectionReason)}
                                    disabled={!rejectionReason.trim() || isUpdating}
                                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAr ? 'تأكيد الرفض' : 'Confirm Reject'}
                                </button>
                            </div>
                         </div>
                    </motion.div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white">
                    <ArrowIcon size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        {vendor.name || 'Store Name'}
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${docStatusColor(vendor.status === 'ACTIVE' ? 'approved' : 'pending')}`}>
                            {vendor.status}
                        </span>
                    </h1>
                    <div className="text-xs text-white/40">{vendor.owner?.name || 'Owner'} • {vendor.owner?.email || 'Email'}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-white/10 mb-6">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`text-sm font-bold pb-3 border-b-2 transition-all ${activeTab === 'overview' ? 'text-gold-500 border-gold-500' : 'text-white/50 border-transparent hover:text-white'}`}
                >
                  {isAr ? 'نظرة عامة' : 'Overview'}
                </button>
                <button 
                  onClick={() => setActiveTab('contract')}
                  className={`text-sm font-bold pb-3 border-b-2 transition-all ${activeTab === 'contract' ? 'text-gold-500 border-gold-500' : 'text-white/50 border-transparent hover:text-white'}`}
                >
                  {isAr ? 'بيانات العقد' : 'Contract Details'}
                </button>
            </div>

            {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Col 1: KPIs & Actions */}
                <div className="space-y-4">
                    <GlassCard className="p-6 bg-[#151310] border-gold-500/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                            <Activity size={16} className="text-gold-500" />
                            {t.admin.storeProfile.kpi}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-white/60 text-sm">{t.dashboard.merchant.kpi.rating}</span>
                                <div className="flex items-center gap-1 text-yellow-400 font-bold">
                                    <Star size={14} fill="currentColor" /> 4.8
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60 text-sm">Total Orders</span>
                                <div className="text-white font-mono">{vendor._count?.orders || 0}</div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 bg-[#151310]">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                            {t.admin.usersTable.actions}
                        </h3>
                        <div className="flex flex-col gap-3">
                            {vendor.status !== 'ACTIVE' && (
                                <button
                                    onClick={() => handleStatusUpdate('ACTIVE')}
                                    disabled={isUpdating}
                                    className="flex items-center justify-center gap-2 py-3 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white rounded-xl transition-all border border-green-500/20 disabled:opacity-50 font-bold"
                                >
                                    <CheckCircle2 size={18} />
                                    {t.admin.storeProfile.actions.approve}
                                </button>
                            )}

                            {vendor.status !== 'REJECTED' && (
                                <button
                                    onClick={() => setIsRejectModalOpen(true)}
                                    disabled={isUpdating}
                                    className="flex items-center justify-center gap-2 py-3 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white rounded-xl transition-all border border-orange-500/20 disabled:opacity-50 font-bold"
                                >
                                    <XCircle size={18} />
                                    {isAr ? 'رفض المتجر' : 'Reject Store'}
                                </button>
                            )}

                            <button
                                onClick={() => handleStatusUpdate('BLOCKED')}
                                disabled={isUpdating}
                                className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all border border-red-500/20 disabled:opacity-50 font-bold"
                            >
                                <XCircle size={18} />
                                {t.admin.storeProfile.actions.ban}
                            </button>
                        </div>
                    </GlassCard>
                </div>

                {/* Col 2 & 3: Documents Review */}
                <div className="lg:col-span-2">
                    <GlassCard className="p-6 bg-[#1A1814] h-full">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 border-b border-white/5 pb-2 flex items-center gap-2">
                            <FileText size={16} className="text-gold-500" />
                            {t.admin.storeProfile.docs}
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            {allDocTypes.map((type) => {
                                const doc = getDoc(type);
                                return (
                                    <div
                                        key={type}
                                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-gold-500/20 transition-all cursor-pointer group"
                                        onClick={() => doc?.fileUrl && setSelectedDoc({ type: type as any, title: type.replace('_', ' '), url: doc.fileUrl })}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:text-gold-400 transition-colors">
                                                <FileText size={20} />
                                            </div>
                                            <span className={`text-[10px] px-2 py-1 rounded border font-bold ${docStatusColor(doc ? doc.status : 'pending')}`}>
                                                {(doc ? doc.status : 'MISSING').toUpperCase()}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-white text-sm capitalize">
                                            {/* Attempt to use translation if available, else format type */}
                                            {(t.auth.vendor.docs as any)[type.toLowerCase()] || type.replace('_', ' ')}
                                        </h4>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="text-xs text-white/40">
                                                {doc ? `Updated: ${new Date(doc.updatedAt).toLocaleDateString('en-GB')}` : 'No file'}
                                                {doc?.expiresAt && (
                                                    <span className="mx-2 text-gold-500/60 font-mono italic">
                                                        • {language === 'ar' ? 'ينتهي' : 'Expiry'}: {new Date(doc.expiresAt).toLocaleDateString('en-GB')}
                                                    </span>
                                                )}
                                            </div>
                                            {doc ? (
                                                <button className="text-xs flex items-center gap-1 text-gold-400 hover:underline">
                                                    <Eye size={12} /> {language === 'ar' ? 'مراجعة' : 'Review'}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-red-400">{language === 'ar' ? 'لم يتم الرفع' : 'Not Uploaded'}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </div>

            </div>
            )}

            {activeTab === 'contract' && (
                <div className="space-y-6">
                    {(!vendor.contractAcceptances || vendor.contractAcceptances.length === 0) ? (
                        <GlassCard className="p-8 text-center text-white/50">
                            {isAr ? 'لم يقم هذا المتجر بالموافقة على العقد الإلكتروني (من الممكن أنه متجر قديم).' : 'This store has not accepted the electronic contract (it might be a legacy store).'}
                        </GlassCard>
                    ) : (
                        vendor.contractAcceptances.map((acceptance: any) => (
                            <div key={acceptance.id} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <GlassCard className="p-6">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                                            {isAr ? 'بيانات الطرف الثاني (المدخلة)' : 'Second Party Data (Inputted)'}
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50 text-sm">{isAr ? 'الشركة:' : 'Company:'}</span>
                                                <span className="text-white text-sm">{acceptance.secondPartyData?.companyName || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50 text-sm">{isAr ? 'المدير:' : 'Manager:'}</span>
                                                <span className="text-white text-sm">{acceptance.secondPartyData?.managerName || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50 text-sm">{isAr ? 'رقم السجل:' : 'CR Number:'}</span>
                                                <span className="text-white text-sm">{acceptance.secondPartyData?.crNumber || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50 text-sm">{isAr ? 'الرخصة / الانتهاء:' : 'License / Expiry:'}</span>
                                                <span className="text-white text-sm">{acceptance.secondPartyData?.licenseNumber || '-'} / {acceptance.secondPartyData?.licenseExpiry || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50 text-sm">{isAr ? 'الإمارة / الدولة:' : 'Emirate / Country:'}</span>
                                                <span className="text-white text-sm">{acceptance.secondPartyData?.emirate || '-'} / {acceptance.secondPartyData?.country || '-'}</span>
                                            </div>
                                        </div>
                                    </GlassCard>
                                    
                                    <GlassCard className="p-6">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                                            {isAr ? 'بيانات التوقيع' : 'Signature Data'}
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50 text-sm">{isAr ? 'تم التوقيع بواسطة:' : 'Signed By:'}</span>
                                                <span className="text-white text-sm">{acceptance.signatureData?.signedName || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50 text-sm">{isAr ? 'البريد / الهاتف:' : 'Email / Phone:'}</span>
                                                <span className="text-white text-sm break-all">
                                                    {acceptance.signatureData?.email || vendor.owner?.email || '-'} / {acceptance.signatureData?.phone || vendor.owner?.phone || '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50 text-sm">{isAr ? 'تاريخ التوقيع:' : 'Signed At:'}</span>
                                                <span className="text-white text-sm">{new Date(acceptance.acceptedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB')}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-white/50 text-sm">{isAr ? 'معلومات الأمان:' : 'Security Context:'}</span>
                                                <span className="text-white/50 text-xs">IP: {acceptance.ipAddress || 'N/A'} (v{acceptance.contractVersion})</span>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </div>

                                <GlassCard className="p-0 h-[500px] flex flex-col overflow-hidden">
                                    <div className="p-6 border-b border-white/5">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            <FileText size={16} className="text-gold-500" />
                                            {isAr ? 'لقطة العقد الموقع (Snapshot)' : 'Signed Contract Snapshot'}
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gold-500/30">
                                        <div className="whitespace-pre-wrap text-white/80 font-normal leading-relaxed text-base">
                                            {isAr ? acceptance.contentArSnapshot : acceptance.contentEnSnapshot}
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        ))
                    )}
                </div>
            )}

            <AnimatePresence>
                {selectedDoc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex py-10 justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedDoc(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#151310] border border-white/10 rounded-2xl w-full max-w-4xl max-h-full flex flex-col mx-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white capitalize flex items-center gap-3">
                                    <FileText className="text-gold-500" />
                                    {selectedDoc.title}
                                </h2>
                                <button
                                    onClick={() => setSelectedDoc(null)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 p-6 bg-black/50 overflow-hidden relative">
                                <div className="absolute inset-x-6 inset-y-6 bg-[#0A0908] rounded-xl border border-white/5 flex items-center justify-center p-2">
                                    {selectedDoc.url.toLowerCase().endsWith('.pdf') ? (
                                        <object
                                            data={selectedDoc.url}
                                            type="application/pdf"
                                            className="w-full h-full rounded-lg"
                                        >
                                            <p className="text-white/50 text-center">
                                                {isAr ? 'لا يمكن عرض ملف PDF. ' : 'Cannot display PDF. '}
                                                <a href={selectedDoc.url} target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline">
                                                    {isAr ? 'اضغط هنا للتحميل' : 'Click here to download'}
                                                </a>
                                            </p>
                                        </object>
                                    ) : (
                                        <img
                                            src={selectedDoc.url}
                                            alt={selectedDoc.title}
                                            className="w-full h-full object-contain rounded-lg"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-[#1A1814] flex justify-end gap-3 rounded-b-2xl">
                                <a
                                    href={selectedDoc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <ExternalLink size={18} />
                                    {isAr ? 'فتح في نافذة جديدة' : 'Open in New Window'}
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
