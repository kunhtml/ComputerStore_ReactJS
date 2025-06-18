import React, { useState, useEffect } from "react";
import { Table, Button, Container, Row, Col, Card, Form, Modal } from "react-bootstrap";
import { FaEdit, FaTrash, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import Rating from "../../components/Rating";

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const navigate = useNavigate();
  const { userInfo } = useAppContext();

  useEffect(() => {
    // Redirect if not logged in
    if (!userInfo) {
      navigate("/login");
      return;
    }
    
    fetchUserReviews();
  }, [userInfo, navigate]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch products first to get their details
      const productsResponse = await fetch('http://localhost:5678/api/products');
      const productsData = await productsResponse.json();
      setProducts(productsData.products || []);

      // Fetch all reviews
      const reviewsResponse = await fetch('http://localhost:5678/api/reviews');
      if (!reviewsResponse.ok) {
        throw new Error("Failed to fetch reviews");
      }
      
      const reviewsData = await reviewsResponse.json();
      
      // Filter reviews for the current user
      const userReviews = (reviewsData.reviews || []).filter(
        review => review.userId === userInfo.id
      );
      
      setReviews(userReviews);
      setLoading(false);
    } catch (err) {
      setError("Could not load your reviews. " + err.message);
      setLoading(false);
    }
  };

  const deleteHandler = async (reviewId, productId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        setDeleteLoading(true);

        const response = await fetch(`http://localhost:5678/api/products/${productId}/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error("Failed to delete review");
        }

        // Update local state
        setReviews(reviews.filter(review => review.id !== reviewId));
        toast.success("Review deleted successfully");
      } catch (err) {
        toast.error("Error deleting review: " + err.message);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const openEditModal = (review) => {
    setCurrentReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setShowEditModal(true);
  };

  const handleUpdateReview = async () => {
    if (!editRating) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setUpdateLoading(true);
      
      const response = await fetch(
        `http://localhost:5678/api/products/${currentReview.productId}/reviews/${currentReview.id}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating: Number(editRating),
            comment: editComment
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      const data = await response.json();

      // Update local state
      setReviews(reviews.map(review => (
        review.id === currentReview.id ? data.review : review
      )));

      toast.success("Review updated successfully");
      setShowEditModal(false);
    } catch (err) {
      toast.error("Error updating review: " + err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Get product information by ID
  const getProductInfo = (productId) => {
    return products.find(product => product.id === productId) || {};
  };

  return (
    <Container>
      <Row className="align-items-center mb-4">
        <Col>
          <h1>Đánh giá của tôi</h1>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : reviews.length === 0 ? (
        <Message>
          Bạn chưa viết đánh giá nào. <Link to="/products">Mua sắm ngay</Link> và chia sẻ suy nghĩ của bạn!
        </Message>
      ) : (
        <Row>
          {reviews.map((review) => {
            const product = getProductInfo(review.productId);
            
            return (
              <Col md={6} lg={4} key={review.id} className="mb-4">
                <Card className="shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <div>
                      <Rating value={review.rating} text="" />
                    </div>
                    <div>
                      <Button
                        variant="outline-primary"
                        className="btn-sm me-2"
                        onClick={() => openEditModal(review)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        className="btn-sm"
                        onClick={() => deleteHandler(review.id, review.productId)}
                        disabled={deleteLoading}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex mb-3 align-items-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "70px",
                          height: "70px",
                          objectFit: "cover",
                          marginRight: "15px",
                          borderRadius: "4px"
                        }}
                      />
                      <div>
                        <h5>
                          <Link to={`/products/${review.productId}`} className="text-decoration-none">
                            {product.name}
                          </Link>
                        </h5>
                        <small className="text-muted">
                          Reviewed on: {new Date(review.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    <Card.Text style={{ height: "80px", overflow: "auto" }}>
                      {review.comment}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Edit Review Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentReview && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <Form.Select 
                  value={editRating} 
                  onChange={(e) => setEditRating(e.target.value)}
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateReview}
            disabled={updateLoading}
          >
            {updateLoading ? "Updating..." : "Update Review"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserReviews;
