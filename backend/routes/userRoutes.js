const express = require('express');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const { getUsers, getUserById } = require('../controllers/userController');

const router = express.Router();

// user Management ROutes 

router.get('/',protect,adminOnly,getUsers);  // Get all  users (admin only)
router.get('/:id',protect,getUserById);  // get a specific User
// router.delete('/:id',protect,adminOnly,deleteUser);//Delete user(Admin Only)



module.exports= router;