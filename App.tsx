
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LoadingScreen } from './components/LoadingScreen';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { WholesaleScreen } from './components/WholesaleScreen';
import { HowWeWorkScreen } from './components/HowWeWorkScreen';
import { HowWeWorkTutorial } from './components/HowWeWorkTutorial';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';

// Sections
import { TrustStats } from './components/sections/TrustStats';
import { AboutCompany } from './components/sections/AboutCompany';
import { Guarantees } from './components/sections/Guarantees';
import { HowItWorks } from './components/sections/HowItWorks';
import { MerchantCallout } from './components/sections/MerchantCallout';
import { LegalDocs } from './components/sections/LegalDocs';
import { SupportModal } from './components/modals/SupportModal';

// Dashboard
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { MerchantHome } from './components/dashboard/merchant/MerchantHome';
import { MerchantMarketplace } from './components/dashboard/merchant/MerchantMarketplace';
import { MarketplaceOfferDetails } from './components/dashboard/merchant/MarketplaceOfferDetails'; // NEW
import { MerchantOffers } from './components/dashboard/merchant/MerchantOffers';
import { MerchantOrders } from './components/dashboard/merchant/MerchantOrders';
import { MerchantWallet } from './components/dashboard/merchant/MerchantWallet';
import { MerchantProfile } from './components/dashboard/merchant/MerchantProfile';
import { MerchantSettings } from './components/dashboard/merchant/MerchantSettings';
import { MerchantNotifications } from './components/dashboard/merchant/MerchantNotifications';
import { MerchantStatusGuard } from './components/dashboard/merchant/MerchantStatusGuard';
import { MerchantDisputeDetails } from './components/dashboard/merchant/MerchantDisputeDetails';
import { MerchantShippingCartPage } from './components/dashboard/merchant/MerchantShippingCartPage';
import { MerchantSupportPage } from './components/dashboard/merchant/support/MerchantSupportPage';
import { MerchantResolutionPage } from './components/dashboard/merchant/MerchantResolutionPage';
import { MerchantReviews } from './components/dashboard/merchant/MerchantReviews';
import { MerchantLoyalty } from './components/dashboard/merchant/MerchantLoyalty';

// Admin Imports
import { AdminHome } from './components/dashboard/admin/AdminHome';
import { SecurityAudit } from './components/dashboard/admin/SecurityAudit'; // NEW
import { AdminChatOversight } from './components/dashboard/admin/chat/AdminChatOversight'; // NEW
import { AdminChatMonitoring } from './components/dashboard/admin/chat/AdminChatMonitoring'; // NEW

import { MyOrders } from './components/dashboard/MyOrders';
import { OrderDetails } from './components/dashboard/OrderDetails';
import { CreateOrderWizard } from './components/dashboard/create-order/CreateOrderWizard';
import { ChatLayout } from './components/dashboard/chat/ChatLayout';
import { CheckoutWizard } from './components/dashboard/checkout/CheckoutWizard';
import { ProfileView } from './components/dashboard/profile/ProfileView';
import { ResolutionCenter } from './components/dashboard/resolution/ResolutionCenter';
import { InfoCenter } from './components/dashboard/info/InfoCenter';
import { WalletView } from './components/dashboard/wallet/WalletView';

// New Customer Dashboard Pages
import { ShipmentsPage } from './components/dashboard/shipments/ShipmentsPage';
import { ShippingCartPage } from './components/dashboard/shipping-cart/ShippingCartPage';
import { BillingPage } from './components/dashboard/wallet/BillingPage';
import { ReturnsExchangePage } from './components/dashboard/resolution/ReturnsExchangePage';
import { SupportPage } from './components/dashboard/support/SupportPage';
import { PreferencesPage } from './components/dashboard/preferences/PreferencesPage';
import { LoyaltyPage } from './components/dashboard/loyalty/LoyaltyPage';
import { ShipmentDetailsPage } from './components/dashboard/shipments/ShipmentDetailsPage';
import { CustomerResolutionCenter } from './components/dashboard/customer/CustomerResolutionCenter';
import { CustomerDisputeDetails } from './components/dashboard/customer/CustomerDisputeDetails';

