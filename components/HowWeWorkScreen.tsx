import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Truck, CreditCard, Video, FileCheck, ShieldCheck, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HowWeWorkScreenProps {
    onComplete: () => void; // "Order Now" -> Role Selection
    onBack: () => void;     // "How We Work" -> Landing Page
    onTermsClick: () => void; // "Terms" -> Terms Page
}

export const HowWeWorkScreen: React.FC<HowWeWorkScreenProps> = ({ onComplete, onBack, onTermsClick }) => {
    const { t, language } = useLanguage();

    // Access roleSelection from t.common if available.
    // Fallback to t.roleSelection if spread (though in our case it's in common)
    const roleSelection = t.common?.roleSelection || (t as any).roleSelection;

    // Safety check if translations are missing (prevents empty text)
    const safeTitle = roleSelection?.features?.title || 'معنا... تشاليح الإمارات توصلك وفلوسك بأمان';

    // Feature List Configuration
    const features = [
        { icon: Wrench, text: roleSelection?.features?.originalParts || 'قطع غيار أصلية مستعملة', color: 'text-gray-400' },
        { icon: Truck, text: roleSelection?.features?.shipping || 'توصيل للخليج', color: 'text-orange-400' },
        { icon: CreditCard, text: roleSelection?.features?.payment || 'الدفع آمن', color: 'text-yellow-400' },
        { icon: Video, text: roleSelection?.features?.video || 'فحص بالفيديو', color: 'text-gray-400' },
        { icon: FileCheck, text: roleSelection?.features?.documentation || 'توثيق المعاينة', color: 'text-gray-300' },
        { icon: ShieldCheck, text: roleSelection?.features?.guarantee || 'ضمان الشحن', color: 'text-green-500' },
        { icon: FileText, text: roleSelection?.features?.terms || 'الشروط والأحكام', color: 'text-gray-400', isLink: true, onClick: onTermsClick }
    ];

    const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1814] overflow-y-auto overflow-x-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-luxury-gradient opacity-20" />
                <div className="absolute top-0 left-0 w-full h-full "
                    style={{
                        backgroundImage: `
                        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                    `,
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-2xl px-6 py-12 md:py-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                        {safeTitle} 🚗
                    </h1>
                </motion.div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                        >
                            <div className={`mt-1 shrink-0 ${feature.color}`}>
                                <feature.icon size={24} />
                            </div>
                            <div className="text-white/80 text-sm md:text-base leading-relaxed font-medium">
                                {feature.isLink ? (
                                    <button
                                        onClick={feature.onClick}
                                        className="cursor-pointer border-b border-white/30 hover:text-gold-400 hover:border-gold-400 transition-colors text-left rtl:text-right"
                                    >
                                        {feature.text}
                                    </button>
                                ) : (
                                    feature.text
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col gap-4"
                >
                    {/* Order Now -> Role Selection (reusing validation flow logic from User Request) */}
                    <button
                        onClick={onComplete}
                        className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-white rounded-xl font-bold shadow-[0_4px_20px_rgba(168,139,62,0.3)] hover:shadow-[0_6px_25px_rgba(168,139,62,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {language === 'ar' && <ArrowIcon size={20} />}
                        {roleSelection?.features?.orderNow || 'انتقل للطلب الآن'}
                        {language !== 'ar' && <ArrowIcon size={20} />}
                    </button>

                    {/* How We Work -> Landing Page */}
                    <button
                        onClick={onBack}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-gold-500/30 text-gold-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {roleSelection?.features?.back || 'كيف نعمل'}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
