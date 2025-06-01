import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Spinner, Alert, Form, Modal, Pagination } from 'react-bootstrap';
import axios from 'axios';

const API_BASE = 'http://localhost:5678/api';
const PAGE_SIZE = 10;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentUser, setCurrentUser] = useState({ name: '', email: '', password: '', isAdmin: false });
  const [saving, setSaving] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        // Kiểm tra server
        const health = await axios.get(`${API_BASE}/health`);
        if (health.data.status !== 'ok') throw new Error('Server chưa sẵn sàng');
        // Lấy danh sách user
        const res = await axios.get(`${API_BASE}/users`, {
          params: { q: search, page, limit: PAGE_SIZE, sort: 'createdAt_desc' },
        });
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        setError('Không thể kết nối server hoặc lấy dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [search, page]);

  // Modal handlers
  const openAddModal = () => {
    setModalType('add');
    setCurrentUser({ name: '', email: '', password: '', isAdmin: false });
    setShowModal(true);
  };
  const openEditModal = (user) => {
    setModalType('edit');
    setCurrentUser({ ...user, password: '' });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  // Save user (add or edit)
  const handleSave = async () => {
    setSaving(true);
    try {
      // Get current logged-in user
      const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');

      // Prevent admin from changing their own role
      if (modalType === 'edit' && currentUser.id === currentUser.id && 
          currentUser.isAdmin && !currentUser.isAdmin) {
        alert('Admin không thể tự thay đổi vai trò của mình!');
        setSaving(false);
        return;
      }

      if (modalType === 'add') {
        await axios.post(`${API_BASE}/users`, { ...currentUser, role: 'employee' });
      } else {
        await axios.put(`${API_BASE}/users/${currentUser.id}`, currentUser);
      }
      setShowModal(false);
      setPage(1);
      setSearch('');
      // Refetch
      const res = await axios.get(`${API_BASE}/users`, { params: { page: 1, limit: PAGE_SIZE } });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi lưu user');
    } finally {
      setSaving(false);
    }
  };

  // Delete user
  const handleDelete = async (user) => {
    // Prevent deleting admin users
    if (user.isAdmin) {
      alert('Không thể xóa tài khoản admin!');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa user này?')) return;
    try {
      await axios.delete(`${API_BASE}/users/${user.id}`);
      // Refetch
      const res = await axios.get(`${API_BASE}/users`, { params: { page, limit: PAGE_SIZE } });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa user');
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

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col><h3>Quản lý người dùng</h3></Col>
        <Col xs="auto">
          <Button variant="primary" onClick={openAddModal}>Thêm user</Button>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
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
                <th>Tên</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center">Không có user nào</td></tr>
              ) : users.map((user, idx) => (
                <tr key={user.id}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? '✔️' : ''}</td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleString() : ''}</td>
                  <td>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(user)}>Sửa</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(user)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>{paginationItems}</Pagination>
        </>
      )}
      {/* Modal thêm/sửa user */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'add' ? 'Thêm user' : 'Sửa user'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                value={currentUser.name}
                onChange={e => setCurrentUser({ ...currentUser, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={currentUser.email}
                onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu {modalType === 'edit' && <span className="text-muted">(để trống nếu không đổi)</span>}</Form.Label>
              <Form.Control
                type="password"
                value={currentUser.password || ''}
                onChange={e => setCurrentUser({ ...currentUser, password: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Vai trò</Form.Label>
              <Form.Select
                value={currentUser.role || 'employee'}
                onChange={e => {
                  const loggedInUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
                  
                  // Prevent admin from changing their own role
                  if (loggedInUser.isAdmin && loggedInUser.id === currentUser.id && e.target.value !== 'admin') {
                    alert('Admin không thể tự thay đổi vai trò của mình!');
                    return;
                  }
                  
                  setCurrentUser({ ...currentUser, role: e.target.value })
                }}
                disabled={modalType === 'add'} // Disable role selection when adding new user
              >
                <option value="customer">Khách hàng</option>
                <option value="employee">Nhân viên</option>
                <option value="admin">Quản trị viên</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Hủy</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement; 