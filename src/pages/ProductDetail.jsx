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

const ProductDetail = () => {
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverConnected, setServerConnected] = useState(false);
  const [product, setProduct] = useState(null);

  const { userInfo } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();

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
          setError("Server is not running. Please start the server first.");
          setLoading(false);
          return;
        }
        const response = await fetch(`http://localhost:5678/api/products/${id}`);
        const data = await response.json();
        if (!data.product) {
          setError("Product not found");
          setLoading(false);
          return;
        }
        setProduct(data.product);
      } catch (err) {
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    navigate(`/cart/${id}?qty=${qty}`);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const review = {
        name: userInfo.name,
        rating: Number(rating),
        comment,
        createdAt: new Date().toISOString(),
      };
      const response = await fetch(`http://localhost:5678/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });
      if (!response.ok) throw new Error('Failed to submit review');
      // Refresh product data
      const updated = await response.json();
      setProduct(updated.product);
      setRating(0);
      setComment("");
      alert("Review submitted successfully");
    } catch (err) {
      alert("Failed to submit review");
    }
  };

  if (!serverConnected) {
    return (
      <Message variant="danger">
        Server is not running. Please start the server first.
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
    return <Message variant="danger">Product not found</Message>;
  }

  return (
    <div>
      <Link className="btn btn-light my-3" to="/">
        Go Back
      </Link>
      <Row>
        <Col md={6}>
          <Image src={product.image} alt={product.name} fluid />
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroupItem>
              <h3>{product.name}</h3>
            </ListGroupItem>
            <ListGroupItem>
              <Rating
                value={product.rating}
                text={`${product.numReviews} reviews`}
              />
            </ListGroupItem>
            <ListGroupItem>Price: ${product.price}</ListGroupItem>
            <ListGroupItem>
              Description: {product.description}
            </ListGroupItem>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <ListGroup variant="flush">
              <ListGroupItem>
                <Row>
                  <Col>Price:</Col>
                  <Col>
                    <strong>${product.price}</strong>
                  </Col>
                </Row>
              </ListGroupItem>

              <ListGroupItem>
                <Row>
                  <Col>Status:</Col>
                  <Col>
                    {product.countInStock > 0 ? "In Stock" : "Out Of Stock"}
                  </Col>
                </Row>
              </ListGroupItem>

              {product.countInStock > 0 && (
                <ListGroupItem>
                  <Row>
                    <Col>Qty</Col>
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
                  Add To Cart
                </Button>
              </ListGroupItem>
            </ListGroup>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <h2>Reviews</h2>
          {(product.reviews || []).length === 0 && (
            <Message>No Reviews</Message>
          )}
          <ListGroup variant="flush">
            {(product.reviews || []).map((review) => (
              <ListGroupItem key={review.createdAt}>
                <strong>{review.name}</strong>
                <Rating value={review.rating} />
                <p>{review.createdAt.substring(0, 10)}</p>
                <p>{review.comment}</p>
              </ListGroupItem>
            ))}
            <ListGroupItem>
              <h2>Write a Customer Review</h2>
              {userInfo ? (
                <Form onSubmit={submitHandler}>
                  <Form.Group controlId="rating">
                    <Form.Label>Rating</Form.Label>
                    <Form.Control
                      as="select"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="1">1 - Poor</option>
                      <option value="2">2 - Fair</option>
                      <option value="3">3 - Good</option>
                      <option value="4">4 - Very Good</option>
                      <option value="5">5 - Excellent</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group controlId="comment">
                    <Form.Label>Comment</Form.Label>
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
                  >
                    Submit
                  </Button>
                </Form>
              ) : (
                <Message>
                  Please <Link to="/login">sign in</Link> to write a review{" "}
                </Message>
              )}
            </ListGroupItem>
          </ListGroup>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail;
