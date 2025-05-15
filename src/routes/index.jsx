import { Routes, Route } from "react-router-dom";
import Admin from "../layouts/Admin";
import Client from "../layouts/Client";
import Home from "../pages/client/Home";
import Profile from "../pages/client/Profile";
import History from "../pages/client/Orders";
import ProductDetail from "../pages/client/ProductDetail";
import Cart from "../pages/client/Cart";
import Checkout from "../pages/client/Checkout";
import Product from "../pages/client/Product";

import Categories from "../pages/admin/Categories";
import Products from "../pages/admin/Products";
import Users from "../pages/admin/Users";


const AppRoutes = () => (
  <Routes>
    <Route element={<Client />}>
      <Route path="/" element={<Home />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/Orders" element={<History />} />
      <Route path="/Products" element={<Product />} />
      <Route path="/Products/:id" element={<ProductDetail />} />
      <Route path="/Cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
     
   
    </Route>
    <Route element={<Admin />}>
      <Route path="/admin/categories" element={<Categories />} />
      <Route path="/admin/products" element={<Products />} />
      <Route path="/admin/users" element={<Users />} />
    </Route>
  </Routes>
);

export default AppRoutes;