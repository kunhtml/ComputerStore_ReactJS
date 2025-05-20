import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-5 py-4">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>About Us</h5>
            <p className="text-muted">
              PC Store is your one-stop shop for all your computer needs. We offer the best prices and quality products.
            </p>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-muted">Home</Link></li>
              <li><Link to="/products" className="text-muted">Products</Link></li>
              <li><Link to="/cart" className="text-muted">Cart</Link></li>
              <li><Link to="/login" className="text-muted">My Account</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <address className="text-muted">
              <p className="mb-1">123 PC Street, Tech City</p>
              <p className="mb-1">Email: contact@pcstore.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </Col>
        </Row>
        <hr className="bg-secondary" />
        <div className="text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} PC Store. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
