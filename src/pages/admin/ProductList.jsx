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
import databaseData from "../../data/database.json";

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

  // Xử lý tạo category mới
  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    // Kiểm tra danh mục đã tồn tại chưa
    if (categories.includes(newCategory.trim())) {
      toast.error("Danh mục này đã tồn tại");
      return;
    }

    // Thêm category vào database
    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);

    // Lưu vào database.json thông qua API
    try {
      await fetch("http://localhost:5678/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categories: updatedCategories }),
      });
      toast.success("Đã thêm danh mục mới thành công");
      setNewCategory("");
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      toast.error("Có lỗi xảy ra khi thêm danh mục");
    }
  };

  // Xử lý tạo brand mới
  const handleCreateBrand = async () => {
    if (!newBrand.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu");
      return;
    }

    // Kiểm tra thương hiệu đã tồn tại chưa
    if (brands.includes(newBrand.trim())) {
      toast.error("Thương hiệu này đã tồn tại");
      return;
    }

    // Thêm brand vào database
    const updatedBrands = [...brands, newBrand.trim()];
    setBrands(updatedBrands);

    // Lưu vào database.json thông qua API
    try {
      await fetch("http://localhost:5678/api/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brands: updatedBrands }),
      });
      toast.success("Đã thêm thương hiệu mới thành công");
      setNewBrand("");
      setShowBrandModal(false);
    } catch (error) {
      console.error("Lỗi khi thêm thương hiệu:", error);
      toast.error("Có lỗi xảy ra khi thêm thương hiệu");
    }
  };

  // Bắt đầu chỉnh sửa category
  const startEditCategory = (index, categoryName) => {
    setEditingCategoryIndex(index);
    setEditedCategoryName(categoryName);
  };

  // Lưu category đã chỉnh sửa
  const saveEditedCategory = async (index) => {
    if (!editedCategoryName.trim()) {
      toast.error("Tên danh mục không được để trống");
      return;
    }

    // Kiểm tra tên mới có trùng với danh mục khác không
    if (
      categories.some(
        (cat, i) => i !== index && cat === editedCategoryName.trim()
      )
    ) {
      toast.error("Danh mục này đã tồn tại");
      return;
    }

    // Cập nhật danh mục
    const updatedCategories = [...categories];
    updatedCategories[index] = editedCategoryName.trim();
    setCategories(updatedCategories);

    // Lưu vào database.json thông qua API
    try {
      await fetch("http://localhost:5678/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categories: updatedCategories }),
      });
    } catch (error) {
      console.error("Lỗi khi lưu danh mục:", error);
    }

    toast.success("Đã cập nhật danh mục thành công");
    setEditingCategoryIndex(-1);
  };

  // Xóa category
  const deleteCategory = async (index) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      const updatedCategories = categories.filter((_, i) => i !== index);
      setCategories(updatedCategories);

      // Lưu vào database.json thông qua API
      try {
        await fetch("http://localhost:5678/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ categories: updatedCategories }),
        });
        toast.success("Đã xóa danh mục thành công");
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        toast.error("Có lỗi xảy ra khi xóa danh mục");
      }
    }
  };

  // Bắt đầu chỉnh sửa brand
  const startEditBrand = (index, brandName) => {
    setEditingBrandIndex(index);
    setEditedBrandName(brandName);
  };

  // Lưu brand đã chỉnh sửa
  const saveEditedBrand = async (index) => {
    if (!editedBrandName.trim()) {
      toast.error("Tên thương hiệu không được để trống");
      return;
    }

    // Kiểm tra tên mới có trùng với thương hiệu khác không
    if (brands.some((b, i) => i !== index && b === editedBrandName.trim())) {
      toast.error("Thương hiệu này đã tồn tại");
      return;
    }

    // Cập nhật thương hiệu
    const updatedBrands = [...brands];
    updatedBrands[index] = editedBrandName.trim();
    setBrands(updatedBrands);

    // Lưu vào database.json thông qua API
    try {
      await fetch("http://localhost:5678/api/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brands: updatedBrands }),
      });
      toast.success("Đã cập nhật thương hiệu thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật thương hiệu:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thương hiệu");
    }

    setEditingBrandIndex(-1);
  };

  // Xóa brand
  const deleteBrand = async (index) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) {
      const updatedBrands = brands.filter((_, i) => i !== index);
      setBrands(updatedBrands);

      // Lưu vào database.json thông qua API
      try {
        await fetch("http://localhost:5678/api/brands", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ brands: updatedBrands }),
        });
        toast.success("Đã xóa thương hiệu thành công");
      } catch (error) {
        console.error("Lỗi khi xóa thương hiệu:", error);
        toast.error("Có lỗi xảy ra khi xóa thương hiệu");
      }
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
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCategoryModal(false)}
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateCategory}>
            Save Category
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
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBrandModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateBrand}>
            Save Brand
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
          <div className="mb-3">
            <Button
              variant="primary"
              onClick={createProductHandler}
              className="d-flex align-items-center"
              style={{ backgroundColor: "#007bff", borderColor: "#007bff" }}
            >
              <FaPlus className="me-1" /> Add New Product
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
