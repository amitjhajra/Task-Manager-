const taskModel = require('../models/Task');




// desc get all tasks (admin :all , user : assigned ) 
// route GET /api/tasks 
// access Private 
const getTasks = async (req,res)=>{
  try {
    const {status} = req.query;
    let filter ={};
    if(status){
      filter.status= status;
    }
    let tasks;
    if(req.user.role === 'admin'){
      tasks = await taskModel.find(filter).populate("assignedTo","name email profileImageUrl");
    }else{
      tasks = await taskModel.find({...filter,assignedTo:req.user._id}).populate("assignedTo","name email profileImageUrl");
    }

    // Add completed todoChecklist count to each task 
    tasks = await Promise.all(
      tasks.map(async(task)=>{
        const completedCount = task.todoChecklist.filter(
          (item)=>item.completed
        ).length;
        return {...task._doc,completedTodoCount:completedCount};
      })
    );

    // status summary counts 
    const allTasks = await taskModel.countDocuments(
      req.user.role === 'admin'? {}:{assignedTo:req.user._id}
    );
    const pendingTasks = await taskModel.countDocuments({
      ...filter,
      status:"Pending",
      ...(req.user.role != 'admin' && {assignedTo:req.user._id})
    });

    const inProgressTasks = await taskModel.countDocuments({
      ...filter,
      status:"In Progress",
      ...(req.user.role != 'admin' && {assignedTo:req.user._id})
    });
    const completedTasks = await taskModel.countDocuments({
      ...filter,
      status:"Completed",
      ...(req.user.role != 'admin' && {assignedTo:req.user._id})
    });

    res.json({
      success:true,
      tasks,
      statusSummary:{
        all:allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks
      },
    })


  } catch (error) {
    res.status(500).json({message:"Server Error",error:error.message,success:false});
  }

}


// desc get  tasks by id 
// route GET /api/tasks/:id 
// access Private 
const getTaskById = async (req,res)=>{
  try {
    const task = await taskModel.findById(req.params.id).populate('assignedTo','name email profileImageUrl');
    if(!task) {return res.status(404).json({success:false,message:"Task not found"});}

    res.json({success:true,message:"Task fetched successfully",task});

  } catch (error) {
    res.status(500).json({message:"Server Error",error:error.message,success:false});
  }

}
// desc create  a new task (admin only)
// route POST /api/tasks 
// access Private (Admin)
const createTask = async (req,res)=>{
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,

    }= req.body;
    if(!Array.isArray(assignedTo)){
      return res.status(400).json({success:false,message:"assignedTo must be an array of users id "});
    }
    const task = await taskModel.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy:req.user._id,
      todoChecklist,
      attachments
    });
    res.status(201).json({message:"Task created succesfully " ,success:true,task});
  } catch (error) {
    res.status(500).json({message:"Server Error",error:error.message,success:false});
  }

}
// desc Update task details 
// route PUT /api/tasks/:id
// access Private 
const updateTask = async (req,res)=>{
  try {
    const task = await taskModel.findById(req.params.id);
    if(!task) {
      return res.status(404).json({message:"Task not found "});
    }
    task.title = req.body.title || task.title;
    task.description =req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    task.attachments = req.body.attachments || task.attachments;

    if(req.body.assignedTo){
      if(!Array.isArray(req.body.assignedTo)){
        return res.status(400).json({message:"assignedTo must be array of usersID "});
      }
      task.assignedTo =req.body.assignedTo;

    }
    const updatedTask = await task.save();
    res.json({message:"Task updated successfully",success:true,task:updatedTask});

  } catch (error) {
    res.status(500).json({message:"Server Error",error:error.message,success:false});
  }

}


// desc Delete a task (Admin only )
// route DELETE  /api/tasks/:id 
// access Private 
const deleteTask = async(req,res)=>{
  try {
    const task = await taskModel.findById(req.params.id);
    if(!task) return res.status(404).json({success:false,message:"task not found"});

    await task.deleteOne();

  } catch (error) {
    res.status(500).json({message:"Server Error",error:error.message,success:false});
  }
}

// desc update task status
// route PUT  /api/tasks/:id/status 
// access Private 
const updateTaskStatus = async(req,res)=>{
  try {
    const task= await taskModel.findById(req.params.id);
    if(!task){
      return res.status(404).json({success:false,message:"Task Not found"});
    }
    const isAssigned = task.assignedTo.some(
      (userId)=>userId.toString() === req.user._id.toString()
    );
    if(!isAssigned && req.user.role !== 'admin'){
      return res.status(403).json({success:false,message:"Authorization denied"});
    }

    task.status = req.body.status || task.status;

    if(task.status === "Completed"){
      task.todoChecklist.forEach((item)=>(item.completed = true));
      task.progress =100;
    }
    await task.save();
    res.json({success:true,message:"Task status updated successfully",task});
    
  } catch (error) {
    res.status(500).json({message:"Server Error",error:error.message,success:false});
  }
}


