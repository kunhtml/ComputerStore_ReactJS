const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

router.get('/', brandController.getBrands);
router.post('/', brandController.createBrand);
router.put('/', brandController.updateBrand);
router.delete('/', brandController.deleteBrand);

module.exports = router; 