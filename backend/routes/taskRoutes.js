const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { getDashboardData,getUserDashboardData,getTaskById,getTasks,createTask,updateTask,deleteTask ,updateTaskStatus,updateTaskChecklist} = require("../controllers/taskController");

const router = express.Router();

router.get('/dashboard-data',protect,getDashboardData);
router.get('/user-dashboard-data',protect,getUserDashboardData);
router.get('/',protect,getTasks); // get all tasks (Admin :all , user:assigned)

router.get('/:id',protect,getTaskById); // get task by id (admin :all, user:assigned) 

router.post('/',protect,adminOnly,createTask); // Create task (admin )
router.put('/:id',protect,updateTask); // Update task details 
router.delete('/:id',protect,deleteTask); // delete task 
router.put('/:id/status',protect,updateTaskStatus);// update task status 
router.put('/:id/todo',protect,updateTaskChecklist); // update task check list 

module.exports =router;