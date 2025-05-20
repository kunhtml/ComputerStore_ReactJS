import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const UserList = () => {
    const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Lấy dữ liệu từ server API
        const response = await fetch('http://localhost:5678/api/database');
        const data = await response.json();
        
        // Lấy danh sách người dùng (trừ mật khẩu)
        const usersList = (data.users || []).map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        
        setUsers(usersList);
        setError('');
      } catch (err) {
        setError('Không thể tải danh sách người dùng');
        console.error('Lỗi khi tải người dùng:', err);
      } finally {
        setLoading(false);
      }
    };

    // Kiểm tra đăng nhập và quyền admin
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    setUserInfo(userInfo);
    
    if (!userInfo) {
      window.location.href = '/login';
    } else if (!userInfo.isAdmin) {
      window.location.href = '/';
    } else {
      fetchUsers();
    }
  }, []);

  const deleteHandler = async (userId) => {
    // First check if user is an admin
    const userToDelete = users.find(user => user.id === userId);
    
    if (userToDelete && userToDelete.isAdmin) {
      toast.error('Cannot delete admin users');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        
        // Get current data
        const response = await fetch('http://localhost:5678/api/database');
        const data = await response.json();
        
        // Filter out user to delete
        const updatedUsers = (data.users || []).filter(user => user.id !== userId);
        
        // Update database through API
        await fetch('http://localhost:5678/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ users: updatedUsers }),
        });
        
        // Update displayed user list
        setUsers(updatedUsers.map(({ password, ...user }) => user));
        
        toast.success('User deleted successfully');
      } catch (err) {
        toast.error('Error deleting user');
        console.error('Error deleting user:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container>
      <h1 className="my-4">User Management</h1>
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ADMIN</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </td>
                <td>
                  {user.isAdmin ? (
                    <FaCheck style={{ color: 'green' }} />
                  ) : (
                    <FaTimes style={{ color: 'red' }} />
                  )}
                </td>
                <td>
                  <div className="d-flex justify-content-center">
                    <Link to={`/admin/user/${user.id}/edit`} className="me-2">
                      <Button variant="primary" className="btn-sm">
                        <FaEdit /> Edit
                      </Button>
                    </Link>
                    {!user.isAdmin && (
                      <Button
                        variant="danger"
                        className="btn-sm"
                        onClick={() => deleteHandler(user.id)}
                      >
                        <FaTrash /> Delete
                      </Button>
                    )}
                    {user.isAdmin && (
                      <Button
                        variant="secondary"
                        className="btn-sm"
                        disabled
                        title="Admin users cannot be deleted"
                      >
                        <FaTrash /> Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default UserList;
