const fs = require('fs');
const path = require('path');

// Database path
const databasePath = path.join(__dirname, 'src', 'data', 'database.json');

// Read existing database
const data = JSON.parse(fs.readFileSync(databasePath, 'utf8'));

// Get the current highest product ID
const highestId = Math.max(...data.products.map(p => p.id), 0);
let nextId = highestId + 1;

// Categories and brands (use existing ones from database)
const categories = data.categories;
const brands = data.brands;

// Function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Function to generate random number between min and max (inclusive)
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Function to generate random price between min and max with 2 decimal places
const getRandomPrice = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));

// CPU options
const cpuOptions = [
  'Intel Core i9-13900K',
  'Intel Core i7-13700K',
  'Intel Core i5-13600K',
  'Intel Core i9-12900K',
  'Intel Core i7-12700K',
  'Intel Core i5-12600K',
  'AMD Ryzen 9 7950X',
  'AMD Ryzen 7 7700X',
  'AMD Ryzen 5 7600X',
  'AMD Ryzen 9 5950X',
  'AMD Ryzen 7 5800X',
  'AMD Ryzen 5 5600X'
];

// GPU options
const gpuOptions = [
  'NVIDIA RTX 4090 24GB',
  'NVIDIA RTX 4080 16GB',
  'NVIDIA RTX 4070 Ti 12GB',
  'NVIDIA RTX 4070 12GB',
  'NVIDIA RTX 3090 Ti 24GB',
  'NVIDIA RTX 3080 Ti 12GB',
  'NVIDIA RTX 3070 Ti 8GB',
  'AMD Radeon RX 7900 XTX 24GB',
  'AMD Radeon RX 7900 XT 20GB',
  'AMD Radeon RX 6950 XT 16GB',
  'AMD Radeon RX 6800 XT 16GB',
  'Intel Arc A770 16GB'
];

// RAM options
const ramOptions = [
  '8GB DDR4 RAM',
  '16GB DDR4 RAM',
  '32GB DDR4 RAM',
  '64GB DDR4 RAM',
  '16GB DDR5 RAM',
  '32GB DDR5 RAM',
  '64GB DDR5 RAM',
  '128GB DDR5 RAM'
];

// Storage options
const storageOptions = [
  '256GB NVMe SSD',
  '512GB NVMe SSD',
  '1TB NVMe SSD',
  '2TB NVMe SSD',
  '4TB NVMe SSD',
  '1TB SSD + 2TB HDD',
  '2TB SSD + 4TB HDD',
  '1TB SSD + 8TB HDD'
];

// PSU options
const psuOptions = [
  '500W 80+ Bronze PSU',
  '650W 80+ Bronze PSU',
  '750W 80+ Gold PSU',
  '850W 80+ Gold PSU',
  '1000W 80+ Gold PSU',
  '1200W 80+ Platinum PSU',
  '1500W 80+ Titanium PSU'
];

// Cooling options
const coolingOptions = [
  'Air Cooling',
  'Basic Liquid Cooling',
  'Advanced Liquid Cooling',
  '360mm AIO Liquid Cooler',
  '240mm AIO Liquid Cooler',
  'Custom Loop Liquid Cooling'
];

// Computer types with sample names
const computerTypes = [
  {
    category: 'Gaming PC',
    names: [
      'Ultimate Gaming Rig',
      'Pro Gamer Setup',
      'Elite Gaming PC',
      'Extreme Gaming Machine',
      'RGB Gaming Powerhouse',
      'Competitive Gaming PC',
      'High FPS Gaming Build'
    ]
  },
  {
    category: 'Office PC',
    names: [
      'Business Desktop',
      'Office Workstation',
      'Professional Desktop',
      'Business Solution PC',
      'Productivity Powerhouse',
      'Office Efficiency PC'
    ]
  },
  {
    category: 'Workstation',
    names: [
      'Content Creator Workstation',
      'Professional Workstation',
      'Video Editing PC',
      '3D Rendering Beast',
      'Design Studio PC',
      'Developer Workstation'
    ]
  }
];

// New products array
const newProducts = [];

