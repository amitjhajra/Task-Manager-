import React, { useState,useContext } from 'react'
import AuthLayout from '../../components/layout/AuthLayout'
import {useNavigate,Link}  from 'react-router-dom'
import Inputs from '../../components/Inputs/Inputs';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import  { UserContext } from '../../context/UserContext';



const Login = () => {

  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [error, seterror] = useState(null);
 const {updateUser} = useContext(UserContext);

  const navigate = useNavigate();

  // Handle login from submit 
  const handleLogin = async (e)=>{
    e.preventDefault();
    if(!validateEmail(email)){
      seterror("Please enter a valid email ");
      return ;
    }
    if(!password){
      seterror("Please enter a password");
      return;

    }
    seterror("");

    // Login Api call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN,{email,password});

      const {token ,role} =response.data;
      if(token){
        localStorage.setItem("token",token);
        updateUser(response.data);
        // Redirect based on role 
        if(role === "admin"){
          navigate("/admin/dashboard");
        }else{
          navigate('/user/dashboard');
        }
      }
     } catch (error) {
      if(error.response && error.response.data.message){
        seterror(error.response.data.message);
      }else{
        seterror("Something went wrong .Please try again later");

      }
      
    }

  }
  return (
   <AuthLayout>
    
    <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center'>
      <h3 className='text-xl font-semibold text-black'>Welcome Back</h3>
      <p className='text-xs text-slate-700 mt-[5px] mb-6'>Please Enter your details to Log In </p>


      <form onSubmit={handleLogin}>
                                   
        <Inputs type="text"
        value={email}
        onChange={({target})=>setemail(target.value)}
        label="Email Address"
        placeholder='john@example.com'

        />
        <Inputs type="password"
        value={password}
        onChange={({target})=>setpassword(target.value)}
        label="Password"
        placeholder='Min 8 Characters'
        />
        {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

        <button type='submit' className='btn-primary'>LOGIN</button>

        <p className='text-[13px] text-slate-800 mt-3'> Don't have an account?{" "}
          <Link className='font-medium text-primary underline' to="/signUp">
          
          Signup
          </Link>
          
        </p>
        
      </form>
    </div>
   </AuthLayout>
  )
}

export default Login
