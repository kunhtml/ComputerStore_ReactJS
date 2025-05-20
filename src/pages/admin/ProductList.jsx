import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  Modal,
  Form,
  ButtonGroup,
  Dropdown,
  Tabs,
  Tab,
  InputGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { getCategories as fetchCategories, getBrands as fetchBrands, getProducts as fetchProducts } from '../../utils/databaseUtils';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTags,
  FaTag,
  FaSave,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import Paginate from "../../components/Paginate";
import axios from "../../services/axiosConfig";
import { useAppContext } from "../../context/AppContext";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // State cho modal và tabs
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Use utility functions for database operations

  // Fetch categories and brands from database.json in src/data directory
  useEffect(() => {
    const fetchCategoriesAndBrands = async () => {
      try {
        // Get categories using the utility function
        const uniqueCategories = await fetchCategories();
        console.log('Categories loaded:', uniqueCategories);
        setCategories(uniqueCategories);

        // Get brands using the utility function
        const uniqueBrands = await fetchBrands();
        console.log('Brands loaded:', uniqueBrands);
        setBrands(uniqueBrands);
      } catch (error) {
        console.error('Error fetching categories and brands:', error);
        toast.error('Failed to load categories and brands');
        
        // Set default values if loading fails
        setCategories(['Gaming PC', 'Office PC', 'Workstation']);
        setBrands(['GamingTech', 'OfficePro', 'CreatorPro']);
      }
    };

    fetchCategoriesAndBrands();
  }, []);
  const [activeTab, setActiveTab] = useState("products");

  // State cho việc chỉnh sửa
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(-1);
  const [editingBrandIndex, setEditingBrandIndex] = useState(-1);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [editedBrandName, setEditedBrandName] = useState("");

  const {
    userInfo,
    products: contextProducts,
    fetchProducts,
    deleteProduct,
    productsLoading,
    productUpdated,
  } = useAppContext();
  const navigate = useNavigate();
  const { pageNumber = 1 } = useParams();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        // Lấy danh sách sản phẩm từ context
        await fetchProducts();

        // Phân trang đơn giản (trong thực tế nên xử lý phía server)
        const itemsPerPage = 10;
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const paginatedProducts = contextProducts.slice(
          startIndex,
          startIndex + itemsPerPage
        );

        setProducts(paginatedProducts);
        setPage(Number(pageNumber));
        setPages(Math.ceil(contextProducts.length / itemsPerPage));
        setError("");
      } catch (err) {
        setError("Không thể tải danh sách sản phẩm");
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    // Kiểm tra đăng nhập và quyền admin
    if (!userInfo) {
      navigate("/login");
    } else if (!userInfo.isAdmin) {
      navigate("/");
    } else {
      loadProducts();
    }
  }, [
    pageNumber,
    navigate,
    userInfo,
    fetchProducts,
    contextProducts,
    productUpdated,
  ]);

  const deleteHandler = async (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        setDeleteLoading(true);

        // Xóa sản phẩm sử dụng hàm từ context
        await deleteProduct(productId);

        toast.success("Đã xóa sản phẩm thành công");
      } catch (err) {
        toast.error("Có lỗi xảy ra khi xóa sản phẩm");
        console.error("Lỗi khi xóa sản phẩm:", err);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Lấy danh sách categories và brands từ database
  useEffect(() => {
    const loadCategoriesAndBrands = () => {
      try {
        // Lấy danh sách categories từ sản phẩm
        const uniqueCategories = [
          ...new Set(contextProducts.map((product) => product.category)),
        ];
        setCategories(uniqueCategories);

        // Lấy danh sách brands từ sản phẩm
        const uniqueBrands = [
          ...new Set(contextProducts.map((product) => product.brand)),
        ];
        setBrands(uniqueBrands);
      } catch (err) {
        console.error("Lỗi khi tải danh mục và thương hiệu:", err);
      }
    };

    if (contextProducts && contextProducts.length > 0) {
      loadCategoriesAndBrands();
    }
  }, [contextProducts]);

  const createProductHandler = () => {
    if (window.confirm("Bạn có chắc chắn muốn tạo sản phẩm mới?")) {
      try {
        // Chuyển hướng đến trang tạo sản phẩm mới
        navigate(`/admin/product/new/edit`);
      } catch (error) {
        toast.error(error.message || "Lỗi khi tạo sản phẩm mới");
      }
    }
  };

  // Mở modal tạo category
  const openCategoryModal = () => {
    setShowCategoryModal(true);
  };

  // Mở modal tạo brand
  const openBrandModal = () => {
    setShowBrandModal(true);
  };

  // Xử lý thêm mới category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      
      // Check if category already exists
      if (data.products.some(p => p.category === newCategory)) {
        toast.error("Category already exists");
        return;
      }

      // Update database
      const updatedProducts = [...data.products];
      const updatedCategories = [...new Set([...categories, newCategory])];
      
      await fetch('http://localhost:5678/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: updatedProducts,
          categories: updatedCategories
        })
      });

      setCategories(updatedCategories);
      setNewCategory("");
      setShowCategoryModal(false);
      toast.success("Category added successfully");
    } catch (err) {
      console.error("Error adding category:", err);
      toast.error("Failed to add category");
    }
  };

  // Start edit brand function
  const startEditBrand = (index, brand) => {
    setEditingBrandIndex(index);
    setEditedBrandName(brand);
  };
  
  // Save edited brand function
  const saveEditedBrand = async (index) => {
    if (!editedBrandName.trim()) {
      toast.error("Brand name is required");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      
      // Check if brand already exists
      if (brands.some((b, i) => i !== index && b === editedBrandName)) {
        toast.error("Brand already exists");
        return;
      }
      
      // Update products with the new brand name
      const oldBrandName = brands[index];
      const updatedProducts = data.products.map(p => {
        if (p.brand === oldBrandName) {
          return { ...p, brand: editedBrandName };
        }
        return p;
      });
      
      // Update brands list
      const updatedBrands = [...brands];
      updatedBrands[index] = editedBrandName;
      
      // Save to database
      await fetch('http://localhost:5678/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          products: updatedProducts
        })
      });
      
      setBrands(updatedBrands);
      setEditingBrandIndex(-1);
      toast.success("Brand updated successfully");
    } catch (err) {
      console.error("Error updating brand:", err);
      toast.error("Failed to update brand");
    }
  };
  
  // Delete brand function
  const deleteBrand = async (index) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) {
      return;
    }
    
    try {
      const brandToDelete = brands[index];
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      
      // Check if any product uses this brand
      if (data.products.some(p => p.brand === brandToDelete)) {
        toast.error("Cannot delete brand that is used by products");
        return;
      }
      
      // Update brands list
      const updatedBrands = brands.filter((_, i) => i !== index);
      
      // Save to database
      await fetch('http://localhost:5678/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          brands: updatedBrands
        })
      });
      
      setBrands(updatedBrands);
      toast.success("Brand deleted successfully");
    } catch (err) {
      console.error("Error deleting brand:", err);
      toast.error("Failed to delete brand");
    }
  };
  
  // Start edit category function
  const startEditCategory = (index, category) => {
    setEditingCategoryIndex(index);
    setEditedCategoryName(category);
  };
  
  // Save edited category function
  const saveEditedCategory = async (index) => {
    if (!editedCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      
      // Check if category already exists
      if (categories.some((c, i) => i !== index && c === editedCategoryName)) {
        toast.error("Category already exists");
        return;
      }
      
      // Update products with the new category name
      const oldCategoryName = categories[index];
      const updatedProducts = data.products.map(p => {
        if (p.category === oldCategoryName) {
          return { ...p, category: editedCategoryName };
        }
        return p;
      });
      
      // Update categories list
      const updatedCategories = [...categories];
      updatedCategories[index] = editedCategoryName;
      
      // Save to database
      await fetch('http://localhost:5678/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          products: updatedProducts
        })
      });
      
      setCategories(updatedCategories);
      setEditingCategoryIndex(-1);
      toast.success("Category updated successfully");
    } catch (err) {
      console.error("Error updating category:", err);
      toast.error("Failed to update category");
    }
  };
  
  // Delete category function
  const deleteCategory = async (index) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    
    try {
      const categoryToDelete = categories[index];
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      
      // Check if any product uses this category
      if (data.products.some(p => p.category === categoryToDelete)) {
        toast.error("Cannot delete category that is used by products");
        return;
      }
      
      // Update categories list
      const updatedCategories = categories.filter((_, i) => i !== index);
      
      // Save to database
      await fetch('http://localhost:5678/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          categories: updatedCategories
        })
      });
      
      setCategories(updatedCategories);
      toast.success("Category deleted successfully");
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("Failed to delete category");
    }
  };
  
  // Xử lý thêm mới brand
  const handleAddBrand = async () => {
    if (!newBrand.trim()) {
      toast.error("Brand name is required");
      return;
    }

    try {
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      
      // Check if brand already exists
      if (data.products.some(p => p.brand === newBrand)) {
        toast.error("Brand already exists");
        return;
      }

      // Update database
      const updatedProducts = [...data.products];
      const updatedBrands = [...new Set([...brands, newBrand])];
      
      await fetch('http://localhost:5678/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: updatedProducts,
          brands: updatedBrands
        })
      });

      setBrands(updatedBrands);
      setNewBrand("");
      setShowBrandModal(false);
      toast.success("Brand added successfully");
    } catch (err) {
      console.error("Error adding brand:", err);
      toast.error("Failed to add brand");
    }
  };

  // Xử lý chỉnh sửa category
  const handleEditCategory = (index) => {
    setEditingCategoryIndex(index);
    setEditedCategoryName(categories[index]);
    setShowCategoryModal(true);
  };

  // Xử lý lưu category đã chỉnh sửa
  const handleSaveEditedCategory = async () => {
    if (!editedCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      
      // Update products that use this category
      const updatedProducts = data.products.map(p => {
        if (p.category === categories[editingCategoryIndex]) {
          return { ...p, category: editedCategoryName };
        }
        return p;
      });
      
      // Update categories
      const updatedCategories = [...categories];
      updatedCategories[editingCategoryIndex] = editedCategoryName;
      
      await fetch('http://localhost:5678/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: updatedProducts,
          categories: [...new Set(updatedCategories)]
        })
      });

      setCategories(updatedCategories);
      setEditingCategoryIndex(-1);
      setEditedCategoryName("");
      setShowCategoryModal(false);
      toast.success("Category updated successfully");
    } catch (err) {
      console.error("Error updating category:", err);
      toast.error("Failed to update category");
    }
  };

  // Xử lý xóa category
  const handleDeleteCategory = async (index) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      
      // Update products that use this category
      const updatedProducts = data.products.map(p => {
        if (p.category === categories[index]) {
          return { ...p, category: "Uncategorized" };
        }
        return p;
      });
      
      // Update categories
      const updatedCategories = categories.filter((_, i) => i !== index);
      
      await fetch('http://localhost:5678/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: updatedProducts,
          categories: updatedCategories
        })
      });

      setCategories(updatedCategories);
      toast.success("Category deleted successfully");
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("Failed to delete category");
    }
  };

  // Xử lý chỉnh sửa brand
  const handleEditBrand = (index) => {
    setEditingBrandIndex(index);
    setEditedBrandName(brands[index]);
    setShowBrandModal(true);
  };

  // Xử lý lưu brand đã chỉnh sửa
  const handleSaveEditedBrand = async () => {
    if (!editedBrandName.trim()) {
      toast.error("Brand name is required");
      return;
    }

    try {
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      
      // Update products that use this brand
      const updatedProducts = data.products.map(p => {
        if (p.brand === brands[editingBrandIndex]) {
          return { ...p, brand: editedBrandName };
        }
        return p;
      });
      
      // Update brands
      const updatedBrands = [...brands];
      updatedBrands[editingBrandIndex] = editedBrandName;
      
      await fetch('http://localhost:5678/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: updatedProducts,
          brands: [...new Set(updatedBrands)]
        })
      });

      setBrands(updatedBrands);
      setEditingBrandIndex(-1);
      setEditedBrandName("");
      setShowBrandModal(false);
      toast.success("Brand updated successfully");
    } catch (err) {
      console.error("Error updating brand:", err);
      toast.error("Failed to update brand");
    }
  };

  // Xử lý xóa brand
  const handleDeleteBrand = async (index) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      
      // Update products that use this brand
      const updatedProducts = data.products.map(p => {
        if (p.brand === brands[index]) {
          return { ...p, brand: "Unknown" };
        }
        return p;
      });
      
      // Update brands
      const updatedBrands = brands.filter((_, i) => i !== index);
      
      await fetch('http://localhost:5678/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: updatedProducts,
          brands: updatedBrands
        })
      });

      setBrands(updatedBrands);
      toast.success("Brand deleted successfully");
    } catch (err) {
      console.error("Error deleting brand:", err);
      toast.error("Failed to delete brand");
    }
  };

  return (
    <Container>
      <Row className="align-items-center">
        <Col>
          <h1>Products</h1>
        </Col>
      </Row>

      {/* Modal tạo Category */}
      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category name"
                value={editingCategoryIndex >= 0 ? editedCategoryName : newCategory}
                onChange={(e) => editingCategoryIndex >= 0 ? setEditedCategoryName(e.target.value) : setNewCategory(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={editingCategoryIndex >= 0 ? handleSaveEditedCategory : handleAddCategory}>
            {editingCategoryIndex >= 0 ? "Save Changes" : "Add Category"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal tạo Brand */}
      <Modal show={showBrandModal} onHide={() => setShowBrandModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Brand</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Brand Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter brand name"
                value={editingBrandIndex >= 0 ? editedBrandName : newBrand}
                onChange={(e) => editingBrandIndex >= 0 ? setEditedBrandName(e.target.value) : setNewBrand(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBrandModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={editingBrandIndex >= 0 ? handleSaveEditedBrand : handleAddBrand}>
            {editingBrandIndex >= 0 ? "Save Changes" : "Add Brand"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Tabs
        id="admin-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="products" title="Products">
          <div className="d-flex justify-content-between mb-3">
            <h2>Products</h2>
            <Button variant="primary" onClick={() => navigate("/admin/product/new")}>
              <FaPlus /> Add Product
            </Button>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <Table striped bordered hover responsive className="table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>PRICE</th>
                    <th>CATEGORY</th>
                    <th>BRAND</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>${product.price}</td>
                      <td>{product.category}</td>
                      <td>{product.brand}</td>
                      <td>
                        <Link to={`/admin/product/${product.id}/edit`}>
                          <Button variant="light" className="btn-sm">
                            <FaEdit />
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          className="btn-sm ms-2"
                          onClick={() => deleteHandler(product.id)}
                          disabled={deleteLoading}
                        >
                          <FaTrash className={deleteLoading ? "fa-spin" : ""} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Paginate pages={pages} page={page} isAdmin={true} />
            </>
          )}
        </Tab>

        <Tab eventKey="categories" title="Categories">
          <div className="mb-3">
            <Button
              variant="primary"
              onClick={() => setShowCategoryModal(true)}
              className="d-flex align-items-center"
              style={{ backgroundColor: "#007bff", borderColor: "#007bff" }}
            >
              <FaPlus className="me-1" /> Add New Category
            </Button>
          </div>

          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>CATEGORY NAME</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {editingCategoryIndex === index ? (
                      <InputGroup>
                        <Form.Control
                          type="text"
                          value={editedCategoryName}
                          onChange={(e) =>
                            setEditedCategoryName(e.target.value)
                          }
                        />
                        <Button
                          variant="success"
                          onClick={() => saveEditedCategory(index)}
                        >
                          <FaCheck />
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setEditingCategoryIndex(-1)}
                        >
                          <FaTimes />
                        </Button>
                      </InputGroup>
                    ) : (
                      category
                    )}
                  </td>
                  <td>
                    {editingCategoryIndex !== index && (
                      <>
                        <Button
                          variant="light"
                          className="btn-sm"
                          onClick={() => startEditCategory(index, category)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          className="btn-sm ms-2"
                          onClick={() => deleteCategory(index)}
                        >
                          <FaTrash />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="brands" title="Brands">
          <div className="mb-3">
            <Button
              variant="primary"
              onClick={() => setShowBrandModal(true)}
              className="d-flex align-items-center"
              style={{ backgroundColor: "#007bff", borderColor: "#007bff" }}
            >
              <FaPlus className="me-1" /> Add New Brand
            </Button>
          </div>

          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>BRAND NAME</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {editingBrandIndex === index ? (
                      <InputGroup>
                        <Form.Control
                          type="text"
                          value={editedBrandName}
                          onChange={(e) => setEditedBrandName(e.target.value)}
                        />
                        <Button
                          variant="success"
                          onClick={() => saveEditedBrand(index)}
                        >
                          <FaCheck />
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setEditingBrandIndex(-1)}
                        >
                          <FaTimes />
                        </Button>
                      </InputGroup>
                    ) : (
                      brand
                    )}
                  </td>
                  <td>
                    {editingBrandIndex !== index && (
                      <>
                        <Button
                          variant="light"
                          className="btn-sm"
                          onClick={() => startEditBrand(index, brand)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          className="btn-sm ms-2"
                          onClick={() => deleteBrand(index)}
                        >
                          <FaTrash />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ProductList;
