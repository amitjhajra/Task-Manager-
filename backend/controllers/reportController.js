const taskModel=require('../models/Task');
const userModel=require('../models/User');

const excelJS= require('exceljs');


// desc export all tasks as an excel file 
// router GET /api/reports/export/tasks 
// access Private (admin ) 

const exportTaskReport = async (req,res)=>{
  try {
    const tasks = await taskModel.find().populate('assignedTo',"name email ");
    
  } catch (error) {
    res.status(500).json({success:false,message:"Error exporting tasks",error:error.mesage});
  }
};

// desc export user-task as an excel file 
// router GET /api/reports/export/users 
// access Private (admin ) 

const exportUserReport = async (req,res)=>{
  try {
    
  } catch (error) {
    res.status(500).json({success:false,message:"Error exporting tasks",error:error.mesage});
  }
};

module.exports = {
  exportTaskReport,
  exportUserReport
}
