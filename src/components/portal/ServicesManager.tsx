'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { uploadServiceImage } from '@/lib/supabase/storage';
import { Service } from '@/types/database';
import { formatPrice, SERVICE_CATEGORIES, normalizeServiceCategory } from '@/lib/utils';
import {
  Sparkles,
  Camera,
  Edit2,
  Trash2,
  Plus,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Power,
  Image as ImageIcon,
} from 'lucide-react';
import styles from './portal.module.css';

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [savingService, setSavingService] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form inputs for editing/creating
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>(0);
  const [category, setCategory] = useState<string>('Pestañas');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [imageUrl, setImageUrl] = useState<string>(''); // Foto Después (Resultado final)
  const [imageBefore, setImageBefore] = useState<string>(''); // Foto Antes (Estado inicial)
  const [isActive, setIsActive] = useState(true);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        showToast('error', `Error al cargar servicios: ${error.message}`);
      } else if (data) {
        setServices(data);
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setIsCreatingNew(false);
    setTitle(service.title);
    setDescription(service.description || '');
    setPrice(service.price);
    setCategory(normalizeServiceCategory(service));
    setDurationMinutes(service.duration_minutes || 60);
    setImageUrl(service.image_url || '');
    setImageBefore(service.image_before || '');
    setIsActive(service.is_active);
  };

  const openNewModal = () => {
    setEditingService(null);
    setIsCreatingNew(true);
    setTitle('');
    setDescription('');
    setPrice(50);
    setCategory('Pestañas');
    setDurationMinutes(60);
    setImageUrl('');
    setImageBefore('');
    setIsActive(true);
  };

  const closeModal = () => {
    setEditingService(null);
    setIsCreatingNew(false);
  };

  // Instant direct image replacement for a specific service card (from camera/gallery)
  const handleDirectImageUpload = async (
    serviceId: string,
    type: 'after' | 'before',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingForId(`${serviceId}-${type}`);
      const { url, error } = await uploadServiceImage(file, type, serviceId);

      if (error || !url) {
        showToast('error', `Error al subir imagen: ${error}`);
        return;
      }

      // Update in Supabase immediately
      const updatePayload =
        type === 'after'
          ? { image_url: url, updated_at: new Date().toISOString() }
          : { image_before: url, updated_at: new Date().toISOString() };

      const { error: dbError } = await supabase
        .from('services')
        .update(updatePayload)
        .eq('id', serviceId);

      if (dbError) throw dbError;

      // Update local state
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, ...updatePayload } : s))
      );

      if (editingService && editingService.id === serviceId) {
        if (type === 'after') setImageUrl(url);
        if (type === 'before') setImageBefore(url);
      }

      showToast(
        'success',
        `¡Foto del ${type === 'after' ? 'Después' : 'Antes'} optimizada a WebP y guardada!`
      );
    } catch (err: any) {
      showToast('error', err?.message || 'Error al actualizar la foto');
    } finally {
      setUploadingForId(null);
    }
  };

  // Handlers for modal upload
  const handleModalUploadAfter = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAfter(true);
      const { url, error } = await uploadServiceImage(file, 'after', editingService?.id);
      if (error || !url) {
        showToast('error', `Error al optimizar/subir foto después: ${error}`);
        return;
      }
      setImageUrl(url);
      showToast('success', 'Foto del Después convertida a WebP lista para guardar.');
    } catch (err: any) {
      showToast('error', err?.message || 'Error al subir foto');
    } finally {
      setUploadingAfter(false);
    }
  };

  const handleModalUploadBefore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBefore(true);
      const { url, error } = await uploadServiceImage(file, 'before', editingService?.id);
      if (error || !url) {
        showToast('error', `Error al optimizar/subir foto antes: ${error}`);
        return;
      }
      setImageBefore(url);
      showToast('success', 'Foto del Antes convertida a WebP lista para guardar.');
    } catch (err: any) {
      showToast('error', err?.message || 'Error al subir foto');
    } finally {
      setUploadingBefore(false);
    }
  };

  // Toggle active status for service
  const handleToggleActive = async (service: Service) => {
    const newStatus = !service.is_active;
    try {
      const { error } = await supabase
        .from('services')
        .update({
          is_active: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', service.id);

      if (error) throw error;

      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: newStatus } : s))
      );

      showToast(
        'success',
        newStatus ? `"${service.title}" activado en catálogo` : `"${service.title}" pausado`
      );
    } catch (err: any) {
      showToast('error', err?.message || 'Error al cambiar estado');
    }
  };

  // Delete service
  const handleDeleteService = async (serviceId: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el servicio "${title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      showToast('success', `Servicio "${title}" eliminado.`);
    } catch (err: any) {
      showToast('error', err?.message || 'Error al eliminar');
    }
  };

  // Save changes from modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'El título del servicio es requerido.');
      return;
    }

    if (!imageUrl.trim()) {
      showToast('error', 'La Foto del Después (resultado final) es obligatoria.');
      return;
    }

    const parsedPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;

    try {
      setSavingService(true);

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        price: parsedPrice,
        category: category.trim(),
        duration_minutes: durationMinutes,
        image_url: imageUrl.trim() || null,
        image_before: imageBefore.trim() || null,
        is_active: isActive,
      };

      if (isCreatingNew) {
        // Create new
        const { data, error } = await supabase
          .from('services')
          .insert({
            ...payload,
            display_order: services.length + 1,
          })
          .select()
          .single();

        if (error) throw error;
        setServices((prev) => [...prev, data]);
        showToast('success', '¡Nuevo servicio con Antes/Después agregado exitosamente!');
        closeModal();
      } else if (editingService) {
        // Update existing
        const { data, error } = await supabase
          .from('services')
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingService.id)
          .select()
          .single();

        if (error) throw error;
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? data : s))
        );
        showToast('success', '¡Servicio actualizado correctamente!');
        closeModal();
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Error al guardar servicio');
    } finally {
      setSavingService(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={32} className={styles.spinner} />
        <p>Cargando catálogo de servicios...</p>
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

      {/* Module Header with Add New Service CTA */}
      <div className={styles.sectionHeaderBar}>
        <div>
          <h2 className={styles.sectionHeaderTitle}>Servicios Permanentes</h2>
          <p className={styles.sectionHeaderSubtitle}>
            Administra precios, fotos de Antes y Después en WebP y visibilidad de tu catálogo
          </p>
        </div>
        <button
          onClick={openNewModal}
          className={`btn btn-primary ${styles.addNewBtn}`}
          aria-label="Agregar nuevo servicio"
        >
          <Plus size={18} />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Services List / Cards */}
      <div className={styles.servicesGridAdmin}>
        {services.map((service) => (
          <div
            key={service.id}
            className={`${styles.serviceItemCard} ${
              !service.is_active ? styles.serviceItemCardInactive : ''
            }`}
          >
            {/* Top row with static dual thumbnails (DESPUÉS y ANTES) - NO COMPARISON SLIDER IN ADMIN */}
            <div className={styles.serviceImageRow}>
              <div className={styles.dualThumbContainer}>
                {/* 1. Miniatura Estática: DESPUÉS (Principal) */}
                <div className={styles.dualThumbItem}>
                  <div className={styles.dualThumbBox}>
                    {service.image_url ? (
                      <Image
                        src={service.image_url}
                        alt={`${service.title} - Después`}
                        fill
                        sizes="90px"
                        className={styles.thumbImg}
                      />
                    ) : (
                      <div className={styles.thumbPlaceholder}>
                        <Sparkles size={16} />
                      </div>
                    )}
                    {uploadingForId === `${service.id}-after` && (
                      <div className={styles.thumbUploadingOverlay}>
                        <Loader2 size={20} className={styles.spinner} />
                      </div>
                    )}
                  </div>
                  <span className={`${styles.dualThumbTag} ${styles.dualThumbTagAfter}`}>
                    Después
                  </span>
                </div>

                {/* 2. Miniatura Estática: ANTES (Opcional) */}
                <div className={styles.dualThumbItem}>
                  <div className={styles.dualThumbBox}>
                    {service.image_before ? (
                      <Image
                        src={service.image_before}
                        alt={`${service.title} - Antes`}
                        fill
                        sizes="90px"
                        className={styles.thumbImg}
                      />
                    ) : (
                      <div className={styles.dualThumbPlaceholder}>
                        <ImageIcon size={14} />
                        <span>Sin Antes</span>
                      </div>
                    )}
                    {uploadingForId === `${service.id}-before` && (
                      <div className={styles.thumbUploadingOverlay}>
                        <Loader2 size={20} className={styles.spinner} />
                      </div>
                    )}
                  </div>
                  <span className={`${styles.dualThumbTag} ${styles.dualThumbTagBefore}`}>
                    Antes
                  </span>
                </div>
              </div>

              {/* Direct Camera / File triggers */}
              <div className={styles.quickPhotoActions}>
                <label
                  htmlFor={`file-after-${service.id}`}
                  className={`btn btn-secondary ${styles.cameraBtn}`}
                  title="Cambiar foto del Después (WebP)"
                >
                  <Camera size={15} />
                  <span className={styles.cameraBtnText}>Foto Después</span>
                </label>
                <input
                  id={`file-after-${service.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleDirectImageUpload(service.id, 'after', e)}
                  disabled={uploadingForId === `${service.id}-after`}
                  style={{ display: 'none' }}
                />

                <label
                  htmlFor={`file-before-${service.id}`}
                  className={`btn btn-secondary ${styles.cameraBtn}`}
                  title="Subir o cambiar foto del Antes (WebP)"
                >
                  <Camera size={15} />
                  <span className={styles.cameraBtnText}>
                    {service.image_before ? 'Foto Antes' : '+ Foto Antes'}
                  </span>
                </label>
                <input
                  id={`file-before-${service.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleDirectImageUpload(service.id, 'before', e)}
                  disabled={uploadingForId === `${service.id}-before`}
                  style={{ display: 'none' }}
                />

                <span
                  className={`badge ${
                    service.is_active ? 'badge-active' : 'badge-paused'
                  }`}
                >
                  {service.is_active ? 'Activo' : 'Pausado'}
                </span>
              </div>
            </div>

            {/* Service details */}
            <div className={styles.serviceBody}>
              <div className={styles.serviceTitleRow}>
                <h3 className={styles.itemTitle}>{service.title}</h3>
                <span className={styles.itemPrice}>{formatPrice(service.price)}</span>
              </div>

              <div className={styles.itemMeta}>
                <span className={styles.metaBadge}>
                  <Layers size={12} />
                  {normalizeServiceCategory(service)}
                </span>
                {service.image_before && (
                  <span className={styles.metaBadge} title="Este servicio cuenta con comparación interactiva">
                    <Sparkles size={12} />
                    Slider Antes/Después Activo
                  </span>
                )}
              </div>

              {service.description && (
                <p className={styles.itemDesc}>{service.description}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className={styles.serviceCardFooter}>
              <button
                onClick={() => openEditModal(service)}
                className={`btn btn-secondary ${styles.actionCardBtn}`}
                aria-label={`Editar ${service.title}`}
              >
                <Edit2 size={16} />
                <span>Editar</span>
              </button>

              <button
                onClick={() => handleToggleActive(service)}
                className={`btn ${
                  service.is_active ? styles.pauseBtn : styles.resumeBtn
                }`}
                title={service.is_active ? 'Ocultar del público' : 'Hacer visible'}
              >
                <Power size={16} />
                <span>{service.is_active ? 'Pausar' : 'Activar'}</span>
              </button>

              <button
                onClick={() => handleDeleteService(service.id, service.title)}
                className={`btn ${styles.deleteCardBtn}`}
                title="Eliminar servicio"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal Sheet */}
      {(editingService || isCreatingNew) && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalSheet}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {isCreatingNew ? 'Agregar Nuevo Servicio' : 'Editar Servicio'}
              </h3>
              <button
                onClick={closeModal}
                className={styles.closeModalBtn}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className={styles.modalForm}>
              {/* Title */}
              <div className={styles.formGroup}>
                <label htmlFor="service-title">Nombre del Servicio *</label>
                <input
                  id="service-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Microblading Hiperrealista"
                  required
                />
              </div>

              {/* Price */}
              <div className={styles.formGroup}>
                <label htmlFor="service-price">Precio en Soles (S/) *</label>
                <input
                  id="service-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej. 65"
                  required
                />
              </div>

              {/* Category */}
              <div className={styles.formGroup}>
                <label htmlFor="service-category">Categoría *</label>
                <select
                  id="service-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label htmlFor="service-desc">Descripción del Servicio</label>
                <textarea
                  id="service-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalla en qué consiste el procedimiento, beneficios y cuidados incluidos..."
                  rows={3}
                />
              </div>

              {/* DUAL IMAGE SELECTORS: FOTO DEL DESPUÉS & FOTO DEL ANTES */}
              <div className={styles.formGroup}>
                <label>Fotografías de Resultados (Conversión Automática a WebP)</label>
                <div className={styles.modalDualUploadGrid}>
                  {/* 1. Foto del Después (Resultado Final - Obligatoria) */}
                  <div className={styles.uploadSectionBox}>
                    <div className={styles.uploadSectionHeader}>
                      <span className={styles.uploadSectionTitle}>Resultado Final (Después)</span>
                      <span className={styles.uploadBadgeRequired}>Obligatorio</span>
                    </div>

                    <div className={styles.modalImgBoxCompact}>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Vista previa resultado después"
                          fill
                          sizes="240px"
                          className={styles.modalImgPreview}
                        />
                      ) : (
                        <div className={styles.modalNoImg}>Sin foto final</div>
                      )}
                      {uploadingAfter && (
                        <div className={styles.thumbUploadingOverlay}>
                          <Loader2 size={24} className={styles.spinner} />
                        </div>
                      )}
                    </div>

                    <label
                      htmlFor="modal-photo-after"
                      className={`btn btn-secondary ${styles.modalPhotoBtn}`}
                    >
                      <Camera size={16} />
                      <span>{imageUrl ? 'Cambiar Foto Después' : 'Subir Foto Después'}</span>
                    </label>
                    <input
                      id="modal-photo-after"
                      type="file"
                      accept="image/*"
                      onChange={handleModalUploadAfter}
                      disabled={uploadingAfter}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* 2. Foto del Antes (Estado Inicial - Opcional) */}
                  <div className={styles.uploadSectionBox}>
                    <div className={styles.uploadSectionHeader}>
                      <span className={styles.uploadSectionTitle}>Estado Inicial (Antes)</span>
                      <span className={styles.uploadBadgeOptional}>Opcional</span>
                    </div>

                    <div className={styles.modalImgBoxCompact}>
                      {imageBefore ? (
                        <Image
                          src={imageBefore}
                          alt="Vista previa estado antes"
                          fill
                          sizes="240px"
                          className={styles.modalImgPreview}
                        />
                      ) : (
                        <div className={styles.modalNoImg}>Sin foto inicial</div>
                      )}
                      {uploadingBefore && (
                        <div className={styles.thumbUploadingOverlay}>
                          <Loader2 size={24} className={styles.spinner} />
                        </div>
                      )}
                    </div>

                    <label
                      htmlFor="modal-photo-before"
                      className={`btn btn-secondary ${styles.modalPhotoBtn}`}
                    >
                      <Camera size={16} />
                      <span>{imageBefore ? 'Cambiar Foto Antes' : 'Subir Foto Antes'}</span>
                    </label>
                    <input
                      id="modal-photo-before"
                      type="file"
                      accept="image/*"
                      onChange={handleModalUploadBefore}
                      disabled={uploadingBefore}
                      style={{ display: 'none' }}
                    />

                    {imageBefore && (
                      <button
                        type="button"
                        onClick={() => setImageBefore('')}
                        className={styles.removeBeforeBtn}
                        title="Quitar foto de antes y dejar solo foto principal"
                      >
                        <Trash2 size={13} />
                        <span>Quitar foto del Antes</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Switch */}
              <div className={styles.switchGroup}>
                <label htmlFor="service-status-toggle" className={styles.switchLabel}>
                  <span>Estado en Catálogo:</span>
                  <span
                    className={`badge ${
                      isActive ? 'badge-active' : 'badge-paused'
                    }`}
                  >
                    {isActive ? 'Activo (Público)' : 'Pausado (Oculto)'}
                  </span>
                </label>
                <button
                  type="button"
                  id="service-status-toggle"
                  onClick={() => setIsActive(!isActive)}
                  className={`${styles.toggleButtonSmall} ${
                    isActive ? styles.toggleBtnOn : styles.toggleBtnOff
                  }`}
                >
                  <Power size={16} />
                  <span>{isActive ? 'Pausar este servicio' : 'Activar este servicio'}</span>
                </button>
              </div>

              {/* Actions */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                  disabled={savingService || uploadingAfter || uploadingBefore}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingService || uploadingAfter || uploadingBefore}
                  className="btn btn-primary"
                >
                  {savingService ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>{isCreatingNew ? 'Crear Servicio' : 'Guardar Cambios'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
