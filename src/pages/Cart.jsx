import React, { useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import formatPrice from "../utils/formatPrice";

const Cart = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { cartItems, removeFromCart, addToCart, clearCart, userInfo, fetchProducts } = useAppContext();
  
  // Get qty from URL query params
  const qty = new URLSearchParams(location.search).get('qty') 
    ? Number(new URLSearchParams(location.search).get('qty'))
    : 1;
    
  // Add to cart when component mounts if id is present in URL
  useEffect(() => {
    if (id) {
      const fetchProductAndAddToCart = async () => {
        try {
          // Fetch product data
          const response = await fetch(`http://localhost:5678/api/products/${id}`);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error('Failed to fetch product');
          }
          
          if (data.product) {
            // Product found, add to cart
            addToCart(data.product, qty);
            toast.success(`${data.product.name} added to cart`);
            
            // Navigate back to cart without parameters to avoid adding again on refresh
            navigate('/cart', { replace: true });
          } else {
            toast.error('Product not found');
          }
        } catch (error) {
          console.error('Error adding product to cart:', error);
          toast.error('Failed to add product to cart');
        }
      };
      
      fetchProductAndAddToCart();
    }
  }, [id, qty, addToCart, navigate]);

  const removeFromCartHandler = (id) => {
    removeFromCart(id);
    toast.success("Item removed from cart");
  };

  const updateCartHandler = (product, qty) => {
    addToCart(product, qty);
    toast.success("Cart updated");
  };

  const clearCartHandler = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      toast.success("Cart cleared successfully");
    }
  };

  const checkoutHandler = () => {
    if (!userInfo) {
      navigate("/login?redirect=shipping");
    } else {
      navigate("/shipping");
    }
  };

  return (
    <Row>
      <Col md={8}>
        <h1>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="alert alert-info">
            Your cart is empty <Link to="/">Go Back</Link>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-end mb-3">
              <Button
                variant="outline-danger"
                className="btn-sm"
                onClick={clearCartHandler}
              >
                <i className="fas fa-trash mr-2"></i> Clear Cart
              </Button>
            </div>
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item key={item.product || item.id}>
                  <Row>
                    <Col md={2}>
                      <Image src={item.image} alt={item.name} fluid rounded />
                    </Col>
                    <Col md={3}>
                      <Link to={`/products/${item.product || item.id}`}>{item.name}</Link>
                    </Col>
                    <Col md={2}>{formatPrice(item.price)}</Col>
                    <Col md={2}>
                      <Form.Control
                        as="select"
                        value={item.qty}
                        onChange={(e) =>
                          updateCartHandler(item, Number(e.target.value))
                        }
                      >
                        {[...Array(item.countInStock || 10).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col md={2}>
                      <Button
                        type="button"
                        variant="light"
                        onClick={() =>
                          removeFromCartHandler(item.id || item.product)
                        }
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Col>
      <Col md={4}>
        <Card>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>
                Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
                items
              </h2>
              {formatPrice(
                cartItems.reduce((acc, item) => acc + item.qty * item.price, 0)
              )}
            </ListGroup.Item>
            <ListGroup.Item>
              <Button
                type="button"
                className="btn-block w-100"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed To Checkout
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
};

export default Cart;
