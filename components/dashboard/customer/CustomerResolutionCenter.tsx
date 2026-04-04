import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, 
  RotateCcw, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  Clock, 
  Filter, 
  CheckCircle2, 
  MessageSquare,
  ArrowUpRight,
  Loader2,
  Package,
  ShieldCheck,
  History,
  X,
  Plus,
  ShieldAlert,
  Wallet,
  Zap
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { useResolutionStore } from '../../../stores/useResolutionStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { useOrderStore, Order } from '../../../stores/useOrderStore';
import { OrderSelectionModal } from './OrderSelectionModal';
import { ReturnRequestModal } from '../resolution/ReturnRequestModal';
import { DisputeModal } from '../resolution/DisputeModal';

interface CustomerResolutionCenterProps {
  onNavigate?: (path: string, id?: any) => void;
}

export const CustomerResolutionCenter: React.FC<CustomerResolutionCenterProps> = ({ onNavigate }) => {
  const { 
    cases, 
    isLoading, 
    fetchUserRequests, 
    subscribeToCases, 
    unsubscribeFromCases 
  } = useResolutionStore();
  
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'resolved'>('all');

  // Modal States
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    (window as any).currentViewRole = 'customer';
    fetchUserRequests();
    subscribeToCases('customer');

    return () => {
      unsubscribeFromCases();
    };
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         String(c.orderId).toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.partName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'active' ? (c.status !== 'RESOLVED' && c.status !== 'REFUNDED') :
      activeTab === 'resolved' ? (c.status === 'RESOLVED' || c.status === 'REFUNDED') : true;

    return matchesSearch && matchesTab;
  });

  const handleCaseClick = (caseId: string) => {
    if (onNavigate) {
      onNavigate('dispute-details', caseId);
    }
  };

  const handleSelectOrder = (order: Order, type: 'return' | 'dispute') => {
    setSelectedOrder(order);
    setIsOrderModalOpen(false);
    if (type === 'return') {
      setIsReturnModalOpen(true);
    } else {
      setIsDisputeModalOpen(true);
    }
  };

  const stats = [
    {
      title: isAr ? 'نزاعات نشطة' : 'Active Disputes',
      value: cases.filter(c => c.status !== 'RESOLVED' && c.status !== 'REFUNDED').length,
      icon: ShieldAlert,
      color: 'gold',
      trend: isAr ? 'محمي بـ Escrow' : 'Escrow Protected'
    },
    {
      title: isAr ? 'إجمالي المسترد' : 'Total Recovered',
      value: cases.filter(c => c.status === 'REFUNDED').length,
      icon: Wallet,
      color: 'green',
      trend: isAr ? 'إلى محفظتك' : 'To your wallet'
    },
    {
      title: isAr ? 'حالات مغلقة' : 'Cases Resolved',
      value: cases.filter(c => c.status === 'RESOLVED').length,
      icon: CheckCircle2,
      color: 'cyan',
      trend: isAr ? 'نجاح التسوية' : 'Settlement success'
    }
  ];

  return (
    <div className="space-y-10 pb-20 overflow-x-hidden">
      {/* 2026 Cinematic Header */}
      <div className="relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="gold" className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-gold-500/10 text-gold-400 border-gold-500/20">
                {isAr ? 'بروتوكول حماية المشتري' : 'Buyer Protection Protocol'}
              </Badge>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Realtime Active</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase leading-[0.9]">
              {t.dashboard.resolution.subtitle}
            </h1>
            <p className="text-white/40 text-sm md:text-lg max-w-2xl font-medium leading-relaxed">
              {t.dashboard.support.subtitle}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4"
          >
            <Button 
              onClick={() => setIsOrderModalOpen(true)}
              className="px-8 py-4 bg-gold-500 text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.2)] active:scale-95 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              {t.dashboard.resolution.initiate.title}
            </Button>
          </motion.div>
        </div>

        {/* Decorative background pulse */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Grid Stats - Luxury Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard className="p-8 relative group overflow-hidden border-white/5 hover:border-white/10 transition-all duration-500">
              <div className={`absolute -right-4 -top-4 w-32 h-32 bg-${stat.color}-500/5 blur-[40px] rounded-full group-hover:bg-opacity-10 transition-all`} />
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110
                  ${stat.color === 'gold' ? 'bg-gold-500/10 text-gold-400 border-gold-500/20 shadow-lg shadow-gold-500/5' : 
                    stat.color === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-lg shadow-green-500/5' : 
                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-lg shadow-cyan-500/5'}`}>
                  <stat.icon size={28} />
                </div>
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{stat.trend}</div>
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
                <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">{stat.title}</div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main List Interface */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/5">
            {(['all', 'active', 'resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-500
                  ${activeTab === tab 
                    ? 'bg-white text-black shadow-2xl' 
                    : 'text-white/30 hover:text-white hover:bg-white/5'}`}
              >
                {tab === 'all' ? (isAr ? 'عرض الحالات' : 'Holistic Audit') : 
                 tab === 'active' ? (isAr ? 'حالات نشطة' : 'Active Stream') : 
                 (isAr ? 'الأرشيف' : 'Case Archive')}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-80 group">
              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} text-white/20 group-focus-within:text-gold-500 transition-colors`} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.dashboard.orders.searchPlaceholder}
                className={`bg-white/5 border border-white/5 rounded-2xl ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 text-xs text-white outline-none w-full focus:border-gold-500/30 focus:bg-white/10 transition-all shadow-inner`}
              />
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="py-40 flex flex-col items-center justify-center space-y-6">
                <Loader2 className="animate-spin text-gold-500" size={50} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Syncing Cases...</span>
              </div>
            ) : filteredCases.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-40 flex flex-col items-center justify-center text-center px-4 space-y-6 bg-white/[0.02] border border-dashed border-white/5 rounded-[40px]"
              >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
                  <History size={40} className="text-white/10" strokeWidth={1} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">{isAr ? 'لا توجد سجلات' : 'No Records Found'}</h3>
                  <p className="text-white/30 text-xs font-bold uppercase tracking-widest">{isAr ? 'سجلك نظيف تماماً' : 'Your resolution history is clear'}</p>
                </div>
              </motion.div>
            ) : (
              filteredCases.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleCaseClick(item.id)}
                  className="group relative"
                >
                  <GlassCard className="p-8 hover:bg-white/[0.03] active:bg-white/[0.05] transition-all cursor-pointer border-white/5 group-hover:border-gold-500/20 group-hover:translate-x-1.5 duration-500">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                      {/* Left: Case ID & Title */}
                      <div className="flex items-center gap-8">
                         <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all duration-700
                            ${item.type === 'dispute' ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.1)]'}
                            group-hover:rotate-6 group-hover:scale-110 shadow-xl`}>
                           {item.type === 'dispute' ? <Scale size={32} /> : <RotateCcw size={32} />}
                         </div>
                         <div className="space-y-2">
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-black text-gold-500/80 tracking-widest uppercase">#{item.id}</span>
                               <span className="text-[10px] font-black text-white/20 tracking-[0.2em] uppercase">
                                 {new Date(item.createdAt).toLocaleDateString()}
                               </span>
                            </div>
                            <h3 className="text-2xl font-black text-white group-hover:text-gold-400 transition-colors uppercase tracking-tight leading-none">
                              {item.partName}
                            </h3>
                            <div className="flex items-center gap-6 text-[10px] font-black text-white/30 uppercase tracking-widest">
                               <span className="flex items-center gap-2 pr-4 border-r border-white/5"><Package size={14} className="text-gold-500" /> {item.merchantName}</span>
                               <span className="flex items-center gap-2"><Zap size={14} className="text-cyan-500" /> Order #{item.orderId}</span>
                            </div>
                         </div>
                      </div>

                      {/* Right: Visual Status Stream */}
                      <div className="flex items-center gap-12 w-full lg:w-auto justify-between lg:justify-end">
                         <div className="flex flex-col items-end gap-3 flex-1 lg:flex-none">
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                               <span className="text-[10px] font-black uppercase text-white/60 tracking-[0.2em]">
                                  {t.dashboard.resolution.statusTimeline?.[item.status.toLowerCase()] || item.status}
                               </span>
                            </div>
                            <div className="w-full lg:w-48 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: item.status === 'RESOLVED' || item.status === 'REFUNDED' ? '100%' : '55%' }}
                                 className={`h-full rounded-full ${item.status === 'RESOLVED' || item.status === 'REFUNDED' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.5)]'}`}
                               />
                            </div>
                            
                            {/* GAP 2: Handover Countdown Display */}
                            {item.status === 'APPROVED' && item.type === 'return' && item.handoverDeadline && (
                               <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse">
                                  <Clock size={12} className="text-red-400" />
                                  <span className="text-[9px] font-black uppercase text-red-400 tracking-widest">
                                    {(() => {
                                      const deadline = new Date(item.handoverDeadline);
                                      const now = new Date();
                                      const diff = deadline.getTime() - now.getTime();
                                      if (diff <= 0) return isAr ? 'انتهت المهلة' : 'Deadline Expired';
                                      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                      return isAr 
                                        ? `متبقي ${days} يوم و ${hours} ساعة للتسليم` 
                                        : `${days}d ${hours}h left to handover`;
                                    })()}
                                  </span>
                               </div>
                            )}

                            <div className="hidden lg:block text-[8px] font-black text-white/20 tracking-wider uppercase">Latency: Realtime Active</div>
                         </div>
                         
                         <div className="p-4 bg-white/5 rounded-2xl text-white/20 group-hover:text-gold-500 group-hover:bg-gold-500/10 transition-all border border-transparent group-hover:border-gold-500/20">
                            <ArrowIcon size={24} className="group-hover:translate-x-1 transition-all" />
                         </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Escrow Protection Badge - Cinematic */}
      <GlassCard className="p-10 bg-cyan-500/[0.03] border-cyan-500/20 relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
         <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-8">
               <div className="w-20 h-20 bg-cyan-500/10 rounded-[30px] flex items-center justify-center text-cyan-400 border-2 border-cyan-500/20 shadow-2xl group-hover:rotate-[360deg] transition-transform duration-1000">
                  <ShieldCheck size={40} />
               </div>
               <div>
                  <h4 className="text-2xl font-black text-white tracking-tight leading-none mb-2">{t.dashboard.support.title}</h4>
                  <p className="text-white/40 text-sm max-w-md font-bold uppercase tracking-wider">{t.dashboard.support.liveChatDesc}</p>
               </div>
            </div>
            <div className="flex gap-4">
               <button 
                onClick={() => onNavigate?.('support')}
                className="bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all px-10 py-4 rounded-[20px] font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 duration-300">
                {isAr ? 'بدء محادثة خبير' : 'Initiate Expert Chat'}
              </button>
            </div>
         </div>
         
         {/* Grid decorative overlay */}
         <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </GlassCard>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212, 175, 55, 0.3); }
      `}</style>

      {/* Modals */}
      <OrderSelectionModal 
         isOpen={isOrderModalOpen}
         onClose={() => setIsOrderModalOpen(false)}
         onSelect={handleSelectOrder}
      />

      {selectedOrder && (
        <>
          <ReturnRequestModal 
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            orderId={selectedOrder.id}
            merchantName={selectedOrder.merchantName || 'Store'}
            partName={selectedOrder.part}
            onSuccess={() => {
               setIsReturnModalOpen(false);
               fetchUserRequests();
            }}
          />
          <DisputeModal 
            isOpen={isDisputeModalOpen}
            onClose={() => setIsDisputeModalOpen(false)}
            orderId={selectedOrder.id}
            merchantName={selectedOrder.merchantName || 'Store'}
            partName={selectedOrder.part}
            onSuccess={() => {
               setIsDisputeModalOpen(false);
               fetchUserRequests();
            }}
          />
        </>
      )}
    </div>
  );
};
