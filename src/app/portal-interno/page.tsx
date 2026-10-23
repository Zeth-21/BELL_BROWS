'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import LoginForm from '@/components/portal/LoginForm';
import PromotionsManager from '@/components/portal/PromotionsManager';
import ServicesManager from '@/components/portal/ServicesManager';
import { Sparkles, LogOut, ExternalLink, Tag, Scissors, Loader2 } from 'lucide-react';
import styles from '@/components/portal/portal.module.css';

export default function PortalInternoPage() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'promotions' | 'services'>('promotions');

  useEffect(() => {
    // Check initial auth state
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSessionUser(session?.user || null);
      } catch (err) {
        console.error('Error verificando sesión:', err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSessionUser(session?.user || null);
        setCheckingAuth(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
  };

  // While checking auth, show luxury minimalist loader
  if (checkingAuth) {
    return (
      <div className={styles.authCheckingScreen}>
        <Loader2 size={36} className={styles.spinner} />
        <span className={styles.checkingText}>Verificando credenciales de acceso...</span>
      </div>
    );
  }

  // ROUTE GUARDIAN: If not authenticated, block all panel data and render ONLY LoginForm
  if (!sessionUser) {
    return (
      <LoginForm
        onLoginSuccess={(user) => {
          if (user) setSessionUser(user);
          setCheckingAuth(false);
        }}
      />
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className={styles.portalDashboard}>
      {/* Top Admin Navbar */}
      <header className={styles.adminNavbar}>
        <div className={`container ${styles.adminNavContainer}`}>
          <div className={styles.adminBrand}>
            <div className={styles.adminLogoIcon}>
              <Sparkles size={18} />
            </div>
            <div>
              <span className={styles.adminTitle}>Portal de Gestión</span>
              <span className={styles.adminUserBadge}>
                {sessionUser.email || 'Administrador'}
              </span>
            </div>
          </div>

          <div className={styles.navActions}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-secondary ${styles.previewSiteBtn}`}
              title="Abrir sitio web público en nueva pestaña"
            >
              <ExternalLink size={16} />
              <span className={styles.previewBtnText}>Ver Web</span>
            </a>

            <button
              onClick={handleLogout}
              className={`btn ${styles.logoutBtn}`}
              title="Cerrar sesión"
            >
              <LogOut size={16} />
              <span className={styles.logoutBtnText}>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={`container ${styles.dashboardMain}`}>
        {/* Navigation Tabs (Mobile friendly touch pills) */}
        <div className={styles.tabsWrapper}>
          <div className={styles.tabButtons}>
            <button
              onClick={() => setActiveTab('promotions')}
              className={`${styles.tabBtn} ${
                activeTab === 'promotions' ? styles.tabBtnActive : ''
              }`}
              aria-selected={activeTab === 'promotions'}
            >
              <Tag size={18} />
              <span>Promoción Destacada</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`${styles.tabBtn} ${
                activeTab === 'services' ? styles.tabBtnActive : ''
              }`}
              aria-selected={activeTab === 'services'}
            >
              <Scissors size={18} />
              <span>Servicios Permanentes</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContentArea}>
          {activeTab === 'promotions' ? (
            <PromotionsManager />
          ) : (
            <ServicesManager />
          )}
        </div>
      </main>
    </div>
  );
}
