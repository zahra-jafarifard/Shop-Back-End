const express = require('express');
const router = express.Router();

const clientsControllers = require('../controllers/clients-controller');

router.post('/signIn', clientsControllers.signIn)
router.post('/signUp', clientsControllers.signUp)
// router.patch('/:userId',  usersControllers.update)
// router.get('/:userId', usersControllers.get)
// router.delete('/:userId', usersControllers.delete)

module.exports = router;