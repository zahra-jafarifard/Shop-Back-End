const express = require('express');
const router = express.Router();

const fileUpload = require('../shared/fileUpload');
const usersControllers = require('../controllers/users-controllers');

router.get('/', usersControllers.getAll)
router.post('/signUp', fileUpload.single('image'), usersControllers.signUp)
router.post('/', fileUpload.single('image'), usersControllers.add)
router.patch('/:userId', fileUpload.single('image'), usersControllers.update)
router.get('/:userId', usersControllers.get)
router.delete('/:userId',  usersControllers.delete)

// router.post('/signIn', usersControllers.signIn)        implement with graphql

module.exports = router;