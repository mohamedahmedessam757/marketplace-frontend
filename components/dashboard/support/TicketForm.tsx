import React, { useState } from 'react';
import { useSupportStore } from '../../../stores/useSupportStore';
import { storageApi } from '../../../services/api/storage';
import { Send, Upload, X } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

export const TicketForm: React.FC<{ onSuccess: () => void, onCancel: () => void }> = ({ onSuccess, onCancel }) => {
    const { t } = useLanguage();
    const { createTicket } = useSupportStore();
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState(''); // Maps to 'message' in store
    const [priority, setPriority] = useState('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attachment, setAttachment] = useState<{ url: string; type: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Pass attachment if exists
            const success = await createTicket(
                subject,
                description,
                priority,
                attachment?.url,
                attachment?.type as 'image' | 'video'
            );
            if (success) {
                onSuccess();
            } else {
                setError(t.dashboard.support.form?.error || 'Failed to create ticket. Please try again.');
            }
        } catch (err: any) {
            console.error('Failed to submit ticket:', err);
            setError(err.message || 'Failed to submit ticket');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">
                    {t.dashboard.support?.newTicketTitle || 'Submit a Request'}
                </h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">{t.dashboard.support?.subject || 'Subject'}</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold-500 transition-colors"
                        placeholder={t.dashboard.support.form?.summaryPlaceholder || "Brief summary of the issue"}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">{t.dashboard.support.form?.priority || 'Priority'}</label>
                    <div className="flex gap-4">
                        {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p)}
                                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${priority === p
                                    ? 'bg-gold-500 text-black border-gold-500'
                                    : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {t.dashboard.support.form?.[p.toLowerCase() as keyof typeof t.dashboard.support.form] || p}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">{t.dashboard.support?.message || 'Description'}</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-gold-500 transition-colors min-h-[150px]"
                        placeholder={t.dashboard.support.form?.descPlaceholder || "Please describe your issue in detail..."}
                        required
                    />
                </div>

                {/* Attachments */}
                <div>
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                try {
                                    setIsSubmitting(true);
                                    // Upload to 'support-files'
                                    const url = await storageApi.upload(file, 'support-files', 'tickets');
                                    // Store URL and determine type
                                    const type = file.type.startsWith('image/') ? 'image' : 'video'; // Simple check
                                    // We need to pass these to createTicket, so strictly we should state them
                                    // But createTicket is called on submit. So let's store them in state.
                                    setAttachment({ url, type });
                                    setIsSubmitting(false);
                                } catch (err) {
                                    console.error('Upload failed', err);
                                    setError('Failed to upload file');
                                    setIsSubmitting(false);
                                }
                            }
                        }}
                        accept="image/*,video/*,application/pdf"
                    />
                    <label
                        htmlFor="file-upload"
                        className={`border border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer block ${attachment ? 'border-gold-500/50 bg-gold-500/10' : ''}`}
                    >
                        <Upload className={`mx-auto mb-2 ${attachment ? 'text-gold-500' : 'text-white/30'}`} size={24} />
                        <p className="text-sm text-white/50">
                            {attachment ? 'File uploaded successfully' : (t.dashboard.support.form?.upload || 'Click to upload screenshots or relevant files')}
                        </p>
                    </label>
                </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
                    disabled={isSubmitting}
                >
                    {t.common?.cancel || 'Cancel'}
                </button>
                <button
                    type="submit"
                    className="flex-2 w-full py-4 bg-gold-500 hover:bg-gold-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (t.dashboard.support.form?.submitting || 'Submitting...') : (
                        <>
                            <Send size={20} />
                            {t.common?.submit || 'Submit Ticket'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};
