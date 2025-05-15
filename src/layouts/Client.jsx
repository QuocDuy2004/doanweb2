import { Outlet } from "react-router-dom";
import Header from "../components/client/Header";
import Footer from "../components/client/Footer";


const Client = () => {


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <main className="flex-grow"><Outlet /></main>
    <Footer />
  </div>
  );
};

export default Client;