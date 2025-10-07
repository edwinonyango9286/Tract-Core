import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAccount from "./pages/auth/CreateAccount";
import SignIn from "./pages/auth/SignIn";
import { SnackbarProvider } from "./Components/common/SnackbarProvider";
import DashboardLayout from "./Components/common/DashboardLayout";
import Roles from "./pages/roles/Roles";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Permissions from "./pages/Permissions";
import Movements from "./pages/Movements";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PublicRoutes } from "./utils/PublicRoutes";
import { PrivateRoutes } from "./utils/PrivateRoutes";
import Assets from "./pages/assets/Assets";
import Stacks from "./pages/Inventory/Stacks";
import Pallets from "./pages/Inventory/Pallets";
import Categories from "./pages/assets/Categories";
import SubCategories from "./pages/assets/SubCategories";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

function App() {
  return (
    <>
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider autoHideDuration={6000}>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<NotFound/>}></Route>
             <Route element={<PublicRoutes/>}>
               <Route path="/" element={<SignIn />} />
               <Route path="/create-account" element={<CreateAccount />} />
             </Route>

            <Route path="/dashboard" element={ <PrivateRoutes><DashboardLayout /></PrivateRoutes>  }>
              <Route index element={<Dashboard />}></Route>
              <Route path="roles" element={<Roles />} />
              <Route path="category" element={<Categories/>} />
              <Route path="sub-category" element={<SubCategories />} />
              <Route path="stack" element={<Stacks />} />
              <Route path="assets" element={<Assets/>}/>
              <Route path="pallet" element={<Pallets />} />
              <Route path="permissions" element={<Permissions />} />
              <Route path="users" element={<Users />} />
              <Route path="movement" element={<Movements />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </QueryClientProvider>
    </>
  );
}

export default App;
