import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Row, Col } from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const OrderList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        
        if (!userInfo) {
          navigate('/login');
          return;
        }
        
        // In a real app, you would fetch orders from an API
        // For demo purposes, we'll use localStorage
        const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        // Filter orders for the current user
        const userOrders = allOrders.filter(order => order.user === userInfo._id);
        
        setOrders(userOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Error loading orders');
        toast.error('Error loading orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [navigate]);

  return (
    <Row>
      <Col md={12}>
        <h2>My Orders</h2>
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : (
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No orders found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>${order.totalPrice || '0.00'}</td>
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
                      <Link to={`/order/${order._id}`}>
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
        )}
      </Col>
    </Row>
  );
};

export default OrderList;
