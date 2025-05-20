import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Card, ListGroup, Badge } from 'react-bootstrap';
import { listMyOrders } from '../actions/orderActions';
import Loader from '../components/Loader';
import Message from '../components/Message';

const UserDashboard = () => {
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const orderListMy = useSelector((state) => state.orderListMy);
  const { loading: loadingOrders, error: errorOrders, orders } = orderListMy;

  useEffect(() => {
    if (userInfo) {
      dispatch(listMyOrders());
    }
  }, [dispatch, userInfo]);

  return (
    <div className="py-4">
      <h2 className="mb-4">Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Thông tin cá nhân</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Tên:</strong> {userInfo?.name}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Email:</strong> {userInfo?.email}
                </ListGroup.Item>
                <ListGroup.Item>
                  <Link to="/profile" className="btn btn-primary btn-sm">
                    Cập nhật thông tin
                  </Link>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Đơn hàng gần đây</Card.Title>
              {loadingOrders ? (
                <Loader />
              ) : errorOrders ? (
                <Message variant="danger">{errorOrders}</Message>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Mã đơn hàng</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders && orders.slice(0, 3).map((order) => (
                        <tr key={order._id}>
                          <td>{order._id}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>${order.totalPrice}</td>
                          <td>
                            {order.isPaid ? (
                              <Badge bg="success">Đã thanh toán</Badge>
                            ) : (
                              <Badge bg="warning" text="dark">Chưa thanh toán</Badge>
                            )}
                            {' '}
                            {order.isDelivered ? (
                              <Badge bg="success">Đã giao hàng</Badge>
                            ) : (
                              <Badge bg="secondary">Đang xử lý</Badge>
                            )}
                          </td>
                          <td>
                            <Link to={`/order/${order._id}`} className="btn btn-sm btn-light">
                              Xem chi tiết
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {(!orders || orders.length === 0) && (
                        <tr>
                          <td colSpan="5" className="text-center">Bạn chưa có đơn hàng nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="text-end mt-3">
                    <Link to="/myorders" className="btn btn-outline-primary">
                      Xem tất cả đơn hàng
                    </Link>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Địa chỉ giao hàng</Card.Title>
              <Card.Text>
                {userInfo?.shippingAddress?.address ? (
                  <>
                    {userInfo.shippingAddress.address}<br />
                    {userInfo.shippingAddress.city}, {userInfo.shippingAddress.postalCode}<br />
                    {userInfo.shippingAddress.country}
                  </>
                ) : (
                  'Bạn chưa cập nhật địa chỉ giao hàng'
                )}
              </Card.Text>
              <Link to="/shipping" className="btn btn-primary btn-sm">
                Cập nhật địa chỉ
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Phương thức thanh toán</Card.Title>
              <Card.Text>
                {userInfo?.paymentMethod ? (
                  `Phương thức thanh toán: ${userInfo.paymentMethod}`
                ) : (
                  'Bạn chưa chọn phương thức thanh toán mặc định'
                )}
              </Card.Text>
              <Link to="/payment" className="btn btn-primary btn-sm">
                Cài đặt thanh toán
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserDashboard;
