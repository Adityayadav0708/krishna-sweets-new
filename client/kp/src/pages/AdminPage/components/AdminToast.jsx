import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import styles from './AdminToast.module.css';

export function AdminToast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div
      className={`${styles.toast} ${
        toast.type === 'error' ? styles.toastError : styles.toastSuccess
      }`}
      role="status"
      aria-live="polite"
    >
      {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        className={styles.toastClose}
        aria-label="Dismiss message"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default AdminToast;
