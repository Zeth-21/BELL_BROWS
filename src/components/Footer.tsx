'use client';

import React from 'react';
import { Sparkles, MessageCircle, MapPin, Clock, Heart } from 'lucide-react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '@/lib/utils';
import styles from './Footer.module.css';

export default function Footer() {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Bell%20Brows%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n.`, '_blank');
  };

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.grid}>
          {/* Brand info */}
          <div className={styles.brandCol}>
            <div className={styles.brandTitle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="Logo Bell Brows"
                className={styles.footerLogoImg}
              />
              <span>BELL BROWS</span>
            </div>
            <p className={styles.brandDesc}>
              Estudio profesional especializado en realzar la belleza natural de tu mirada con técnicas hiperrealistas de microblading, laminado y estética facial personalizada.
            </p>
          </div>

          {/* Opening Hours */}
          <div className={styles.infoCol}>
            <h4 className={styles.colTitle}>
              <Clock size={16} className={styles.colIcon} />
              Horario de Atención
            </h4>
            <ul className={styles.infoList}>
              <li>Lunes a Viernes: 10:00 AM - 7:00 PM</li>
              <li>Sábados: 9:00 AM - 6:00 PM</li>
              <li>Domingos: Previa cita VIP</li>
            </ul>
          </div>

          {/* Location & Contact */}
          <div className={styles.infoCol}>
            <h4 className={styles.colTitle}>
              <MapPin size={16} className={styles.colIcon} />
              Ubicación & Citas
            </h4>
            <p className={styles.locationText}>
              Zona Exclusiva de Belleza y Cuidado Personal
            </p>
            <button
              onClick={handleWhatsApp}
              className={`btn btn-whatsapp ${styles.waButton}`}
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle size={16} />
              <span>Contactar por WhatsApp</span>
            </button>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} BELL BROWS. Todos los derechos reservados.
          </p>
          <div className={styles.crafted}>
            <span>Hecho con</span>
            <Heart size={14} className={styles.heartIcon} />
            <span>para resaltar tu belleza</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
