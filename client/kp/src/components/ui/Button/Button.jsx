import { Link } from 'react-router-dom';
import styles from './Button.module.css';
const classes = (variant, className = '') => `${styles.button} ${styles[variant]} ${className}`;
export function Button({ children, variant = 'primary', className, ...props }) {
    return (<button className={classes(variant, className)} {...props}>
      {children}
    </button>);
}
export function ButtonLink({ children, variant = 'primary', className, ...props }) {
    return (<Link className={classes(variant, className)} {...props}>
      {children}
    </Link>);
}
