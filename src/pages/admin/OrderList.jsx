import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Button, Container, Row, Col, Card, Tabs, Tab } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaEdit, FaChartBar, FaListAlt } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import SalesChart from "../../components/SalesChart";
import { useAppContext } from "../../context/AppContext";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingDeliver, setLoadingDeliver] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  const navigate = useNavigate();
  const { userInfo } = useAppContext();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Fetch orders from API
        const response = await fetch('http://localhost:5678/api/database');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const ordersList = data.orders || [];
        
        setOrders(ordersList);
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
  }, [userInfo, navigate]);

  const deliverHandler = async (order) => {
    if (!window.confirm("Bạn có chắc chắn muốn đánh dấu đơn hàng này là đã giao không?")) {
      return;
    }

    try {
      setLoadingDeliver(true);
      
      // Lấy dữ liệu hiện tại
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      
      // Cập nhật trạng thái đơn hàng
      const updatedOrders = (data.orders || []).map(o => {
        if (o.id === order.id) {
          return {
            ...o,
            isDelivered: true,
            deliveredAt: new Date().toISOString(),
            status: 'Delivered'
          };
        }
        return o;
      });
      
      // Lưu vào database
      await fetch('http://localhost:5678/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders: updatedOrders }),
      });
      
      // Cập nhật state
      setOrders(updatedOrders);
      
      toast.success("Đơn hàng đã được đánh dấu là đã giao");
    } catch (err) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng");
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
    } finally {
      setLoadingDeliver(false);
    }
  };

  return (
    <Container>
      <h1 className="my-4">Order Management</h1>
      
      {loading ? (
        <div className="text-center py-5">
          <Loader />
        </div>
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Tabs
            id="order-management-tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="dashboard" title={<span><FaChartBar className="me-2" />Dashboard</span>}>
              <SalesChart orders={orders} />
            </Tab>
            <Tab eventKey="orders" title={<span><FaListAlt className="me-2" />Order List</span>}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Table striped bordered hover responsive className="table-sm mb-0">
                    <thead>
                      <tr className="table-primary">
                        <th>ID</th>
                        <th>USER</th>
                        <th>DATE</th>
                        <th>TOTAL</th>
                        <th>STATUS</th>
                        <th>PAID</th>
                        <th>DELIVERED</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.userName}</td>
                          <td>{order.createdAt?.substring(0, 10)}</td>
                          <td>${order.totalPrice}</td>
                          <td>
                            <span className={
                              order.status === 'Delivered' ? 'badge bg-success' :
                              order.status === 'Paid' ? 'badge bg-info' :
                              'badge bg-warning'
                            }>
                              {order.status || 'Pending'}
                            </span>
                          </td>
                          <td className="text-center">
                            {order.isPaid ? (
                              <span className="text-success">
                                <FaCheck /> {order.paidAt?.substring(0, 10)}
                              </span>
                            ) : (
                              <span className="text-danger">
                                <FaTimes />
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            {order.isDelivered ? (
                              <span className="text-success">
                                <FaCheck /> {order.deliveredAt?.substring(0, 10)}
                              </span>
                            ) : (
                              <span className="text-danger">
                                <FaTimes />
                              </span>
                            )}
                          </td>
                          <td>
                            <Link to={`/order/${order.id}`}>
                              <Button variant="primary" className="btn-sm">
                                <FaEdit className="me-1" /> Details
                              </Button>
                            </Link>
                            {order && !order.isDelivered && (
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
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </>
      )}
    </Container>
  );
};

export default OrderList;
