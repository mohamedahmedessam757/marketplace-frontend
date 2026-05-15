import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { ShieldCheck, Link as LinkIcon, QrCode, Copy, CheckCircle, Clock, UserPlus } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { verificationTasksApi } from '@/services/api/verificationTasks';

interface VerificationTaskManagerProps {
  orderId: string;
}

function buildQrImageUrl(targetUrl: string, size = 180) {
  return `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(targetUrl)}&choe=UTF-8`;
}

export const VerificationTaskManager: React.FC<VerificationTaskManagerProps> = ({ orderId }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [tasks, setTasks] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState(24);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrImgError, setQrImgError] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await verificationTasksApi.getByOrder(orderId);
      setTasks(data);
      const activeLink = data[0]?.links?.find((l: any) => l.isActive);
      if (activeLink?.token) {
        setActiveToken(activeLink.token);
        setQrCodeData(activeLink.qrCodeData || `vlink:${activeLink.token}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    verificationTasksApi.listOfficers().then((r) => setOfficers(r.data)).catch(() => {});
  }, [orderId]);

  const latestTask = tasks[0];
  const url = activeToken ? `${window.location.origin}/verify/${activeToken}` : '';

  const qrImageSrc = useMemo(() => {
    if (!url) return '';
    if (qrImgError) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;
    }
    return buildQrImageUrl(url);
  }, [url, qrImgError]);

  const handleCreateOrAssign = async () => {
    try {
      setAssigning(true);
      const officerId = selectedOfficerId || latestTask?.officerId || undefined;
      await verificationTasksApi.assignTask(orderId, officerId);
      await fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const handleGenerateLink = async (taskId: string) => {
    try {
      setGenerating(true);
      setQrImgError(false);
      const { data } = await verificationTasksApi.generateLink(taskId, durationHours);
      setActiveToken(data.token);
      setQrCodeData(data.qrCodeData || `vlink:${data.token}`);
      await fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return null;

  return (
    <GlassCard className="p-6 bg-[#1A1814]/80 border-gold-500/20 relative overflow-hidden mt-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 blur-3xl rounded-full" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck size={20} className="text-gold-500" />
          {isAr ? 'إدارة مهام المطابقة الميدانية' : 'Field Verification Task'}
        </h3>
        {latestTask && (
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              latestTask.status === 'COMPLETED_MATCH' || latestTask.decision === 'MATCHING'
                ? 'bg-green-500/20 text-green-400'
                : latestTask.status === 'COMPLETED_NON_MATCH' || latestTask.decision === 'NON_MATCHING'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {latestTask.status}
          </span>
        )}
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            {isAr
              ? 'بإمكانك تفويض موظف مطابقة ميداني لفحص القطعة. قم بإنشاء رابط مؤقت أو QR Code لإعطائه صلاحية الوصول (يتطلب تسجيل دخول + OTP).'
              : 'Delegate a field officer to inspect the part. Generate a temporary link or QR code (requires login + OTP).'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 uppercase font-bold mb-1 block">
                {isAr ? 'موظف المطابقة' : 'Verification officer'}
              </label>
              <select
                value={selectedOfficerId || latestTask?.officerId || ''}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
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
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateOrAssign}
            disabled={assigning}
            className="w-full py-2.5 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 rounded-xl text-gold-300 font-bold text-sm flex items-center justify-center gap-2"
          >
            <UserPlus size={16} />
            {latestTask
              ? isAr
                ? 'تحديث إسناد الموظف'
                : 'Update officer assignment'
              : isAr
                ? 'إنشاء مهمة مطابقة'
                : 'Create verification task'}
          </button>

          {latestTask && (
            <button
              type="button"
              onClick={() => handleGenerateLink(latestTask.id)}
              disabled={generating}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
            >
              {generating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LinkIcon size={18} />
                  {isAr ? `إنشاء رابط و QR (${durationHours}س)` : `Generate link & QR (${durationHours}h)`}
                </>
              )}
            </button>
          )}

          {activeToken && url && (
            <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
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
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shrink-0"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
              {qrCodeData && (
                <p className="text-[10px] text-white/30 mt-2 font-mono truncate" title={qrCodeData}>
                  {qrCodeData}
                </p>
              )}
            </div>
          )}
        </div>

        {activeToken && url && (
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl animate-in zoom-in">
            <img
              src={qrImageSrc}
              alt="QR Code"
              width={180}
              height={180}
              className="mb-3 rounded"
              onError={() => setQrImgError(true)}
            />
            <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest text-center flex items-center gap-1">
              <QrCode size={12} />
              {isAr ? 'امسح الكود للوصول' : 'Scan to access'}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
