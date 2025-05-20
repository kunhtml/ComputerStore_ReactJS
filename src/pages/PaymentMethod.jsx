import React, { useState, useEffect } from 'react';
import { Form, Button, Col, Card } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { useNavigate } from 'react-router-dom';

const PaymentMethod = () => {
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if shipping address exists in localStorage
    const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress') || 'null');
    
    if (!shippingAddress || !shippingAddress.address) {
      navigate('/shipping');
    }
  }, [navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    // Save payment method to localStorage
    localStorage.setItem('paymentMethod', JSON.stringify(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>Payment Method</h1>
      <Card className='mt-3'>
        <Card.Body>
          <Form onSubmit={submitHandler}>
            <Form.Group>
              <Form.Label as='legend'>Select Method</Form.Label>
              <Col>
                <Form.Check
                  type='radio'
                  label='PayPal or Credit Card'
                  id='PayPal'
                  name='paymentMethod'
                  value='PayPal'
                  checked
                  onChange={(e) => setPaymentMethod(e.target.value)}
                ></Form.Check>
                {/* Add more payment methods here if needed */}
              </Col>
            </Form.Group>

            <Button type='submit' variant='primary' className='mt-3'>
              Continue
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </FormContainer>
  );
};

export default PaymentMethod;
