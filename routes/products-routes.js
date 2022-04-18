const express = require('express');
const router = express.Router();

const fileUpload = require('../shared/fileUpload');
const productsControllers = require('../controllers/products-controllers');

router.get('/categories', productsControllers.getCategories);
router.get('/:productId', productsControllers.getById);
router.get('/', productsControllers.getAll);
router.delete('/:productId', productsControllers.delete);
router.patch('/:productId', fileUpload.single("image"), productsControllers.update);
router.post('/', fileUpload.single("image") , productsControllers.add);


module.exports = router;