import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Nav, Navbar, Button } from "react-bootstrap";
import {
  FaUser,
  FaShoppingCart,
  FaCog,
  FaTachometerAlt,
  FaSignOutAlt,
  FaHeart,
  FaClipboardList
} from "react-icons/fa";
import { logout, getCurrentUser } from "../../services/authApi";

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const user = getCurrentUser();
    setCurrentUser(user);

    // If no user, redirect to login
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Check if the current path matches the given path
  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <div className="user-layout">
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
        <Container fluid>
          <Navbar.Brand as={Link} to="/dashboard">
            My Account
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="user-navbar" />
          <Navbar.Collapse id="user-navbar" className="justify-content-end">
            <Navbar.Text className="me-3">
              Signed in as: <strong>{currentUser?.name}</strong>
            </Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              <FaSignOutAlt className="me-2" />
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid>
        <Row>
          {/* Sidebar */}
          <Col md={3} lg={2} className="bg-light sidebar">
            <Nav className="flex-column">
              <Nav.Link
                as={Link}
                to="/dashboard"
                className={isActive("/dashboard") && !isActive("/dashboard/orders") && !isActive("/dashboard/settings") ? "active" : ""}
              >
                <FaTachometerAlt className="me-2" />
                Dashboard
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/dashboard/profile"
                className={isActive("/dashboard/profile") ? "active" : ""}
              >
                <FaUser className="me-2" />
                My Profile
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/dashboard/orders"
                className={isActive("/dashboard/orders") ? "active" : ""}
              >
                <FaClipboardList className="me-2" />
                My Orders
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/dashboard/wishlist"
                className={isActive("/dashboard/wishlist") ? "active" : ""}
              >
                <FaHeart className="me-2" />
                Wishlist
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/dashboard/settings"
                className={isActive("/dashboard/settings") ? "active" : ""}
              >
                <FaCog className="me-2" />
                Settings
              </Nav.Link>
              <hr />
              <Nav.Link as={Link} to="/">
                Back to Store
              </Nav.Link>
            </Nav>
          </Col>

          {/* Main content */}
          <Col md={9} lg={10} className="ms-sm-auto px-md-4 py-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserLayout;
