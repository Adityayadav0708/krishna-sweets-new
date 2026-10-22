import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';
import styles from './AuthModal.module.css';

// Forgot-password has 3 sub-steps, managed locally in this component:
//  'fp-email'  → user enters email, backend sends OTP
//  'fp-otp'    → user enters 6-digit OTP
//  'fp-reset'  → user enters new password + confirm

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
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Forgot-password local state ───────────────────────────────────────────
  const [fpStep, setFpStep]       = useState('fp-email'); // 'fp-email' | 'fp-otp' | 'fp-reset'
  const [fpEmail, setFpEmail]     = useState('');
  const [fpOtp, setFpOtp]         = useState('');
  const [fpNew, setFpNew]         = useState('');
  const [fpConfirm, setFpConfirm] = useState('');
  // ─────────────────────────────────────────────────────────────────────────

  const isForgot = authModalMode === 'forgot';

  // Reset everything when modal opens / mode changes
  useEffect(() => {
    setError('');
    setFpStep('fp-email');
    setFpEmail('');
    setFpOtp('');
    setFpNew('');
    setFpConfirm('');

    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setSuccess('Your email has been verified successfully! Please sign in to continue.');
    } else {
      setSuccess('');
    }
    setFormData({ name: '', email: '', password: '' });
  }, [isAuthModalOpen, authModalMode]);

  // ESC key
  useEffect(() => {
    if (!isAuthModalOpen) return undefined;
    const handleKeyDown = (e) => { if (e.key === 'Escape') closeAuthModal(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // ── Normal login / signup field change ───────────────────────────────────
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  // ── Normal login / signup submit ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (authModalMode === 'login') {
        await login({ email: formData.email.trim(), password: formData.password });
      } else {
        const res = await signup({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
        setSuccess(res.message || 'Registration successful! Please check your email to verify your account.');
        setTimeout(() => setAuthModalMode('login'), 2200);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Forgot-password: step 1 — send OTP ───────────────────────────────────
  const handleFpEmail = async (e) => {
    e.preventDefault();
    if (!fpEmail.trim()) { setError('Please enter your email address.'); return; }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: fpEmail.trim() });
      setSuccess(res.data?.message || 'OTP sent! Check your inbox.');
      setFpStep('fp-otp');
    } catch (err) {
      setError(err.message || 'Could not send OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Forgot-password: step 2 — verify OTP ─────────────────────────────────
  const handleFpOtp = async (e) => {
    e.preventDefault();
    if (!fpOtp.trim()) { setError('Please enter the OTP.'); return; }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/verify-forgot-password-otp', {
        email: fpEmail.trim(),
        otp: fpOtp.trim(),
      });
      setSuccess(res.data?.message || 'OTP verified! Set your new password.');
      setFpStep('fp-reset');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Forgot-password: step 3 — reset password ─────────────────────────────
  const handleFpReset = async (e) => {
    e.preventDefault();
    if (fpNew.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (fpNew !== fpConfirm) { setError('Passwords do not match.'); return; }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: fpEmail.trim(),
        newPassword: fpNew,
        confirmedPassword: fpConfirm,
      });
      setSuccess(res.data?.message || 'Password reset successfully!');
      setTimeout(() => setAuthModalMode('login'), 2000);
    } catch (err) {
      setError(err.message || 'Could not reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Forgot-password title & subtitle per step ─────────────────────────────
  const fpTitle = {
    'fp-email': 'Forgot Password',
    'fp-otp':   'Enter OTP',
    'fp-reset': 'Reset Password',
  }[fpStep];

  const fpSubtitle = {
    'fp-email': 'Enter your registered email and we\'ll send you a one-time code.',
    'fp-otp':   `A 6-digit OTP was sent to ${fpEmail}. Enter it below.`,
    'fp-reset': 'Choose a new password for your account.',
  }[fpStep];

  // ── Step indicator dots (forgot flow) ─────────────────────────────────────
  const fpStepIndex = { 'fp-email': 0, 'fp-otp': 1, 'fp-reset': 2 }[fpStep];

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) closeAuthModal(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className={styles.modal}>
        {/* ── Header ── */}
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
            {isForgot
              ? fpTitle
              : authModalMode === 'login'
              ? 'Login to Continue'
              : 'Create Account'}
          </h2>
          {isForgot && (
            <p className={styles.promptSubtitle}>{fpSubtitle}</p>
          )}
          {!isForgot && authPromptMessage && (
            <p className={styles.promptSubtitle}>{authPromptMessage}</p>
          )}
        </div>

        {/* ── Tabs (login / signup only) ── */}
        {!isForgot && (
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${authModalMode === 'login' ? styles.tabActive : ''}`}
              onClick={() => setAuthModalMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`${styles.tab} ${authModalMode === 'signup' ? styles.tabActive : ''}`}
              onClick={() => setAuthModalMode('signup')}
            >
              Register
            </button>
          </div>
        )}

        {/* ── Step dots (forgot flow) ── */}
        {isForgot && (
          <div className={styles.fpSteps}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`${styles.fpDot} ${i === fpStepIndex ? styles.fpDotActive : ''} ${i < fpStepIndex ? styles.fpDotDone : ''}`}
              />
            ))}
          </div>
        )}

        {/* ── Body ── */}
        <div className={styles.body}>
          {error   && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          {/* ──── Forgot-password forms ──── */}
          {isForgot && fpStep === 'fp-email' && (
            <form className={styles.form} onSubmit={handleFpEmail}>
              <div className={styles.field}>
                <label htmlFor="fp-email-input" className={styles.label}>Email Address</label>
                <input
                  id="fp-email-input"
                  type="email"
                  required
                  value={fpEmail}
                  onChange={(e) => { setFpEmail(e.target.value); if (error) setError(''); }}
                  className={styles.input}
                  placeholder="name@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <button type="submit" disabled={submitting} className={styles.submitBtn}>
                {submitting ? 'Sending OTP…' : 'Send OTP'}
              </button>
              <p className={styles.footerText}>
                <button type="button" className={styles.linkBtn} onClick={() => setAuthModalMode('login')}>
                  ← Back to Sign In
                </button>
              </p>
            </form>
          )}

          {isForgot && fpStep === 'fp-otp' && (
            <form className={styles.form} onSubmit={handleFpOtp}>
              <div className={styles.field}>
                <label htmlFor="fp-otp-input" className={styles.label}>One-Time Password</label>
                <input
                  id="fp-otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={fpOtp}
                  onChange={(e) => { setFpOtp(e.target.value.replace(/\D/g, '')); if (error) setError(''); }}
                  className={`${styles.input} ${styles.otpInput}`}
                  placeholder="••••••"
                  autoFocus
                />
              </div>
              <button type="submit" disabled={submitting} className={styles.submitBtn}>
                {submitting ? 'Verifying…' : 'Verify OTP'}
              </button>
              <p className={styles.footerText}>
                Didn't receive it?{' '}
                <button
                  type="button"
                  className={styles.linkBtn}
                  disabled={submitting}
                  onClick={() => {
                    setFpStep('fp-email');
                    setFpOtp('');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Resend OTP
                </button>
              </p>
            </form>
          )}

          {isForgot && fpStep === 'fp-reset' && (
            <form className={styles.form} onSubmit={handleFpReset}>
              <div className={styles.field}>
                <label htmlFor="fp-new-pw" className={styles.label}>New Password</label>
                <input
                  id="fp-new-pw"
                  type="password"
                  required
                  minLength={6}
                  value={fpNew}
                  onChange={(e) => { setFpNew(e.target.value); if (error) setError(''); }}
                  className={styles.input}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="fp-confirm-pw" className={styles.label}>Confirm Password</label>
                <input
                  id="fp-confirm-pw"
                  type="password"
                  required
                  minLength={6}
                  value={fpConfirm}
                  onChange={(e) => { setFpConfirm(e.target.value); if (error) setError(''); }}
                  className={styles.input}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" disabled={submitting} className={styles.submitBtn}>
                {submitting ? 'Saving…' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* ──── Normal login / signup form ──── */}
          {!isForgot && (
            <form className={styles.form} onSubmit={handleSubmit}>
              {authModalMode === 'signup' && (
                <div className={styles.field}>
                  <label htmlFor="auth-name" className={styles.label}>Full Name</label>
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
                <label htmlFor="auth-email" className={styles.label}>Email Address</label>
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
                <div className={styles.passwordRow}>
                  <label htmlFor="auth-password" className={styles.label}>Password</label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      className={styles.forgotLink}
                      onClick={() => setAuthModalMode('forgot')}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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
                  autoComplete={authModalMode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>

              <button type="submit" disabled={submitting} className={styles.submitBtn}>
                {submitting
                  ? 'Processing...'
                  : authModalMode === 'login'
                  ? 'Sign In to Account'
                  : 'Create Account'}
              </button>
            </form>
          )}

          {/* ──── Footer text (login/signup only) ──── */}
          {!isForgot && (
            <p className={styles.footerText}>
              {authModalMode === 'login' ? (
                <>
                  New to Krishna Sweets?{' '}
                  <button type="button" className={styles.linkBtn} onClick={() => setAuthModalMode('signup')}>
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button type="button" className={styles.linkBtn} onClick={() => setAuthModalMode('login')}>
                    Sign in here
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
