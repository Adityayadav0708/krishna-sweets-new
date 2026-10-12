import styles from './SectionHeading.module.css';
export function SectionHeading({ eyebrow, title, body, align = 'left' }) {
    return (<header className={`${styles.heading} ${styles[align]}`}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </header>);
}
