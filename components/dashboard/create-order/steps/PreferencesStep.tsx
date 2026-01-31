
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, History, ShieldCheck, Info } from 'lucide-react';
import { useCreateOrderStore } from '../../../../stores/useCreateOrderStore';
import { useLanguage } from '../../../../contexts/LanguageContext';

export const PreferencesStep: React.FC = () => {
    const { preferences, updatePreferences } = useCreateOrderStore();
    const { t } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            {/* Condition Selection - Selectable Cards */}
            <div>
                <label className="block text-sm font-medium text-gold-200 mb-4">
                    {t.dashboard.createOrder.prefs.condition}
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                    <button
                        onClick={() => updatePreferences('condition', 'new')}
                        className={`
                    relative p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4 text-right group
                    ${preferences.condition === 'new'
                                ? 'bg-gold-500/10 border-gold-500 ring-1 ring-gold-500/50'
                                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}
                `}
                    >
                        <div className={`p-3 rounded-full ${preferences.condition === 'new' ? 'bg-gold-500 text-white' : 'bg-white/10 text-white/50'}`}>
                            <Sparkles size={24} />
                        </div>
                        <div className="flex-1 text-start">
                            <h3 className={`font-bold text-lg mb-1 ${preferences.condition === 'new' ? 'text-white' : 'text-white/80'}`}>
                                {t.dashboard.createOrder.prefs.new}
                            </h3>
                            <p className="text-xs text-white/50 leading-relaxed">
                                {t.dashboard.createOrder.prefs.newDesc}
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => updatePreferences('condition', 'used')}
                        className={`
                    relative p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4 text-right group
                    ${preferences.condition === 'used'
                                ? 'bg-gold-500/10 border-gold-500 ring-1 ring-gold-500/50'
                                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}
                `}
                    >
                        <div className={`p-3 rounded-full ${preferences.condition === 'used' ? 'bg-gold-500 text-white' : 'bg-white/10 text-white/50'}`}>
                            <History size={24} />
                        </div>
                        <div className="flex-1 text-start">
                            <h3 className={`font-bold text-lg mb-1 ${preferences.condition === 'used' ? 'text-white' : 'text-white/80'}`}>
                                {t.dashboard.createOrder.prefs.used}
                            </h3>
                            <p className="text-xs text-white/50 leading-relaxed">
                                {t.dashboard.createOrder.prefs.usedDesc}
                            </p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Warranty Toggle */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-1">{t.dashboard.createOrder.prefs.warranty}</h4>
                        <p className="text-xs text-white/50 max-w-sm">
                            {t.dashboard.createOrder.prefs.warrantyDesc}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => updatePreferences('warranty', !preferences.warranty)}
                    className={`
                w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center relative
                ${preferences.warranty ? 'bg-gold-500' : 'bg-white/10'}
            `}
                >
                    <motion.div
                        className="w-6 h-6 rounded-full bg-white shadow-md absolute top-1 left-1"
                        animate={{ x: preferences.warranty ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                </button>
            </div>

        </motion.div>
    );
};
