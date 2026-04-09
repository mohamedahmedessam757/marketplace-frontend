import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, MapPin, Clock, FileText, UploadCloud, Edit3, Save, CheckCircle2, User, Phone, Mail, Shield, ShieldCheck, Fingerprint, Globe, RefreshCw, Eye, Archive, CreditCard, ExternalLink, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useVendorStore } from '../../../stores/useVendorStore';
import { GlassCard } from '../../ui/GlassCard';
import { MultiSelectDropdown } from '../../ui/MultiSelectDropdown';
import { manufacturers } from '../../../data/manufacturers';

export const MerchantProfile: React.FC = () => {
    const { t, language } = useLanguage();
    const { 
        storeInfo, account, profile, vendorStatus,
        updateStoreInfo, fetchVendorProfile, 
        documents, isLoadingProfile, performance, 
        updateVendorProfile, uploadLogo, uploadDocument,
        contractAcceptance, subscribeToVendorProfile, unsubscribeFromVendorProfile,
        connectStripe, openStripeDashboard
    } = useVendorStore();
    
    const [activeProfileTab, setActiveProfileTab] = useState<'info' | 'contract'>('info');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const logoInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    useEffect(() => {
        fetchVendorProfile();
        subscribeToVendorProfile();
        return () => unsubscribeFromVendorProfile();
    }, [fetchVendorProfile, subscribeToVendorProfile, unsubscribeFromVendorProfile]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateVendorProfile();
            setIsEditing(false);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Save failed', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingLogo(true);
        try {
            await uploadLogo(file);
        } catch (error) {
            console.error('Logo upload failed', error);
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const InputGroup = ({ label, value, onChange, disabled = false, type = "text" }: any) => (
        <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={!isEditing || disabled}
                className={`
            w-full bg-[#1A1814] border rounded-xl px-4 py-3 text-white outline-none transition-colors 
            ${isEditing ? 'border-white/10 focus:border-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-transparent text-white/70'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
            />
        </div>
    );

    const ProfileSkeleton = () => (
        <div className="space-y-8 animate-pulse">
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard className="p-6 h-64 bg-white/5" />
                    <GlassCard className="p-6 h-48 bg-white/5" />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard className="p-6 h-96 bg-white/5" />
                </div>
            </div>
        </div>
    );

    if (isLoadingProfile) return <ProfileSkeleton />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-xl sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gold-500/10 rounded-xl border border-gold-500/20">
                        <Store className="text-gold-500" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white leading-none mb-1">
                            {t.dashboard.merchant.storeProfile.title}
                        </h1>
                        <p className="text-xs text-white/40">{t.dashboard.merchant.profile.verified}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mr-4">
                        <button
                            onClick={() => setActiveProfileTab('info')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                activeProfileTab === 'info' 
                                ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' 
                                : 'text-white/60 hover:text-white'
                            }`}
                        >
                            {t.dashboard.merchant.storeProfile.sections.basic}
                        </button>
                        <button
                            onClick={() => setActiveProfileTab('contract')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                activeProfileTab === 'contract' 
                                ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' 
                                : 'text-white/60 hover:text-white'
                            }`}
                        >
                            {t.dashboard.merchant.storeProfile.contract?.tab || 'العقد'}
                        </button>
                    </div>

                    {activeProfileTab === 'info' && (
                        isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-5 py-2 rounded-xl font-bold transition-all text-white/60 hover:text-white"
                                >
                                    {t.common?.cancel || (language === 'ar' ? 'إلغاء' : 'Cancel')}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gold-500 hover:bg-gold-600 text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
                            >
                                <Edit3 size={18} />
                                {t.dashboard.merchant.storeProfile.actions.edit}
                            </button>
                        )
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeProfileTab === 'info' ? (
                    <motion.div
                        key="info"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {showSaveSuccess && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3"
                            >
                                <CheckCircle2 size={20} />
                                {t.dashboard.merchant.profile.saveSuccess}
                            </motion.div>
                        )}

                        {(() => {
                            const getDaysLeft = (expiryDate?: string) => {
                                if (!expiryDate) return 999;
                                const diff = new Date(expiryDate).getTime() - new Date().getTime();
                                return Math.ceil(diff / (1000 * 60 * 60 * 24));
                            };

                            const minDaysLeft = Math.min(
                                ...['cr', 'license', 'id', 'iban', 'authLetter'].map(
                                    key => getDaysLeft(documents[key as keyof typeof documents]?.expiryDate)
                                )
                            );

                            if (vendorStatus === 'PENDING_REVIEW') {
                                return (
                                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3 animate-pulse">
                                        <Shield className="text-orange-500 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="text-sm font-bold text-orange-500 mb-1">
                                                {language === 'ar' ? 'حسابك قيد المراجعة المؤقتة' : 'Account Temporarily Under Review'}
                                            </h4>
                                            <p className="text-xs text-orange-400/80 leading-relaxed">
                                                {language === 'ar' 
                                                    ? 'لقد قمت بتحديث مستندات قانونية هامة. تم إيقاف الحساب مؤقتاً في انتظار موافقة الإدارة.' 
                                                    : 'You have updated important legal documents. The account is temporarily suspended pending admin approval.'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            if (minDaysLeft <= 0 && minDaysLeft >= -15) {
                                return (
                                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 animate-pulse">
                                        <Shield className="text-red-500 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="text-sm font-bold text-red-500 mb-1">
                                                {language === 'ar' ? 'تنبيه: فترة السماح تنتهي قريباً' : 'Alert: Grace Period Ending Soon'}
                                            </h4>
                                            <p className="text-xs text-red-400/80 leading-relaxed">
                                                {language === 'ar' 
                                                    ? `لقد انتهت صلاحية أحد المستندات. لديك ${15 + minDaysLeft} يوم لتحديثها قبل إيقاف الحساب نهائياً.` 
                                                    : `One of your documents has expired. You have ${15 + minDaysLeft} days to update them before account suspension.`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            } else if (minDaysLeft > 0 && minDaysLeft <= 30) {
                                return (
                                    <div className="bg-gold-500/10 border border-gold-500/20 p-4 rounded-xl flex items-start gap-3">
                                        <Clock className="text-gold-500 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="text-sm font-bold text-gold-500 mb-1">
                                                {language === 'ar' ? 'تنبيه: مستندات ستنتهي قريباً' : 'Alert: Documents Expiring Soon'}
                                            </h4>
                                            <p className="text-xs text-gold-500/70 leading-relaxed">
                                                {language === 'ar' 
                                                    ? `يرجى تجديد مستنداتك وتراخيصك خلال ${minDaysLeft} يوم لتجنب أي إيقاف للخدمة.` 
                                                    : `Please renew your documents within ${minDaysLeft} days to avoid any service interruption.`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <GlassCard className="p-8 text-center relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-1 rounded-md border border-green-500/20 uppercase">
                                            {language === 'ar' ? 'نشط' : 'Active'}
                                        </div>
                                    </div>
                                    
                                    <input 
                                        type="file" 
                                        ref={logoInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />
                                    <div className={`w-32 h-32 mx-auto border-2 border-dashed rounded-full flex items-center justify-center mb-6 overflow-hidden relative group/logo transition-all ${profile.logo ? 'border-gold-500/20 bg-transparent' : 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'}`}>
                                        {isUploadingLogo ? (
                                            <RefreshCw size={32} className="text-gold-500 animate-spin" />
                                        ) : profile.logo ? (
                                            <img src={profile.logo} alt="Logo" className="w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover/logo:scale-110" />
                                        ) : (
                                            <Store size={48} className="text-white/10" />
                                        )}
                                        {isEditing && !isUploadingLogo && (
                                            <div 
                                                onClick={() => logoInputRef.current?.click()}
                                                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-all cursor-pointer"
                                            >
                                                <UploadCloud className="text-white w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-2">{storeInfo.storeName || t.dashboard.merchant.storeProfile.fields.name}</h2>
                                    
                                    <div className="flex items-center justify-center gap-1 mb-6">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= Math.round(performance?.rating || 0) ? 'bg-gold-500' : 'bg-white/10'}`} />
                                        ))}
                                        <span className="text-xs text-white/40 ml-2">{performance?.rating?.toFixed(1)} {t.dashboard.merchant.profile.rating}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-white/5">
                                        {[
                                            { 
                                                label: t.dashboard.merchant.kpi.responseSpeed, 
                                                value: `${performance.responseSpeed}h`, 
                                                status: performance.responseSpeed < 4 ? 'good' : 'bad' 
                                            },
                                            { 
                                                label: t.dashboard.merchant.kpi.prepSpeed, 
                                                value: `${performance.prepSpeed}h`, 
                                                status: performance.prepSpeed < 24 ? 'good' : 'bad' 
                                            },
                                            { 
                                                label: t.dashboard.merchant.kpi.acceptanceRate, 
                                                value: `${performance.acceptanceRate}%`, 
                                                status: performance.acceptanceRate > 50 ? 'good' : 'bad' 
                                            },
                                            { 
                                                label: t.dashboard.merchant.kpi.rating, 
                                                value: performance.rating, 
                                                status: performance.rating > 4.5 ? 'good' : 'risk' 
                                            }
                                        ].map((kpi, idx) => (
                                            <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center group/kpi hover:border-gold-500/20 transition-all">
                                                <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1 group-hover/kpi:text-gold-500/60 transition-colors">{kpi.label}</div>
                                                <div className={`text-base font-bold ${
                                                    kpi.status === 'good' ? 'text-green-400' : 
                                                    kpi.status === 'risk' ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                    {kpi.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-6">
                                    <h3 className="text-sm font-bold text-gold-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Phone size={14} />
                                        {t.dashboard.merchant.storeProfile.sections.contact}
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { icon: User, label: t.dashboard.merchant.profile.manager, value: account.name, color: 'text-blue-400' },
                                            { icon: Phone, label: t.dashboard.merchant.profile.mobile, value: account.phone, color: 'text-green-400' },
                                            { icon: Mail, label: t.dashboard.merchant.profile.email, value: account.email, color: 'text-purple-400' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors">
                                                <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                                                    <item.icon size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[10px] text-white/40 uppercase tracking-wider">{item.label}</div>
                                                    <div className="text-white text-sm font-medium truncate">{item.value}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </div>

                            <div className="lg:col-span-2 space-y-6">
                                <GlassCard className="p-8 relative z-[3]">
                                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                            <div className="w-1 h-6 bg-gold-500 rounded-full" />
                                            {t.dashboard.merchant.storeProfile.sections.basic}
                                        </h3>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <InputGroup
                                            label={t.dashboard.merchant.storeProfile.fields.name}
                                            value={storeInfo.storeName}
                                            onChange={(e: any) => updateStoreInfo('storeName', e.target.value)}
                                        />
                                        
                                        <div className="space-y-6">
                                            <MultiSelectDropdown
                                                label={language === 'ar' ? 'تخصص شركات السيارات' : 'Car Makes Specialization'}
                                                items={manufacturers.map(m => ({ id: m.name, name: m.name, nameAr: m.nameAr }))}
                                                selectedItems={storeInfo.selectedMakes ?? []}
                                                disabled={!isEditing}
                                                onChange={(newMakes) => {
                                                    updateStoreInfo('selectedMakes', newMakes as any);
                                                    const availableModels = manufacturers
                                                        .filter(m => newMakes.includes(m.name))
                                                        .flatMap(m => m.types);
                                                    const availableModelNames = availableModels.map(m => m.name);
                                                    const filteredModels = (storeInfo.selectedModels ?? []).filter(sm => availableModelNames.includes(sm));
                                                    if (filteredModels.length !== (storeInfo.selectedModels ?? []).length) {
                                                        updateStoreInfo('selectedModels', filteredModels as any);
                                                    }
                                                }}
                                                customValue={storeInfo.customMake}
                                                onCustomValueChange={(val) => updateStoreInfo('customMake', val)}
                                            />

                                            { (storeInfo.selectedMakes ?? []).length > 0 && (
                                                <MultiSelectDropdown
                                                    label={language === 'ar' ? 'تخصص موديلات السيارات' : 'Car Models Specialization'}
                                                    items={manufacturers
                                                        .filter(m => (storeInfo.selectedMakes ?? []).includes(m.name))
                                                        .flatMap(m => m.types.map(t => ({ 
                                                            id: t.name, 
                                                            name: t.name, 
                                                            nameAr: t.nameAr, 
                                                            subtext: m.name 
                                                        })))}
                                                    selectedItems={storeInfo.selectedModels ?? []}
                                                    disabled={!isEditing}
                                                    onChange={(newModels) => updateStoreInfo('selectedModels', newModels as any)}
                                                    customValue={storeInfo.customModel}
                                                    onCustomValueChange={(val) => updateStoreInfo('customModel', val)}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs text-white/40 uppercase tracking-wider block">{t.dashboard.merchant.storeProfile.fields.bio}</label>
                                        <textarea
                                            value={storeInfo.bio}
                                            onChange={(e) => updateStoreInfo('bio', e.target.value)}
                                            disabled={!isEditing}
                                            rows={4}
                                            className={`
                                            w-full bg-[#1A1814] border rounded-2xl px-5 py-4 text-white outline-none transition-all resize-none
                                            ${isEditing ? 'border-white/10 focus:border-gold-500 shadow-[0_0_20px_rgba(212,175,55,0.05)]' : 'border-transparent text-white/70'}
                                        `}
                                        />
                                    </div>
                                </GlassCard>

                                {/* STRIPE ONBOARDING CARD */}
                                <GlassCard className="p-8 relative z-[2]">
                                    <div className="flex items-center gap-3 mb-6">
                                        <CreditCard size={24} className="text-blue-500" />
                                        <h3 className="text-lg font-bold text-white">
                                            {language === 'ar' ? 'البوابة المالية (Stripe)' : 'Financial Gateway (Stripe)'}
                                        </h3>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        {profile.stripeOnboarded ? (
                                            <div className="space-y-4">
                                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3">
                                                    <CheckCircle2 className="text-green-400" size={24} />
                                                    <div>
                                                        <h4 className="text-white font-bold">{language === 'ar' ? 'حساب مالي نشط' : 'Active Financial Account'}</h4>
                                                        <p className="text-sm text-green-400/80">
                                                            {language === 'ar' ? 'تم اكتمال الربط بنجاح عبر Stripe.' : 'Successfully connected via Stripe.'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={openStripeDashboard}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all"
                                                >
                                                    <ExternalLink size={18} />
                                                    {language === 'ar' ? 'عرض لوحة تحكم Stripe' : 'View Stripe Dashboard'}
                                                </button>
                                            </div>
                                        ) : profile.stripeAccountId ? (
                                            <div className="space-y-4">
                                                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-center gap-3">
                                                    <AlertTriangle className="text-orange-400" size={24} />
                                                    <div>
                                                        <h4 className="text-orange-400 font-bold">{language === 'ar' ? 'الربط غير مكتمل' : 'Setup Incomplete'}</h4>
                                                        <p className="text-sm text-white/50">
                                                            {language === 'ar' ? 'يرجى استكمال البيانات وإثبات الهوية في Stripe لتفعيل السحب.' : 'Please complete KYC on Stripe to enable payouts.'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={connectStripe}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-bold transition-all"
                                                >
                                                    <CreditCard size={18} />
                                                    {language === 'ar' ? 'متابعة إعداد Stripe' : 'Resume Stripe Setup'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="text-sm text-white/60 leading-relaxed">
                                                    {language === 'ar' 
                                                        ? 'لاستقبال الأرباح وإدارة أموالك بشفافية وأمان، يجب عليك ربط متجرك بالبوابة المالية العالمية Stripe.' 
                                                        : 'To receive payouts and manage funds securely, you must connect your store to Stripe.'}
                                                </p>
                                                <button 
                                                    onClick={connectStripe}
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-bold transition-all"
                                                >
                                                    <CreditCard size={18} />
                                                    {language === 'ar' ? 'ربط حساب الدفع' : 'Connect Payment Account'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-8 relative z-[2]">
                                    <div className="flex items-center gap-3 mb-6">
                                        <MapPin size={24} className="text-gold-500" />
                                        <h3 className="text-lg font-bold text-white">
                                            {t.dashboard.merchant.profile.location}
                                        </h3>
                                    </div>
                                    <div className="relative group/map h-auto min-h-[12rem] bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center p-6 text-white/40 transition-all hover:bg-white/[0.07]">
                                        <Globe className="mb-3 opacity-20 group-hover/map:scale-110 group-hover/map:opacity-40 transition-all" size={32} />
                                        
                                        {isEditing ? (
                                            <div className="w-full space-y-4">
                                                <InputGroup 
                                                    label={language === 'ar' ? 'العنوان' : 'Address'}
                                                    value={storeInfo.address}
                                                    onChange={(e: any) => updateStoreInfo('address', e.target.value)}
                                                    placeholder={language === 'ar' ? 'أدخل العنوان التفصيلي' : 'Enter detailed address'}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'ar' ? 'خط العرض' : 'Latitude'}</label>
                                                        <input 
                                                            type="number" 
                                                            step="any"
                                                            value={storeInfo.lat || ''} 
                                                            onChange={(e) => updateStoreInfo('lat', parseFloat(e.target.value))}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-500 outline-none"
                                                            placeholder="e.g. 24.7136"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-white/40 uppercase tracking-widest">{language === 'ar' ? 'خط الطول' : 'Longitude'}</label>
                                                        <input 
                                                            type="number" 
                                                            step="any"
                                                            value={storeInfo.lng || ''} 
                                                            onChange={(e) => updateStoreInfo('lng', parseFloat(e.target.value))}
                                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-500 outline-none"
                                                            placeholder="e.g. 46.6753"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-xs font-mono px-6 text-center leading-relaxed text-white/70">
                                                    {storeInfo.address || (language === 'ar' ? 'الموقع غير محدد' : 'Location not specified')}
                                                </div>
                                                <div className="mt-4 flex gap-2">
                                                    <div className="text-[10px] bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 font-mono text-gold-500/80">
                                                        LAT: {storeInfo.lat?.toFixed(6) || '---'}
                                                    </div>
                                                    <div className="text-[10px] bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 font-mono text-gold-500/80">
                                                        LNG: {storeInfo.lng?.toFixed(6) || '---'}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-8 bg-gradient-to-b from-[#1A1814]/50 to-transparent relative z-[1]">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                            <FileText size={20} className="text-gold-500" />
                                            {t.dashboard.merchant.storeProfile.sections.docs}
                                        </h3>
                                        <div className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Mandatory Records</div>
                                    </div>

                                    <div className="grid gap-4">
                                        {[
                                            { key: 'cr', label: language === 'ar' ? 'السجل التجاري' : 'Commercial Record' },
                                            { key: 'license', label: language === 'ar' ? 'رخصة البلدية' : 'Municipal License' },
                                            { key: 'id', label: language === 'ar' ? 'الهوية الوطنية' : 'National ID' },
                                            { key: 'iban', label: language === 'ar' ? 'شهادة الآيبان' : 'IBAN Certificate' },
                                            { key: 'authLetter', label: language === 'ar' ? 'خطاب التفويض' : 'Authorization Letter' },
                                        ].map((docItem) => {
                                            const doc = documents[docItem.key as keyof typeof documents];
                                            let displayStatus = doc?.status || 'empty';
                                            
                                            const daysLeft = doc?.expiryDate ? Math.ceil((new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 999;
                                            
                                            if (displayStatus === 'approved' && daysLeft <= 0) {
                                                displayStatus = 'expired';
                                            }

                                            const dateLabel = doc?.expiryDate 
                                                ? (language === 'ar' ? 'ينتهي في: ' : 'Expires: ') + new Date(doc.expiryDate).toLocaleDateString('en-GB')
                                                : doc?.lastUpdated 
                                                    ? new Date(doc.lastUpdated).toLocaleDateString('en-GB') 
                                                    : '---';

                                            const hasActiveBusiness = (performance?.activeOrdersCount || 0) > 0;

                                            return (
                                                <div key={docItem.key} className="group/doc relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.04]">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className={`p-3 rounded-xl ${
                                                            displayStatus === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                            displayStatus === 'expired' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                            displayStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                            'bg-white/5 text-white/30 border border-white/10'
                                                        }`}>
                                                            <FileText size={20} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-bold text-white mb-1">{docItem.label}</div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-tight ${
                                                                    displayStatus === 'approved' ? 'text-green-400 bg-green-500/5 border-green-500/20' :
                                                                    displayStatus === 'expired' ? 'text-orange-400 bg-orange-500/5 border-orange-500/20 animate-pulse' :
                                                                    displayStatus === 'pending' || displayStatus === 'uploading' ? 'text-blue-400 bg-blue-500/5 border-blue-500/20' :
                                                                    displayStatus === 'rejected' ? 'text-red-400 bg-red-500/5 border-red-500/20' :
                                                                    'text-white/20 bg-white/5 border-white/10'
                                                                }`}>
                                                                    {displayStatus === 'approved' ? (language === 'ar' ? 'مفعل' : 'Active') : 
                                                                     displayStatus === 'expired' ? (language === 'ar' ? 'منتهي الصلاحية' : 'Expired') :
                                                                     displayStatus === 'pending' ? (language === 'ar' ? 'قيد المراجعة' : 'In Review') : 
                                                                     displayStatus === 'uploading' ? (language === 'ar' ? 'جاري الرفع' : 'Uploading') :
                                                                     displayStatus === 'rejected' ? (language === 'ar' ? 'مرفوض' : 'Rejected') : 
                                                                     (language === 'ar' ? 'غير متوفر' : 'Not Provided')}
                                                                </span>
                                                                <span className="text-[10px] text-white/20">•</span>
                                                                <span className="text-[10px] text-white/30 font-mono italic">{dateLabel}</span>
                                                                {displayStatus === 'approved' && doc?.expiryDate && daysLeft > 0 && (
                                                                    <>
                                                                        <span className="text-[10px] text-white/20">•</span>
                                                                        <span className={`text-[10px] font-bold ${daysLeft <= 30 ? 'text-gold-500 animate-pulse' : 'text-green-400/80'}`}>
                                                                            {language === 'ar' ? `متبقي ${daysLeft} يوم` : `${daysLeft} days left`}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 sm:self-center">
                                                        {doc?.fileUrl && (
                                                            <button 
                                                                onClick={() => window.open(doc.fileUrl!, '_blank')}
                                                                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all"
                                                                title={language === 'ar' ? 'عرض المستند' : 'View Document'}
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                        )}

                                                        <label className={`p-2.5 rounded-xl transition-all relative group/btn ${
                                                            hasActiveBusiness 
                                                                ? 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
                                                                : displayStatus === 'expired' || displayStatus === 'rejected' || displayStatus === 'empty'
                                                                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 animate-pulse cursor-pointer'
                                                                    : 'bg-gold-500/5 hover:bg-gold-500/10 text-gold-500/40 hover:text-gold-500 border border-transparent cursor-pointer'
                                                        }`} title={
                                                            hasActiveBusiness 
                                                                ? (language === 'ar' ? 'لا يمكن التعديل بوجود (طلبات نشطة، شحنات، نزاعات، إرجاعات)' : 'Cannot edit. Active orders, shipments, disputes, or returns in progress.')
                                                                : (language === 'ar' ? 'تحديث المستند' : 'Update Document')
                                                        }>
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                accept=".pdf,.jpg,.png"
                                                                disabled={hasActiveBusiness}
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        let shouldUpload = true;
                                                                        if (docItem.key === 'cr' || docItem.key === 'license') {
                                                                            const confirmMsg = language === 'ar' 
                                                                                ? 'تحديث هذا المستند القانوني سيؤدي إلى إيقاف الحساب مؤقتاً للمراجعة. هل أنت متأكد؟'
                                                                                : 'Updating this legal document will temporarily suspend the account for review. Are you sure?';
                                                                            shouldUpload = window.confirm(confirmMsg);
                                                                        }
                                                                        if (shouldUpload) {
                                                                            uploadDocument(docItem.key as any, file);
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            <RefreshCw size={18} className={`${displayStatus === 'uploading' ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} />
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="contract"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {!contractAcceptance ? (
                            <div className="bg-black/20 p-12 rounded-3xl border border-white/5 backdrop-blur-xl text-center flex flex-col items-center justify-center space-y-4">
                                <div className="p-6 bg-white/5 rounded-full">
                                    <Archive className="text-white/20" size={64} />
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    {t.dashboard.merchant.storeProfile.contract?.noContract || 'العقد غير متاح حالياً'}
                                </h3>
                                <p className="text-white/40 max-w-sm">
                                    {language === 'ar' 
                                        ? 'سيظهر العقد هنا بمجرد التوقيع الإلكتروني واعتماد الإدارة للمتجر.' 
                                        : 'The contract will appear here once signed and approved by management.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-gold-500/10 rounded-lg">
                                                <FileText className="text-gold-500" size={20} />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">
                                                {t.dashboard.merchant.storeProfile.contract?.snapshot || 'لقطة العقد'}
                                            </h3>
                                        </div>
                                        
                                        <div className="bg-white/5 rounded-2xl border border-white/5 p-6 h-[600px] overflow-y-auto custom-scrollbar">
                                            <div 
                                                className="prose prose-invert max-w-none text-sm text-white/70 whitespace-pre-wrap leading-relaxed"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: language === 'ar' 
                                                        ? contractAcceptance.contentArSnapshot 
                                                        : contractAcceptance.contentEnSnapshot 
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contract Metadata & Signature */}
                                <div className="space-y-6">
                                    {/* Second Party Data */}
                                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <ShieldCheck className="text-blue-400" size={20} />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">
                                                {t.dashboard.merchant.storeProfile.contract?.secondParty.title || 'بيانات الطرف الثاني'}
                                            </h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-white/40">{t.dashboard.merchant.storeProfile.contract?.secondParty.company || 'الشركة'}</span>
                                                <span className="text-white font-medium">{contractAcceptance.secondPartyData?.companyName}</span>
                                            </div>
                                            <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-white/40">{t.dashboard.merchant.storeProfile.contract?.secondParty.manager || 'المدير المسؤول'}</span>
                                                <span className="text-white font-medium">{contractAcceptance.secondPartyData?.managerName}</span>
                                            </div>
                                            <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-white/40">{t.dashboard.merchant.storeProfile.contract?.secondParty.crNumber || 'السجل'}</span>
                                                <span className="text-white font-medium">{contractAcceptance.secondPartyData?.crNumber}</span>
                                            </div>
                                            <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-white/40">{t.dashboard.merchant.storeProfile.contract?.secondParty.license || 'الرخصة / انتهاء الصلاحية'}</span>
                                                <span className="text-white font-medium">
                                                    {contractAcceptance.secondPartyData?.municipalityLicense} 
                                                    {contractAcceptance.secondPartyData?.licenseExpiry && ` / ${contractAcceptance.secondPartyData.licenseExpiry}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-white/40">{t.dashboard.merchant.storeProfile.contract?.secondParty.location || 'الإمارة / الدولة'}</span>
                                                <span className="text-white font-medium">
                                                    {contractAcceptance.secondPartyData?.emirate} / {contractAcceptance.secondPartyData?.country}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Signature Information */}
                                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-green-500/10 rounded-lg">
                                                <Fingerprint className="text-green-400" size={20} />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">
                                                {t.dashboard.merchant.storeProfile.contract?.signature.title || 'التوقيع والتحقق'}
                                            </h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="text-green-400" size={20} />
                                                    <span className="text-green-400 font-bold">{language === 'ar' ? 'تم التوقيع إلكترونياً' : 'Signed Electronically'}</span>
                                                </div>
                                                <span className="text-white/40 text-xs">ID: {contractAcceptance.id.split('-')[0]}</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                    <p className="text-white/40 text-xs mb-1">{t.dashboard.merchant.storeProfile.contract?.signature.signedBy}</p>
                                                    <p className="text-white text-sm font-medium">{contractAcceptance.signatureData?.signedName || contractAcceptance.signatureData?.signerName}</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                    <p className="text-white/40 text-xs mb-1">{t.dashboard.merchant.storeProfile.contract?.signature.contact || 'البريد / الهاتف'}</p>
                                                    <p className="text-white text-[10px] font-medium truncate">
                                                        {contractAcceptance.signatureData?.email} / {contractAcceptance.signatureData?.phone}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                <p className="text-white/40 text-xs mb-1">{t.dashboard.merchant.storeProfile.contract?.signature.date}</p>
                                                <p className="text-white text-sm font-medium">
                                                    {new Date(contractAcceptance.acceptedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                                </p>
                                            </div>

                                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                <p className="text-white/40 text-xs mb-2 flex items-center gap-1">
                                                    <Globe size={12} /> {t.dashboard.merchant.storeProfile.contract?.signature.security}
                                                </p>
                                                <div className="space-y-1">
                                                    <p className="text-white/60 text-[10px] break-all font-mono">IP: {contractAcceptance.ipAddress}</p>
                                                    <p className="text-white/60 text-[10px] truncate font-mono">UA: {contractAcceptance.userAgent}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
