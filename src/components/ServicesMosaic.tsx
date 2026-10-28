'use client';

import React, { useState } from 'react';
import { Service } from '@/types/database';
import ServiceCard from './ServiceCard';
import ServiceDetailModal from './ServiceDetailModal';
import styles from './ServicesMosaic.module.css';

interface ServicesMosaicProps {
  services: Service[];
}

interface SingleMosaicBlockProps {
  blockServices: Service[];
  onSelectService: (service: Service) => void;
}

/**
 * Bloque individual de mosaico bento con 3 columnas (Izquierda: 3 | Centro: 1 | Derecha: 3)
 * Exactamente como en la Imagen 1 de referencia.
 */
function SingleMosaicBlock({ blockServices, onSelectService }: SingleMosaicBlockProps) {
  // Elegimos el servicio central por defecto (idealmente el servicio en índice 3 o mitad)
  const defaultIdx = blockServices.length >= 4 ? 3 : Math.floor(blockServices.length / 2);
  const [featuredIdx, setFeaturedIdx] = useState<number>(defaultIdx);

  const safeFeaturedIdx =
    featuredIdx >= 0 && featuredIdx < blockServices.length ? featuredIdx : 0;
  const featuredService = blockServices[safeFeaturedIdx];

  // Los demás servicios se dividen equilibradamente entre la columna izquierda y derecha
  const remaining = blockServices.filter((_, idx) => idx !== safeFeaturedIdx);
  const midPoint = Math.ceil(remaining.length / 2);
  const leftServices = remaining.slice(0, midPoint);
  const rightServices = remaining.slice(midPoint);

  const handlePrev = () => {
    setFeaturedIdx((prev) => (prev > 0 ? prev - 1 : blockServices.length - 1));
  };

  const handleNext = () => {
    setFeaturedIdx((prev) => (prev < blockServices.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className={styles.mosaicBlock}>
      {/* Aura circular de fondo como en la Imagen 1 */}
      <div className={styles.ambientAura} />

      <div className={styles.mosaicGrid}>
        {/* Columna Izquierda: Tarjetas Horizontales */}
        <div className={styles.sideColumn}>
          {leftServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              variant="horizontal"
              onClick={() => onSelectService(service)}
            />
          ))}
        </div>

        {/* Columna Central: Tarjeta Destacada Prominente */}
        <div className={styles.centerColumn}>
          {featuredService && (
            <ServiceCard
              service={featuredService}
              variant="featured"
              hasNavigation={blockServices.length > 1}
              onPrev={handlePrev}
              onNext={handleNext}
              onClick={() => onSelectService(featuredService)}
            />
          )}
        </div>

        {/* Columna Derecha: Tarjetas Horizontales */}
        <div className={styles.sideColumn}>
          {rightServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              variant="horizontal"
              onClick={() => onSelectService(service)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ServicesMosaic({ services }: ServicesMosaicProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  if (!services || services.length === 0) {
    return null;
  }

  // Si hay 7 o menos servicios, renderizamos un único bloque completo
  if (services.length <= 7) {
    return (
      <div className={styles.mosaicSection}>
        <SingleMosaicBlock
          blockServices={services}
          onSelectService={setSelectedService}
        />
        {selectedService && (
          <ServiceDetailModal
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}
      </div>
    );
  }

  // Si hay más de 7 servicios, dividimos en bloques de 7 para mantener la composición estética
  const blocks: Service[][] = [];
  for (let i = 0; i < services.length; i += 7) {
    blocks.push(services.slice(i, i + 7));
  }

  return (
    <div className={styles.mosaicSection}>
      {blocks.map((block, index) => {
        // Si el último bloque tiene solo 1 o 2 servicios, los mostramos como tarjetas horizontales limpias
        if (block.length <= 2 && index > 0) {
          return (
            <div key={`residual-${index}`} className={styles.residualRow}>
              {block.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  variant="horizontal"
                  onClick={() => setSelectedService(service)}
                />
              ))}
            </div>
          );
        }

        return (
          <SingleMosaicBlock
            key={`block-${index}-${block[0]?.id || index}`}
            blockServices={block}
            onSelectService={setSelectedService}
          />
        );
      })}

      {/* Modal flotante de vista detallada */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
