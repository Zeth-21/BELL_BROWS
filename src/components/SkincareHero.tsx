'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  X,
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
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  onOpenPromotion?: () => void;
}

const OFFICIAL_CATEGORIES = [
  { label: 'PESTAÑAS', value: 'Pestañas', subtext: 'Lifting & Extensiones' },
  { label: 'UÑAS', value: 'Uñas', subtext: 'Manicure & Acripie' },
  { label: 'CABELLO', value: 'Cabello', subtext: 'Ondulación & Spa Capilar' },
  { label: 'MICRO', value: 'Micro', subtext: 'Microblading & Lamination' },
  { label: 'LIMPIEZA FACIAL', value: 'Limpieza Facial', subtext: 'Glow & Hidrodermoabrasión' },
];

export default function SkincareHero({ 
  promotion, 
  activeCategory = 'Todos', 
  onSelectCategory,
  onOpenPromotion 
}: SkincareHeroProps) {
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

  const handleCategoryClick = (categoryValue: string) => {
    setMobileMenuOpen(false);
    onSelectCategory?.(categoryValue);
    const target = document.getElementById('coleccion-exclusiva') || document.getElementById('catalogo');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePromotionsClick = () => {
    setMobileMenuOpen(false);
    if (onOpenPromotion) {
      onOpenPromotion();
    } else if (promotion && promotion.is_active) {
      window.open(buildWhatsAppPromoLink(promotion.title), '_blank');
    } else {
      const target = document.getElementById('coleccion-exclusiva') || document.getElementById('catalogo');
      target?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMainAction = () => {
    if (promotion && promotion.is_active) {
      const url = buildWhatsAppPromoLink(promotion.title);
      window.open(url, '_blank');
    } else {
      const url = buildWhatsAppBookingLink('Nueva Colección Exclusiva & Belleza Natural', 0);
      window.open(url, '_blank');
    }
  };

  const handleProductClick = (productName: string) => {
    const text = `¡Hola Bell Brows! Vi su producto "${productName}" en la nueva colección y me gustaría consultar disponibilidad y precio.`;
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section className={styles.heroWrapper} aria-label="Colección Exclusiva Bell Brows">
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
              <span className={styles.brandSub}>ESTUDIO DE BELLEZA</span>
            </div>
          </a>

          <nav className={styles.navLinks} aria-label="Navegación principal">
            {OFFICIAL_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryClick(cat.value)}
                className={`${styles.navLink} ${activeCategory === cat.value ? styles.navLinkActive : ''}`}
              >
                {cat.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handlePromotionsClick}
              className={styles.navLink}
            >
              PROMOCIONES
            </button>
            <a href="/portal-interno" className={styles.navLink}>
              ACCESO
            </a>
          </nav>

          <div className={styles.navActions}>
            {/* Offer / Catalog Bag with Badge */}
            <button 
              onClick={handlePromotionsClick}
              className={styles.cartIconBtn}
              aria-label="Ver promociones y servicios"
              title="Promociones y servicios"
            >
              <ShoppingBag size={18} stroke="#ffffff" strokeWidth={2.2} />
              <span className={styles.cartBadge}>{promotion && promotion.is_active ? '1' : '0'}</span>
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

            {/* Mobile Action: 3-bar hamburger button */}
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

        {/* Mobile Quick Navigation Bar */}
        <nav className={styles.mobileCategoriesBar} aria-label="Categorías principales">
          <button 
            type="button"
            onClick={() => handleCategoryClick('Todos')} 
            className={`${styles.catChip} ${activeCategory === 'Todos' ? styles.catChipActive : ''}`}
          >
            <Sparkles size={12} />
            <span>TODOS</span>
          </button>
          {OFFICIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryClick(cat.value)}
              className={`${styles.catChip} ${activeCategory === cat.value ? styles.catChipActive : ''}`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
          <button 
            type="button"
            onClick={handlePromotionsClick} 
            className={styles.catChip}
          >
            <span>PROMOCIONES</span>
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
                  type="button"
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
                    type="button"
                    onClick={() => handleCategoryClick('Todos')}
                    className={styles.drawerLink}
                  >
                    <span>Ver Catálogo Completo</span>
                    <ChevronRight size={16} />
                  </button>
                  {OFFICIAL_CATEGORIES.map((cat) => (
                    <button 
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategoryClick(cat.value)}
                      className={styles.drawerLink}
                    >
                      <span>{cat.label} ({cat.subtext})</span>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                  <button 
                    type="button"
                    onClick={handlePromotionsClick}
                    className={styles.drawerLink}
                  >
                    <span>Promociones Especiales</span>
                    <ChevronRight size={16} />
                  </button>
                  <a 
                    href="/portal-interno"
                    className={styles.drawerLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Portal de Gestión (Acceso)</span>
                    <ExternalLink size={15} />
                  </a>
                </nav>

                <div className={styles.drawerFooter}>
                  <button
                    type="button"
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

        {/* High-Impact Headline: NUEVA COLECCIÓN EXCLUSIVA */}
        <div className={styles.headlineContainer}>
          <h1 className={styles.headlineText}>
            <span className={styles.headlineNew}>NUEVA</span>
            <span className={styles.headlineRest}>COLECCIÓN EXCLUSIVA</span>
          </h1>
        </div>

        {/* Editorial Layout: Mascot Centered with Floating Badges + Right Products */}
        <div className={styles.editorialGrid}>
          {/* Central Column: Mascot in Green Robe + Floating Badges */}
          <div className={styles.centerColumn}>
            <div className={styles.mascotStage}>
              {/* Badge 1: Left of Cat */}
              <div className={`${styles.floatingBadge} ${styles.badgeLeft} ${styles.desktopBadges}`}>
                <ShieldCheck size={16} className={styles.badgeIcon} />
                <span>TESTADO DERMATOLÓGICAMENTE</span>
              </div>

              {/* Main Cat Mascot cut-out */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/GATO.png"
                alt="Mascota Bell Brows Colección de Belleza"
                className={styles.catImg}
              />

              {/* Badge 2: Center Bottom */}
              <div className={`${styles.floatingBadge} ${styles.badgeBottom} ${styles.desktopBadges}`}>
                <Droplets size={16} className={styles.badgeIcon} />
                <span>APTO PARA PIEL SENSIBLE</span>
              </div>

              {/* Badge 3: Right of Cat */}
              <div className={`${styles.floatingBadge} ${styles.badgeRight} ${styles.desktopBadges}`}>
                <Leaf size={16} className={styles.badgeIcon} />
                <span>INGREDIENTES NATURALES</span>
              </div>
            </div>

            {/* Mobile badges row: All 3 badges prominently displayed in Spanish */}
            <div className={styles.mobileBadgesRow}>
              <div className={styles.mobileBadgeChip}>
                <ShieldCheck size={14} className={styles.badgeIcon} />
                <span>TESTADO DERMATOLÓGICAMENTE</span>
              </div>
              <div className={styles.mobileBadgeChip}>
                <Droplets size={14} className={styles.badgeIcon} />
                <span>APTO PARA PIEL SENSIBLE</span>
              </div>
              <div className={styles.mobileBadgeChip}>
                <Leaf size={14} className={styles.badgeIcon} />
                <span>INGREDIENTES NATURALES</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Beauty Badge & 2 Stacked Product Preview Cards */}
          <div className={styles.rightColumn}>
            {/* Clean Beauty Circular Seal */}
            <div className={styles.cleanBeautySeal}>
              <Leaf size={20} className={styles.sealIcon} />
              <span className={styles.sealTitle}>BELLEZA LIMPIA</span>
              <span className={styles.sealSub}>PARA TU PIEL</span>
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
