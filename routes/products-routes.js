const express = require('express');
const router = express.Router();

const fileUpload = require('../shared/fileUpload');
const productsControllers = require('../controllers/products-controllers');
const checkAuth = require('../shared/checkAuth');

//AdminRoutes
router.get('/categories', productsControllers.getCategories);
router.get('/', productsControllers.getAll);
router.delete('/:productId', checkAuth , productsControllers.delete);
router.patch('/:productId', fileUpload.single("image"), productsControllers.update);
router.post('/', fileUpload.single("image") , productsControllers.add);

//APP-Routes
router.get('/parentCategories', productsControllers.getParentCategories);
router.get('/children', productsControllers.getChildren);
router.get('/women', productsControllers.getWomen);
router.get('/men', productsControllers.getMen);
router.post('/favoriteProducts', productsControllers.getFavoriteProducts);
router.post('/cartItems', productsControllers.getCartItems);


//AdminRoutes
router.get('/:productId', productsControllers.getById);


module.exports = router;