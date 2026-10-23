'use client';

import React from 'react';
import Image from 'next/image';
import { Clock, MessageCircle, Sparkles } from 'lucide-react';
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

  return (
    <article className={styles.card} aria-label={`Servicio: ${service.title}`}>
      {/* Image Container with 16:10 or 4:3 Aspect Ratio */}
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
        <div className={styles.imageGradient} />

        {/* Top Floating Badges */}
        <div className={styles.badgeContainer}>
          {service.category && (
            <span className={styles.categoryBadge}>{service.category}</span>
          )}
          {service.duration_minutes > 0 && (
            <span className={styles.durationBadge}>
              <Clock size={12} />
              {formatDuration(service.duration_minutes)}
            </span>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{service.title}</h3>
          <div className={styles.priceTag}>
            <span className={styles.priceAmount}>{formatPrice(service.price)}</span>
          </div>
        </div>

        {service.description && (
          <p className={styles.description}>{service.description}</p>
        )}

        <div className={styles.footer}>
          <button
            onClick={handleBooking}
            className={`btn btn-primary ${styles.bookButton}`}
            aria-label={`Reservar ${service.title} por WhatsApp`}
          >
            <MessageCircle size={18} />
            <span>Reservar Cita</span>
          </button>
        </div>
      </div>
    </article>
  );
}
