import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import generalService from "../../api/services/generalService";
import toastService from "../../service/toastService";

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
  });
  const navigate = useNavigate();

  // Fetch cart and user profile
  const fetchCartAndUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để tiếp tục thanh toán.");
      }

      const [cartResponse, userResponse] = await Promise.all([
        generalService.get("/api/cart"),
        generalService.get("/users/profile"),
      ]);

      setCart(cartResponse);
      setUser({
        id: userResponse.id,
        email: userResponse.email || "Không có",
        fullName: userResponse.fullName || "Không có",
        mobile: userResponse.mobile || "Không có",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải thông tin thanh toán.";
      if (err.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/login");
      }
      setError(errorMessage);
      toastService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndUser();
  }, [navigate]);

  // Handle payment method change
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Handle new address input
  const handleNewAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  // Validate address
  const validateAddress = (address) => {
    console.log("Validating address:", address);
    if (!address) {
      toastService.error("Vui lòng nhập địa chỉ giao hàng.");
      return false;
    }
    const { street, city, country, zipcode } = address;
    if (!street || !city || !country || !zipcode) {
      toastService.error("Vui lòng nhập đầy đủ thông tin địa chỉ (đường, thành phố, quốc gia, mã bưu điện).");
      return false;
    }
    return true;
  };

  // Delete order-items by their IDs
  const deleteOrderItems = async () => {
    try {
      // Fetch remaining order-items for the user
      const orderItemsResponse = await generalService.get("/api/order-items");
      const orderItems = orderItemsResponse || [];

      // Delete each order-item
      await Promise.all(
        orderItems.map((item) =>
          generalService.delete(`/api/order-items/${item.id}`)
        )
      );
      console.log("Successfully deleted all order-items.");
    } catch (err) {
      console.error("Error deleting order-items:", err);
      toastService.error("Không thể xóa order-items sau khi đặt hàng.");
    }
  };

  // Delete cart items by their IDs
  const deleteCartItems = async () => {
    try {
      // Delete each cart item using its ID
      await Promise.all(
        cart.cartItems.map((item) =>
          generalService.delete(`/api/cart/item/${item.id}`)
        )
      );
      console.log("Successfully deleted all cart items.");
      // Clear the cart in the state
      setCart({ ...cart, cartItems: [] });
    } catch (err) {
      console.error("Error deleting cart items:", err);
      toastService.error("Không thể xóa cart items sau khi đặt hàng.");
    }
  };

  // Create order for a specific seller
  const createOrderForSeller = async (sellerId, items, address) => {
    console.log("Creating order for seller:", sellerId, "with items:", items);
    // Validate sellerId and items
    if (!sellerId || !items || items.length === 0) {
      throw new Error(`Invalid sellerId (${sellerId}) or empty items for order creation`);
    }
    if (!items.every((item) => item.product?.id && item.product?.seller?.id)) {
      throw new Error("Invalid cart item data: missing product or seller information");
    }

    const orderData = {
      shippingAddress: address,
      cart: {
        cartItems: items.map((item) => ({
          product: {
            id: item.product.id,
            seller: {
              id: item.product.seller.id,
            },
          },
          size: item.size,
          quantity: item.quantity,
          mrpPrice: item.mrpPrice,
          sellingPrice: item.sellingPrice,
          userId: user.id,
        })),
      },
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "PAYPAL" ? "PAID" : "PENDING",
    };

    console.log("Order data being sent to /api/orders/create:", orderData);
    const response = await generalService.post("/api/orders/create", orderData);
    return response;
  };

  // Create orders for all sellers
  const createOrder = async () => {
    console.log("Starting createOrder with paymentMethod:", paymentMethod);
    if (!paymentMethod) {
      toastService.error("Vui lòng chọn phương thức thanh toán.");
      return false;
    }

    if (!validateAddress(newAddress)) {
      console.log("Address validation failed");
      return false;
    }

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      toastService.error("Không có sản phẩm trong giỏ hàng.");
      console.log("No cart items");
      return false;
    }

    setIsProcessing(true);
    try {
      const itemsBySeller = cart.cartItems.reduce((acc, item) => {
        const sellerId = item.product.seller.id;
        acc[sellerId] = acc[sellerId] || [];
        acc[sellerId].push(item);
        return acc;
      }, {});

      console.log("Items by seller:", itemsBySeller);

      await Promise.all(
        Object.keys(itemsBySeller).map((sellerId) =>
          createOrderForSeller(sellerId, itemsBySeller[sellerId], newAddress)
        )
      );

      // After successful order creation, delete both order-items and cart items
      await deleteOrderItems();
      await deleteCartItems();

      toastService.success("Đặt hàng thành công!");
      navigate("/checkout");
      return true;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Không thể đặt hàng. Vui lòng thử lại.";
      toastService.error(errorMessage);
      console.error("Create order error:", err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle COD order placement
  const handlePlaceOrder = async () => {
    console.log("handlePlaceOrder called with paymentMethod:", paymentMethod);
    if (paymentMethod !== "COD") {
      toastService.error("Vui lòng sử dụng nút PayPal để thanh toán.");
      console.log("Invalid payment method for COD");
      return;
    }
    await createOrder();
  };

  // PayPal: Create transaction
  const createPaypalOrder = (data, actions) => {
    if (totalSellingPrice <= 0) {
      toastService.error("Tổng giá đơn hàng không hợp lệ.");
      return Promise.reject(new Error("Invalid total price"));
    }
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: (totalSellingPrice / 23000).toFixed(2),
          },
        },
      ],
    });
  };

  // PayPal: Handle successful payment
  const onApprovePaypal = async (data, actions) => {
    try {
      setIsProcessing(true);
      const capture = await actions.order.capture();
      if (capture.status !== "COMPLETED") {
        throw new Error("Thanh toán PayPal không hoàn tất.");
      }
      const success = await createOrder();
      if (!success) {
        throw new Error("Không thể tạo đơn hàng sau thanh toán.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Thanh toán thất bại. Vui lòng thử lại.";
      toastService.error(errorMessage);
      console.error("PayPal Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // PayPal: Handle cancellation
  const onCancelPaypal = () => {
    toastService.error("Thanh toán đã bị hủy.");
  };

  // PayPal: Handle errors
  const onErrorPaypal = (err) => {
    toastService.error("Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại.");
    console.error("PayPal Error:", err);
  };

  // Calculate order summary
  const totalItems = cart?.cartItems ? cart.cartItems.reduce((total, item) => total + item.quantity, 0) : 0;
  const totalSellingPrice = cart?.cartItems ? cart.cartItems.reduce((total, item) => total + item.sellingPrice, 0) : 0;

  if (loading) {
    return <div className="py-12 text-center">Đang tải thông tin thanh toán...</div>;
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
        <p className="text-gray-600">Không có sản phẩm nào trong giỏ hàng.</p>
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin khách hàng</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Họ tên:</span> {user?.fullName}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Số điện thoại:</span> {user?.mobile}
                </p>
              </div>
              <Link
                to="/profile"
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Cập nhật thông tin
              </Link>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Địa chỉ giao hàng</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Đường</label>
                  <input
                    type="text"
                    name="street"
                    value={newAddress.street}
                    onChange={handleNewAddressChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nhập số nhà, đường, phường/xã"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thành phố</label>
                  <input
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleNewAddressChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Thành phố"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành</label>
                  <input
                    type="text"
                    name="state"
                    value={newAddress.state}
                    onChange={handleNewAddressChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Tỉnh/Thành"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quốc gia</label>
                  <input
                    type="text"
                    name="country"
                    value={newAddress.country}
                    onChange={handleNewAddressChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Quốc gia"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mã bưu điện</label>
                  <input
                    type="text"
                    name="zipcode"
                    value={newAddress.zipcode}
                    onChange={handleNewAddressChange}
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Mã bưu điện"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 p-6">Sản phẩm trong giỏ hàng</h2>
              {cart.cartItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex items-center p-4 border-b border-gray-200"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 ml-4">
                    <Link
                      to={`/products/${item.product.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-sm text-gray-600">Kích thước: {item.size}</p>
                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    <p className="text-sm text-gray-600">
                      Giá đơn vị: {(item.sellingPrice / item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                    <p className="text-sm font-medium">
                      Tổng: {item.sellingPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary and Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng số lượng:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng giá:</span>
                  <span className="font-medium">
                    {totalSellingPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-900 font-medium">Tổng cộng:</span>
                  <span className="font-bold text-indigo-600">
                    {totalSellingPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Phương thức thanh toán</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={handlePaymentMethodChange}
                      className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    Thanh toán khi nhận hàng (COD)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="PAYPAL"
                      checked={paymentMethod === "PAYPAL"}
                      onChange={handlePaymentMethodChange}
                      className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    Thanh toán trực tuyến (PayPal)
                  </label>
                </div>
              </div>

              {/* PayPal or Place Order Button */}
              {paymentMethod === "PAYPAL" ? (
                <PayPalScriptProvider
                  options={{
                    "client-id": "AeWnfV9coBr4t6-zoq9KssoY9w7xRB7SDur-DhKqRXXqm6oh7YsM4Tov8vefHITuU0H79UpgzpTECPvfq",
                    currency: "USD",
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={createPaypalOrder}
                    onApprove={onApprovePaypal}
                    onCancel={onCancelPaypal}
                    onError={onErrorPaypal}
                    disabled={isProcessing || totalSellingPrice <= 0}
                  />
                </PayPalScriptProvider>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className={`mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors ${
                    isProcessing || totalSellingPrice <= 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isProcessing || totalSellingPrice <= 0}
                >
                  {isProcessing ? "Đang xử lý..." : "Xác nhận đặt hàng (COD)"}
                </button>
              )}

              <Link
                to="/cart"
                className="mt-4 block text-center text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;