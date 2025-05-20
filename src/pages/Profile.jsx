import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';

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
      // Lấy danh sách người dùng từ database.json
      const response = await fetch('/database.json');
      const data = await response.json();
      const users = data.users || [];
      
      // Tìm và cập nhật thông tin người dùng
      const updatedUsers = users.map(u => {
        if (u.email === email) {
          return {
            ...u,
            name,
            ...(password && { password }) // Chỉ cập nhật mật khẩu nếu được cung cấp
          };
        }
        return u;
      });
      
      // Lưu lại danh sách người dùng đã cập nhật
      // Lưu ý: Trong ứng dụng thực tế, bạn cần gọi API để cập nhật dữ liệu trên server
      
      // Cập nhật thông tin người dùng trong localStorage
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('userInfo') || '{}'),
        name,
        email
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
          <h2>User Profile</h2>
          {message && <Message variant="danger">{message}</Message>}
          {error && <Message variant="danger">{error}</Message>}
          {success && <Message variant="success">Profile Updated</Message>}
          {loading && <Loader />}
          <Card>
            <Card.Body>
              <Form onSubmit={submitHandler}>
                <Form.Group controlId='name'>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type='name'
                    placeholder='Enter name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId='email' className='py-3'>
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Enter email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId='password'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Enter password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId='confirmPassword' className='py-3'>
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type='password'
                    placeholder='Confirm password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Button type='submit' variant='primary' className='mt-3'>
                  Update
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
