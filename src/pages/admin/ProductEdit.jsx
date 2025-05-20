import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAppContext } from "../../context/AppContext";

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

  // Lấy danh sách categories và brands từ localStorage
  useEffect(() => {
    const loadCategoriesAndBrands = () => {
      try {
        // Lấy dữ liệu từ localStorage
        const databaseData = JSON.parse(
          localStorage.getItem("databaseData") || "{}"
        );

        // Lấy danh sách categories
        if (databaseData.categories && Array.isArray(databaseData.categories)) {
          setCategories(databaseData.categories);
        } else {
          // Nếu không có dữ liệu categories trong localStorage, lấy từ products
          const products = databaseData.products || [];
          const uniqueCategories = [
            ...new Set(products.map((product) => product.category)),
          ];
          setCategories(uniqueCategories);
        }

        // Lấy danh sách brands
        if (databaseData.brands && Array.isArray(databaseData.brands)) {
          setBrands(databaseData.brands);
        } else {
          // Nếu không có dữ liệu brands trong localStorage, lấy từ products
          const products = databaseData.products || [];
          const uniqueBrands = [
            ...new Set(products.map((product) => product.brand)),
          ];
          setBrands(uniqueBrands);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh mục và thương hiệu:", err);
      }
    };

    loadCategoriesAndBrands();
  }, []);

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate("/login");
      return;
    }

    // Nếu là chế độ chỉnh sửa sản phẩm hiện có
    if (productId && productId !== "new") {
      // Fetch product details if in edit mode
      const fetchProduct = async () => {
        try {
          setLoading(true);
          // Get product using the context function
          const product = await fetchProductById(productId);

          if (product) {
            setName(product.name);
            setPrice(product.price);
            setImage(product.image);
            setBrand(product.brand);
            setCategory(product.category);
            setCountInStock(product.countInStock || 0);
            setDescription(product.description);
          } else {
            setError("Product not found");
            toast.error("Không tìm thấy sản phẩm");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          setError("Error loading product");
          toast.error("Lỗi khi tải thông tin sản phẩm");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
      // Nếu là chế độ tạo sản phẩm mới
      setName("Sản phẩm mới");
      setPrice(0);
      setImage("https://via.placeholder.com/600x400?text=New+Product");
      setBrand(brands.length > 0 ? brands[0] : "Brand");
      setCategory(categories.length > 0 ? categories[0] : "Category");
      setCountInStock(0);
      setDescription("Mô tả sản phẩm mới");
      setLoading(false);
    }
  }, [productId, navigate, userInfo, fetchProductById, brands, categories]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // In a real app, you would upload the file to a server
      // For demo purposes, we'll just create a local URL for the image
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Chuẩn bị dữ liệu sản phẩm
      const productData = {
        name,
        price: Number(parseFloat(price).toFixed(2)), // Ensure consistent price format
        image,
        brand,
        category,
        description,
        countInStock: Number(countInStock),
      };

      if (productId && productId !== "new") {
        // Cập nhật sản phẩm hiện có
        await updateProduct(productId, productData);
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        // Tạo sản phẩm mới
        await createProduct(productData);
        toast.success("Tạo sản phẩm mới thành công");
      }

      // Chuyển hướng về trang danh sách sản phẩm
      navigate("/admin/productlist");
    } catch (error) {
      toast.error(error.message || "Lỗi khi lưu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Link to="/admin/productlist" className="btn btn-light my-3">
        Go Back
      </Link>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="p-4">
            <h1 className="text-center mb-4">
              {productId ? "Edit Product" : "Create Product"}
            </h1>
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="price" className="mb-3">
                <Form.Label>Price (${price})</Form.Label>
                <Form.Control
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
                <Form.Control 
                  type="number" 
                  placeholder="Enter exact price" 
                  value={price} 
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="mt-2"
                  required
                />
              </Form.Group>

              <Form.Group controlId="image" className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter image URL"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                <Form.Control
                  type="file"
                  label="Choose file"
                  onChange={uploadFileHandler}
                  className="mt-2"
                />
                {uploading && <div>Uploading...</div>}
              </Form.Group>

              <Form.Group controlId="brand" className="mb-3">
                <Form.Label>Brand</Form.Label>
                <Form.Select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                >
                  {brands.length > 0 ? (
                    brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))
                  ) : (
                    <option value="">No brands available</option>
                  )}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="category" className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  ) : (
                    <option value="">No categories available</option>
                  )}
                </Form.Select>
              </Form.Group>

              <Form.Group controlId="countInStock" className="mb-3">
                <Form.Label>Count In Stock</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter count in stock"
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="description" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="d-grid">
                <Button type="submit" variant="primary" size="lg">
                  {productId ? "Update" : "Create"}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductEdit;
