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

  // Lấy danh sách danh mục từ database.json trong thư mục src/data
  useEffect(() => {
    const getCategories = async () => {
      try {
        // Get products from src/data/database.json
        const response = await fetch('/data/database.json');
        const data = await response.json();
        const productsData = data.products || [];

        // Lấy danh sách danh mục duy nhất từ sản phẩm
        const uniqueCategories = [
          ...new Set(productsData.map((product) => product.category)),
        ];

        console.log("Found categories:", uniqueCategories);

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
        console.error("Lỗi khi lấy danh mục từ local file:", err);
        
        // Fallback to API if local file fails
        try {
          const apiResponse = await fetch('http://localhost:5678/api/database');
          const apiData = await apiResponse.json();
          const apiProductsData = apiData.products || [];
          
          // Process categories from API data
          const apiUniqueCategories = [
            ...new Set(apiProductsData.map((product) => product.category)),
          ];
          
          const apiCategoryList = [
            { value: "all", label: "Tất cả" },
            ...apiUniqueCategories.map((category) => ({
              value: category,
              label: category,
            })),
          ];
          
          setCategories(apiCategoryList);
          
          // Set price range
          const apiInitialMaxPrice = Math.max(...apiProductsData.map(product => product.price), 0);
          const apiRoundedMaxPrice = Math.ceil(apiInitialMaxPrice / 100) * 100;
          setMaxPrice(apiRoundedMaxPrice || 5000);
          setPriceRange(apiRoundedMaxPrice);
        } catch (apiErr) {
          console.error("Failed to load categories from API as well:", apiErr);
        }
      }
    };

    getCategories();
  }, [categoryParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Try to get data from src/data/database.json first
        try {
          const response = await fetch('/data/database.json');
          const data = await response.json();
          const productsData = data.products || [];
          
          // Lọc sản phẩm theo từ khóa tìm kiếm nếu có
          let filteredData = productsData;
          if (keyword) {
            const keywordLower = keyword.toLowerCase();
            filteredData = productsData.filter(
              (product) =>
                product.name.toLowerCase().includes(keywordLower) ||
                product.description.toLowerCase().includes(keywordLower)
            );
          }

          // Lọc sản phẩm theo danh mục nếu có
          if (selectedCategory !== "all") {
            filteredData = filteredData.filter(
              (product) => product.category === selectedCategory
            );
          }

          // Lọc sản phẩm theo giá
          filteredData = filteredData.filter(
            (product) => product.price <= priceRange
          );

          setProducts(productsData);
          setFilteredProducts(filteredData);
          setError("");
        } catch (localErr) {
          console.error("Error loading from local file:", localErr);
          
          // Fallback to API
          const apiResponse = await fetch('http://localhost:5678/api/database');
          const apiData = await apiResponse.json();
          const apiProductsData = apiData.products || [];
          
          // Lọc sản phẩm theo từ khóa tìm kiếm nếu có
          let filteredData = apiProductsData;
          if (keyword) {
            const keywordLower = keyword.toLowerCase();
            filteredData = apiProductsData.filter(
              (product) =>
                product.name.toLowerCase().includes(keywordLower) ||
                product.description.toLowerCase().includes(keywordLower)
            );
          }

          // Lọc sản phẩm theo danh mục nếu có
          if (selectedCategory !== "all") {
            filteredData = filteredData.filter(
              (product) => product.category === selectedCategory
            );
          }

          // Lọc sản phẩm theo giá
          filteredData = filteredData.filter(
            (product) => product.price <= priceRange
          );

          setProducts(apiProductsData);
          setFilteredProducts(filteredData);
          setError("");
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError("Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, selectedCategory, priceRange]);

  // Xử lý khi thay đổi danh mục
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    // Cập nhật URL với tham số category
    const params = new URLSearchParams(location.search);
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    navigate({ search: params.toString() });

    // Tính toán giá tối đa cho danh mục được chọn
    if (category === "all") {
      const allProductsMaxPrice = Math.max(...products.map(p => p.price), 0);
      const roundedMaxPrice = Math.ceil(allProductsMaxPrice / 100) * 100;
      setMaxPrice(roundedMaxPrice || 5000);
      setPriceRange(roundedMaxPrice);
    } else {
      const categoryProducts = products.filter(p => p.category === category);
      if (categoryProducts.length > 0) {
        const categoryMaxPrice = Math.max(...categoryProducts.map(p => p.price), 0);
        const roundedCategoryMaxPrice = Math.ceil(categoryMaxPrice / 100) * 100;
        setMaxPrice(roundedCategoryMaxPrice || 5000);
        setPriceRange(roundedCategoryMaxPrice);
      }
    }
  };

  // Xử lý khi thay đổi khoảng giá
  const handlePriceChange = (e) => {
    setPriceRange(e.target.value);
  };

  return (
    <Container className="py-3">
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
          <h1 className="mb-4">
            {keyword
              ? `Kết quả tìm kiếm cho "${keyword}"`
              : selectedCategory !== "all"
              ? `Sản phẩm ${selectedCategory}`
              : "Tất cả sản phẩm"}
          </h1>

          <Row>
            <Col md={3}>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Price Range: ${priceRange}
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max={maxPrice}
                  step="100"
                  value={priceRange}
                  onChange={handlePriceChange}
                />
                <div className="d-flex justify-content-between">
                  <span>$0</span>
                  <span>${maxPrice}</span>
                </div>
              </div>
            </Col>

            <Col md={9}>
              {filteredProducts.length === 0 ? (
                <div className="alert alert-info">
                  No products found matching your criteria
                </div>
              ) : (
                <Row>
                  {filteredProducts.map((product) => (
                    <Col key={product.id} sm={12} md={6} lg={4} className="mb-4">
                      <Card className="h-100 shadow-sm">
                        <Link to={`/product/${product.id}`}>
                          <Card.Img
                            variant="top"
                            src={product.image}
                            alt={product.name}
                            className="product-image"
                          />
                        </Link>
                        <Card.Body className="d-flex flex-column">
                          <Link
                            to={`/product/${product.id}`}
                            className="text-decoration-none"
                          >
                            <Card.Title as="h5">{product.name}</Card.Title>
                          </Link>
                          <Card.Text className="text-muted mb-0">
                            {product.brand}
                          </Card.Text>
                          <Card.Text className="text-muted mb-2">
                            Category: {product.category}
                          </Card.Text>
                          <div className="d-flex align-items-center mb-2">
                            <div className="ratings">
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
                            <span className="ms-2 text-muted">
                              ({product.numReviews} reviews)
                            </span>
                          </div>
                          <Card.Text className="price-text mt-auto mb-2">
                            ${product.price.toFixed(2)}
                          </Card.Text>
                          <div className="d-grid">
                            <Link
                              to={`/product/${product.id}`}
                              className="btn btn-primary"
                            >
                              View Details
                            </Link>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Products;
