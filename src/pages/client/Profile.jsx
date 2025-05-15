import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Save, Loader2, MapPin, Edit2, Trash2 } from "lucide-react";
import generalService from "../../api/services/generalService";

const Profile = () => {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    mobile: "",
    addresses: [],
  });
  const [newAddress, setNewAddress] = useState({
    name: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    mobile: "",
  });
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Vui lòng đăng nhập để xem thông tin cá nhân.");
        }
        const response = await generalService.get("/users/profile");
        setUser({
          fullName: response.fullName || "",
          email: response.email || "",
          mobile: response.mobile || "",
          addresses: response.addresses || [],
        });
      } catch (err) {
        let errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra lại.";
        if (err.response?.status === 401) {
          errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
          localStorage.removeItem("authToken");
          navigate("/login");
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message.includes("Không tìm thấy người dùng")) {
          errorMessage = "Không tìm thấy thông tin người dùng.";
        } else if (err.code === "ECONNABORTED") {
          errorMessage = "Yêu cầu hết thời gian. Vui lòng kiểm tra kết nối mạng.";
        }
        setError(errorMessage);
        toast.error(errorMessage, { autoClose: 4000, style: { border: "1px solid #f8d7da" } });
        console.error("Error fetching user:", err.message, err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({ ...newAddress, [name]: value });
  };

  const handleAddAddress = () => {
    if (
      !newAddress.name ||
      !newAddress.address ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pinCode ||
      !newAddress.mobile
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ.", {
        autoClose: 4000,
        style: { border: "1px solid #f8d7da" },
      });
      return;
    }
    setUser({
      ...user,
      addresses: [...user.addresses, { ...newAddress }],
    });
    setNewAddress({
      name: "",
      locality: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      mobile: "",
    });
  };

  const handleEditAddress = (index) => {
    setEditingAddressIndex(index);
    setNewAddress({ ...user.addresses[index] });
    setIsEditing(true);
  };

  const handleUpdateAddress = () => {
    if (
      !newAddress.name ||
      !newAddress.address ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pinCode ||
      !newAddress.mobile
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ.", {
        autoClose: 4000,
        style: { border: "1px solid #f8d7da" },
      });
      return;
    }
    const updatedAddresses = [...user.addresses];
    updatedAddresses[editingAddressIndex] = { ...newAddress };
    setUser({ ...user, addresses: updatedAddresses });
    setNewAddress({
      name: "",
      locality: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      mobile: "",
    });
    setEditingAddressIndex(null);
  };

  const handleDeleteAddress = (index) => {
    const updatedAddresses = user.addresses.filter((_, i) => i !== index);
    setUser({ ...user, addresses: updatedAddresses });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user.fullName || !user.email || !user.mobile) {
      toast.error("Vui lòng điền đầy đủ họ tên, email và số điện thoại.", {
        autoClose: 4000,
        style: { border: "1px solid #f8d7da" },
      });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để cập nhật thông tin.");
      }

      const payload = {
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        addresses: user.addresses,
      };

      await generalService.put("/users/profile", payload);
      toast.success("Cập nhật thông tin thành công!", {
        autoClose: 3000,
        style: { border: "1px solid #d4edda" },
      });
      setIsEditing(false);
      setEditingAddressIndex(null);

      // Refresh user data
      const response = await generalService.get("/users/profile");
      setUser({
        fullName: response.fullName || "",
        email: response.email || "",
        mobile: response.mobile || "",
        addresses: response.addresses || [],
      });
    } catch (err) {
      let errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra lại.";
      if (err.response?.status === 401) {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        localStorage.removeItem("authToken");
        navigate("/login");
      } else if (err.response?.status === 400) {
        errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Yêu cầu hết thời gian. Vui lòng kiểm tra kết nối mạng.";
      }
      toast.error(errorMessage, { autoClose: 4000, style: { border: "1px solid #f8d7da" } });
      console.error("Error saving user:", err.message, err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600" />
          <p className="mt-4 text-gray-600 text-lg">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Hồ sơ cá nhân
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Information Section (Left) */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <User className="h-6 w-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Thông tin người dùng
                </h3>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleSave}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={user.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        !isEditing ? "bg-gray-100 border-gray-200" : "border-gray-300"
                      }`}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={user.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        !isEditing ? "bg-gray-100 border-gray-200" : "border-gray-300"
                      }`}
                      placeholder="Nhập email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={user.mobile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        !isEditing ? "bg-gray-100 border-gray-200" : "border-gray-300"
                      }`}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  {isEditing && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {editingAddressIndex !== null ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên địa chỉ
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={newAddress.name}
                            onChange={handleNewAddressChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nhập tên địa chỉ (ví dụ: Nhà riêng)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={newAddress.address}
                            onChange={handleNewAddressChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nhập địa chỉ"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thành phố
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={newAddress.city}
                            onChange={handleNewAddressChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nhập thành phố"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Khu vực
                          </label>
                          <input
                            type="text"
                            name="locality"
                            value={newAddress.locality}
                            onChange={handleNewAddressChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nhập khu vực (tùy chọn)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tỉnh/Thành
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={newAddress.state}
                            onChange={handleNewAddressChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nhập tỉnh/thành"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mã bưu điện
                          </label>
                          <input
                            type="text"
                            name="pinCode"
                            value={newAddress.pinCode}
                            onChange={handleNewAddressChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nhập mã bưu điện"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            name="mobile"
                            value={newAddress.mobile}
                            onChange={handleNewAddressChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={editingAddressIndex !== null ? handleUpdateAddress : handleAddAddress}
                          className="w-full px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          {editingAddressIndex !== null ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditingAddressIndex(null);
                          setNewAddress({
                            name: "",
                            locality: "",
                            address: "",
                            city: "",
                            state: "",
                            pinCode: "",
                            mobile: "",
                          });
                        }}
                        className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center transition-colors"
                      >
                        {saving ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <Save className="h-5 w-5 mr-2" />
                        )}
                        Lưu thay đổi
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center transition-colors"
                    >
                      <Edit2 className="h-5 w-5 mr-2" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Address Display Section (Right) */}
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Danh sách địa chỉ
                </h3>
              </div>
            </div>
            <div className="p-6">
              {user.addresses.length === 0 ? (
                <p className="text-gray-500 italic text-center">
                  Chưa có địa chỉ nào được thêm.
                </p>
              ) : (
                <div className="space-y-4">
                  {user.addresses.map((addr, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-indigo-600 mr-3 mt-1" />
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">
                              {addr.name || `Địa chỉ ${index + 1}`}
                            </p>
                            <div className="mt-2 space-y-1 text-gray-600 text-sm">
                              <p>
                                <span className="font-medium">Địa chỉ:</span>{" "}
                                {addr.address || "Chưa cung cấp"}
                              </p>
                              <p>
                                <span className="font-medium">Thành phố:</span>{" "}
                                {addr.city || "Chưa cung cấp"}
                              </p>
                              <p>
                                <span className="font-medium">Khu vực:</span>{" "}
                                {addr.locality || "Chưa cung cấp"}
                              </p>
                              <p>
                                <span className="font-medium">Tỉnh/Thành:</span>{" "}
                                {addr.state || "Chưa cung cấp"}
                              </p>
                              <p>
                                <span className="font-medium">Mã bưu điện:</span>{" "}
                                {addr.pinCode || "Chưa cung cấp"}
                              </p>
                              <p>
                                <span className="font-medium">Số điện thoại:</span>{" "}
                                {addr.mobile || "Chưa cung cấp"}
                              </p>
                            </div>
                          </div>
                        </div>
                        {isEditing && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditAddress(index)}
                              className="p-2 text-indigo-600 hover:text-indigo-800"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(index)}
                              className="p-2 text-red-600 hover:text-red-800"
                              title="Xóa"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;