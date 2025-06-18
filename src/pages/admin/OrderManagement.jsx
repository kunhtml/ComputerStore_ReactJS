import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Spinner, Alert, Form, Modal, Pagination } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE = 'http://localhost:5678/api';
const PAGE_SIZE = 10;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // Fetch debug info once on load
  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await axios.get(`${API_BASE}/orders/debug`);
        setDebugInfo(response.data);
        console.log('Debug info:', response.data);
      } catch (err) {
        console.error('Error fetching debug info:', err);
      }
    };
    fetchDebugInfo();
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Check server health
        const health = await axios.get(`${API_BASE}/health`);
        if (health.data.status !== 'ok') throw new Error('Server not ready');
        
        // Get orders
        const res = await axios.get(`${API_BASE}/orders`, {
          params: { 
            q: search, 
            status, 
            page, 
            limit: PAGE_SIZE, 
            sort: 'createdAt_desc' 
          },
        });
        console.log('Orders response:', res.data);
        
        // Log details of the response for debugging
        if (res.data && Array.isArray(res.data.orders)) {
          console.log(`Received ${res.data.orders.length} orders from API`);
        } else {
          console.error('Expected orders array but got:', res.data);
        }
        
        setOrders(res.data.orders || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(`Không thể kết nối đến server hoặc lấy dữ liệu. Lỗi: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, status, page]);

  // Modal handlers
  const openViewModal = (order) => {
    setCurrentOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentOrder(null);
  };

  // Update order status
  const handleStatusUpdate = async (orderId, newStatus) => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/orders/${orderId}`, { status: newStatus });
      toast.success('Đã cập nhật trạng thái đơn hàng');
      
      // Refetch orders
      const res = await axios.get(`${API_BASE}/orders`, { 
        params: { page, limit: PAGE_SIZE } 
      });
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
      closeModal();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.error || 'Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setSaving(false);
    }
  };

  // Delete order
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
    try {
      await axios.delete(`${API_BASE}/orders/${id}`);
      toast.success('Đã xóa đơn hàng');
      
      // Refetch
      const res = await axios.get(`${API_BASE}/orders`, { 
        params: { page, limit: PAGE_SIZE } 
      });
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error deleting order:', err);
      toast.error(err.response?.data?.error || 'Lỗi khi xóa đơn hàng');
    }
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

  // Helper function to format price
  const formatPrice = (price) => {
    if (typeof price === 'string') {
      return parseFloat(price).toFixed(2);
    }
    return price ? price.toFixed(2) : "0.00";
  };

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col><h3>Quản lý đơn hàng</h3></Col>
      </Row>
      
      <Row className="mb-3 g-2">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng hoặc khách hàng..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </Col>
        <Col md={3}>
          <Form.Select 
            value={status} 
            onChange={e => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ xử lý</option>
            <option value="Processing">Đang xử lý</option>
            <option value="Shipped">Đang giao</option>
            <option value="Delivered">Đã giao</option>
            <option value="Cancelled">Đã hủy</option>
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
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center">Không tìm thấy đơn hàng</td></tr>
              ) : orders.map((order, idx) => (
                <tr key={order.id}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{order.id}</td>
                  <td>{order.userName || 'N/A'}</td>
                  <td>{Math.round(parseFloat(order.totalPrice || order.total || 0)).toLocaleString('vi-VN')}₫</td>
                  <td>
                    <span className={`badge bg-${getStatusColor(order.status)}`}>
                      {order.status === 'Pending' ? 'Chờ xử lý' :
                       order.status === 'Processing' ? 'Đang xử lý' :
                       order.status === 'Shipped' ? 'Đang giao' :
                       order.status === 'Delivered' ? 'Đã giao' :
                       order.status === 'Cancelled' ? 'Đã hủy' :
                       order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="info" 
                      className="me-2" 
                      onClick={() => openViewModal(order)}
                    >
                      Xem
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(order.id)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {totalPages > 1 && <Pagination>{paginationItems}</Pagination>}
        </>
      )}

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrder && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Thông tin đơn hàng</h5>
                  <p><strong>Mã đơn hàng:</strong> {currentOrder.id}</p>
                  <p><strong>Ngày đặt:</strong> {new Date(currentOrder.createdAt).toLocaleString('vi-VN')}</p>
                  <p><strong>Trạng thái:</strong> {currentOrder.status === 'Pending' ? 'Chờ xử lý' :
                                                   currentOrder.status === 'Processing' ? 'Đang xử lý' :
                                                   currentOrder.status === 'Shipped' ? 'Đang giao' :
                                                   currentOrder.status === 'Delivered' ? 'Đã giao' :
                                                   currentOrder.status === 'Cancelled' ? 'Đã hủy' :
                                                   currentOrder.status}</p>
                  <p><strong>Tổng tiền:</strong> {Math.round(parseFloat(currentOrder.totalPrice || currentOrder.total || 0)).toLocaleString('vi-VN')}₫</p>
                </Col>
                <Col md={6}>
                  <h5>Thông tin khách hàng</h5>
                  <p><strong>Tên:</strong> {currentOrder.userName || 'Không có'}</p>
                  <p><strong>Email:</strong> {currentOrder.userEmail || 'Không có'}</p>
                </Col>
              </Row>
              <h5>Sản phẩm đã đặt</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.orderItems && currentOrder.orderItems.length > 0 ? (
                    currentOrder.orderItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name || 'Không có'}</td>
                        <td>{Math.round(parseFloat(item.price)).toLocaleString('vi-VN')}₫</td>
                        <td>{item.qty}</td>
                        <td>{Math.round(parseFloat(item.price * item.qty)).toLocaleString('vi-VN')}₫</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">Không có sản phẩm</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <Form.Group className="mb-3">
                <Form.Label>Cập nhật trạng thái</Form.Label>
                <Form.Select
                  value={currentOrder.status}
                  onChange={(e) => handleStatusUpdate(currentOrder.id, e.target.value)}
                  disabled={saving}
                >
                  <option value="Pending">Chờ xử lý</option>
                  <option value="Processing">Đang xử lý</option>
                  <option value="Shipped">Đang giao</option>
                  <option value="Delivered">Đã giao</option>
                  <option value="Cancelled">Đã hủy</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Đóng</Button>
          {saving && <Spinner animation="border" size="sm" />}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

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

export default OrderManagement; 