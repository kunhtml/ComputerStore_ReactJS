import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5678/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Check server health
        const health = await axios.get(`${API_BASE}/health`);
        if (health.data.status !== 'ok') throw new Error('Server not ready');

        // Fetch dashboard stats
        const res = await axios.get(`${API_BASE}/dashboard/stats`);
        
        // Ensure all expected properties are present with defaults
        setStats({
          totalOrders: res.data.totalOrders || 0,
          totalProducts: res.data.totalProducts || 0,
          totalUsers: res.data.totalUsers || 0,
          totalRevenue: res.data.totalRevenue || 0,
          recentOrders: res.data.recentOrders || [],
          lowStockProducts: res.data.lowStockProducts || []
        });
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Cannot connect to server or fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container fluid>
      <h2 className="mb-4">Admin Dashboard</h2>
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Tổng Đơn Hàng</Card.Title>
              <Card.Text className="h3">{stats.totalOrders}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Tổng Sản Phẩm</Card.Title>
              <Card.Text className="h3">{stats.totalProducts}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Tổng Người Dùng</Card.Title>
              <Card.Text className="h3">{stats.totalUsers}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Tổng Doanh Thu</Card.Title>
              <Card.Text className="h3">${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Đơn Hàng Gần Đây</h5>
              <Link to="/admin/orders" className="btn btn-sm btn-primary">
                Xem Tất Cả
              </Link>
            </Card.Header>
            <Card.Body>
              {stats.recentOrders.length === 0 ? (
                <p className="text-muted">Không có đơn hàng gần đây</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Mã Đơn</th>
                        <th>Khách Hàng</th>
                        <th>Tổng</th>
                        <th>Trạng Thái</th>
                        <th>Ngày</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.userName || order.user?.name || 'N/A'}</td>
                          <td>${order.total ? parseFloat(order.total).toFixed(2) : '0.00'}</td>
                          <td>
                            <span className={`badge bg-${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Low Stock Products */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Sản Phẩm Sắp Hết Hàng</h5>
              <Link to="/admin/products" className="btn btn-sm btn-primary">
                Xem Tất Cả
              </Link>
            </Card.Header>
            <Card.Body>
              {stats.lowStockProducts.length === 0 ? (
                <p className="text-muted">Không có sản phẩm sắp hết hàng</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Sản Phẩm</th>
                        <th>Danh Mục</th>
                        <th>Thương Hiệu</th>
                        <th>Tồn Kho</th>
                        <th>Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.lowStockProducts.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>{product.brand}</td>
                          <td>
                            <span className={`badge bg-${product.countInStock <= 5 ? 'danger' : 'warning'}`}>
                              {product.countInStock}
                            </span>
                          </td>
                          <td>${product.price ? product.price.toFixed(2) : '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'shipped': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
};

export default AdminDashboard; 