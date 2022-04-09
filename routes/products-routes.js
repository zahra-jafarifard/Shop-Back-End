const express = require('express');

const router = express.Router();

const productsControllers = require('../controllers/products-controllers')

router.get('/', productsControllers.getAll);
router.get('/:productId', productsControllers.getById);
router.delete('/:productId', productsControllers.delete);
router.patch('/:productId', productsControllers.update);
router.post('/', productsControllers.add);
router.get('/category/', productsControllers.getProductsByCategory);


module.exports = router;