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
        setError(`Cannot connect to server or fetch data. Error: ${err.message}`);
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
      toast.success('Order status updated');
      
      // Refetch orders
      const res = await axios.get(`${API_BASE}/orders`, { 
        params: { page, limit: PAGE_SIZE } 
      });
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
      closeModal();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.error || 'Error updating order status');
    } finally {
      setSaving(false);
    }
  };

  // Delete order
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await axios.delete(`${API_BASE}/orders/${id}`);
      toast.success('Order deleted');
      
      // Refetch
      const res = await axios.get(`${API_BASE}/orders`, { 
        params: { page, limit: PAGE_SIZE } 
      });
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error deleting order:', err);
      toast.error(err.response?.data?.error || 'Error deleting order');
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
        <Col><h3>Order Management</h3></Col>
      </Row>
      
      {/* Debug info */}
      {debugInfo && (
        <Alert variant="info" className="mb-3">
          <p><strong>Debug Info:</strong></p>
          <p>Found {debugInfo.ordersCount} orders in database</p>
          <p>Current display state: {orders.length} orders showing of {total} total</p>
          <p>Search: "{search || 'none'}", Status filter: "{status || 'none'}", Page: {page}</p>
          {debugInfo.ordersCount > 0 && (
            <details>
              <summary>Show raw order data</summary>
              <pre style={{maxHeight: '200px', overflow: 'auto'}}>
                {JSON.stringify(debugInfo.rawOrders, null, 2)}
              </pre>
            </details>
          )}
        </Alert>
      )}

      <Row className="mb-3 g-2">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by order ID or user..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </Col>
        <Col md={3}>
          <Form.Select 
            value={status} 
            onChange={e => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
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
                <th>Order ID</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center">No orders found</td></tr>
              ) : orders.map((order, idx) => (
                <tr key={order.id}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{order.id}</td>
                  <td>{order.userName || 'N/A'}</td>
                  <td>${formatPrice(order.totalPrice || order.total || 0)}</td>
                  <td>
                    <span className={`badge bg-${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="info" 
                      className="me-2" 
                      onClick={() => openViewModal(order)}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(order.id)}
                    >
                      Delete
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
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrder && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Order Information</h5>
                  <p><strong>Order ID:</strong> {currentOrder.id}</p>
                  <p><strong>Date:</strong> {new Date(currentOrder.createdAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> {currentOrder.status}</p>
                  <p><strong>Total:</strong> ${formatPrice(currentOrder.totalPrice || currentOrder.total || 0)}</p>
                </Col>
                <Col md={6}>
                  <h5>Customer Information</h5>
                  <p><strong>Name:</strong> {currentOrder.userName || 'N/A'}</p>
                  <p><strong>Email:</strong> {currentOrder.userEmail || 'N/A'}</p>
                </Col>
              </Row>
              <h5>Order Items</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.orderItems && currentOrder.orderItems.length > 0 ? (
                    currentOrder.orderItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name || 'N/A'}</td>
                        <td>${formatPrice(item.price)}</td>
                        <td>{item.qty}</td>
                        <td>${formatPrice(item.price * item.qty)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">No items</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              <Form.Group className="mb-3">
                <Form.Label>Update Status</Form.Label>
                <Form.Select
                  value={currentOrder.status}
                  onChange={(e) => handleStatusUpdate(currentOrder.id, e.target.value)}
                  disabled={saving}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
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