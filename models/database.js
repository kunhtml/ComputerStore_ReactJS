const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../src/data/database.json');

// Ensure database directory and file exist
const ensureDatabaseExists = () => {
  const dirPath = path.dirname(dbPath);
  
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      return false;
    }
  }
  
  if (!fs.existsSync(dbPath)) {
    try {
      const initialData = {
        categories: [],
        brands: [],
        users: [],
        products: [],
        orders: [],
        reviews: []
      };
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf8');
      console.log(`Created database file: ${dbPath}`);
    } catch (error) {
      console.error(`Error creating database file ${dbPath}:`, error);
      return false;
    }
  }
  
  return true;
};

function readDatabase() {
  try {
    ensureDatabaseExists();
    
    const data = fs.readFileSync(dbPath, 'utf8');
    
    try {
      return JSON.parse(data);
    } catch (parseError) {
      console.error('Invalid JSON in database file. Creating new database file.');
      
      // Create a new valid database file if current one is corrupted
      const initialData = {
        categories: [],
        brands: [],
        users: [],
        products: [],
        orders: [],
        reviews: []
      };
      fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf8');
      
      return initialData;
    }
  } catch (error) {
    throw new Error('Không thể đọc database: ' + error.message);
  }
}

function writeDatabase(data) {
  try {
    ensureDatabaseExists();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    throw new Error('Không thể ghi database: ' + error.message);
  }
}

module.exports = { readDatabase, writeDatabase }; 