import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
} from "react-bootstrap";
import { useAppContext } from "../context/AppContext";
import axios from "../services/axiosConfig";

const ProductDetail = () => {
  const [product, setProduct] = useState({});
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useAppContext();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // Lấy dữ liệu từ database.json thông qua axios
        const products = axios.database.products || [];
        const foundProduct = products.find((p) => p.id === parseInt(id));

        if (foundProduct) {
          setProduct({
            ...foundProduct,
            _id: foundProduct.id.toString(),
            image:
              foundProduct.image ||
              "https://via.placeholder.com/600x400?text=No+Image",
            specs: foundProduct.specs || [],
          });
        } else {
          setError("Không tìm thấy sản phẩm");
        }
        setLoading(false);
      } catch (err) {
        setError("Lỗi khi tải thông tin sản phẩm");
        console.error("Lỗi:", err);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    try {
      // Sử dụng hàm addToCart từ context
      addToCart(product, qty);
      navigate("/cart");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      setError("Không thể thêm sản phẩm vào giỏ hàng");
    }
  };

  return (
    <>
      <Link className="btn btn-light my-3" to="/">
        Go Back
      </Link>
      {loading ? (
        <h2>Loading...</h2>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <Row>
          <Col md={6}>
            <Image src={product.image} alt={product.name} fluid />
          </Col>
          <Col md={3}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h3>{product.name}</h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="my-3">
                  <strong>Description:</strong> {product.description}
                </div>
              </ListGroup.Item>
              <ListGroup.Item>
                <h4>Features:</h4>
                <ul>
                  {product.specs?.map((spec, index) => (
                    <li key={index}>{spec}</li>
                  ))}
                </ul>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>
                      <strong>${product.price}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Qty</Col>
                      <Col>
                        <Form.Control
                          as="select"
                          value={qty}
                          onChange={(e) => setQty(Number(e.target.value))}
                        >
                          {[...Array(product.countInStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Control>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}

                <ListGroup.Item>
                  <Button
                    onClick={addToCartHandler}
                    className="btn-block w-100"
                    type="button"
                    disabled={product.countInStock === 0}
                  >
                    Add to Cart
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default ProductDetail;
