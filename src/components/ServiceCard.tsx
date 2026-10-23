'use client';

import React from 'react';
import Image from 'next/image';
import { Clock, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Service } from '@/types/database';
import { formatPrice, formatDuration, buildWhatsAppBookingLink } from '@/lib/utils';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [imgSrc, setImgSrc] = React.useState<string>(service.image_url || '/product-cream.jpg');

  const handleBooking = () => {
    const url = buildWhatsAppBookingLink(service.title, service.price);
    window.open(url, '_blank');
  };

  // Build Image 1 signature editorial subtitle with slashes: e.g. "CEJAS / TRATAMIENTO / 2H"
  const getEditorialSubtitle = () => {
    const tags: string[] = [];
    if (service.category) {
      tags.push(service.category.toUpperCase());
    }
    tags.push('TRATAMIENTO');
    if (service.duration_minutes > 0) {
      tags.push(formatDuration(service.duration_minutes).toUpperCase());
    }
    return tags.join('  /  ');
  };

  return (
    <article className={styles.card} aria-label={`Servicio: ${service.title}`}>
      {/* Editorial Framed Photography */}
      <div className={styles.imageWrapper}>
        <div className={styles.imageContainer}>
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={service.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
              className={styles.image}
              loading="lazy"
              onError={() => setImgSrc('/product-cream.jpg')}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <Sparkles size={36} className={styles.placeholderIcon} />
              <span>Bell Brows</span>
            </div>
          )}

          {/* Discreet Frosted Glass Duration Badge */}
          {service.duration_minutes > 0 && (
            <div className={styles.badgeContainer}>
              <span className={styles.durationBadge}>
                <Clock size={11} className={styles.badgeIcon} />
                <span>{formatDuration(service.duration_minutes)}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Editorial Content: Centered Composition directly matching Image 1 */}
      <div className={styles.content}>
        {/* Title in Luxury Editorial Serif Typography */}
        <h3 className={styles.title}>{service.title}</h3>

        {/* Subtitle with Slashes matching Image 1: e.g. "CEJAS / TRATAMIENTO / 2H" */}
        <div className={styles.subtitle}>{getEditorialSubtitle()}</div>

        {/* Bold, Clean Price matching Image 1 */}
        <div className={styles.priceRow}>
          <span className={styles.priceAmount}>{formatPrice(service.price)}</span>
          <span className={styles.priceCurrency}>MXN</span>
        </div>

        {/* Description paragraph */}
        {service.description && (
          <p className={styles.description}>{service.description}</p>
        )}

        {/* Action Button: Signature Image 1 Dark Forest Green Pill CTA */}
        <div className={styles.actionWrap}>
          <button
            onClick={handleBooking}
            className={styles.bookButton}
            aria-label={`Reservar ${service.title} por WhatsApp`}
          >
            <MessageCircle size={16} className={styles.btnIconLeft} />
            <span className={styles.btnLabel}>Reservar Cita</span>
            <ArrowRight size={15} className={styles.btnArrow} />
          </button>
        </div>
      </div>
    </article>
  );
}
