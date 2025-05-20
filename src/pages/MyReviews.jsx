import React, { useState, useEffect } from "react";
import { Table, Button, Container, Row, Col, Card } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { FaEdit, FaTrash, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import Message from "../components/Message";
import Loader from "../components/Loader";
import databaseData from "../data/database.json";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();
  const { userInfo } = useAppContext();

  useEffect(() => {
    const fetchReviews = () => {
      try {
        setLoading(true);

        // Nếu không có userInfo, chuyển hướng đến trang đăng nhập
        if (!userInfo) {
          navigate("/login");
          return;
        }

        // Tạo dữ liệu mẫu cho đánh giá
        // Trong ứng dụng thực tế, bạn sẽ lấy dữ liệu từ API
        const sampleReviews = [
          {
            id: 1,
            productId: 1,
            productName: "Gaming PC Pro",
            productImage: "https://via.placeholder.com/300x200?text=Gaming+PC",
            rating: 5,
            comment:
              "Sản phẩm tuyệt vời, hiệu năng cao, đáp ứng mọi nhu cầu gaming của tôi.",
            createdAt: "2023-06-15T00:00:00.000Z",
          },
          {
            id: 2,
            productId: 2,
            productName: "Office PC Plus",
            productImage: "https://via.placeholder.com/300x200?text=Office+PC",
            rating: 4,
            comment: "Máy tính văn phòng tốt, chạy mượt các ứng dụng Office.",
            createdAt: "2023-07-10T00:00:00.000Z",
          },
        ];

        setReviews(sampleReviews);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải đánh giá của bạn");
        console.error("Lỗi khi tải đánh giá:", err);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userInfo, navigate]);

  const deleteHandler = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      try {
        setDeleteLoading(true);

        // Xóa đánh giá khỏi danh sách
        const updatedReviews = reviews.filter((review) => review.id !== id);
        setReviews(updatedReviews);

        toast.success("Đã xóa đánh giá thành công");
        setDeleteLoading(false);
      } catch (err) {
        toast.error("Có lỗi xảy ra khi xóa đánh giá");
        console.error("Lỗi khi xóa đánh giá:", err);
        setDeleteLoading(false);
      }
    }
  };

  // Hàm hiển thị số sao dựa trên rating
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        color={i < rating ? "#ffc107" : "#e4e5e9"}
        style={{ marginRight: "2px" }}
      />
    ));
  };

  return (
    <Container>
      <Row className="align-items-center mb-4">
        <Col>
          <h1>Đánh Giá Của Tôi</h1>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : reviews.length === 0 ? (
        <Message>
          Bạn chưa có đánh giá nào. <Link to="/products">Mua sắm ngay</Link>
        </Message>
      ) : (
        <Row>
          {reviews.map((review) => (
            <Col md={6} lg={4} className="mb-4" key={review.id}>
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>{renderStars(review.rating)}</div>
                  <div>
                    <Button
                      variant="light"
                      className="btn-sm"
                      onClick={() => navigate(`/products/${review.productId}`)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      className="btn-sm ms-2"
                      onClick={() => deleteHandler(review.id)}
                      disabled={deleteLoading}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex mb-3">
                    <img
                      src={review.productImage}
                      alt={review.productName}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        marginRight: "15px",
                      }}
                    />
                    <div>
                      <h5>{review.productName}</h5>
                      <small className="text-muted">
                        Đánh giá vào:{" "}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <Card.Text>{review.comment}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyReviews;
