import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import generalService from "../../api/services/generalService";
import { toast } from "react-toastify";

const FlashSale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const response = await generalService.get(
        "/products",
        {
          pageNumber: 0,
        },
        { signal }
      );
      const filteredProducts = response.content
        .filter((product) => product.discountPercent > 0)
        .map((product) => ({
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
        }));
      setProducts(filteredProducts);
    } catch (err) {
      if (err.name === "AbortError") return;
      const errorMessage = err.response?.data?.message || "Không thể tải sản phẩm flash sale.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Flash Sale</h2>
          <div className="flex space-x-2 text-sm">
            <div className="bg-indigo-600 text-white px-3 py-1 rounded">12</div>
            <div className="bg-indigo-600 text-white px-3 py-1 rounded">34</div>
            <div className="bg-indigo-600 text-white px-3 py-1 rounded">56</div>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8)
              .fill()
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            Lỗi: {error}
            <button
              onClick={() => fetchProducts(new AbortController().signal)}
              className="ml-4 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Thử lại
            </button>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            Không có sản phẩm nào đáp ứng điều kiện giảm giá.
          </div>
        )}
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Xem tất cả sản phẩm
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FlashSale;