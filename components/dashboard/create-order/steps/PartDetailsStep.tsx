
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Package, FileText, UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { useCreateOrderStore } from '../../../../stores/useCreateOrderStore';
import { useLanguage } from '../../../../contexts/LanguageContext';

export const PartDetailsStep: React.FC = () => {
  const { part, updatePart, addImage, removeImage } = useCreateOrderStore();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addImage(e.target.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Part Name */}
      <div>
        <label className="block text-sm font-medium text-gold-200 mb-2">
          {t.dashboard.createOrder.part.name} <span className="text-red-400">*</span>
        </label>
        <div className="relative group">
          <Package className="absolute top-3.5 right-3.5 w-5 h-5 text-white/40 group-focus-within:text-gold-500 transition-colors pointer-events-none" />
          <input
            type="text"
            value={part.name}
            onChange={(e) => updatePart('name', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:border-gold-500 focus:bg-white/10 outline-none transition-all placeholder-white/20"
            placeholder={t.dashboard.createOrder.part.namePlaceholder}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gold-200 mb-2">
          {t.dashboard.createOrder.part.desc} <span className="text-red-400">*</span>
        </label>
        <div className="relative group">
          <FileText className="absolute top-3.5 right-3.5 w-5 h-5 text-white/40 group-focus-within:text-gold-500 transition-colors pointer-events-none" />
          <textarea
            value={part.description}
            onChange={(e) => updatePart('description', e.target.value)}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white focus:border-gold-500 focus:bg-white/10 outline-none transition-all placeholder-white/20 resize-none"
            placeholder={t.dashboard.createOrder.part.descPlaceholder}
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gold-200 mb-2">
          {t.dashboard.createOrder.part.images} <span className="text-red-400">*</span>
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Upload Button Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-gold-500/50 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center group"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <UploadCloud className="w-8 h-8 text-white/20 group-hover:text-gold-400 transition-colors mb-2" />
            <span className="text-[10px] text-white/40 group-hover:text-white/70">{t.dashboard.createOrder.part.upload}</span>
          </div>

          {/* Previews */}
          {part.images.map((file, idx) => (
            <div key={idx} className="aspect-square rounded-xl bg-white/5 border border-white/10 relative group overflow-hidden">
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};
