import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatPrice } from '../../../utils/formatters.js';
import Modal from '../../../components/Modal/Modal';
import styles from './AdminProducts.module.css';

const API_URL = 'http://localhost:5000/api/products';
const CAT_API_URL = 'http://localhost:5000/api/categories';

/**
 * MODAL COMPONENT - FOR ADDING & EDITING
 */
const AddEditModal = ({ isOpen, onClose, onSave, editingProduct, isSaving, categories = [] }) => {
  const fileInputRef = useRef(null);

  const emptyState = {
    name: '',
    sku: '',
    category: '',
    fabric: '',
    price: '',
    originalPrice: '',
    description: '', // Optional Description
    stock: 0,        // Internal Stock Count
    images: [],
    isBestSeller: false,
    isNewArrival: true 
  };

  const [formData, setFormData] = useState(emptyState);
  const [previews, setPreviews] = useState([]);

  // Populate form for Editing
  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({ 
          ...editingProduct, 
          isBestSeller: String(editingProduct.isBestSeller) === 'true',
          isNewArrival: String(editingProduct.isNewArrival) === 'true',
          description: editingProduct.description || '',
          stock: editingProduct.stock || 0,
          images: editingProduct.images || []
        });
        setPreviews(editingProduct.images || []);
      } else {
        setFormData(emptyState);
        setPreviews([]);
      }
    }
  }, [isOpen, editingProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingProduct ? 'Edit Saree Details' : 'Add New Saree'} size="lg">
      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* PHOTO UPLOAD */}
        <div className={styles.uploadSection}>
          <label className={styles.label}>Saree Photos (Cloudinary)</label>
          <div className={styles.imageGrid}>
            {previews.map((src, i) => (
              <div key={i} className={styles.previewCard}>
                <img src={src} alt="" />
                <button type="button" className={styles.removeImg} onClick={() => removeImage(i)}>×</button>
              </div>
            ))}
            <button type="button" className={styles.uploadTrigger} onClick={() => fileInputRef.current.click()} disabled={isSaving}>+</button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*" hidden />
          </div>
        </div>

        {/* HOME PAGE FLAGS */}
        <div className={styles.checkboxRow}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} />
            Best Seller
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} />
            New Arrival
          </label>
        </div>

        {/* ROW 1: NAME & STOCK */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Silk Banarasi" />
          </div>
          <div className={styles.formGroup}>
  <label className={styles.label}>Internal Stock Count</label>
  <input 
    type="number" 
    name="stock" 
    value={formData.stock} 
    onChange={handleChange} 
    // THIS PREVENTS AUTOMATIC SCROLL CHANGES
    onWheel={(e) => e.target.blur()} 
    placeholder="e.g. 15" 
    required 
  />
</div>
        </div>

        {/* ROW 2: CATEGORY & SKU */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Product Code (Optional)</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="e.g. ST-101" />
          </div>
        </div>

        {/* ROW 3: PRICE & FABRIC */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Selling Price (₹)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Original MRP (₹)</label>
            <input 
              type="number" 
              name="originalPrice" 
              value={formData.originalPrice} 
              onChange={handleChange} 
              placeholder="Strikethrough price"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Fabric Type</label>
            <input type="text" name="fabric" value={formData.fabric} onChange={handleChange} placeholder="e.g. Kanchipuram Silk" />
          </div>
        </div>

        {/* DESCRIPTION (OPTIONAL) */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Detailed Description (Optional)</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows="4" 
            placeholder="Describe the weave, borders, and blouse details..." 
          />
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="submit" className={styles.saveBtn} disabled={isSaving}>
            {isSaving ? 'Saving to Cloud...' : 'Confirm & Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * MAIN COMPONENT
 */
export default function AdminProducts() {
  const [productsList, setProductsList] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API_URL}?page=${currentPage}&limit=12`),
        axios.get(CAT_API_URL)
      ]);

      const dataArray = prodRes.data.products || prodRes.data;
      setProductsList(Array.isArray(dataArray) ? dataArray : []);
      setTotalPages(prodRes.data.totalPages || 1);
      setCategoryOptions(catRes.data);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    if (!editingProduct && (!formData.images || formData.images.length === 0)) {
      alert("Please upload at least one image.");
      return;
    }

    setIsSaving(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'images') data.append(key, formData[key] || '');
    });
    formData.images.forEach(file => { if (file instanceof File) data.append('images', file); });

    try {
      if (editingProduct?._id) {
        await axios.put(`${API_URL}/${editingProduct._id}`, data);
      } else {
        await axios.post(`${API_URL}/add`, data);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Save Error: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this product?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchData();
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Inventory Management</h1>
        <button className={styles.addBtn} onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
          + Add New Saree
        </button>
      </header>

      <div className={styles.tableWrapper}>
        {isLoading ? <div className={styles.loader}>Syncing with MongoDB Atlas...</div> : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Badges</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {productsList.length > 0 ? (
                  productsList.map(p => (
                    <tr key={p._id}>
                      <td>
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} className={styles.tableImg} alt="" />
                        ) : <div className={styles.noImg}>No Image</div>}
                      </td>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.sku || '---'}</td>
                      <td>{formatPrice(p.price)}</td>
                      <td>
                        <div className={styles.badgeWrap}>
                          {String(p.isBestSeller) === 'true' && <span className={styles.miniBadge}>Best</span>}
                          {String(p.isNewArrival) === 'true' && <span className={styles.miniBadge}>New</span>}
                        </div>
                      </td>
                      <td className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(p._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{textAlign:'center', padding:'40px'}}>No products found. Add some above!</td></tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>←</button>
                <span>{currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>→</button>
              </div>
            )}
          </>
        )}
      </div>

      <AddEditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        editingProduct={editingProduct} 
        isSaving={isSaving} 
        categories={categoryOptions} 
      />
    </div>
  );
}