import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Button, Container, Row, Col, Card, Tabs, Tab } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaEdit, FaChartBar, FaListAlt } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import SalesChart from "../../components/SalesChart";
import { useAppContext } from "../../context/AppContext";
import { getOrders } from '../../utils/databaseUtils';
import axios from "../../services/axiosConfig";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingDeliver, setLoadingDeliver] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  const navigate = useNavigate();
  const { userInfo } = useAppContext();

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        setLoading(true);
        
        // Use the utility function to get orders from src/data/database.json
        const ordersData = await getOrders();
        console.log('Orders loaded from database:', ordersData.length);
        
        if (ordersData.length > 0) {
          setOrders(ordersData);
          setError("");
        } else {
          // Create some sample orders if no orders found
          const sampleOrders = [
            {
              id: 1,
              user: { name: 'John Doe' },
              createdAt: new Date().toISOString(),
              totalPrice: 1999.99,
              isPaid: true,
              isDelivered: true,
              deliveredAt: new Date().toISOString()
            },
            {
              id: 2,
              user: { name: 'Jane Smith' },
              createdAt: new Date().toISOString(),
              totalPrice: 899.99,
              isPaid: true,
              isDelivered: false
            }
          ];
          
          setOrders(sampleOrders);
          setError("Không có đơn hàng nào trong cơ sở dữ liệu. Hiển thị dữ liệu mẫu.");
        }
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
        setError("Không thể tải danh sách đơn hàng");
        
        // Create some sample orders if loading fails
        const sampleOrders = [
          {
            id: 1,
            user: { name: 'John Doe' },
            createdAt: new Date().toISOString(),
            totalPrice: 1999.99,
            isPaid: true,
            isDelivered: true,
            deliveredAt: new Date().toISOString()
          },
          {
            id: 2,
            user: { name: 'Jane Smith' },
            createdAt: new Date().toISOString(),
            totalPrice: 899.99,
            isPaid: true,
            isDelivered: false
          }
        ];
        
        setOrders(sampleOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, []);

  // Xử lý đánh dấu đơn hàng đã giao
  const handleMarkDelivered = async (orderId) => {
    try {
      setLoadingDeliver(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập API call
      
      // Cập nhật trạng thái đơn hàng trong state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, isDelivered: true, deliveredAt: new Date().toISOString() } 
          : order
      ));
      
      toast.success("Đơn hàng đã được đánh dấu là đã giao");
      setLoadingDeliver(false);
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái đơn hàng");
      setLoadingDeliver(false);
    }
  };

  // Tính toán tổng doanh thu
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  
  // Tính toán số lượng đơn hàng đã giao
  const deliveredOrders = orders.filter(order => order.isDelivered).length;
  
  // Tính toán giá trị đơn hàng trung bình
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <Container className="py-3">
      <h1 className="mb-4">Quản lý đơn hàng</h1>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="dashboard" title={<span><FaChartBar className="me-2" />Dashboard</span>}>
          <Row>
            <Col md={12} className="mb-4">
              <SalesChart orders={orders} />
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <h2 className="text-primary">${totalRevenue.toFixed(2)}</h2>
                  <Card.Title>Tổng doanh thu</Card.Title>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <h2 className="text-success">{orders.length}</h2>
                  <Card.Title>Tổng số đơn hàng</Card.Title>
                  <Card.Text className="text-muted">
                    {deliveredOrders} đơn hàng đã giao
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center">
                  <h2 className="text-info">${averageOrderValue.toFixed(2)}</h2>
                  <Card.Title>Giá trị đơn hàng trung bình</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="orders" title={<span><FaListAlt className="me-2" />Danh sách đơn hàng</span>}>
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <>
              {orders.length === 0 ? (
                <Message>Không có đơn hàng nào</Message>
              ) : (
                <Table striped bordered hover responsive className="table-sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>NGƯỜI DÙNG</th>
                      <th>NGÀY ĐẶT</th>
                      <th>TỔNG TIỀN</th>
                      <th>THANH TOÁN</th>
                      <th>GIAO HÀNG</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.user?.name || "N/A"}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>${order.totalPrice?.toFixed(2)}</td>
                        <td>
                          {order.isPaid ? (
                            <FaCheck style={{ color: "green" }} />
                          ) : (
                            <FaTimes style={{ color: "red" }} />
                          )}
                        </td>
                        <td>
                          {order.isDelivered ? (
                            <FaCheck style={{ color: "green" }} />
                          ) : (
                            <Button
                              variant="light"
                              className="btn-sm"
                              onClick={() => handleMarkDelivered(order.id)}
                              disabled={loadingDeliver}
                            >
                              {loadingDeliver ? "Loading..." : "Mark Delivered"}
                            </Button>
                          )}
                        </td>
                        <td>
                          <Link to={`/admin/order/${order.id}`}>
                            <Button variant="light" className="btn-sm">
                              <FaEdit />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default OrderList;
