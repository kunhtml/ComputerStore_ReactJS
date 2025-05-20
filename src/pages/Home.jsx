import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, Button, Carousel, ListGroup } from "react-bootstrap";
import Loader from "../components/Loader";
import Message from "../components/Message";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dbCategories, setDbCategories] = useState([]);

  // Lấy danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5678/api/categories');
        const data = await response.json();
        setDbCategories(data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setDbCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Lấy sản phẩm nổi bật từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5678/api/products?featured=true');
        const data = await response.json();
        setProducts(data.products || []);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Hero banner data
  const heroSlides = [
    {
      id: 1,
      title: "High Performance Gaming PCs",
      description:
        "Experience the ultimate gaming performance with our latest gaming rigs",
      image: "https://via.placeholder.com/1200x400?text=Gaming+PCs",
      buttonText: "Shop Now",
      buttonLink: "/products?category=gaming",
    },
    {
      id: 2,
      title: "Powerful Workstations",
      description: "Boost your productivity with our high-end workstations",
      image: "https://via.placeholder.com/1200x400?text=Workstations",
      buttonText: "Explore",
      buttonLink: "/products?category=workstation",
    },
    {
      id: 3,
      title: "Custom Builds",
      description: "Build your dream PC with our custom configuration options",
      image: "https://via.placeholder.com/1200x400?text=Custom+Builds",
      buttonText: "Customize",
      buttonLink: "/custom-build",
    },
  ];

  // Featured categories
  const categories = [
    {
      id: 1,
      name: "Gaming",
      slug: "gaming",
      image: "https://via.placeholder.com/300x200?text=Gaming",
    },
    {
      id: 2,
      name: "Workstation",
      slug: "workstation",
      image: "https://via.placeholder.com/300x200?text=Workstation",
    },
    {
      id: 3,
      name: "Budget",
      slug: "budget",
      image: "https://via.placeholder.com/300x200?text=Budget",
    },
    {
      id: 4,
      name: "Accessories",
      slug: "accessories",
      image: "https://via.placeholder.com/300x200?text=Accessories",
    },
  ];

  return (
    <>
      {/* Hero Carousel */}
      <Carousel fade className="mb-5">
        {heroSlides.map((slide) => (
          <Carousel.Item key={slide.id}>
            <Link to={slide.buttonLink}>
              <img
                className="d-block w-100"
                src={slide.image}
                alt={slide.title}
              />
              <Carousel.Caption className="bg-dark bg-opacity-50 p-4 rounded">
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
                <Button as={Link} to={slide.buttonLink} variant="primary">
                  {slide.buttonText}
                </Button>
              </Carousel.Caption>
            </Link>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Homepage Slider Left */}
      <h2 className="mb-4">Danh Mục Sản Phẩm</h2>
      <div className="mb-5">
        <Row>
          <Col md={3}>
            <div className="homepage-slider-left">
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Danh Mục</h5>
                </Card.Header>
                <ListGroup variant="flush">
                  {dbCategories.map((category, index) => {
                    // Xác định icon dựa trên tên danh mục
                    let icon = "fas fa-folder me-2";
                    
                    // Check if category is defined before using includes
                    if (typeof category === 'string') {
                      if (category.includes("Laptop"))
                        icon = "fas fa-laptop me-2";
                      else if (
                        category.includes("Desktop") ||
                        category.includes("PC")
                      )
                        icon = "fas fa-desktop me-2";
                      else if (category.includes("Components"))
                        icon = "fas fa-microchip me-2";
                      else if (category.includes("Accessories"))
                        icon = "fas fa-headphones me-2";
                      else if (category.includes("Monitor"))
                        icon = "fas fa-tv me-2";
                      else if (category.includes("Gaming"))
                        icon = "fas fa-gamepad me-2";
                      else if (category.includes("Networking"))
                        icon = "fas fa-network-wired me-2";
                      else if (category.includes("Software"))
                        icon = "fas fa-compact-disc me-2";
                      else if (category.includes("Workstation"))
                        icon = "fas fa-server me-2";
                    }

                    return (
                      <ListGroup.Item
                        key={index}
                        action
                        as={Link}
                        to={`/products?category=${category}`}
                      >
                        <i className={icon}></i> {category}
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </Card>
            </div>
          </Col>
          <Col md={9}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Carousel
                  fade
                  indicators={false}
                  className="homepage-main-carousel"
                >
                  {categories.slice(0, 3).map((category) => (
                    <Carousel.Item key={category.id}>
                      <Link to={`/products?category=${category.name}`}>
                        <img
                          className="d-block w-100"
                          src={category.image}
                          alt={category.name}
                          style={{ height: "350px", objectFit: "cover" }}
                        />
                        <Carousel.Caption className="bg-dark bg-opacity-50 p-3 rounded">
                          <h3>{category.name}</h3>
                        </Carousel.Caption>
                      </Link>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Featured Products */}
      <h2 className="mb-4">Sản Phẩm Nổi Bật</h2>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div className="mb-5">
          {products && products.length > 0 ? (
            <Row className="owl-stage-outer">
              {products.map((product) => (
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
                      <Card.Img
                        src={product.image}
                        variant="top"
                        alt={product.name}
                        className="p-3"
                        style={{ height: "200px", objectFit: "contain" }}
                      />
                    </Link>
                    <Card.Body className="d-flex flex-column">
                      <Link
                        to={`/products/${product.id}`}
                        className="text-decoration-none"
                      >
                        <Card.Title as="div" className="text-dark">
                          <strong>{product.name}</strong>
                        </Card.Title>
                      </Link>
                      <Card.Text as="div" className="my-2">
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={
                                product.rating > i
                                  ? "fas fa-star text-warning"
                                  : product.rating - i > 0.5
                                  ? "fas fa-star-half-alt text-warning"
                                  : "far fa-star text-warning"
                              }
                            />
                          ))}
                          <span className="ms-2">
                            {product.numReviews} reviews
                          </span>
                        </div>
                      </Card.Text>
                      <Card.Text as="h4" className="mt-auto">
                        ${product.price}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Message>No products found</Message>
          )}
        </div>
      )}

      {/* CTA Section */}
      <Row className="bg-light p-5 my-5 text-center rounded">
        <Col>
          <h2>Need Help Choosing the Right PC?</h2>
          <p className="lead">
            Our experts are here to help you find the perfect computer for your
            needs.
          </p>
          <Button variant="outline-primary" size="lg" as={Link} to="/contact">
            Contact Us
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Home;
