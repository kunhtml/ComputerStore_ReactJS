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
      setError('Lỗi khi tải đơn hàng');
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
      
      toast.success('Thanh toán thành công!');
    } catch (err) {
      console.error('Error processing payment:', err);
      toast.error('Lỗi khi xử lý thanh toán. Vui lòng thử lại.');
    } finally {
      setLoadingPay(false);
    }
  };

  const deliverHandler = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đánh dấu đơn hàng này đã giao?')) {
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
      
      toast.success('Đã đánh dấu đơn hàng là đã giao');
    } catch (err) {
      console.error('Error updating delivery status:', err);
      toast.error('Lỗi khi cập nhật trạng thái giao hàng. Vui lòng thử lại.');
    } finally {
      setLoadingDeliver(false);
    }
  };

  // Function for admin to mark order as paid
  const markAsPaidHandler = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đánh dấu đơn hàng này đã thanh toán?')) {
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
      
      toast.success('Đã đánh dấu đơn hàng là đã thanh toán');
    } catch (err) {
      console.error('Error marking as paid:', err);
      toast.error('Lỗi khi đánh dấu đã thanh toán. Vui lòng thử lại.');
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
        <Message variant='danger'>Không tìm thấy đơn hàng</Message>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Đơn hàng {order.id}</h1>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left me-2"></i>Quay lại
            </Button>
          </div>
          <p className="text-muted small">Trạng thái đơn hàng tự động cập nhật mỗi 30 giây. Cập nhật lần cuối: {lastRefresh}</p>
          {order.status && (
            <Message variant={order.status?.toLowerCase() === 'pending' ? 'warning' : 
                             order.status?.toLowerCase() === 'delivered' ? 'success' : 
                             order.status?.toLowerCase() === 'paid' ? 'success' : 'info'}>
              Trạng thái đơn hàng: {order.status?.toLowerCase() === 'pending' ? 'Chờ xử lý' :
                                   order.status?.toLowerCase() === 'processing' ? 'Đang xử lý' :
                                   order.status?.toLowerCase() === 'shipped' ? 'Đang giao' :
                                   order.status?.toLowerCase() === 'delivered' ? 'Đã giao' :
                                   order.status?.toLowerCase() === 'cancelled' ? 'Đã hủy' :
                                   order.status?.toLowerCase() === 'paid' ? 'Đã thanh toán' :
                                   order.status}
            </Message>
          )}
          <Row>
            <Col md={8}>
              <ListGroup variant='flush'>
                <ListGroupItem>
                  <h2>Thông tin giao hàng</h2>
                  <p>
                    <strong>Tên: </strong> {order.userName || 'Không có'}
                  </p>
                  <p>
                    <strong>Email: </strong>{' '}
                    <a href={`mailto:${order.userEmail || ''}`}>
                      {order.userEmail || 'Không có'}
                    </a>
                  </p>
                  <p>
                    <strong>Địa chỉ: </strong>
                    {order.shippingAddress?.address}, {order.shippingAddress?.city}{' '}
                    {order.shippingAddress?.postalCode},{' '}
                    {order.shippingAddress?.country}
                  </p>
                  <p>
                    <strong>Trạng thái: </strong>
                    <span className={`badge bg-${
                      order.status?.toLowerCase() === 'delivered' ? 'success' :
                      order.status?.toLowerCase() === 'shipped' ? 'primary' :
                      order.status?.toLowerCase() === 'processing' ? 'info' :
                      order.status?.toLowerCase() === 'cancelled' ? 'danger' : 'warning'
                    }`}>
                      {order.status?.toLowerCase() === 'pending' ? 'Chờ xử lý' :
                       order.status?.toLowerCase() === 'processing' ? 'Đang xử lý' :
                       order.status?.toLowerCase() === 'shipped' ? 'Đang giao' :
                       order.status?.toLowerCase() === 'delivered' ? 'Đã giao' :
                       order.status?.toLowerCase() === 'cancelled' ? 'Đã hủy' :
                       order.status || 'Chờ xử lý'}
                    </span>
                  </p>
                  {order.isDelivered ? (
                    <Message variant='success'>
                      Đã giao vào ngày {new Date(order.deliveredAt).toLocaleDateString('vi-VN')}
                    </Message>
                  ) : (
                    <Message variant='danger'>Chưa giao hàng</Message>
                  )}
                </ListGroupItem>

                <ListGroupItem>
                  <h2>Phương thức thanh toán</h2>
                  <p>
                    <strong>Phương thức: </strong>
                    {order.paymentMethod === 'PayPal' ? 'PayPal' :
                     order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' :
                     order.paymentMethod || 'Chưa chỉ định'}
                  </p>
                  {order.isPaid ? (
                    <Message variant='success'>
                      Đã thanh toán vào ngày {new Date(order.paidAt).toLocaleDateString('vi-VN')}
                    </Message>
                  ) : (
                    <Message variant='danger'>Chưa thanh toán</Message>
                  )}
                </ListGroupItem>

                <ListGroupItem>
                  <h2>Sản phẩm đã đặt</h2>
                  {(!order.orderItems || order.orderItems.length === 0) ? (
                    <Message>Đơn hàng trống</Message>
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
                              {item.qty} x {Math.round(parseFloat(item.price || 0)).toLocaleString('vi-VN')}₫ = {Math.round(parseFloat((item.qty * item.price) || 0)).toLocaleString('vi-VN')}₫
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
                    <h2>Tóm tắt đơn hàng</h2>
                    <ListGroup variant='flush'>
                      <ListGroupItem>
                        <Row>
                          <Col>Sản phẩm:</Col>
                          <Col>{Math.round(parseFloat(order.itemsPrice || 0)).toLocaleString('vi-VN')}₫</Col>
                        </Row>
                      </ListGroupItem>
                      <ListGroupItem>
                        <Row>
                          <Col>Phí vận chuyển:</Col>
                          <Col>{Math.round(parseFloat(order.shippingPrice || 0)).toLocaleString('vi-VN')}₫</Col>
                        </Row>
                      </ListGroupItem>
                      <ListGroupItem>
                        <Row>
                          <Col>Thuế:</Col>
                          <Col>{Math.round(parseFloat(order.taxPrice || 0)).toLocaleString('vi-VN')}₫</Col>
                        </Row>
                      </ListGroupItem>
                      <ListGroupItem>
                        <Row>
                          <Col>Tổng cộng:</Col>
                          <Col>{Math.round(parseFloat(order.totalPrice || 0)).toLocaleString('vi-VN')}₫</Col>
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
                            Đánh dấu đã thanh toán
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
                            Đánh dấu đã giao hàng
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
