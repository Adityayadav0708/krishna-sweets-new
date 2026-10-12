import { Minus, Plus } from 'lucide-react';
import styles from './QuantityStepper.module.css';
export function QuantityStepper({ value, min = 1, max = 20, label, onChange }) {
    const decrement = () => onChange(Math.max(min, value - 1));
    const increment = () => onChange(Math.min(max, value + 1));
    return (<div className={styles.stepper} aria-label={label}>
      <button type="button" onClick={decrement} disabled={value <= min} aria-label="Decrease quantity">
        <Minus size={15}/>
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={increment} disabled={value >= max} aria-label="Increase quantity">
        <Plus size={15}/>
      </button>
    </div>);
}
