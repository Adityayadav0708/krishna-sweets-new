import { useMemo, useState } from 'react';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '@/cart/useCart';
import { Header } from '@/components/layout/Header/Header';
import { Container } from '@/components/layout/Container/Container';
import { ProductCard } from '@/components/product/ProductCard/ProductCard';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { products } from '@/data/products';
import styles from './ProductsPage.module.css';
const categories = ['Signature', 'Bengali', 'Ladoo', 'Festive'];
const priceRanges = [
    { label: 'All prices', value: 'all' },
    { label: 'Under INR 400', value: 'under-400' },
    { label: 'INR 400 - INR 600', value: '400-600' },
    { label: 'Above INR 600', value: 'above-600' },
];
const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: low to high', value: 'price-asc' },
    { label: 'Price: high to low', value: 'price-desc' },
    { label: 'Highest rated', value: 'rating' },
    { label: 'Name A-Z', value: 'name' },
];
const isPriceRange = (value) => priceRanges.some((range) => range.value === value);
const isSortOption = (value) => sortOptions.some((option) => option.value === value);
const matchesPrice = (product, range) => {
    if (range === 'under-400')
        return product.price < 400;
    if (range === '400-600')
        return product.price >= 400 && product.price <= 600;
    if (range === 'above-600')
        return product.price > 600;
    return true;
};
export function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const { addItem, items, openCart, totalCount } = useCart();
    const query = searchParams.get('q') ?? '';
    const rawCategory = searchParams.get('category');
    const rawPrice = searchParams.get('price');
    const rawSort = searchParams.get('sort');
    const selectedCategory = categories.includes(rawCategory)
        ? rawCategory
        : 'all';
    const selectedPrice = isPriceRange(rawPrice) ? rawPrice : 'all';
    const selectedSort = isSortOption(rawSort) ? rawSort : 'featured';
    const updateParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'all' || (key === 'sort' && value === 'featured')) {
            next.delete(key);
        }
        else {
            next.set(key, value);
        }
        setSearchParams(next, { replace: true });
    };
    const clearFilters = () => {
        setSearchParams({}, { replace: true });
        setFiltersOpen(false);
    };
    const filteredProducts = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return products
            .filter((product) => (selectedCategory === 'all' || product.category === selectedCategory))
            .filter((product) => matchesPrice(product, selectedPrice))
            .filter((product) => {
            if (!normalizedQuery)
                return true;
            const searchable = [
                product.name,
                product.category,
                product.shortDescription,
                product.description,
                ...product.ingredients,
                ...product.festivalTags,
            ].join(' ').toLowerCase();
            return searchable.includes(normalizedQuery);
        })
            .sort((a, b) => {
            if (selectedSort === 'price-asc')
                return a.price - b.price;
            if (selectedSort === 'price-desc')
                return b.price - a.price;
            if (selectedSort === 'rating')
                return b.rating - a.rating;
            if (selectedSort === 'name')
                return a.name.localeCompare(b.name);
            return Number(b.popular) - Number(a.popular);
        });
    }, [query, selectedCategory, selectedPrice, selectedSort]);
    const hasActiveFilters = Boolean(query || selectedCategory !== 'all' || selectedPrice !== 'all' || selectedSort !== 'featured');
    const renderFilters = () => (<div className={styles.filterPanel}>
      <div className={styles.filterHeader}>
        <span>Refine sweets</span>
        <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
          <X size={18}/>
        </button>
      </div>

      <fieldset>
        <legend>Category</legend>
        <button type="button" className={selectedCategory === 'all' ? styles.activeFilter : ''} onClick={() => updateParam('category', 'all')}>
          All sweets
        </button>
        {categories.map((category) => (<button type="button" className={selectedCategory === category ? styles.activeFilter : ''} onClick={() => updateParam('category', category)} key={category}>
            {category}
          </button>))}
      </fieldset>

      <fieldset>
        <legend>Price</legend>
        {priceRanges.map((range) => (<button type="button" className={selectedPrice === range.value ? styles.activeFilter : ''} onClick={() => updateParam('price', range.value)} key={range.value}>
            {range.label}
          </button>))}
      </fieldset>

      {hasActiveFilters && (<button className={styles.clearButton} type="button" onClick={clearFilters}>
          Clear all filters
        </button>)}
    </div>);
    return (<div id="top">
      <Header cartCount={totalCount} onCartOpen={openCart}/>
      <main>
        <section className={styles.hero}>
          <Container className={styles.heroInner}>
            <SectionHeading eyebrow="Product catalogue" title="Choose sweets for every celebration." body="Search, filter and sort our handcrafted favourites. Your selection stays in the URL, ready to share or revisit."/>
            <form className={styles.searchBar} role="search" onSubmit={(event) => event.preventDefault()}>
              <Search size={19}/>
              <input type="search" value={query} onChange={(event) => updateParam('q', event.target.value)} placeholder="Search kaju, ladoo, Diwali..." aria-label="Search products"/>
            </form>
          </Container>
        </section>

        <section className={styles.catalogue}>
          <Container className={styles.catalogueGrid}>
            <aside className={styles.desktopFilters} aria-label="Product filters">
              {renderFilters()}
            </aside>

            <div className={styles.results}>
              <div className={styles.toolbar}>
                <div>
                  <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'sweet' : 'sweets'}</span>
                  <strong>{hasActiveFilters ? 'Matched to your selection' : 'Complete catalogue'}</strong>
                </div>

                <div className={styles.toolbarActions}>
                  <button type="button" className={styles.mobileFilterButton} onClick={() => setFiltersOpen(true)}>
                    <Filter size={17}/> Filters
                  </button>
                  <label className={styles.sortLabel}>
                    <SlidersHorizontal size={17}/>
                    <select value={selectedSort} onChange={(event) => updateParam('sort', event.target.value)} aria-label="Sort products">
                      {sortOptions.map((option) => (<option value={option.value} key={option.value}>{option.label}</option>))}
                    </select>
                  </label>
                </div>
              </div>

              {products.length === 0 ? (<div className={styles.emptyState}>
                  <h2>The shelves are being prepared.</h2>
                  <p>Products will appear here once the catalogue data is available.</p>
                </div>) : filteredProducts.length === 0 ? (<div className={styles.emptyState}>
                  <h2>No sweets found.</h2>
                  <p>Try a different search, remove a filter, or browse every handmade favourite.</p>
                  <button type="button" onClick={clearFilters}>Show all products</button>
                </div>) : (<div className={styles.productGrid}>
                  {filteredProducts.map((product) => (<ProductCard product={product} added={items.some((item) => item.productId === product.id)} onAdd={addItem} key={product.id}/>))}
                </div>)}
            </div>
          </Container>
        </section>

        <div className={`${styles.mobileFilterBackdrop} ${filtersOpen ? styles.mobileFilterBackdropOpen : ''}`} onClick={() => setFiltersOpen(false)} aria-hidden="true"/>
        <aside className={`${styles.mobileFilters} ${filtersOpen ? styles.mobileFiltersOpen : ''}`} aria-label="Mobile product filters">
          {renderFilters()}
        </aside>
      </main>
    </div>);
}
