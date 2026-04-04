import { useEffect, useCallback } from 'react';

export interface NavigationState {
    view: string;
    dashboardPath?: string;
    viewId?: any;
}

/**
 * Custom hook to sync app state with browser history API.
 * This enables the back/forward buttons to work seamlessly in our SPA.
 */
export function useNavigationHistory(
    onStateChange: (state: NavigationState) => void
) {
    // Utility to build URL based on view and path
    const buildUrl = useCallback((view: string, dashboardPath?: string, viewId?: any) => {
        let url = '/';

        if (view === 'landing') url = '/landing';
        else if (view === 'role-selection') url = '/';
        else if (view === 'customer-login') url = '/auth/customer-login';
        else if (view === 'merchant-login') url = '/auth/merchant-login';
        else if (view === 'admin-login') url = '/auth/admin-login';
        else if (view === 'customer-register') url = '/auth/register';
        else if (view === 'vendor-register') url = '/auth/merchant-register';
        else if (view === 'forgot-password') url = '/auth/forgot-password';
        else if (view === 'reset-password') url = '/auth/reset-password';
        else if (view === 'account-recovery') url = '/auth/account-recovery';
        else if (view === 'terms') url = '/legal/terms';
        else if (view === 'wholesale') url = '/wholesale';
        else if (view === 'how-we-work') url = '/how-it-works';
        else if (view === 'how-we-work-tutorial') url = '/tutorial';
        else if (view === 'dashboard') {
            url = `/dashboard/${dashboardPath || 'home'}`;
            if (viewId) {
                url += `/${viewId}`;
            }
        }

        return url;
    }, []);

    // Update history state
    const pushView = useCallback((view: string, dashboardPath?: string, viewId?: any) => {
        const url = buildUrl(view, dashboardPath, viewId);
        const state: NavigationState = { view, dashboardPath, viewId };

        // Avoid pushing duplicate state if it's the same URL
        if (window.history.state &&
            window.history.state.view === view &&
            window.history.state.dashboardPath === dashboardPath &&
            window.history.state.viewId === viewId) {
            return;
        }

        window.history.pushState(state, '', url);
    }, [buildUrl]);

    // Replace current history state (used for redirects or initial load)
    const replaceView = useCallback((view: string, dashboardPath?: string, viewId?: any) => {
        const url = buildUrl(view, dashboardPath, viewId);
        const state: NavigationState = { view, dashboardPath, viewId };
        window.history.replaceState(state, '', url);
    }, [buildUrl]);

    // Handle popstate event (back/forward buttons)
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (event.state) {
                onStateChange(event.state as NavigationState);
            } else {
                // Fallback: parse URL if state is missing
                const state = parseUrlToState();
                onStateChange(state);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [onStateChange]);

    return { pushView, replaceView, buildUrl, parseUrlToState };
}

/**
 * Utility to parse current URL into an application state
 */
export function parseUrlToState(): NavigationState {
    const path = window.location.pathname;

    if (path === '/' || path === '/role-selection') return { view: 'role-selection' };
    if (path === '/landing') return { view: 'landing' };
    if (path === '/auth/customer-login') return { view: 'customer-login' };
    if (path === '/auth/merchant-login') return { view: 'merchant-login' };
    if (path === '/auth/admin-login') return { view: 'admin-login' };
    if (path === '/auth/register') return { view: 'customer-register' };
    if (path === '/auth/merchant-register') return { view: 'vendor-register' };
    if (path === '/auth/forgot-password') return { view: 'forgot-password' };
    if (path === '/auth/reset-password') return { view: 'reset-password' };
    if (path === '/auth/account-recovery') return { view: 'account-recovery' };
    if (path === '/legal/terms') return { view: 'terms' };
    if (path === '/wholesale') return { view: 'wholesale' };
    if (path === '/how-it-works') return { view: 'how-we-work' };
    if (path === '/tutorial') return { view: 'how-we-work-tutorial' };

    if (path.startsWith('/dashboard/')) {
        const segments = path.split('/').filter(Boolean); // ["dashboard", "orders", "123"]
        const dashboardPath = segments[1] || 'home';
        const viewId = segments[2] || null;
        return { view: 'dashboard', dashboardPath, viewId };
    }

    return { view: 'role-selection' };
}
