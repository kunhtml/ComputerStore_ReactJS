import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const Header = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useAppContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Thêm console.log để kiểm tra giá trị của userInfo
  console.log("Header - userInfo:", userInfo);

  // Kiểm tra trạng thái đăng nhập khi userInfo thay đổi
  useEffect(() => {
    setIsLoggedIn(userInfo !== null && userInfo !== undefined);
  }, [userInfo]);

  const logoutHandler = () => {
    logout();
    navigate("/");
  };

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>PC Store</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <LinkContainer to="/products">
                <Nav.Link>Products</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/cart">
                <Nav.Link>
                  <i className="fas fa-shopping-cart"></i> Cart
                </Nav.Link>
              </LinkContainer>
              {/* Hiển thị dropdown menu nếu đã đăng nhập */}
              {isLoggedIn && userInfo ? (
                <NavDropdown title={userInfo.name || "User"} id="username">
                  {userInfo.isAdmin ? (
                    <>
                      <LinkContainer to="/admin/reviewlist">
                        <NavDropdown.Item>Manager Review</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/userlist">
                        <NavDropdown.Item>Manager Users</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/productlist">
                        <NavDropdown.Item>Manager Products</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/orderlist">
                        <NavDropdown.Item>Manager Orders</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={logoutHandler}>
                        Logout
                      </NavDropdown.Item>
                    </>
                  ) : (
                    <>
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/myorders">
                        <NavDropdown.Item>My Orders</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/myreviews">
                        <NavDropdown.Item>Đánh Giá Của Tôi</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={logoutHandler}>
                        Logout
                      </NavDropdown.Item>
                    </>
                  )}
                </NavDropdown>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link className="btn btn-primary text-white me-2">
                      <i className="fas fa-sign-in-alt me-1"></i> Đăng nhập
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <Nav.Link className="btn btn-outline-light">
                      <i className="fas fa-user-plus me-1"></i> Đăng ký
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
