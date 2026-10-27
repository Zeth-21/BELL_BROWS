'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { uploadMediaFile } from '@/lib/supabase/storage';
import { Service } from '@/types/database';
import { formatPrice } from '@/lib/utils';
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
  const [category, setCategory] = useState('Cejas');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

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
    setCategory(service.category || 'Cejas');
    setDurationMinutes(service.duration_minutes || 60);
    setImageUrl(service.image_url || '');
    setIsActive(service.is_active);
  };

  const openNewModal = () => {
    setEditingService(null);
    setIsCreatingNew(true);
    setTitle('');
    setDescription('');
    setPrice(50);
    setCategory('Cejas');
    setDurationMinutes(60);
    setImageUrl('');
    setIsActive(true);
  };

  const closeModal = () => {
    setEditingService(null);
    setIsCreatingNew(false);
  };

  // Instant direct image replacement for a specific service card (from camera/gallery)
  const handleDirectImageUpload = async (
    serviceId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingForId(serviceId);
      const { url, error } = await uploadMediaFile(file, 'services');

      if (error || !url) {
        showToast('error', `Error al subir imagen: ${error}`);
        return;
      }

      // Update in Supabase immediately
      const { error: dbError } = await supabase
        .from('services')
        .update({
          image_url: url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId);

      if (dbError) throw dbError;

      // Update local state
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, image_url: url } : s))
      );

      if (editingService && editingService.id === serviceId) {
        setImageUrl(url);
      }

      showToast('success', '¡Foto actualizada en Supabase correctamente!');
    } catch (err: any) {
      showToast('error', err?.message || 'Error al actualizar la foto');
    } finally {
      setUploadingForId(null);
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

    const parsedPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;

    try {
      setSavingService(true);

      if (isCreatingNew) {
        // Create new
        const { data, error } = await supabase
          .from('services')
          .insert({
            title: title.trim(),
            description: description.trim(),
            price: parsedPrice,
            category: category.trim(),
            duration_minutes: durationMinutes,
            image_url: imageUrl || null,
            is_active: isActive,
            display_order: services.length + 1,
          })
          .select()
          .single();

        if (error) throw error;
        setServices((prev) => [...prev, data]);
        showToast('success', '¡Nuevo servicio agregado exitosamente!');
        closeModal();
      } else if (editingService) {
        // Update existing
        const { data, error } = await supabase
          .from('services')
          .update({
            title: title.trim(),
            description: description.trim(),
            price: parsedPrice,
            category: category.trim(),
            duration_minutes: durationMinutes,
            image_url: imageUrl || null,
            is_active: isActive,
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
            Modifica precios, títulos, descripciones y sustituye fotos al instante desde tu celular
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
            {/* Top row with image & quick replace */}
            <div className={styles.serviceImageRow}>
              <div className={styles.serviceThumb}>
                {service.image_url ? (
                  <Image
                    src={service.image_url}
                    alt={service.title}
                    fill
                    sizes="120px"
                    className={styles.thumbImg}
                  />
                ) : (
                  <div className={styles.thumbPlaceholder}>
                    <Sparkles size={20} />
                  </div>
                )}
                {uploadingForId === service.id && (
                  <div className={styles.thumbUploadingOverlay}>
                    <Loader2 size={24} className={styles.spinner} />
                  </div>
                )}
              </div>

              {/* Direct Camera / File trigger */}
              <div className={styles.quickPhotoActions}>
                <label
                  htmlFor={`file-service-${service.id}`}
                  className={`btn btn-secondary ${styles.cameraBtn}`}
                  title="Cambiar foto con cámara o galería"
                >
                  <Camera size={16} />
                  <span className={styles.cameraBtnText}>Cambiar Foto</span>
                </label>
                <input
                  id={`file-service-${service.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleDirectImageUpload(service.id, e)}
                  disabled={uploadingForId === service.id}
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
                  {service.category || 'General'}
                </span>
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
                <label htmlFor="service-category">Categoría</label>
                <input
                  id="service-category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Cejas, Pestañas, Labios, Facial..."
                />
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

              {/* Image URL preview or change */}
              <div className={styles.formGroup}>
                <label>Fotografía del Servicio</label>
                <div className={styles.modalImageWrap}>
                  {imageUrl ? (
                    <div className={styles.modalImgBox}>
                      <Image
                        src={imageUrl}
                        alt="Vista previa"
                        fill
                        sizes="200px"
                        className={styles.modalImgPreview}
                      />
                    </div>
                  ) : (
                    <div className={styles.modalNoImg}>Sin fotografía asignada</div>
                  )}

                  <label
                    htmlFor="modal-photo-upload"
                    className={`btn btn-secondary ${styles.modalPhotoBtn}`}
                  >
                    <Camera size={16} />
                    <span>Subir desde Cámara/Galería</span>
                  </label>
                  <input
                    id="modal-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const { url, error } = await uploadMediaFile(file, 'services');
                      if (url) setImageUrl(url);
                      if (error) showToast('error', error);
                    }}
                    style={{ display: 'none' }}
                  />
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
                  disabled={savingService}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingService}
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
