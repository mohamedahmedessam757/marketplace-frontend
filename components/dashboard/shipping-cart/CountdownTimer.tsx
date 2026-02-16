
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState<{ h: number, m: number, s: number }>({ h: 0, m: 0, s: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ h: 0, m: 0, s: 0 });
                return;
            }

            setTimeLeft({
                h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex items-center gap-2 text-gold-500 bg-gold-500/10 px-3 py-1 rounded-full text-xs font-mono border border-gold-500/20">
            <Clock size={12} />
            <span>
                {String(timeLeft.h).padStart(2, '0')}:
                {String(timeLeft.m).padStart(2, '0')}:
                {String(timeLeft.s).padStart(2, '0')}
            </span>
        </div>
    );
};
