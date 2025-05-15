import { Outlet } from "react-router-dom";
import Header from "../components/admin/Header";
import Footer from "../components/admin/Footer";


const Admin = () => {


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <main className="flex-grow"><Outlet /></main>
    <Footer />
  </div>
  );
};

export default Admin;