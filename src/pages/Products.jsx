import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Form, Container } from "react-bootstrap";
import { useAppContext } from "../context/AppContext";
import axios from "../services/axiosConfig";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceRange, setPriceRange] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000); // Store the max price for the current category
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

  // Lấy danh sách danh mục từ database.json
  // Initial setup of categories and handling URL parameters
  useEffect(() => {
    const getCategories = async () => {
      try {
        // Get products from API instead of axios.database
        const response = await fetch('http://localhost:5678/api/database');
        const data = await response.json();
        const productsData = data.products || [];

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

        // Calculate initial max price from all products
        const initialMaxPrice = Math.max(...productsData.map(product => product.price), 0);
        const roundedMaxPrice = Math.ceil(initialMaxPrice / 100) * 100;
        setMaxPrice(roundedMaxPrice || 5000);
        setPriceRange(roundedMaxPrice); // Set initial price range to max price

        // Nếu có tham số category trong URL, đặt selectedCategory
        if (categoryParam) {
          // Kiểm tra xem category có tồn tại trong danh sách không
          const categoryExists = uniqueCategories.includes(categoryParam);
          if (categoryExists) {
            setSelectedCategory(categoryParam);
            
            // Calculate max price for the selected category
            const categoryProducts = productsData.filter(p => p.category === categoryParam);
            if (categoryProducts.length > 0) {
              const categoryMaxPrice = Math.max(...categoryProducts.map(p => p.price), 0);
              const roundedCategoryMaxPrice = Math.ceil(categoryMaxPrice / 100) * 100;
              setMaxPrice(roundedCategoryMaxPrice || 5000);
              setPriceRange(roundedCategoryMaxPrice); // Set price range to max price for this category
            }
          }
        } else {
          // If no category in URL, ensure selectedCategory is "all"
          setSelectedCategory("all");
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

        // Lấy dữ liệu từ server API
        const response = await fetch('http://localhost:5678/api/database');
        const data = await response.json();
        const productsData = data.products || [];

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

  // Calculate max price for the current category and filter products
  useEffect(() => {
    if (products.length > 0) {
      let filtered = products;
      
      // Filter by category
      if (selectedCategory !== "all") {
        filtered = filtered.filter((product) => product.category === selectedCategory);
      }
      
      // Calculate max price for current filtered products
      const categoryMaxPrice = Math.max(...filtered.map(product => product.price), 0);
      
      // Round up to nearest 100 for better user experience
      const roundedMaxPrice = Math.ceil(categoryMaxPrice / 100) * 100;
      setMaxPrice(roundedMaxPrice || 5000); // Default to 5000 if no products or all prices are 0
      
      // If current priceRange is higher than new maxPrice, reset it to maxPrice
      if (priceRange > roundedMaxPrice) {
        setPriceRange(roundedMaxPrice);
      }
      
      // Filter by price range
      filtered = filtered.filter((product) => product.price <= priceRange);
      
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products, priceRange]);

  // Hàm đặt lại bộ lọc
  const resetFilters = () => {
    setSelectedCategory("all");
    
    // Reset price range to the max price of all products
    const allProductsMaxPrice = Math.max(...products.map(p => p.price), 0);
    const roundedMaxPrice = Math.ceil(allProductsMaxPrice / 100) * 100;
    setMaxPrice(roundedMaxPrice || 5000);
    setPriceRange(roundedMaxPrice);
    
    // Update URL when filters are reset
    navigate('/products');
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
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      setSelectedCategory(newCategory);
                      
                      // When category changes, recalculate price range
                      const categoryProducts = newCategory === "all" 
                        ? products 
                        : products.filter(p => p.category === newCategory);
                        
                      if (categoryProducts.length > 0) {
                        const newMaxPrice = Math.max(...categoryProducts.map(p => p.price), 0);
                        const roundedMaxPrice = Math.ceil(newMaxPrice / 100) * 100;
                        setMaxPrice(roundedMaxPrice || 5000);
                        setPriceRange(roundedMaxPrice); // Reset price range to max for new category
                      }
                      
                      // Update URL when category changes
                      if (newCategory === "all") {
                        navigate('/products');
                      } else {
                        navigate(`/products?category=${encodeURIComponent(newCategory)}`);
                      }
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price Range: ${priceRange} (Max: ${maxPrice})</Form.Label>
                  <Form.Range 
                    min="0" 
                    max={maxPrice} 
                    step={Math.max(Math.ceil(maxPrice / 50), 1)} 
                    value={priceRange} 
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                  />
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
                      <Link to={`/products/${product.id}`} className="w-100">
                        <Button variant="primary" className="mt-2 w-100">
                          View Details
                        </Button>
                      </Link>
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
