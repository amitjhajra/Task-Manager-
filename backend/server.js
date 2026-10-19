require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({
  origin:process.env.CLIENT_URL ||"*",
  methods:["GET","POST","PUT","DELETE"],
  allowedHeaders:["Content-Type","Authorization",]
}));

// Middlewares
app.use(express.json());

// connect data base 
connectDB();
// Routes 

app.use("/api/auth",authRoutes);
// app.use("/api/auth",userRoutes);
// app.use("/api/auth",taskRoutes);
// app.use("/api/auth",reportRoutes);



// start server 
const PORT =process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Server is running on ${PORT}`));
