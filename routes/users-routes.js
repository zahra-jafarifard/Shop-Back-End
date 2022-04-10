const express = require('express');
const router = express.Router();

const usersControllers = require('../controllers/users-controllers');

router.post('/signIn', usersControllers.signIn)
router.post('/signUp', usersControllers.signUp)
router.post('/', usersControllers.add)
router.patch('/:userId', usersControllers.update)
router.get('/', usersControllers.getAll)

module.exports = router;