'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, 
  ShoppingBag, 
  Menu, 
  X,
  ArrowRight, 
  ShieldCheck, 
  Droplets, 
  Leaf, 
  Sparkles,
  MessageCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Promotion } from '@/types/database';
import { buildWhatsAppPromoLink, buildWhatsAppBookingLink, WHATSAPP_PHONE } from '@/lib/utils';
import styles from './SkincareHero.module.css';

interface SkincareHeroProps {
  promotion: Promotion | null;
}

export default function SkincareHero({ promotion }: SkincareHeroProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);

  // Only load the video for the current viewport; never play either with reduced motion.
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px), (max-aspect-ratio: 1/1)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncVideo = () => {
      const active = mobile.matches ? mobileVideoRef.current : desktopVideoRef.current;
      const inactive = mobile.matches ? desktopVideoRef.current : mobileVideoRef.current;
      inactive?.pause();
      if (reducedMotion.matches) {
        active?.pause();
        return;
      }
      if (active) {
        active.muted = true;
        active.defaultMuted = true;
        active.play().catch(() => {
          // The hero remains usable if autoplay is restricted.
        });
      }
    };
    syncVideo();
    mobile.addEventListener('change', syncVideo);
    reducedMotion.addEventListener('change', syncVideo);
    return () => {
      mobile.removeEventListener('change', syncVideo);
      reducedMotion.removeEventListener('change', syncVideo);
      desktopVideoRef.current?.pause();
      mobileVideoRef.current?.pause();
    };
  }, []);

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Action when clicking main CTA ("SHOP NOW ->" or "APROVECHAR OFERTA ->")
  const handleMainAction = () => {
    if (promotion && promotion.is_active) {
      const url = buildWhatsAppPromoLink(promotion.title);
      window.open(url, '_blank');
    } else {
      const url = buildWhatsAppBookingLink('Nueva Colección Skincare & Belleza Natural', 0);
      window.open(url, '_blank');
    }
  };

  const handleProductClick = (productName: string) => {
    const text = `¡Hola Bell Brows! Vi su producto "${productName}" en la nueva colección y me gustaría consultar disponibilidad y precio.`;
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section className={styles.heroWrapper} aria-label="Colección Skincare Bell Brows">
      <div className={styles.heroCard}>
        {/* Background Video Layer — sits behind all content */}
        <div className={styles.videoBgLayer} aria-hidden="true">
          {/* Desktop video (16:9 landscape) */}
          <video
            ref={desktopVideoRef}
            className={styles.videoBgDesktop}
            loop
            muted
            playsInline
            preload="none"
          >
            <source src="/videoFondo/fondoweb.mp4" type="video/mp4" />
          </video>

          {/* Mobile video (9:16 portrait) */}
          <video
            ref={mobileVideoRef}
            className={styles.videoBgMobile}
            loop
            muted
            playsInline
            preload="none"
          >
            <source src="/videoFondo/Fondomobil.mp4" type="video/mp4" />
          </video>

          {/* Subtle overlay for text readability without washing out the video */}
          <div className={styles.videoOverlay} />
        </div>

        {/* Top Integrated Navigation Bar */}
        <header className={styles.heroNav}>
          <a href="#" className={styles.brandLogo} aria-label="Inicio Bell Brows">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Logo Bell Brows"
              className={styles.brandLogoImg}
            />
            <div className={styles.brandTitles}>
              <span className={styles.brandName}>BELL BROWS</span>
              <span className={styles.brandSub}>SKINCARE & BEAUTY</span>
            </div>
          </a>

          <nav className={styles.navLinks} aria-label="Navegación principal">
            <a href="#catalogo" className={styles.navLink}>SKINCARE</a>
            <a href="#catalogo" className={styles.navLink}>CEJAS</a>
            <a href="#catalogo" className={styles.navLink}>PESTAÑAS</a>
            <a href="#catalogo" className={styles.navLink}>TRATAMIENTOS</a>
            <a href="#catalogo" className={styles.navLink}>PROMOCIONES</a>
            <a href="/portal-interno" className={styles.navLink}>ACCESO</a>
          </nav>

          <div className={styles.navActions}>
            {/* Offer / Catalog Bag with Badge (Present on desktop & mobile, with crystal-clear white icon) */}
            <button 
              onClick={() => scrollToSection('catalogo')}
              className={styles.cartIconBtn}
              aria-label="Ver catálogo y ofertas"
              title="Promociones y servicios"
            >
              <ShoppingBag size={18} stroke="#ffffff" strokeWidth={2.2} />
              <span className={styles.cartBadge}>{promotion ? '1' : '0'}</span>
            </button>

            {/* Desktop Action: Quick WhatsApp appointment booking CTA */}
            <button 
              onClick={handleMainAction}
              className={styles.desktopBookingBtn}
              aria-label="Agendar Cita por WhatsApp"
            >
              <MessageCircle size={16} />
              <span>Agendar Cita</span>
            </button>

            {/* Mobile Action: Ultra-intuitive 3-bar hamburger button with explicit 'MENÚ' label */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className={styles.menuPillBtn}
              aria-label="Abrir menú de navegación"
              aria-expanded={mobileMenuOpen}
            >
              <span className={styles.hamburgerBars}>
                <span className={styles.hamburgerBar}></span>
                <span className={styles.hamburgerBar}></span>
                <span className={styles.hamburgerBar}></span>
              </span>
              <span className={styles.menuBtnText}>MENÚ</span>
            </button>
          </div>
        </header>

        {/* Mobile Quick Navigation Bar: Preserving ALL Desktop Navigation Fields */}
        <nav className={styles.mobileCategoriesBar} aria-label="Categorías principales">
          <button onClick={() => scrollToSection('catalogo')} className={`${styles.catChip} ${styles.catChipActive}`}>
            <Sparkles size={12} />
            <span>TODOS</span>
          </button>
          <button onClick={() => scrollToSection('catalogo')} className={styles.catChip}>
            <span>SKINCARE</span>
          </button>
          <button onClick={() => scrollToSection('catalogo')} className={styles.catChip}>
            <span>CEJAS</span>
          </button>
          <button onClick={() => scrollToSection('catalogo')} className={styles.catChip}>
            <span>PESTAÑAS</span>
          </button>
          <button onClick={() => scrollToSection('catalogo')} className={styles.catChip}>
            <span>TRATAMIENTOS</span>
          </button>
          <button onClick={() => scrollToSection('catalogo')} className={styles.catChip}>
            <span>PROMOS</span>
          </button>
          <a href="/portal-interno" className={styles.catChip}>
            <span>ACCESO</span>
          </a>
        </nav>

        {/* Mobile Navigation Drawer & Backdrop */}
        {mobileMenuOpen && (
          <div 
            className={styles.drawerBackdrop}
            onClick={() => setMobileMenuOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Menú móvil"
          >
            <div 
              className={styles.drawerSheet}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.drawerHeader}>
                <div className={styles.drawerBrand}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.svg"
                    alt="Logo Bell Brows"
                    style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px' }}
                  />
                  <div>
                    <span className={styles.drawerBrandName}>BELL BROWS</span>
                    <span className={styles.drawerBrandSub}>ESTUDIO DE BELLEZA</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.drawerCloseBtn}
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>

              <div className={styles.drawerBody}>
                <nav className={styles.drawerNavLinks} aria-label="Menú de navegación móvil">
                  <button 
                    onClick={() => scrollToSection('catalogo')}
                    className={styles.drawerLink}
                  >
                    <span>Tratamientos & Catálogo</span>
                    <ChevronRight size={16} />
                  </button>
                  <button 
                    onClick={() => scrollToSection('catalogo')}
                    className={styles.drawerLink}
                  >
                    <span>Cejas (Microblading / Lamination)</span>
                    <ChevronRight size={16} />
                  </button>
                  <button 
                    onClick={() => scrollToSection('catalogo')}
                    className={styles.drawerLink}
                  >
                    <span>Pestañas (Lash Lifting & Extensiones)</span>
                    <ChevronRight size={16} />
                  </button>
                  <button 
                    onClick={() => scrollToSection('catalogo')}
                    className={styles.drawerLink}
                  >
                    <span>Skincare & Cuidado Facial</span>
                    <ChevronRight size={16} />
                  </button>
                  <a 
                    href="/portal-interno"
                    className={styles.drawerLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Portal de Gestión (Admin)</span>
                    <ExternalLink size={15} />
                  </a>
                </nav>

                <div className={styles.drawerFooter}>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleMainAction();
                    }}
                    className={`btn btn-whatsapp ${styles.drawerWaBtn}`}
                  >
                    <MessageCircle size={18} />
                    <span>Agendar Cita por WhatsApp</span>
                  </button>
                  <p className={styles.drawerHours}>
                    Horario: Lun - Sáb 10:00 AM - 7:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* High-Impact Headline: NEW SKIN CARE COLLECTION */}
        <div className={styles.headlineContainer}>
          <h1 className={styles.headlineText}>
            <span className={styles.headlineNew}>NEW</span>
            <span className={styles.headlineRest}>SKIN CARE COLLECTION</span>
          </h1>
        </div>

        {/* Editorial Layout: Left Details, Center Mascot with Floating Badges, Right Products */}
        <div className={styles.editorialGrid}>
          {/* Left Column: Tagline, Description & CTA */}
          <div className={styles.leftColumn}>
            {promotion && promotion.is_active && (
              <div className={styles.promoTag}>
                <Sparkles size={13} />
                <span>{promotion.badge || 'PROMO ACTIVA'}</span>
              </div>
            )}

            <h2 className={styles.tagline}>
              {promotion && promotion.is_active ? (
                promotion.title
              ) : (
                <>
                  NATURALLY BEAUTIFUL.<br />
                  SCIENTIFICALLY PROVEN.
                </>
              )}
            </h2>

            <p className={styles.description}>
              {promotion && promotion.is_active && promotion.description
                ? promotion.description
                : 'Dermatologist-approved skincare that combines the power of natural ingredients with advanced science for clear, healthy, radiant skin.'}
            </p>

            <div className={styles.btnGroup}>
              <button
                onClick={handleMainAction}
                className={styles.primaryPillBtn}
                aria-label={promotion ? `Aprovechar: ${promotion.title}` : 'Comprar o agendar ahora'}
              >
                <span>{promotion && promotion.is_active ? 'APROVECHAR OFERTA' : 'SHOP NOW'}</span>
                <ArrowRight size={16} />
              </button>

              <a href="#catalogo" className={styles.secondaryPillBtn}>
                EXPLORE
              </a>
            </div>
          </div>

          {/* Center Column: Cat Mascot in Green Robe + Floating Badges */}
          <div className={styles.centerColumn}>
            <div className={styles.mascotStage}>
              {/* Badge 1: Left of Cat */}
              <div className={`${styles.floatingBadge} ${styles.badgeLeft} ${styles.desktopBadges}`}>
                <ShieldCheck size={16} className={styles.badgeIcon} />
                <span>DERMATOLOGIST TESTED</span>
              </div>

              {/* Main Cat Mascot cut-out */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/GATO.png"
                alt="Bell Brows Spa Skincare Cat Mascot"
                className={styles.catImg}
              />

              {/* Badge 2: Center Bottom */}
              <div className={`${styles.floatingBadge} ${styles.badgeBottom} ${styles.desktopBadges}`}>
                <Droplets size={16} className={styles.badgeIcon} />
                <span>SUITABLE FOR SENSITIVE SKIN</span>
              </div>

              {/* Badge 3: Right of Cat */}
              <div className={`${styles.floatingBadge} ${styles.badgeRight} ${styles.desktopBadges}`}>
                <Leaf size={16} className={styles.badgeIcon} />
                <span>NATURAL INGREDIENTS</span>
              </div>
            </div>

            {/* Mobile badges row for clean mobile layout: ALL 3 Desktop badges prominently displayed */}
            <div className={styles.mobileBadgesRow}>
              <div className={styles.mobileBadgeChip}>
                <ShieldCheck size={14} className={styles.badgeIcon} />
                <span>DERMATOLOGIST TESTED</span>
              </div>
              <div className={styles.mobileBadgeChip}>
                <Droplets size={14} className={styles.badgeIcon} />
                <span>SUITABLE FOR SENSITIVE SKIN</span>
              </div>
              <div className={styles.mobileBadgeChip}>
                <Leaf size={14} className={styles.badgeIcon} />
                <span>NATURAL INGREDIENTS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Beauty Badge & 2 Stacked Product Preview Cards */}
          <div className={styles.rightColumn}>
            {/* Clean Beauty Circular Seal */}
            <div className={styles.cleanBeautySeal}>
              <Leaf size={20} className={styles.sealIcon} />
              <span className={styles.sealTitle}>CLEAN BEAUTY</span>
              <span className={styles.sealSub}>FOR EVERY SKIN</span>
            </div>

            {/* Stack of 2 Product Cards */}
            <div className={styles.productsStack}>
              {/* Product 1: Botanical Facial Serum */}
              <div 
                className={styles.productCard}
                onClick={() => handleProductClick('Sérum Facial Botánico')}
                title="Sérum Facial Botánico - Clic para consultar por WhatsApp"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/product-serum.jpg"
                  alt="Sérum Facial Botánico Bell Brows"
                  className={styles.productImg}
                />
              </div>

              {/* Product 2: Botanical Hydration Moisturizer */}
              <div 
                className={styles.productCard}
                onClick={() => handleProductClick('Crema Hidratante Botánica')}
                title="Crema Hidratante Botánica - Clic para consultar por WhatsApp"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/product-cream.jpg"
                  alt="Crema Hidratante Botánica Bell Brows"
                  className={styles.productImg}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
