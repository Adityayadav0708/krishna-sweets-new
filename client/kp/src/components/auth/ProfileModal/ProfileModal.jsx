import { useEffect, useState } from 'react';
import { X, User, Phone, MapPin, Shield, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './ProfileModal.module.css';

export function ProfileModal() {
  const { user, isProfileModalOpen, closeProfileModal, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    addressLine: '',
    city: 'Chhibramau',
    pinCode: '209721',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      let savedAddress = null;
      try {
        const raw = localStorage.getItem('ks_default_address');
        if (raw) savedAddress = JSON.parse(raw);
      } catch (e) {}

      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || savedAddress?.phone || '',
        addressLine: savedAddress?.addressLine || '',
        city: savedAddress?.city || 'Chhibramau',
        pinCode: savedAddress?.pinCode || '209721',
      });
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [user, isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
    if (successMsg) setSuccessMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (!formData.name.trim()) throw new Error('Name cannot be empty.');

      // Update basic profile details in backend
      await updateProfile({
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
      });

      // Save default delivery address locally for frictionless checkout
      const defaultAddr = {
        fullName: formData.name.trim(),
        phone: formData.mobile.trim(),
        addressLine: formData.addressLine.trim(),
        city: formData.city.trim() || 'Chhibramau',
        pinCode: formData.pinCode.trim() || '209721',
      };
      localStorage.setItem('ks_default_address', JSON.stringify(defaultAddr));

      setSuccessMsg('Your profile and delivery address have been updated successfully!');
      setTimeout(() => {
        closeProfileModal();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : 'K';

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeProfileModal();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <h2 className={styles.headerTitle}>My Account & Delivery Profile</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeProfileModal}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSave} style={{ display: 'contents' }}>
          <div className={styles.body}>
            {/* User Avatar & Identity Card */}
            <div className={styles.userCard}>
              <div className={styles.avatar}>{initialLetter}</div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{user.name}</div>
                <div className={styles.userEmail}>{user.email}</div>
                <span
                  className={`${styles.roleBadge} ${
                    user.role === 'admin' ? styles.roleAdmin : styles.roleCustomer
                  }`}
                >
                  {user.role === 'admin' ? (
                    <>
                      <Shield size={11} /> Store Administrator
                    </>
                  ) : (
                    <>
                      <User size={11} /> Valued Customer
                    </>
                  )}
                </span>
              </div>
            </div>

            {successMsg && (
              <div className={`${styles.saveMsg} ${styles.saveSuccess}`}>
                <Check size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className={`${styles.saveMsg} ${styles.saveError}`}>
                <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
                {errorMsg}
              </div>
            )}

            <div className={styles.sectionHeading}>
              <User size={14} /> Personal Details
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Enter your name"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email Address (Registered)</label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className={`${styles.input} ${styles.inputReadOnly}`}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Mobile Phone Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            {/* Default Delivery Address Section */}
            <div className={styles.addressBox}>
              <div className={styles.sectionHeading}>
                <MapPin size={14} /> Default Delivery Address (Chhibramau)
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Street / Mohalla / House No.</label>
                  <input
                    type="text"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. Near G.T. Road, Gandhi Chowk, Chhibramau"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className={styles.field}>
                    <label className={styles.label}>City / Town</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Chhibramau"
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>PIN Code</label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="209721"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={closeProfileModal}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={13} style={{ animation: 'spin 1s infinite' }} /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