// desc update task checklist
// route PUT  /api/tasks/:id/todo 
// access Private 
const updateTaskChecklist = async(req,res)=>{
  try {
    const {todoChecklist} = req.body;
    const task = await taskModel.findById(req.params.id);

    if(!task) {
      return res.status(404).json({success:false,message:"Task not found"});
    }

    if(!task.assignedTo.includes(req.user._id) && req.user.role !== 'admin'){
      return res.status(403).json({success:false,message:"Not auhorized to update checkList"});
    }
    task.todoChecklist = todoChecklist; // replace with updated checkList 

    // Auto update progress based on checklist completion 
    const completedCount =task.todoChecklist.filter(
      (item)=>item.completed
    ).length;

    const totalItems =task.todoChecklist.length;

    task.progress = totalItems >0 ? Math.round((completedCount/totalItems)*100) :0;


    // Auto mark task as completed if all items are checked
    if(task.progress === 100){
      task.status = 'Completed'
    }else if(task.progress >0 ){
      task.status ='In Progress'
    }else{
      task.status= "Pending"
    }
    await task.save();
    const updatedTask = await taskModel.findById(req.params.id).populate('assignedTo',"name email profileImageUrl");
    res.json({success:true,message:"task checklist updated Successfully",task:updatedTask});
  } catch (error) {
    res.status(500).json({message:"Server Error",error:error.message,success:false});
  }
}


// desc Dashboard data (admin only) 
// route GET /api/tasks/dashboard-data 
// access private 

const getDashboardData = async(req,res)=>{
   try {
    // fetch tasks statistics 
    const totalTasks = await taskModel.countDocuments();
    const pendingTasks = await taskModel.countDocuments({
      status:"Pending"
    });
    const completedTasks = await taskModel.countDocuments({
      status:"Completed"
    });
    const overdueTasks = await taskModel.countDocuments({
      status:{$ne:"Completed"},
      dueDate:{$lt:new Date()}
    });
    

    // Get task distribution bs status 
    const taskStatuses = [
      "Pending",
      "In Progress",
      "Completed"
    ];
    const taskDistributionRaw = await taskModel.aggregate([
      {
        $group:{
          _id:"$status",
          count:{$sum:1}
        }
      }
    ]);
    const taskDistribution = taskStatuses.reduce((acc,status)=>{
      const formatedKey = status.replace(/\s+/g,"");
      acc[formatedKey] = taskDistributionRaw.find(
      (item)=>item._id === status
      )?.count || 0;
      return acc;
    },{});
    
    // Add total task count 
    taskDistribution['All']=totalTasks;

    // / Get task distribution bs priority 
     
    const taskPriorities = ["Low","Medium","High"];
    const taskPrioritiesLevelsRaw = await taskModel.aggregate([
      {
        $group:{
          _id:"$priority",
          count:{$sum:1}
        }
      }
    ]);

    const taskPrioritiesLevels= taskPriorities.reduce((acc,priority)=>{
        acc[priority] = taskPrioritiesLevelsRaw.find((item) => item._id === priority)?.count || 0;
        return acc;
    },{});

    // fetch recent 10 tasks 
    const recentTasks = await taskModel.find().sort({createdAt:-1}).select("title status priority dueDate createdAt");

    // send data to dashboard
    res.status(200).json({
      statistics :{
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks
      },
      charts :{
        taskDistribution,
        taskPrioritiesLevels
      },
      recentTasks
    });

  } catch (error) {
    res.status(500).json({message:"Server Error",error:error.message,success:false});
  }
}

// desc Dashboard data (user specific) 
// route GET /api/tasks/user-dashboard-data 
// access private 

const getUserDashboardData = async(req,res)=>{
   try {
    const userId = req.user._id;
    // Fetch statistics for user specific tasks 
    const totalTasks = await taskModel.countDocuments({assignedTo:userId});
    const pendingTasks = await taskModel.countDocuments({
      assignedTo:userId,
      status:"Pending"
    });
    const completedTasks = await taskModel.countDocuments({
      assignedTo:userId,
      status:"Completed"
    });
    const overdueTasks = await taskModel.countDocuments({
      assignedTo:userId,
      status:{$ne:"Completed"},
      dueDate:{$lt:new Date()}
    })
    //  task distribution by status 
    const taskStatuses = ["Pending","In Progress","Completed"];


    const taskDistributionRaw = await taskModel.aggregate([
      {$match:{assignedTo:userId}},
      {$group:{_id:"$status",count:{$sum:1}}},
    ]);

    const taskDistribution = taskStatuses.reduce((acc,status)=>{
      const formatedKey = status.replace(/\+/g,"");
      acc[formatedKey] = taskDistributionRaw.find((item)=> item._id === status)?.count || 0;
      return acc;

    },{});

    // task distribution by priority 
    const taskPriorities = ["Low","Medium","High"];
    const taskPrioritiesLevelsRaw = await taskModel.aggregate([
       {$match:{assignedTo:userId}},
       {$group:{_id:"$priority",count:{$sum:1}}},
    ]);

    const taskPrioritiesLevels = taskPriorities.reduce((acc,priority)=>{
        acc[priority] = taskPrioritiesLevelsRaw.find((item)=>item._id === priority)?.count || 0;
        return acc;
    },{});


    // fetch recent 10 tasks for the logged in user

    const recentTasks = await taskModel.find({
      assignedTo:userId
    }).sort({createdAt:-1}).select("title status priority dueDate createdAt");


    res.status(200).json({
      statistics:{
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,

      },
      charts:{
        taskDistribution,
        taskPrioritiesLevels
      },
      recentTasks
    });


  } catch (error) {
    res.status(500).json({message:"Server Error",error:error.message,success:false});
  }
}

module.exports ={
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData

};
