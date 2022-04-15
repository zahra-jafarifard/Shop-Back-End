const express = require('express');

const router = express.Router();

const productsControllers = require('../controllers/products-controllers');

router.get('/categories', productsControllers.getCategories);
router.get('/:productId', productsControllers.getById);
router.get('/', productsControllers.getAll);
router.delete('/:productId', productsControllers.delete);
router.patch('/:productId', productsControllers.update);
router.post('/', productsControllers.add);


module.exports = router;