import React from 'react';
import { Container, Navbar, Nav, Dropdown, Row, Col } from 'react-bootstrap';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { FaChartLine, FaUsers, FaBoxes, FaShoppingCart, FaTachometerAlt } from 'react-icons/fa';

const AdminLayout = () => {
  const { userInfo, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container fluid className="p-0">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">PC Store</Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="ms-auto">
              <Dropdown align="end">
                <Dropdown.Toggle id="username" className="nav-link" as={Link} to="#" style={{ color: 'white', textDecoration: 'none' }}>
                  {userInfo?.name || 'Admin User'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/admin">Admin Panel</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as="button" onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container fluid>
        <Row>
          {/* Sidebar */}
          <Col md={3} lg={2} className="bg-light sidebar d-none d-md-block" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="position-sticky pt-3">
              <Nav className="flex-column">
                <Nav.Item>
                  <Nav.Link as={Link} to="/admin" className="text-dark">
                    <FaTachometerAlt className="me-2" />
                    Dashboard
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/admin/products" className="text-dark">
                    <FaBoxes className="me-2" />
                    Products
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/admin/orders" className="text-dark">
                    <FaShoppingCart className="me-2" />
                    Orders
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/admin/users" className="text-dark">
                    <FaUsers className="me-2" />
                    Users
                  </Nav.Link>
                </Nav.Item>
                <hr />
                <Nav.Item>
                  <Nav.Link as={Link} to="/" className="text-dark">
                    Return to Store
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
          </Col>
          
          {/* Main content */}
          <Col md={9} lg={10} className="ms-sm-auto px-md-4 py-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default AdminLayout; 