'use client';

import React from 'react';
import { Sparkles, MessageCircle, Clock, MapPin } from 'lucide-react';
import { WHATSAPP_PHONE } from '@/lib/utils';
import styles from './Header.module.css';

export default function Header() {
  const handleBooking = () => {
    const text = '¡Hola Bell Brows! Me gustaría obtener información sobre sus servicios y disponibilidad de citas.';
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <header className={styles.header}>
      {/* Top micro info bar */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarContent}`}>
          <div className={styles.infoItem}>
            <Clock size={13} className={styles.topIcon} />
            <span>Lun a Sáb: 10:00 AM - 7:00 PM</span>
          </div>
          <div className={styles.infoDivider}>•</div>
          <div className={styles.infoItem}>
            <MapPin size={13} className={styles.topIcon} />
            <span>Citas Personalizadas & Atención VIP</span>
          </div>
        </div>
      </div>

      {/* Main navigation / brand bar */}
      <div className={`container ${styles.mainBar}`}>
        <div className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Logo Bell Brows"
            className={styles.headerLogoImg}
            style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '8px', flexShrink: 0 }}
          />
          <div className={styles.brandText}>
            <span className={styles.brandName}>BELL BROWS</span>
            <span className={styles.brandTagline}>ESTUDIO DE MIRADA & BELLEZA</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={handleBooking}
            className={`btn btn-whatsapp ${styles.ctaButton}`}
            aria-label="Agendar cita por WhatsApp"
          >
            <MessageCircle size={18} />
            <span className={styles.btnText}>Agendar Cita</span>
          </button>
        </div>
      </div>
    </header>
  );
}
