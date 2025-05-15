import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";
import generalService from "../../api/services/generalService";
import toastService from "../../service/toastService";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderItemIds, setSelectedOrderItemIds] = useState([]);
  const [orderItemMap, setOrderItemMap] = useState(new Map());
  const [totalSelectedPrice, setTotalSelectedPrice] = useState(0);
  const [totalSelectedItems, setTotalSelectedItems] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const calculateTotals = useCallback((cartItems, currentOrderItemMap) => {
    if (!cartItems || !Array.isArray(cartItems)) {
      setTotalSelectedPrice(0);
      setTotalSelectedItems(0);
      return;
    }
    const selectedItems = cartItems.filter((item) => currentOrderItemMap.has(item.id));
    const totalPrice = selectedItems.reduce((total, item) => total + item.sellingPrice, 0);
    const totalItems = selectedItems.reduce((total, item) => total + item.quantity, 0);
    setTotalSelectedPrice(totalPrice);
    setTotalSelectedItems(totalItems);
  }, []);

  const fetchCartAndUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để xem giỏ hàng.");
      }

      const [cartResponse, userResponse, orderItemsResponse] = await Promise.all([
        generalService.get("/api/cart"),
        generalService.get("/users/profile"),
        generalService.get("/api/order-items"),
      ]);

      // Map cartItems by product.id and size to derive cartItemId if missing
      const cartItemLookup = new Map();
      cartResponse.cartItems.forEach((item) => {
        const key = `${item.product.id}-${item.size}`;
        cartItemLookup.set(key, item.id);
      });

      // Validate order-items against cartItems
      const cartItemIds = new Set(cartResponse.cartItems.map((item) => item.id));
      const validOrderItems = orderItemsResponse.filter((orderItem) => {
        // Check if cartItemId exists; if not, try to derive it using product.id and size
        if (!orderItem.cartItemId) {
          if (orderItem.product?.id && orderItem.size) {
            const key = `${orderItem.product.id}-${orderItem.size}`;
            const derivedCartItemId = cartItemLookup.get(key);
            if (derivedCartItemId) {
              console.warn(
                `OrderItem ${orderItem.id} missing cartItemId; derived cartItemId = ${derivedCartItemId} using product.id and size`
              );
              orderItem.cartItemId = derivedCartItemId;
            } else {
              console.warn(
                `OrderItem ${orderItem.id} missing cartItemId and cannot derive it (product.id: ${orderItem.product?.id}, size: ${orderItem.size}); skipping`
              );
              return false;
            }
          } else {
            console.warn(`OrderItem ${orderItem.id} has no cartItemId, product.id, or size; skipping`);
            return false;
          }
        }
        const isValid = cartItemIds.has(orderItem.cartItemId);
        if (!isValid) {
          console.warn(`OrderItem ${orderItem.id} has invalid cartItemId ${orderItem.cartItemId}; skipping`);
        }
        return isValid;
      });

      // Warn about invalid order-items
      const invalidOrderItems = orderItemsResponse.filter(
        (orderItem) => !orderItem.cartItemId || !cartItemIds.has(orderItem.cartItemId)
      );
      if (invalidOrderItems.length > 0) {
        console.warn(
          "Found order-items with invalid or missing cartItemIds:",
          invalidOrderItems.map((item) => ({
            id: item.id,
            cartItemId: item.cartItemId,
            productId: item.product?.id,
            size: item.size,
          }))
        );
      }

      setCart(cartResponse);
      setUserId(userResponse.id);

      // Create orderItemMap (cartItemId → orderItem.id) to track which cart items should have checked checkboxes
      const newOrderItemMap = new Map(
        validOrderItems.map((orderItem) => [orderItem.cartItemId, orderItem.id])
      );
      setOrderItemMap(newOrderItemMap);
      setSelectedOrderItemIds(validOrderItems.map((orderItem) => orderItem.id));

      // Calculate totals based on the initially checked items (from valid order-items)
      calculateTotals(cartResponse.cartItems, newOrderItemMap);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải giỏ hàng hoặc thông tin người dùng.";
      if (err.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/login");
      }
      setError(errorMessage);
      toastService.error(errorMessage, {
        autoClose: 4000,
        style: { border: "1px solid #f8d7da" },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndUser();
  }, [navigate]);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setIsProcessing(true);
      const response = await generalService.put(`/api/cart/item/${cartItemId}`, {
        quantity: newQuantity,
      });
      setCart((prev) => {
        if (!prev) return prev;
        const updatedCartItems = prev.cartItems.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: response.quantity, sellingPrice: response.sellingPrice }
            : item
        );
        calculateTotals(updatedCartItems, orderItemMap);
        return { ...prev, cartItems: updatedCartItems };
      });

      if (orderItemMap.has(cartItemId)) {
        try {
          await generalService.delete(`/api/order-items/${orderItemMap.get(cartItemId)}`);
        } catch (err) {
          if (err.response?.status !== 404) throw err;
        }
        const cartItem = cart?.cartItems.find((item) => item.id === cartItemId);
        if (cartItem) {
          const orderItem = {
            cartItemId,
            product: { id: cartItem.product.id },
            size: cartItem.size,
            quantity: response.quantity,
            mrpPrice: cartItem.mrpPrice,
            sellingPrice: response.sellingPrice,
            userId,
          };
          const orderItemResponse = await generalService.post("/api/order-items", orderItem);
          setOrderItemMap((prev) => new Map(prev).set(cartItemId, orderItemResponse.id));
          setSelectedOrderItemIds((prev) => [
            ...prev.filter((id) => id !== orderItemMap.get(cartItemId)),
            orderItemResponse.id,
          ]);
          calculateTotals(cart?.cartItems || [], new Map(orderItemMap).set(cartItemId, orderItemResponse.id));
        }
      }
    } catch (err) {
      toastService.error("Không thể cập nhật số lượng.", {
        autoClose: 4000,
        style: { border: "1px solid #f8d7da" },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      setIsProcessing(true);
      await generalService.delete(`/api/cart/item/${cartItemId}`);
      if (orderItemMap.has(cartItemId)) {
        try {
          await generalService.delete(`/api/order-items/${orderItemMap.get(cartItemId)}`);
        } catch (err) {
          if (err.response?.status !== 404) throw err;
        }
        setOrderItemMap((prev) => {
          const newMap = new Map(prev);
          newMap.delete(cartItemId);
          return newMap;
        });
        setSelectedOrderItemIds((prev) =>
          prev.filter((id) => id !== orderItemMap.get(cartItemId))
        );
      }
      setCart((prev) => {
        if (!prev) return prev;
        const updatedCartItems = prev.cartItems.filter((item) => item.id !== cartItemId);
        calculateTotals(updatedCartItems, orderItemMap);
        return { ...prev, cartItems: updatedCartItems };
      });
    } catch (err) {
      toastService.error("Không thể xóa sản phẩm.", {
        autoClose: 4000,
        style: { border: "1px solid #f8d7da" },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckboxChange = async (cartItemId) => {
    setIsProcessing(true);
    try {
      let updatedOrderItemMap = new Map(orderItemMap);
      if (orderItemMap.has(cartItemId)) {
        const orderItemId = orderItemMap.get(cartItemId);
        try {
          await generalService.delete(`/api/order-items/${orderItemId}`);
        } catch (err) {
          if (err.response?.status !== 404) throw err;
        }
        updatedOrderItemMap.delete(cartItemId);
        setOrderItemMap(updatedOrderItemMap);
        setSelectedOrderItemIds((prev) => prev.filter((id) => id !== orderItemId));
      } else {
        const cartItem = cart?.cartItems.find((item) => item.id === cartItemId);
        if (cartItem) {
          const orderItem = {
            cartItemId,
            product: { id: cartItem.product.id },
            size: cartItem.size,
            quantity: cartItem.quantity,
            mrpPrice: cartItem.mrpPrice,
            sellingPrice: cartItem.sellingPrice,
            userId,
          };
          const orderItemResponse = await generalService.post("/api/order-items", orderItem);
          updatedOrderItemMap.set(cartItemId, orderItemResponse.id);
          setOrderItemMap(updatedOrderItemMap);
          setSelectedOrderItemIds((prev) => [...prev, orderItemResponse.id]);
        }
      }
      calculateTotals(cart?.cartItems || [], updatedOrderItemMap);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/login");
        toastService.error("Phiên đăng nhập hết hạn.", {
          autoClose: 4000,
          style: { border: "1px solid #f8d7da" },
        });
      } else {
        toastService.error("Đã xảy ra lỗi khi cập nhật lựa chọn.", {
          autoClose: 4000,
          style: { border: "1px solid #f8d7da" },
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (selectedOrderItemIds.length === 0) {
      toastService.error("Vui lòng chọn ít nhất một sản phẩm.", {
        autoClose: 4000,
        style: { border: "1px solid #f8d7da" },
      });
      return;
    }
    setIsProcessing(true);
    try {
      navigate("/checkout");
    } catch (err) {
      toastService.error("Không thể tạo đơn hàng. Vui lòng thử lại.", {
        autoClose: 4000,
        style: { border: "1px solid #f8d7da" },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center">Đang tải giỏ hàng...</div>;
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-500">
        {error}
        <button
          onClick={fetchCartAndUser}
          className="ml-4 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Giỏ hàng của bạn trống.</p>
        <Link
          to="/"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {cart.cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-4 border-b border-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={orderItemMap.has(item.id)}
                    onChange={() => handleCheckboxChange(item.id)}
                    className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    disabled={isProcessing}
                  />
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-20 h-20 object-cover rounded ml-4"
                  />
                  <div className="flex-1 ml-4">
                    <Link
                      to={`/products/${item.product.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-sm text-gray-600">Kích thước: {item.size}</p>
                    <p className="text-sm text-gray-600">
                      Giá: {item.sellingPrice.toLocaleString("vi-VN")}đ
                    </p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        disabled={item.quantity <= 1 || isProcessing}
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <span className="mx-3 text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        disabled={isProcessing}
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded"
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng số lượng:</span>
                  <span className="font-medium">{totalSelectedItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng giá:</span>
                  <span className="font-medium">
                    {totalSelectedPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="text-red-500">-{cart.discount}%</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleCheckout}
                className={`mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors ${
                  isProcessing || selectedOrderItemIds.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={isProcessing || selectedOrderItemIds.length === 0}
              >
                {isProcessing ? "Đang xử lý..." : "Tiến hành thanh toán"}
              </button>
              <Link
                to="/"
                className="mt-4 block text-center text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;