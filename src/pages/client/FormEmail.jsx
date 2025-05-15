const FormEmail = () => {
    return (
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Đăng ký nhận tin</h2>
          <p className="text-gray-600 mb-6">Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-300">
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default FormEmail;