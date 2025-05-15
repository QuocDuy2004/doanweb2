import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart, LogOut } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check login state and fetch cart data on mount

  // Function to fetch cart data and count unique cart item IDs
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Admin</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-900 hover:text-indigo-600">Trang chủ</a>
              <a href="/admin/products" className="text-gray-600 hover:text-indigo-600">Quản lý sản phẩm</a>
              <a href="/admin/categories" className="text-gray-600 hover:text-indigo-600">Quản lý danh mục</a>
              <a href="/admin/users" className="text-gray-600 hover:text-indigo-600">Quản lý thành viên</a>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-600 cursor-pointer hover:text-indigo-600" />
              </div>
              
              <div className="relative">
                <Heart className="h-5 w-5 text-gray-600 cursor-pointer hover:text-indigo-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
              </div>
              
            </div>
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-gray-600 hover:text-indigo-600 focus:outline-none">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <a href="/admin/Dashboard" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">Trang chủ</a>
              <a href="/admin/Products" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-md">Quản lý sản phẩm</a>
              <a href="/admin/Categories" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-md">Quản lý danh mục</a>
              <a href="/admin/Users" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-md">Quản lý thành viên</a>
              <a href="/admin/Carts" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-md">Quản lý giỏ hàng</a>
              <div className="flex space-x-4 px-3 py-2">
                <Search className="h-5 w-5 text-gray-600" />
                <div className="relative">
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      {isModalOpen && <AuthModal onClose={closeModal} />}
    </>
  );
};

export default Header;