import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Row, Col, ListGroup, Image, Card, ListGroupItem } from 'react-bootstrap';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  const { cartItems = [], shippingAddress = {}, paymentMethod } = cart;

  // Calculate prices
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  const itemsPrice = addDecimals(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  
  const shippingPrice = addDecimals(itemsPrice > 100 ? 0 : 10);
  const taxPrice = addDecimals(Number((0.15 * itemsPrice).toFixed(2)));
  const totalPrice = (
    Number(itemsPrice) +
    Number(shippingPrice) +
    Number(taxPrice)
  ).toFixed(2);

  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      
      // Get user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
      
      if (!userInfo) {
        navigate('/login');
        return;
      }
      
      // Create order object
      const order = {
        _id: Date.now().toString(),
        user: userInfo._id,
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        isPaid: false,
        isDelivered: false,
        createdAt: new Date().toISOString(),
      };
      
      // In a real app, you would make an API call to create the order
      // For demo purposes, we'll just store it in localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Clear the cart
      localStorage.removeItem('cart');
      
      // Navigate to the order details page
      navigate(`/order/${order._id}`);
      
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Error creating order. Please try again.');
      toast.error('Error creating order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Address:</strong> {shippingAddress.address}, {shippingAddress.city}{' '}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <strong>Method: </strong>
              {paymentMethod}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image src={item.image} alt={item.name} fluid rounded />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                {error && <Message variant='danger'>{error}</Message>}
                <Button
                  type='button'
                  className='btn-block'
                  disabled={cartItems.length === 0 || loading}
                  onClick={placeOrderHandler}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrder;
