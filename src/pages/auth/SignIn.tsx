import { Box, IconButton, InputAdornment, Paper, Typography } from "@mui/material"
import CustomTextField from "../../Components/common/CustomTextField"
import CustomSubmitButton from "../../Components/common/CustomSubmitButton"
import { useNavigate } from "react-router-dom"
import * as Yup from "yup"
import { useFormik } from "formik"
import { useState } from "react"
import MailIcon from '@mui/icons-material/Mail';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import type { SignInPayload } from "../../types/auth"
import type { AxiosError } from "axios"
import { useSnackbar } from "../../hooks/useSnackbar"
import { signInUserService } from "../../services/authService"
import Cookies from "js-cookie"
import { jwtDecode }from 'jwt-decode';
import { getUserService } from "../../services/userService"
import type { Decoded } from "../../types/user"


const SignInSchema = Yup.object<SignInPayload>({
    username:Yup.string().email().required("Please provide your email."),
    password:Yup.string().required("Please provide your password."),
  })
const SignIn = () => {
  const navigate = useNavigate();
  const {showSnackbar} = useSnackbar();


  const handleGetUserDetails =  async (userId:number)=>{
    try {
      const response = await getUserService(userId);
      if(response?.status === 200){
          localStorage.setItem("userData",JSON.stringify(response.data.data))
          navigate("/dashboard");
      }
    } catch (error) {
      const err = error as AxiosError<{message?:string}>
      showSnackbar(err?.response?.data.message || err.message, "error")
    }
  }
 const formik = useFormik<SignInPayload>({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema:SignInSchema,
    onSubmit: async (values, { setSubmitting,resetForm }) => {
      try {
       const response = await signInUserService(values);
       if(response.status === 200){
        Cookies.set("access_token",response.data.data.access_token,{expires:1, secure:true, sameSite:"strict"});
        Cookies.set("refresh_token", response.data.data.refresh_token, {expires:1, secure:true, sameSite:"strict"});
        const decoded :Decoded = await jwtDecode(response.data.data.access_token);
        localStorage.setItem("userRole", decoded.role)
        await handleGetUserDetails(decoded.id);
        }
      } catch (error) {
        const err = error as AxiosError<{message?:string}>
        showSnackbar(err?.response?.data.message || err.message, "error")
      } finally {
        setSubmitting(false);
        resetForm();
      }
    },
  });
  const [showPassword,setShowPassword] = useState<boolean>(false);
  return (
    <Box sx={{ width:"100%", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center"}}>
        <Paper elevation={0} sx={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' ,  paddingX:{xs:"20px", lg:"30px"}, paddingY:{xs:"30px", lg:"40px"},  borderRadius:"8px", margin:"14px", width:{xs:"100%", sm:"70%",md:"50%", lg:"30%", xl:"24%" }}}> 
          <form onSubmit={formik.handleSubmit} style={{ width:"100%"}}>
            <Box sx={{ alignItems:"center", justifyContent:"center", width:"100%", display:"flex", flexDirection:"column", gap:'20px'}}>
                <Box sx={{ width:"100%", alignItems:"center", justifyContent:"center", display:"flex", flexDirection:"column", gap:"10px"}}>
                 <Typography sx={{ textAlign:"center", fontSize:"26px", fontWeight:"700", color:"#272d3b"}}>Let’s sign you in!</Typography>
                 <Typography sx={{ textAlign:"center", fontSize:"12px", fontWeight:"400", color:"#707070"}}>Enter your username and password to access your account.</Typography>
              </Box>
                <Box sx={{ width:"100%", display:"flex", flexDirection:"column", gap:"20px"}}>
                  <Box sx={{ display:"flex", flexDirection:"column", gap:"10px"}}>
                    <CustomTextField 
                      placeholder={"Email"}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      id={"username"}
                      type={"text"}
                      name={"username"}
                      value={formik.values.username}
                      errorMessage={formik.touched.username && formik.errors.username}
                    startAdornment={
                    <InputAdornment position="start">
                      <IconButton>
                        <MailIcon style={{ fontWeight:"700", width:"20px", height:"20px", color:"#B0B0B0"}}  />
                    </IconButton>
                    </InputAdornment>
                  }
                     />
                  </Box>

                    <Box sx={{ display:"flex", flexDirection:"column", gap:"10px"}}>
                     <CustomTextField 
                       placeholder={"Password"}
                       onBlur={formik.handleBlur}
                       onChange={formik.handleChange}
                       id={"password"}
                       name={"password"}
                       value={formik.values.password}
                       type={showPassword? "text" : "password"}
                       errorMessage={formik.touched.password && formik.errors.password}
                          startAdornment={
                          <InputAdornment position="start">
                            <IconButton>
                              <LockIcon style={{ fontWeight:"700", width:"20px", height:"20px", color:"#B0B0B0"}}  />
                          </IconButton>
                          </InputAdornment>
                       }
                        endAdornment={
                          <InputAdornment  position="start">
                            <IconButton onClick={()=>setShowPassword(!showPassword)}>
                               {showPassword ?  <VisibilityOffIcon  style={{ fontWeight:"700", width:"20px", height:"20px", color:"#B0B0B0"}} /> : <VisibilityIcon style={{ fontWeight:"700", width:"20px", height:"20px", color:"#B0B0B0"}}  />} 
                          </IconButton>
                          </InputAdornment>
                       }
                      />
                    </Box>

                   <Box sx={{alignSelf:"flex-end" }}>
                     <Typography component={"a"} href="/forgot-password" sx={{ cursor:"pointer", fontSize:"13px", textDecoration:"none", fontWeight:"500", color:"#032541" }}>Forgot Pin?</Typography>
                   </Box>

                    <Box sx={{ marginY:"10px"}}>
                      <CustomSubmitButton label="Sign In" loading={formik.isSubmitting} />
                    </Box>

                    <Box onClick={()=>navigate("/create-account")} sx={{ cursor:"pointer", width:"100%", alignItems:"center", justifyContent:"center", display:"flex",gap:"4px"}}>
                        <Typography style={{  fontSize:"14px", color:"#032541", fontWeight:"500" }}>New User?</Typography>
                        <Typography style={{ fontSize:"14px", color:"#032541", fontWeight:"700" }}>Sign Up</Typography>
                    </Box>
                
                </Box>
            </Box>
          </form>
      </Paper>
    </Box>
  )
}

export default SignIn