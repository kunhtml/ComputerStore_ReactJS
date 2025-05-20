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
      setError('Error loading orders');
      toast.error('Error loading orders');
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
        <h2>My Orders</h2>
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : (
          <>
            <p className="text-muted small">Order status updates automatically every 30 seconds</p>
            <Table striped bordered hover responsive className='table-sm'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DATE</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th>PAID</th>
                  <th>DELIVERED</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">No orders found</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id || order._id}>
                      <td>{order.id || order._id}</td>
                      <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>${order.totalPrice || '0.00'}</td>
                      <td>
                        <Badge bg={getStatusColor(order.status)}>
                          {order.status || 'Pending'}
                        </Badge>
                      </td>
                      <td>
                        {order.isPaid ? (
                          order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'Yes'
                        ) : (
                          <i className='fas fa-times' style={{ color: 'red' }}></i>
                        )}
                      </td>
                      <td>
                        {order.isDelivered ? (
                          order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Yes'
                        ) : (
                          <i className='fas fa-times' style={{ color: 'red' }}></i>
                        )}
                      </td>
                      <td>
                        <Link to={`/order/${order.id || order._id}`}>
                          <Button variant='light' className='btn-sm'>
                            Details
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
