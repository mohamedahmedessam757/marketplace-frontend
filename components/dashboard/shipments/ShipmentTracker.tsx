
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Truck, Package, Home, MapPin } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

export interface TrackingStep {
    id: 'received' | 'transit' | 'distribution' | 'out' | 'delivered';
    label: string;
    date?: string;
    completed: boolean;
    current: boolean;
    icon: React.ElementType;
}

interface ShipmentTrackerProps {
    status: TrackingStep['id'];
}

export const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({ status }) => {
    const { t } = useLanguage();

    const steps: TrackingStep[] = [
        { id: 'received', label: t.dashboard.tracking.steps.received, completed: false, current: false, icon: Package },
        { id: 'transit', label: t.dashboard.tracking.steps.transit, completed: false, current: false, icon: Truck },
        { id: 'distribution', label: t.dashboard.tracking.steps.distribution, completed: false, current: false, icon: MapPin },
        { id: 'out', label: t.dashboard.tracking.steps.out, completed: false, current: false, icon: Truck },
        { id: 'delivered', label: t.dashboard.tracking.steps.delivered, completed: false, current: false, icon: Home },
    ];

    // Logic to mark steps as completed/current
    let foundCurrent = false;
    const processedSteps = steps.map((step) => {
        if (step.id === status) {
            foundCurrent = true;
            return { ...step, current: true, completed: true };
        }
        return { ...step, completed: !foundCurrent }; // If not found yet, it's completed (past step)
    });

    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between">

                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full" />

                {/* Active Progress Bar */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-gold-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                    style={{ width: `${(processedSteps.findIndex(s => s.id === status) / (steps.length - 1)) * 100}%` }}
                />

                {/* Steps */}
                {processedSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 
                  transition-all duration-300
                  ${step.completed
                                        ? 'bg-gold-500 border-gold-500 text-black'
                                        : step.current
                                            ? 'bg-black border-gold-500 text-gold-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                                            : 'bg-[#1A1814] border-white/20 text-white/30'}
                `}
                            >
                                {step.completed && !step.current ? <Check size={16} /> : <Icon size={18} />}
                            </motion.div>

                            <div className="absolute top-12 w-32 text-center">
                                <p className={`text-xs font-medium transition-colors ${step.completed || step.current ? 'text-white' : 'text-white/30'}`}>
                                    {step.label}
                                </p>
                                {step.current && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="mt-1 text-[10px] text-gold-500 font-bold"
                                    >
                                        {t.dashboard.status.pending}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
