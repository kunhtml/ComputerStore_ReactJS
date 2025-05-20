import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { getUserById } from '../../utils/databaseUtils';
import axios from '../../services/axiosConfig';

const UserEdit = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        setUserInfo(userInfo);

        if (!userInfo || !userInfo.isAdmin) {
          navigate('/login');
          return;
        }

        // Fetch user data using the utility function
        const user = await getUserById(parseInt(userId));
        
        if (user) {
          setName(user.name);
          setEmail(user.email);
          setIsAdmin(user.isAdmin || false);
        } else {
          setError('User not found');
        }
        setLoading(false);
      } catch (error) {
        toast.error('Error fetching user');
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Get current database
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      const users = data.users || [];

      // Check if email already exists (excluding current user)
      const emailExists = users.some(user => 
        user.id !== parseInt(userId) && user.email.toLowerCase() === email.toLowerCase()
      );

      if (emailExists) {
        toast.error('Email already in use by another user');
        setLoading(false);
        return;
      }

      // Find and update the user
      const updatedUsers = users.map(user => {
        if (user.id === parseInt(userId)) {
          return { ...user, name, email, isAdmin };
        }
        return user;
      });

      // Save updated users to database
      await fetch('http://localhost:5678/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ users: updatedUsers }),
      });

      toast.success('User updated successfully');
      navigate('/admin/userlist');
    } catch (error) {
      toast.error('Error updating user');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="alert alert-danger">{error}</div>
        <Link to="/admin/userlist" className="btn btn-light my-3">
          Go Back
        </Link>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Edit User</h1>
        <Button variant="secondary" onClick={() => navigate('/admin/userlist')}>
          <FaArrowLeft className="me-2" /> Back to Users
        </Button>
      </div>
      
      <Row className='justify-content-md-center'>
        <Col xs={12} md={8}>
          <Card className='p-4 rounded shadow-sm'>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <Alert variant='danger'>{error}</Alert>
              ) : (
                <Form onSubmit={submitHandler}>
                  <Form.Group controlId='name' className='mb-4'>
                    <Form.Label><FaUser className="me-2" /> Name</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='Enter name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="form-control-lg"
                    />
                  </Form.Group>

                  <Form.Group controlId='email' className='mb-4'>
                    <Form.Label><FaEnvelope className="me-2" /> Email Address</Form.Label>
                    <Form.Control
                      type='email'
                      placeholder='Enter email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-control-lg"
                    />
                  </Form.Group>

                  <Form.Group controlId='isAdmin' className='mb-4'>
                    <div className="d-flex align-items-center">
                      <Form.Check
                        type='checkbox'
                        label='Admin Privileges'
                        checked={isAdmin}
                        onChange={(e) => setIsAdmin(e.target.checked)}
                        id="admin-checkbox"
                        className="me-2"
                      />
                      {isAdmin ? (
                        <span className="text-success"><FaCheck /> User has admin access</span>
                      ) : (
                        <span className="text-secondary"><FaTimes /> Regular user</span>
                      )}
                    </div>
                  </Form.Group>

                  <div className="d-grid gap-2 mt-4">
                    <Button type='submit' variant='primary' size="lg">
                      Update User
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserEdit;
