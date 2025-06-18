import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
  ListGroupItem,
} from "react-bootstrap";
import Rating from "../components/Rating";
import { useAppContext } from "../context/AppContext";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import formatPrice from "../utils/formatPrice";

const ProductDetail = () => {
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverConnected, setServerConnected] = useState(false);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const { userInfo, addToCart } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        // Check server connection first
        try {
          const response = await fetch('http://localhost:5678/api/health');
          if (!response.ok) {
            throw new Error('Server is not running');
          }
          setServerConnected(true);
        } catch (err) {
          setServerConnected(false);
          setError("Server không hoạt động. Vui lòng khởi động server trước.");
          setLoading(false);
          return;
        }
        const response = await fetch(`http://localhost:5678/api/products/${id}`);
        const data = await response.json();
        if (!data.product) {
          setError("Không tìm thấy sản phẩm");
          setLoading(false);
          return;
        }
        setProduct(data.product);
      } catch (err) {
        setError(err.message || "Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch reviews separately
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id || !serverConnected) return;
      
      try {
        setReviewsLoading(true);
        setReviewsError("");
        
        const response = await fetch(`http://localhost:5678/api/products/${id}/reviews`);
        const data = await response.json();
        
        setReviews(data.reviews || []);
      } catch (err) {
        setReviewsError("Không thể tải đánh giá");
        console.error("Error fetching reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    
    fetchReviews();
  }, [id, serverConnected]);

  const addToCartHandler = () => {
    addToCart(product, Number(qty));
    toast.success(`${product.name} đã thêm vào giỏ hàng`);
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const review = {
        name: userInfo.name,
        rating: Number(rating),
        comment,
        userId: userInfo.id
      };
      
      const response = await fetch(`http://localhost:5678/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });
      
      if (!response.ok) throw new Error('Failed to submit review');
      
      // Get updated data
      const data = await response.json();
      
      // Update product and reviews
      if (data.product) {
        setProduct(data.product);
      }
      
      // Refresh reviews
      const reviewsResponse = await fetch(`http://localhost:5678/api/products/${id}/reviews`);
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData.reviews || []);
      
      // Reset form
      setRating(0);
      setComment("");
      
      alert("Đánh giá đã được gửi thành công");
    } catch (err) {
      alert("Không thể gửi đánh giá: " + (err.message || "Lỗi không xác định"));
    }
  };

  if (!serverConnected) {
    return (
      <Message variant="danger">
        Server không hoạt động. Vui lòng khởi động server trước.
      </Message>
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="danger">{error}</Message>;
  }

  if (!product) {
    return <Message variant="danger">Không tìm thấy sản phẩm</Message>;
  }

  return (
    <div>
      <Link className="btn btn-light my-3" to="/">
        Quay lại
      </Link>
      <Row>
        <Col md={6}>
          <Image src={product.image || "https://via.placeholder.com/600x400?text=No+Image"} alt={product.name} fluid />
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroupItem>
              <h3>{product.name}</h3>
            </ListGroupItem>
            <ListGroupItem>
              <Rating
                value={product.rating || 0}
                text={`${product.numReviews || 0} đánh giá`}
              />
            </ListGroupItem>
            <ListGroupItem>Giá: {formatPrice(product.price)}</ListGroupItem>
            <ListGroupItem>
              Mô tả: {product.description}
            </ListGroupItem>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <ListGroup variant="flush">
              <ListGroupItem>
                <Row>
                  <Col>Giá:</Col>
                  <Col>
                    <strong>{formatPrice(product.price)}</strong>
                  </Col>
                </Row>
              </ListGroupItem>

              <ListGroupItem>
                <Row>
                  <Col>Trạng thái:</Col>
                  <Col>
                    {product.countInStock > 0 ? "Còn hàng" : "Hết hàng"}
                  </Col>
                </Row>
              </ListGroupItem>

              {product.countInStock > 0 && (
                <ListGroupItem>
                  <Row>
                    <Col>Số lượng</Col>
                    <Col>
                      <Form.Control
                        as="select"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                      >
                        {[...Array(product.countInStock).keys()].map(
                          (x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          )
                        )}
                      </Form.Control>
                    </Col>
                  </Row>
                </ListGroupItem>
              )}

              <ListGroupItem>
                <Button
                  onClick={addToCartHandler}
                  className="btn-block"
                  type="button"
                  disabled={product.countInStock === 0}
                >
                  Thêm vào giỏ hàng
                </Button>
              </ListGroupItem>
            </ListGroup>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={6}>
          <h2>Đánh giá</h2>
          {reviewsLoading ? (
            <Loader />
          ) : reviewsError ? (
            <Message variant="danger">{reviewsError}</Message>
          ) : reviews.length === 0 ? (
            <Message>Chưa có đánh giá</Message>
          ) : (
            <ListGroup variant="flush">
              {reviews.map((review) => (
                <ListGroupItem key={review.id}>
                  <strong>{review.name}</strong>
                  <Rating value={review.rating} />
                  <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                  <p>{review.comment}</p>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
          
          <ListGroupItem className="mt-4">
            <h2>Viết đánh giá</h2>
            {userInfo ? (
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="rating">
                  <Form.Label>Đánh giá</Form.Label>
                  <Form.Control
                    as="select"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="">Chọn...</option>
                    <option value="1">1 - Kém</option>
                    <option value="2">2 - Tạm được</option>
                    <option value="3">3 - Tốt</option>
                    <option value="4">4 - Rất tốt</option>
                    <option value="5">5 - Xuất sắc</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="comment">
                  <Form.Label>Nhận xét</Form.Label>
                  <Form.Control
                    as="textarea"
                    row="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></Form.Control>
                </Form.Group>
                <Button
                  disabled={loading}
                  type="submit"
                  variant="primary"
                  className="mt-3"
                >
                  Gửi đánh giá
                </Button>
              </Form>
            ) : (
              <Message>
                Vui lòng <Link to="/login">đăng nhập</Link> để viết đánh giá{" "}
              </Message>
            )}
          </ListGroupItem>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail;
