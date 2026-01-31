
import React from 'react';
import { useCheckoutStore } from '../../../../stores/useCheckoutStore';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { MapPin, User, Phone, Globe } from 'lucide-react';

// FIX: Moved outside to prevent re-renders
const InputField = ({ icon: Icon, label, value, field, updateAddress }: any) => (
    <div>
        <label className="block text-sm text-gold-200 mb-2">{label}</label>
        <div className="relative group">
            <Icon className="absolute top-3.5 right-3.5 w-5 h-5 text-white/40 group-focus-within:text-gold-500 transition-colors pointer-events-none" />
            <input 
                type="text" 
                value={value}
                onChange={(e) => updateAddress(field, e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:border-gold-500 focus:bg-white/10 outline-none transition-all"
            />
        </div>
    </div>
);

export const AddressStep: React.FC = () => {
  const { address, updateAddress } = useCheckoutStore();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="grid md:grid-cols-2 gap-6">
            <InputField icon={User} label={t.dashboard.checkout.address.name} value={address.fullName} field="fullName" updateAddress={updateAddress} />
            <InputField icon={Phone} label={t.dashboard.checkout.address.phone} value={address.phone} field="phone" updateAddress={updateAddress} />
            <InputField icon={Globe} label={t.dashboard.checkout.address.city} value={address.city} field="city" updateAddress={updateAddress} />
            <div className="md:col-span-2">
                 <InputField icon={MapPin} label={t.dashboard.checkout.address.address} value={address.details} field="details" updateAddress={updateAddress} />
            </div>
        </div>
    </div>
  );
};
