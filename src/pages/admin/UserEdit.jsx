import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
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

        // Fetch user data from database.json
        const response = await fetch('/database.json');
        const data = await response.json();
        const user = data.users?.find(u => u.id === userId);
        
        if (user) {
          setName(user.name);
          setEmail(user.email);
          setIsAdmin(user.isAdmin || false);
        } else {
          setError('User not found');
        }
        setIsAdmin(data.isAdmin);
        setLoading(false);
      } catch (error) {
        toast.error('Error fetching user');
        setLoading(false);
      }
    };

    if (userInfo && userInfo.isAdmin) {
      fetchUser();
    } else {
      navigate('/login');
    }
  }, [userId, userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      // Get current users from database.json
      const response = await fetch('/database.json');
      const data = await response.json();
      
      // Update user in the list
      const updatedUsers = data.users.map(user => 
        user.id === userId 
          ? { ...user, name, email, isAdmin }
          : user
      );
      
      // In a real app, you would make an API call here to update the user on the server
      // For now, we'll just update the UI and show a success message
      
      toast.success('User updated successfully');
      navigate('/admin/userlist');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container>
        <div>Loading...</div>
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
      <Link to="/admin/userlist" className="btn btn-light my-3">
        Go Back
      </Link>
      <h1>Edit User</h1>
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Name</Form.Label>
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

                <Form.Group controlId="isadmin" className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Is Admin"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="mt-3">
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

export default UserEdit;
