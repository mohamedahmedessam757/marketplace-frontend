
import React from 'react';
import { motion } from 'framer-motion';
import { Car, Calendar, Camera, Info, ChevronDown } from 'lucide-react';
import { useCreateOrderStore } from '../../../../stores/useCreateOrderStore';
import { useLanguage } from '../../../../contexts/LanguageContext';

// Dummy Data for Dependent Dropdowns
const CAR_DATA: Record<string, string[]> = {
  'Toyota': ['Camry', 'Corolla', 'Land Cruiser', 'Hilux', 'Avalon'],
  'Hyundai': ['Sonata', 'Elantra', 'Tucson', 'Santa Fe', 'Accent'],
  'Ford': ['Explorer', 'Taurus', 'F-150', 'Expedition', 'Mustang'],
  'Mercedes': ['S-Class', 'E-Class', 'C-Class', 'G-Class', 'GLE'],
  'Lexus': ['LX570', 'ES350', 'LS500', 'RX350', 'IS300']
};

const YEARS = Array.from({ length: 20 }, (_, i) => (2024 - i).toString());

export const VehicleDetailsStep: React.FC = () => {
  const { vehicle, updateVehicle } = useCreateOrderStore();
  const { t } = useLanguage();

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateVehicle('make', e.target.value);
    updateVehicle('model', ''); // Reset model when make changes
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      useCreateOrderStore.setState(state => ({
        vehicle: { ...state.vehicle, vinImage: e.target.files![0] }
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-6">

        {/* ... (Existing fields) ... */}
        {/* Car Make */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gold-200 mb-2">
            {t.dashboard.createOrder.vehicle.make}
          </label>
          <div className="relative">
            <Car className="absolute top-3.5 right-3.5 w-5 h-5 text-white/40 pointer-events-none z-10" />
            <select
              value={vehicle.make}
              onChange={handleMakeChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:border-gold-500 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1A1814] text-white/50">{t.dashboard.createOrder.vehicle.selectMake}</option>
              {Object.keys(CAR_DATA).map(make => (
                <option key={make} value={make} className="bg-[#1A1814]">{make}</option>
              ))}
            </select>
            <ChevronDown className="absolute top-4 left-3.5 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Car Model */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gold-200 mb-2">
            {t.dashboard.createOrder.vehicle.model}
          </label>
          <div className="relative">
            <select
              value={vehicle.model}
              onChange={(e) => updateVehicle('model', e.target.value)}
              disabled={!vehicle.make}
              className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer ${!vehicle.make ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="" className="bg-[#1A1814] text-white/50">{t.dashboard.createOrder.vehicle.selectModel}</option>
              {vehicle.make && CAR_DATA[vehicle.make]?.map(model => (
                <option key={model} value={model} className="bg-[#1A1814]">{model}</option>
              ))}
            </select>
            <ChevronDown className="absolute top-4 left-3.5 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Year */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gold-200 mb-2">
            {t.dashboard.createOrder.vehicle.year}
          </label>
          <div className="relative">
            <Calendar className="absolute top-3.5 right-3.5 w-5 h-5 text-white/40 pointer-events-none z-10" />
            <select
              value={vehicle.year}
              onChange={(e) => updateVehicle('year', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:border-gold-500 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1A1814] text-white/50">{t.dashboard.createOrder.vehicle.selectYear}</option>
              {YEARS.map(year => (
                <option key={year} value={year} className="bg-[#1A1814]">{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute top-4 left-3.5 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* VIN Number */}
        <div className="relative group">
          <label className="block text-sm font-medium text-gold-200 mb-2 flex items-center gap-2">
            {t.dashboard.createOrder.vehicle.vin}
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/60">
              {t.common.optional}
            </span>
            {vehicle.vinImage && <span className="text-green-400 text-xs ml-auto">Image Attached ✓</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              value={vehicle.vin}
              onChange={(e) => updateVehicle('vin', e.target.value.toUpperCase())}
              placeholder={t.dashboard.createOrder.vehicle.vinPlaceholder}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:border-gold-500 focus:bg-white/10 outline-none transition-all placeholder-white/20 uppercase font-mono tracking-wider"
              maxLength={17}
            />
            {/* Camera Icon Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`absolute top-2 left-2 p-1.5 rounded-lg transition-colors ${vehicle.vinImage ? 'bg-green-500/20 text-green-400' : 'bg-white/10 hover:bg-gold-500 hover:text-white text-white/50'}`}
              title="Scan VIN"
            >
              <Camera size={16} />
            </button>
            <div className="absolute top-3.5 right-3.5 group/tooltip cursor-help">
              <Info size={18} className="text-white/30 hover:text-white transition-colors" />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 right-0 w-48 bg-black/90 border border-white/10 p-2 rounded-lg text-[10px] text-white hidden group-hover/tooltip:block z-50 shadow-xl">
                {t.dashboard.createOrder.vehicle.tooltip}
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
