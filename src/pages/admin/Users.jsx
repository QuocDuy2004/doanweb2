import { useState } from 'react';

const Users = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      email: 'trungkjj321@gmail.com',
      fullName: 'vothanhtrung',
      mobile: '0379263053',
      role: 'ROLE_CUSTOMER',
      addresses: [],
    },
    {
      id: 2,
      email: 'xoankhong00@gmail.com',
      fullName: null,
      mobile: '0379263053',
      role: 'ROLE_CUSTOMER',
      addresses: [],
    },
    {
      id: 4,
      email: null,
      fullName: null,
      mobile: null,
      role: null,
      addresses: [],
    },
    {
      id: 6,
      email: 'quocdu1y@example.com',
      fullName: null,
      mobile: null,
      role: null,
      addresses: [],
    },
    {
      id: 7,
      email: 'quocdu21y@example.com',
      fullName: null,
      mobile: null,
      role: null,
      addresses: [],
    },
    {
      id: 8,
      email: 'quocdu121y@example.com',
      fullName: null,
      mobile: null,
      role: null,
      addresses: [],
    },
    {
      id: 52,
      email: 'c@gmail.com',
      fullName: null,
      mobile: '0379263053',
      role: 'ROLE_CUSTOMER',
      addresses: [],
    },
    {
      id: 102,
      email: 'x@gmail.com',
      fullName: null,
      mobile: '0379263053',
      role: 'ROLE_CUSTOMER',
      addresses: [],
    },
    {
      id: 202,
      email: 'quocduy11022004@gmail.com',
      fullName: null,
      mobile: '0379263053',
      role: 'ROLE_CUSTOMER',
      addresses: [],
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    mobile: '',
    role: 'ROLE_CUSTOMER',
  });

  const openAddModal = () => {
    setFormData({
      email: '',
      fullName: '',
      mobile: '',
      role: 'ROLE_CUSTOMER',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      fullName: user.fullName || '',
      mobile: user.mobile || '',
      role: user.role || 'ROLE_CUSTOMER',
    });
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      fullName: '',
      mobile: '',
      role: 'ROLE_CUSTOMER',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = () => {
    const newUser = {
      id: Math.max(...users.map((u) => u.id)) + 1,
      email: formData.email || null,
      fullName: formData.fullName || null,
      mobile: formData.mobile || null,
      role: formData.role || null,
      addresses: [],
    };
    setUsers([...users, newUser]);
    closeModal();
  };

  const handleUpdate = () => {
    setUsers(
      users.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              email: formData.email || null,
              fullName: formData.fullName || null,
              mobile: formData.mobile || null,
              role: formData.role || null,
            }
          : user
      )
    );
    closeModal();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Người dùng</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thêm mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.fullName || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.mobile || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'ROLE_CUSTOMER' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Sửa
                  </button>
                  <button className="text-red-600 hover:text-red-900">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex md:flex-row flex-col">
              {/* Left/Top: Form Inputs */}
              <div className="md:w-1/2 p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Thêm người dùng mới</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="ROLE_CUSTOMER">Khách hàng</option>
                      <option value="ROLE_ADMIN">Quản trị viên</option>
                      <option value="">Không xác định</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={closeModal}
                    className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </div>
              {/* Right/Bottom: Summary Preview */}
              <div className="md:w-1/2 p-4 bg-gray-50">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Xem trước</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {formData.email || 'Chưa nhập'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Họ tên:</span> {formData.fullName || 'Chưa nhập'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Số điện thoại:</span> {formData.mobile || 'Chưa nhập'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Vai trò:</span> {formData.role || 'Chưa nhập'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex md:flex-row flex-col">
              {/* Left/Top: Form Inputs */}
              <div className="md:w-1/2 p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Chỉnh sửa người dùng</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="ROLE_CUSTOMER">Khách hàng</option>
                      <option value="ROLE_ADMIN">Quản trị viên</option>
                      <option value="">Không xác định</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={closeModal}
                    className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Lưu
                  </button>
                </div>
              </div>
              {/* Right/Bottom: Summary Preview */}
              <div className="md:w-1/2 p-4 bg-gray-50">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Xem trước</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {formData.email || 'Chưa nhập'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Họ tên:</span> {formData.fullName || 'Chưa nhập'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Số điện thoại:</span> {formData.mobile || 'Chưa nhập'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Vai trò:</span> {formData.role || 'Chưa nhập'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;