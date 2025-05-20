import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Row, Col, Card, Button, Form, Container } from "react-bootstrap";
import { useAppContext } from "../context/AppContext";
import axios from "../services/axiosConfig";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { keyword } = useParams();
  const location = useLocation();

  // Lấy tham số category từ URL
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get("category");

  // Danh sách danh mục
  const [categories, setCategories] = useState([
    { value: "all", label: "Tất cả" },
  ]);

  // Lấy danh sách danh mục từ database.json
  useEffect(() => {
    const getCategories = () => {
      try {
        const productsData = axios.database.products || [];

        // Lấy danh sách danh mục duy nhất từ sản phẩm
        const uniqueCategories = [
          ...new Set(productsData.map((product) => product.category)),
        ];

        // Tạo danh sách danh mục với định dạng { value, label }
        const categoryList = [
          { value: "all", label: "Tất cả" },
          ...uniqueCategories.map((category) => ({
            value: category,
            label: category,
          })),
        ];

        setCategories(categoryList);

        // Nếu có tham số category trong URL, đặt selectedCategory
        if (categoryParam) {
          // Kiểm tra xem category có tồn tại trong danh sách không
          const categoryExists = uniqueCategories.includes(categoryParam);
          if (categoryExists) {
            setSelectedCategory(categoryParam);
          }
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
      }
    };

    getCategories();
  }, [categoryParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Lấy dữ liệu từ database.json thông qua axios
        const productsData = axios.database.products || [];

        // Lọc sản phẩm theo từ khóa tìm kiếm nếu có
        let filteredData = productsData;
        if (keyword) {
          const keywordLower = keyword.toLowerCase();
          filteredData = productsData.filter(
            (product) =>
              product.name.toLowerCase().includes(keywordLower) ||
              product.category.toLowerCase().includes(keywordLower) ||
              product.description?.toLowerCase().includes(keywordLower)
          );
        }

        // Lọc sản phẩm theo danh mục từ URL nếu có
        if (categoryParam && categoryParam !== "all") {
          filteredData = filteredData.filter(
            (product) => product.category === categoryParam
          );
          // Đặt selectedCategory để hiển thị đúng trong dropdown
          setSelectedCategory(categoryParam);
        }

        setProducts(filteredData);
        setFilteredProducts(filteredData);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu sản phẩm");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, categoryParam]);

  // Lọc sản phẩm khi danh mục thay đổi
  useEffect(() => {
    if (products.length > 0) {
      if (selectedCategory === "all") {
        setFilteredProducts(products);
      } else {
        setFilteredProducts(
          products.filter((product) => product.category === selectedCategory)
        );
      }
    }
  }, [selectedCategory, products]);

  // Hàm đặt lại bộ lọc
  const resetFilters = () => {
    setSelectedCategory("all");
  };

  return (
    <Container>
      <h1>All Products</h1>
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <h3>Filters</h3>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price Range</Form.Label>
                  <Form.Range />
                </Form.Group>
                <Button variant="primary" onClick={resetFilters} type="button">
                  Reset Filters
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="text-muted">
                Hiển thị {filteredProducts.length} kết quả
                {selectedCategory !== "all"
                  ? ` trong danh mục "${
                      categories.find((c) => c.value === selectedCategory)
                        ?.label
                    }"`
                  : ""}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h4>Không tìm thấy sản phẩm phù hợp</h4>
              <p>Vui lòng thay đổi bộ lọc để tìm kiếm</p>
              <Button variant="outline-primary" onClick={resetFilters}>
                Đặt lại bộ lọc
              </Button>
            </div>
          ) : (
            <Row>
              {filteredProducts.map((product) => (
                <Col
                  key={product.id}
                  sm={12}
                  md={6}
                  lg={4}
                  xl={3}
                  className="mb-4"
                >
                  <Card className="h-100">
                    <Link to={`/products/${product.id}`}>
                      <Card.Img src={product.image} variant="top" />
                    </Link>
                    <Card.Body className="d-flex flex-column">
                      <Link
                        to={`/products/${product.id}`}
                        className="text-decoration-none"
                      >
                        <Card.Title as="div">
                          <strong>{product.name}</strong>
                        </Card.Title>
                      </Link>
                      <Card.Text as="h5" className="mt-auto">
                        ${product.price}
                      </Card.Text>
                      <Button variant="primary" className="mt-2">
                        Add to Cart
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Products;
