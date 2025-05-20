import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button, Spinner, Alert, Form, Modal, Pagination } from 'react-bootstrap';
import axios from 'axios';

const API_BASE = 'http://localhost:5678/api';
const PAGE_SIZE = 10;

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' | 'edit'
  const [currentBrand, setCurrentBrand] = useState({ name: '', description: '', logo: '' });
  const [saving, setSaving] = useState(false);

  // Fetch brands
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Check server health
        const health = await axios.get(`${API_BASE}/health`);
        if (health.data.status !== 'ok') throw new Error('Server not ready');
        
        // Get brands
        const res = await axios.get(`${API_BASE}/brands`, {
          params: { 
            q: search, 
            page, 
            limit: PAGE_SIZE, 
            sort: 'name_asc' 
          },
        });
        setBrands(res.data.brands || []);
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
    setCurrentBrand({ name: '', description: '', logo: '' });
    setShowModal(true);
  };

  const openEditModal = (brand) => {
    setModalType('edit');
    setCurrentBrand({ ...brand });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentBrand({ name: '', description: '', logo: '' });
  };

  // Save brand (add or edit)
  const handleSave = async () => {
    if (!currentBrand.name.trim()) {
      alert('Brand name is required');
      return;
    }

    setSaving(true);
    try {
      if (modalType === 'add') {
        await axios.post(`${API_BASE}/brands`, currentBrand);
      } else {
        await axios.put(`${API_BASE}/brands/${currentBrand.id}`, currentBrand);
      }
      setShowModal(false);
      setPage(1);
      setSearch('');
      // Refetch
      const res = await axios.get(`${API_BASE}/brands`, { 
        params: { page: 1, limit: PAGE_SIZE } 
      });
      setBrands(res.data.brands || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving brand');
    } finally {
      setSaving(false);
    }
  };

  // Delete brand
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    try {
      await axios.delete(`${API_BASE}/brands/${id}`);
      // Refetch
      const res = await axios.get(`${API_BASE}/brands`, { 
        params: { page, limit: PAGE_SIZE } 
      });
      setBrands(res.data.brands || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting brand');
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
        <Col><h3>Brand Management</h3></Col>
        <Col xs="auto">
          <Button variant="primary" onClick={openAddModal}>Add Brand</Button>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search brands..."
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
                <th>Logo</th>
                <th>Name</th>
                <th>Description</th>
                <th>Product Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr><td colSpan={6} className="text-center">No brands found</td></tr>
              ) : brands.map((brand, idx) => (
                <tr key={brand.id}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>
                    {brand.logo ? (
                      <img 
                        src={brand.logo} 
                        alt={brand.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
                      />
                    ) : (
                      <div className="text-muted">No logo</div>
                    )}
                  </td>
                  <td>{brand.name}</td>
                  <td>{brand.description || 'N/A'}</td>
                  <td>{brand.productCount || 0}</td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="warning" 
                      className="me-2" 
                      onClick={() => openEditModal(brand)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(brand.id)}
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

      {/* Brand Modal */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'add' ? 'Add Brand' : 'Edit Brand'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Brand Name</Form.Label>
              <Form.Control
                type="text"
                value={currentBrand.name}
                onChange={e => setCurrentBrand({ ...currentBrand, name: e.target.value })}
                placeholder="Enter brand name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentBrand.description}
                onChange={e => setCurrentBrand({ ...currentBrand, description: e.target.value })}
                placeholder="Enter brand description"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Logo URL</Form.Label>
              <Form.Control
                type="text"
                value={currentBrand.logo}
                onChange={e => setCurrentBrand({ ...currentBrand, logo: e.target.value })}
                placeholder="Enter logo URL"
              />
              {currentBrand.logo && (
                <div className="mt-2">
                  <img 
                    src={currentBrand.logo} 
                    alt="Brand logo preview" 
                    style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} 
                  />
                </div>
              )}
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

export default BrandManagement; 