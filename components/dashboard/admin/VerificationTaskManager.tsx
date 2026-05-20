import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import {
  ShieldCheck,
  Link as LinkIcon,
  QrCode,
  Copy,
  CheckCircle,
  Clock,
  UserPlus,
  Loader2,
  Download,
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { verificationTasksApi } from '@/services/api/verificationTasks';
import { supabase } from '../../../services/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import { VERIFICATION_TASK_STATUS_LABEL, taskHasFieldOfficerReport } from './verification/verificationTaskHelpers';
import { FieldVerificationReportPanel } from './verification/FieldVerificationReportPanel';

interface VerificationTaskManagerProps {
  orderId: string;
}

function buildQrImageUrl(targetUrl: string, size = 180) {
  return `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(targetUrl)}&choe=UTF-8`;
}

function applyTasksToState(
  data: any[],
  setTasks: React.Dispatch<React.SetStateAction<any[]>>,
  setActiveToken: React.Dispatch<React.SetStateAction<string | null>>,
  setQrCodeData: React.Dispatch<React.SetStateAction<string | null>>,
) {
  setTasks(data);
  const activeLink = data[0]?.links?.find((l: any) => l.isActive);
  if (activeLink?.token) {
    setActiveToken(activeLink.token);
    setQrCodeData(activeLink.qrCodeData || `vlink:${activeLink.token}`);
  }
}

export const VerificationTaskManager: React.FC<VerificationTaskManagerProps> = ({ orderId }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [tasks, setTasks] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [copying, setCopying] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState(24);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrImgError, setQrImgError] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [openingReportTaskId, setOpeningReportTaskId] = useState<string | null>(null);

  const fetchInFlight = useRef(false);
  const mountedRef = useRef(true);
  const latestTaskRef = useRef<any>(null);
  const hasLoadedOnceRef = useRef(false);

  const fetchTasks = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (fetchInFlight.current) return;
      fetchInFlight.current = true;
      const silent = opts?.silent ?? false;

      if (!hasLoadedOnceRef.current && !silent) {
        setInitialLoading(true);
      } else if (hasLoadedOnceRef.current) {
        setRefreshing(true);
      }

      try {
        const { data } = await verificationTasksApi.getByOrder(orderId);
        if (!mountedRef.current) return;
        applyTasksToState(data, setTasks, setActiveToken, setQrCodeData);
        hasLoadedOnceRef.current = true;
      } catch (err) {
        console.error(err);
      } finally {
        fetchInFlight.current = false;
        if (mountedRef.current) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    },
    [orderId],
  );

  const latestTask = tasks[0];
  latestTaskRef.current = latestTask;

  const previousReportTasks = useMemo(
    () => tasks.slice(1).filter((t) => taskHasFieldOfficerReport(t)),
    [tasks],
  );

  const latestReportVariant = useMemo(() => {
    if (!latestTask) return null;
    if (!taskHasFieldOfficerReport(latestTask)) return null;
    if (['AWAITING_ADMIN_APPROVAL', 'AWAITING_CORRECTION'].includes(latestTask.status)) {
      return 'pending' as const;
    }
    return 'current' as const;
  }, [latestTask]);

  useEffect(() => {
    mountedRef.current = true;
    setInitialLoading(true);
    fetchTasks({ silent: true });
    verificationTasksApi.listOfficers().then((r) => {
      if (mountedRef.current) setOfficers(r.data);
    }).catch(() => {});

    const channel = supabase
      .channel(`verification-tasks:order:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verification_tasks',
          filter: `order_id=eq.${orderId}`,
        },
        () => {
          fetchTasks({ silent: true });
        },
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [orderId, fetchTasks]);

  const url = activeToken ? `${window.location.origin}/verify/${activeToken}` : '';
  const reportBusy = openingReportTaskId !== null;
  const isBusy = assigning || generating || refreshing || copying || reportBusy;

  const qrImageSrc = useMemo(() => {
    if (!url) return '';
    if (qrImgError) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;
    }
    return buildQrImageUrl(url);
  }, [url, qrImgError]);

  const flashMessage = (msg: string) => {
    setActionMessage(msg);
    window.setTimeout(() => setActionMessage(null), 2500);
  };

  const handleCreateOrAssign = async () => {
    setAssigning(true);
    setActionMessage(null);
    try {
      const officerId = selectedOfficerId || latestTask?.officerId || undefined;
      await verificationTasksApi.assignTask(orderId, officerId);
      await fetchTasks({ silent: true });
      flashMessage(isAr ? 'تم تحديث الإسناد' : 'Assignment updated');
    } catch (err) {
      console.error(err);
      flashMessage(isAr ? 'فشل الإسناد' : 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleGenerateLink = async (taskId: string) => {
    setGenerating(true);
    setQrImgError(false);
    setActionMessage(null);
    try {
      const { data } = await verificationTasksApi.generateLink(taskId, durationHours);
      setActiveToken(data.token);
      setQrCodeData(data.qrCodeData || `vlink:${data.token}`);
      await fetchTasks({ silent: true });
      flashMessage(isAr ? 'تم إنشاء الرابط والـ QR' : 'Link & QR generated');
    } catch (err) {
      console.error(err);
      flashMessage(isAr ? 'فشل إنشاء الرابط' : 'Failed to generate link');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!url) return;
    setCopying(true);
    try {
      // Modern API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      flashMessage(isAr ? 'تم نسخ الرابط بنجاح' : 'Link copied successfully');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
      flashMessage(isAr ? 'فشل نسخ الرابط' : 'Failed to copy link');
    } finally {
      setCopying(false);
    }
  };

  const openFieldReport = async (taskId: string) => {
    if (!taskId) return;
    setOpeningReportTaskId(taskId);
    try {
      const res = await verificationTasksApi.getReportBlob(taskId);
      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch (err) {
      console.error(err);
      flashMessage(isAr ? 'تعذر فتح التقرير' : 'Could not open report');
    } finally {
      setOpeningReportTaskId(null);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `verification-qr-${orderId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    flashMessage(isAr ? 'تم تحميل الكود بنجاح' : 'QR downloaded successfully');
  };

  if (initialLoading) {
    return (
      <GlassCard className="p-6 bg-[#1A1814]/80 border-gold-500/20 mt-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/10" />
          <div className="h-5 w-48 bg-white/10 rounded" />
        </div>
        <div className="h-24 bg-white/5 rounded-xl" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 bg-[#1A1814]/80 border-gold-500/20 relative overflow-hidden mt-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 blur-3xl rounded-full" />

      {refreshing && (
        <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex items-center justify-center rounded-2xl pointer-events-none">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
        </div>
      )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck size={20} className="text-gold-500" />
          {isAr ? 'إدارة مهام المطابقة الميدانية' : 'Field Verification Task'}
        </h3>
        <div className="flex items-center gap-2">
          {latestTask && (
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                latestTask.status === 'AWAITING_ADMIN_APPROVAL'
                  ? 'bg-amber-500/20 text-amber-300'
                  : latestTask.decision === 'MATCHING' ||
                      latestTask.status === 'COMPLETED_MATCH' ||
                      latestTask.status === 'ADMIN_APPROVED'
                  ? 'bg-green-500/20 text-green-400'
                  : latestTask.decision === 'NON_MATCHING' ||
                      latestTask.status === 'COMPLETED_NON_MATCH' ||
                      latestTask.status === 'ADMIN_REJECTED'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {isAr 
                ? (VERIFICATION_TASK_STATUS_LABEL[latestTask.status]?.ar || latestTask.status) 
                : (VERIFICATION_TASK_STATUS_LABEL[latestTask.status]?.en || latestTask.status)}
            </span>
          )}
        </div>
      </div>

      {actionMessage && (
        <p className="text-xs text-gold-300 mb-3 relative z-10 animate-in fade-in">{actionMessage}</p>
      )}

      {previousReportTasks.length > 0 && (
        <div className="relative z-10 space-y-4 mb-4">
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
            {isAr ? 'دورات مطابقة سابقة لهذا الطلب' : 'Previous verification cycles for this order'}
          </p>
          {previousReportTasks.map((t) => (
            <FieldVerificationReportPanel
              key={t.id}
              task={t}
              isAr={isAr}
              variant="previous"
              openingReportTaskId={openingReportTaskId}
              reportBusy={reportBusy}
              onOpenReport={(id) => void openFieldReport(id)}
            />
          ))}
        </div>
      )}

      {latestTask && latestReportVariant === 'pending' && (
        <FieldVerificationReportPanel
          task={latestTask}
          isAr={isAr}
          variant="pending"
          openingReportTaskId={openingReportTaskId}
          reportBusy={reportBusy}
          onOpenReport={(id) => void openFieldReport(id)}
        />
      )}

      {latestTask && latestReportVariant === 'current' && (
        <FieldVerificationReportPanel
          task={latestTask}
          isAr={isAr}
          variant="current"
          openingReportTaskId={openingReportTaskId}
          reportBusy={reportBusy}
          onOpenReport={(id) => void openFieldReport(id)}
        />
      )}

      <div className={`relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${refreshing ? 'opacity-70' : ''}`}>
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            {isAr
              ? 'بإمكانك تفويض موظف مطابقة ميداني لفحص القطعة. قم بإنشاء رابط مؤقت أو QR Code (يتطلب تسجيل دخول + OTP).'
              : 'Delegate a field officer. Generate a temporary link or QR (login + OTP required).'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 uppercase font-bold mb-1 block">
                {isAr ? 'موظف المطابقة' : 'Verification officer'}
              </label>
              <select
                value={selectedOfficerId || latestTask?.officerId || ''}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                disabled={isBusy}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                <option value="">{isAr ? '— اختر موظف —' : '— Select officer —'}</option>
                {officers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name || o.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase font-bold mb-1 block">
                {isAr ? 'مدة الرابط (ساعة)' : 'Link duration (hours)'}
              </label>
              <input
                type="number"
                min={1}
                max={168}
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value) || 24)}
                disabled={isBusy}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateOrAssign}
            disabled={isBusy}
            className="w-full py-2.5 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 rounded-xl text-gold-300 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
          >
            {assigning ? (
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            ) : (
              <UserPlus size={16} className="shrink-0" />
            )}
            <span>
              {assigning
                ? isAr
                  ? 'جاري الإسناد...'
                  : 'Assigning...'
                : latestTask
                  ? isAr
                    ? 'تحديث إسناد الموظف'
                    : 'Update assignment'
                  : isAr
                    ? 'إنشاء مهمة مطابقة'
                    : 'Create verification task'}
            </span>
          </button>

          {latestTask && (
            <button
              type="button"
              onClick={() => handleGenerateLink(latestTask.id)}
              disabled={isBusy}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
            >
              {generating ? (
                <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              ) : (
                <LinkIcon size={18} className="shrink-0" />
              )}
              <span>
                {generating
                  ? isAr
                    ? 'جاري إنشاء الرابط...'
                    : 'Generating link...'
                  : isAr
                    ? `إنشاء رابط و QR (${durationHours}س)`
                    : `Generate link & QR (${durationHours}h)`}
              </span>
            </button>
          )}

          {activeToken && url && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-xs text-blue-200 mb-2 font-bold flex items-center gap-2">
                <Clock size={14} />
                {isAr ? 'رابط نشط للاستخدام' : 'Active link ready'}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={url}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={copying}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shrink-0 disabled:opacity-60 min-w-[40px] flex items-center justify-center"
                >
                  {copying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : copied ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {activeToken && url && (
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-xl border border-gold-500/10 group/qr">
            <div className="relative mb-4 bg-white p-2 rounded-xl shadow-inner">
              {generating ? (
                <div className="w-[180px] h-[180px] flex items-center justify-center bg-black/5 rounded-lg">
                  <Loader2 className="w-10 h-10 text-gold-600 animate-spin" />
                </div>
              ) : (
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={url}
                  size={180}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/logo.png", // Attempt to include brand logo if exists
                    x: undefined,
                    y: undefined,
                    height: 30,
                    width: 30,
                    excavate: true,
                  }}
                />
              )}
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest text-center flex items-center justify-center gap-1">
                <QrCode size={12} />
                {isAr ? 'امسح الكود للوصول' : 'Scan to access'}
              </p>
              
              <button
                type="button"
                onClick={downloadQRCode}
                className="w-full mt-2 py-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-gold-600/20 transition-all active:scale-95"
              >
                <Download size={14} />
                {isAr ? 'تنزيل الكود (PNG)' : 'Download QR (PNG)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
