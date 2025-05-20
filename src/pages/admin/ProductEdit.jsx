import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAppContext } from "../../context/AppContext";
import { getProductById, getCategories, getBrands } from "../../utils/databaseUtils";

const ProductEdit = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const {
    userInfo,
    fetchProductById,
    createProduct,
    updateProduct,
    productsLoading,
  } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  // State cho danh sách categories và brands
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Lấy danh sách categories và brands từ database.json trong src/data
  useEffect(() => {
    const loadCategoriesAndBrands = async () => {
      try {
        // Sử dụng hàm tiện ích để lấy danh sách categories
        const uniqueCategories = await getCategories();
        console.log('Categories loaded for product edit:', uniqueCategories);
        setCategories(uniqueCategories);

        // Sử dụng hàm tiện ích để lấy danh sách brands
        const uniqueBrands = await getBrands();
        console.log('Brands loaded for product edit:', uniqueBrands);
        setBrands(uniqueBrands);
      } catch (error) {
        console.error('Error loading categories and brands:', error);
        toast.error('Failed to load categories and brands');
        
        // Set default values if loading fails
        setCategories(['Gaming PC', 'Office PC', 'Workstation']);
        setBrands(['GamingTech', 'OfficePro', 'CreatorPro']);
      }
    };

    loadCategoriesAndBrands();
  }, []);

  // Lấy thông tin sản phẩm khi component mount hoặc productId thay đổi
  useEffect(() => {
    const loadProductDetails = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        
        // Sử dụng hàm tiện ích để lấy thông tin sản phẩm
        const product = await getProductById(parseInt(productId));
        
        if (product) {
          setName(product.name);
          setPrice(product.price);
          setImage(product.image);
          setBrand(product.brand);
          setCategory(product.category);
          setCountInStock(product.countInStock);
          setDescription(product.description);
          setError("");
        } else {
          setError("Không tìm thấy sản phẩm");
          toast.error("Không tìm thấy sản phẩm");
        }
      } catch (err) {
        setError("Lỗi khi tải thông tin sản phẩm");
        toast.error("Lỗi khi tải thông tin sản phẩm");
        console.error("Lỗi khi tải thông tin sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [productId]);

  // Xử lý khi submit form
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const updatedProduct = {
        id: parseInt(productId),
        name,
        price: parseFloat(price),
        image,
        brand,
        category,
        countInStock: parseInt(countInStock),
        description,
      };

      // Gọi API để cập nhật sản phẩm
      await updateProduct(updatedProduct);
      toast.success("Cập nhật sản phẩm thành công");
      navigate("/admin/productlist");
    } catch (error) {
      toast.error("Lỗi khi cập nhật sản phẩm");
      console.error("Lỗi khi cập nhật sản phẩm:", error);
    }
  };

  // Xử lý upload hình ảnh
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      // Giả lập upload hình ảnh
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Trong thực tế, bạn sẽ gửi formData lên server
      // const { data } = await axios.post('/api/upload', formData, config);
      
      // Thay vì gửi lên server, chúng ta sẽ tạo URL cho file local
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setUploading(false);
    } catch (error) {
      console.error("Lỗi khi upload hình ảnh:", error);
      setUploading(false);
    }
  };

  return (
    <Container className="py-3">
      <Link to="/admin/productlist" className="btn btn-light my-3">
        Quay lại
      </Link>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title as="h2" className="text-center mb-4">
                {productId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </Card.Title>
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <Form onSubmit={submitHandler}>
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Tên sản phẩm</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên sản phẩm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="price" className="mb-3">
                    <Form.Label>Giá</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Nhập giá"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="image" className="mb-3">
                    <Form.Label>Hình ảnh</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="URL hình ảnh"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      required
                    />
                    <Form.Control
                      type="file"
                      onChange={uploadFileHandler}
                      className="mt-2"
                    />
                    {uploading && (
                      <div className="spinner-border spinner-border-sm text-primary mt-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group controlId="brand" className="mb-3">
                    <Form.Label>Thương hiệu</Form.Label>
                    <Form.Select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      required
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group controlId="category" className="mb-3">
                    <Form.Label>Danh mục</Form.Label>
                    <Form.Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group controlId="countInStock" className="mb-3">
                    <Form.Label>Số lượng trong kho</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Nhập số lượng"
                      value={countInStock}
                      onChange={(e) => setCountInStock(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Mô tả</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Nhập mô tả sản phẩm"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary" className="w-100">
                    {productId ? "Cập nhật" : "Thêm mới"}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductEdit;
