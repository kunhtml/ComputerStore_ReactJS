import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Button, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaEdit } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { useAppContext } from "../../context/AppContext";
import databaseData from "../../data/database.json";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingDeliver, setLoadingDeliver] = useState(false);

  const navigate = useNavigate();
  const { userInfo } = useAppContext();

  useEffect(() => {
    const fetchOrders = () => {
      try {
        setLoading(true);
        // Sử dụng dữ liệu từ database.json đã import
        setOrders(databaseData.orders || []);

        // Nếu không có đơn hàng, tạo một số đơn hàng mẫu
        if (!databaseData.orders || databaseData.orders.length === 0) {
          // Tạo dữ liệu mẫu cho đơn hàng
          const sampleOrders = [
            {
              _id: "1",
              user: { name: "John Doe", email: "john@example.com" },
              orderItems: [
                {
                  name: "Gaming PC Pro",
                  qty: 1,
                  image: "https://via.placeholder.com/300x200?text=Gaming+PC",
                  price: 1999.99,
                  product: "1",
                },
              ],
              shippingAddress: {
                address: "123 Main St",
                city: "Boston",
                postalCode: "02108",
                country: "USA",
              },
              paymentMethod: "PayPal",
              itemsPrice: 1999.99,
              taxPrice: 200.0,
              shippingPrice: 100.0,
              totalPrice: 2299.99,
              isPaid: true,
              paidAt: "2023-06-01T00:00:00.000Z",
              isDelivered: false,
              createdAt: "2023-05-30T00:00:00.000Z",
            },
            {
              _id: "2",
              user: { name: "Admin User", email: "admin@example.com" },
              orderItems: [
                {
                  name: "Office PC Plus",
                  qty: 2,
                  image: "https://via.placeholder.com/300x200?text=Office+PC",
                  price: 899.99,
                  product: "2",
                },
              ],
              shippingAddress: {
                address: "456 Park Ave",
                city: "New York",
                postalCode: "10001",
                country: "USA",
              },
              paymentMethod: "Credit Card",
              itemsPrice: 1799.98,
              taxPrice: 180.0,
              shippingPrice: 0.0,
              totalPrice: 1979.98,
              isPaid: true,
              paidAt: "2023-06-05T00:00:00.000Z",
              isDelivered: true,
              deliveredAt: "2023-06-07T00:00:00.000Z",
              createdAt: "2023-06-04T00:00:00.000Z",
            },
          ];

          setOrders(sampleOrders);
        }

        setError("");
      } catch (err) {
        setError("Không thể tải danh sách đơn hàng");
        console.error("Lỗi khi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    // Kiểm tra đăng nhập và quyền admin
    if (!userInfo) {
      navigate("/login");
    } else if (!userInfo.isAdmin) {
      navigate("/");
    } else {
      fetchOrders();
    }
  }, [navigate, userInfo]);

  const deliverHandler = (order) => {
    if (
      window.confirm("Bạn có chắc chắn muốn đánh dấu đơn hàng này đã giao?")
    ) {
      try {
        setLoadingDeliver(true);

        // Cập nhật trạng thái đơn hàng
        const updatedOrders = orders.map((o) =>
          o._id === order._id
            ? { ...o, isDelivered: true, deliveredAt: new Date().toISOString() }
            : o
        );

        // Cập nhật danh sách đơn hàng hiển thị
        setOrders(updatedOrders);

        toast.success("Đã cập nhật trạng thái đơn hàng");
      } catch (err) {
        toast.error("Có lỗi xảy ra khi cập nhật đơn hàng");
        console.error("Lỗi khi cập nhật đơn hàng:", err);
      } finally {
        setLoadingDeliver(false);
      }
    }
  };

  return (
    <Container>
      <Row className="align-items-center">
        <Col>
          <h1>Orders</h1>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user && order.user.name}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>${order.totalPrice}</td>
                <td>
                  {order.isPaid ? (
                    order.paidAt.substring(0, 10)
                  ) : (
                    <FaTimes style={{ color: "red" }} />
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    order.deliveredAt.substring(0, 10)
                  ) : (
                    <FaTimes style={{ color: "red" }} />
                  )}
                </td>
                <td>
                  <Link to={`/order/${order._id}`}>
                    <Button variant="light" className="btn-sm">
                      <FaEdit />
                    </Button>
                  </Link>
                  {!order.isDelivered && (
                    <Button
                      variant="success"
                      className="btn-sm ms-2"
                      onClick={() => deliverHandler(order)}
                      disabled={loadingDeliver}
                    >
                      <FaCheck />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OrderList;
