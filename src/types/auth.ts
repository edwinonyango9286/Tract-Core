  export interface SignInPayload {
    username:string;
    password:string;
  }

  export interface SignInResponse{
    
  }

  export interface CreateAccountPayload {
      userFirstname:string;
      userLastname:string;
      userEmail:string;
      userPassword:string;
      userPhoneNumber:string;
      roleId:number;
      userStatus:string;
 }

 export interface CreateAccountResponse  {


 }

