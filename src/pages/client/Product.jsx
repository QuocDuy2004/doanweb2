import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import generalService from "../../api/services/generalService";
import { toast } from "react-toastify";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await generalService.get("/categories/all");
        const formattedCategories = response
          .map((category) => ({
            id: category.id,
            categoryId: category.categoryId,
            displayName: category.name || category.categoryId,
            level: category.level,
          }))
          .sort(
            (a, b) =>
              a.level - b.level || a.displayName.localeCompare(b.displayName)
          );
        setCategories(formattedCategories);
      } catch (err) {
        console.error("Không thể tải danh mục:", err);
        toast.error("Không thể tải danh mục.");
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(
    async (query, pageNumber, categoryId, sort, signal) => {
      try {
        setLoading(true);
        setError(null);
        let response;
        const params = { pageNumber };

        if (query) params.query = query;
        if (categoryId) params.categoryId = categoryId;
        if (sort) params.sort = sort;

        if (query || categoryId || sort) {
          response = await generalService.get("/products/search", params, { signal });
          setProducts(
            response.map((product) => ({
              id: product.id,
              title: product.title,
              description: product.description || "Không có mô tả",
              sellingPrice: product.sellingPrice || null,
              mrpPrice: product.mrpPrice || null,
              numRatings: product.numRatings || 0,
              images: product.images || [],
              discountPercent: product.discountPercent || null,
              tag: product.quantity > 0 ? "Còn hàng" : "Hết hàng",
              colors: product.color && Array.isArray(product.color) ? product.color : [],
              quantity: product.quantity || 0,
              sizes: product.sizes || [],
            }))
          );
          setTotalPages(1);
        } else {
          response = await generalService.get("/products", params, { signal });
          setProducts(
            response.content.map((product) => ({
              id: product.id,
              title: product.title,
              description: product.description || "Không có mô tả",
              sellingPrice: product.sellingPrice || null,
              mrpPrice: product.mrpPrice || null,
              numRatings: product.numRatings || 0,
              images: product.images || [],
              discountPercent: product.discountPercent || null,
              tag: product.quantity > 0 ? "Còn hàng" : "Hết hàng",
              colors: product.color && Array.isArray(product.color) ? product.color : [],
              quantity: product.quantity || 0,
              sizes: product.sizes || [],
            }))
          );
          setTotalPages(response.totalPages);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        const errorMessage = err.response?.data?.message || "Không thể tải danh sách sản phẩm.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Sync search params with state
  useEffect(() => {
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "";
    setSearchQuery(query);
    setSelectedCategory(category);
    setSortOption(sort);
    const controller = new AbortController();
    fetchProducts(query, page, category, sort, controller.signal);
    return () => controller.abort();
  }, [searchParams, page, fetchProducts]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ query: searchQuery, category: selectedCategory, sort: sortOption });
    setPage(0);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSearchParams({ query: searchQuery, category: categoryId, sort: sortOption });
    setPage(0);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    setSortOption(sortValue);
    setSearchParams({ query: searchQuery, category: selectedCategory, sort: sortValue });
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortOption("");
    setSearchParams({});
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // Skeleton Loader
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 bg-white animate-pulse"
        >
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="py-12 text-center text-red-500">
        {error}
        <button
          onClick={() => fetchProducts(searchQuery, page, selectedCategory, sortOption, new AbortController().signal)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Tất cả sản phẩm
        </h2>

        {/* Search Bar, Category Filter, and Sort Options */}
        <div className="mb-8 max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm theo tiêu đề..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Tìm kiếm sản phẩm"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Tìm kiếm
            </button>
          </form>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="category" className="block mb-2 font-medium">
                Chọn danh mục:
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Chọn danh mục"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.categoryId}>
                    {"\u00A0".repeat((category.level - 1) * 2)}{" "}
                    {category.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="sort" className="block mb-2 font-medium">
                Sắp xếp theo:
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Sắp xếp sản phẩm"
              >
                <option value="">Mặc định</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
            {(searchQuery || selectedCategory || sortOption) && (
              <button
                onClick={handleClearFilters}
                className="mt-8 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                aria-label="Xóa bộ lọc"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          renderSkeleton()
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!searchQuery && !selectedCategory && !sortOption && totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2 items-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              aria-label="Trang trước"
            >
              Trước
            </button>
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index)}
                  className={`px-3 py-1 rounded-lg ${
                    page === index
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  aria-label={`Trang ${index + 1}`}
                  aria-current={page === index ? "page" : undefined}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages - 1}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              aria-label="Trang sau"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;