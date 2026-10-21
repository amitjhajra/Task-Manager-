const jwt = require('jsonwebtoken');

const userModel= require('../models/User');


// Middleware to protect routes 

const protect = async(req,res,next)=>{
  try {
    let token = req.headers.authorization;
    if(token && token.startsWith("Bearer")){
      token = token.split(" ")[1]; // Extract token
      const decoded = jwt.verify(token,process.env.JWT_SECRET);
      req.user = await userModel.findById(decoded.id).select('-password');
      next();
    }else{
      res.status(401).json({message:"Not authorized user ,No Token",success:false});
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({message:"Token failed",success:false,error:error.message});
    
  }
};

// Middleware for admin only access 

const adminOnly = async(req,res,next)=>{
  if(req.user && req.user.role === 'admin'){
    next();
  }else{
    res.status(403).json({message:"Acess Denied admin only",success:false});
  }
}

module.exports ={protect,adminOnly};