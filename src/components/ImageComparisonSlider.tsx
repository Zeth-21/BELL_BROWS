'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronsLeftRight } from 'lucide-react';
import styles from './ImageComparisonSlider.module.css';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  alt: string;
  className?: string;
}

export default function ImageComparisonSlider({
  beforeImage,
  afterImage,
  alt,
  className = '',
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
    setHasInteracted(true);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updatePosition(e.clientX);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback si no soporta setPointerCapture
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignorar
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
      setHasInteracted(true);
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
      setHasInteracted(true);
    }
  };

  // Ocultar pista de interacción tras unos segundos si el usuario no interactúa
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasInteracted(true);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.sliderContainer} ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label={`Comparación de antes y después para ${alt}`}
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Capa Inferior: Foto del DESPUÉS (Resultado final de belleza) */}
      <div className={styles.afterImageLayer}>
        <Image
          src={afterImage}
          alt={`${alt} - Resultado Final`}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className={styles.sliderImg}
          priority
        />
      </div>

      {/* Capa Superior: Foto del ANTES recortada con clip-path */}
      <div
        className={styles.beforeImageLayer}
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
        }}
      >
        <Image
          src={beforeImage}
          alt={`${alt} - Estado Inicial`}
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className={styles.sliderImg}
          priority
        />
      </div>

      {/* Línea divisoria y tirador interactivo */}
      <div
        className={styles.dividerLine}
        style={{ left: `${sliderPosition}%` }}
      >
        <div className={styles.sliderHandle}>
          <ChevronsLeftRight size={20} strokeWidth={2.5} />
        </div>
      </div>

      {/* Badges de texto elegantes */}
      <span
        className={styles.badgeBefore}
        style={{ opacity: sliderPosition < 12 ? 0.2 : 1 }}
      >
        Antes
      </span>
      <span
        className={styles.badgeAfter}
        style={{ opacity: sliderPosition > 88 ? 0.2 : 1 }}
      >
        Después
      </span>

      {/* Hint interactivo inicial */}
      {!hasInteracted && (
        <div className={styles.hintOverlay}>
          <ChevronsLeftRight size={13} />
          <span>Desliza para comparar</span>
        </div>
      )}
    </div>
  );
}

