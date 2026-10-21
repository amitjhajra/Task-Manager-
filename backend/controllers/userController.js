const taskModel = require('../models/Task');
const userModel = require('../models/User');
const bcrypt = require('bcryptjs');


// @desc get all user (admin only )
// route GET /api/users/
// access private (admin)
const getUsers = async(req,res)=>{
  try {
    const users = await userModel.find({role:'member'}).select("-password");
    // Add task counts to each user
    const usersWithTaskCounts = await Promise.all(
      users.map(async (user)=>{
        const pendingTasks = await taskModel.countDocuments({
          assignedTo:user._id,
          status:"Pending"
        });
        const inProgressTasks = await taskModel.countDocuments({
          assignedTo:user._id,
          status:"In Progress"
        });
        const completedTasks = await taskModel.countDocuments({
          assignedTo:user._id,
          status:"Completed"
        });

        return {
          ...user._doc,
          pendingTasks,
          inProgressTasks,
          completedTasks
        };
      })
    );
    res.status(200).json({
      message:"Users reterived SuccessFully",
      success:true,
      users:usersWithTaskCounts
    })
  } catch (error) {
    res.status(500).json({message:"Server Error",error:error.message});
  }
};

// @desc get user by id 
// route GET /api/users/:id
// access private 
const getUserById = async(req,res)=>{
  try {
    const user = await userModel.findById(req.params.id).select("-password");
    if(!user){
      return res.status(404).json({message:"User not found",success:false});
    }
    res.json({message:"User fetched Successfully",success:false,user:user});
  } catch (error) {
    res.status(500).json({message:"Server Error",error:error.message});
  }
};


// @desc delete a  user By id
// route DELETE /api/users/:id
// access private (admin)
// const deleteUser = async(req,res)=>{
//   try {
    
//   } catch (error) {
//     res.status(500).json({message:"Server Error",error:error.message});
//   }
// };


module.exports ={getUsers,getUserById};
