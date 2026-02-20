import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Mail, Phone, Lock, User, CheckCircle2, UploadCloud,
  ChevronRight, ChevronLeft, Loader2, AlertCircle, FileCheck, Check,
  FileText, Eye, MapPin, ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useVendorStore } from '../../stores/useVendorStore';
import { useAdminStore } from '../../stores/useAdminStore'; // Import AdminStore for contract
import { OTPVerification } from './OTPVerification';
import { OTPMethodSelection } from './OTPMethodSelection';
import { authApi } from '@/services/api/auth';

interface VendorRegisterProps {
  onComplete: () => void;
  onBack?: () => void;
}

export const VendorRegister: React.FC<VendorRegisterProps> = ({ onComplete, onBack }) => {
  const { t, language } = useLanguage();
  const store = useVendorStore();
  const { systemConfig } = useAdminStore(); // Fetch system config
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [shake, setShake] = React.useState(false);

  // Local OTP State
  const [otpStep, setOtpStep] = React.useState<'method' | 'verify'>('method');
  const [otpMethod, setOtpMethod] = React.useState<'email' | 'whatsapp'>('email');

  const NextIcon = language === 'ar' ? ChevronLeft : ChevronRight;
  const PrevIcon = language === 'ar' ? ChevronRight : ChevronLeft;

  // Reset store on mount
  useEffect(() => {
    store.reset();
  }, []);

  // Reset OTP step when entering step 2
  useEffect(() => {
    if (store.step === 2) {
      setOtpStep('method'); // Always start with selection
    }
  }, [store.step]);

  // Generate Dynamic Contract
  const getDynamicContract = () => {
    let text = systemConfig.content.vendorContract;
    // Inject Merchant Details
    text = text.replace('{MERCHANT_NAME}', store.account.name || '___________');
    text = text.replace('{STORE_NAME}', store.storeInfo.storeName || '___________');
    text = text.replace('{DATE}', new Date().toLocaleDateString());
    return text;
  };

  // Validation Logic
  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!store.account.name || !store.account.email || !store.account.phone || !store.account.password) {
        triggerError(t.auth.errors?.fillAll || 'Please fill in all mandatory fields');
        return false;
      }
      if (!store.account.email.includes('@')) {
        triggerError(t.auth.errors?.invalidEmail || 'Invalid Email Format');
        return false;
      }
      if (store.account.password.length < 6) {
        triggerError(t.auth.errors?.passwordShort || 'Password must be at least 6 characters');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!store.otpVerified) {
        triggerError(t.auth.errors?.verifyOTP || 'Please verify your OTP first');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!store.storeInfo.storeName || !store.storeInfo.category || !store.storeInfo.address) {
        triggerError(t.auth.vendor.info.enterDetails || 'Please fill in all mandatory store details');
        return false;
      }
    }
    if (currentStep === 4) {
      if (!store.contractAgreed) {
        triggerError(t.auth.errors?.contractError || 'You must agree to the contract before proceeding');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(store.step)) {
      store.setStep(store.step + 1);
    }
  };

  const handlePrev = () => {
    setError(null);
    store.setStep(store.step - 1);
  };

  const handleVerifyOTP = (code: string) => {
    // For M1 Phase (Mock OTP): Accept any 6-digit code
    if (code.length === 6) {
      store.setOtpVerified(true);
      handleNext();
    } else {
      setError(t.auth.errors?.invalidCode || t.auth.otp.invalidCode);
    }
  };

  // GPS Helper
  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // Show loading state for GPS if needed (using isSubmitting or local state)
    // For now, assume fast response or implement a local loader

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        store.updateStoreInfo('lat', latitude.toString());
        store.updateStoreInfo('lng', longitude.toString());

        // Auto-fill address with coordinates if reverse geocoding isn't available
        // Or you can leave address empty for user to type, but coordinates are set.
        const coordString = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        if (!store.storeInfo.address) {
          store.updateStoreInfo('address', coordString);
        }
        setError(null);
      },
      (error) => {
        console.error("GPS Error", error);
        setError("Unable to retrieve your location. Please check browser permissions.");
      }
    );
  };

  // Helper for file upload simulation
  const handleFileChange = (key: any, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      // store.setDocumentFile(key, e.target.files[0]); // Optional, uploadDocument handles it
      store.uploadDocument(key, e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    // Validate Step 5 (Files)
    const { cr, license, id, iban, authLetter } = store.documents;

    // Check if all files are uploaded (or at least check status not empty)
    const allUploaded = [cr, license, id, iban, authLetter].every(d => d.status === 'completed' || d.status === 'pending');

    if (!allUploaded) {
      triggerError(t.auth.errors?.docsError || 'Please completely upload all 5 mandatory documents');
      return;
    }

    setIsSubmitting(true);

    try {
      // Real API Call to Create Vendor Account
      await authApi.registerVendor({
        email: store.account.email,
        password: store.account.password,
        name: store.account.name,
        phone: store.account.phone,
        // Send Store Details during Registration
        storeName: store.storeInfo.storeName,
        category: store.storeInfo.category,
        address: store.storeInfo.address,
        lat: store.storeInfo.lat,
        lng: store.storeInfo.lng,
        role: 'VENDOR', // Ensure role is sent
        documents: Object.entries(store.documents)
          .filter(([_, doc]) => doc.status === 'completed' || doc.status === 'pending')
          .map(([key, doc]) => ({
            type: {
              cr: 'CR',
              license: 'LICENSE',
              id: 'ID',
              iban: 'IBAN',
              authLetter: 'AUTH_LETTER'
            }[key] || 'OTHER',
            url: doc.fileUrl
          }))
      });

      // NOTE: In Phase 4, we might also want to auto-create the store
      // But for M1, creating the user is the primary goal to enable login.
      // The store details (name, category) and docs are currently held in client store.
      // A full implementation would chain creating the store + uploading docs here.

      setIsSubmitting(false);
      store.setVendorStatus('PENDING_REVIEW'); // Set status to review
      store.setStep(6); // Go to Pending View

    } catch (err: any) {
      console.error('Vendor Registration Error', err);
      if (err.response?.status === 409) {
        setError(t.auth.errors?.phoneExists || 'Phone number already exists');
      } else {
        setError(err.response?.data?.message || t.auth.errors?.registrationFailed);
      }
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-10 px-4 relative">
      <div className="flex items-center justify-between relative z-10">
        {[1, 2, 3, 4, 5].map((s) => {
          const isActive = store.step >= s;
          const isCompleted = store.step > s;
          return (
            <div key={s} className="flex flex-col items-center relative group cursor-default">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isActive ? '#A88B3E' : '#2A200B',
                  borderColor: isActive ? '#C4A95C' : '#ffffff20',
                  scale: isActive ? 1.1 : 1
                }}
                className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 shadow-xl transition-all duration-300 z-20 ${isActive ? 'text-white' : 'text-white/30'}`}
              >
                {isCompleted ? <Check size={16} /> : <span className="text-sm md:text-lg font-bold">{s}</span>}
              </motion.div>
              <div className="absolute top-10 md:top-14 w-20 text-center">
                <span className={`text-[10px] md:text-xs font-bold transition-colors duration-300 ${isActive ? 'text-gold-400' : 'text-white/20'}`}>
                  {t.auth.vendor.steps[s as 1 | 2 | 3 | 4 | 5]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Background Line */}
      <div className="absolute top-[80px] md:top-[96px] left-[10%] w-[80%] h-1 bg-white/10 -z-0 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
          initial={{ width: '0%' }}
          animate={{ width: `${((store.step - 1) / 4) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );

  // Step 6: Pending Approval View
  if (store.step === 6) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <div className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-500/30">
          <Store size={48} className="text-gold-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">{t.auth.vendor.pending.title}</h2>
        <p className="text-white/60 max-w-md mx-auto leading-relaxed mb-8">
          {t.auth.vendor.pending.subtitle}
        </p>
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
        >
          {t.auth.vendor.pending.back}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {store.step < 6 && (
        <div className="text-center mb-8 relative">
          {/* Back Button for Step 1 */}
          {store.step === 1 && onBack && (
            <button
              onClick={onBack}
              className={`absolute top-0 ${language === 'ar' ? 'right-0' : 'left-0'} p-2 text-white/50 hover:text-white transition-colors`}
            >
              <ArrowLeft size={24} className={language === 'ar' ? 'rotate-180' : ''} />
            </button>
          )}

          <h2 className="text-3xl font-bold text-white mb-2">{t.merchants.cta}</h2>
          <p className="text-white/50 text-sm mb-4">{t.merchants.desc}</p>

          {store.step === 1 && onBack && (
            <button onClick={onBack} className="text-gold-400 hover:text-gold-300 text-sm underline underline-offset-4">
              {t.auth.login.title || "Already have an account? Login"}
            </button>
          )}
        </div>
      )}

      {renderProgressBar()}

      <div className="mt-16 md:mt-20 bg-[#000000]/20 rounded-2xl p-1 min-h-[380px] relative">
        <AnimatePresence mode="wait">

          {/* STEP 1: ACCOUNT INFO */}
          {store.step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gold-200 mb-2">{t.auth.vendor.account.name}</label>
                  <div className="relative group">
                    <User className={`absolute top-4 right-4 w-5 h-5 transition-colors pointer-events-none ${error === (t.auth.errors?.fillAll || 'Please fill in all mandatory fields') && !store.account.name ? 'text-red-500' : 'text-white/40 group-focus-within:text-gold-500'}`} />
                    <input
                      type="text"
                      className={`w-full bg-white/5 border rounded-xl px-5 py-4 pr-12 text-white outline-none transition-all placeholder-white/20 ${error === (t.auth.errors?.fillAll || 'Please fill in all mandatory fields') && !store.account.name ? 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] focus:border-red-500' : 'border-white/10 focus:border-gold-500 focus:bg-white/10'}`}
                      value={store.account.name}
                      onChange={e => {
                        store.updateAccount('name', e.target.value);
                        if (error === (t.auth.errors?.fillAll || 'Please fill in all mandatory fields')) setError(null);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gold-200 mb-2">{t.auth.vendor.account.phone}</label>
                  <div className="relative group">
                    <Phone className={`absolute top-4 right-4 w-5 h-5 transition-colors pointer-events-none ${error === (t.auth.errors?.fillAll || 'Please fill in all mandatory fields') && !store.account.phone ? 'text-red-500' : 'text-white/40 group-focus-within:text-gold-500'}`} />
                    <input
                      type="tel"
                      className={`w-full bg-white/5 border rounded-xl px-5 py-4 pr-12 text-white outline-none transition-all placeholder-white/20 ${error === (t.auth.errors?.fillAll || 'Please fill in all mandatory fields') && !store.account.phone ? 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] focus:border-red-500' : 'border-white/10 focus:border-gold-500 focus:bg-white/10'}`}
                      placeholder="05xxxxxxxx"
                      value={store.account.phone}
                      onChange={e => {
                        store.updateAccount('phone', e.target.value);
                        if (error === (t.auth.errors?.fillAll || 'Please fill in all mandatory fields')) setError(null);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gold-200 mb-2">{t.auth.vendor.account.email}</label>
                  <div className="relative group">
                    <Mail className={`absolute top-4 right-4 w-5 h-5 transition-colors pointer-events-none ${(error === (t.auth.errors?.fillAll || 'Please fill in all mandatory fields') && !store.account.email) || error === (t.auth.errors?.invalidEmail || 'Invalid Email Format') ? 'text-red-500' : 'text-white/40 group-focus-within:text-gold-500'}`} />
                    <input
                      type="email"
                      className={`w-full bg-white/5 border rounded-xl px-5 py-4 pr-12 text-white outline-none transition-all placeholder-white/20 ${(error === (t.auth.errors?.fillAll || 'Please fill in all mandatory fields') && !store.account.email) || error === (t.auth.errors?.invalidEmail || 'Invalid Email Format') ? 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] focus:border-red-500' : 'border-white/10 focus:border-gold-500 focus:bg-white/10'}`}
                      value={store.account.email}
                      onChange={e => {
                        store.updateAccount('email', e.target.value);
                        if (error) setError(null);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gold-200 mb-2">{t.auth.vendor.account.password}</label>
                  <div className="relative group">
                    <Lock className={`absolute top-4 right-4 w-5 h-5 transition-colors pointer-events-none ${(error === (t.auth.errors?.fillAll || 'Please fill in all mandatory fields') && !store.account.password) || error === (t.auth.errors?.passwordShort || 'Password must be at least 6 characters') ? 'text-red-500' : 'text-white/40 group-focus-within:text-gold-500'}`} />
                    <input
                      type="password"
                      className={`w-full bg-white/5 border rounded-xl px-5 py-4 pr-12 text-white outline-none transition-all placeholder-white/20 ${(error === (t.auth.errors?.fillAll || 'Please fill in all mandatory fields') && !store.account.password) || error === (t.auth.errors?.passwordShort || 'Password must be at least 6 characters') ? 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] focus:border-red-500' : 'border-white/10 focus:border-gold-500 focus:bg-white/10'}`}
                      value={store.account.password}
                      onChange={e => {
                        store.updateAccount('password', e.target.value);
                        if (error) setError(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {store.step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              {otpStep === 'method' ? (
                <OTPMethodSelection
                  email={store.account.email}
                  name={store.account.name}
                  onSelect={(m) => {
                    setOtpMethod(m);
                    setOtpStep('verify');
                  }}
                />
              ) : (
                <OTPVerification
                  email={store.account.email}
                  phone={store.account.phone}
                  method={otpMethod}
                  onVerify={handleVerifyOTP}
                />
              )}
            </motion.div>
          )}

          {/* STEP 3: STORE INFO */}
          {store.step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gold-200 mb-2">{t.auth.vendor.info.storeName}</label>
                <div className="relative group">
                  <Store className={`absolute top-4 right-4 w-5 h-5 transition-colors pointer-events-none ${error === (t.auth.vendor.info.enterDetails || 'Please fill in all mandatory store details') && !store.storeInfo.storeName ? 'text-red-500' : 'text-white/40 group-focus-within:text-gold-500'}`} />
                  <input
                    type="text"
                    className={`w-full bg-white/5 border rounded-xl px-5 py-4 pr-12 text-white outline-none transition-all placeholder-white/20 ${error === (t.auth.vendor.info.enterDetails || 'Please fill in all mandatory store details') && !store.storeInfo.storeName ? 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] focus:border-red-500' : 'border-white/10 focus:border-gold-500 focus:bg-white/10'}`}
                    value={store.storeInfo.storeName}
                    onChange={e => {
                      store.updateStoreInfo('storeName', e.target.value);
                      if (error === (t.auth.vendor.info.enterDetails || 'Please fill in all mandatory store details')) setError(null);
                    }}
                  />
                </div>
              </div>

              {/* New Address Field with GPS */}
              <div>
                <label className="block text-sm font-medium text-gold-200 mb-2">Store Address & Location</label>
                <div className="relative group flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className={`absolute top-4 right-4 w-5 h-5 transition-colors pointer-events-none ${error === (t.auth.vendor.info.enterDetails || 'Please fill in all mandatory store details') && !store.storeInfo.address ? 'text-red-500' : 'text-white/40 group-focus-within:text-gold-500'}`} />
                    <input
                      type="text"
                      className={`w-full bg-white/5 border rounded-xl px-5 py-4 pr-12 text-white outline-none transition-all placeholder-white/20 ${error === (t.auth.vendor.info.enterDetails || 'Please fill in all mandatory store details') && !store.storeInfo.address ? 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] focus:border-red-500' : 'border-white/10 focus:border-gold-500 focus:bg-white/10'}`}
                      placeholder="Enter Address or Click GPS"
                      value={store.storeInfo.address}
                      onChange={e => {
                        store.updateStoreInfo('address', e.target.value);
                        if (error === (t.auth.vendor.info.enterDetails || 'Please fill in all mandatory store details')) setError(null);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGPS}
                    className="px-4 bg-white/10 border border-white/10 rounded-xl hover:bg-gold-500/20 hover:border-gold-500/50 hover:text-gold-400 transition-all flex items-center justify-center text-white/60"
                    title="Use GPS"
                  >
                    <MapPin size={24} />
                  </button>
                </div>
                {store.storeInfo.lat && (
                  <p className="text-xs text-green-400 mt-1 ml-1 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Location Captured: {store.storeInfo.lat.toFixed(4)}, {store.storeInfo.lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gold-200 mb-2">{t.auth.vendor.info.category}</label>
                <select
                  className={`w-full bg-white/5 border rounded-xl px-5 py-4 text-white outline-none transition-all appearance-none cursor-pointer ${error === (t.auth.vendor.info.enterDetails || 'Please fill in all mandatory store details') && !store.storeInfo.category ? 'border-red-500 ring-2 ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] focus:border-red-500' : 'border-white/10 focus:border-gold-500 focus:bg-white/10'}`}
                  value={store.storeInfo.category}
                  onChange={e => {
                    store.updateStoreInfo('category', e.target.value);
                    if (error === (t.auth.vendor.info.enterDetails || 'Please fill in all mandatory store details')) setError(null);
                  }}
                >
                  <option value="" className="bg-[#1A1814]">{t.common?.selectCategory || 'Select...'}</option>
                  <option value="parts" className="bg-[#1A1814]">{t.auth.vendor.info.categories.parts}</option>
                  <option value="accessories" className="bg-[#1A1814]">{t.auth.vendor.info.categories.accessories}</option>
                  <option value="tires" className="bg-[#1A1814]">{t.auth.vendor.info.categories.tires}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gold-200 mb-2">{t.auth.vendor.info.bio}</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-gold-500 focus:bg-white/10 outline-none transition-all placeholder-white/20 resize-none h-32"
                  value={store.storeInfo.bio}
                  onChange={e => store.updateStoreInfo('bio', e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONTRACT (DYNAMIC) */}
          {store.step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 space-y-6"
            >
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6 h-[280px] overflow-y-auto text-sm text-white/80 leading-relaxed scrollbar-thin scrollbar-thumb-gold-500/30 scrollbar-track-transparent">
                <h4 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">{t.auth.vendor.contract.title}</h4>
                <div className="space-y-4 font-light whitespace-pre-wrap">
                  {getDynamicContract()}
                </div>
              </div>

              <div
                onClick={() => store.setContractAgreed(!store.contractAgreed)}
                className={`
                    flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300
                    ${store.contractAgreed
                    ? 'bg-gold-500/10 border-gold-500/50 shadow-[0_0_15px_rgba(168,139,62,0.1)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'}
                `}
              >
                <div className={`
                    w-6 h-6 rounded-md border flex items-center justify-center transition-colors
                    ${store.contractAgreed ? 'bg-gold-500 border-gold-500 text-white' : 'border-white/30 text-transparent'}
                `}>
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm md:text-base">{t.auth.vendor.contract.accept}</span>
                  <span className="text-[10px] md:text-xs text-white/40">{t.auth.contract?.disclaimer}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: DOCUMENTS (5 Required) */}
          {store.step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4"
            >
              <div className="flex flex-col gap-4">
                <div className="text-center mb-2">
                  <h3 className="font-bold text-white">{t.auth.vendor.docs.title}</h3>
                  <p className="text-xs text-white/50">يرجى رفع المستندات الـ 5 المطلوبة لإكمال التسجيل</p>
                </div>

                <div className="space-y-3">
                  {(['cr', 'license', 'id', 'iban', 'authLetter'] as const).map((key) => {
                    const doc = store.documents[key];
                    return (
                      <div key={key} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                        {/* Icon State */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${doc.status === 'completed' || doc.status === 'pending' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                          {doc.status === 'completed' || doc.status === 'pending' ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                        </div>

                        {/* Label & Progress */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-sm text-white truncate">{(t.auth.vendor.docs as any)[key]}</h4>
                            {doc.status === 'uploading' && <span className="text-xs text-gold-400">{doc.progress}%</span>}
                          </div>
                          {doc.status === 'uploading' && (
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div className="h-full bg-gold-500" initial={{ width: 0 }} animate={{ width: `${doc.progress}%` }} />
                            </div>
                          )}
                          {(doc.status === 'completed' || doc.status === 'pending') && <div className="text-[10px] text-green-400">{t.auth.vendor.docs.completed}</div>}
                          {doc.status === 'empty' && <div className="text-[10px] text-white/30">PDF, JPG, PNG</div>}
                        </div>

                        {/* Action */}
                        <div className="shrink-0">
                          {doc.status === 'empty' && (
                            <label className="flex items-center justify-center w-8 h-8 rounded-lg border border-dashed border-white/30 text-white/40 hover:text-gold-400 hover:border-gold-400 cursor-pointer transition-colors">
                              <UploadCloud size={16} />
                              <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(key, e)} />
                            </label>
                          )}
                          {(doc.status === 'completed' || doc.status === 'pending') && (
                            <button
                              onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm justify-center"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIONS */}
      <div className="flex gap-4 pt-6 mt-4 border-t border-white/10">
        {store.step > 1 && (
          <button
            onClick={handlePrev}
            className="w-1/3 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <PrevIcon size={20} />
            {t.auth.vendor.prev}
          </button>
        )}

        {store.step !== 2 && ( // Hide Next button on OTP step
          <button
            onClick={store.step === 5 ? handleSubmit : handleNext}
            disabled={isSubmitting}
            className={`flex-1 py-4 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''} ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>{t.common?.processing || 'Processing...'}</span>
              </>
            ) : (
              <>
                {store.step === 5 ? t.auth.vendor.submit : t.auth.vendor.next}
                {store.step < 5 && <NextIcon size={20} />}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
