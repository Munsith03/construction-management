import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext.jsx";
import { CartProvider } from "./contexts/cartContext.jsx";
import RoleProtectedRoute from "./routes/RoleProtectedRoute.jsx";
import RedirectByRole from "./routes/RedirectByRole.jsx";

import AuthLayout from "./components/layout/AuthLayout.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";

import MainLayout from "./components/layout/MainLayout.js";
import Home from "./pages/main/public/Home.jsx";
import UserProfile from "./pages/main/UserProfile.jsx";
import AddRestaurant from "./pages/main/AddRestaurant.jsx";
import Restaurants from "./pages/main/Restaurants.jsx";
import RestaurantPage from "./pages/main/RestaurantPage.jsx";
import CartPage from "./pages/main/CartPage.jsx";
import CheckoutPage from "./pages/main/CheckoutPage.jsx";
import PaymentPage from "./pages/main/PaymentPage.jsx";
import TrackOrder from "./pages/main/TrackOrder.jsx";

import SystemAdminDashboardLayout from "./components/layout/SystemAdminDashboardLayout.js";
import SystemAdminPage from "./pages/Dashboard/systemAdminPage.jsx";
import RestaurantApproval from "./pages/Dashboard/RestaurantApproval.jsx";
import ManageRestaurants from "./pages/Dashboard/ManageRestaurants.jsx";

import RestaurantAdminDashboardLayout from "./components/layout/RestaurantAdminDashboardLayout.js";
import MenuManagement from "./pages/Dashboard/MenuManagement.jsx";
import RestaurantAdminWrapper from "./pages/Dashboard/RestaurantAdminWrapper.jsx";

import DeliveryPersonalDashboardLayout from "./components/layout/DeliveryPersonalDashboardLayout.js";
import DeliveryDetails from "./pages/Dashboard/delivery-details.jsx";
import ReadyDeliveries from "./pages/Dashboard/delivery-order.jsx";
import MyDeliveries from "./pages/Dashboard/my-delivery.jsx";

import PageNotFound from "./pages/errors/PageNotFound.jsx";
import Unauthorized from "./pages/errors/Unauthorized.jsx";

import AddressPicker from "./components/temp/AddressPicker.jsx";
import Table from "./components/temp/Table.jsx";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Auth layout routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Main layout routes */}
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="/" element={<Home />} />
              <Route
                element={
                  <RoleProtectedRoute
                    allowedRoles={[
                      "customer",
                      "system_admin",
                      "restaurant_admin",
                    ]}
                  />
                }
              >
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/add-restaurent" element={<AddRestaurant />} />
                <Route path="/restaurant/:id" element={<RestaurantPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/:orderId" element={<TrackOrder />} />
                <Route path="/profile" element={<UserProfile />} />;
              </Route>
            </Route>

            <Route element={<SystemAdminDashboardLayout />}>
              <Route
                element={<RoleProtectedRoute allowedRoles={["system_admin"]} />}
              >
                <Route path="/system-admin" element={<SystemAdminPage />} />
                <Route
                  path="/restaurant-approval"
                  element={<RestaurantApproval />}
                />
                <Route
                  path="/manage-restaurents"
                  element={<ManageRestaurants />}
                />
              </Route>
            </Route>

            <Route element={<RestaurantAdminDashboardLayout />}>
              <Route
                element={
                  <RoleProtectedRoute allowedRoles={["restaurant_admin"]} />
                }
              >
                <Route path="/menu-management" element={<MenuManagement />} />
                <Route
                  path="/restaurant-admin"
                  element={<RestaurantAdminWrapper />}
                />
              </Route>
            </Route>

            <Route element={<DeliveryPersonalDashboardLayout />}>
              <Route
                element={
                  <RoleProtectedRoute allowedRoles={["delivery_personnel"]} />
                }
              >
                <Route path="/ready-deliveries" element={<ReadyDeliveries />} />
                <Route path="/:deliveryId" element={<DeliveryDetails />} />
                <Route path="/deliveries" element={<MyDeliveries />} />
              </Route>
            </Route>

            {/* Role-based redirection */}
            <Route path="/dashboard" element={<RedirectByRole />} />

            {/* Catch all */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<PageNotFound />} />
            <Route path="/address-picker" element={<AddressPicker />} />
            <Route path="/table" element={<Table darkMode={true} />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
