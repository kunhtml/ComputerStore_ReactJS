import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const Profile = ({ history }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

    if (!userInfo) {
      history.push('/login');
    } else {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
    }
  }, [history]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password && password !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);

      // Update user information in localStorage
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('userInfo') || '{}'),
        name,
        email,
      };

      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

      setSuccess(true);
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật thông tin');
      console.error('Lỗi khi cập nhật thông tin:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <h2>Thông tin cá nhân</h2>
          {message && <Message variant="danger">{message}</Message>}
          {error && <Message variant="danger">{error}</Message>}
          {success && <Message variant="success">Đã cập nhật thông tin</Message>}
          {loading && <Loader />}
          <Card>
            <Card.Body>
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="name">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    type="name"
                    placeholder="Nhập họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId="email" className="py-3">
                  <Form.Label>Địa chỉ Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId="password">
                  <Form.Label>Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId="confirmPassword" className="py-3">
                  <Form.Label>Xác nhận mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Button type="submit" variant="primary" className="mt-3">
                  Cập nhật
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
