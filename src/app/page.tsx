'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import SkincareHero from '@/components/SkincareHero';
import RoseOverlay from '@/components/RoseOverlay';
import ServicesMosaic from '@/components/ServicesMosaic';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase/client';
import { Service, Promotion } from '@/types/database';
import { Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { WHATSAPP_PHONE, MAIN_CATEGORIES, normalizeServiceCategory } from '@/lib/utils';
import styles from './page.module.css';

const DEFAULT_SERVICES: Service[] = [
  // 1. Pestañas
  {
    id: '1',
    title: 'Lash Lifting + Baño de Keratina',
    description: 'Curvatura natural desde la raíz, fortalecimiento de folículos y color negro intenso.',
    price: 160,
    category: 'Pestañas',
    image_url: '/product-cream.jpg',
    duration_minutes: 75,
    display_order: 1,
    is_active: true,
  },
  {
    id: '2',
    title: 'Extensiones de Pestañas Volumen Ruso',
    description: 'Abanicos hechos a mano para una mirada densa, ligera y aterciopelada.',
    price: 240,
    category: 'Pestañas',
    image_url: '/product-cream.jpg',
    duration_minutes: 150,
    display_order: 2,
    is_active: true,
  },
  {
    id: '3',
    title: 'Extensiones Clásicas Efecto Rímel',
    description: 'Colocación una a una para alargar y potenciar la mirada con sutileza.',
    price: 190,
    category: 'Pestañas',
    image_url: '/product-cream.jpg',
    duration_minutes: 90,
    display_order: 3,
    is_active: true,
  },
  // 2. Micro
  {
    id: '4',
    title: 'Microblading Hiperrealista',
    description: 'Diseño pelo a pelo con acabado ultra natural que armoniza con la fisionomía de tu rostro.',
    price: 320,
    category: 'Micro',
    image_url: '/product-cream.jpg',
    duration_minutes: 120,
    display_order: 4,
    is_active: true,
  },
  {
    id: '5',
    title: 'Brow Lamination & Henna Spa',
    description: 'Direccionamiento, nutrición profunda y fijación estética con tinte vegetal.',
    price: 150,
    category: 'Micro',
    image_url: '/product-cream.jpg',
    duration_minutes: 60,
    display_order: 5,
    is_active: true,
  },
  {
    id: '6',
    title: 'Micropigmentación de Labios Velvet',
    description: 'Efecto acuarela y definición de contornos para labios saludables y luminosos.',
    price: 290,
    category: 'Micro',
    image_url: '/product-cream.jpg',
    duration_minutes: 120,
    display_order: 6,
    is_active: true,
  },
  // 3. Limpieza Facial
  {
    id: '7',
    title: 'Glow Facial Hidratación Profunda',
    description: 'Exfoliación suave, mascarilla botánica y masaje drenante relajante.',
    price: 180,
    category: 'Limpieza Facial',
    image_url: '/product-cream.jpg',
    duration_minutes: 60,
    display_order: 7,
    is_active: true,
  },
  {
    id: '8',
    title: 'Hidrodermoabrasión & Peeling Ultrasónico',
    description: 'Limpieza profunda de poros, extracción de impurezas y nutrición celular.',
    price: 220,
    category: 'Limpieza Facial',
    image_url: '/product-cream.jpg',
    duration_minutes: 75,
    display_order: 8,
    is_active: true,
  },
  // 4. Uñas
  {
    id: '9',
    title: 'Manicure Ruso Spa & Nivelación Gel',
    description: 'Tratamiento de cutículas milimétrico, exfoliación botánica y esmaltado de alta duración.',
    price: 120,
    category: 'Uñas',
    image_url: '/product-cream.jpg',
    duration_minutes: 90,
    display_order: 9,
    is_active: true,
  },
  {
    id: '10',
    title: 'Acripie Completo & Diseño Editorial',
    description: 'Pedicure profunda, diseño estético en acrílico y mascarilla nutritiva de parafina.',
    price: 140,
    category: 'Uñas',
    image_url: '/product-cream.jpg',
    duration_minutes: 90,
    display_order: 10,
    is_active: true,
  },
  // 5. Cabello
  {
    id: '11',
    title: 'Ondulación & Nutrición Capilar',
    description: 'Definición de ondas con brillo espejo, baño botánico de aminoácidos y fijación sedosa.',
    price: 180,
    category: 'Cabello',
    image_url: '/product-cream.jpg',
    duration_minutes: 120,
    display_order: 11,
    is_active: true,
  },
  {
    id: '12',
    title: 'Spa Capilar & Hidratación de Keratina',
    description: 'Reconstrucción de hebra capilar con activos botánicos y sellado térmico con brillo cristal.',
    price: 160,
    category: 'Cabello',
    image_url: '/product-cream.jpg',
    duration_minutes: 90,
    display_order: 12,
    is_active: true,
  },
];

export default function HomePage() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch active promotions and services on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch active promotion
        const { data: promoData, error: promoError } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!promoError && promoData) {
          setPromotion(promoData);
        } else {
          setPromotion(null);
        }

        // Fetch active services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!servicesError && servicesData && servicesData.length > 0) {
          setServices(servicesData);
        }
      } catch (err) {
        console.error('Error cargando datos de Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Setup real-time listeners
    const promoChannel = supabase
      .channel('public_promotions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promotions' },
        async () => {
          const { data } = await supabase
            .from('promotions')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          setPromotion(data || null);
        }
      )
      .subscribe();

    const servicesChannel = supabase
      .channel('public_services_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        async () => {
          const { data } = await supabase
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });
          if (data && data.length > 0) setServices(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(promoChannel);
      supabase.removeChannel(servicesChannel);
    };
  }, []);

  // Categorías principales del catálogo (exactamente las 5 solicitadas con "Todos" al inicio)
  const categories = MAIN_CATEGORIES;

  // Filtrado de servicios con normalización automática a las 5 categorías oficiales
  const filteredServices = useMemo(() => {
    const normalizedServices = services.map((s) => ({
      ...s,
      category: normalizeServiceCategory(s),
    }));

    if (selectedCategory === 'Todos') return normalizedServices;
    return normalizedServices.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  return (
    <div className={styles.page}>
      <main className={styles.mainContent}>
        {/* Editorial Skincare Hero Banner */}
        <SkincareHero promotion={promotion} />

        <RoseOverlay />

        {/* =========================================================================
            EDITORIAL CATALOG SECTION: Exact 5-Module Structure from Image 1
           ========================================================================= */}
        <section className={styles.catalogSection} id="catalogo">
          <div className="container">

            {/* -------------------------------------------------------------------
                BLOQUE 1: INTRODUCCIÓN EDITORIAL & FILOSOFÍA
                (Imagen 1: "О СЕЗОНЕ / Вдохновлены вкусом жизни / Наша философия ->")
               ------------------------------------------------------------------- */}
            <div className={styles.editorialIntroBlock}>
              <div className={styles.introLeftText}>
                <span className={styles.introOverline}>FILOSOFÍA & TÉCNICA</span>
                <h2 className={styles.introHeading}>
                  Inspiradas en la belleza natural de tu mirada
                </h2>
                <p className={styles.introParagraph}>
                  Bell Brows — es la cúspide del diseño de cejas y pestañas, donde el arte milimétrico,
                  los pigmentos orgánicos y la atención al detalle crean una armonía facial que trasciende modas pasajeras.
                </p>
                <div className={styles.introLinkWrapper}>
                  <div className={styles.introDividerLine} />
                  <a
                    href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Bell%20Brows%2C%20quisiera%20conocer%20m%C3%A1s%20sobre%20su%20filosof%C3%ADa%20y%20t%C3%A9cnicas.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.introLink}
                  >
                    <span>Nuestra filosofía</span>
                    <ArrowRight size={17} className={styles.introLinkArrow} />
                  </a>
                </div>
              </div>

              <div className={styles.introRightVisual}>
                <div className={styles.introImageFrame} data-rose-anchor="intro" style={{ position: 'relative' }}>
                  <Image
                    src="/editorial-intro.jpg"
                    alt="Filosofía Bell Brows"
                    fill
                    sizes="(max-width: 768px) 100vw, 520px"
                    className={styles.introImg}
                    priority
                  />
                </div>
                <div className={styles.introArtBadge}>
                  <span className={styles.badgeVerticalText}>ARTE EN CADA TRAZO</span>
                  <div className={styles.badgeLine} />
                  <span className={styles.badgeEst}>EST. 2024</span>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------------
                BLOQUE 2: MENÚ DE SERVICIOS EXCLUSIVOS
                (Imagen 1: "ФИРМЕННАЯ КОЛЛЕКЦИЯ ─── / Смотреть всю коллекцию ->")
               ------------------------------------------------------------------- */}
            <div className={styles.featuredMenuSection} data-rose-anchor="services">
              <div className={styles.featuredHeaderRow}>
                <div className={styles.featuredTitleWrap}>
                  <span className={styles.featuredOverline}>COLECCIÓN EXCLUSIVA</span>
                  <div className={styles.featuredLineRule} />
                </div>

                {/* Refined Filter Navigation */}
                {categories.length > 1 && (
                  <div className={styles.filterScrollWrapper}>
                    <div className={styles.filterPillsRow}>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`${styles.editorialFilterBtn} ${
                            selectedCategory === cat ? styles.editorialFilterBtnActive : ''
                          }`}
                          aria-pressed={selectedCategory === cat}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Service Cards Grid (Centered editorial cards matching Image 1) */}
              {loading ? (
                <div className={styles.servicesGrid}>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={styles.skeletonCard}>
                      <div className={styles.skeletonImg} />
                      <div className={styles.skeletonContent}>
                        <div className={styles.skeletonTitle} />
                        <div className={styles.skeletonText} />
                        <div className={styles.skeletonBtn} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredServices.length > 0 ? (
                <ServicesMosaic services={filteredServices} />
              ) : (
                <div className={styles.emptyState}>
                  <Sparkles size={40} className={styles.emptyIcon} />
                  <h3>No hay servicios en esta categoría</h3>
                  <p>Prueba seleccionando otra categoría para explorar nuestros tratamientos.</p>
                  <button
                    onClick={() => setSelectedCategory('Todos')}
                    className="btn btn-secondary"
                  >
                    Ver Todos los Servicios
                  </button>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------------
                BLOQUE 3: TRATAMIENTO ESTRELLA DE TEMPORADA
                (Imagen 1: "СЕЗОННАЯ КОЛЛЕКЦИЯ / ВЕСНА В КАЖДОМ ВКУСЕ / Создано с вдохновением")
               ------------------------------------------------------------------- */}
            <div className={styles.seasonalSpotlightBlock}>
              <div className={styles.spotlightContent}>
                <span className={styles.spotlightOverline}>COLECCIÓN DE TEMPORADA</span>
                <h3 className={styles.spotlightHeading}>
                  BELLEZA EN CADA TRAZO
                </h3>
                <p className={styles.spotlightText}>
                  Ligeras y armoniosas como los primeros días cálidos. Nuevos tratamientos botánicos de nutrición
                  profunda con sérums vitamínicos, diseño visagista y fijación natural.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Bell%20Brows%2C%20me%20interesa%20reservar%20el%20tratamiento%20de%20temporada.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.spotlightPillBtn}
                >
                  <span>Reservar tratamiento</span>
                  <ArrowRight size={16} className={styles.btnArrowHover} />
                </a>
              </div>

              <div className={styles.spotlightVisualWrap}>
                <div className={styles.spotlightScriptAccent}>
                  Creado con devoción
                </div>
                <div className={styles.spotlightImageContainer} data-rose-anchor="season" style={{ position: 'relative' }}>
                  <Image
                    src="/editorial-spotlight.jpg"
                    alt="Tratamiento de temporada Bell Brows"
                    fill
                    sizes="(max-width: 900px) 100vw, 580px"
                    className={styles.spotlightImg}
                  />
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------------
                BLOQUE 4: DISEÑO PERSONALIZADO & NOVIAS
                (Imagen 1: "Свадебные торты / Ваши истории в наших десертах / Обсудить заказ ->")
               ------------------------------------------------------------------- */}
            <div className={styles.customStoriesBlock}>
              {/* Left Column: Tall Event / Bridal Photo with vertical text */}
              <div className={styles.storiesLeftColumn}>
                <div className={styles.verticalTextColumn}>
                  <span>EVENTOS ESPECIALES</span>
                  <span>LOOKS DE NOVIA</span>
                  <span>EXCLUSIVOS</span>
                  <span>PARA TU MOMENTO</span>
                </div>
                <div className={styles.tallImageContainer} data-rose-anchor="bridal" style={{ position: 'relative' }}>
                  <Image
                    src="/editorial-bridal.jpg"
                    alt="Diseño para novias y ocasiones especiales"
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className={styles.tallImg}
                  />
                </div>
              </div>

              {/* Right Column: Story text, CTA button and craft detail */}
              <div className={styles.storiesRightColumn}>
                <div className={styles.storiesHeader}>
                  <span className={styles.storiesOverline}>DISEÑO A MEDIDA</span>
                  <h3 className={styles.storiesTitle}>
                    Tu historia reflejada en tu mirada
                  </h3>
                  <p className={styles.storiesDescription}>
                    Bodas, aniversarios, celebraciones íntimas y eventos especiales. Creamos una sesión de visagismo
                    1 a 1 para diseñar la curvatura, tono y densidad perfecta que cuente tu propia historia.
                  </p>
                  <a
                    href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Bell%20Brows%2C%20quisiera%20agendar%20un%20dise%C3%B1o%20a%20medida%20o%20para%20evento.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.storiesPillBtn}
                  >
                    <span>Agendar diseño a medida</span>
                    <ArrowRight size={16} className={styles.btnArrowHover} />
                  </a>
                </div>

                {/* Craft Detail Thumbnail and Highlights */}
                <div className={styles.craftDetailRow}>
                  <div className={styles.craftThumb} style={{ position: 'relative' }}>
                    <Image
                      src="/editorial-craft.jpg"
                      alt="Visagismo de precisión artesanal"
                      fill
                      sizes="140px"
                      className={styles.craftImg}
                    />
                  </div>
                  <div className={styles.craftTags}>
                    <span className={styles.craftTagItem}>DISEÑO MILIMÉTRICO</span>
                    <span className={styles.craftTagItem}>PIGMENTOS ORGÁNICOS</span>
                    <span className={styles.craftTagItem}>SIN COMPROMISOS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------------
                BLOQUE 5: BARRA DE MÉTRICAS & CONVERSIÓN RÁPIDA
                (Imagen 1: "500+ / 4.9 / 100% / Сделаем ваш момент особенным ->")
               ------------------------------------------------------------------- */}
            <div className={styles.metricsConversionBar}>
              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>500+</span>
                <span className={styles.metricLabel}>CLIENTAS SATISFECHAS</span>
              </div>
              <div className={styles.metricDivider} />

              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>4.9</span>
                <span className={styles.metricLabel}>PROMEDIO EN RESEÑAS</span>
              </div>
              <div className={styles.metricDivider} />

              <div className={styles.metricItem}>
                <span className={styles.metricNumber}>100%</span>
                <span className={styles.metricLabel}>PIGMENTOS ORGÁNICOS</span>
              </div>
              <div className={styles.metricDivider} />

              <div className={styles.conversionCallout}>
                <span className={styles.calloutText}>Hacemos de tu momento algo único</span>
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Bell%20Brows%2C%20quiero%20agendar%20mi%20cita%20ahora.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.circleArrowBtn}
                  aria-label="Agendar cita por WhatsApp"
                >
                  <ArrowRight size={22} />
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* Omnipresent Floating WhatsApp Action Button */}
        <a
          href={`https://wa.me/${WHATSAPP_PHONE}?text=Hola%20Bell%20Brows%2C%20me%20gustar%C3%ADa%20agendar%20una%20cita%20o%20recibir%20asesor%C3%ADa.`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.fabWhatsApp}
          aria-label="Contactar por WhatsApp para dudas o agendar cita"
          id="floating-whatsapp-btn"
        >
          <span className={styles.fabIconWrap}>
            <MessageCircle size={24} />
          </span>
          <span className={styles.fabText}>¿Dudas? Escríbenos</span>
        </a>
      </main>

      <Footer />
    </div>
  );
}
