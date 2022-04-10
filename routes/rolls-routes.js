const express = require('express');
const router = express.Router();

const rollsControllers = require('../controllers/rolls-controllers');

router.get('/', rollsControllers.getAll);
router.post('/', rollsControllers.add);
router.patch('/:rollId', rollsControllers.update);

module.exports = router;