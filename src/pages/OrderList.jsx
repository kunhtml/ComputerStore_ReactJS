import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col, Badge } from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const API_BASE = 'http://localhost:5678/api';
const REFRESH_INTERVAL = 30000; // Refresh every 30 seconds

const OrderList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(loading => loading ? loading : false); // Only set to true on initial load
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      if (!userInfo) {
        navigate('/login');
        return;
      }
      const response = await fetch(`${API_BASE}/orders?userId=${userInfo.id}`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Lỗi khi tải danh sách đơn hàng');
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Set up auto-refresh interval
    const intervalId = setInterval(() => {
      fetchOrders();
    }, REFRESH_INTERVAL);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate]);

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status && status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Row>
      <Col md={12}>
        <h2>Đơn hàng của tôi</h2>
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : (
          <>
            <p className="text-muted small">Trạng thái đơn hàng tự động cập nhật mỗi 30 giây</p>
            <Table striped bordered hover responsive className='table-sm'>
              <thead>
                <tr>
                  <th>MÃ ĐƠN</th>
                  <th>NGÀY ĐẶT</th>
                  <th>TỔNG TIỀN</th>
                  <th>TRẠNG THÁI</th>
                  <th>THANH TOÁN</th>
                  <th>GIAO HÀNG</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">Không có đơn hàng nào</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id || order._id}>
                      <td>{order.id || order._id}</td>
                      <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Không có'}</td>
                      <td>{Math.round(parseFloat(order.totalPrice || 0)).toLocaleString('vi-VN')}₫</td>
                      <td>
                        <Badge bg={getStatusColor(order.status)}>
                          {order.status?.toLowerCase() === 'pending' ? 'Chờ xử lý' :
                           order.status?.toLowerCase() === 'processing' ? 'Đang xử lý' :
                           order.status?.toLowerCase() === 'shipped' ? 'Đang giao' :
                           order.status?.toLowerCase() === 'delivered' ? 'Đã giao' :
                           order.status?.toLowerCase() === 'cancelled' ? 'Đã hủy' :
                           order.status || 'Chờ xử lý'}
                        </Badge>
                      </td>
                      <td>
                        {order.isPaid ? (
                          order.paidAt ? new Date(order.paidAt).toLocaleDateString('vi-VN') : 'Đã thanh toán'
                        ) : (
                          <i className='fas fa-times' style={{ color: 'red' }}></i>
                        )}
                      </td>
                      <td>
                        {order.isDelivered ? (
                          order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('vi-VN') : 'Đã giao'
                        ) : (
                          <i className='fas fa-times' style={{ color: 'red' }}></i>
                        )}
                      </td>
                      <td>
                        <Link to={`/order/${order.id || order._id}`}>
                          <Button variant='light' className='btn-sm'>
                            Chi tiết
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </>
        )}
      </Col>
    </Row>
  );
};

export default OrderList;
