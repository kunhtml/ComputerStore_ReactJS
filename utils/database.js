const fs = require('fs');
const path = require('path');

// Đường dẫn đến file database.json
const databasePath = path.join(__dirname, '..', 'src', 'data', 'database.json');

// Hàm đọc dữ liệu từ database.json
const readDatabase = () => {
  try {
    const data = fs.readFileSync(databasePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return null;
  }
};

// Hàm ghi dữ liệu vào database.json
const writeDatabase = (data) => {
  try {
    // Kiểm tra xem thư mục có tồn tại không
    const dirPath = path.dirname(databasePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }

    // Ghi dữ liệu vào file
    fs.writeFileSync(databasePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
};

module.exports = {
  readDatabase,
  writeDatabase,
  databasePath
}; 