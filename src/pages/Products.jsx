import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Form, Container, InputGroup } from "react-bootstrap";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceRange, setPriceRange] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [searchTerm, setSearchTerm] = useState("");
  const { keyword } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy tham số category từ URL
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get("category");

  // Danh sách danh mục
  const [categories, setCategories] = useState([
    { value: "all", label: "Tất cả" },
  ]);

  // Lấy danh sách danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5678/api/categories');
        const data = await response.json();
        const categoryList = [
          { value: "all", label: "Tất cả" },
          ...(data.categories || []).map((category) => ({
            value: category,
            label: category,
          })),
        ];
        setCategories(categoryList);
        if (categoryParam) setSelectedCategory(categoryParam);
      } catch (error) {
        setCategories([{ value: "all", label: "Tất cả" }]);
      }
    };
    fetchCategories();
  }, [categoryParam]);

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5678/api/products');
        const data = await response.json();
        const productsData = data.products || [];
        if (productsData.length === 0) {
          throw new Error("No products found");
        }
        const highestPrice = Math.max(...productsData.map((product) => product.price));
        setMaxPrice(highestPrice);
        setPriceRange(highestPrice);
        const formattedProducts = productsData.map((product) => ({
          ...product,
          _id: product.id?.toString() || product._id?.toString() || '',
          image: product.image || "https://via.placeholder.com/300x200?text=No+Image",
        }));
        setProducts(formattedProducts);
        setError("");
      } catch (err) {
        setError("Lỗi khi tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Lọc sản phẩm theo danh mục và từ khóa tìm kiếm
  useEffect(() => {
    let result = [...products];
    if (selectedCategory !== "all") {
      result = result.filter((product) => product.category === selectedCategory);
    }
    // Lọc theo từ khóa từ URL hoặc từ ô tìm kiếm
    const searchQuery = (keyword || searchTerm).toLowerCase();
    if (searchQuery) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery) ||
          product.description.toLowerCase().includes(searchQuery) ||
          product.brand.toLowerCase().includes(searchQuery) ||
          product.category.toLowerCase().includes(searchQuery)
      );
    }
    if (priceRange < maxPrice) {
      result = result.filter((product) => product.price <= priceRange);
    }
    setFilteredProducts(result);
  }, [products, selectedCategory, keyword, searchTerm, priceRange, maxPrice]);

  // Xử lý thay đổi danh mục
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    const params = new URLSearchParams(location.search);
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    navigate({
      pathname: keyword ? `/search/${keyword}` : "/products",
      search: params.toString(),
    });
  };

  // Xử lý thay đổi giá
  const handlePriceChange = (e) => {
    setPriceRange(Number(e.target.value));
  };

  // Xử lý tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Không cần làm gì vì đã filter realtime
  };

  return (
    <Container className="py-3">
      <h1 className="mb-4">Sản phẩm</h1>
      
      {/* Search bar */}
      <Row className="mb-4">
        <Col md={12}>
          <Form onSubmit={handleSearchSubmit}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Nhập tên sản phẩm, từ khóa cần tìm..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              <Button variant="primary" type="submit">
                <i className="fas fa-search"></i> Tìm kiếm
              </Button>
            </InputGroup>
          </Form>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Danh mục</Form.Label>
            <Form.Control
              as="select"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Giá tối đa: {priceRange.toLocaleString('vi-VN')}₫</Form.Label>
            <Form.Range
              min={0}
              max={maxPrice}
              step={1}
              value={priceRange}
              onChange={handlePriceChange}
            />
          </Form.Group>
        </Col>
      </Row>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <Row>
            {filteredProducts.length === 0 ? (
              <Col className="text-center py-3">
                <div className="alert alert-info">
                  Không tìm thấy sản phẩm nào phù hợp
                </div>
              </Col>
            ) : (
              filteredProducts.map((product) => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                  <Card className="my-3 p-3 rounded product-card">
                    <Link to={`/products/${product._id}`}>
                      <Card.Img
                        src={product.image}
                        variant="top"
                        className="product-image"
                      />
                    </Link>
                    <Card.Body>
                      <Link
                        to={`/products/${product._id}`}
                        className="text-decoration-none"
                      >
                        <Card.Title as="div" className="product-title">
                          <strong>{product.name}</strong>
                        </Card.Title>
                      </Link>
                      <Card.Text as="div" className="my-2">
                        <div className="d-flex align-items-center">
                          <div className="ratings me-2">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={
                                  i < Math.floor(product.rating)
                                    ? "fas fa-star"
                                    : i < product.rating
                                    ? "fas fa-star-half-alt"
                                    : "far fa-star"
                                }
                                style={{ color: "#ffc107" }}
                              ></i>
                            ))}
                          </div>
                          <span className="rating-count">
                            ({product.numReviews})
                          </span>
                        </div>
                      </Card.Text>
                      <Card.Text as="h3" className="product-price">
                        {product.price.toLocaleString('vi-VN')}₫
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="product-brand">
                          <small className="text-muted">{product.brand}</small>
                        </div>
                        <div className="product-category">
                          <small className="text-muted">
                            {product.category}
                          </small>
                        </div>
                      </div>
                      <div className="d-grid gap-2 mt-3">
                        <Link to={`/products/${product._id}`}>
                          <Button variant="primary" className="w-100">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </>
      )}
    </Container>
  );
};

export default Products;
