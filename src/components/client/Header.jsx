import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart, LogOut } from "lucide-react";
import AuthModal from "../auth/AuthModal";
import generalService from "../../api/services/generalService";
import toastService from "../../service/toastService";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);

    if (token) {
      fetchCartData();
    }

    // Handle click outside to close search dropdown
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setSelectedResultIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Handle keyboard navigation
    const handleKeyDown = (event) => {
      if (!isSearchOpen || searchResults.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedResultIndex((prev) => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (event.key === 'Enter' && selectedResultIndex >= 0) {
        event.preventDefault();
        handleSearchSelect(searchResults[selectedResultIndex].id);
      } else if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setSelectedResultIndex(-1);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen, searchResults, selectedResultIndex]);

  useEffect(() => {
    // Debounce search to avoid excessive API calls
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSearchResults();
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
        setSelectedResultIndex(-1);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchCartData = async () => {
    try {
      const response = await generalService.get("/api/cart");
      if (response && response.cartItems) {
        const uniqueItemCount = response.cartItems.length;
        setCartItemCount(uniqueItemCount);
      } else {
        setCartItemCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      toastService.error("Không thể tải giỏ hàng: " + (error.response?.data?.message || error.message));
      setCartItemCount(0);
    }
  };

  const fetchSearchResults = async () => {
    setIsSearchLoading(true);
    try {
      const response = await generalService.get(`/products/search?query=${encodeURIComponent(searchQuery)}`);
      console.log('Search results:', response);
      const results = Array.isArray(response) ? response.slice(0, 10) : []; // Limit to 10 results
      setSearchResults(results);
      setIsSearchOpen(true);
    } catch (error) {
      console.error("Error fetching search results:", error);
      toastService.error("Không thể tìm kiếm sản phẩm: " + (error.response?.data?.message || error.message));
      setSearchResults([]);
      setIsSearchOpen(false);
    } finally {
      setIsSearchLoading(false);
      setSelectedResultIndex(-1);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsSearchOpen(false); // Close search dropdown when toggling menu
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setIsModalOpen(false);
    setCartItemCount(0);
    toastService.success("Đăng xuất thành công!");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSelect = (productId) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
    setSelectedResultIndex(-1);
    navigate(`/products/${productId}`);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="bg-yellow-200">$1</span>');
  };

  return (
    <>
      <header className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">ShopViet</Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-900 hover:text-indigo-600">Trang chủ</Link>
              <Link to="/Products" className="text-gray-600 hover:text-indigo-600">Sản phẩm</Link>
              <Link to="/promotions" className="text-gray-600 hover:text-indigo-600">Khuyến mãi</Link>
              <Link to="/collections" className="text-gray-600 hover:text-indigo-600">Bộ sưu tập</Link>
              <Link to="/Contact" className="text-gray-600 hover:text-indigo-600">Liên hệ</Link>
              <Link to="/Profile" className="text-gray-600 hover:text-indigo-600">Thông tin</Link>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative z-10" ref={searchRef}>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-56 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200"
                    onFocus={() => setIsSearchOpen(true)}
                    aria-label="Search products"
                  />
                  <Search className="h-5 w-5 text-gray-600 cursor-pointer hover:text-indigo-600 ml-2" />
                </div>
                {isSearchOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white border rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
                    {isSearchLoading ? (
                      <div className="p-3 text-sm text-gray-500 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang tải...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((product, index) => (
                        <div
                          key={product.id}
                          className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150 ${
                            index === selectedResultIndex ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => handleSearchSelect(product.id)}
                        >
                          <img
                            src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/48'}
                            alt={product.title}
                            className="h-12 w-12 object-cover rounded mr-3"
                            onError={(e) => (e.target.src = 'https://via.placeholder.com/48')}
                          />
                          <span
                            className="text-sm text-gray-800 truncate"
                            dangerouslySetInnerHTML={{ __html: highlightMatch(product.title, searchQuery) }}
                          />
                        </div>
                      ))
                    ) : searchQuery.trim() ? (
                      <div className="p-3 text-sm text-gray-500">Không tìm thấy sản phẩm</div>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="relative z-10">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-600 hover:text-indigo-600 focus:outline-none"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Đăng xuất</span>
                  </button>
                ) : (
                  <button
                    onClick={openModal}
                    className="focus:outline-none"
                    aria-label="Open login modal"
                  >
                    <User className="h-5 w-5 text-gray-600 hover:text-indigo-600" />
                  </button>
                )}
              </div>
              <div className="relative z-10">
                <Link to="/wishlist">
                  <Heart className="h-5 w-5 text-gray-600 cursor-pointer hover:text-indigo-600" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center pointer-events-none">2</span>
                </Link>
              </div>
              <div className="relative z-10">
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5 text-gray-600 cursor-pointer hover:text-indigo-600" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center pointer-events-none">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-gray-600 hover:text-indigo-600 focus:outline-none z-20">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <div className="relative z-10 px-3" ref={searchRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  onFocus={() => setIsSearchOpen(true)}
                  aria-label="Search products"
                />
                {isSearchOpen && (
                  <div className="absolute top-full left-3 right-3 mt-2 bg-white border rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
                    {isSearchLoading ? (
                      <div className="p-3 text-sm text-gray-500 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang tải...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((product, index) => (
                        <div
                          key={product.id}
                          className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150 ${
                            index === selectedResultIndex ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => handleSearchSelect(product.id)}
                        >
                          <img
                            src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/48'}
                            alt={product.title}
                            className="h-12 w-12 object-cover rounded mr-3"
                            onError={(e) => (e.target.src = 'https://via.placeholder.com/48')}
                          />
                          <span
                            className="text-sm text-gray-800 truncate"
                            dangerouslySetInnerHTML={{ __html: highlightMatch(product.title, searchQuery) }}
                          />
                        </div>
                      ))
                    ) : searchQuery.trim() ? (
                      <div className="p-3 text-sm text-gray-500">Không tìm thấy sản phẩm</div>
                    ) : null}
                  </div>
                )}
              </div>
              <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-md">Trang chủ</Link>
              <Link to="/Products" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-md">Sản phẩm</Link>
              <Link to="#" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-md">Khuyến mãi</Link>
              <Link to="#" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-md">Bộ sưu tập</Link>
              <Link to="#" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 rounded-md">Liên hệ</Link>
              <div className="flex space-x-4 px-3 py-2">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-600 hover:text-indigo-600 z-10"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Đăng xuất</span>
                  </button>
                ) : (
                  <button onClick={openModal} className="z-10" aria-label="Open login modal">
                    <User className="h-5 w-5 text-gray-600" />
                  </button>
                )}
                <div className="relative z-10">
                  <Link to="/wishlist">
                    <Heart className="h-5 w-5 text-gray-600" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center pointer-events-none">2</span>
                  </Link>
                </div>
                <div className="relative z-10">
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center pointer-events-none">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
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