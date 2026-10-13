import { useMemo, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/format';
import styles from './ProductCard.module.css';

export function ProductCard({ product, added, onAdd }) {
    const availableSizes = useMemo(() => {
        if (Array.isArray(product.sizes) && product.sizes.length > 0) {
            return product.sizes;
        }
        const basePrice = Number(product.price) || 500;
        return [
            { label: '250g', price: Math.round(basePrice * 0.28) },
            { label: '500g', price: Math.round(basePrice * 0.53) },
            { label: '1kg', price: basePrice },
        ];
    }, [product]);

    const [selectedSize, setSelectedSize] = useState(() => {
        const has500 = availableSizes.find((s) => s.label === '500g');
        return has500 ? '500g' : availableSizes[0]?.label || '500g';
    });

    const activeOption = availableSizes.find((s) => s.label === selectedSize) || availableSizes[0];
    const displayPrice = activeOption?.price ?? product.price;

    return (
      <article className={styles.card}>
        <div className={styles.imageWrap}>
          <Link to={`/products/${product.slug}`} className={styles.imageLink} aria-label={`View ${product.name}`}>
            <img src={product.image} alt={product.imageAlt} loading="lazy"/>
          </Link>
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
          <button
            type="button"
            className={`${styles.addButton} ${added ? styles.added : ''}`}
            onClick={() => onAdd(product, selectedSize)}
            aria-label={`Add ${product.name} (${selectedSize}) to order bag`}
          >
            {added ? <Check size={18}/> : <Plus size={19}/>}
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.meta}>
            <span>{product.category}</span>
            <span>{selectedSize}</span>
          </div>
          <h3><Link to={`/products/${product.slug}`}>{product.name}</Link></h3>
          <p>{product.shortDescription}</p>

          <div className={styles.sizePills}>
            {availableSizes.map((size) => (
              <button
                type="button"
                key={size.label}
                className={`${styles.sizePill} ${selectedSize === size.label ? styles.sizePillActive : ''}`}
                onClick={() => setSelectedSize(size.label)}
              >
                {size.label}
              </button>
            ))}
          </div>

          <div className={styles.priceRow}>
            <strong>{formatPrice(displayPrice)}</strong>
            <button type="button" onClick={() => onAdd(product, selectedSize)}>
              {added ? 'Added to bag' : `Add ${selectedSize}`}
            </button>
          </div>
        </div>
      </article>
    );
}
