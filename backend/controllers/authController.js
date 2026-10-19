const userModel = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Generate JWT token 

const generateToken = (userId)=>{
  return jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:'7d'});
};


// Register user 
// rooute - POST /api/auth/register
// acess - public 
const registerUser = async (req,res)=>{
  try {
    const {name,email,password,profileImageUrl,adminInviteToken} =req.body;
    // check is user already exist 
    const userExists = await userModel.findOne({email});

    if(userExists){
      return res.status(400).json({message:"User already exits",success:false});
    }
      // Determine the role 
      let role ='member';
      if(adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN){
        role='admin';
      }

      // Hash password 
      const salt = await bcrypt.genSalt(10);
      const hashedPassord = await bcrypt.hash(password,salt);

      // create new user 
      const user = await userModel.create({
        name,
        email,
        password:hashedPassord,
        profileImageUrl,
        role
      });


      // return user data with jwt 
      res.status(201).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        profileImageUrl:user.profileImageUrl,
        token:generateToken(user._id)
      })

  } catch (error) {
    res.status(500).json({message:"Server error",error:error.message});
    
  }
};

// Login user 
// rooute - POST /api/auth/login
// access - public 
const loginUser = async (req,res)=>{
  try {
    const {email , password} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
      return res.status(401).json({message:"Invalid Credentials",success:false});
    }

    // compare passoword 
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.status(401).json({message:"Invalid Credentials",success:false});
    }

    // return user data 
    res.json({
      _id:user._id,
      name:user.name,
      email:user.email,
      role:user.role,
      profileImageUrl:user.profileImageUrl,
      token:generateToken(user._id)

    });

  } catch (error) {
    res.status(500).json({message:"Server error",error:error.message});
    
  }
};


//   Get user profile 
// rooute - GET /api/auth/profile
// access -private JWT
const getUserProfile = async (req,res)=>{
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if(!user){
      return res.status(500).json({message:"User not found",success:false});
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({message:"Server error",error:error.message});
    
  }
};


// Update user profile 
// route PUT /api/auth/profile 
// access private requires JWT 

const upadteUserProfile = async(req,res)=>{
  try {
    const user = await userModel.findById(req.user.id);
    if(!user){
      return res.status(404).json({message:"User not found",success:false});
    }

    user.name =req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if(req.body.password){
      const salt =await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password,salt);
    }
    const updatedUser =await user.save();
    res.json({
      _id:updatedUser._id,
      name:updatedUser.name,
      email:updatedUser.email,
      role:updatedUser.role,
      token :generateToken(updatedUser._id),
      
    });
  } catch (error) {
    res.status(500).json({message:"Server error",error:error.message});
    
  }
};



module.exports ={registerUser,loginUser,getUserProfile,upadteUserProfile};