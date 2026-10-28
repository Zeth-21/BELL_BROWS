'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, MessageCircle, Clock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Service } from '@/types/database';
import { formatPrice, formatDuration, buildWhatsAppBookingLink, normalizeServiceCategory } from '@/lib/utils';
import { BotanicalSprig, BotanicalWatermark } from './BotanicalLeaf';
import styles from './ServiceDetailModal.module.css';

interface ServiceDetailModalProps {
  service: Service;
  onClose: () => void;
}

export default function ServiceDetailModal({ service, onClose }: ServiceDetailModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Prevent background scrolling while modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleBooking = () => {
    const url = buildWhatsAppBookingLink(service.title, service.price);
    window.open(url, '_blank');
  };

  const categoryName = normalizeServiceCategory(service);

  // Fallback description if the service doesn't have one
  const detailedDescription =
    service.description && service.description.trim().length > 0
      ? service.description
      : `Tratamiento exclusivo de ${categoryName} diseñado con técnicas de vanguardia, pigmentos y activos botánicos biocompatibles que realzan tu belleza natural con máxima durabilidad y cuidado dérmico.`;

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-service-title"
    >
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Botanical Watermark */}
        <BotanicalWatermark className={styles.modalWatermark} />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Cerrar detalles del servicio"
        >
          <X size={20} />
        </button>

        <div className={styles.modalLayout}>
          {/* Visual Side: Large Crisp Photography */}
          <div className={styles.modalVisualWrap}>
            <div className={styles.modalImageFrame}>
              {service.image_url ? (
                <Image
                  src={service.image_url}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className={styles.modalImg}
                  priority
                />
              ) : (
                <div className={styles.modalImagePlaceholder}>
                  <Sparkles size={40} />
                  <span>Bell Brows</span>
                </div>
              )}
              <div className={styles.imageGlowOverlay} />
            </div>

            {/* Botanical decorative sprig on corner */}
            <BotanicalSprig className={styles.modalLeafSprig} />

            {/* Badges floating on bottom/top */}
            <div className={styles.visualBadgesRow}>
              <span className={styles.categoryBadge}>{categoryName}</span>
              {service.duration_minutes > 0 && (
                <span className={styles.durationBadge}>
                  <Clock size={13} />
                  <span>{formatDuration(service.duration_minutes)}</span>
                </span>
              )}
            </div>
          </div>

          {/* Info Side: Title, Price, Description, Trust Highlights, and WhatsApp CTA */}
          <div className={styles.modalContentWrap}>
            <div className={styles.modalCategoryPretitle}>
              <span>TRATAMIENTO EXCLUSIVO</span>
            </div>

            <h2 id="modal-service-title" className={styles.modalTitle}>
              {service.title}
            </h2>

            <div className={styles.modalDivider} />

            <div className={styles.modalPriceContainer}>
              <span className={styles.priceLabel}>Inversión</span>
              <div className={styles.priceRow}>
                <span className={styles.modalPriceAmount}>
                  {formatPrice(service.price)}
                </span>
                <span className={styles.priceCurrency}>PEN</span>
              </div>
            </div>

            <div className={styles.modalDescriptionBox}>
              <h3 className={styles.descHeading}>Sobre el Tratamiento</h3>
              <p className={styles.modalDescriptionText}>
                {detailedDescription}
              </p>
            </div>

            {/* Service Highlights */}
            <div className={styles.serviceHighlights}>
              <div className={styles.highlightItem}>
                <Sparkles size={16} className={styles.highlightIcon} />
                <span>Atención personalizada & visagismo facial</span>
              </div>
              <div className={styles.highlightItem}>
                <ShieldCheck size={16} className={styles.highlightIcon} />
                <span>Productos botánicos prémium certificados</span>
              </div>
            </div>

            {/* Primary Action Button: WhatsApp Booking */}
            <div className={styles.modalActionArea}>
              <button
                type="button"
                onClick={handleBooking}
                className={styles.whatsappBookingBtn}
                aria-label={`Reservar ${service.title} por WhatsApp`}
              >
                <MessageCircle size={20} className={styles.btnIcon} />
                <span className={styles.btnLabel}>Reservar por WhatsApp</span>
                <ArrowRight size={18} className={styles.btnArrow} />
              </button>
              <p className={styles.actionNote}>
                Respuesta inmediata para confirmar fecha, hora y resolver dudas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
