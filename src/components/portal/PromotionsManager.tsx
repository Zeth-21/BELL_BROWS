'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { uploadMediaFile } from '@/lib/supabase/storage';
import { Promotion } from '@/types/database';
import {
  Sparkles,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Power,
  Trash2,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import styles from './portal.module.css';

export default function PromotionsManager() {
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('Oferta Especial');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Load existing promotion
  useEffect(() => {
    fetchPromotion();
  }, []);

  const fetchPromotion = async () => {
    try {
      setLoading(true);
      // Fetch latest promotion
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error al obtener promoción:', error);
      } else if (data) {
        setPromo(data);
        setTitle(data.title || '');
        setDescription(data.description || '');
        setBadge(data.badge || 'Oferta Especial');
        setImageUrl(data.image_url || null);
        setIsActive(data.is_active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ONE-TAP TOGGLE: Instantly activate or pause promotion without rewriting texts!
  const handleToggleActive = async () => {
    if (!promo) return;
    const newStatus = !isActive;
    setIsActive(newStatus);

    try {
      const { error } = await supabase
        .from('promotions')
        .update({
          is_active: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', promo.id);

      if (error) {
        // Rollback on error
        setIsActive(!newStatus);
        showToast('error', `Error al alternar estado: ${error.message}`);
      } else {
        setPromo((prev) => (prev ? { ...prev, is_active: newStatus } : null));
        showToast(
          'success',
          newStatus
            ? '¡Promoción ACTIVADA! Ahora es visible para los clientes.'
            : 'Promoción PAUSADA. Ha sido ocultada del sitio web.'
        );
      }
    } catch (err: any) {
      setIsActive(!newStatus);
      showToast('error', err?.message || 'Error al conectar con la base de datos.');
    }
  };

  // Upload or replace image from camera or file picker
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const { url, error } = await uploadMediaFile(file, 'promotions');

      if (error || !url) {
        showToast('error', `Error al subir imagen: ${error}`);
        return;
      }

      setImageUrl(url);

      // If promo already exists, update in database immediately
      if (promo) {
        await supabase
          .from('promotions')
          .update({
            image_url: url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', promo.id);
        setPromo((prev) => (prev ? { ...prev, image_url: url } : null));
      }

      showToast('success', '¡Fotografía actualizada y guardada con éxito!');
    } catch (err: any) {
      showToast('error', err?.message || 'Error al procesar la imagen.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove photo
  const handleRemovePhoto = async () => {
    setImageUrl(null);
    if (promo) {
      await supabase
        .from('promotions')
        .update({
          image_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', promo.id);
      setPromo((prev) => (prev ? { ...prev, image_url: null } : null));
      showToast('success', 'Foto de la oferta eliminada.');
    }
  };

  // Save all changes
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'El título del anuncio es obligatorio.');
      return;
    }

    try {
      setSaving(true);

      if (promo) {
        // Update
        const { error } = await supabase
          .from('promotions')
          .update({
            title: title.trim(),
            description: description.trim(),
            badge: badge.trim(),
            image_url: imageUrl,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', promo.id);

        if (error) throw error;
        showToast('success', '¡Promoción guardada exitosamente!');
        fetchPromotion();
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('promotions')
          .insert({
            title: title.trim(),
            description: description.trim(),
            badge: badge.trim(),
            image_url: imageUrl,
            is_active: isActive,
          })
          .select()
          .single();

        if (error) throw error;
        setPromo(data);
        showToast('success', '¡Nueva promoción creada con éxito!');
      }
    } catch (err: any) {
      showToast('error', `Error al guardar: ${err?.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={32} className={styles.spinner} />
        <p>Cargando módulo de promociones...</p>
      </div>
    );
  }

  return (
    <div className={styles.moduleWrapper}>
      {/* Toast alert */}
      {notification && (
        <div
          className={`${styles.toast} ${
            notification.type === 'success' ? styles.toastSuccess : styles.toastError
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Prominent Quick-Action Status Card */}
      <div
        className={`${styles.statusCard} ${
          isActive ? styles.statusCardActive : styles.statusCardPaused
        }`}
      >
        <div className={styles.statusInfo}>
          <div className={styles.statusBadgeWrap}>
            <span
              className={`badge ${isActive ? 'badge-active' : 'badge-paused'} ${
                styles.largeBadge
              }`}
            >
              {isActive ? '● En Línea (Activa)' : '○ En Pausa (Oculta)'}
            </span>
          </div>
          <h2 className={styles.statusTitle}>
            {isActive
              ? 'La promoción está VISIBLE para los clientes'
              : 'La promoción está PAUSADA y oculta'}
          </h2>
          <p className={styles.statusHelp}>
            {isActive
              ? 'Aparece en la parte superior de la página principal. Toca el botón para apagarla al instante cuando termine.'
              : 'El catálogo estándar se muestra directamente sin dejar espacios en blanco ni descuadres.'}
          </p>
        </div>

        {/* Big Touch-Friendly Toggle Switch */}
        <button
          type="button"
          onClick={handleToggleActive}
          className={`${styles.toggleButton} ${
            isActive ? styles.toggleBtnOn : styles.toggleBtnOff
          }`}
          aria-label={isActive ? 'Pausar promoción' : 'Activar promoción'}
        >
          <Power size={22} />
          <span>{isActive ? 'Pausar Oferta' : 'Encender Oferta'}</span>
        </button>
      </div>

      {/* Edit Form */}
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <Sparkles size={20} className={styles.formHeaderIcon} />
          <div>
            <h3 className={styles.formTitle}>Configuración del Anuncio</h3>
            <p className={styles.formSubtitle}>
              Edita los textos y fotografía de la oferta sin perder tu configuración
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveAll} className={styles.adminForm}>
          {/* Title */}
          <div className={styles.formGroup}>
            <label htmlFor="promo-title">Título del Anuncio *</label>
            <input
              id="promo-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. 2x1 en sesión de spa este fin de semana"
              required
            />
          </div>

          {/* Badge */}
          <div className={styles.formGroup}>
            <label htmlFor="promo-badge">Texto de la Insignia (Badge)</label>
            <input
              id="promo-badge"
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Ej. ¡2x1 Fin de Semana!, Descuento Exclusivo"
            />
          </div>

          {/* Details / Description */}
          <div className={styles.formGroup}>
            <label htmlFor="promo-desc">Detalle o Condiciones del Descuento</label>
            <textarea
              id="promo-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Aplica solo para citas agendadas por WhatsApp durante el sábado y domingo."
              rows={3}
            />
          </div>

          {/* Image Upload from Camera or Gallery */}
          <div className={styles.formGroup}>
            <label>Fotografía de la Oferta (Opcional)</label>
            <div className={styles.imageUploadArea}>
              {imageUrl ? (
                <div className={styles.imagePreviewWrapper}>
                  <div className={styles.imagePreviewBox}>
                    <Image
                      src={imageUrl}
                      alt="Vista previa de la oferta"
                      fill
                      sizes="300px"
                      className={styles.previewImg}
                    />
                  </div>
                  <div className={styles.imagePreviewActions}>
                    {/* Trigger file input for replacement */}
                    <label
                      htmlFor="promo-file-input"
                      className={`btn btn-secondary ${styles.actionBtn}`}
                    >
                      <Camera size={16} />
                      <span>Sustituir Foto</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className={`btn ${styles.deletePhotoBtn}`}
                    >
                      <Trash2 size={16} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="promo-file-input"
                  className={styles.uploadPlaceholder}
                >
                  <div className={styles.uploadIconWrap}>
                    {uploadingImage ? (
                      <Loader2 size={28} className={styles.spinner} />
                    ) : (
                      <UploadCloud size={28} />
                    )}
                  </div>
                  <span className={styles.uploadMainText}>
                    {uploadingImage
                      ? 'Subiendo a Supabase Storage...'
                      : 'Toca aquí para tomar foto o elegir de tu galería'}
                  </span>
                  <span className={styles.uploadSubText}>
                    Compatible con cámara de celular y archivos de computadora (JPG, PNG, WEBP)
                  </span>
                </label>
              )}

              {/* Hidden file input with mobile camera support */}
              <input
                id="promo-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={uploadingImage}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Submit button */}
          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className={`btn btn-primary ${styles.saveButton}`}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  <span>Guardando cambios...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Guardar Textos de la Oferta</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
