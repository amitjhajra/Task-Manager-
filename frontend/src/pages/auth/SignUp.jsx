import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layout/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import Inputs from "../../components/Inputs/Inputs";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/UserContext";
import uploadImage from "../../utils/uploadImage";

const SignUp = () => {
  const [profilePic, setprofilePic] = useState(null);
  const [fullName, setfullName] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [adminInviteToken, setadminInviteToken] = useState("");
  const {updateUser} = useContext(UserContext);
  const navigate= useNavigate();

  const [error, seterror] = useState(null);

  // Handle signup
  const handleSignUp = async (e) => {
    e.preventDefault();

    let profileImageUrl =''

    if (!fullName) {
      seterror("Please enter Full name ");
      return;
    }
    if (!validateEmail(email)) {
      seterror("Please Enter a valid email");
      return;
    }

    if (!password) {
      seterror("Please enter the password");
      return;
    }
    seterror("");


    //signup API call
    try {

      // upload image if present 
      if(profilePic){
        const imageUploadRes =await uploadImage(profilePic);
        
        profileImageUrl =imageUploadRes.imageUrl || "";
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name:fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken

      });

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        // Redirect based on role
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        seterror(error.response.data.message);
      } else {
        seterror("Something went wrong .Please try again later");
      }
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md-h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>
        <p className="text-xs text-slate-700 mt-[5px]mb-6">
          Join us today by entering your details below.
        </p>
      </div>

      <form onSubmit={handleSignUp}>
        <ProfilePhotoSelector image={profilePic} setimage={setprofilePic} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Inputs
            value={fullName}
            onChange={({ target }) => setfullName(target.value)}
            label="Full Name"
            placeholder="John"
            type="text"
          />
          <Inputs
            type="text"
            value={email}
            onChange={({ target }) => setemail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
          />
          <Inputs
            type="password"
            value={password}
            onChange={({ target }) => setpassword(target.value)}
            label="Password"
            placeholder="Min 8 Characters"
          />
          <Inputs
            type="text"
            value={adminInviteToken}
            onChange={({ target }) => setadminInviteToken(target.value)}
            label="Admin Invite Token"
            placeholder="6 digit code"
          />
        </div>
        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button type="submit" className="btn-primary">
          SIGN UP
        </button>

        <p className="text-[13px] text-slate-800 mt-3">
          {" "}
          Already have an account?{" "}
          <Link className="font-medium text-primary underline" to="/login">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignUp;
