'use client';

import React, { useEffect, useState, useMemo } from 'react';
import SkincareHero from '@/components/SkincareHero';
import ServiceCard from '@/components/ServiceCard';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase/client';
import { Service, Promotion } from '@/types/database';
import { Sparkles, Star, ShieldCheck, HeartHandshake } from 'lucide-react';
import styles from './page.module.css';

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch active promotions and services on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch active promotion (RLS allows only active for public)
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

        if (!servicesError && servicesData) {
          setServices(servicesData);
        }
      } catch (err) {
        console.error('Error cargando datos de Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Setup real-time listener for promotions & services changes
    const promoChannel = supabase
      .channel('public_promotions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promotions' },
        async () => {
          // Re-fetch promotion state
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
          if (data) setServices(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(promoChannel);
      supabase.removeChannel(servicesChannel);
    };
  }, []);

  // Compute categories from services
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['Todos', ...Array.from(set)];
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'Todos') return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  return (
    <div className={styles.page}>
      <main className={styles.mainContent}>
        {/* Editorial Skincare Hero Banner with Cat Mascot, Floating Badges & Products */}
        <SkincareHero promotion={promotion} />

        {/* Social Proof & Trust markers */}
        <section className={styles.trustSection}>
          <div className="container">
            <div className={styles.trustRow}>
              <div className={styles.trustItem}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <span>+500 Clientes Felices</span>
              </div>
              <div className={styles.trustItem}>
                <ShieldCheck size={18} className={styles.trustIcon} />
                <span>Pigmentos Hipoalergénicos</span>
              </div>
              <div className={styles.trustItem}>
                <HeartHandshake size={18} className={styles.trustIcon} />
                <span>Atención Personalizada 1 a 1</span>
              </div>
            </div>
          </div>
        </section>

        {/* Services Catalog Section */}
        <section className={styles.catalogSection} id="catalogo">
          <div className="container">
            <div className={styles.catalogHeader}>
              <div className={styles.sectionHeaderWrap}>
                <span className={styles.sectionOverline}>NUESTRO MENÚ EXCLUSIVO</span>
                <h2 className={styles.sectionHeading}>Servicios Profesionales</h2>
                <p className={styles.sectionSub}>
                  Elige el tratamiento ideal para consentirte y transformar tu mirada
                </p>
              </div>

              {/* Category Filter Pills (Mobile friendly swipe) */}
              {categories.length > 1 && (
                <div className={styles.filterScrollWrapper}>
                  <div className={styles.filterPills}>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`${styles.filterBtn} ${
                          selectedCategory === cat ? styles.filterBtnActive : ''
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

            {/* Loading Skeleton */}
            {loading ? (
              <div className={styles.servicesGrid}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
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
              <div className={styles.servicesGrid}>
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
