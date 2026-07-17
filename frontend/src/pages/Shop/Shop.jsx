import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import styles from './Shop.module.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // 1. EXTRACT ALL FILTERS DIRECTLY FROM URL (Source of Truth)
  const categoryParam = searchParams.get('category') || '';
  const fabricParam = searchParams.get('fabric') || '';
  const maxPriceParam = Number(searchParams.get('maxPrice')) || 25000;
  const sortParam = searchParams.get('sort') || 'default';
  const pageParam = Number(searchParams.get('page')) || 1;
  const searchQuery = searchParams.get('search') || '';

  // Construct a filters object to pass to the Sidebar UI
  const currentFilters = {
    category: categoryParam ? categoryParam.split(',') : [],
    fabric: fabricParam ? fabricParam.split(',') : [],
    maxPrice: maxPriceParam
  };

  /**
   * 2. DATA FETCHING LOGIC
   * This is now fully scalable. It only re-runs when the URL parameters change.
   */
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      params.append('page', pageParam);
      params.append('limit', 12);
      params.append('sort', sortParam);
      params.append('maxPrice', maxPriceParam);
      
      if (searchQuery) params.append('search', searchQuery);
      if (categoryParam) params.append('category', categoryParam);
      if (fabricParam) params.append('fabric', fabricParam);

      const res = await axios.get(`http://localhost:5000/api/products?${params.toString()}`);
      
      setProducts(res.data.products || []);
      setPagination({
        total: res.data.totalProducts || 0,
        pages: res.data.totalPages || 1
      });
    } catch (err) {
      console.error("Fetch Error: Backend might be down.");
    } finally {
      setIsLoading(false);
    }
  }, [pageParam, sortParam, categoryParam, fabricParam, maxPriceParam, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * 3. HANDLERS
   * These update the URL, which automatically triggers a re-render and a re-fetch.
   */
  const handleFilterChange = (newFilters) => {
    const nextParams = new URLSearchParams(searchParams);
    
    if (newFilters.category.length > 0) nextParams.set('category', newFilters.category.join(','));
    else nextParams.delete('category');

    if (newFilters.fabric.length > 0) nextParams.set('fabric', newFilters.fabric.join(','));
    else nextParams.delete('fabric');

    nextParams.set('maxPrice', newFilters.maxPrice);
    nextParams.set('page', '1'); // Reset to first page when filtering
    setSearchParams(nextParams);
  };

  const handlePageChange = (pageNumber) => {
    setSearchParams(prev => {
      prev.set('page', pageNumber);
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchParams({}); // Wipes everything from the URL
  };

  return (
    <motion.div className={styles.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className={styles.pageHero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link> <span>›</span> <span>Shop</span>
          </nav>
          <h1 className={styles.pageTitle}>
            {categoryParam && !categoryParam.includes(',') ? categoryParam : (searchQuery ? `Results for "${searchQuery}"` : 'Our Collection')}
          </h1>
          <p className={styles.pageCount}>{pagination.total} Sarees Available</p>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <FilterSidebar 
            filters={currentFilters} 
            onChange={handleFilterChange} 
            onClear={handleClearFilters} 
          />
        </aside>

        <div className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchContainer}>
               <div className={styles.searchWrapper}>
                  <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search sarees..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchParams(prev => {
                        if (val) prev.set('search', val); else prev.delete('search');
                        prev.set('page', '1');
                        return prev;
                      }, { replace: true }); // replace: true prevents flooding browser history
                    }}
                  />
               </div>
            </div>

            <div className={styles.sortWrap}>
              <label className={styles.sortLabel}>Sort By:</label>
              <select 
                value={sortParam} 
                onChange={(e) => setSearchParams(prev => { prev.set('sort', e.target.value); return prev; })} 
                className={styles.sortSelect}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loadingArea}><Loader /></div>
          ) : products.length > 0 ? (
            <>
              <div className={styles.grid}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className={styles.pagination}>
                  <button className={styles.pageBtn} disabled={pageParam === 1} onClick={() => handlePageChange(pageParam - 1)}>PREV</button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`${styles.pageNumber} ${pageParam === i + 1 ? styles.activePage : ''}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button className={styles.pageBtn} disabled={pageParam === pagination.pages} onClick={() => handlePageChange(pageParam + 1)}>NEXT</button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button onClick={handleClearFilters} className={styles.emptyBtn}>Clear All Filters</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}