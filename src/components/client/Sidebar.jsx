import { useState } from "react";
import { Search, User, X, Sun, Moon } from "lucide-react";
import AuthModal from "./auth/AuthModal";

const Sidebar = ({ isOpen, toggleSidebar, toggleTheme, theme }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const openAuthModal = () => {
    setIsAuthOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthOpen(false);
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl transform transition-transform md:static md:flex md:flex-row md:items-center md:w-auto md:p-0 md:shadow-none md:transform-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-50`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 p-5 md:p-0">
          <button
            onClick={toggleSidebar}
            className="text-gray-900 hover:text-indigo-600 mb-4 md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
          <a
            href="/"
            className="py-2 md:py-0 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
          >
            Trang chủ
          </a>
          <a
            href="/booking"
            className="py-2 md:py-0 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
          >
            Đặt vé xem phim
          </a>
          <a
            href="/history"
            className="py-2 md:py-0 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
          >
            Vé đã mua
          </a>
          <a
            href="#"
            className="py-2 md:py-0 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
          >
            Tất cả các giải trí
          </a>
          <a
            href="/about"
            className="py-2 md:py-0 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
          >
            Giới thiệu
          </a>
          <a
            href="/contact"
            className="py-2 md:py-0 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
          >
            Liên hệ
          </a>
          <a
            href="/profile"
            className="py-2 md:py-0 text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
          >
            Thông tin
          </a>
        </div>
        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col md:flex-row md:items-center md:gap-3 space-y-3 md:space-y-0 p-5 md:p-0">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Tìm phim..."
              className="bg-gray-100 rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm text-gray-900"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
          </div>
          <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full px-4 py-2 transition-colors flex items-center text-sm"
            onClick={openAuthModal}
          >
            <User className="h-5 w-5 mr-2" /> Đăng nhập
          </button>
          <button
            className="bg-indigo-600 text-white rounded-full px-4 py-2 hover:bg-indigo-700 transition-all text-sm"
          >
            Đăng ký
          </button>
          <button
            onClick={toggleTheme}
            className="hidden md:flex bg-white border border-gray-300 rounded-full w-10 h-10 items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      {isAuthOpen && <AuthModal onClose={closeAuthModal} />}
    </>
  );
};

export default Sidebar;