import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ShieldCheck, Calendar, Car, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { verificationTasksApi } from '@/services/api/verificationTasks';
import { getCurrentUser } from '../../../utils/auth';

interface VerificationTasksDashboardProps {
  onNavigate?: (path: string, id?: any) => void;
}

export const VerificationTasksDashboard: React.FC<VerificationTasksDashboardProps> = ({ onNavigate }) => {
  const { t, language, dir } = useLanguage();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const role = getCurrentUser()?.role ?? '';
      let data: unknown[] = [];
      if (role === 'VERIFICATION_OFFICER') {
        const res = await verificationTasksApi.getMyTasks();
        data = res.data ?? [];
      } else if (['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(role)) {
        const res = await verificationTasksApi.getAdminQueue();
        data = res.data ?? [];
      }
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch verification tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const isAr = language === 'ar';
  const viewerRole = getCurrentUser()?.role ?? '';
  const isOfficer = viewerRole === 'VERIFICATION_OFFICER';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-[#1A1814] to-transparent p-6 rounded-3xl border border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <ShieldCheck className="text-blue-400" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white">
              {t.admin.verificationTasks || (isAr ? 'مهام المطابقة الميدانية' : 'Verification Tasks')}
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            {isOfficer
              ? isAr
                ? 'إدارة مهام الفحص والمطابقة المسندة إليك'
                : 'Manage your assigned verification and inspection tasks'
              : isAr
                ? 'مهام بانتظار اعتمادك بعد إكمال موظف المطابقة الميدانية'
                : 'Tasks awaiting your approval after field verification'}
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10">
            <ShieldCheck size={48} className="text-white/10 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {isAr ? 'لا توجد مهام في قائمة الانتظار' : 'Nothing in the queue'}
            </h3>
            <p className="text-sm text-white/40">
              {isOfficer
                ? isAr
                  ? 'لم يتم إسناد أي مهام مطابقة إليك بعد.'
                  : 'You have not been assigned any verification tasks yet.'
                : isAr
                  ? 'لا توجد مهام بحالة «بانتظار اعتماد الإدارة» حالياً.'
                  : 'There are no tasks awaiting admin approval right now.'}
            </p>
          </GlassCard>
        ) : (
          tasks.map((task) => (
            <GlassCard 
                key={task.id} 
                className="group relative p-0 overflow-hidden cursor-pointer hover:border-gold-500/30 transition-all duration-300"
                onClick={() => onNavigate && onNavigate('verification-task-details', task.id)}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
              <div className="p-5 pl-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Task Details Info */}
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-gold-400 font-bold tracking-tighter">#{task.order?.orderNumber}</span>
                    <Badge status={task.status} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-white">{task.order?.partName}</h4>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 mt-1">
                    <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                      <Car size={14} className="text-white/30" />
                      <span>{task.order?.vehicleMake} {task.order?.vehicleModel} ({task.order?.vehicleYear})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-white/30" />
                      <span>{new Date(task.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-white/30" />
                      <span>Cycle: {task.cycleNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Call to action arrow */}
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 group-hover:bg-gold-500/20 group-hover:text-gold-400 transition-colors">
                  {dir === 'rtl' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </div>

              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
