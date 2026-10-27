'use client';

import { useEffect, useRef } from 'react';
import styles from './RoseOverlay.module.css';

/** One transparent canvas follows the existing catalog images, without adding a scroll section. */
export default function RoseOverlay() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const catalog = document.getElementById('catalogo');
    const mount = mountRef.current;
    if (!catalog || !mount || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let disposed = false;
    let started = false;
    let destroy = () => {};
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      import('./botanicalScene').then(({ createBotanicalScene }) => {
        if (!disposed) destroy = createBotanicalScene(catalog, mount);
      }).catch(() => {
        // Decorative only: the catalog remains fully usable without WebGL.
      });
    }, { rootMargin: '500px' });

    observer.observe(catalog);
    return () => {
      disposed = true;
      observer.disconnect();
      destroy();
    };
  }, []);

  return <div ref={mountRef} className={styles.overlay} aria-hidden="true" />;
}
