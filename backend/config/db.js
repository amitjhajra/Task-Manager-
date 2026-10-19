const mongoose = require('mongoose');

const connectDB = async(req,res)=>{
  try {
    await mongoose.connect(process.env.MONGO_URI,{});
    console.log("DB connected");
    
  } catch (error) {
    console.error("Error in connecting mongo DB ",error);
    process.exit(1);
    
  }
};

module.exports =connectDB;
