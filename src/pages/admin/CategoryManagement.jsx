import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Spinner, Alert, Form, Modal, Pagination } from 'react-bootstrap';
import axios from 'axios';

const API_BASE = 'http://localhost:5678/api';
const PAGE_SIZE = 10;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Check server health
        const health = await axios.get(`${API_BASE}/health`);
        if (health.data.status !== 'ok') throw new Error('Server not ready');
        
        // Get categories
        const res = await axios.get(`${API_BASE}/categories`, {
          params: { 
            q: search, 
            page, 
            limit: PAGE_SIZE, 
            sort: 'name_asc' 
          },
        });
        setCategories(res.data.categories || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        setError('Cannot connect to server or fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, page]);

  // Modal handlers
  const openAddModal = () => {
    setModalType('add');
    setCurrentCategory({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalType('edit');
    setCurrentCategory({ ...category });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCategory({ name: '', description: '' });
  };

  // Save category (add or edit)
  const handleSave = async () => {
    if (!currentCategory.name.trim()) {
      alert('Category name is required');
      return;
    }

    setSaving(true);
    try {
      if (modalType === 'add') {
        await axios.post(`${API_BASE}/categories`, currentCategory);
      } else {
        await axios.put(`${API_BASE}/categories/${currentCategory.id}`, currentCategory);
      }
      setShowModal(false);
      setPage(1);
      setSearch('');
      // Refetch
      const res = await axios.get(`${API_BASE}/categories`, { 
        params: { page: 1, limit: PAGE_SIZE } 
      });
      setCategories(res.data.categories || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${API_BASE}/categories/${id}`);
      // Refetch
      const res = await axios.get(`${API_BASE}/categories`, { 
        params: { page, limit: PAGE_SIZE } 
      });
      setCategories(res.data.categories || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting category');
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
        <Col><h3>Category Management</h3></Col>
        <Col xs="auto">
          <Button variant="primary" onClick={openAddModal}>Add Category</Button>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search categories..."
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
                <th>Name</th>
                <th>Description</th>
                <th>Product Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={5} className="text-center">No categories found</td></tr>
              ) : categories.map((category, idx) => (
                <tr key={category.id}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>{category.name}</td>
                  <td>{category.description || 'N/A'}</td>
                  <td>{category.productCount || 0}</td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="warning" 
                      className="me-2" 
                      onClick={() => openEditModal(category)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>{paginationItems}</Pagination>
        </>
      )}

      {/* Category Modal */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'add' ? 'Add Category' : 'Edit Category'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={currentCategory.name}
                onChange={e => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                placeholder="Enter category name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentCategory.description}
                onChange={e => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                placeholder="Enter category description"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CategoryManagement; 