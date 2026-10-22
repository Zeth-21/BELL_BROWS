'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { Promotion } from '@/types/database';
import { buildWhatsAppPromoLink } from '@/lib/utils';
import styles from './PromoBanner.module.css';

interface PromoBannerProps {
  promotion: Promotion | null;
}

export default function PromoBanner({ promotion }: PromoBannerProps) {
  // If no promotion or promotion is not active, do NOT render anything.
  // Zero empty space, zero margin, zero visual gaps!
  if (!promotion || !promotion.is_active) {
    return null;
  }

  const handleClaimPromo = () => {
    const url = buildWhatsAppPromoLink(promotion.title);
    window.open(url, '_blank');
  };

  return (
    <section className={styles.promoWrapper} aria-label="Promoción destacada">
      <div className={`container ${styles.promoContainer}`}>
        <div className={styles.promoCard}>
          {/* Subtle background glow effect */}
          <div className={styles.glowEffect} />

          <div className={styles.contentGrid}>
            {/* Promo Photo if included */}
            {promotion.image_url && (
              <div className={styles.imageColumn}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={promotion.image_url}
                    alt={promotion.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className={styles.promoImage}
                    priority
                  />
                  <div className={styles.imageOverlay} />
                </div>
              </div>
            )}

            {/* Promo Text Details */}
            <div className={`${styles.textColumn} ${!promotion.image_url ? styles.textColumnFull : ''}`}>
              <div className={styles.badgeRow}>
                <span className={`badge badge-gold ${styles.badgePulse}`}>
                  <Sparkles size={14} />
                  {promotion.badge || 'Oferta por Tiempo Limitado'}
                </span>
                <span className={styles.promoUrgency}>¡Aprovecha hoy!</span>
              </div>

              <h2 className={styles.promoTitle}>{promotion.title}</h2>

              {promotion.description && (
                <p className={styles.promoDescription}>{promotion.description}</p>
              )}

              <div className={styles.actionRow}>
                <button
                  onClick={handleClaimPromo}
                  className={`btn btn-primary ${styles.claimButton}`}
                  aria-label={`Aprovechar promoción: ${promotion.title}`}
                >
                  <MessageCircle size={18} />
                  <span>Aprovechar Oferta por WhatsApp</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
