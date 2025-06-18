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
              {/* Always show Products link */}
              <LinkContainer to="/products">
                <Nav.Link>Sản phẩm</Nav.Link>
              </LinkContainer>
              
              {/* Only show Cart link for logged-in non-admin users */}
              {userInfo && !userInfo.isAdmin && (
                <LinkContainer to="/cart">
                  <Nav.Link>
                    <i className="fas fa-shopping-cart"></i> Giỏ hàng
                  </Nav.Link>
                </LinkContainer>
              )}
              {/* Hiển thị dropdown menu nếu đã đăng nhập */}
              {isLoggedIn && userInfo ? (
                <NavDropdown title={userInfo.name || "User"} id="username">
                  {userInfo.isAdmin ? (
                    <>
                      <LinkContainer to="/admin">
                        <NavDropdown.Item>Quản lý</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={logoutHandler}>
                        Đăng xuất
                      </NavDropdown.Item>
                    </>
                  ) : (
                    <>
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>Thông tin cá nhân</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/myorders">
                        <NavDropdown.Item>Đơn hàng của tôi</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/user-reviews">
                        <NavDropdown.Item>Đánh giá của tôi</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={logoutHandler}>
                        Đăng xuất
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
