const express = require('express');
const router = express.Router();

const categorisControllers = require('../controllers/categories-controller');

router.get('/', categorisControllers.getAll);
router.get('/parents', categorisControllers.getParents);
router.post('/', categorisControllers.add);
router.patch('/:categoryId', categorisControllers.update);
router.get('/:categoryId', categorisControllers.getById);
router.delete('/:categoryId', categorisControllers.delete);
router.get('/:categoryId/products', categorisControllers.getProductsByCategory);


module.exports = router;