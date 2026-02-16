
import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { useAdminStore } from '../../../stores/useAdminStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Settings, DollarSign, Truck, FileText, Save, CheckCircle2, Globe, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminSettings: React.FC = () => {
  const { t, language } = useLanguage();
  const { systemConfig, updateSystemConfig, currentAdmin } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'general' | 'financial' | 'logistics' | 'content'>('general');
  const [showSuccess, setShowSuccess] = useState(false);

  // Local state for forms
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(systemConfig)));

  const handleSave = () => {
    updateSystemConfig(activeTab, formData[activeTab]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleInputChange = (section: keyof typeof systemConfig, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleShippingRuleChange = (index: number, field: string, value: string) => {
    const newRules = [...formData.logistics.shippingRules];
    newRules[index] = { ...newRules[index], [field]: parseFloat(value) };
    handleInputChange('logistics', 'shippingRules', newRules);
  };

  const addShippingRule = () => {
    const newRules = [...formData.logistics.shippingRules, { id: Date.now().toString(), minWeight: 0, maxWeight: 0, price: 0 }];
    handleInputChange('logistics', 'shippingRules', newRules);
  };

  const removeShippingRule = (index: number) => {
    const newRules = formData.logistics.shippingRules.filter((_: any, i: number) => i !== index);
    handleInputChange('logistics', 'shippingRules', newRules);
  };

  const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

  const tabs = [
    { id: 'general', label: t.admin.settingsTabs.general, icon: Globe },
    { id: 'financial', label: t.admin.settingsTabs.financial, icon: DollarSign },
    { id: 'logistics', label: t.admin.settingsTabs.logistics, icon: Truck },
    { id: 'content', label: t.admin.settingsTabs.content, icon: FileText },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-gold-500" />
          {t.admin.settings}
        </h1>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-xl">
            <CheckCircle2 size={18} />
            Saved Successfully
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl transition-all ${activeTab === tab.id ? 'bg-gold-500 text-white font-bold' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <GlassCard className="p-8 bg-[#1A1814]">
        <AnimatePresence mode="wait">

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <motion.div key="general" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-white/60 text-sm mb-2">Platform Name</label>
                <input
                  type="text"
                  value={formData.general.platformName}
                  onChange={(e) => handleInputChange('general', 'platformName', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Support Contact Email</label>
                <input
                  type="email"
                  value={formData.general.contactEmail}
                  onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Support Phone</label>
                <input
                  type="text"
                  value={formData.general.supportPhone}
                  onChange={(e) => handleInputChange('general', 'supportPhone', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none"
                />
              </div>

              {/* Workflow Settings */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-sm">Enable Preferences Step</div>
                    <div className="text-xs text-white/40">Allow customers to choose New/Used condition and warranty options.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.general.enablePreferencesStep}
                      onChange={(e) => handleInputChange('general', 'enablePreferencesStep', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* FINANCIAL TAB */}
          {activeTab === 'financial' && (
            <motion.div key="financial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 max-w-2xl">
              {!isSuperAdmin && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm">
                  Restricted Access: View Only
                </div>
              )}

              <div>
                <div className="flex justify-between text-white mb-2">
                  <span>Commission Rate</span>
                  <span className="text-gold-400 font-bold">{formData.financial.commissionRate}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="30" step="1"
                  value={formData.financial.commissionRate}
                  disabled={!isSuperAdmin}
                  onChange={(e) => handleInputChange('financial', 'commissionRate', parseInt(e.target.value))}
                  className="w-full accent-gold-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-white/40 mt-2">Changes apply to all new orders immediately.</p>
              </div>

              <div>
                <div className="flex justify-between text-white mb-2">
                  <span>VAT Rate</span>
                  <span className="text-gold-400 font-bold">{formData.financial.vatRate}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="20" step="1"
                  value={formData.financial.vatRate}
                  disabled={!isSuperAdmin}
                  onChange={(e) => handleInputChange('financial', 'vatRate', parseInt(e.target.value))}
                  className="w-full accent-gold-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </motion.div>
          )}

          {/* LOGISTICS TAB */}
          {activeTab === 'logistics' && (
            <motion.div key="logistics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">Dynamic Shipping Rules</h3>
                <button onClick={addShippingRule} className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors text-white">
                  <Plus size={14} /> Add Rule
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs text-white/40 uppercase">
                    <tr>
                      <th className="p-3">Min Weight (kg)</th>
                      <th className="p-3">Max Weight (kg)</th>
                      <th className="p-3">Price (SAR)</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {formData.logistics.shippingRules.map((rule: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <input type="number" value={rule.minWeight} onChange={(e) => handleShippingRuleChange(idx, 'minWeight', e.target.value)} className="bg-transparent border border-white/10 rounded px-2 py-1 w-24 text-white text-center" />
                        </td>
                        <td className="p-2">
                          <input type="number" value={rule.maxWeight} onChange={(e) => handleShippingRuleChange(idx, 'maxWeight', e.target.value)} className="bg-transparent border border-white/10 rounded px-2 py-1 w-24 text-white text-center" />
                        </td>
                        <td className="p-2">
                          <input type="number" value={rule.price} onChange={(e) => handleShippingRuleChange(idx, 'price', e.target.value)} className="bg-transparent border border-gold-500/30 text-gold-400 rounded px-2 py-1 w-24 text-center font-bold" />
                        </td>
                        <td className="p-2 text-right">
                          <button onClick={() => removeShippingRule(idx)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <label className="block text-white/60 text-sm mb-2">Base Fallback Shipping Cost (SAR)</label>
                <input
                  type="number"
                  value={formData.logistics.baseShippingCost}
                  onChange={(e) => handleInputChange('logistics', 'baseShippingCost', parseInt(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 w-full max-w-xs"
                />
              </div>
            </motion.div>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div>
                <label className="block text-white/60 text-sm mb-2">Vendor Agreement Contract</label>
                <textarea
                  rows={10}
                  value={formData.content.vendorContract}
                  onChange={(e) => handleInputChange('content', 'vendorContract', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none font-mono text-sm leading-relaxed"
                />
                <p className="text-xs text-white/30 mt-2">This text will appear in the Vendor Registration flow.</p>
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">Invoice Footer Note</label>
                <input
                  type="text"
                  value={formData.content.invoiceFooter}
                  onChange={(e) => handleInputChange('content', 'invoiceFooter', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold-500 outline-none"
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
