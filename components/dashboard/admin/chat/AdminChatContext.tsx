
import React, { useState } from 'react';
import { useAdminChatStore } from '../../../../stores/useAdminChatStore';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { admin } from '../../../../data/locales/admin';
import { 
    FileText, User, Store, ShieldAlert, Trash2, 
    Download, HandMetal, CheckCircle2, AlertTriangle,
    Activity, Clock, MapPin, Hash, Package, Shield
} from 'lucide-react';

export const AdminChatContext: React.FC = () => {
    const { language } = useLanguage();
    const isAr = language === 'ar';
    const t = admin[language];
    const { activeChat, adminAction } = useAdminChatStore();
    const [capturing, setCapturing] = useState(false);

    const handleJoin = async () => {
        await adminAction(activeChat.id, 'join');
    };

    const handleDeleteChat = async () => {
        if (confirm(isAr ? 'هل أنت متأكد من حذف هذه المحادثة بالكامل للجميع؟' : 'Are you sure you want to delete this entire chat for everyone?')) {
            await adminAction(activeChat.id, 'deleteChat');
        }
    };

    const handleTakeEvidence = async () => {
        setCapturing(true);
        try {
            const evidence = await adminAction(activeChat.id, 'evidence');
            // Create a blob and download it
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(evidence, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `evidence_chat_${activeChat.id}_${new Date().toISOString()}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            alert(t.chatOversight.evidenceCaptured);
        } catch (error) {
            console.error('Evidence capture failed:', error);
        } finally {
            setCapturing(false);
        }
    };

    const handleBlockUser = async (userId: string, name: string) => {
        if (confirm(isAr ? `هل أنت متأكد من حظر المستخدم ${name} نهائياً من المنصة؟` : `Are you sure you want to block user ${name} permanently from the platform?`)) {
            await adminAction(activeChat.id, 'block', { userId });
        }
    };

    if (!activeChat) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center text-white/5 mb-4 border border-white/5">
                    <Shield size={32} />
                </div>
                <h3 className="text-sm font-bold text-white/20 mb-1">
                    {isAr ? 'لا يوجد محادثة نشطة' : 'No Active Chat'}
                </h3>
                <p className="text-[10px] text-white/10 uppercase tracking-widest font-medium">
                    {isAr ? 'اختر محادثة من القائمة للبدء' : 'Select a conversation to begin'}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-6 space-y-8">
            {/* Moderation Actions */}
            <div>
                <h4 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4 flex items-center gap-2">
                    <ShieldAlert size={14} className="text-gold-500" />
                    {isAr ? 'أدوات الرقابة' : 'Oversight Tools'}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                    {!activeChat.adminJoinedAt && (
                        <button 
                            onClick={handleJoin}
                            className="w-full py-2.5 px-4 rounded-xl bg-gold-500 text-[#1A1814] text-xs font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                        >
                            <HandMetal size={14} />
                            {t.chatOversight.joinChat}
                        </button>
                    )}
                    
                    <button 
                        onClick={handleTakeEvidence}
                        disabled={capturing}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {capturing ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Download size={14} />}
                        {t.chatOversight.takeEvidence}
                    </button>

                    <button 
                        onClick={handleDeleteChat}
                        className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={14} />
                        {t.chatOversight.deleteChat}
                    </button>
                </div>
            </div>

            {/* Context Details (Dynamic) */}
            <div>
                <h4 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4 flex items-center gap-2">
                    {activeChat.type === 'support' ? <FileText size={14} /> : <Package size={14} />}
                    {activeChat.type === 'support' 
                        ? (isAr ? 'بيانات تذكرة الدعم' : 'Support Ticket Details')
                        : (isAr ? 'تفاصيل الطلب' : 'Order Details')}
                </h4>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/20">
                            <Hash size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/40 uppercase font-bold">
                                {activeChat.type === 'support' ? (isAr ? 'رقم التذكرة' : 'Ticket ID') : (isAr ? 'رقم الطلب' : 'Order Number')}
                            </p>
                            <p className="text-sm font-bold text-white truncate">
                                {activeChat.type === 'support' ? `#TKT-${activeChat.id.substring(0, 8)}` : `#${activeChat.orderNumber || 'N/A'}`}
                            </p>
                        </div>
                    </div>
                    {activeChat.type === 'order' && activeChat.partName && (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10">
                                <Activity size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase font-bold">{isAr ? 'القطعة المطلوبة' : 'Requested Part'}</p>
                                <p className="text-sm font-bold text-white truncate max-w-[160px]">{activeChat.partName}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Participants */}
            <div>
                <h4 className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-4 flex items-center gap-2">
                    <Activity size={14} />
                    {isAr ? 'الأطراف المشاركة' : 'Participants'}
                </h4>
                <div className="space-y-3">
                    {/* Customer */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 group">
                        <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 border border-gold-500/10">
                            <User size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{activeChat.customerName}</p>
                            <p className="text-[10px] text-white/40">{isAr ? 'عميل' : 'Customer'}</p>
                        </div>
                        <button 
                            onClick={() => handleBlockUser(activeChat.customerId, activeChat.customerName)}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                            title={isAr ? 'حظر المستخدم' : 'Block User'}
                        >
                            <AlertTriangle size={14} />
                        </button>
                    </div>

                    {/* Vendor */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 group">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 border border-white/10">
                            <Store size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{activeChat.vendorName || (isAr ? 'تاجر غير محدد' : 'Unknown Vendor')}</p>
                            <p className="text-[10px] text-white/40">{isAr ? 'تاجر' : 'Vendor'}</p>
                        </div>
                        {activeChat.vendorId && (
                            <button 
                                onClick={() => handleBlockUser(activeChat.vendorId!, activeChat.vendorName!)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                title={isAr ? 'حظر المستخدم' : 'Block User'}
                            >
                                <AlertTriangle size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Safety Tips for Admin */}
            <div className="mt-auto bg-gold-500/5 rounded-2xl p-4 border border-gold-500/10">
                <div className="flex items-center gap-2 mb-2 text-gold-500">
                    <AlertTriangle size={14} />
                    <span className="text-[10px] font-bold uppercase">{isAr ? 'تنبيه إداري' : 'Admin Alert'}</span>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed italic">
                    {isAr ? 'تذكر أن أي إجراء (حذف أو انضمام) يتم تسجيله في سجلات النظام لأغراض التدقيق.' : 'Remember that any action (deletion or join) is recorded in system logs for auditing purposes.'}
                </p>
            </div>
        </div>
    );
};
