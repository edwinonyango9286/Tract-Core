
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
import CustomPhoneInput from "../../Components/common/CustomPhoneInput"
import type { CreateAccountPayload } from "../../types/auth"
import { createUserService } from "../../services/authService"
import { useSnackbar } from "../../hooks/useSnackbar"
import type { AxiosError } from "axios"

  const CreateAccountSchema = Yup.object<CreateAccountPayload>({
    userFirstname:Yup.string().required("Please provide your first name."),
    userLastname:Yup.string().required("Please provide your last name."),
    userEmail:Yup.string().email().required("Please provide your email address."),
    userPassword:Yup.string().min(8,"Password must be at least 8 characters").required("Please provide your password."),
    userPhoneNumber:Yup.string().required("Please provide your phone number."),
    userStatus:Yup.string().oneOf(["ACTIVE", "INACTIVE"]).required("Please select user status")
  })

const CreateAccount = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [showPassword,setShowPassword] = useState<boolean>(false);

 const formik = useFormik<CreateAccountPayload>({
    initialValues: {
      userFirstname: "",
      userLastname:"",
      userEmail:"",
      userPhoneNumber:"",
      userPassword: "",
      userStatus:"ACTIVE",
      roleId:1
    },
    validationSchema:CreateAccountSchema,
    onSubmit: async (values, { setSubmitting, setStatus, resetForm }) => {
      try {
        const response =  await createUserService(values)
        if(response.status === 201){
          setStatus({ success: true });
          showSnackbar( response.data.message || "Account created successfully.", 'success');
          resetForm()
        }
      } catch (error) {
        setStatus({ error: 'Submission failed. Please try again.' });
        const err  = error as AxiosError<{message?:string}>
        showSnackbar(err?.response?.data.message || err?.message, 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });



  return (
    <Box sx={{ width:"100%", height:{ xs:"auto", md:"100vh"}, display:"flex", alignItems:"center", justifyContent:"center"}}>
        <Paper elevation={0} sx={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' ,  paddingX:{xs:"20px", lg:"30px"}, paddingY:{xs:"30px", lg:"40px"},  borderRadius:"8px", margin:"14px", width:{xs:"100%", sm:"70%",md:"50%", lg:"30%", xl:"24%" }}}> 
          <form onSubmit={formik.handleSubmit} style={{ width:"100%"}}>
            <Box sx={{ alignItems:"center", justifyContent:"center", width:"100%", display:"flex", flexDirection:"column", gap:'20px'}}>
                <Box sx={{ width:"100%", alignItems:"center", justifyContent:"center", display:"flex", flexDirection:"column", gap:"10px"}}>
                 <Typography sx={{ textAlign:"center", fontSize:"26px", fontWeight:"700", color:"#272d3b"}}>Create Account</Typography>
                 <Typography sx={{ textAlign:"center", fontSize:"12px", fontWeight:"400", color:"#707070"}}>Enter your details to an create account.</Typography>
              </Box>
                <Box sx={{ width:"100%", display:"flex", flexDirection:"column", gap:"20px"}}>

                   <Box sx={{ display:"flex", flexDirection:"column", gap:"10px"}}>
                    <CustomTextField 
                      placeholder={"First Name"}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      id={"userFirstname"}
                      type={"text"}
                      name={"userFirstname"}
                      value={formik.values.userFirstname}
                      errorMessage={formik.touched.userFirstname && formik.errors.userFirstname}
                     />
                  </Box>
                   <Box sx={{ display:"flex", flexDirection:"column", gap:"10px"}}>
                    <CustomTextField 
                      placeholder={"Last Name"}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      id={"userLastname"}
                      type={"text"}
                      name={"userLastname"}
                      value={formik.values.userLastname}
                      errorMessage={formik.touched.userLastname && formik.errors.userLastname}
                     />
                  </Box>

                    <Box sx={{ display:"flex", flexDirection:"column", gap:"10px"}}>
                    <CustomPhoneInput 
                      onBlur={formik.handleBlur}
                      // label={"Phone Number"}
                      onChange={(value) => formik.setFieldValue("userPhoneNumber", value)}
                      id={"userPhoneNumber"}
                      name={"userPhoneNumber"}
                      value={formik.values.userPhoneNumber}
                      errorMessage={formik.touched.userPhoneNumber && formik.errors.userPhoneNumber}
                     />
                  </Box>
                  <Box sx={{ display:"flex", flexDirection:"column", gap:"10px"}}>
                    <CustomTextField 
                      placeholder={"Email"}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      id={"userEmail"}
                      type={"text"}
                      name={"userEmail"}
                      value={formik.values.userEmail}
                      errorMessage={formik.touched.userEmail && formik.errors.userEmail}
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
                       id={"userPassword"}
                       name={"userPassword"}
                       value={formik.values.userPassword}
                       type={showPassword? "text" : "password"}
                       errorMessage={formik.touched.userPassword && formik.errors.userPassword}
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

                    <Box sx={{ marginY:"10px"}}>
                      <CustomSubmitButton label="Create Account" loading={formik.isSubmitting} />
                    </Box>

                    <Box onClick={()=>navigate("/")} sx={{ cursor:"pointer", width:"100%", alignItems:"center", justifyContent:"center", display:"flex",gap:"4px"}}>
                        <Typography style={{  fontSize:"14px", color:"#032541", fontWeight:"500" }}>Already have an account?</Typography>
                        <Typography style={{ fontSize:"14px", color:"#032541", fontWeight:"700" }}>Sign In</Typography>
                    </Box>
                
                </Box>
            </Box>
          </form>
      </Paper>
    </Box>
  )
}

export default CreateAccount