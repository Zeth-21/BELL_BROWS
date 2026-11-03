'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { Promotion } from '@/types/database';
import { buildWhatsAppPromoLink, buildWhatsAppBookingLink } from '@/lib/utils';
import styles from './PromotionModal.module.css';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: Promotion | null;
}

export default function PromotionModal({ isOpen, onClose, promotion }: PromotionModalProps) {
  // Close on Escape key & block background scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasActivePromo = Boolean(promotion && promotion.is_active);

  const handleAction = () => {
    if (hasActivePromo && promotion) {
      const url = buildWhatsAppPromoLink(promotion.title);
      window.open(url, '_blank');
    } else {
      const url = buildWhatsAppBookingLink('Consulta de Promociones Especiales', 0);
      window.open(url, '_blank');
    }
    onClose();
  };

  return (
    <div 
      className={styles.modalBackdrop} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-modal-title"
    >
      <div 
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Cerrar ventana de promoción"
        >
          <X size={20} />
        </button>

        {/* Content */}
        {hasActivePromo && promotion ? (
          <div className={styles.modalContent}>
            {promotion.image_url && (
              <div className={styles.imageWrapper}>
                <Image
                  src={promotion.image_url}
                  alt={promotion.title}
                  fill
                  sizes="(max-width: 600px) 90vw, 480px"
                  className={styles.promoImg}
                  priority
                />
                <div className={styles.imageOverlay} />
              </div>
            )}

            <div className={styles.bodyWrapper}>
              <div className={styles.badgeRow}>
                <span className={styles.promoBadge}>
                  <Sparkles size={14} />
                  <span>{promotion.badge || 'OFERTA DESTACADA'}</span>
                </span>
                <span className={styles.urgencyText}>¡Tiempo Limitado!</span>
              </div>

              <h2 id="promo-modal-title" className={styles.promoTitle}>
                {promotion.title}
              </h2>

              {promotion.description && (
                <p className={styles.promoDescription}>
                  {promotion.description}
                </p>
              )}

              <div className={styles.actionRow}>
                <button
                  type="button"
                  onClick={handleAction}
                  className={styles.ctaButton}
                  aria-label={`Aprovechar oferta: ${promotion.title}`}
                >
                  <MessageCircle size={18} />
                  <span>Aprovechar Oferta por WhatsApp</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.modalContentFallback}>
            <div className={styles.fallbackIconWrap}>
              <Sparkles size={36} />
            </div>
            <h2 id="promo-modal-title" className={styles.fallbackTitle}>
              Promociones & Experiencias Bell Brows
            </h2>
            <p className={styles.fallbackText}>
              En este momento estamos renovando nuestras promociones de temporada. Escríbenos para consultar paquetes y beneficios exclusivos del mes.
            </p>
            <div className={styles.actionRow}>
              <button
                type="button"
                onClick={handleAction}
                className={styles.ctaButton}
              >
                <MessageCircle size={18} />
                <span>Consultar Promociones por WhatsApp</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

