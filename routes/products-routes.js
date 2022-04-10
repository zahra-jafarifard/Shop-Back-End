const express = require('express');

const router = express.Router();

const productsControllers = require('../controllers/products-controllers');

router.get('/category/', productsControllers.getProductsByCategory);
router.get('/:productId', productsControllers.getById);
router.get('/', productsControllers.getAll);
router.delete('/:productId', productsControllers.delete);
router.patch('/:productId', productsControllers.update);
router.post('/newProduct', productsControllers.add);


module.exports = router;