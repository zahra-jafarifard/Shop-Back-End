const express = require('express');
const router = express.Router();

const categorisControllers = require('../controllers/categories-controller');

router.get('/', categorisControllers.getAll);
router.post('/', categorisControllers.add);
router.patch('/:categoryId', categorisControllers.update);
router.get('/:categoryId/products', categorisControllers.getProductsByCategory);


module.exports = router;