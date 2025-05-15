import { ChevronRight } from "lucide-react";

const Protomo = () => {
  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl overflow-hidden shadow-lg">
          <div className="md:flex">
            <div className="p-8 md:w-1/2 flex items-center">
              <div className="text-white space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">Giảm giá tới 50% cho hội viên mới</h2>
                <p className="text-lg opacity-90">Đăng ký thành viên ngay hôm nay để nhận ưu đãi đặc biệt và miễn phí giao hàng.</p>
                <div className="pt-4">
                  <a href="#" className="bg-white text-indigo-600 hover:bg-gray-100 font-medium px-6 py-3 rounded-lg inline-flex items-center">
                    Đăng ký ngay
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <img src="https://via.placeholder.com/600x400" alt="Khuyến mãi đặc biệt" className="w-full h-64 md:h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Protomo;