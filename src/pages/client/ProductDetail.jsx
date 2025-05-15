import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Star, Plus, Minus } from "lucide-react";
import generalService from "../../api/services/generalService";
import toastService from "../../service/toastService";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 }); // State to track image dimensions

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await generalService.get(`/products/${id}`);
        console.log('Product details:', response);
        setProduct(response);
        if (response.sizes && response.sizes.length > 0) {
          setSelectedSize(response.sizes[0]);
        }
        if (response.images && response.images.length > 0) {
          setSelectedImage(response.images[0]);
          // Load the first image to get its dimensions
          const img = new Image();
          img.src = response.images[0];
          img.onload = () => {
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          };
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || err.message || 'Không thể tải sản phẩm');
        setLoading(false);
        toastService.error(`Không thể tải sản phẩm: ${err.response?.data?.message || err.message}`);
      }
    };
    fetchProduct();
  }, [id]);

  const formatPrice = (price) => {
    return price ? `${Number(price).toLocaleString('vi-VN')} VNĐ` : 'N/A';
  };

  const handleAddToCart = async (name) => {
    if (product.quantity === 0) {
      toastService.error("Sản phẩm đã hết hàng!");
      return;
    }
    if (!selectedSize) {
      toastService.error("Vui lòng chọn kích thước!");
      return;
    }
    if (quantity < 1 || quantity > product.quantity) {
      toastService.error(`Số lượng phải từ 1 đến ${product.quantity}!`);
      return;
    }

    try {
      const cartData = {
        productId: id,
        size: selectedSize,
        quantity: quantity,
      };
      await generalService.put("/api/cart/add", cartData);
      toastService.success(`Đã thêm ${name} vào giỏ hàng`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      toastService.error(err.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleFavorite = (name) => {
    console.log(`Favorited ${name}`);
    toastService.success(`Đã thêm ${name} vào danh sách yêu thích`);
    // Implement actual favorite logic here
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    // Load the selected image to get its dimensions
    const img = new Image();
    img.src = image;
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
  };

  const incrementQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="text-lg font-semibold text-gray-600 animate-pulse">Đang tải...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Lỗi: {error || 'Sản phẩm không tồn tại'}</h2>
        <Link to="/Product" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  // Calculate the image container dimensions while maintaining aspect ratio
  const maxHeight = 384; // Maximum height in pixels (h-96 = 384px)
  const maxWidth = 640; // Maximum width in pixels (based on lg:w-1/2 and container width)
  const aspectRatio = imageDimensions.width / imageDimensions.height;
  let displayWidth = maxWidth;
  let displayHeight = maxWidth / aspectRatio;

  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = maxHeight * aspectRatio;
  }

  return (
    <div className="container mx-auto px-4 py-16 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-7xl mx-auto p-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Images */}
          <div className="lg:w-1/2">
            <div className="relative flex justify-center items-center bg-gray-50 rounded-2xl border border-gray-200 p-4">
              <img
                src={selectedImage || (product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/400')}
                alt={product.title}
                style={{
                  width: `${displayWidth}px`,
                  height: `${displayHeight}px`,
                  objectFit: 'contain',
                }}
                className="rounded-2xl transition-transform duration-300 transform hover:scale-105"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/400')}
              />
              {product.discountPercent > 0 && (
                <div className="absolute top-6 left-6 bg-gradient-to-r from-red-600 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  Giảm giá {product.discountPercent}%
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              {product.images && product.images.length > 0 &&
                product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    className={`w-20 h-20 object-contain rounded-lg border-2 transition-all duration-200 transform hover:scale-110 cursor-pointer ${
                      selectedImage === img ? "border-indigo-500 shadow-md" : "border-gray-200 hover:border-indigo-400"
                    }`}
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/64')}
                    onClick={() => handleImageSelect(img)}
                  />
                ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">{product.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">{product.description || 'Không có mô tả'}</p>

            {product.numRatings > 0 && (
              <div className="flex items-center mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.numRatings) ? "text-yellow-400" : "text-gray-300"
                      }`}
                      fill={i < Math.floor(product.numRatings) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">{product.numRatings.toFixed(1)} ({product.numRatings} đánh giá)</span>
              </div>
            )}

            <div className="flex items-center flex-wrap gap-4 mb-6">
              <span className={`text-3xl font-bold ${product.mrpPrice ? "text-indigo-600" : "text-gray-900"}`}>
                {formatPrice(product.sellingPrice)}
              </span>
              {product.mrpPrice && product.mrpPrice > product.sellingPrice && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.mrpPrice)}</span>
              )}
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <p className="text-base text-gray-600">
                  <span className="font-medium">Màu sắc:</span> {Array.isArray(product.color) && product.color.length > 0 ? product.color.join(", ") : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-base text-gray-600">
                  <span className="font-medium">Số lượng còn lại:</span> {product.quantity > 0 ? product.quantity : "Hết hàng"}
                </p>
              </div>
              {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Kích thước:</label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 border-2 shadow-sm ${
                          selectedSize === size
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-indigo-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Số lượng:</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="text-xl font-semibold text-gray-800 w-12 text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.quantity}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-base text-gray-600">
                  <span className="font-medium">Danh mục:</span> {product.category?.name || product.category?.categoryId || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <button
                className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white py-3 rounded-xl font-medium transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => handleAddToCart(product.title)}
                disabled={product.quantity === 0}
                aria-label={`Thêm ${product.title} vào giỏ hàng`}
              >
                Thêm vào giỏ
              </button>
              <button
                className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all duration-200 border border-gray-200 transform hover:scale-110"
                onClick={() => handleFavorite(product.title)}
                aria-label={`Thêm ${product.title} vào danh sách yêu thích`}
              >
                <Heart className="h-6 w-6 text-gray-600 hover:text-red-500 transition-colors" />
              </button>
            </div>
            <Link to="/Product" className="inline-block text-indigo-600 hover:text-indigo-800 text-base font-medium transition-colors">
              Quay lại danh sách sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;