const express = require('express');
const router = express.Router();

const categorisControllers = require('../controllers/categories-controller');

router.get('/', categorisControllers.getAll);
router.post('/newCategory', categorisControllers.add);
router.patch('/:categoryId', categorisControllers.update);

module.exports = router;