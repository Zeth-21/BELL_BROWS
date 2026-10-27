'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Service } from '@/types/database';
import { formatPrice, buildWhatsAppBookingLink } from '@/lib/utils';
import { BotanicalSprig, CenterLeafAccent, BotanicalWatermark } from './BotanicalLeaf';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
  service: Service;
  variant?: 'horizontal' | 'featured';
  onPrev?: () => void;
  onNext?: () => void;
  hasNavigation?: boolean;
}

export default function ServiceCard({
  service,
  variant = 'horizontal',
  onPrev,
  onNext,
  hasNavigation = false,
}: ServiceCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(service.image_url || '/product-cream.jpg');

  const handleBooking = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = buildWhatsAppBookingLink(service.title, service.price);
    window.open(url, '_blank');
  };

  // =========================================================================
  // VARIANTE 1: TARJETA DESTACADA CENTRAL (Fondo oscuro, alta, estilo Imagen 1)
  // =========================================================================
  if (variant === 'featured') {
    return (
      <article
        className={styles.featuredCard}
        onClick={handleBooking}
        aria-label={`Servicio destacado: ${service.title}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBooking();
          }
        }}
      >
        {/* Marca de agua botánica sutil de fondo */}
        <BotanicalWatermark className={styles.featuredWatermark} />

        {/* Contenedor de Imagen Superior */}
        <div className={styles.featuredImageWrap}>
          {/* Hojas botánicas decorativas en las esquinas */}
          <CenterLeafAccent className={styles.featuredLeafLeft} />
          <CenterLeafAccent className={styles.featuredLeafRight} />

          <div className={styles.featuredImageContainer}>
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={service.title}
                fill
                sizes="(max-width: 768px) 100vw, 440px"
                className={styles.featuredImg}
                priority
                onError={() => setImgSrc('/product-cream.jpg')}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <Sparkles size={32} />
                <span>Bell Brows</span>
              </div>
            )}
            <div className={styles.featuredImageGlow} />
          </div>

          {/* Flechas de navegación del carrusel destacado */}
          {hasNavigation && (
            <div className={styles.navArrowsRow}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev?.();
                }}
                className={styles.navArrowBtn}
                aria-label="Servicio destacado anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNext?.();
                }}
                className={styles.navArrowBtn}
                aria-label="Siguiente servicio destacado"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Contenido Central: Título, Línea y Precio en Soles */}
        <div className={styles.featuredContent}>
          <h3 className={styles.featuredTitle}>{service.title}</h3>
          <div className={styles.featuredDivider} />
          <div className={styles.featuredPriceRow}>
            <span className={styles.featuredPriceAmount}>
              {formatPrice(service.price)}
            </span>
          </div>

          {/* Botón píldora blanco idéntico en forma al botón de la Imagen 1, adaptado para reserva */}
          <button
            type="button"
            onClick={handleBooking}
            className={styles.featuredCtaButton}
            aria-label={`Reservar ${service.title} por WhatsApp`}
          >
            <MessageCircle size={16} />
            <span>Reservar Cita</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </article>
    );
  }

  // =========================================================================
  // VARIANTE 2: TARJETA HORIZONTAL LATERAL (Estilo exacto Imagen 1)
  // Foto redondeada con hojas a la izquierda + Título, Línea de acento y Precio a la derecha
  // =========================================================================
  return (
    <article
      className={styles.horizontalCard}
      onClick={handleBooking}
      aria-label={`Servicio: ${service.title}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleBooking();
        }
      }}
    >
      {/* Marco de imagen con hojas botánicas orgánicas */}
      <div className={styles.horizontalVisualWrap}>
        <BotanicalSprig className={styles.horizontalLeafSprig} />
        <div className={styles.horizontalImageFrame}>
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={service.title}
              fill
              sizes="(max-width: 640px) 100px, 110px"
              className={styles.horizontalImg}
              loading="lazy"
              onError={() => setImgSrc('/product-cream.jpg')}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <Sparkles size={20} />
            </div>
          )}
        </div>
      </div>

      {/* Información: Título, Línea divisoria y Precio */}
      <div className={styles.horizontalInfoWrap}>
        <h3 className={styles.horizontalTitle}>{service.title}</h3>
        <div className={styles.horizontalDivider} />
        <div className={styles.horizontalPriceRow}>
          <span className={styles.horizontalPriceAmount}>
            {formatPrice(service.price)}
          </span>
        </div>
      </div>
    </article>
  );
}
