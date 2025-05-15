import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import ProductCard from "./ProductCard";
import generalService from "../../api/services/generalService";

const Fproduct = () => {
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
      const fetchedProducts = response.content.slice(0, 8).map((product) => ({
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
      setProducts(fetchedProducts);
    } catch (err) {
      if (err.name === "AbortError") return;
      const errorMessage = err.response?.data?.message || "Không thể tải sản phẩm nổi bật.";
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

  if (error) {
    return (
      <div className="py-12 text-center text-red-500">
        {error}
        <button
          onClick={() => fetchProducts(new AbortController().signal)}
          className="ml-4 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Sản phẩm nổi bật</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array(8)
                .fill()
                .map((_, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))
            : products.map((product) => <ProductCard key={product.id} {...product} />)}
        </div>
        <div className="text-center mt-8">
          <Link to="/products" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
            Xem tất cả sản phẩm
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Fproduct;