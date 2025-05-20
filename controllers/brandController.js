const path = require('path');
const fs = require('fs');
const databasePath = path.join(__dirname, '../src/data/database.json');

// Helper function to ensure database directory exists
const ensureDatabaseExists = () => {
  const dirPath = path.dirname(databasePath);
  
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      return false;
    }
  }
  
  if (!fs.existsSync(databasePath)) {
    try {
      const initialData = {
        categories: [],
        brands: [],
        users: [],
        products: [],
        orders: [],
        reviews: []
      };
      fs.writeFileSync(databasePath, JSON.stringify(initialData, null, 2), 'utf8');
      console.log(`Created database file: ${databasePath}`);
    } catch (error) {
      console.error(`Error creating database file ${databasePath}:`, error);
      return false;
    }
  }
  
  return true;
};

// Helper function to read database
const readDatabase = () => {
  try {
    ensureDatabaseExists();
    
    const data = fs.readFileSync(databasePath, 'utf8');
    
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
      fs.writeFileSync(databasePath, JSON.stringify(initialData, null, 2), 'utf8');
      
      return initialData;
    }
  } catch (error) {
    console.error('Error reading database:', error);
    return { 
      categories: [],
      brands: [],
      users: [],
      products: [],
      orders: [],
      reviews: []
    };
  }
};

// Helper function to write to database
const writeDatabase = (data) => {
  try {
    ensureDatabaseExists();
    fs.writeFileSync(databasePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// Get all brands
exports.getBrands = (req, res) => {
  try {
    const data = readDatabase();
    const brands = data.brands || [];
    
    res.json({
      success: true,
      brands: brands,
      total: brands.length
    });
  } catch (error) {
    console.error('Error in getBrands:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch brands' });
  }
};

// Create new brand
exports.createBrand = (req, res) => {
  try {
    const { name, description, logo } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Brand name is required' });
    }
    
    const data = readDatabase();
    const brands = data.brands || [];
    
    // Generate new ID
    const id = brands.length > 0 ? Math.max(...brands.map(b => b.id)) + 1 : 1;
    
    const newBrand = {
      id,
      name,
      description: description || '',
      logo: logo || '',
      createdAt: new Date().toISOString()
    };
    
    // Add to brands array
    brands.push(newBrand);
    data.brands = brands;
    
    // Save to database
    const success = writeDatabase(data);
    
    if (success) {
      res.status(201).json({ success: true, brand: newBrand });
    } else {
      res.status(500).json({ success: false, message: 'Failed to save brand to database' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create brand' });
  }
};

// Update existing brand
exports.updateBrand = (req, res) => {
  try {
    const { id, name, description, logo } = req.body;
    
    if (!id || !name) {
      return res.status(400).json({ success: false, message: 'Brand ID and name are required' });
    }
    
    const data = readDatabase();
    const brands = data.brands || [];
    
    // Find brand index
    const brandIndex = brands.findIndex(b => b.id === parseInt(id));
    
    if (brandIndex === -1) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    
    // Update brand
    brands[brandIndex] = {
      ...brands[brandIndex],
      name,
      description: description || brands[brandIndex].description,
      logo: logo || brands[brandIndex].logo,
      updatedAt: new Date().toISOString()
    };
    
    data.brands = brands;
    
    // Save to database
    const success = writeDatabase(data);
    
    if (success) {
      res.json({ success: true, brand: brands[brandIndex] });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update brand in database' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update brand' });
  }
};

// Delete brand
exports.deleteBrand = (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Brand ID is required' });
    }
    
    const data = readDatabase();
    const brands = data.brands || [];
    
    // Find brand index
    const brandIndex = brands.findIndex(b => b.id === parseInt(id));
    
    if (brandIndex === -1) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    
    // Remove brand
    const deletedBrand = brands[brandIndex];
    brands.splice(brandIndex, 1);
    data.brands = brands;
    
    // Save to database
    const success = writeDatabase(data);
    
    if (success) {
      res.json({ success: true, message: 'Brand deleted successfully', brandId: parseInt(id) });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete brand from database' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete brand' });
  }
}; 