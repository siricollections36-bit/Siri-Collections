import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../../../utils/api'; 
import { formatPrice } from '../../../utils/formatters.js';
import Modal from '../../../components/Modal/Modal';
import styles from './AdminProducts.module.css';


/**
 * CUSTOM DELETE MODAL
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, productName }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete" size="sm">
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      <p style={{ marginBottom: '25px', color: '#444', fontSize: '1rem', lineHeight: '1.5' }}>
        Are you sure you want to delete <strong>{productName}</strong>?<br/>This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className={styles.cancelBtn} onClick={onClose} style={{ flex: 1 }}>Cancel</button>
        <button 
          className={styles.deleteBtn} 
          onClick={onConfirm} 
          style={{ flex: 2, background: '#c0392b', color: 'white', border: 'none' }}
        >
          Yes, Delete
        </button>
      </div>
    </div>
  </Modal>
);

/**
 * ADD/EDIT MODAL
 */
const AddEditModal = ({ isOpen, onClose, onSave, editingProduct, isSaving, categories = [] }) => {
  const fileInputRef = useRef(null);
  const emptyState = {
    name: '', sku: '', category: '', fabric: '', price: '', originalPrice: '', 
    description: '', images: [], isBestSeller: false, isNewArrival: true, stock: 0
  };

  const [formData, setFormData] = useState(emptyState);
  const [previews, setPreviews] = useState([]);

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
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingProduct ? 'Edit Saree Details' : 'Add New Saree'} size="lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className={styles.form}>
        <div className={styles.uploadSection}>
          <label className={styles.label}>Saree Photos (Cloudinary)</label>
          <div className={styles.imageGrid}>
            {previews.map((src, i) => (
              <div key={i} className={styles.previewCard}>
                <img src={src} alt="" />
                <button type="button" className={styles.removeImg} onClick={() => removeImage(i)}>×</button>
              </div>
            ))}
            <button type="button" className={styles.uploadTrigger} onClick={() => fileInputRef.current.click()}>
              <span className={styles.plusIcon}>+</span>
              <span>Add</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*" hidden />
          </div>
        </div>

        <div className={styles.checkboxRow}>
          <label className={styles.checkboxLabel}><input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} /> Best Seller</label>
          <label className={styles.checkboxLabel}><input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} /> New Arrival</label>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}><label className={styles.label}>Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Stock Count</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} onWheel={(e) => e.target.blur()} required />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}><label className={styles.label}>Product Code</label><input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="Optional" /></div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}><label className={styles.label}>Selling Price (₹)</label><input type="number" name="price" value={formData.price} onChange={handleChange} required /></div>
          <div className={styles.formGroup}><label className={styles.label}>MRP Price (₹)</label><input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} /></div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description (Optional)</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" className={styles.saveBtn} disabled={isSaving}>{isSaving ? 'Saving...' : 'Confirm & Save'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default function AdminProducts() {
  const [productsList, setProductsList] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // 4. CHANGED: Using api.get with relative paths
      const [prodRes, catRes] = await Promise.all([
        api.get('/products', { 
          params: { page: currentPage, limit: 6 } 
        }),
        api.get('/categories')
      ]);
      setProductsList(prodRes.data.products || []);
      setTotalPages(prodRes.data.totalPages || 1);
      setCategoryOptions(catRes.data);
    } catch (err) { 
      console.error(err); 
    } 
    finally { setIsLoading(false); }
  }, [currentPage]);

  useEffect(() => { fetchData(); }, [fetchData]);

  
  const handleSave = async (formData) => {
    setIsSaving(true);
    const data = new FormData();
    Object.keys(formData).forEach(k => { 
      if(k !== 'images') data.append(k, formData[k] || ''); 
    });
    formData.images.forEach(f => { 
      if(f instanceof File) data.append('images', f); 
    });

    try {
      // 5. CHANGED: Using api.put and api.post with relative paths
      if (editingProduct?._id) {
        await api.put(`/products/${editingProduct._id}`, data);
      } else {
        await api.post('/products/add', data);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) { 
      alert(err.message); 
    } 
    finally { setIsSaving(false); }
  };
const openDeleteConfirm = (product) => {
  setProductToDelete(product);
  setDeleteModalOpen(true);
};
 const handleConfirmDelete = async () => {
    try {
      // 6. CHANGED: Using api.delete with relative path
      await api.delete(`/products/${productToDelete._id}`);
      setDeleteModalOpen(false);
      fetchData();
    } catch (err) { 
      alert("Error deleting"); 
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Inventory Management</h1>
        <button className={styles.addBtn} onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>+ Add Product</button>
      </header>

      <div className={styles.tableWrapper}>
        {isLoading ? <div className={styles.loader}>Loading...</div> : (
          <>
            <table className={styles.table}>
              <thead>
                <tr><th>Thumbnail</th><th>Name</th><th>SKU</th><th>Price</th><th>Badges</th><th>Action</th></tr>
              </thead>
              <tbody>
                {productsList.map(p => (
                  <tr key={p._id}>
                    <td data-label="Thumbnail"><img src={p.images?.[0]} className={styles.tableImg} alt="" /></td>
                    <td data-label="Name"><strong>{p.name}</strong></td>
                    <td data-label="SKU">{p.sku || '---'}</td>
                    <td data-label="Price">{formatPrice(p.price)}</td>
                    <td data-label="Badges">
                      <div className={styles.badgeWrap}>
                        {String(p.isBestSeller) === 'true' && <span className={styles.miniBadge}>Best</span>}
                        {String(p.isNewArrival) === 'true' && <span className={styles.miniBadge}>New</span>}
                      </div>
                    </td>
                    <td data-label="Action">
                      <div className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => openDeleteConfirm(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* RESTORED PAGINATION BLOCK */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.pageBtn} 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  ←
                </button>
                <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                <button 
                  className={styles.pageBtn} 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AddEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editingProduct={editingProduct} isSaving={isSaving} categories={categoryOptions} />
      
      <DeleteConfirmModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
        productName={productToDelete?.name} 
      />
    </div>
  );
}