import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api'; 
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
  const navigate = useNavigate();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const categoryParam = searchParams.get('category') || '';
  const fabricParam = searchParams.get('fabric') || '';
  const maxPriceParam = Number(searchParams.get('maxPrice')) || 25000;
  const sortParam = searchParams.get('sort') || 'default';
  const pageParam = Number(searchParams.get('page')) || 1;
  const searchQuery = searchParams.get('search') || '';

  const currentFilters = {
    category: categoryParam ? categoryParam.split(',') : [],
    fabric: fabricParam ? fabricParam.split(',') : [],
    maxPrice: maxPriceParam
  };

  const handleSmartBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: pageParam,
        limit: 8,
        sort: sortParam,
        maxPrice: maxPriceParam
      };
      
      if (searchQuery) params.append('search', searchQuery.trim());
      if (categoryParam) params.append('category', categoryParam);
      if (fabricParam) params.append('fabric', fabricParam);

      const res = await api.get('/products', { params: queryParams });
      
      setProducts(res.data.products || []);
      setPagination({
        total: res.data.totalProducts || 0,
        pages: res.data.totalPages || 1
      });
    } catch (err) {
      console.error("API Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pageParam, sortParam, categoryParam, fabricParam, maxPriceParam, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    const nextParams = new URLSearchParams(searchParams);
    
    if (newFilters.category.length > 0) nextParams.set('category', newFilters.category.join(','));
    else nextParams.delete('category');

    if (newFilters.fabric.length > 0) nextParams.set('fabric', newFilters.fabric.join(','));
    else nextParams.delete('fabric');

    nextParams.set('maxPrice', newFilters.maxPrice);
    nextParams.set('page', '1'); 
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
    setSearchParams({});
    setIsFilterOpen(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHero}>
        <div className={styles.heroInner}>
          <div className={styles.topNavigation}>
            <button className={styles.backBtn} onClick={handleSmartBack}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </button>
            <nav className={styles.breadcrumb}>
              <Link to="/">Home</Link> <span>›</span> <span>Shop</span>
            </nav>
          </div>

          <h1 className={styles.pageTitle}>
            {categoryParam && !categoryParam.includes(',') ? categoryParam : (searchQuery ? `Results for "${searchQuery}"` : 'Our Collection')}
          </h1>
          <p className={styles.pageCount}>{pagination.total} Sarees Available</p>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${isFilterOpen ? styles.active : ''}`}>
          <div className={styles.backdrop} onClick={() => setIsFilterOpen(false)} />
          <div className={styles.drawerContent}>
             <div className={styles.drawerHeader}>
                <h3>Filters</h3>
                <button className={styles.closeBtn} onClick={() => setIsFilterOpen(false)}>✕</button>
             </div>
             <FilterSidebar 
                filters={currentFilters} 
                onChange={handleFilterChange} 
                onClear={handleClearFilters} 
              />
              <button className={styles.applyBtn} onClick={() => setIsFilterOpen(false)}>
                See Results
              </button>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.mobileActions}>
                <button className={styles.filterToggle} onClick={() => setIsFilterOpen(true)}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h10M4 18h7"/></svg>
                   FILTER
                </button>
                <div className={styles.vDivider} />
                <div className={styles.mobileSort}>
                  <select 
                    value={sortParam} 
                    onChange={(e) => setSearchParams(prev => { prev.set('sort', e.target.value); return prev; })}
                    className={styles.sortSelect}
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
            </div>

            <div className={styles.searchWrapper}>
               <div className={styles.searchInner}>
                  <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search name or unique code (e.g. ST-101)..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchParams(prev => {
                        if (val) prev.set('search', val); else prev.delete('search');
                        prev.set('page', '1');
                        return prev;
                      }, { replace: true });
                    }}
                  />
               </div>
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
              <button onClick={handleClearFilters} className={styles.emptyBtn}>Clear All Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}