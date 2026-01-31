
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useVendorStore } from '../../../stores/useVendorStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Store, CheckCircle2, XCircle, FileText, Activity, Star, Eye } from 'lucide-react';
import { storesApi } from '../../../services/api/stores';
// import { toast } from 'react-hot-toast'; // Removed to avoid dependency issue
import { DocumentReviewModal } from '../../modals/DocumentReviewModal'; // Import New Modal

interface AdminStoreProfileProps {
    vendorId: string;
    onBack: () => void;
}

export const AdminStoreProfile: React.FC<AdminStoreProfileProps> = ({ vendorId, onBack }) => {
    const { t, language } = useLanguage();
    const { currentStoreProfile, fetchStoreProfile, isLoadingStores } = useAdminStore();

    // Local state for modal
    const [selectedDoc, setSelectedDoc] = useState<{ type: 'cr' | 'license', title: string, url: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (newStatus: 'ACTIVE' | 'BLOCKED') => {
        if (!vendorId) return;
        setIsUpdating(true);
        try {
            await storesApi.updateStatus(vendorId, newStatus);
            // toast.success(...) -> Replaced with alert for safety
            window.alert(newStatus === 'ACTIVE' ? 'Store Approved Successfully' : 'Store Blocked Successfully');
            fetchStoreProfile(vendorId); // Refresh data
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
        if (vendorId) fetchStoreProfile(vendorId);
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
            fetchStoreProfile(vendorId); // Refresh UI
            window.alert(`Document ${status} successfully`);
        } catch (error) {
            console.error(error);
            window.alert('Failed to update document');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* Document Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedDoc(null)}>
                    <div className="bg-[#1A1814] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-white font-bold">{selectedDoc.title}</h3>
                            <button onClick={() => setSelectedDoc(null)} className="text-white/50 hover:text-white"><XCircle /></button>
                        </div>
                        <div className="flex-1 p-4 bg-[#0F0E0C] overflow-auto flex items-center justify-center">
                            {selectedDoc.url.endsWith('.pdf') ? (
                                <iframe src={selectedDoc.url} className="w-full h-full min-h-[500px]" title="Doc Viewer" />
                            ) : (
                                <img src={selectedDoc.url} alt="Document" className="max-w-full max-h-full object-contain" />
                            )}
                        </div>
                        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
                            <button
                                onClick={() => handleDocAction('approved')}
                                className="px-4 py-2 rounded bg-green-500 text-black font-bold hover:bg-green-400 transition-colors"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleDocAction('rejected')}
                                className="px-4 py-2 rounded bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
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
                        <div className="grid grid-cols-2 gap-3">
                            {vendor.status !== 'ACTIVE' ? (
                                <button
                                    onClick={() => handleStatusUpdate('ACTIVE')}
                                    disabled={isUpdating}
                                    className="flex items-center justify-center gap-2 py-2 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded-lg transition-colors border border-green-500/20 disabled:opacity-50"
                                >
                                    <CheckCircle2 size={16} />
                                    {t.admin.storeProfile.actions.approve}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleStatusUpdate('BLOCKED')} // Could be SUSPENDED if enum allows, using BLOCKED for now
                                    disabled={isUpdating}
                                    className="flex items-center justify-center gap-2 py-2 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-white rounded-lg transition-colors border border-yellow-500/20 disabled:opacity-50"
                                >
                                    <XCircle size={16} />
                                    {t.admin.storeProfile.actions.suspend}
                                </button>
                            )}

                            <button
                                onClick={() => handleStatusUpdate('BLOCKED')}
                                disabled={isUpdating}
                                className="flex items-center justify-center gap-2 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
                            >
                                <XCircle size={16} />
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
                                                {doc ? `Updated: ${new Date(doc.updatedAt).toLocaleDateString()}` : 'No file'}
                                            </div>
                                            {doc ? (
                                                <button className="text-xs flex items-center gap-1 text-gold-400 hover:underline">
                                                    <Eye size={12} /> Review
                                                </button>
                                            ) : (
                                                <span className="text-xs text-red-400">Not Uploaded</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
