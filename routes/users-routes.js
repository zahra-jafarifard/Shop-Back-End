const express = require('express');
const router = express.Router();

const usersControllers = require('../controllers/users-controllers');

router.get('/', usersControllers.getAll)
router.post('/signIn', usersControllers.signIn)
router.post('/signUp', usersControllers.signUp)
router.post('/', usersControllers.add)
router.patch('/:userId', usersControllers.update)
router.get('/:userId', usersControllers.get)
router.delete('/:userId', usersControllers.delete)

module.exports = router;