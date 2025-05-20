import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const linkStyle = {
    color: 'white',
    textDecoration: 'none'
  };

  return (
    <footer className="bg-dark py-5 mt-5" style={{color: 'white'}}>
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 className="text-white mb-3">Về Chúng Tôi</h5>
            <p className="text-white">Computer Store - Cửa hàng máy tính uy tín, chuyên cung cấp các sản phẩm máy tính, linh kiện và phụ kiện chính hãng với giá tốt nhất thị trường.</p>
          </Col>
          
          <Col md={3} className="mb-4">
            <h5 className="text-white mb-3">Liên Kết</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" style={linkStyle}>Trang Chủ</Link>
              </li>
              <li className="mb-2">
                <Link to="/products" style={linkStyle}>Sản Phẩm</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" style={linkStyle}>Liên Hệ</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" style={linkStyle}>Giới Thiệu</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={2} className="mb-4">
            <h5 className="text-white mb-3">Danh Mục</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/products?category=laptop" style={linkStyle}>Laptop</Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=desktop" style={linkStyle}>Desktop</Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=accessories" style={linkStyle}>Phụ Kiện</Link>
              </li>
              <li className="mb-2">
                <Link to="/products?category=components" style={linkStyle}>Linh Kiện</Link>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-4">
            <h5 className="text-white mb-3">Thông Tin Liên Hệ</h5>
            <ul className="list-unstyled text-white">
              <li className="mb-2 text-white">
                <i className="fas fa-map-marker-alt me-2"></i>
                123 Đường ABC, Quận XYZ, TP.HCM
              </li>
              <li className="mb-2 text-white">
                <i className="fas fa-phone me-2"></i>
                0123 456 789
              </li>
              <li className="mb-2 text-white">
                <i className="fas fa-envelope me-2"></i>
                contact@computerstore.com
              </li>
            </ul>
            <div className="social-links mt-3">
              <a href="https://facebook.com" style={linkStyle} className="me-3" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" style={linkStyle} className="me-3" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" style={linkStyle} className="me-3" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://youtube.com" style={linkStyle} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </Col>
        </Row>
        
        <hr className="my-4 bg-white" />
        
        <Row>
          <Col className="text-center text-white">
            <p className="mb-0">&copy; {new Date().getFullYear()} Computer Store. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 