import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, Container, Card } from 'react-bootstrap';


const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split('=')[1] : '/';
  
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (password !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      return;
    }
    
    try {
      setLoading(true);
      
      // Lấy danh sách người dùng từ database.json
      const response = await fetch('/database.json');
      const data = await response.json();
      const users = data.users || [];
      
      // Kiểm tra xem email đã tồn tại chưa
      const userExists = users.some(user => user.email === email);
      if (userExists) {
        setError('Email đã được đăng ký');
        return;
      }
      
      // Tạo người dùng mới
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // Trong thực tế, mật khẩu cần được mã hóa trước khi lưu
        isAdmin: false
      };
      
      // Lưu thông tin người dùng vào localStorage
      localStorage.setItem('userInfo', JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin
      }));
      
      // Chuyển hướng về trang chủ hoặc trang được chỉ định
      navigate(redirect || '/');
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng ký tài khoản');
      console.error('Lỗi khi đăng ký:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6} lg={4}>
          <Card className="mt-5">
            <Card.Body>
              <h2 className="text-center mb-4">Create Account</h2>
              {message && <div className="alert alert-danger">{message}</div>}
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>

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
                    minLength={6}
                  />
                </Form.Group>

                <Form.Group controlId="confirmPassword" className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button type="submit" variant="primary" size="lg">
                    Register
                  </Button>
                </div>
              </Form>

              <Row className="py-3">
                <Col>
                  Already have an account?{' '}
                  <Link to={redirect ? `/login?redirect=${redirect}` : '/login'}>
                    Sign In
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
