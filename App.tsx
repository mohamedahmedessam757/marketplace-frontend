
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider } from './contexts/LanguageContext';
import { LoadingScreen } from './components/LoadingScreen';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { WholesaleScreen } from './components/WholesaleScreen';
import { HowWeWorkScreen } from './components/HowWeWorkScreen';
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
import { MerchantOffers } from './components/dashboard/merchant/MerchantOffers';
import { MerchantOrders } from './components/dashboard/merchant/MerchantOrders';
import { MerchantWallet } from './components/dashboard/merchant/MerchantWallet';
import { MerchantProfile } from './components/dashboard/merchant/MerchantProfile';
import { MerchantDocuments } from './components/dashboard/merchant/MerchantDocuments';
import { MerchantSettings } from './components/dashboard/merchant/MerchantSettings';
import { MerchantNotifications } from './components/dashboard/merchant/MerchantNotifications';
import { MerchantStatusGuard } from './components/dashboard/merchant/MerchantStatusGuard';
import { MerchantDisputeDetails } from './components/dashboard/merchant/MerchantDisputeDetails';

// Admin Imports
import { AdminHome } from './components/dashboard/admin/AdminHome';
import { SecurityAudit } from './components/dashboard/admin/SecurityAudit'; // NEW

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

// Store
import { useVendorStore } from './stores/useVendorStore';
import { useSystemAutomation } from './stores/useSystemAutomation'; // NEW

