import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Spinner, Alert, Form, Modal, Pagination } from 'react-bootstrap';
import axios from 'axios';

const API_BASE = 'http://localhost:5678/api';
const PAGE_SIZE = 10;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentProduct, setCurrentProduct] = useState({ 
    name: '', 
    price: 0, 
    category: '', 
    brand: '', 
    countInStock: 0, 
    description: '',
    image: '',
    isFeatured: false
  });
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // New state for category and brand modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');

  // Fetch products, categories, brands
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Kiểm tra server
        const health = await axios.get(`${API_BASE}/health`);
        if (health.data.status !== 'ok') throw new Error('Server chưa sẵn sàng');
        
        // Lấy danh sách sản phẩm
        const res = await axios.get(`${API_BASE}/products`, {
          params: { q: search, category, brand, page, limit: PAGE_SIZE, sort: 'createdAt_desc' },
        });
        console.log('Products data:', res.data);
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        
        // Lấy danh mục
        const catRes = await axios.get(`${API_BASE}/categories`);
        console.log('Categories data:', catRes.data);
        setCategories(catRes.data.categories || []);
        
        // Lấy thương hiệu
        const brandRes = await axios.get(`${API_BASE}/brands`);
        console.log('Brands data:', brandRes.data);
        setBrands(brandRes.data.brands || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể kết nối server hoặc lấy dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [search, category, brand, page]);

  // Add a function to refresh data
  const refreshData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const res = await axios.get(`${API_BASE}/products`, {
        params: { page: 1, limit: PAGE_SIZE, sort: 'createdAt_desc' }
      });
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      
      // Fetch categories
      const catRes = await axios.get(`${API_BASE}/categories`);
      setCategories(catRes.data.categories || []);
      
      // Fetch brands
      const brandRes = await axios.get(`${API_BASE}/brands`);
      setBrands(brandRes.data.brands || []);
      
      setPage(1);
      setSearch('');
      setCategory('');
      setBrand('');
    } catch (err) {
      console.error('Error refreshing data:', err);
      alert('Không thể làm mới dữ liệu. Vui lòng tải lại trang.');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.url) {
        const imageUrl = response.data.url;
        setCurrentProduct(prev => ({
          ...prev,
          image: imageUrl
        }));
        setImagePreview(imageUrl);
        console.log('Uploaded image URL:', imageUrl); // Debug log
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Lỗi khi tải lên ảnh. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  // Modal handlers
  const openAddModal = () => {
    setModalType('add');
    setCurrentProduct({ 
      name: '', 
      price: 0, 
      category: '', 
      brand: '', 
      countInStock: 0, 
      description: '',
      image: '',
      isFeatured: false
    });
    setImagePreview('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setModalType('edit');
    setCurrentProduct({ ...product });
    setImagePreview(product.image || '');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);
  
  // Category and Brand modal handlers
  const openCategoryModal = () => {
    setNewCategory('');
    setShowCategoryModal(true);
  };
  
  const closeCategoryModal = () => {
    setShowCategoryModal(false);
  };
  
  const openBrandModal = () => {
    setNewBrand('');
    setShowBrandModal(true);
  };
  
  const closeBrandModal = () => {
    setShowBrandModal(false);
  };

  // Save product (add or edit)
  const handleSave = async () => {
    if (!currentProduct.name || !currentProduct.price || !currentProduct.category || !currentProduct.brand) {
      alert('Vui lòng điền đầy đủ thông tin sản phẩm');
      return;
    }

    setSaving(true);
    try {
      if (modalType === 'add') {
        const existingRes = await axios.get(`${API_BASE}/products`);
        const existingProducts = existingRes.data.products || [];
        
        const newProduct = {
          ...currentProduct,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          isFeatured: currentProduct.isFeatured || false
        };
        
        const updatedProducts = [...existingProducts, newProduct];
        
        await axios.post(`${API_BASE}/products`, { products: updatedProducts });
      } else {
        const existingRes = await axios.get(`${API_BASE}/products`);
        const existingProducts = existingRes.data.products || [];
        
        const productIndex = existingProducts.findIndex(p => p.id === currentProduct.id);
        
        if (productIndex !== -1) {
          existingProducts[productIndex] = {
            ...currentProduct,
            updatedAt: new Date().toISOString()
          };
          
          await axios.post(`${API_BASE}/products`, { products: existingProducts });
        } else {
          throw new Error('Không tìm thấy sản phẩm để cập nhật');
        }
      }
      
      setShowModal(false);
      refreshData();
      
      alert(modalType === 'add' ? 'Thêm sản phẩm thành công!' : 'Cập nhật sản phẩm thành công!');
    } catch (err) {
      console.error('Error saving product:', err);
      alert(err.response?.data?.error || err.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };
  
  // Save new category
  const handleSaveCategory = async () => {
    if (!newCategory.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }
    
    setSaving(true);
    try {
      // Get current categories
      const response = await axios.get(`${API_BASE}/categories`);
      const currentCategories = response.data.categories || [];
      
      // Check if category already exists
      if (currentCategories.includes(newCategory)) {
        alert('Danh mục này đã tồn tại');
        setSaving(false);
        return;
      }
      
      // Add new category
      const updatedCategories = [...currentCategories, newCategory];
      await axios.post(`${API_BASE}/categories`, { categories: updatedCategories });
      
      // Close modal
      setShowCategoryModal(false);
      
      // Refresh data
      await refreshData();
      
      alert('Đã thêm danh mục thành công');
    } catch (err) {
      console.error('Error saving category:', err);
      alert(err.response?.data?.error || 'Lỗi khi thêm danh mục');
    } finally {
      setSaving(false);
    }
  };
  
  // Save new brand
  const handleSaveBrand = async () => {
    if (!newBrand.trim()) {
      alert('Vui lòng nhập tên thương hiệu');
      return;
    }
    
    setSaving(true);
    try {
      // Get current brands
      const response = await axios.get(`${API_BASE}/brands`);
      const currentBrands = response.data.brands || [];
      
      // Check if brand already exists
      if (currentBrands.includes(newBrand)) {
        alert('Thương hiệu này đã tồn tại');
        setSaving(false);
        return;
      }
      
      // Add new brand
      const updatedBrands = [...currentBrands, newBrand];
      await axios.post(`${API_BASE}/brands`, { brands: updatedBrands });
      
      // Close modal
      setShowBrandModal(false);
      
      // Refresh data
      await refreshData();
      
      alert('Đã thêm thương hiệu thành công');
    } catch (err) {
      console.error('Error saving brand:', err);
      alert(err.response?.data?.error || 'Lỗi khi thêm thương hiệu');
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    
    setLoading(true);
    try {
      // Get existing products
      const existingRes = await axios.get(`${API_BASE}/products`);
      const existingProducts = existingRes.data.products || [];
      
      // Filter out the product to delete
      const updatedProducts = existingProducts.filter(p => p.id !== id);
      
      // Send the updated array to the API
      await axios.post(`${API_BASE}/products`, { products: updatedProducts });
      
      // Refresh data
      await refreshData();
      
      alert('Xóa sản phẩm thành công!');
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.error || 'Lỗi khi xóa sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Toggle featured product
  const toggleFeaturedProduct = async (productId) => {
    try {
      const existingRes = await axios.get(`${API_BASE}/products`);
      const existingProducts = existingRes.data.products || [];
      
      const productIndex = existingProducts.findIndex(p => p.id === productId);
      
      if (productIndex !== -1) {
        // Đảo ngược trạng thái nổi bật
        existingProducts[productIndex].isFeatured = !existingProducts[productIndex].isFeatured;
        
        await axios.post(`${API_BASE}/products`, { products: existingProducts });
        
        // Làm mới danh sách sản phẩm
        refreshData();
      }
    } catch (err) {
      console.error('Lỗi khi thay đổi trạng thái nổi bật:', err);
      alert('Không thể thay đổi trạng thái sản phẩm. Vui lòng thử lại.');
    }
  };

  // Pagination
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
        {i}
      </Pagination.Item>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col><h3>Quản lý sản phẩm</h3></Col>
        <Col xs="auto">
          <Button variant="primary" onClick={openAddModal} className="me-2">Thêm sản phẩm</Button>
          <Button variant="success" onClick={openCategoryModal} className="me-2">Thêm danh mục</Button>
          <Button variant="info" onClick={openBrandModal}>Thêm thương hiệu</Button>
        </Col>
      </Row>
      <Row className="mb-3 g-2">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={brand} onChange={e => { setBrand(e.target.value); setPage(1); }}>
            <option value="">Tất cả thương hiệu</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </Form.Select>
        </Col>
      </Row>
      
      {/* Rest of the component (table, pagination, etc.) */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th>Thương hiệu</th>
                <th>Tồn kho</th>
                <th>Ngày tạo</th>
                <th>Nổi bật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={8} className="text-center">Không có sản phẩm nào</td></tr>
              ) : products.map((product, idx) => (
                <tr key={product.id}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{product.name}</td>
                  <td>{product.price.toLocaleString('vi-VN')}₫</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>{product.countInStock}</td>
                  <td>{product.createdAt ? new Date(product.createdAt).toLocaleString() : ''}</td>
                  <td>
                    <Button 
                      variant={product.isFeatured ? "success" : "secondary"}
                      onClick={() => toggleFeaturedProduct(product.id)}
                    >
                      {product.isFeatured ? "Đang nổi bật" : "Đánh dấu nổi bật"}
                    </Button>
                  </td>
                  <td>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(product)}>Sửa</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>{paginationItems}</Pagination>
        </>
      )}
      
      {/* Modal thêm/sửa sản phẩm */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên sản phẩm</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentProduct.name}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <div className="d-flex">
                    <Form.Select
                      value={currentProduct.category}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Form.Select>
                    <Button variant="outline-secondary" className="ms-2" onClick={openCategoryModal}>
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thương hiệu</Form.Label>
                  <div className="d-flex">
                    <Form.Select
                      value={currentProduct.brand}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, brand: e.target.value })}
                      required
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map((br) => (
                        <option key={br} value={br}>
                          {br}
                        </option>
                      ))}
                    </Form.Select>
                    <Button variant="outline-secondary" className="ms-2" onClick={openBrandModal}>
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng trong kho</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentProduct.countInStock}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, countInStock: Number(e.target.value) })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ảnh sản phẩm</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <div className="mt-2"><Spinner animation="border" size="sm" /> Đang tải lên...</div>}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentProduct.description}
                onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                label="Sản phẩm nổi bật"
                checked={currentProduct.isFeatured || false}
                onChange={(e) => setCurrentProduct(prev => ({
                  ...prev, 
                  isFeatured: e.target.checked
                }))}
              />
            </Form.Group>

            {imagePreview && (
              <div className="mb-3">
                <Form.Label>Xem trước ảnh</Form.Label>
                <div>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }} 
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.src = '/images/placeholder.png';
                    }}
                  />
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                {' '}Đang lưu...
              </>
            ) : (
              'Lưu'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal thêm danh mục */}
      <Modal show={showCategoryModal} onHide={closeCategoryModal}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm danh mục mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group className="mb-3">
              <Form.Label>Tên danh mục</Form.Label>
              <Form.Control
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Nhập tên danh mục mới"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeCategoryModal}>Hủy</Button>
          <Button variant="success" onClick={handleSaveCategory} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal thêm thương hiệu */}
      <Modal show={showBrandModal} onHide={closeBrandModal}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm thương hiệu mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Group className="mb-3">
              <Form.Label>Tên thương hiệu</Form.Label>
              <Form.Control
                type="text"
                value={newBrand}
                onChange={e => setNewBrand(e.target.value)}
                placeholder="Nhập tên thương hiệu mới"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeBrandModal}>Hủy</Button>
          <Button variant="info" onClick={handleSaveBrand} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductManagement; 