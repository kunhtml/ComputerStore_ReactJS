import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

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
                <a href="/" style={linkStyle}><i className="fas fa-home me-2"></i>Trang Chủ</a>
              </li>
              <li className="mb-2">
                <a href="/products" style={linkStyle}><i className="fas fa-laptop me-2"></i>Sản Phẩm</a>
              </li>
              <li className="mb-2">
                <a href="/contact" style={linkStyle}><i className="fas fa-envelope me-2"></i>Liên Hệ</a>
              </li>
              <li className="mb-2">
                <a href="/about" style={linkStyle}><i className="fas fa-info-circle me-2"></i>Giới Thiệu</a>
              </li>
            </ul>
          </Col>
          
          <Col md={2} className="mb-4">
            <h5 className="text-white mb-3">Danh Mục</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/products?category=laptop" style={linkStyle}><i className="fas fa-laptop me-2"></i>Laptop</a>
              </li>
              <li className="mb-2">
                <a href="/products?category=desktop" style={linkStyle}><i className="fas fa-desktop me-2"></i>Desktop</a>
              </li>
              <li className="mb-2">
                <a href="/products?category=accessories" style={linkStyle}><i className="fas fa-headphones me-2"></i>Phụ Kiện</a>
              </li>
              <li className="mb-2">
                <a href="/products?category=components" style={linkStyle}><i className="fas fa-microchip me-2"></i>Linh Kiện</a>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-4">
            <h5 className="text-white mb-3">Thông Tin Liên Hệ</h5>
            <ul className="list-unstyled text-white">
              <li className="mb-2 text-white">
                <i className="fas fa-map-marker-alt me-2"></i>
                Khu GD&ĐT, khu CNC Hoà Lạc, KM29, Đại lộ Thăng Long, huyện Thạch Thất, TP Hà Nội, Hanoi, Vietnam
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