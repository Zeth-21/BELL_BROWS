'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Lock, Mail, Eye, EyeOff, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import styles from './portal.module.css';

interface LoginFormProps {
  onLoginSuccess: (user?: any) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(
          error.message === 'Invalid login credentials'
            ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
            : error.message
        );
        return;
      }

      if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.loginIconWrap}>
            <Sparkles size={24} />
          </div>
          <h1 className={styles.loginTitle}>Acceso de Gestión</h1>
          <p className={styles.loginSubtitle}>
            Introduce tus credenciales para administrar el catálogo y las ofertas
          </p>
        </div>

        {errorMessage && (
          <div className={styles.errorBox}>
            <AlertCircle size={18} className={styles.errorIcon} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="login-email">Usuario / Correo Electrónico</label>
            <div className={styles.inputWrap}>
              <Mail size={18} className={styles.fieldIcon} />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@bellbrows.com"
                required
                autoComplete="email"
                className={styles.textInput}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="login-password">Contraseña</label>
            <div className={styles.inputWrap}>
              <Lock size={18} className={styles.fieldIcon} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className={styles.textInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeBtn}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary ${styles.submitBtn}`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Validando acceso...</span>
              </>
            ) : (
              <span>Entrar al Portal</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
