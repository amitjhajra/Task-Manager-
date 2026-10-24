import { createContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";


export const UserContext = createContext();
const UserProvider = ({children})=>{
  const [user, setuser] = useState(null);
  const [loading, setloading] = useState(true); //new state to track loading 

  useEffect(()=>{
     if(user) return;
     const accessToken = localStorage.getItem("token");
     if(!accessToken){
      setloading(false);
      return;
     }
     const fetchUser = async ()=>{
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setuser(response.data);
      } catch (error) {
        console.log("USer not authenticaetd ",error);
        clearUser();
      }finally{
        setloading(false);
      }
     };
     fetchUser();
  },[]);

  const updateUser = (userData)=>{
    setuser(userData);
    localStorage.setItem("token",userData.token); // save token 
    setloading(false);
  };
  const clearUser =()=>{
    setuser(null);
    localStorage.removeItem("token");
  };

  return <UserContext.Provider value={{user,loading,updateUser,clearUser}} >
    {children}
  </UserContext.Provider>

}
export default UserProvider;