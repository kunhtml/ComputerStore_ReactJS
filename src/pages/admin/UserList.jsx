import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import axios from '../../services/axiosConfig';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        
        // Direct approach - read the database.json file from src/data
        const response = await fetch('/database.json');
        const data = await response.json();
        
        if (data && data.users && Array.isArray(data.users)) {
          // Lấy danh sách người dùng (trừ mật khẩu)
          const usersList = data.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          });
          
          console.log('Users loaded from database.json:', usersList);
          setUsers(usersList);
          setError('');
        } else {
          throw new Error('No users found in database.json');
        }
      } catch (err) {
        console.error('Error loading users from database.json:', err);
        
        try {
          // Fallback to API
          const apiResponse = await axios.get('http://localhost:5678/api/database');
          const apiData = apiResponse.data;
          
          if (apiData && apiData.users && Array.isArray(apiData.users)) {
            // Lấy danh sách người dùng (trừ mật khẩu)
            const usersList = apiData.users.map(user => {
              const { password, ...userWithoutPassword } = user;
              return userWithoutPassword;
            });
            
            console.log('Users loaded from API:', usersList);
            setUsers(usersList);
            setError('');
          } else {
            throw new Error('No users found in API response');
          }
        } catch (apiErr) {
          console.error('Error loading users from API:', apiErr);
          
          // Last resort - hardcoded sample data
          const sampleUsers = [
            { id: 1, name: 'Admin User', email: 'admin@example.com', isAdmin: true, createdAt: '2023-05-20T00:00:00.000Z' },
            { id: 2, name: 'John Doe', email: 'john@example.com', isAdmin: false, createdAt: '2023-05-20T01:00:00.000Z' }
          ];
          
          console.log('Using sample users data:', sampleUsers);
          setUsers(sampleUsers);
          setError('Không thể tải danh sách người dùng từ database.json hoặc API. Hiển thị dữ liệu mẫu.');
        }
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
      fetchUsersData();
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update local state
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Error deleting user');
        console.error('Error:', error);
      }
    }
  };

  return (
    <Container className="py-3">
      <h1 className="mb-4">Quản lý người dùng</h1>
      
      {loading ? (
        <div className="text-center py-5">
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
              <th>TÊN</th>
              <th>EMAIL</th>
              <th>ADMIN</th>
              <th>NGÀY TẠO</th>
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
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <Link to={`/admin/user/${user.id}/edit`}>
                    <Button variant="light" className="btn-sm">
                      <FaEdit />
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    className="btn-sm ms-2"
                    onClick={() => deleteHandler(user.id)}
                    disabled={user.isAdmin}
                  >
                    <FaTrash />
                  </Button>
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
