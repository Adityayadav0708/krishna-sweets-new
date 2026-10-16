import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Award, Leaf, MessageCircle, PackageCheck, ShieldCheck, Star, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '@/cart/useCart';
import { QuantityStepper } from '@/components/cart/QuantityStepper/QuantityStepper';
import { Header } from '@/components/layout/Header/Header';
import { Container } from '@/components/layout/Container/Container';
import { ProductCard } from '@/components/product/ProductCard/ProductCard';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { ROUTES } from '@/app/routes';
import { products } from '@/data/products';
import { productService } from '@/services/productService';
import { business } from '@/data/site';
import { formatPrice } from '@/utils/format';
import styles from './ProductDetailPage.module.css';
export function ProductDetailPage() {
    const { slug } = useParams();
    const [allProducts, setAllProducts] = useState(products);
    const { addItem, items, openCart, totalCount } = useCart();

    useEffect(() => {
        let active = true;
        productService.getProducts().then((data) => {
            if (active && Array.isArray(data) && data.length > 0) {
                setAllProducts(data);
            }
        });
        return () => {
            active = false;
        };
    }, []);

    const product =
        allProducts.find((entry) => entry.slug === slug || entry.id === slug || entry._id === slug) ||
        products.find((entry) => entry.slug === slug || entry.id === slug || entry._id === slug);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(() => {
        if (!product) return '500g';
        return product.sizes?.some((size) => size.label === '500g') ? '500g' : product.sizes?.[0]?.label || '500g';
    });
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (product && Array.isArray(product.sizes) && product.sizes.length > 0) {
            const hasMatch = product.sizes.some((s) => s.label === selectedSize);
            if (!hasMatch) {
                const defaultOption = product.sizes.find((s) => s.label === '500g') || product.sizes[0];
                setSelectedSize(defaultOption.label);
            }
        }
    }, [product]);

    const relatedProducts = useMemo(() => {
        if (!product)
            return [];
        return allProducts
            .filter((entry) => entry.id !== product.id)
            .filter((entry) => entry.category === product.category || entry.popular)
            .slice(0, 3);
    }, [product, allProducts]);
    if (!product) {
        return (<div id="top">
        <Header cartCount={totalCount} onCartOpen={openCart}/>
        <main className={styles.notFound}>

          <h1>Sweet not found.</h1>
          <p>This product may have moved, or the catalogue link may be incomplete.</p>
          <Link to={ROUTES.products}>Return to products</Link>
        </main>
      </div>);
    }
    const selectedOption =
        product.sizes?.find((size) => size.label === selectedSize) ??
        product.sizes?.[0] ?? { label: product.unit || '500g', price: product.price };
    const galleryImage = product.gallery[selectedImage] ?? product.image;
    const addToCart = () => {
        addItem(product, selectedSize, quantity);
        openCart();
    };

    const handleCashOnDelivery = () => {
        addItem(product, selectedSize, quantity);
        openCart();
    };

    // Pre-filled WhatsApp link with the selected sweet, size and total price
    const whatsappUrl = useMemo(() => {
        if (!product) return '';
        const itemPrice = selectedOption?.price || product.price;
        const lineTotal = itemPrice * quantity;
        const message = `Hello ${business.name}, I would like to order:\n- ${product.name} (${selectedSize}) x ${quantity} = ${formatPrice(lineTotal)}\nPlease confirm availability & delivery.`;
        return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
    }, [product, selectedOption, selectedSize, quantity]);

    return (<div id="top">
      <Header cartCount={totalCount} onCartOpen={openCart}/>
      <main>
        <section className={styles.productHero}>
          <Container>
            <Link className={styles.backLink} to={ROUTES.products}>
              <ArrowLeft size={17}/> Back to products
            </Link>

            <div className={styles.productGrid}>
              <div className={styles.gallery} aria-label={`${product.name} image gallery`}>
                <div className={styles.mainImage}>
                  <img src={galleryImage} alt={product.imageAlt}/>
                  <div className={styles.imageBadges}>
                    {product.popular && <span><Award size={14}/> Bestseller</span>}
                    {product.festivalTags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                </div>
                <div className={styles.thumbnails}>
                  {product.gallery.map((image, index) => (<button type="button" className={selectedImage === index ? styles.activeThumb : ''} onClick={() => setSelectedImage(index)} aria-label={`Show ${product.name} image ${index + 1}`} key={image}>
                      <img src={image} alt="" loading="lazy"/>
                    </button>))}
                </div>
              </div>

              <div className={styles.summary}>
                <span className={styles.eyebrow}>{product.category}</span>
                <h1>{product.name}</h1>
                <p>{product.description}</p>

                <div className={styles.rating}>
                  <span aria-label={`${product.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (<Star size={16} fill={star <= Math.round(product.rating) ? 'currentColor' : 'none'} key={star}/>))}
                  </span>
                  <strong>{product.rating.toFixed(1)}</strong>
                  <small>{product.reviewCount} customer notes</small>
                </div>

                <div className={styles.priceBlock}>
                  <strong>{formatPrice(selectedOption.price)}</strong>
                  <span>{selectedSize}</span>
                </div>

                <div className={styles.sizePicker}>
                  <span>Available sizes</span>
                  <div>
                    {product.sizes.map((size) => (<button type="button" className={selectedSize === size.label ? styles.selectedSize : ''} onClick={() => setSelectedSize(size.label)} key={size.label}>
                        <strong>{size.label}</strong>
                        <small>{formatPrice(size.price)}</small>
                      </button>))}
                  </div>
                </div>

                <div className={styles.orderControls}>
                  <QuantityStepper value={quantity} label={`Quantity for ${product.name}`} onChange={setQuantity}/>
                  <button type="button" onClick={addToCart}>
                    Add to cart - {formatPrice(selectedOption.price * quantity)}
                  </button>
                </div>

                {/* Instant Order Buttons (Cash on Delivery & WhatsApp) */}
                <div className={styles.directOrderButtons}>
                  <button
                    type="button"
                    className={styles.codButton}
                    onClick={handleCashOnDelivery}
                    aria-label={`Order ${product.name} with Cash on Delivery`}
                  >
                    <Truck size={18} /> Cash on Delivery
                  </button>

                  <a
                    className={styles.whatsappButton}
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Order ${product.name} directly on WhatsApp`}
                  >
                    <MessageCircle size={18} /> Order on WhatsApp
                  </a>
                </div>

                <div className={styles.assurances}>
                  <span><Leaf size={18}/> {product.dietary.join(', ')}</span>
                  <span><PackageCheck size={18}/> Shelf life: {product.shelfLife}</span>
                  <span><ShieldCheck size={18}/> Packed fresh for pickup or delivery</span>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className={styles.detailsSection}>
          <Container className={styles.detailsGrid}>
            <article>
              <h2>Ingredients</h2>
              <ul>
                {product.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
              </ul>
            </article>
            <article>
              <h2>Storage instructions</h2>
              <p>{product.storage}</p>
            </article>
            <article>
              <h2>Dietary labels</h2>
              <div className={styles.labelRow}>
                {product.dietary.map((label) => <span key={label}>{label}</span>)}
              </div>
            </article>
          </Container>
        </section>

        {relatedProducts.length > 0 && (<section className={styles.relatedSection}>
            <Container>
              <SectionHeading eyebrow="You may also like" title="Related handcrafted favourites." body="Chosen from the same collection and our most-loved daily sweets." align="center"/>
              <div className={styles.relatedGrid}>
                {relatedProducts.map((entry) => (<ProductCard product={entry} added={items.some((item) => item.productId === entry.id)} onAdd={addItem} key={entry.id}/>))}
              </div>
            </Container>
          </section>)}
      </main>
    </div>);
}