// Generate 10 random products
for (let i = 0; i < 10; i++) {
  // Pick a random computer type
  const computerType = getRandomItem(computerTypes);
  const category = computerType.category;
  
  // Generate product specs
  const cpu = getRandomItem(cpuOptions);
  const gpu = getRandomItem(gpuOptions);
  const ram = getRandomItem(ramOptions);
  const storage = getRandomItem(storageOptions);
  const psu = getRandomItem(psuOptions);
  const cooling = getRandomItem(coolingOptions);
  
  // Get random brand
  const brand = getRandomItem(brands);
  
  // Determine price based on specs (higher specs = higher price)
  let basePrice = 0;
  
  // CPU pricing
  if (cpu.includes('i9') || cpu.includes('Ryzen 9')) basePrice += getRandomPrice(500, 700);
  else if (cpu.includes('i7') || cpu.includes('Ryzen 7')) basePrice += getRandomPrice(350, 500);
  else basePrice += getRandomPrice(200, 350);
  
  // GPU pricing
  if (gpu.includes('4090') || gpu.includes('7900 XTX')) basePrice += getRandomPrice(1200, 1800);
  else if (gpu.includes('4080') || gpu.includes('7900 XT')) basePrice += getRandomPrice(800, 1200);
  else if (gpu.includes('4070') || gpu.includes('6950')) basePrice += getRandomPrice(500, 800);
  else basePrice += getRandomPrice(300, 500);
  
  // RAM pricing
  if (ram.includes('128GB')) basePrice += getRandomPrice(400, 600);
  else if (ram.includes('64GB')) basePrice += getRandomPrice(250, 400);
  else if (ram.includes('32GB')) basePrice += getRandomPrice(150, 250);
  else basePrice += getRandomPrice(50, 150);
  
  // Storage pricing
  if (storage.includes('4TB NVMe')) basePrice += getRandomPrice(400, 600);
  else if (storage.includes('2TB NVMe')) basePrice += getRandomPrice(200, 400);
  else if (storage.includes('1TB NVMe')) basePrice += getRandomPrice(100, 200);
  else basePrice += getRandomPrice(50, 100);
  
  // Round to nearest 100 and add some randomness
  let finalPrice = Math.round(basePrice / 100) * 100;
  finalPrice += getRandomNumber(-50, 50);
  finalPrice = Math.max(finalPrice, 599); // Minimum price
  
  // Create product name
  const name = `${getRandomItem(computerType.names)} ${getRandomItem(['Plus', 'Pro', 'Elite', 'Max', 'Ultra', ''])}`.trim();
  
  // Generate random rating between 3.5 and 5.0
  const rating = Number((Math.random() * 1.5 + 3.5).toFixed(1));
  
  // Generate random number of reviews between 3 and 25
  const numReviews = getRandomNumber(3, 25);
  
  // Generate random stock between 5 and 50
  const countInStock = getRandomNumber(5, 50);
  
  // Create reviews
  const reviews = [];
  for (let j = 0; j < 3; j++) {
    const reviewRating = getRandomNumber(3, 5);
    const reviewerNames = ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Sam', 'Chris', 'Pat'];
    
    let comment = '';
    if (reviewRating === 5) {
      comment = getRandomItem([
        'Absolutely love this computer! Blazing fast performance.',
        'Best PC I\'ve ever owned. Worth every penny!',
        'Exceeds all my expectations. Amazing build quality.',
        'Perfect for all my needs. Highly recommend!'
      ]);
    } else if (reviewRating === 4) {
      comment = getRandomItem([
        'Great computer, very happy with the performance.',
        'Works really well for my needs, just a few minor issues.',
        'Very good value for the price. Almost perfect.',
        'Solid performance and build quality, very satisfied.'
      ]);
    } else {
      comment = getRandomItem([
        'Decent computer, but expected more for the price.',
        'Works okay, but has some performance issues.',
        'Adequate for basic tasks, but struggles with heavier workloads.',
        'It meets my basic needs, but wouldn\'t recommend for power users.'
      ]);
    }
    
    reviews.push({
      name: getRandomItem(reviewerNames),
      rating: reviewRating,
      comment
    });
  }
  
  // Create product object
  const product = {
    id: nextId++,
    name,
    image: `https://via.placeholder.com/600x400?text=${encodeURIComponent(name.replace(/ /g, '+'))}`,
    brand,
    category,
    description: `High-quality ${category.toLowerCase()} featuring ${cpu}, ${gpu}, and ${ram}. Perfect for ${category === 'Gaming PC' ? 'gaming and streaming' : category === 'Office PC' ? 'business and productivity' : 'content creation and professional work'}.`,
    price: Number(finalPrice.toFixed(2)),
    countInStock,
    rating,
    numReviews,
    featured: Math.random() > 0.7, // 30% chance to be featured
    specs: [
      cpu,
      gpu,
      ram,
      storage,
      psu,
      cooling,
      getRandomItem(['RGB Lighting', 'Tempered Glass Case', 'Compact Design', 'Quiet Cooling', 'Wi-Fi 6E', 'Bluetooth 5.2'])
    ],
    reviews,
    createdAt: new Date().toISOString()
  };
  
  newProducts.push(product);
}

// Add new products to existing data
data.products = [...data.products, ...newProducts];

// Write updated data back to database.json
fs.writeFileSync(databasePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Successfully added 10 new products to database.json (IDs ${highestId + 1} to ${nextId - 1})`);
