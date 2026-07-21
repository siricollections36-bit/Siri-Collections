import { useState, useEffect } from 'react';
import api from '../../utils/api'; 
import styles from './FilterSidebar.module.css';

export default function FilterSidebar({ filters, onChange, onClear }) {
  const [liveCategories, setLiveCategories] = useState([]);
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice);

  // Sync local slider if external filters change (like "Clear All")
  useEffect(() => {
    setLocalMaxPrice(filters.maxPrice);
  }, [filters.maxPrice]);

   useEffect(() => {
    // 3. CHANGED: Using api.get and relative path
    api.get('/categories')
      .then(res => setLiveCategories(res.data))
      .catch(err => console.error("Filter categories load failed", err));
  }, []);

  const handleCheckboxChange = (key, value) => {
    const currentList = [...filters[key]];
    const index = currentList.indexOf(value);
    if (index > -1) currentList.splice(index, 1);
    else currentList.push(value);

    onChange({ ...filters, [key]: currentList });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filters</h3>
        <button className={styles.clearBtn} onClick={onClear}>Clear All</button>
      </div>

      {/* PRICE RANGE - SMOOTH SLIDER FIX */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Price Range</h4>
        <input
          type="range"
          min="0"
          max="25000"
          step="500"
          value={localMaxPrice}
          // Immediate visual update
          onChange={(e) => setLocalMaxPrice(Number(e.target.value))} 
          // Only trigger API fetch when user releases the slider (Scalability Fix)
          onMouseUp={() => onChange({ ...filters, maxPrice: localMaxPrice })}
          onTouchEnd={() => onChange({ ...filters, maxPrice: localMaxPrice })}
          className={styles.range}
        />
        <div className={styles.priceLabels}>
          <span>₹0</span>
          <span>Up to ₹{localMaxPrice.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Category</h4>
        {liveCategories.map((cat) => (
          <label key={cat._id} className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={filters.category.includes(cat.name)}
              onChange={() => handleCheckboxChange('category', cat.name)}
              className={styles.checkbox}
            />
            <span>{cat.name}</span>
          </label>
        ))}
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Fabric</h4>
        {['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Net'].map((f) => (
          <label key={f} className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={filters.fabric.includes(f)}
              onChange={() => handleCheckboxChange('fabric', f)}
              className={styles.checkbox}
            />
            <span>{f}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}