// Store
import { useVendorStore } from './stores/useVendorStore';
import { useProfileStore } from './stores/useProfileStore';
import { useSystemAutomation } from './stores/useSystemAutomation'; // NEW

// Navigation
import { useNavigationHistory, parseUrlToState } from './utils/useNavigationHistory';

// Auth Setup
import { getCurrentUser, mapBackendRoleToFrontend } from './utils/auth';

// Auth Components
import { AuthLayout } from './components/auth/AuthLayout';
const LoginPage = lazy(() => import('./components/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const VendorRegister = lazy(() => import('./components/auth/VendorRegister').then(module => ({ default: module.VendorRegister })));
const CustomerRegister = lazy(() => import('./components/auth/CustomerRegister').then(module => ({ default: module.CustomerRegister })));
const AdminLogin = lazy(() => import('./components/auth/AdminLogin').then(module => ({ default: module.AdminLogin })));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword').then(module => ({ default: module.ResetPassword })));
const TermsView = lazy(() => import('./components/auth/TermsView').then(module => ({ default: module.TermsView })));
const AccountRecoveryWizard = lazy(() => import('./components/auth/AccountRecoveryWizard').then(module => ({ default: module.AccountRecoveryWizard })));

type ViewState =
  | 'landing'
  | 'login' // Keep for generic fallback if needed
  | 'customer-login' // NEW
  | 'merchant-login' // NEW
  | 'vendor-register'
  | 'customer-register'
  | 'admin-login'
  | 'forgot-password'
  | 'reset-password'
  | 'account-recovery'
  | 'terms'
  | 'dashboard'
  | 'role-selection'
  | 'wholesale'
  | 'how-we-work'
  | 'how-we-work-tutorial';
type UserRole = 'customer' | 'merchant' | 'admin' | null;

function AppContent() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [legalInitialSection, setLegalInitialSection] = useState<'terms' | 'privacy'>('terms');
  const [landingInitialSection, setLandingInitialSection] = useState<string | null>(null);
  const [recoveryRole, setRecoveryRole] = useState<'customer' | 'merchant'>('customer');

  // Handle Scrolling to Landing Section
  useEffect(() => {
    if (currentView === 'landing' && landingInitialSection) {
      setTimeout(() => {
        const element = document.getElementById(landingInitialSection);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        setLandingInitialSection(null); // Reset after scrolling attempt
      }, 500); // Slight delay to ensure DOM is ready
    }
  }, [currentView, landingInitialSection]);

  const [previousView, setPreviousView] = useState<ViewState>('login');
  const [loginInitialTab, setLoginInitialTab] = useState<'customer' | 'merchant'>('customer');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  // Dashboard State
  const [dashboardPath, setDashboardPath] = useState('home');
  const [viewId, setViewId] = useState<any>(null); // Generic ID

  // --- NAVIGATION HISTORY API ---
  const { pushView, replaceView } = useNavigationHistory((state) => {
    if (state.view) setCurrentView(state.view as ViewState);
    if (state.dashboardPath) setDashboardPath(state.dashboardPath);
    if (state.viewId !== undefined) setViewId(state.viewId);
  });

  // Restore state from URL on initial load and setup pending redirect
  const [pendingRedirect, setPendingRedirect] = useState<{ path: string, id?: any } | null>(null);

  // --- IMMEDIATE ROLE & URL SYNC ON MOUNT ---
  // This prevents the "Flash of Black Screen" by ensuring role is set before loading finishes
  useEffect(() => {
    // 1. Sync Role From Storage
    const user = getCurrentUser();
    if (user) {
      const normalizedRole = mapBackendRoleToFrontend(user?.role);
      setUserRole(normalizedRole as UserRole);
    }

    // 2. Sync URL State Immediately (Prevents delay in route calculation)
    const initialState = parseUrlToState();
    if (initialState.view === 'dashboard') {
      if (user) {
        setCurrentView('dashboard');
        setDashboardPath(initialState.dashboardPath || 'home');
        setViewId(initialState.viewId);
      } else {
        // Not logged in but trying to access dashboard
        setPendingRedirect({ path: initialState.dashboardPath || 'home', id: initialState.viewId });
        setCurrentView('role-selection');
        replaceView('role-selection');
      }
    } else {
      setCurrentView(initialState.view as ViewState);
    }
  }, []);

  // --- AUTOMATION ENGINE ---
  const { startAutomation, stopAutomation } = useSystemAutomation();

  useEffect(() => {
    // Start the automation engine regardless of view (it runs in background)
    startAutomation();
    return () => stopAutomation();
  }, []);

  // --- LICENSE WATCHDOG ---
  const { checkLicenseStatus, vendorStatus } = useVendorStore();

  useEffect(() => {
    // Check immediately if user is merchant
    if (userRole === 'merchant') {
      checkLicenseStatus();
    }

    // Periodic Check (Redundant if Automation Engine works, but good as fallback)
    const interval = setInterval(() => {
      if (userRole === 'merchant') {
        checkLicenseStatus();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [userRole, checkLicenseStatus]);

  // Handle Custom Events for Admin Navigation bubbling up
  useEffect(() => {
    const handleAdminNav = (e: any) => {
      const { path, id } = e.detail;
      setDashboardPath(path);
      if (id) setViewId(id);
      pushView('dashboard', path, id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('admin-nav', handleAdminNav);
    return () => window.removeEventListener('admin-nav', handleAdminNav);
  }, [pushView]);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    pushView(view);
  };

  const handleLoadingComplete = () => {
    setLoading(false);
    
    // Safety: ensure final state is synced
    const initialState = parseUrlToState();
    const user = getCurrentUser();

    if (initialState.view === 'dashboard' && user) {
        const normalizedRole = mapBackendRoleToFrontend(user?.role);
        setUserRole(normalizedRole as UserRole);
        setDashboardPath(initialState.dashboardPath || 'home');
        setViewId(initialState.viewId);
        setCurrentView('dashboard');
    } else if (initialState.view === 'dashboard' && !user) {
        setPendingRedirect({ path: initialState.dashboardPath || 'home', id: initialState.viewId });
        setCurrentView('role-selection');
        replaceView('role-selection');
    } else {
        setCurrentView(initialState.view as ViewState);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('role-selection');
    pushView('role-selection');
  };
  const handleBackToLogin = () => {
    // Intelligent back navigation
    if (previousView === 'customer-login' || currentView === 'customer-register') {
      setCurrentView('customer-login');
      pushView('customer-login');
      return;
    }
    if (previousView === 'merchant-login' || currentView === 'vendor-register') {
      setCurrentView('merchant-login');
      pushView('merchant-login');
      return;
    }
    setCurrentView('role-selection');
    pushView('role-selection');
  };

  const handleNavigateToTerms = () => {
    setPreviousView(currentView);
    setLegalInitialSection('terms');
    setCurrentView('terms');
    pushView('terms');
  };

  const handleNavigateToLegal = (section: 'terms' | 'privacy') => {
    setPreviousView(currentView);
    setLegalInitialSection(section);
    setCurrentView('terms');
    pushView('terms');
  };

  const handleNavigateToLandingSection = (section: string) => {
    setLandingInitialSection(section);
    setCurrentView('landing');
    pushView('landing');
  };

  const handleBackFromTerms = () => {
    setCurrentView(previousView);
    pushView(previousView);
  };

  const handleLoginSuccess = (role: UserRole) => {
    // SECURITY: Clear stale state from previous sessions/roles before entering dashboard
    useVendorStore.getState().reset();
    useProfileStore.getState().clearProfile();
    // useOrderStore.getState().clearOrders(); // If implemented, or use resetForRole below in layout

    setUserRole(role);
    
    // Redirect Flow: Check if there's a pending URL the user wanted to visit
    if (pendingRedirect) {
        setDashboardPath(pendingRedirect.path);
        setViewId(pendingRedirect.id);
        setCurrentView('dashboard');
        pushView('dashboard', pendingRedirect.path, pendingRedirect.id);
        setPendingRedirect(null); // Clear it
    } else {
        setDashboardPath('home');
        setCurrentView('dashboard');
        pushView('dashboard', 'home');
    }
  };

  const handleDashboardNavigate = (path: string, id?: any) => {
    setDashboardPath(path);
    if (id !== undefined) setViewId(id);
    pushView('dashboard', path, id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDashboardBack = () => {
    window.history.back();
  };

  const getTitle = () => {
    switch (currentView) {
      case 'login': return 'Login';
      case 'admin-login': return 'Admin';
      case 'customer-register': return 'Register';
      case 'vendor-register': return 'Register';
      case 'forgot-password': return 'Recovery';
      case 'reset-password': return 'Reset';
      case 'account-recovery': return 'Account Recovery';
      case 'terms': return 'Terms & Conditions';
      default: return 'Auth';
    }
  };

  const AuthLoader = () => (
    <div className="flex items-center justify-center h-64 w-full">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A1814] text-white font-sans selection:bg-gold-500 selection:text-white relative">

      {currentView !== 'dashboard' && (
        <>
          <div
            className="fixed inset-0 z-0 pointer-events-none transform-gpu"
            style={{
              backgroundImage: `
                    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
              backgroundSize: '60px 60px',
              maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
            }}
          />
          <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-luxury-gradient/20 via-[#1A1814]/80 to-[#0F0E0C]" />
        </>
      )}

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {loading && (
            <LoadingScreen key="loader" onComplete={handleLoadingComplete} />
          )}
        </AnimatePresence>

        <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />

        {!loading && (
          <AnimatePresence mode="wait">

            {/* 1. DASHBOARD VIEW */}
            {currentView === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                  {/* Session Loading Guard */}
                  {!userRole && (
                    <div className="fixed inset-0 bg-[#0F0E0C] flex flex-col items-center justify-center z-50">
                        <div className="w-16 h-16 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-gold-400/60 font-medium animate-pulse">
                            {language === 'ar' ? 'جاري استعادة الجلسة...' : 'Restoring session...'}
                        </p>
                    </div>
                  )}

                  {/* A. Customer Routes */}
                  {userRole === 'customer' && (
                    <DashboardLayout
                      role="customer"
                      onLogout={() => { setUserRole(null); handleBackToHome(); }}
                      currentPath={dashboardPath}
                      onNavigate={handleDashboardNavigate}
                      onBack={handleDashboardBack}
                    >
                      {dashboardPath === 'home' && <DashboardHome onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'orders' && <MyOrders onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'order-details' && <OrderDetails orderId={viewId} onBack={() => handleDashboardNavigate('orders')} onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'create-order' && <CreateOrderWizard onComplete={() => handleDashboardNavigate('orders')} onCancel={() => handleDashboardNavigate('orders')} />}
                      {dashboardPath === 'checkout' && <CheckoutWizard onComplete={() => handleDashboardNavigate('orders')} onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'chats' && <ChatLayout viewId={viewId} onNavigateToCheckout={(orderId) => handleDashboardNavigate('checkout', orderId)} />}
                      {dashboardPath === 'profile' && <ProfileView />}
                      {dashboardPath === 'wallet' && <WalletView onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'billing' && <BillingPage />}
                      {dashboardPath === 'shipments' && <ShipmentsPage onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'shipment-details' && <ShipmentDetailsPage shipmentId={viewId} onBack={() => handleDashboardNavigate('shipments')} role="customer" />}
                      {dashboardPath === 'shipping-cart' && <ShippingCartPage onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'resolution' && <CustomerResolutionCenter onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'dispute-details' && <CustomerDisputeDetails caseId={viewId} onBack={() => handleDashboardNavigate('resolution')} />}
                      {dashboardPath === 'support' && <SupportPage onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'preferences' && <PreferencesPage />}
                      {dashboardPath === 'loyalty' && <LoyaltyPage />}
                      {dashboardPath === 'info-center' && <InfoCenter />}
                    </DashboardLayout>
                  )}

                  {/* B. Merchant Routes - LOCKDOWN AT LAYOUT LEVEL */}
                  {userRole === 'merchant' && (
                    <MerchantStatusGuard>
                      <DashboardLayout
                        role="merchant"
                        onLogout={() => { setUserRole(null); handleBackToHome(); }}
                        currentPath={dashboardPath}
                        onNavigate={handleDashboardNavigate}
                        onBack={handleDashboardBack}
                      >
                        {dashboardPath === 'home' && <MerchantHome onNavigate={handleDashboardNavigate} />}
                        {dashboardPath === 'loyalty' && <MerchantLoyalty />}
                        {dashboardPath === 'marketplace' && <MerchantMarketplace onNavigate={handleDashboardNavigate} />}
                        {(dashboardPath === 'explore-offer' || (dashboardPath === 'orders' && viewId)) && <MarketplaceOfferDetails orderId={viewId} onBack={handleDashboardBack} />}
                        {(dashboardPath === 'active-orders' || (dashboardPath === 'orders' && !viewId)) && <MerchantOrders onNavigate={handleDashboardNavigate} />}
                        {dashboardPath === 'my-offers' && <MerchantOffers onNavigate={handleDashboardNavigate} />}
                        {dashboardPath === 'reviews' && <MerchantReviews />}
                        {dashboardPath === 'profile' && <MerchantProfile />}
                        {dashboardPath === 'wallet' && <MerchantWallet />}
                        {dashboardPath === 'shipments' && <ShipmentsPage onNavigate={handleDashboardNavigate} />}
                        {dashboardPath === 'shipment-details' && <ShipmentDetailsPage shipmentId={viewId} onBack={() => handleDashboardNavigate('shipments')} role="merchant" />}
                        {dashboardPath === 'settings' && <MerchantSettings />}
                        {dashboardPath === 'support' && <MerchantSupportPage onNavigate={handleDashboardNavigate} />}
                        {dashboardPath === 'notifications' && <MerchantNotifications />}
                        {dashboardPath === 'chats' && <ChatLayout viewId={viewId} onNavigateToCheckout={() => { }} />}
                        {dashboardPath === 'shipping-cart' && <MerchantShippingCartPage />}
                        {dashboardPath === 'billing' && <BillingPage />}
                        {dashboardPath === 'resolution' && <MerchantResolutionPage onNavigate={handleDashboardNavigate} />}
                        {dashboardPath === 'dispute-details' && <MerchantDisputeDetails caseId={viewId} onBack={() => handleDashboardNavigate('resolution')} />}
                        {dashboardPath === 'info-center' && <InfoCenter />}
                      </DashboardLayout>
                    </MerchantStatusGuard>
                  )}

                  {/* C. Admin Routes */}
                  {userRole === 'admin' && (
                    <DashboardLayout
                      role="admin"
                      onLogout={() => { setUserRole(null); handleBackToHome(); }}
                      currentPath={dashboardPath}
                      onNavigate={handleDashboardNavigate}
                      onBack={handleDashboardBack}
                    >
                      {dashboardPath === 'home' && <AdminHome />}
                      {dashboardPath === 'users' && <AdminHome subPath="users" />}
                      {dashboardPath === 'store-profile' && <AdminHome subPath="store-profile" viewId={viewId} />}
                      {dashboardPath === 'customers' && <AdminHome subPath="customers" />}
                      {dashboardPath === 'customer-profile' && <AdminHome subPath="customer-profile" viewId={viewId} />}
                      {dashboardPath === 'reviews' && <AdminHome subPath="reviews" />}
                      {dashboardPath === 'orders-control' && <AdminHome subPath="orders-control" />}
                      {dashboardPath === 'admin-order-details' && <AdminHome subPath="admin-order-details" viewId={viewId} />}
                      {dashboardPath === 'billing' && <AdminHome subPath="billing" />}
                      {dashboardPath === 'financials' && <AdminHome subPath="financials" />}
                      {dashboardPath === 'invoice-details' && <AdminHome subPath="invoice-details" viewId={viewId} />}
                      {dashboardPath === 'shipping' && <AdminHome subPath="shipping" />}
                      {dashboardPath === 'audit-logs' && <AdminHome subPath="audit-logs" />}
                      {dashboardPath === 'settings' && <AdminHome subPath="settings" />}
                      {dashboardPath === 'support' && <AdminHome subPath="support" />}
                      {dashboardPath === 'resolution' && <AdminHome subPath="resolution" />}
                      {dashboardPath === 'admin-dispute-details' && <AdminHome subPath="admin-dispute-details" viewId={viewId} />}
                      {dashboardPath === 'security-audit' && <AdminHome subPath="security-audit" />}
                      {dashboardPath === 'chats' && <AdminChatOversight />}
                      {dashboardPath === 'chat-monitoring' && <AdminChatMonitoring />}
                      {dashboardPath === 'profile' && <ProfileView />}
                    </DashboardLayout>
                  )}
              </motion.div>
            ) : currentView === 'role-selection' ? (
              <RoleSelectionScreen
                onCustomerClick={() => {
                  handleNavigate('how-we-work');
                }}
                onMerchantClick={() => {
                  handleNavigate('merchant-login');
                }}
                onWholesaleClick={() => handleNavigate('wholesale')}
                onHowWeWorkClick={() => handleNavigate('landing')}
                onOpenSupport={() => setIsSupportOpen(true)}
                onAdminClick={() => handleNavigate('admin-login')}
                onNavigateToLegal={handleNavigateToLegal}
                onNavigateToLandingSection={handleNavigateToLandingSection}
              />
            ) : currentView === 'wholesale' ? (
              <WholesaleScreen onBack={() => handleNavigate('role-selection')} />
            ) : currentView === 'how-we-work' ? (
              <HowWeWorkScreen
                onComplete={() => {
                  handleNavigate('customer-login');
                }}
                onTutorial={() => handleNavigate('how-we-work-tutorial')}
                onBack={() => handleNavigate('role-selection')}
                onTermsClick={() => handleNavigateToLegal('terms')}
                onOpenSupport={() => setIsSupportOpen(true)}
                onAdminClick={() => handleNavigate('admin-login')}
                onNavigateToLegal={handleNavigateToLegal}
                onNavigateToLandingSection={handleNavigateToLandingSection}
              />
            ) : currentView === 'how-we-work-tutorial' ? (
              <HowWeWorkTutorial
                onComplete={() => handleNavigate('customer-login')}
                onBack={() => handleNavigate('how-we-work')}
                onOpenSupport={() => setIsSupportOpen(true)}
                onAdminClick={() => handleNavigate('admin-login')}
                onNavigateToLegal={handleNavigateToLegal}
                onNavigateToLandingSection={handleNavigateToLandingSection}
              />
            ) : currentView === 'landing' ? (

              /* 2. LANDING VIEW */
              <motion.main
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative will-change-opacity"
              >
                <Navbar
                  onLoginClick={() => handleNavigate('role-selection')}
                  onHomeClick={() => handleNavigate('role-selection')}
                />
                <Hero
                  onLogin={() => handleNavigate('login')}
                  onRequestNow={() => handleNavigate('role-selection')}
                />
                <TrustStats />
                <AboutCompany />
                <Guarantees />
                <HowItWorks />
                <MerchantCallout onRegister={() => handleNavigate('vendor-register')} />
                <LegalDocs />
                <Footer
                  onOpenSupport={() => setIsSupportOpen(true)}
                  onAdminClick={() => handleNavigate('admin-login')}
                />
              </motion.main>
            ) : (

              /* 3. AUTH VIEW */
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="will-change-transform"
              >
                <AuthLayout
                  onBack={currentView === 'terms' ? handleBackFromTerms : (currentView === 'customer-register' || currentView === 'forgot-password' || currentView === 'reset-password' || currentView === 'account-recovery' ? handleBackToLogin : handleBackToHome)}
                  title={getTitle()}
                  wide={currentView === 'vendor-register' || currentView === 'terms'}
                >
                  <Suspense fallback={<AuthLoader />}>
                    {currentView === 'login' && (
                      <LoginPage
                        initialTab={loginInitialTab}
                        onRegisterClick={() => handleNavigate('vendor-register')}
                        onCustomerRegisterClick={() => handleNavigate('customer-register')}
                        onLoginSuccess={handleLoginSuccess}
                        onForgotPasswordClick={() => handleNavigate('forgot-password')}
                        onRecoveryClick={(r) => { setRecoveryRole(r); handleNavigate('account-recovery'); }}
                      />
                    )}

                    {currentView === 'customer-login' && (
                      <LoginPage
                        forcedRole="customer"
                        onRegisterClick={() => { /* Should not happen in forced mode usually */ }}
                        onCustomerRegisterClick={() => handleNavigate('customer-register')}
                        onLoginSuccess={handleLoginSuccess}
                        onForgotPasswordClick={() => handleNavigate('forgot-password')}
                        onRecoveryClick={(r) => { setRecoveryRole(r); handleNavigate('account-recovery'); }}
                      />
                    )}

                    {currentView === 'merchant-login' && (
                      <LoginPage
                        forcedRole="merchant"
                        onRegisterClick={() => handleNavigate('vendor-register')}
                        onCustomerRegisterClick={() => { /* Should not happen */ }}
                        onLoginSuccess={handleLoginSuccess}
                        onForgotPasswordClick={() => handleNavigate('forgot-password')}
                        onRecoveryClick={(r) => { setRecoveryRole(r); handleNavigate('account-recovery'); }}
                      />
                    )}

                    {currentView === 'vendor-register' && (
                      <VendorRegister
                        onComplete={() => handleNavigate('merchant-login')}
                        onBack={() => handleNavigate('merchant-login')} // NEW
                      />
                    )}

                    {currentView === 'customer-register' && (
                      <CustomerRegister
                        onLoginClick={handleBackToLogin}
                        onRegisterSuccess={() => handleLoginSuccess('customer')}
                        onTermsClick={() => handleNavigateToLegal('terms')}
                      />
                    )}

                    {currentView === 'admin-login' && (
                      <AdminLogin onLoginSuccess={() => handleLoginSuccess('admin')} />
                    )}

                    {currentView === 'forgot-password' && (
                      <ForgotPassword
                        onBackToLogin={handleBackToLogin}
                        onSuccess={() => handleNavigate('reset-password')}
                      />
                    )}

                    {currentView === 'reset-password' && (
                      <ResetPassword onLoginClick={handleBackToLogin} />
                    )}

                    {currentView === 'account-recovery' && (
                      <AccountRecoveryWizard onBackToLogin={handleBackToLogin} role={recoveryRole} />
                    )}

                    {currentView === 'terms' && (
                      <TermsView initialSection={legalInitialSection} />
                    )}
                  </Suspense>
                </AuthLayout>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
