import { useState, useEffect, Component } from 'react';
import Select from 'react-select';
import { generalService } from '../../api';
import toastService from '../../service/toastService';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-500">
          <h2>Có lỗi xảy ra: {this.state.error?.message || 'Không xác định'}</h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mrpPrice: '',
    sellingPrice: '',
    discountPercent: '',
    quantity: '',
    colors: [],
    category: '',
    sizes: [],
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [base64Images, setBase64Images] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(6);

  // Color and size options
  const colorOptions = [
    { value: 'Trắng', label: 'Trắng' },
    { value: 'Đen', label: 'Đen' },
    { value: 'Xanh', label: 'Xanh' },
    { value: 'Đỏ', label: 'Đỏ' },
    { value: 'Vàng', label: 'Vàng' },
  ];
  const sizeOptions = [
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' },
  ];

  // Fetch products and all categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsResponse = await generalService.get('/sellers/products');
        console.log('Products:', productsResponse);
        // Normalize sizes and colors to arrays
        const normalizedProducts = Array.isArray(productsResponse)
          ? productsResponse.map(product => ({
              ...product,
              sizes: Array.isArray(product.sizes)
                ? product.sizes
                : typeof product.sizes === 'string'
                ? product.sizes.split(',').map(s => s.trim())
                : [],
              colors: Array.isArray(product.color)
                ? product.color
                : typeof product.color === 'string'
                ? product.color.split(',').map(c => c.trim())
                : [],
            }))
          : [];
        setProducts(normalizedProducts);

        // Fetch all categories across pages
        let allCategories = [];
        let page = 0;
        let totalPages = 1;

        while (page < totalPages) {
          const categoriesResponse = await generalService.get(`/categories?page=${page}&size=10`);
          console.log(`Categories page ${page}:`, categoriesResponse);
          if (categoriesResponse && Array.isArray(categoriesResponse.content)) {
            allCategories = [...allCategories, ...categoriesResponse.content];
            totalPages = categoriesResponse.totalPages || 1;
            page++;
          } else {
            console.warn('Invalid categories response:', categoriesResponse);
            break;
          }
        }
        console.log('All categories:', allCategories);
        setCategories(allCategories);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        toastService.error('Không thể tải dữ liệu: ' + (err.message || 'Lỗi server'));
        setProducts([]);
        setCategories([]);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const openEditModal = (product) => {
    console.log('Opening edit modal for product:', product);
    setSelectedProduct(product);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      mrpPrice: product.mrpPrice || '',
      sellingPrice: product.sellingPrice || '',
      discountPercent: product.discountPercent || '',
      quantity: product.quantity || '',
      colors: Array.isArray(product.color) ? product.color : typeof product.color === 'string' ? product.color.split(',').map(c => c.trim()) : [],
      category: product.category?.categoryId || '',
      sizes: Array.isArray(product.sizes) ? product.sizes : typeof product.sizes === 'string' ? product.sizes.split(',').map(s => s.trim()) : [],
    });
    setPreviewImages(product.images || []);
    setBase64Images(product.images || []);
    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    console.log('Opening add modal');
    setFormData({
      title: '',
      description: '',
      mrpPrice: '',
      sellingPrice: '',
      discountPercent: '',
      quantity: '',
      colors: [],
      category: '',
      sizes: [],
    });
    setPreviewImages([]);
    setBase64Images([]);
    setIsAddModalOpen(true);
    console.log('isAddModalOpen set to:', true);
  };

  const openImageModal = (images) => {
    console.log('Opening image modal with images:', images);
    setSelectedImages(Array.isArray(images) ? images : []);
    setIsImageModalOpen(true);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setIsImageModalOpen(false);
    setSelectedProduct(null);
    setSelectedImages([]);
    setPreviewImages([]);
    setBase64Images([]);
    setFormData({
      title: '',
      description: '',
      mrpPrice: '',
      sellingPrice: '',
      discountPercent: '',
      quantity: '',
      colors: [],
      category: '',
      sizes: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change: ${name}=${value}`);
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelectChange = (name, selectedOptions) => {
    console.log(`Multi-select change: ${name}=`, selectedOptions);
    setFormData({
      ...formData,
      [name]: selectedOptions ? selectedOptions.map(option => option.value) : [],
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    console.log('Selected files:', files);
    const newPreviews = [];
    const newBase64Images = [];

    if (files.length === 0) {
      setPreviewImages([]);
      setBase64Images([]);
      return;
    }

    if (files.length > 5) {
      toastService.error('Tối đa 5 hình ảnh được phép tải lên');
      return;
    }

    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toastService.error('Hình ảnh quá lớn (tối đa 2MB): ' + file.name);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result);
        newBase64Images.push(reader.result);
        if (newPreviews.length === files.length) {
          console.log('Image previews:', newPreviews);
          setPreviewImages(newPreviews);
          setBase64Images(newBase64Images);
        }
      };
      reader.onerror = () => {
        toastService.error('Không thể đọc file hình ảnh: ' + file.name);
      };
      reader.readAsDataURL(file);
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toastService.error('Tên sản phẩm không được để trống');
      return false;
    }
    if (!formData.category) {
      toastService.error('Danh mục không được để trống');
      return false;
    }
    if (!formData.mrpPrice || Number(formData.mrpPrice) <= 0) {
      toastService.error('Giá gốc phải lớn hơn 0');
      return false;
    }
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
      toastService.error('Giá bán phải lớn hơn 0');
      return false;
    }
    if (formData.quantity === '' || Number(formData.quantity) < 0) {
      toastService.error('Số lượng không được nhỏ hơn 0');
      return false;
    }
    if (formData.discountPercent && Number(formData.discountPercent) < 0) {
      toastService.error('Giảm giá không được nhỏ hơn 0');
      return false;
    }
    if (formData.colors.length === 0) {
      toastService.error('Vui lòng chọn ít nhất một màu sắc');
      return false;
    }
    if (formData.sizes.length === 0) {
      toastService.error('Vui lòng chọn ít nhất một kích thước');
      return false;
    }
    if (base64Images.length === 0) {
      toastService.error('Vui lòng chọn ít nhất một hình ảnh');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        mrpPrice: Number(formData.mrpPrice),
        sellingPrice: Number(formData.sellingPrice),
        discountPercent: Number(formData.discountPercent) || 0,
        quantity: Number(formData.quantity),
        colors: formData.colors,
        category: formData.category,
        sizes: formData.sizes,
        images: base64Images,
      };
      console.log('Add product payload:', JSON.stringify(payload, null, 2));
      const newProduct = await generalService.post('/sellers/products', payload);
      setProducts([...products, newProduct]);
      toastService.success('Thêm sản phẩm thành công');
      closeModal();
      setCurrentPage(1); // Reset to first page after adding
    } catch (err) {
      console.error('Add product error:', err);
      toastService.error('Không thể thêm sản phẩm: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        mrpPrice: Number(formData.mrpPrice),
        sellingPrice: Number(formData.sellingPrice),
        discountPercent: Number(formData.discountPercent) || 0,
        quantity: Number(formData.quantity),
        colors: formData.colors,
        category: formData.category,
        sizes: formData.sizes,
        images: base64Images,
      };
      console.log('Update product payload:', JSON.stringify(payload, null, 2));
      const updatedProduct = await generalService.put(`/sellers/products/${selectedProduct.id}`, payload);
      setProducts(products.map(p => (p.id === selectedProduct.id ? updatedProduct : p)));
      toastService.success('Cập nhật sản phẩm thành công');
      closeModal();
    } catch (err) {
      console.error('Update product error:', err);
      toastService.error('Không thể cập nhật sản phẩm: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      console.log('Deleting product ID:', productId);
      await generalService.delete(`/sellers/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      toastService.success('Xóa sản phẩm thành công');
      // Adjust current page if necessary
      if (currentProducts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error('Delete product error:', err);
      toastService.error('Không thể xóa sản phẩm: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-gray-600 animate-pulse">Đang tải...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            Thêm sản phẩm
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá gốc</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm giá</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Màu sắc</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích thước</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div
                      className="relative cursor-pointer"
                      onClick={() => openImageModal(product.images)}
                    >
                      <img
                        src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/48'}
                        alt={product.title}
                        className="h-10 w-10 object-cover rounded"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/48')}
                      />
                      <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {(product.images || []).length}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.description || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.mrpPrice?.toLocaleString() || 0} VNĐ</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.sellingPrice?.toLocaleString() || 0} VNĐ</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.discountPercent || 0}%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.quantity || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {Array.isArray(product.color) ? product.color.join(', ') : typeof product.color === 'string' ? product.color : 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {Array.isArray(product.sizes) ? product.sizes.join(', ') : typeof product.sizes === 'string' ? product.sizes : 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.category?.name || product.category?.categoryId || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {products.length > productsPerPage && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Hiển thị {indexOfFirstProduct + 1} - {Math.min(indexOfLastProduct, products.length)} của {products.length} sản phẩm
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Sau
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">
                  {isEditModalOpen ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Nhập tên sản phẩm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Nhập mô tả sản phẩm"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Giá gốc (VNĐ)</label>
                    <input
                      type="number"
                      name="mrpPrice"
                      value={formData.mrpPrice}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Nhập giá gốc"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Giá bán (VNĐ)</label>
                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Nhập giá bán"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Giảm giá (%)</label>
                    <input
                      type="number"
                      name="discountPercent"
                      value={formData.discountPercent}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Nhập % giảm giá (tùy chọn)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Nhập số lượng"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                    <Select
                      isMulti
                      name="colors"
                      options={colorOptions}
                      value={colorOptions.filter(option => formData.colors.includes(option.value))}
                      onChange={(selected) => handleMultiSelectChange('colors', selected)}
                      className="mt-1"
                      placeholder="Chọn màu sắc"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kích thước</label>
                    <Select
                      isMulti
                      name="sizes"
                      options={sizeOptions}
                      value={sizeOptions.filter(option => formData.sizes.includes(option.value))}
                      onChange={(selected) => handleMultiSelectChange('sizes', selected)}
                      className="mt-1"
                      placeholder="Chọn kích thước"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category.id} value={category.categoryId}>
                            {category.name || category.categoryId}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Không có danh mục nào
                        </option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previewImages.length > 0 ? (
                      previewImages.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Preview-${index}`}
                          className="h-16 w-16 object-cover rounded"
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/64')}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Chưa có hình ảnh được chọn</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={isEditModalOpen ? handleUpdate : handleAdd}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isEditModalOpen ? 'Lưu' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Products;