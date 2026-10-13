import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './AuthModal.module.css';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    authPromptMessage,
    setAuthModalMode,
    closeAuthModal,
    login,
    signup,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens or mode changes
  useEffect(() => {
    setError('');
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setSuccess('Your email has been verified successfully! Please sign in to continue.');
    } else {
      setSuccess('');
    }
    setFormData({ name: '', email: '', password: '' });
  }, [isAuthModalOpen, authModalMode]);

  // Handle ESC key press
  useEffect(() => {
    if (!isAuthModalOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (authModalMode === 'login') {
        await login({
          email: formData.email.trim(),
          password: formData.password,
        });
      } else {
        const res = await signup({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
        setSuccess(
          res.message ||
            'Registration successful! Please check your email to verify your account.'
        );
        // Switch to login tab after brief pause
        setTimeout(() => {
          setAuthModalMode('login');
        }, 2200);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeAuthModal}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
          <span className={styles.eyebrow}>
            {authPromptMessage ? 'Order Checkout' : 'Krishna Sweets'}
          </span>
          <h2 id="auth-modal-title" className={styles.title}>
            {authModalMode === 'login' ? 'Login to Continue' : 'Create Account'}
          </h2>
          {authPromptMessage && (
            <p className={styles.promptSubtitle}>
              {authPromptMessage}
            </p>
          )}
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${
              authModalMode === 'login' ? styles.tabActive : ''
            }`}
            onClick={() => setAuthModalMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.tab} ${
              authModalMode === 'signup' ? styles.tabActive : ''
            }`}
            onClick={() => setAuthModalMode('signup')}
          >
            Register
          </button>
        </div>

        <div className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            {authModalMode === 'signup' && (
              <div className={styles.field}>
                <label htmlFor="auth-name" className={styles.label}>
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="e.g. Aditya Yadav"
                  autoComplete="name"
                />
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="auth-email" className={styles.label}>
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="auth-password" className={styles.label}>
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="••••••••"
                autoComplete={
                  authModalMode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={styles.submitBtn}
            >
              {submitting
                ? 'Processing...'
                : authModalMode === 'login'
                ? 'Sign In to Account'
                : 'Create Account'}
            </button>
          </form>

          <p className={styles.footerText}>
            {authModalMode === 'login' ? (
              <>
                New to Krishna Sweets?{' '}
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => setAuthModalMode('signup')}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => setAuthModalMode('login')}
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
