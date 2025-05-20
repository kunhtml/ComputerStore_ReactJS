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
        
        // Lấy dữ liệu từ database.json
        const response = await fetch('/database.json');
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
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        setLoading(true);
        
        // Lấy dữ liệu từ database.json
        const response = await fetch('/database.json');
        const data = await response.json();
        
        // Lọc ra người dùng cần xóa
        const updatedUsers = (data.users || []).filter(user => user.id !== userId);
        
        // Lưu ý: Trong ứng dụng thực tế, bạn cần gọi API để xóa dữ liệu trên server
        
        // Cập nhật danh sách người dùng hiển thị
        setUsers(updatedUsers.map(({ password, ...user }) => user));
        
        toast.success('Xóa người dùng thành công');
      } catch (err) {
        toast.error('Có lỗi xảy ra khi xóa người dùng');
        console.error('Lỗi khi xóa người dùng:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container>
      <h1>Users</h1>
      {loading ? (
        <div>Loading...</div>
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
              <tr key={user._id}>
                <td>{user._id}</td>
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
                  <Link to={`/admin/user/${user._id}/edit`}>
                    <Button variant="light" className="btn-sm">
                      <FaEdit />
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    className="btn-sm ms-2"
                    onClick={() => deleteHandler(user._id)}
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
