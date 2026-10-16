import { Calendar, ChevronDown } from 'lucide-react';
import styles from './DateRangePicker.module.css';

const PRESET_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_year', label: 'This Year' },
  { id: 'this_fy', label: 'Financial Year' },
  { id: 'custom', label: 'Custom Range' },
];

export function DateRangePicker({
  period,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  onApplyCustom,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.labelRow}>
        <span className={styles.filterTitle}>
          <Calendar size={15} color="#a06e18" /> Date Filter:
        </span>
      </div>

      <div className={styles.pillsList}>
        {PRESET_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`${styles.pill} ${period === opt.id ? styles.pillActive : ''}`}
            onClick={() => onPeriodChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <form
          className={styles.customDateForm}
          onSubmit={(e) => {
            e.preventDefault();
            onApplyCustom();
          }}
        >
          <div className={styles.dateInputGroup}>
            <label>From:</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              required
            />
          </div>
          <div className={styles.dateInputGroup}>
            <label>To:</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.applyBtn}>
            Apply
          </button>
        </form>
      )}
    </div>
  );
}

export default DateRangePicker;
