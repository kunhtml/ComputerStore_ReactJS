import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Button,
  ListGroupItem,
} from 'react-bootstrap';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { PayPalButton } from 'react-paypal-button-v2';
import { toast } from 'react-toastify';

const API_BASE = 'http://localhost:5678/api';
const REFRESH_INTERVAL = 30000; // Refresh every 30 seconds

const Order = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingPay, setLoadingPay] = useState(false);
  const [loadingDeliver, setLoadingDeliver] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString());

  // Calculate prices
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  const fetchOrder = async () => {
    try {
      setLoading(loading => loading); // Only keep true on initial load
      // Get user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      setUserInfo(userInfo);

      if (!userInfo) {
        navigate('/login');
        return;
      }

      // Fetch order from API
      const response = await fetch(`${API_BASE}/orders/${orderId}`);
      
      if (response.ok) {
        const orderData = await response.json();
        if (orderData.order) {
          setOrder(orderData.order);
          setLastRefresh(new Date().toLocaleTimeString());
        } else {
          setError('Order not found');
        }
      } else {
        // Fallback to old method if the new endpoint fails
        const response = await fetch(`${API_BASE}/database`);
        const data = await response.json();
        const orderData = data.orders?.find(o => o.id === orderId);
        
        if (orderData) {
          setOrder(orderData);
          setLastRefresh(new Date().toLocaleTimeString());
        } else {
          setError('Order not found');
        }
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Error loading order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    
    // Set up auto-refresh interval
    const intervalId = setInterval(() => {
      fetchOrder();
    }, REFRESH_INTERVAL);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [orderId, navigate]);

  // Load PayPal script
  useEffect(() => {
    const addPayPalScript = async () => {
      try {
        const { data: clientId } = await fetch('/api/config/paypal');
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
        script.async = true;
        script.onload = () => setSdkReady(true);
        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading PayPal script:', err);
      }
    };

    if (order && !order.isPaid && !window.paypal) {
      addPayPalScript();
    } else if (order && !order.isPaid) {
      setSdkReady(true);
    }
  }, [order]);

  const successPaymentHandler = async (paymentResult) => {
    try {
      setLoadingPay(true);
      
      // Fetch all orders
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      const orders = data.orders || [];
      
      // Find the current order and update it
      const updatedOrders = orders.map(o => {
        if (o.id === orderId) {
          return { 
            ...o, 
            isPaid: true, 
            paidAt: new Date().toISOString(),
            paymentResult,
            status: 'Paid'
          };
        }
        return o;
      });
      
      // Save updated orders to database
      await fetch('http://localhost:5678/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders: updatedOrders }),
      });
      
      // Find the updated order to set in state
      const updatedOrder = updatedOrders.find(o => o.id === orderId);
      setOrder(updatedOrder);
      
      toast.success('Payment successful!');
    } catch (err) {
      console.error('Error processing payment:', err);
      toast.error('Error processing payment. Please try again.');
    } finally {
      setLoadingPay(false);
    }
  };

  const deliverHandler = async () => {
    if (!window.confirm('Are you sure you want to mark this order as delivered?')) {
      return;
    }
    
    try {
      setLoadingDeliver(true);
      
      // Fetch all orders
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      const orders = data.orders || [];
      
      // Find the current order and update it
      const updatedOrders = orders.map(o => {
        if (o.id === orderId) {
          return { 
            ...o, 
            isDelivered: true, 
            deliveredAt: new Date().toISOString(),
            status: 'Delivered'
          };
        }
        return o;
      });
      
      // Save updated orders to database
      await fetch('http://localhost:5678/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders: updatedOrders }),
      });
      
      // Find the updated order to set in state
      const updatedOrder = updatedOrders.find(o => o.id === orderId);
      setOrder(updatedOrder);
      
      toast.success('Order marked as delivered');
    } catch (err) {
      console.error('Error updating delivery status:', err);
      toast.error('Error updating delivery status. Please try again.');
    } finally {
      setLoadingDeliver(false);
    }
  };

  // Function for admin to mark order as paid
  const markAsPaidHandler = async () => {
    if (!window.confirm('Are you sure you want to mark this order as paid?')) {
      return;
    }
    
    try {
      setLoadingPay(true);
      
      // Fetch all orders
      const response = await fetch('http://localhost:5678/api/database');
      const data = await response.json();
      const orders = data.orders || [];
      
      // Find the current order and update it
      const updatedOrders = orders.map(o => {
        if (o.id === orderId) {
          return { 
            ...o, 
            isPaid: true, 
            paidAt: new Date().toISOString(),
            status: 'Paid'
          };
        }
        return o;
      });
      
      // Save updated orders to database
      await fetch('http://localhost:5678/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders: updatedOrders }),
      });
      
      // Find the updated order to set in state
      const updatedOrder = updatedOrders.find(o => o.id === orderId);
      setOrder(updatedOrder);
      
      toast.success('Order marked as paid');
    } catch (err) {
      console.error('Error marking as paid:', err);
      toast.error('Error marking as paid. Please try again.');
    } finally {
      setLoadingPay(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : !order ? (
        <Message variant='danger'>Order not found</Message>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Order {order.id}</h1>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left me-2"></i>Back
            </Button>
          </div>
          <p className="text-muted small">Status updates automatically every 30 seconds. Last updated: {lastRefresh}</p>
          {order.status && (
            <Message variant={order.status === 'Pending' ? 'warning' : order.status === 'Paid' ? 'success' : 'info'}>
              Order Status: {order.status}
            </Message>
          )}
          <Row>
            <Col md={8}>
              <ListGroup variant='flush'>
                <ListGroupItem>
                  <h2>Shipping</h2>
                  <p>
                    <strong>Name: </strong> {order.userName || 'N/A'}
                  </p>
                  <p>
                    <strong>Email: </strong>{' '}
                    <a href={`mailto:${order.userEmail || ''}`}>
                      {order.userEmail || 'N/A'}
                    </a>
                  </p>
                  <p>
                    <strong>Address: </strong>
                    {order.shippingAddress?.address}, {order.shippingAddress?.city}{' '}
                    {order.shippingAddress?.postalCode},{' '}
                    {order.shippingAddress?.country}
                  </p>
                  <p>
                    <strong>Status: </strong>
                    <span className={`badge bg-${
                      order.status?.toLowerCase() === 'delivered' ? 'success' :
                      order.status?.toLowerCase() === 'shipped' ? 'primary' :
                      order.status?.toLowerCase() === 'processing' ? 'info' :
                      order.status?.toLowerCase() === 'cancelled' ? 'danger' : 'warning'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </p>
                  {order.isDelivered ? (
                    <Message variant='success'>
                      Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                    </Message>
                  ) : (
                    <Message variant='danger'>Not Delivered</Message>
                  )}
                </ListGroupItem>

                <ListGroupItem>
                  <h2>Payment Method</h2>
                  <p>
                    <strong>Method: </strong>
                    {order.paymentMethod || 'Not specified'}
                  </p>
                  {order.isPaid ? (
                    <Message variant='success'>
                      Paid on {new Date(order.paidAt).toLocaleDateString()}
                    </Message>
                  ) : (
                    <Message variant='danger'>Not Paid</Message>
                  )}
                </ListGroupItem>

                <ListGroupItem>
                  <h2>Order Items</h2>
                  {(!order.orderItems || order.orderItems.length === 0) ? (
                    <Message>Order is empty</Message>
                  ) : (
                    <ListGroup variant='flush'>
                      {order.orderItems.map((item, index) => (
                        <ListGroupItem key={index}>
                          <Row>
                            <Col md={1}>
                              <Image
                                src={item.image || '/images/placeholder.png'}
                                alt={item.name}
                                fluid
                                rounded
                              />
                            </Col>
                            <Col>
                              <Link to={`/product/${item.product}`}>
                                {item.name}
                              </Link>
                            </Col>
                            <Col md={4}>
                              {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                            </Col>
                          </Row>
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  )}
                </ListGroupItem>
              </ListGroup>
            </Col>
            <Col md={4}>
              <Card>
                <ListGroup variant='flush'>
                  <ListGroupItem>
                    <h2>Order Summary</h2>
                    <ListGroup variant='flush'>
                      <ListGroupItem>
                        <Row>
                          <Col>Items:</Col>
                          <Col>${order.itemsPrice}</Col>
                        </Row>
                      </ListGroupItem>
                      <ListGroupItem>
                        <Row>
                          <Col>Shipping:</Col>
                          <Col>${order.shippingPrice}</Col>
                        </Row>
                      </ListGroupItem>
                      <ListGroupItem>
                        <Row>
                          <Col>Tax:</Col>
                          <Col>${order.taxPrice}</Col>
                        </Row>
                      </ListGroupItem>
                      <ListGroupItem>
                        <Row>
                          <Col>Total:</Col>
                          <Col>${order.totalPrice}</Col>
                        </Row>
                      </ListGroupItem>
                      {!order.isPaid && (
                        <ListGroupItem>
                          {loadingPay && <Loader />}
                          {!sdkReady ? (
                            <Loader />
                          ) : (
                            <PayPalButton
                              amount={order.totalPrice}
                              onSuccess={successPaymentHandler}
                            />
                          )}
                        </ListGroupItem>
                      )}
                      {userInfo && userInfo.isAdmin && !order.isPaid && (
                        <ListGroupItem>
                          <Button
                            type='button'
                            className='btn btn-block w-100 mb-2'
                            variant="success"
                            onClick={markAsPaidHandler}
                          >
                            Mark As Paid
                          </Button>
                        </ListGroupItem>
                      )}
                      {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                        <ListGroupItem>
                          {loadingDeliver && <Loader />}
                          <Button
                            type='button'
                            className='btn btn-block w-100'
                            onClick={deliverHandler}
                          >
                            Mark As Delivered
                          </Button>
                        </ListGroupItem>
                      )}
                    </ListGroup>
                  </ListGroupItem>
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Order;
