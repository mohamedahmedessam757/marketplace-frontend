
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Home, Package, PlusCircle, MessageSquare, User, Bell, LogOut, Menu, Scale, Info, ChevronDown, Search, Wallet, Grid, Users, ShieldAlert, BarChart3, Settings, ShoppingBag, ListChecks, Truck, FileText, BadgeDollarSign, Store, Star, Database, Headset, ShieldCheck, Lock, CreditCard, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { useVendorStore } from '../../stores/useVendorStore';
import { useAdminStore } from '../../stores/useAdminStore';
import { useOrderStore } from '../../stores/useOrderStore'; // Added Import
import { NotificationDrawer } from './notifications/NotificationDrawer';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  onLogout: () => void;
  currentPath?: string;
  onNavigate: (path: string, id?: number) => void;
  role: 'customer' | 'merchant' | 'admin';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  onLogout,
  currentPath = 'home',
  onNavigate,
  role
}) => {
  const { t, language } = useLanguage();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { unreadCount, fetchNotifications } = useNotificationStore(); // Added fetchNotifications
  const { checkLicenseStatus, vendorStatus } = useVendorStore();
  const { currentAdmin } = useAdminStore();
  const { startPolling, stopPolling, fetchOrders } = useOrderStore();
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAr = language === 'ar';

  // SECURITY: AUTO-LOGOUT LOGIC
  useEffect(() => {
    const resetTimer = () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = setTimeout(() => {
        console.log("Auto-logout triggered due to inactivity.");
        onLogout(); // Log user out after 15 minutes of inactivity
      }, 15 * 60 * 1000);
    };

    // Events to track activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    // Initial start
    resetTimer();

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [onLogout]);

  // SYSTEM WATCHER (Merchant Specific)
  useEffect(() => {
    if (role === 'merchant') {
      // Check license on mount and periodically
      checkLicenseStatus();

      // Interval check (every minute)
      const interval = setInterval(() => {
        checkLicenseStatus();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [role]);

  // CUSTOMER & MERCHANT & ADMIN DATA WATCHER
  useEffect(() => {
    // Reset the store if role changed to prevent data leakage between roles
    const orderStore = useOrderStore.getState();
    orderStore.resetForRole(role);

    // Start polling - it handles initial fetch internally
    startPolling();

    return () => stopPolling();
  }, [role, startPolling, stopPolling]);

  // Define Menu Items per Role
  const customerNavItems = [
    { id: 'home', icon: Home, label: t.dashboard.menu.home },
    { id: 'shipments', icon: Truck, label: t.dashboard.menu.shipments },
    { id: 'orders', icon: Package, label: t.dashboard.menu.orders },
    { id: 'shipping-cart', icon: ShoppingBag, label: t.dashboard.menu.shippingCart },
    { id: 'create', icon: PlusCircle, label: t.dashboard.menu.create, isAction: true },
    { id: 'billing', icon: CreditCard, label: t.dashboard.menu.billing },
    { id: 'resolution', icon: RotateCcw, label: t.dashboard.menu.resolution },
    { id: 'chats', icon: MessageSquare, label: t.dashboard.menu.chats },
    { id: 'profile', icon: User, label: t.dashboard.menu.profile },
    { id: 'support', icon: Headset, label: t.dashboard.menu.support },
    // { id: 'preferences', icon: Settings, label: t.dashboard.menu.preferences }, // Moved to Profile
    // { id: 'loyalty', icon: Star, label: t.dashboard.menu.loyalty }, // Moved to Profile
  ]; // Billing restored



  // Updated Merchant Items
  const merchantNavItems = [
    { id: 'home', icon: Grid, label: t.dashboard.merchant.menu.home },
    { id: 'marketplace', icon: ShoppingBag, label: t.dashboard.merchant.menu.marketplace, isAction: true },
    { id: 'active-orders', icon: Truck, label: t.dashboard.merchant.menu.activeOrders },
    { id: 'my-offers', icon: ListChecks, label: t.dashboard.merchant.menu.myOffers },
    { id: 'wallet', icon: Wallet, label: t.dashboard.merchant.menu.wallet },
    { id: 'docs', icon: FileText, label: t.dashboard.merchant.menu.docs },
    { id: 'chats', icon: MessageSquare, label: t.dashboard.merchant.menu.chats },
    { id: 'notifications', icon: Bell, label: t.dashboard.merchant.menu.notifications },
    { id: 'profile', icon: StoreIcon, label: t.dashboard.merchant.menu.profile },
    { id: 'settings', icon: Settings, label: t.dashboard.merchant.menu.settings },
  ];

  // ADMIN MENU BUILDER
  const adminRole = currentAdmin?.role || 'ADMIN';

  const adminNavItems = [
    { id: 'home', icon: BarChart3, label: t.admin.dashboard, allowed: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },

    // Management
    { id: 'users', icon: Store, label: t.admin.users, allowed: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] }, // Stores
    { id: 'customers', icon: Users, label: t.admin.customers, allowed: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },

    // Logistics & Operations
    { id: 'orders-control', icon: ShieldAlert, label: t.admin.orders, allowed: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
    { id: 'shipping', icon: Truck, label: t.admin.shipping, allowed: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },
    { id: 'reviews', icon: Star, label: t.admin.reviews, allowed: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'resolution', icon: Scale, label: t.admin.disputes, allowed: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] }, // Support View Only

    // Billing & Audit
    { id: 'billing', icon: BadgeDollarSign, label: t.admin.billing.title, allowed: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'audit-logs', icon: Database, label: t.admin.auditLogs, allowed: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'security-audit', icon: ShieldCheck, label: t.admin.security.title, allowed: ['SUPER_ADMIN'] },

    // New: Support
    { id: 'support', icon: Headset, label: t.admin.support.title, allowed: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] },

    // Settings: Super Admin Only
    { id: 'settings', icon: Settings, label: t.admin.settings, allowed: ['SUPER_ADMIN'] },
  ];

  const getNavItems = () => {
    switch (role) {
      case 'merchant': return merchantNavItems;
      case 'admin': return adminNavItems;
      default: return customerNavItems;
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    switch (role) {
      case 'merchant':
        if (vendorStatus === 'LICENSE_EXPIRED') return <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold border border-red-500/20 animate-pulse">EXPIRED</span>;
        return <span className="bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded text-[10px] font-bold border border-gold-500/20">MERCHANT</span>;
      case 'admin':
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border 
                ${adminRole === 'SUPER_ADMIN' ? 'bg-red-500/20 text-red-400 border-red-500/20' :
              adminRole === 'ADMIN' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                'bg-green-500/20 text-green-400 border-green-500/20'}`} // Support Color
          >
            {adminRole}
          </span>
        );
      default: return <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded text-[10px] font-bold">CUSTOMER</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0E0C] text-white font-sans selection:bg-gold-500 selection:text-white flex">

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNavigate={onNavigate}
      />

      {/* 1. Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 h-screen fixed top-0 ${language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} border-white/5 bg-[#151310]/80 backdrop-blur-xl z-50`}>
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-6 h-6 object-contain brightness-0 invert"
            />
          </div>
          <div>
            <span className="font-bold text-lg tracking-wide block leading-none">E-TASHLEH</span>
            <span className="text-[10px] text-white/30 uppercase tracking-widest">{role.toUpperCase()} PANEL</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item: any) => {
            const isLocked = role === 'admin' && item.allowed && !item.allowed.includes(adminRole);

            return (
              <button
                key={item.id}
                onClick={() => !isLocked && onNavigate(item.id)}
                disabled={isLocked}
                className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${currentPath === item.id
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20 shadow-[inset_0_0_10px_rgba(168,139,62,0.1)]'
                    : isLocked
                      ? 'opacity-50 cursor-not-allowed bg-black/20 border border-transparent grayscale'
                      : 'text-white/60 hover:text-white hover:bg-white/5'}
              `}
              >
                <div className={`relative flex items-center gap-3 z-10 ${isLocked ? 'blur-[1px]' : ''}`}>
                  <item.icon size={20} className={currentPath === item.id ? 'text-gold-400' : 'text-white/40 group-hover:text-white'} />
                  <span className="font-medium">{item.label}</span>
                </div>

                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
                    <Lock size={14} className="text-white/40" />
                  </div>
                )}

                {currentPath === item.id && !isLocked && (
                  <motion.div layoutId="active-indicator" className={`w-1.5 h-1.5 rounded-full bg-gold-400 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`} />
                )}
              </button>
            )
          })}
        </div>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">{t.dashboard.menu.logout}</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen ${language === 'ar' ? 'md:mr-64' : 'md:ml-64'} transition-all duration-300`}>

        {/* Top Header */}
        <header className="sticky top-0 z-40 px-6 py-4 bg-[#0F0E0C]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
          {/* Mobile Menu Trigger (Visual Only) */}
          <div className="md:hidden">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 object-contain brightness-0 invert"
            />
          </div>

          {/* Empty spacer */}
          <div className="flex-1 md:flex-none"></div>

          {/* User Capsule Area */}
          <div className="flex justify-end items-center gap-4">

            <div className="flex items-center gap-1 bg-[#151310] border border-white/10 rounded-full p-1 pl-1 pr-1 shadow-lg">

              {/* Notification Button */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-[#151310]"></span>
                )}
              </button>

              <div className="w-px h-6 bg-white/10 mx-1"></div>

              {/* Profile Button */}
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full hover:bg-white/5 transition-all group"
              >
                <div className="text-right hidden sm:block">
                  <div className="flex justify-end mb-0.5">
                    {getRoleBadge()}
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-gold-200 transition-colors">
                    {role === 'admin' ? currentAdmin?.name : 'User Account'}
                  </div>
                </div>

                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 p-[1px]">
                    <div className="w-full h-full rounded-full bg-[#1A1814] flex items-center justify-center">
                      <User size={16} className="text-gold-400" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#151310] rounded-full"></div>
                </div>

                <ChevronDown size={14} className="text-white/30 group-hover:text-white transition-colors" />
              </button>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 mt-2 md:mt-4 pb-24 md:pb-8">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>

      </main>

      {/* 3. Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#151310]/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
        <div className="flex items-center justify-around p-2">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                   relative flex flex-col items-center justify-center p-2 transition-all
                   ${item.isAction ? '-mt-8' : ''}
                `}
            >
              {item.isAction ? (
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gold-600 to-gold-400 flex items-center justify-center shadow-[0_4px_20px_rgba(168,139,62,0.4)] border-4 border-[#0F0E0C]">
                  <item.icon size={24} className="text-white" />
                </div>
              ) : (
                <>
                  <item.icon
                    size={24}
                    className={`mb-1 transition-colors ${currentPath === item.id ? 'text-gold-400' : 'text-white/40'}`}
                  />
                  <span className={`text-[10px] font-medium transition-colors ${currentPath === item.id ? 'text-white' : 'text-white/40'}`}>
                    {item.label}
                  </span>
                  {currentPath === item.id && (
                    <motion.div layoutId="mobile-indicator" className="absolute -bottom-2 w-1 h-1 rounded-full bg-gold-400" />
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
};

const StoreIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg>
);
