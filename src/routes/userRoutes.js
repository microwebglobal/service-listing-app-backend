// routes/userRoutes.js
const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

// User routes
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Additional routes for email and mobile lookup
router.get('/email/:email', UserController.getUserByEmail);
router.get('/mobile/:mobile', UserController.getUserByMobile);

module.exports = router;