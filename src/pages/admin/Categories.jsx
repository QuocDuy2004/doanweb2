import { useState, useEffect } from 'react';
import { generalService } from '../../api';
import toastService from '../../service/toastService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    level: 1,
  });

  // Fetch all categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await generalService.get('categories/all');
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách danh mục.');
        setLoading(false);
        toastService.error(err.message || 'Không thể tải danh sách danh mục.');
      }
    };

    fetchCategories();
  }, []);

  const openAddModal = () => {
    setFormData({
      categoryId: '',
      name: '',
      level: 1,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setFormData({
      categoryId: category.categoryId,
      name: category.name,
      level: category.level,
    });
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedCategory(null);
    setFormData({
      categoryId: '',
      name: '',
      level: 1,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'level' ? parseInt(value) || '' : value,
    });
  };

  const validateForm = () => {
    if (!formData.categoryId.trim()) {
      toastService.error('Mã danh mục không được để trống.');
      return false;
    }
    if (!formData.name.trim()) {
      toastService.error('Tên danh mục không được để trống.');
      return false;
    }
    if (!Number.isInteger(formData.level) || formData.level < 1) {
      toastService.error('Cấp độ phải là số nguyên dương.');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      const newCategory = {
        categoryId: formData.categoryId,
        name: formData.name,
        level: formData.level,
      };
      const createdCategory = await generalService.post('categories', newCategory);
      setCategories([...categories, createdCategory]);
      closeModal();
      toastService.success('Thêm danh mục thành công!');
    } catch (err) {
      toastService.error(err.response?.data?.message || 'Không thể thêm danh mục.');
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    try {
      const updatedCategory = {
        categoryId: formData.categoryId,
        name: formData.name,
        level: formData.level,
      };
      const result = await generalService.put(`categories/${selectedCategory.id}`, updatedCategory);
      setCategories(
        categories.map((category) =>
          category.id === selectedCategory.id ? result : category
        )
      );
      closeModal();
      toastService.success('Cập nhật danh mục thành công!');
    } catch (err) {
      toastService.error(err.response?.data?.message || 'Không thể cập nhật danh mục.');
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await generalService.delete(`categories/${categoryId}`);
        setCategories(categories.filter((category) => category.id !== categoryId));
        toastService.success('Xóa danh mục thành công!');
      } catch (err) {
        toastService.error(err.response?.data?.message || 'Không thể xóa danh mục.');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-gray-600 animate-pulse">
          Đang tải...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-red-500 text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý danh mục</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã danh mục</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên danh mục</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cấp độ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.categoryId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.level}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openEditModal(category)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thêm danh mục mới</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mã danh mục</label>
                <input
                  type="text"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Nhập mã danh mục"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Nhập tên danh mục"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cấp độ</label>
                <input
                  type="number"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Nhập cấp độ"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 text-sm rounded-lg hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Chỉnh sửa danh mục</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mã danh mục</label>
                <input
                  type="text"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Nhập mã danh mục"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên danh mục</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Nhập tên danh mục"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cấp độ</label>
                <input
                  type="number"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  min="1"
                  className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Nhập cấp độ"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 text-sm rounded-lg hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;