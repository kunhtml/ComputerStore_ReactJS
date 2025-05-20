# Computer Store - ReactJS Project

## Giới thiệu
Dự án Computer Store là một ứng dụng web thương mại điện tử được xây dựng bằng ReactJS, cho phép người dùng mua sắm các sản phẩm máy tính và phụ kiện. Dự án sử dụng kiến trúc client-server với RESTful API.

## Cấu trúc thư mục
```
ComputerStore_ReactJS/
├── public/                 # Thư mục chứa các file tĩnh
│   ├── uploads/           # Thư mục lưu trữ ảnh sản phẩm
│   └── database.json      # File database JSON
├── src/                   # Source code chính
│   ├── components/        # Các component tái sử dụng
│   ├── pages/            # Các trang chính của ứng dụng
│   ├── utils/            # Các utility function
│   └── App.js            # Component gốc
└── server/               # Backend API
    ├── controllers/      # Xử lý logic nghiệp vụ
    ├── models/          # Định nghĩa model
    └── routes/          # Định nghĩa route
```

## Công nghệ sử dụng
- Frontend: ReactJS, React Router, React Bootstrap
- Backend: Node.js, Express.js
- Database: JSON (có thể nâng cấp lên MongoDB)
- Authentication: JWT
- Image Upload: Multer

## Chi tiết các thành phần

### 1. Frontend (src/)

#### Components
- `Loader.jsx`: Component hiển thị trạng thái loading
- `Message.jsx`: Component hiển thị thông báo
- `Header.jsx`: Component header chứa navigation
- `Footer.jsx`: Component footer
- `Product.jsx`: Component hiển thị sản phẩm
- `Rating.jsx`: Component hiển thị đánh giá sao
- `FormContainer.jsx`: Component wrapper cho form
- `CheckoutSteps.jsx`: Component hiển thị các bước thanh toán

#### Pages
- `Home.jsx`: Trang chủ
  - Hiển thị carousel sản phẩm ngẫu nhiên
  - Danh sách danh mục
  - Sản phẩm nổi bật
  
- `Products.jsx`: Trang danh sách sản phẩm
  - Lọc theo danh mục
  - Lọc theo giá
  - Tìm kiếm sản phẩm
  
- `ProductDetail.jsx`: Trang chi tiết sản phẩm
  - Hiển thị thông tin chi tiết
  - Đánh giá sản phẩm
  - Thêm vào giỏ hàng
  
- `Cart.jsx`: Trang giỏ hàng
  - Danh sách sản phẩm
  - Cập nhật số lượng
  - Xóa sản phẩm
  - Tính tổng tiền
  
- `Login.jsx`: Trang đăng nhập
  - Form đăng nhập
  - Validation
  - Xử lý lỗi
  
- `Register.jsx`: Trang đăng ký
  - Form đăng ký
  - Validation
  - Xử lý lỗi
  
- `Profile.jsx`: Trang thông tin cá nhân
  - Hiển thị thông tin
  - Cập nhật thông tin
  - Xem lịch sử đơn hàng
  
- `Shipping.jsx`: Trang thông tin giao hàng
  - Form nhập địa chỉ
  - Validation
  
- `Payment.jsx`: Trang thanh toán
  - Chọn phương thức thanh toán
  - Validation
  
- `PlaceOrder.jsx`: Trang xác nhận đơn hàng
  - Tổng kết thông tin
  - Xác nhận đặt hàng
  
- `Order.jsx`: Trang chi tiết đơn hàng
  - Thông tin đơn hàng
  - Trạng thái đơn hàng
  - Thanh toán (nếu chưa thanh toán)

#### Admin Pages
- `ProductManagement.jsx`: Quản lý sản phẩm
  - Thêm/sửa/xóa sản phẩm
  - Upload ảnh
  - Quản lý danh mục
  
- `OrderList.jsx`: Quản lý đơn hàng
  - Xem danh sách đơn hàng
  - Cập nhật trạng thái
  - Xem chi tiết đơn hàng
  
- `UserList.jsx`: Quản lý người dùng
  - Xem danh sách người dùng
  - Phân quyền
  - Xóa người dùng

### 2. Backend (server/)

#### Controllers
- `productController.js`: Xử lý logic sản phẩm
  - Lấy danh sách sản phẩm
  - Lấy chi tiết sản phẩm
  - Thêm/sửa/xóa sản phẩm
  - Upload ảnh
  
