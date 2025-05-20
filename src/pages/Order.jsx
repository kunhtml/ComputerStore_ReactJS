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
import axios from '../services/axiosConfig';

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

  // Calculate prices
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        setUserInfo(userInfo);

        if (!userInfo) {
          navigate('/login');
          return;
        }

        // Fetch order from database.json
        const response = await fetch('/database.json');
        const data = await response.json();
        const orderData = data.orders?.find(o => o._id === orderId);
        
        if (orderData) {
          setOrder(orderData);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Error loading order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  // Load PayPal script
  useEffect(() => {
    const addPayPalScript = async () => {
      try {
        const { data: clientId } = await axios.get('/api/config/paypal');
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
      
      // In a real app, you would make an API call to update the order status
      // For demo purposes, we'll just update the local state
      const updatedOrder = { 
        ...order, 
        isPaid: true, 
        paidAt: new Date().toISOString(),
        paymentResult 
      };
      
      // Update local state
      setOrder(updatedOrder);
      
      // In a real app, you would also update the order in the database
      // For demo, we'll just show a success message
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
      
      // In a real app, you would make an API call to update the order status
      // For demo purposes, we'll just update the local state
      const updatedOrder = { 
        ...order, 
        isDelivered: true, 
        deliveredAt: new Date().toISOString() 
      };
      
      // Update local state
      setOrder(updatedOrder);
      
      // In a real app, you would also update the order in the database
      // For demo, we'll just show a success message
      toast.success('Order marked as delivered');
    } catch (err) {
      console.error('Error updating delivery status:', err);
      toast.error('Error updating delivery status. Please try again.');
    } finally {
      setLoadingDeliver(false);
    }
  };

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroupItem>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant='success'>
                  Delivered on {order.deliveredAt}
                </Message>
              ) : (
                <Message variant='danger'>Not Delivered</Message>
              )}
            </ListGroupItem>

            <ListGroupItem>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant='success'>Paid on {order.paidAt}</Message>
              ) : (
                <Message variant='danger'>Not Paid</Message>
              )}
            </ListGroupItem>

            <ListGroupItem>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
                    <ListGroupItem key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
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
                          {item.qty} x ${item.price} = ${item.qty * item.price}
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
              </ListGroupItem>
              <ListGroupItem>
                <Row>
                  <Col>Items</Col>
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroupItem>
              <ListGroupItem>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroupItem>
              <ListGroupItem>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroupItem>
              <ListGroupItem>
                <Row>
                  <Col>Total</Col>
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
              {loadingDeliver && <Loader />}
              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroupItem>
                    <Button
                      type='button'
                      className='btn btn-block'
                      onClick={deliverHandler}
                    >
                      Mark As Delivered
                    </Button>
                  </ListGroupItem>
                )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Order;
