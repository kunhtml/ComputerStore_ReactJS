import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Form,
  Button,
  Row,
  Col,
  Container,
  Card,
  Alert,
} from "react-bootstrap";
import { useAppContext } from "../context/AppContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/";

  const { login, userInfo, loading, error } = useAppContext();

  useEffect(() => {
    // Kiểm tra nếu đã đăng nhập thì chuyển hướng
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6} lg={4}>
          <Card className="mt-5">
            <Card.Body>
              <h2 className="text-center mb-4">Sign In</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </Form>

              <Row className="py-3">
                <Col>
                  New Customer?{" "}
                  <Link
                    to={
                      redirect ? `/register?redirect=${redirect}` : "/register"
                    }
                  >
                    Register
                  </Link>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Link to="/forgot-password">Forgot Password?</Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