- `userController.js`: Xử lý logic người dùng
  - Đăng ký/đăng nhập
  - Cập nhật thông tin
  - Quản lý quyền
  
- `orderController.js`: Xử lý logic đơn hàng
  - Tạo đơn hàng
  - Cập nhật trạng thái
  - Xử lý thanh toán

#### Models
- `productModel.js`: Model sản phẩm
  - Schema sản phẩm
  - Các phương thức CRUD
  
- `userModel.js`: Model người dùng
  - Schema người dùng
  - Các phương thức CRUD
  
- `orderModel.js`: Model đơn hàng
  - Schema đơn hàng
  - Các phương thức CRUD

#### Routes
- `productRoutes.js`: API routes cho sản phẩm
- `userRoutes.js`: API routes cho người dùng
- `orderRoutes.js`: API routes cho đơn hàng
- `uploadRoutes.js`: API routes cho upload ảnh

### 3. Validation

#### Frontend Validation
- Form đăng ký:
  - Tên: bắt buộc, ít nhất 2 ký tự
  - Email: bắt buộc, đúng định dạng email
  - Mật khẩu: bắt buộc, ít nhất 6 ký tự
  - Xác nhận mật khẩu: phải khớp với mật khẩu

- Form đăng nhập:
  - Email: bắt buộc, đúng định dạng email
  - Mật khẩu: bắt buộc

- Form thông tin giao hàng:
  - Địa chỉ: bắt buộc
  - Thành phố: bắt buộc
  - Mã bưu điện: bắt buộc
  - Quốc gia: bắt buộc

- Form thanh toán:
  - Phương thức thanh toán: bắt buộc

#### Backend Validation
- Sản phẩm:
  - Tên: bắt buộc
  - Giá: bắt buộc, phải là số dương
  - Danh mục: bắt buộc
  - Thương hiệu: bắt buộc
  - Số lượng: bắt buộc, phải là số nguyên dương

- Đơn hàng:
  - Thông tin giao hàng: bắt buộc
  - Phương thức thanh toán: bắt buộc
  - Sản phẩm: bắt buộc, phải có ít nhất 1 sản phẩm

### 4. Security
- JWT Authentication
- Password Hashing
- Input Validation
- XSS Protection
- CORS Configuration

### 5. Error Handling
- Frontend:
  - Hiển thị thông báo lỗi
  - Xử lý lỗi API
  - Validation errors
  
- Backend:
  - Try-catch blocks
  - Error middleware
  - Validation errors
  - Custom error messages

### 6. Performance Optimization
- Lazy Loading
- Image Optimization
- Code Splitting
- Caching
- Pagination

## Cài đặt và Chạy

### Yêu cầu
- Node.js >= 14.0.0
- npm >= 6.0.0

### Cài đặt
1. Clone repository:
```bash
git clone [repository-url]
```

2. Cài đặt dependencies:
```bash
# Frontend
cd ComputerStore_ReactJS
npm install

# Backend
cd server
npm install
```

3. Tạo file .env trong thư mục server:
```
PORT=5678
JWT_SECRET=your_jwt_secret
```

### Chạy ứng dụng
1. Chạy backend:
```bash
cd server
npm start
```

2. Chạy frontend:
```bash
cd ComputerStore_ReactJS
npm start
```

## API Endpoints

### Products
- GET /api/products - Lấy danh sách sản phẩm
- GET /api/products/:id - Lấy chi tiết sản phẩm
- POST /api/products - Thêm sản phẩm mới
- PUT /api/products/:id - Cập nhật sản phẩm
- DELETE /api/products/:id - Xóa sản phẩm

### Users
- POST /api/users/login - Đăng nhập
- POST /api/users/register - Đăng ký
- GET /api/users/profile - Lấy thông tin người dùng
- PUT /api/users/profile - Cập nhật thông tin

### Orders
- POST /api/orders - Tạo đơn hàng mới
- GET /api/orders/:id - Lấy chi tiết đơn hàng
- GET /api/orders/myorders - Lấy danh sách đơn hàng của user
- PUT /api/orders/:id/pay - Cập nhật trạng thái thanh toán
- PUT /api/orders/:id/deliver - Cập nhật trạng thái giao hàng

## Contributing
1. Fork repository
2. Tạo branch mới
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License
MIT License 