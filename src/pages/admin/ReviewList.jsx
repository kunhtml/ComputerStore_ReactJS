import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Modal,
  Card,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaTrash,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaSearch,
} from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { useAppContext } from "../../context/AppContext";

const ReviewList = () => {
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [products, setProducts] = useState([]);

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [editedRating, setEditedRating] = useState(5);
  const [editedComment, setEditedComment] = useState("");

  const navigate = useNavigate();
  const { userInfo } = useAppContext();

  // Fetch all reviews from all products
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        // Check if user is logged in and is admin
        if (!userInfo) {
          navigate("/login");
          return;
        }

        if (!userInfo.isAdmin) {
          navigate("/");
          return;
        }

        // Get products from server API
        const response = await fetch("http://localhost:5678/api/database");
        const data = await response.json();
        const productsData = data.products || [];
        setProducts(productsData);

        // Extract all reviews from all products
        const reviews = [];
        productsData.forEach((product) => {
          if (product.reviews && Array.isArray(product.reviews)) {
            product.reviews.forEach((review) => {
              reviews.push({
                id: `${product.id}-${review.name}-${Date.now()}`, // Generate a unique ID
                productId: product.id,
                productName: product.name,
                productImage: product.image,
                name: review.name,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt || new Date().toISOString(),
              });
            });
          }
        });

        setAllReviews(reviews);
        setFilteredReviews(reviews);
        setError("");
      } catch (err) {
        setError("Không thể tải đánh giá");
        console.error("Lỗi khi tải đánh giá:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userInfo, navigate]);

  // Filter reviews when search term or filters change
  useEffect(() => {
    let result = [...allReviews];

    // Apply search term filter
    if (searchTerm) {
      result = result.filter(
        (review) =>
          review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply rating filter
    if (filterRating) {
      result = result.filter(
        (review) => review.rating === parseInt(filterRating)
      );
    }

    // Apply product filter
    if (filterProduct) {
      result = result.filter(
        (review) => review.productId === parseInt(filterProduct)
      );
    }

    setFilteredReviews(result);
  }, [searchTerm, filterRating, filterProduct, allReviews]);

  // Delete review handler
  const deleteHandler = async (reviewId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      try {
        setDeleteLoading(true);

        // Extract product ID and review info from the review ID
        const [productId, reviewerName] = reviewId.split("-");

        // Find the product
        const productIndex = products.findIndex(
          (p) => p.id === parseInt(productId)
        );

        if (productIndex === -1) {
          toast.error("Không tìm thấy sản phẩm");
          return;
        }

        // Create a copy of the products array
        const updatedProducts = [...products];

        // Find the review in the product
        const reviewIndex = updatedProducts[productIndex].reviews.findIndex(
          (r) => r.name === reviewerName
        );

        if (reviewIndex === -1) {
          toast.error("Không tìm thấy đánh giá");
          return;
        }

        // Remove the review from the product
        updatedProducts[productIndex].reviews.splice(reviewIndex, 1);

        // Update the product's rating and numReviews
        const reviews = updatedProducts[productIndex].reviews;
        updatedProducts[productIndex].numReviews = reviews.length;

        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          updatedProducts[productIndex].rating = totalRating / reviews.length;
        } else {
          updatedProducts[productIndex].rating = 0;
        }

        // Update the products state
        setProducts(updatedProducts);

        // Update the reviews state
        const updatedReviews = allReviews.filter((r) => r.id !== reviewId);
        setAllReviews(updatedReviews);

        // Save products with updated reviews to database.json through API
        try {
          await fetch("http://localhost:5678/api/products", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ products: updatedProducts }),
          });
        } catch (error) {
          console.error("Error saving to database:", error);
          throw error;
        }

        toast.success("Đã xóa đánh giá thành công");
      } catch (err) {
        toast.error("Có lỗi xảy ra khi xóa đánh giá");
        console.error("Lỗi khi xóa đánh giá:", err);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Edit review handlers
  const openEditModal = (review) => {
    setCurrentReview(review);
    setEditedRating(review.rating);
    setEditedComment(review.comment);
    setShowEditModal(true);
  };

  const handleEditReview = async () => {
    try {
      if (!currentReview) return;

      // Extract product ID from the review ID
      const [productId] = currentReview.id.split("-");

      // Find the product
      const productIndex = products.findIndex(
        (p) => p.id === parseInt(productId)
      );

      if (productIndex === -1) {
        toast.error("Không tìm thấy sản phẩm");
        return;
      }

      // Create a copy of the products array
      const updatedProducts = [...products];

      // Find the review in the product
      const reviewIndex = updatedProducts[productIndex].reviews.findIndex(
        (r) => r.name === currentReview.name
      );

      if (reviewIndex === -1) {
        toast.error("Không tìm thấy đánh giá");
        return;
      }

      // Update the review
      updatedProducts[productIndex].reviews[reviewIndex] = {
        ...updatedProducts[productIndex].reviews[reviewIndex],
        rating: editedRating,
        comment: editedComment,
      };

      // Update the product's rating
      const reviews = updatedProducts[productIndex].reviews;
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      updatedProducts[productIndex].rating = totalRating / reviews.length;

      // Update the products state
      setProducts(updatedProducts);

      // Update the reviews state
      const updatedReviews = allReviews.map((r) => {
        if (r.id === currentReview.id) {
          return {
            ...r,
            rating: editedRating,
            comment: editedComment,
          };
        }
        return r;
      });

      setAllReviews(updatedReviews);

      // Save products with updated reviews to database.json through API
      try {
        await fetch("http://localhost:5678/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ products: updatedProducts }),
        });
      } catch (error) {
        console.error("Error saving to database:", error);
        throw error;
      }

      toast.success("Đã cập nhật đánh giá thành công");
      setShowEditModal(false);
    } catch (err) {
      toast.error("Có lỗi xảy ra khi cập nhật đánh giá");
      console.error("Lỗi khi cập nhật đánh giá:", err);
    }
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-warning" />);
      }
    }

    return stars;
  };

  return (
    <Container>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Quản lý đánh giá</h1>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo tên, nội dung hoặc sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Form.Select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
              >
                <option value="">Lọc theo đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
              >
                <option value="">Lọc theo sản phẩm</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : filteredReviews.length === 0 ? (
        <Message>Không tìm thấy đánh giá nào</Message>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Người đánh giá</th>
              <th>Đánh giá</th>
              <th>Nội dung</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((review) => (
              <tr key={review.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src={review.productImage}
                      alt={review.productName}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        marginRight: "10px",
                      }}
                    />
                    <span>{review.productName}</span>
                  </div>
                </td>
                <td>{review.name}</td>
                <td>{renderStars(review.rating)}</td>
                <td>
                  {review.comment.length > 50
                    ? `${review.comment.substring(0, 50)}...`
                    : review.comment}
                </td>
                <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button
                    variant="primary"
                    className="btn-sm me-2"
                    onClick={() => openEditModal(review)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() => deleteHandler(review.id)}
                    disabled={deleteLoading}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Edit Review Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa đánh giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentReview && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Sản phẩm</Form.Label>
                <Form.Control
                  type="text"
                  value={currentReview.productName}
                  disabled
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Người đánh giá</Form.Label>
                <Form.Control type="text" value={currentReview.name} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Đánh giá</Form.Label>
                <Form.Select
                  value={editedRating}
                  onChange={(e) => setEditedRating(Number(e.target.value))}
                >
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nội dung</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleEditReview}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReviewList;
