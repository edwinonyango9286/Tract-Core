import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAccount from "./pages/auth/CreateAccount";
import SignIn from "./pages/auth/SignIn";
import { SnackbarProvider } from "./Components/common/SnackbarProvider";
import DashboardLayout from "./Components/common/DashboardLayout";
import Roles from "./pages/roles/Roles";
import Dashboard from "./pages/Dashboard";
import Category from "./pages/assets/Category";
import SubCategory from "./pages/assets/SubCategory";
import Stack from "./pages/Inventory/Stack";
import Users from "./pages/Users";
import Permissions from "./pages/Permissions";
import Pallet from "./pages/Inventory/Pallet";
import Movement from "./pages/Movement";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PublicRoutes } from "./utils/PublicRoutes";
import { PrivateRoutes } from "./utils/PrivateRoutes";

const queryClient = new QueryClient();

function App() {
  return (
    <>
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider autoHideDuration={6000}>
        <BrowserRouter>
          <Routes>
             <Route element={<PublicRoutes/>}>
               <Route path="/" element={<SignIn />} />
               <Route path="/create-account" element={<CreateAccount />} />
             </Route>
            <Route path="/dashboard" element={<DashboardLayout /> }>
              <Route index element={<Dashboard />}></Route>
              <Route path="roles" element={<Roles />} />
              <Route path="category" element={<Category />} />
              <Route path="sub-category" element={<SubCategory />} />
              <Route path="stack" element={<Stack />} />
              <Route path="pallet" element={<Pallet />} />
              <Route path="permissions" element={<Permissions />} />
              <Route path="users" element={<Users />} />
              <Route path="movement" element={<Movement />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </QueryClientProvider>
    </>
  );
}

export default App;
