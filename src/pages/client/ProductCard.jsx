import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import toastService from "../../service/toastService";

const ProductCard = ({
  id,
  title,
  sellingPrice,
  mrpPrice,
  numRatings,
  images,
  discountPercent,
  tag,
  description,
  colors,
  quantity,
  sizes,
}) => {
  const formatPrice = (price) => {
    return price ? `${Number(price).toLocaleString('vi-VN')} VNĐ` : 'N/A';
  };

  const handleAddToCart = (e, name) => {
    e.preventDefault();
    if (quantity === 0) {
      toastService.error("Sản phẩm đã hết hàng!");
      return;
    }
    console.log(`Added ${name} to cart`);
    toastService.success(`Đã thêm ${name} vào giỏ hàng`);
    // Implement actual cart logic here
  };

  const handleFavorite = (e, name) => {
    e.preventDefault();
    console.log(`Favorited ${name}`);
    toastService.success(`Đã thêm ${name} vào danh sách yêu thích`);
    // Implement actual favorite logic here
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <Link to={`/products/${id}`} className="block" aria-label={`Xem chi tiết ${title}`}>
        <div className="relative">
          <img
            src={images && images[0] ? images[0] : 'https://via.placeholder.com/300x192'}
            alt={title}
            className="w-full h-48 object-cover rounded-t-lg"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/300x192')}
          />
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Giảm giá {discountPercent}%
            </div>
          )}
          {tag && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              {tag}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 truncate text-sm md:text-base">{title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description || 'Không có mô tả'}</p>
          {numRatings > 0 && (
            <div className="flex items-center mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(numRatings) ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill={i < Math.floor(numRatings) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">{numRatings.toFixed(1)}</span>
            </div>
          )}
          <div className="mt-2 flex items-center flex-wrap gap-2">
            <span className={`text-lg font-bold ${mrpPrice ? "text-indigo-600" : "text-gray-900"}`}>
              {formatPrice(sellingPrice)}
            </span>
            {mrpPrice && mrpPrice > sellingPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(mrpPrice)}</span>
            )}
          </div>
          {Array.isArray(colors) && colors.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">Màu sắc: {colors.join(", ")}</p>
          )}
          <p className="text-sm text-gray-600 mt-1">
            Số lượng: {quantity > 0 ? quantity : "Hết hàng"}
          </p>
          {Array.isArray(sizes) && sizes.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">Kích thước: {sizes.join(", ")}</p>
          )}
        </div>
      </Link>
      <div className="p-4 pt-0 flex justify-between items-center">
        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium text-sm transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
          onClick={(e) => handleAddToCart(e, title)}
          disabled={quantity === 0}
          aria-label={`Thêm ${title} vào giỏ hàng`}
        >
          Thêm vào giỏ
        </button>
        <button
          className="ml-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100 transition-colors duration-200"
          onClick={(e) => handleFavorite(e, title)}
          aria-label={`Thêm ${title} vào danh sách yêu thích`}
        >
          <Heart className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;