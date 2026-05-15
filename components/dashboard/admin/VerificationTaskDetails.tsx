import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ShieldCheck, MapPin, Camera, AlertTriangle, CheckCircle, XCircle, User, Car, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { FileUploader } from '../../ui/FileUploader';
import { verificationTasksApi } from '@/services/api/verificationTasks';
import { getCurrentUser } from '../../../utils/auth';

interface VerificationTaskDetailsProps {
  taskId: string;
  onBack?: () => void;
}

export const VerificationTaskDetails: React.FC<VerificationTaskDetailsProps> = ({ taskId, onBack }) => {
  const { t, language, dir } = useLanguage();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [decision, setDecision] = useState<'MATCHING' | 'NON_MATCHING' | null>(null);
  const [reason, setReason] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const isAr = language === 'ar';

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const { data } = await verificationTasksApi.getTask(taskId);
      setTask(data);

      const role = getCurrentUser()?.role;
      if (data?.order?.id && ['ADMIN', 'SUPER_ADMIN'].includes(role || '')) {
        try {
          const histRes = await verificationTasksApi.getByOrder(data.order.id);
          setHistory((histRes.data || []).filter((t: any) => t.id !== taskId));
        } catch {
          setHistory([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch task details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartVerification = async () => {
    setStarting(true);
    try {
      // 1. Get GPS Location
      let lat = 0, lng = 0;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch (e) {
          console.warn('GPS denied or timeout, proceeding without exact location');
        }
      }

      // 2. Call API
      await verificationTasksApi.start(taskId, {
        lat: lat || undefined,
        lng: lng || undefined,
        deviceInfo: { userAgent: navigator.userAgent },
      });
      fetchTaskDetails();
    } catch (error) {
      console.error('Failed to start verification', error);
    } finally {
      setStarting(false);
    }
  };

  const handleCompleteVerification = async () => {
    if (!decision) return;
    if (decision === 'NON_MATCHING' && !reason.trim()) {
      alert(isAr ? 'يرجى ذكر سبب عدم المطابقة' : 'Please provide a reason for non-matching');
      return;
    }
    if (photos.length === 0) {
      alert(isAr ? 'يرجى رفع صور المطابقة للقطعة الفعلية' : 'Please upload actual part verification photos');
      return;
    }

    setCompleting(true);
    try {
      let lat = 0, lng = 0;
      if (navigator.geolocation) {
         try {
           const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, {timeout: 5000}));
           lat = pos.coords.latitude;
           lng = pos.coords.longitude;
         } catch(e){}
      }

      const toBase64 = (f: File) => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(f);
      });
      const base64Photos = await Promise.all(photos.map(f => toBase64(f)));

      await verificationTasksApi.complete(taskId, {
        decision,
        reason,
        photos: base64Photos,
        lat: lat || undefined,
        lng: lng || undefined,
        deviceInfo: { userAgent: navigator.userAgent },
      });
      fetchTaskDetails();
    } catch (error) {
      console.error('Failed to complete verification', error);
    } finally {
      setCompleting(false);
    }
  };

  if (loading || !task) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  const doc = task.order?.verificationDocuments?.[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
        >
          {dir === 'rtl' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              {isAr ? 'مهمة مطابقة رقم' : 'Verification Task'} <span className="font-mono text-gold-400">#{task.id.split('-')[0].toUpperCase()}</span>
            </h1>
            <Badge status={task.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Order Details & Docs) */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 bg-[#1A1814]/80">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Car size={18} className="text-gold-500" />
              {isAr ? 'بيانات القطعة والسيارة' : 'Part & Vehicle Details'}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{isAr ? 'القطعة المطلوبة' : 'Requested Part'}</span>
                <p className="text-sm font-bold text-white mt-1">{task.order?.partName}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{isAr ? 'السيارة' : 'Vehicle'}</span>
                <p className="text-sm font-bold text-white mt-1">{task.order?.vehicleMake} {task.order?.vehicleModel} ({task.order?.vehicleYear})</p>
              </div>
            </div>
          </GlassCard>

          {/* Customer Parts Info */}
          {task.order?.parts?.map((part: any, idx: number) => (
            <GlassCard key={idx} className="p-6 bg-[#1A1814]/80">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <User size={18} className="text-gold-500" />
                 {isAr ? 'بيانات القطعة من العميل' : 'Customer Part Details'}
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <span className="text-[10px] text-white/40 uppercase tracking-widest">{isAr ? 'الاسم' : 'Name'}</span>
                   <p className="text-sm font-bold text-white mt-1">{part.name}</p>
                 </div>
                 <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <span className="text-[10px] text-white/40 uppercase tracking-widest">{isAr ? 'الوصف' : 'Description'}</span>
                   <p className="text-sm font-bold text-white mt-1">{part.description || 'N/A'}</p>
                 </div>
               </div>
               {part.images?.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {part.images.map((img: string, i: number) => (
                       <div key={i} className="aspect-square rounded-xl bg-black/40 overflow-hidden border border-white/10">
                          <img src={img} alt="Customer Part" className="w-full h-full object-cover" />
                       </div>
                    ))}
                  </div>
               )}
            </GlassCard>
          ))}

          {/* Verification Documents */}
          <GlassCard className="p-6 bg-[#1A1814]/80">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Camera size={18} className="text-gold-500" />
              {isAr ? 'مستندات التوثيق من المتجر' : 'Store Verification Documents'}
            </h3>

            {doc ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(doc.images as string[]).map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-black/40 border border-white/10 overflow-hidden cursor-pointer hover:border-gold-500/50 transition-colors">
                      <img src={img} alt="Part" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                {doc.videoUrl && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-200 text-sm flex items-center gap-2">
                    <Camera size={16} />
                    {isAr ? 'يوجد فيديو مرفق يمكن مراجعته' : 'Video attachment available'}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 text-white/30 border border-dashed border-white/10 rounded-xl">
                {isAr ? 'لا توجد مستندات مرفوعة' : 'No documents uploaded'}
              </div>
            )}
          </GlassCard>

          {/* History Cycles */}
          {history.length > 0 && (
             <GlassCard className="p-6 bg-red-500/5 border-red-500/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  {isAr ? 'سجلات الفحص السابقة (مرفوضة)' : 'Previous Inspection Records (Rejected)'}
                </h3>
                <div className="space-y-4">
                   {history.map((h: any, i: number) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-white/60">Cycle {h.cycleNumber}</span>
                            <span className="text-xs text-red-400">{new Date(h.createdAt).toLocaleDateString()}</span>
                         </div>
                         <p className="text-sm text-white mb-3">
                            <span className="text-white/40">{isAr ? 'السبب:' : 'Reason:'} </span>
                            {h.decisionReason || 'N/A'}
                         </p>
                         {h.officerPhotos?.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                               {h.officerPhotos.map((img: string, idx: number) => (
                                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-black/40">
                                     <img src={img} alt="Reject" className="w-full h-full object-cover" />
                                  </div>
                               ))}
                            </div>
                         )}
                      </div>
                   ))}
                </div>
             </GlassCard>
          )}
        </div>

        {/* Action Panel Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-gold-500/20 bg-gradient-to-b from-gold-500/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 blur-3xl rounded-full" />

            <h3 className="text-lg font-bold text-white mb-4 relative z-10 flex items-center gap-2">
              <ShieldCheck size={18} className="text-gold-500" />
              {isAr ? 'إجراءات المطابقة' : 'Verification Actions'}
            </h3>

            <div className="relative z-10 space-y-4">
              {task.status === 'ASSIGNED' || task.status === 'LINK_SENT' ? (
                <div className="space-y-4">
                  <p className="text-sm text-white/60">
                    {isAr ? 'يجب بدء المطابقة لتسجيل الموقع (GPS) والوقت الفعلي.' : 'Start verification to record GPS and timestamp.'}
                  </p>
                  <button
                    onClick={handleStartVerification}
                    disabled={starting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {starting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <MapPin size={18} />
                        {isAr ? 'بدء الفحص الميداني' : 'Start Field Inspection'}
                      </>
                    )}
                  </button>
                </div>
              ) : task.status === 'IN_PROGRESS' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-xs text-blue-300 font-bold flex items-center gap-2 mb-1">
                      <Clock size={14} />
                      {isAr ? 'الفحص قيد التنفيذ' : 'Inspection in progress'}
                    </p>
                    <p className="text-[10px] text-blue-200/60 font-mono">
                      Started: {new Date(task.startedAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDecision('MATCHING')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${decision === 'MATCHING' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20'
                        }`}
                    >
                      <CheckCircle size={24} />
                      <span className="text-xs font-bold">{isAr ? 'القطعة مطابقة' : 'Matching'}</span>
                    </button>
                    <button
                      onClick={() => setDecision('NON_MATCHING')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${decision === 'NON_MATCHING' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20'
                        }`}
                    >
                      <XCircle size={24} />
                      <span className="text-xs font-bold">{isAr ? 'غير مطابقة' : 'Not Matching'}</span>
                    </button>
                  </div>

                  {decision === 'NON_MATCHING' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={isAr ? 'الرجاء توضيح سبب الرفض/عدم المطابقة بالتفصيل...' : 'Explain non-matching reason...'}
                        className="w-full bg-black/40 border border-red-500/30 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500 min-h-[100px]"
                      />
                    </motion.div>
                  )}

                  <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-xs font-bold text-white mb-2">
                       {isAr ? 'إرفاق صور المطابقة الفعلية' : 'Attach Field Verification Photos'}
                       <span className="text-red-400">*</span>
                    </p>
                    <FileUploader onFilesSelected={setPhotos} maxFiles={4} accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }} />
                  </div>

                  <button
                    onClick={handleCompleteVerification}
                    disabled={!decision || photos.length === 0 || completing}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${decision && photos.length > 0
                      ? 'bg-gold-500 text-black hover:bg-gold-400 shadow-lg shadow-gold-500/20'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                      }`}
                  >
                    {completing ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      isAr ? 'إنهاء الاعتماد' : 'Complete Verification'
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 ${['COMPLETED_MATCH', 'AWAITING_ADMIN_APPROVAL'].includes(task.status) || task.decision === 'MATCHING' ? 'bg-green-500/20 text-green-500' :
                    ['COMPLETED_NON_MATCH', 'AWAITING_CORRECTION'].includes(task.status) || task.decision === 'NON_MATCHING' ? 'bg-red-500/20 text-red-500' :
                      'bg-white/10 text-white/40'
                    }`}>
                    {['COMPLETED_MATCH', 'AWAITING_ADMIN_APPROVAL'].includes(task.status) || task.decision === 'MATCHING' ? <CheckCircle size={24} /> :
                      ['COMPLETED_NON_MATCH', 'AWAITING_CORRECTION'].includes(task.status) || task.decision === 'NON_MATCHING' ? <XCircle size={24} /> :
                        <ShieldCheck size={24} />}
                  </div>
                  <h4 className="font-bold text-white mb-1">
                    {task.status === 'AWAITING_ADMIN_APPROVAL'
                      ? (isAr ? 'تمت المطابقة — بانتظار اعتماد الإدارة' : 'Matched — awaiting admin approval')
                      : task.status === 'AWAITING_CORRECTION'
                        ? (isAr ? 'غير مطابق — فترة تصحيح 48 ساعة' : 'Non-matching — 48h correction')
                        : task.status === 'COMPLETED_MATCH' || task.decision === 'MATCHING'
                          ? (isAr ? 'تمت المطابقة بنجاح' : 'Matched Successfully')
                          : task.status === 'COMPLETED_NON_MATCH' || task.decision === 'NON_MATCHING'
                            ? (isAr ? 'القطعة غير مطابقة' : 'Not Matching')
                            : task.status}
                  </h4>
                  {task.reportUrl && (
                    <a href={task.reportUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-400 underline mt-2 inline-block">
                      {isAr ? 'عرض تقرير المطابقة' : 'View verification report'}
                    </a>
                  )}
                  {task.decisionReason && (
                    <p className="text-xs text-red-300/80 mt-2 p-2 bg-red-500/10 rounded-lg text-left" dir="auto">
                      "{task.decisionReason}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
