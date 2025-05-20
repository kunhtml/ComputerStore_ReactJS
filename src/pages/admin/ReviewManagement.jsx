import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Spinner, Alert, Form, Modal, Pagination } from 'react-bootstrap';
import axios from 'axios';

const API_BASE = 'http://localhost:5678/api';
const PAGE_SIZE = 10;

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch reviews
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Check server health
        const health = await axios.get(`${API_BASE}/health`);
        if (health.data.status !== 'ok') throw new Error('Server not ready');
        
        // Get reviews
        const res = await axios.get(`${API_BASE}/reviews`, {
          params: { 
            q: search, 
            rating,
            page, 
            limit: PAGE_SIZE, 
            sort: 'createdAt_desc' 
          },
        });
        setReviews(res.data.reviews || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        setError('Cannot connect to server or fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, rating, page]);

  // Modal handlers
  const openViewModal = (review) => {
    setCurrentReview(review);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentReview(null);
  };

  // Update review status
  const handleStatusUpdate = async (reviewId, newStatus) => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/reviews/${reviewId}`, { status: newStatus });
      // Refetch reviews
      const res = await axios.get(`${API_BASE}/reviews`, { 
        params: { page, limit: PAGE_SIZE } 
      });
      setReviews(res.data.reviews || []);
      setTotal(res.data.total || 0);
      closeModal();
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating review status');
    } finally {
      setSaving(false);
    }
  };

  // Delete review
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`${API_BASE}/reviews/${id}`);
      // Refetch
      const res = await axios.get(`${API_BASE}/reviews`, { 
        params: { page, limit: PAGE_SIZE } 
      });
      setReviews(res.data.reviews || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting review');
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // Pagination
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
        {i}
      </Pagination.Item>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col><h3>Review Management</h3></Col>
      </Row>
      <Row className="mb-3 g-2">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by product or user..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </Col>
        <Col md={3}>
          <Form.Select 
            value={rating} 
            onChange={e => { setRating(e.target.value); setPage(1); }}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </Form.Select>
        </Col>
      </Row>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>User</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan={8} className="text-center">No reviews found</td></tr>
              ) : reviews.map((review, idx) => (
                <tr key={review.id}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{review.product?.name || 'N/A'}</td>
                  <td>{review.user?.name || 'N/A'}</td>
                  <td>
                    <span className="text-warning">
                      {renderStars(review.rating)}
                    </span>
                  </td>
                  <td>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {review.comment}
                    </div>
                  </td>
                  <td>{new Date(review.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge bg-${review.status === 'approved' ? 'success' : review.status === 'pending' ? 'warning' : 'danger'}`}>
                      {review.status}
                    </span>
                  </td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="info" 
                      className="me-2" 
                      onClick={() => openViewModal(review)}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(review.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>{paginationItems}</Pagination>
        </>
      )}

      {/* Review Details Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Review Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentReview && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Review Information</h5>
                  <p><strong>Date:</strong> {new Date(currentReview.createdAt).toLocaleString()}</p>
                  <p><strong>Rating:</strong> <span className="text-warning">{renderStars(currentReview.rating)}</span></p>
                  <p><strong>Status:</strong> {currentReview.status}</p>
                </Col>
                <Col md={6}>
                  <h5>User Information</h5>
                  <p><strong>Name:</strong> {currentReview.user?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {currentReview.user?.email || 'N/A'}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <h5>Product Information</h5>
                  <p><strong>Name:</strong> {currentReview.product?.name || 'N/A'}</p>
                  <p><strong>Price:</strong> ${currentReview.product?.price?.toFixed(2) || 'N/A'}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <h5>Review Comment</h5>
                  <p>{currentReview.comment}</p>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Update Status</Form.Label>
                <Form.Select
                  value={currentReview.status}
                  onChange={(e) => handleStatusUpdate(currentReview.id, e.target.value)}
                  disabled={saving}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReviewManagement; 