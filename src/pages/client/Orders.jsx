import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Package, ChevronRight } from "lucide-react";
import generalService from "../../api/services/generalService";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = "123"; // Giả định userId, thay bằng giá trị từ context/auth

  const fetchOrders = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError(null);
        const response = await generalService.get("/orders", { userId }, { signal });
        setOrders(
          response.map((order) => ({
            id: order.id,
            orderDate: new Date(order.orderDate).toLocaleString("vi-VN"),
            totalAmount: `${order.totalAmount.toLocaleString("vi-VN")}đ`,
            status: order.status,
            items: order.items.map((item) => ({
              productName: item.product.title,
              price: `${item.product.sellingPrice.toLocaleString("vi-VN")}đ`,
              quantity: item.quantity,
              image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : "https://via.placeholder.com/150",
            })),
          }))
        );
      } catch (err) {
        if (err.name === "AbortError") return;
        const errorMessage = err.response?.data?.message || "Không thể tải lịch sử đơn hàng.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    try {
      await generalService.post(`/orders/${orderId}/cancel`);
      toast.success("Hủy đơn hàng thành công!");
      fetchOrders(new AbortController().signal);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Không thể hủy đơn hàng.";
      toast.error(errorMessage);
      console.error(err);
    }
  };

  if (error) {
    return (
      <div className="py-12 text-center text-red-500">
        {error}
        <button
          onClick={() => fetchOrders(new AbortController().signal)}
          className="ml-4 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Lịch sử đơn hàng</h2>

        {loading ? (
          <div className="space-y-4">
            {Array(3)
              .fill()
              .map((_, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500">Bạn chưa có đơn hàng nào.</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Mã đơn hàng: {order.id}</h3>
                    <p className="text-sm text-gray-500">Ngày đặt: {order.orderDate}</p>
                    <p className="text-sm text-gray-500">Tổng tiền: {order.totalAmount}</p>
                    <p className="text-sm text-gray-500">Trạng thái: {order.status}</p>
                  </div>
                  <div>
                    {order.status === "PENDING" && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Sản phẩm:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center mb-4">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded mr-4"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">Giá: {item.price}</p>
                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <a
                    href={`/order/${order.id}`}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Xem chi tiết
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;