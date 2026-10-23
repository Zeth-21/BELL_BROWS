'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User, Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';
import styles from './portal.module.css';

interface LoginFormProps {
  onLoginSuccess: (user?: any) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load remembered username/email if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bellbrows_remember_user');
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage exceptions in restricted environments
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // Allow username without @ or full email
      const finalEmail = email.includes('@') 
        ? email.trim() 
        : `${email.trim()}@bellbrows.com`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password,
      });

      if (error) {
        setErrorMessage(
          error.message === 'Invalid login credentials'
            ? 'Credenciales incorrectas. Verifica tu usuario y contraseña.'
            : error.message
        );
        return;
      }

      if (rememberMe) {
        try {
          localStorage.setItem('bellbrows_remember_user', email.trim());
        } catch {}
      } else {
        try {
          localStorage.removeItem('bellbrows_remember_user');
        } catch {}
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
        {/* Header matching Image 1: Left-aligned bold Login and subtitle */}
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Login</h1>
          <p className={styles.loginSubtitle}>
            Welcome back please login to your account
          </p>
        </div>

        {errorMessage && (
          <div className={styles.errorBox}>
            <AlertCircle size={18} className={styles.errorIcon} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* User Name input with user icon on the right */}
          <div className={styles.inputWrap}>
            <input
              id="login-username"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="User Name"
              required
              autoComplete="username email"
              className={styles.glassInput}
              aria-label="User Name or Email"
            />
            <div className={styles.inputRightIcon}>
              <User size={20} strokeWidth={1.8} />
            </div>
          </div>

          {/* Password input with eye toggle on the right */}
          <div className={styles.inputWrap}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className={styles.glassInput}
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.eyeToggleBtn}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff size={20} strokeWidth={1.8} />
              ) : (
                <Eye size={20} strokeWidth={1.8} />
              )}
            </button>
          </div>

          {/* Remember me checkbox matching Image 1 */}
          <label className={styles.rememberRow}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={styles.checkboxHidden}
            />
            <span
              className={`${styles.customCheckbox} ${
                rememberMe ? styles.customCheckboxChecked : ''
              }`}
            >
              {rememberMe && <Check size={13} strokeWidth={3} />}
            </span>
            <span className={styles.rememberLabel}>Remember me</span>
          </label>

          {/* Pill submit button with olive-gold theme matching Image 1 */}
          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                <span>Validando...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>

          {/* Footer matching Image 1: Don't have an account? Signup */}
          <div className={styles.loginFooter}>
            <span>Don’t have an account?</span>
            <a
              href="/"
              className={styles.signupLink}
              title="Volver a la página principal de Bell Brows"
            >
              Signup
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
