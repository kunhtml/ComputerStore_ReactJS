import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { useNavigate } from 'react-router-dom';

const Shipping = () => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load shipping address from localStorage if it exists
    const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress') || '{}');
    if (shippingAddress) {
      setAddress(shippingAddress.address || '');
      setCity(shippingAddress.city || '');
      setPostalCode(shippingAddress.postalCode || '');
      setCountry(shippingAddress.country || '');
    }
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
    // Save shipping address to localStorage
    const shippingAddress = { address, city, postalCode, country };
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
    navigate('/payment');
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <CheckoutSteps step1 step2 />
          <h1>Shipping</h1>
          <Card>
            <Card.Body>
              <Form onSubmit={submitHandler}>
                <Form.Group controlId='address' className='py-2'>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter address'
                    value={address}
                    required
                    onChange={(e) => setAddress(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId='city' className='py-2'>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter city'
                    value={city}
                    required
                    onChange={(e) => setCity(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId='postalCode' className='py-2'>
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter postal code'
                    value={postalCode}
                    required
                    onChange={(e) => setPostalCode(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Form.Group controlId='country' className='py-2'>
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter country'
                    value={country}
                    required
                    onChange={(e) => setCountry(e.target.value)}
                  ></Form.Control>
                </Form.Group>

                <Button type='submit' variant='primary' className='mt-3'>
                  Continue
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Shipping;