// Auth Components
import { AuthLayout } from './components/auth/AuthLayout';
const LoginPage = lazy(() => import('./components/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const VendorRegister = lazy(() => import('./components/auth/VendorRegister').then(module => ({ default: module.VendorRegister })));
const CustomerRegister = lazy(() => import('./components/auth/CustomerRegister').then(module => ({ default: module.CustomerRegister })));
const AdminLogin = lazy(() => import('./components/auth/AdminLogin').then(module => ({ default: module.AdminLogin })));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword').then(module => ({ default: module.ResetPassword })));
const TermsView = lazy(() => import('./components/auth/TermsView').then(module => ({ default: module.TermsView })));

type ViewState =
  | 'landing'
  | 'login'
  | 'vendor-register'
  | 'customer-register'
  | 'admin-login'
  | 'forgot-password'
  | 'reset-password'
  | 'terms'
  | 'dashboard'
  | 'role-selection'
  | 'wholesale'
  | 'how-we-work';
type UserRole = 'customer' | 'merchant' | 'admin' | null;

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('landing');

  const [previousView, setPreviousView] = useState<ViewState>('login');
  const [loginInitialTab, setLoginInitialTab] = useState<'customer' | 'merchant'>('customer');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  // Dashboard State
  const [dashboardPath, setDashboardPath] = useState('home');
  const [viewId, setViewId] = useState<any>(null); // Generic ID

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('admin-nav', handleAdminNav);
    return () => window.removeEventListener('admin-nav', handleAdminNav);
  }, []);

  const handleLoadingComplete = () => {
    setLoading(false);
    setCurrentView('role-selection');
  };

  const handleBackToHome = () => setCurrentView('role-selection');
  const handleBackToLogin = () => setCurrentView('login');

  const handleNavigateToTerms = () => {
    setPreviousView(currentView);
    setCurrentView('terms');
  };

  const handleBackFromTerms = () => {
    setCurrentView(previousView);
  };

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    setDashboardPath('home');
    setCurrentView('dashboard');
  };

  const handleDashboardNavigate = (path: string, id?: any) => {
    setDashboardPath(path);
    if (id !== undefined) setViewId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTitle = () => {
    switch (currentView) {
      case 'login': return 'Login';
      case 'admin-login': return 'Admin';
      case 'customer-register': return 'Register';
      case 'vendor-register': return 'Register';
      case 'forgot-password': return 'Recovery';
      case 'reset-password': return 'Reset';
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
                <DashboardLayout
                  role={userRole || 'customer'}
                  onLogout={() => { setUserRole(null); handleBackToHome(); }}
                  currentPath={dashboardPath}
                  onNavigate={handleDashboardNavigate}
                >
                  {/* ROUTING LOGIC BASED ON ROLE */}

                  {/* A. Customer Routes */}
                  {userRole === 'customer' && (
                    <>
                      {dashboardPath === 'home' && <DashboardHome onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'shipments' && <ShipmentsPage />}
                      {dashboardPath === 'orders' && <MyOrders onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'shipping-cart' && <ShippingCartPage />}
                      {dashboardPath === 'create' && <CreateOrderWizard onComplete={() => handleDashboardNavigate('orders')} />}
                      {dashboardPath === 'order-details' && <OrderDetails orderId={viewId} onBack={() => handleDashboardNavigate('orders')} onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'chats' && <ChatLayout onNavigateToCheckout={() => handleDashboardNavigate('checkout')} />}
                      {dashboardPath === 'checkout' && <CheckoutWizard onComplete={() => { alert('Order Success!'); handleDashboardNavigate('orders'); }} />}
                      {dashboardPath === 'profile' && <ProfileView />}
                      {dashboardPath === 'billing' && <BillingPage onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'resolution' && <ReturnsExchangePage onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'support' && <SupportPage onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'preferences' && <PreferencesPage />}
                      {dashboardPath === 'loyalty' && <LoyaltyPage />}
                      {/* Kept for fallback/historical */}
                      {dashboardPath === 'wallet' && <WalletView />}
                      {dashboardPath === 'info-center' && <InfoCenter />}
                    </>
                  )}

                  {/* B. Merchant Routes - WRAPPED IN STATUS GUARD */}
                  {userRole === 'merchant' && (
                    <MerchantStatusGuard>
                      {dashboardPath === 'home' && <MerchantHome />}
                      {dashboardPath === 'marketplace' && <MerchantMarketplace />}
                      {dashboardPath === 'active-orders' && <MerchantOrders />}
                      {dashboardPath === 'my-offers' && <MerchantOffers />}
                      {dashboardPath === 'profile' && <MerchantProfile />}
                      {dashboardPath === 'wallet' && <MerchantWallet />}
                      {dashboardPath === 'docs' && <MerchantDocuments />}
                      {dashboardPath === 'settings' && <MerchantSettings />}
                      {dashboardPath === 'notifications' && <MerchantNotifications />}
                      {dashboardPath === 'chats' && <ChatLayout onNavigateToCheckout={() => { }} />}
                      {dashboardPath === 'resolution' && <ResolutionCenter onNavigate={handleDashboardNavigate} />}
                      {dashboardPath === 'dispute-details' && <MerchantDisputeDetails caseId={viewId} onBack={() => handleDashboardNavigate('resolution')} />}
                      {dashboardPath === 'info-center' && <InfoCenter />}
                    </MerchantStatusGuard>
                  )}

                  {/* C. Admin Routes */}
                  {userRole === 'admin' && (
                    <>
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
                      {/* LINKED: The Digital Courtroom Route */}
                      {dashboardPath === 'admin-dispute-details' && <AdminHome subPath="admin-dispute-details" viewId={viewId} />}
                      {dashboardPath === 'security-audit' && <AdminHome subPath="security-audit" />}
                      {dashboardPath === 'profile' && <ProfileView />}
                    </>
                  )}

                </DashboardLayout>
              </motion.div>
            ) : currentView === 'role-selection' ? (
              <RoleSelectionScreen
                onCustomerClick={() => {
                  setCurrentView('how-we-work');
                }}
                onMerchantClick={() => {
                  setLoginInitialTab('merchant');
                  setCurrentView('login');
                }}
                onWholesaleClick={() => setCurrentView('wholesale')}
                onHowWeWorkClick={() => setCurrentView('landing')}
              />
            ) : currentView === 'wholesale' ? (
              <WholesaleScreen onBack={() => setCurrentView('role-selection')} />
            ) : currentView === 'how-we-work' ? (
              <HowWeWorkScreen
                onComplete={() => {
                  setLoginInitialTab('customer');
                  setCurrentView('login');
                }}
                onBack={() => setCurrentView('role-selection')}
                onTermsClick={() => setCurrentView('terms')}
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
                <Navbar onLoginClick={() => setCurrentView('role-selection')} />
                <Hero
                  onLogin={() => setCurrentView('login')}
                  onRequestNow={() => setCurrentView('role-selection')}
                />
                <TrustStats />
                <AboutCompany />
                <Guarantees />
                <HowItWorks />
                <MerchantCallout onRegister={() => setCurrentView('vendor-register')} />
                <LegalDocs />
                <Footer
                  onOpenSupport={() => setIsSupportOpen(true)}
                  onAdminClick={() => setCurrentView('admin-login')}
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
                  onBack={currentView === 'terms' ? handleBackFromTerms : (currentView === 'customer-register' || currentView === 'forgot-password' || currentView === 'reset-password' ? handleBackToLogin : handleBackToHome)}
                  title={getTitle()}
                  wide={currentView === 'vendor-register' || currentView === 'terms'}
                >
                  <Suspense fallback={<AuthLoader />}>
                    {currentView === 'login' && (
                      <LoginPage
                        initialTab={loginInitialTab}
                        onRegisterClick={() => setCurrentView('vendor-register')}
                        onCustomerRegisterClick={() => setCurrentView('customer-register')}
                        onLoginSuccess={handleLoginSuccess}
                        onForgotPasswordClick={() => setCurrentView('forgot-password')}
                      />
                    )}

                    {currentView === 'vendor-register' && (
                      <VendorRegister onComplete={() => handleLoginSuccess('merchant')} />
                    )}

                    {currentView === 'customer-register' && (
                      <CustomerRegister
                        onLoginClick={handleBackToLogin}
                        onRegisterSuccess={() => handleLoginSuccess('customer')}
                        onTermsClick={handleNavigateToTerms}
                      />
                    )}

                    {currentView === 'admin-login' && (
                      <AdminLogin onLoginSuccess={() => handleLoginSuccess('admin')} />
                    )}

                    {currentView === 'forgot-password' && (
                      <ForgotPassword
                        onBackToLogin={handleBackToLogin}
                        onSuccess={() => setCurrentView('reset-password')}
                      />
                    )}

                    {currentView === 'reset-password' && (
                      <ResetPassword onLoginClick={handleBackToLogin} />
                    )}

                    {currentView === 'terms' && (
                      <TermsView />
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
