
import React, { useState, useRef, useEffect } from 'react';
import { useAdminChatStore, AdminChatMessage } from '../../../../stores/useAdminChatStore';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { admin } from '../../../../data/locales/admin';
import { 
    Send, Trash2, Languages, User, Store, 
    ShieldCheck, EyeOff, Info, AlertTriangle, Loader2,
    Video, Image as ImageIcon, FileText, Download, X, Paperclip, Globe
} from 'lucide-react';
import { supabase } from '../../../../services/supabase';

export const AdminChatWindow: React.FC = () => {
    const { language } = useLanguage();
    const isAr = language === 'ar';
    const t = admin[language];
    const { activeChat, adminAction, sendMessage, isLoading, _hasLoadedOrder, toggleTranslation } = useAdminChatStore();
    
    const [inputText, setInputText] = useState('');
    const [showTranslated, setShowTranslated] = useState(false); 
    const [isSending, setIsSending] = useState(false);
    const [pendingAttachment, setPendingAttachment] = useState<{ url: string; type: 'image' | 'video' | 'document'; file: File } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages]);

    if (!activeChat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/[0.01]">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6 border border-white/5">
                    <MessageSquare size={40} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                    {isAr ? 'اختر محادثة للرقابة' : 'Select a chat to monitor'}
                </h3>
                <p className="text-white/40 max-w-xs text-sm">
                    {isAr ? 'يمكنك هنا مراقبة المحادثات النشطة والتدخل عند الحاجة' : 'Monitor active conversations and intervene when necessary'}
                </p>
            </div>
        );
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 25 * 1024 * 1024) {
                alert(isAr ? 'حجم الملف كبير جداً (الأقصى 25 ميجابايت)' : 'File size too large (Max 25MB)');
                return;
            }
            let type: 'image' | 'video' | 'document' = 'document';
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.startsWith('video/')) type = 'video';
            const url = URL.createObjectURL(file);
            setPendingAttachment({ url, type, file });
        }
    };

    const clearAttachment = () => {
        if (pendingAttachment) {
            URL.revokeObjectURL(pendingAttachment.url);
            setPendingAttachment(null);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async () => {
        if (!activeChat || (!inputText.trim() && !pendingAttachment) || isSending || isUploading) return;
        
        setIsUploading(true);
        let uploadedMediaUrl = undefined;

        try {
            if (pendingAttachment) {
                const fileName = `admin/oversight/${Date.now()}_${pendingAttachment.file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
                const { data, error } = await supabase.storage.from('chat_media').upload(fileName, pendingAttachment.file, { upsert: true });
                
                if (error) {
                    console.error('Upload Error:', error);
                    alert(isAr ? 'فشل رفع المرفق. تأكد من الحجم والصيغة.' : 'Failed to upload attachment. Check size and format.');
                    setIsUploading(false);
                    return;
                }
                
                if (data) {
                    const { data: publicData } = supabase.storage.from('chat_media').getPublicUrl(data.path);
                    uploadedMediaUrl = publicData.publicUrl;
                }
            }

            const textToSend = inputText;
            setInputText(''); // Clear instantly 
            setIsSending(true);
            
            await sendMessage(
                activeChat.id, 
                textToSend, 
                uploadedMediaUrl, 
                pendingAttachment?.type, 
                pendingAttachment?.file.name
            );
            clearAttachment();
        } finally {
            setIsUploading(false);
            setIsSending(false);
        }
    };

    const handleToggleTranslation = () => {
        if (activeChat?.id) {
            const isCurrentlyEnabled = !!activeChat.adminTranslationEnabledAt;
            toggleTranslation(activeChat.id, !isCurrentlyEnabled);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (confirm(isAr ? 'هل أنت متأكد من حذف هذه الرسالة للجميع؟' : 'Are you sure you want to delete this message for everyone?')) {
            await adminAction(activeChat.id, 'deleteMessage', { messageId });
        }
    };

    const renderMedia = (msg: AdminChatMessage) => {
        if (!msg.mediaUrl) return null;
        
        if (msg.mediaType === 'video') {
            return <video src={msg.mediaUrl} controls className="w-full max-h-60 rounded-lg object-cover bg-black/40 mb-2" />;
        }
        
        if (msg.mediaType === 'image' || !msg.mediaType) {
            return <img src={msg.mediaUrl} alt="attachment" className="w-full max-h-80 rounded-lg object-contain bg-black/20 mb-2 cursor-pointer hover:opacity-90 transition-opacity" />;
        }

        return (
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 mb-2 hover:bg-white/10 transition-all cursor-pointer group/media">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">
                    <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{msg.mediaName || 'Attachment'}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-tighter">Click to Download</p>
                </div>
                <Download size={16} className="text-white/20 group-hover/media:text-gold-500 transition-colors" />
            </div>
        );
    };

    const renderMessage = (msg: AdminChatMessage) => {
        const isSystem = msg.senderId === 'system';
        const isDeleted = msg.isDeletedByAdmin;

        if (isSystem) {
            return (
                <div key={msg.id} className="flex justify-center my-4">
                    <div className="px-4 py-1.5 bg-gold-400/10 border border-gold-400/20 rounded-full flex items-center gap-2 text-[10px] text-gold-400 font-bold uppercase tracking-wider">
                        <Info size={12} />
                        {msg.text}
                    </div>
                </div>
            );
        }

        return (
            <div key={msg.id} className={`flex flex-col mb-6 group ${isAr ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-start gap-3 max-w-[85%] ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-1 p-4 rounded-2xl relative border shadow-xl ${isDeleted ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.05] border-white/5'}`}>
                        {isDeleted && (
                            <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold uppercase mb-2">
                                <EyeOff size={10} />
                                {isAr ? 'رسالة محذوفة إدارياً' : 'Deleted by Admin'}
                            </div>
                        )}
                        
                        {renderMedia(msg)}

                        <p className={`text-sm leading-relaxed ${isDeleted ? 'text-white/30 italic line-through' : 'text-white/90'} whitespace-pre-wrap`}>
                            {(showTranslated || activeChat.adminTranslationEnabledAt) && msg.translatedText ? msg.translatedText : msg.text}
                        </p>
                        
                        {(showTranslated || activeChat.adminTranslationEnabledAt) && msg.translatedText && (
                            <p className="text-[10px] text-white/30 italic mt-1 font-medium">Original: {msg.text}</p>
                        )}
                        
                        <div className={`flex items-center gap-2 mt-2 pt-2 border-t border-white/5 ${isAr ? 'justify-start' : 'justify-end'}`}>
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {/* Moderation Controls */}
                        {!isDeleted && (
                            <button 
                                onClick={() => handleDeleteMessage(msg.id)}
                                className={`absolute -top-2 ${isAr ? '-left-2' : '-right-2'} w-7 h-7 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95`}
                                title={t.chatOversight.deleteMessage}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    {msg.translatedText && (
                        <button 
                            onClick={() => setShowTranslated(!showTranslated)}
                            className={`mt-2 p-2 rounded-xl border self-start transition-all ${showTranslated ? 'bg-gold-500 text-[#1A1814] border-gold-500 shadow-lg shadow-gold-500/20' : 'bg-white/5 text-white/40 border-white/10 hover:border-gold-500/50 hover:text-white'}`}
                        >
                            <Languages size={14} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#0F0E0C]/30 relative">
            {/* Chat Transition Overlay */}
            {isLoading && _hasLoadedOrder && (
                <div className="absolute inset-0 z-50 bg-[#0F0E0C]/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                    <Loader2 size={32} className="text-gold-500 animate-spin mb-4" />
                    <span className="text-white/60 text-sm font-medium">{isAr ? 'جاري فتح المحادثة...' : 'Opening conversation...'}</span>
                </div>
            )}
            
            {/* Header / Participant Bar */}
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3 rtl:space-x-reverse">
                        <div className="w-8 h-8 rounded-full border-2 border-[#1A1814] bg-gold-500/20 flex items-center justify-center text-gold-500 relative z-20">
                            <User size={16} />
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-[#1A1814] bg-white/10 flex items-center justify-center text-white/40 relative z-10">
                            <Store size={16} />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                            {activeChat.customerName} vs {activeChat.vendorName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-white/30 lowercase tracking-wider">Live Oversight Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggleTranslation}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${activeChat.adminTranslationEnabledAt ? 'bg-gold-500 text-[#1A1814] border-gold-500' : 'bg-white/5 text-white/40 border-white/10 hover:border-gold-500/50 hover:text-white'}`}
                        title={isAr ? 'تفعيل الترجمة التلقائية بالذكاء الاصطناعي' : 'Toggle AI Auto-Translation'}
                    >
                        <Globe size={14} />
                        {activeChat.adminTranslationEnabledAt ? (isAr ? 'ترجمة ذكية' : 'AI Translation') : (isAr ? 'تفعيل الترجمة' : 'Translate')}
                    </button>
                    <button 
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${showTranslated ? 'bg-gold-500 text-[#1A1814] border-gold-500' : 'bg-white/5 text-white/40 border-white/10 hover:border-gold-500/50 hover:text-white'}`}
                        onClick={() => setShowTranslated(!showTranslated)}
                    >
                        <Languages size={14} />
                        {showTranslated ? t.chatOversight.translated : t.chatOversight.originalLanguage}
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto p-6 custom-scrollbar ${isAr ? 'space-y-4' : 'space-y-4'}`}>
                {activeChat.messages?.map(renderMessage)}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                {pendingAttachment && (
                    <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black/40 rounded-lg overflow-hidden flex items-center justify-center">
                                {pendingAttachment.type === 'video' ? <Video size={16} className="text-white/50" /> : pendingAttachment.type === 'document' ? <FileText size={16} className="text-white/50" /> : <img src={pendingAttachment.url} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                                <p className="text-xs text-white font-medium max-w-[200px] truncate">{pendingAttachment.file.name}</p>
                                <p className="text-[10px] text-white/40">{isAr ? 'جاهز للإرسال' : 'Ready to send'}</p>
                            </div>
                        </div>
                        <button onClick={clearAttachment} className="p-1.5 hover:bg-white/10 rounded-full text-white/50 hover:text-red-400 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                )}
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isSending}
                        className={`p-3 rounded-xl transition-colors shrink-0 ${pendingAttachment ? 'bg-gold-500/20 text-gold-500' : 'text-white/40 hover:text-white hover:bg-white/5 bg-white/5 border border-white/10'}`}
                    >
                        <Paperclip size={20} />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder={isAr ? 'اكتب رسالة كمسؤول (ستظهر للجميع)...' : 'Type as Admin (will be visible to all)...'}
                            disabled={isUploading || isSending}
                            className={`w-full bg-white/5 border border-white/10 rounded-2xl py-3 ${isAr ? 'pr-4 pl-12 text-right' : 'pl-4 pr-12'} text-sm text-white focus:outline-none focus:border-gold-500/50 transition-all ${isUploading || isSending ? 'opacity-50' : ''}`}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={(!inputText.trim() && !pendingAttachment) || isUploading || isSending}
                            className={`absolute ${isAr ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gold-500 text-[#1A1814] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:bg-white/10 disabled:text-white/20 disabled:hover:scale-100`}
                        >
                            {isUploading || isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3 px-1">
                    <ShieldCheck size={12} className="text-gold-500" />
                    <span className="text-[10px] text-white/30 italic">
                        {isAr ? 'أنت ترسل رسالة بصفة المسؤول' : 'You are sending a message as Administrator'}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Internal icon dependency fix
const MessageSquare = ({ size }: { size: number }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
