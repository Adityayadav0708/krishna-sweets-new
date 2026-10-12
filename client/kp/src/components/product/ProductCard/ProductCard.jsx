import { Check, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/format';
import styles from './ProductCard.module.css';
export function ProductCard({ product, added, onAdd }) {
    return (<article className={styles.card}>
      <div className={styles.imageWrap}>
        <Link to={`/products/${product.slug}`} className={styles.imageLink} aria-label={`View ${product.name}`}>
          <img src={product.image} alt={product.imageAlt} loading="lazy"/>
        </Link>
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        <button type="button" className={`${styles.addButton} ${added ? styles.added : ''}`} onClick={() => onAdd(product)} aria-label={`Add ${product.name} to order bag`}>
          {added ? <Check size={18}/> : <Plus size={19}/>}
        </button>
      </div>
      <div className={styles.content}>
        <div className={styles.meta}>
          <span>{product.category}</span>
          <span>{product.unit}</span>
        </div>
        <h3><Link to={`/products/${product.slug}`}>{product.name}</Link></h3>
        <p>{product.shortDescription}</p>
        <div className={styles.priceRow}>
          <strong>{formatPrice(product.price)}</strong>
          <button type="button" onClick={() => onAdd(product)}>{added ? 'Added to bag' : 'Add to order'}</button>
        </div>
      </div>
    </article>);
}
