import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Circle } from "lucide-react";

const HeroBanner = () => {
  const slides = [
    {
      title: "Khám phá xu hướng mới nhất",
      description:
        "Mua sắm thông minh với giá tốt nhất và giao hàng nhanh chóng trong ngày.",
      image: "/api/placeholder/600/400",
      buttonText: "Mua sắm ngay",
      buttonLink: "/products",
    },
    {
      title: "Ưu đãi mùa lễ hội",
      description:
        "Giảm giá lên đến 50% cho tất cả sản phẩm thời trang và điện tử!",
      image: "/api/placeholder/601/400",
      buttonText: "Khám phá ngay",
      buttonLink: "/products",
    },
    {
      title: "Sản phẩm mới ra mắt",
      description:
        "Khám phá bộ sưu tập mới nhất với thiết kế hiện đại và chất lượng vượt trội.",
      image: "/api/placeholder/602/400",
      buttonText: "Xem bộ sưu tập",
      buttonLink: "/products",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatic slide transition
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 py-12 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center transition-opacity duration-500 ${
                index === currentSlide
                  ? "opacity-100"
                  : "opacity-0 absolute top-0 left-0"
              }`}
              style={{ display: index === currentSlide ? "flex" : "none" }}
            >
              <div className="md:w-1/2 text-white space-y-4 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl">{slide.description}</p>
                <div className="pt-4">
                  <a
                    href={slide.buttonLink}
                    className="bg-white text-indigo-600 hover:bg-gray-100 font-medium px-6 py-3 rounded-lg inline-flex items-center"
                  >
                    {slide.buttonText}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </a>
                </div>
              </div>
              <div className="md:w-1/2">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`p-1 ${
              index === currentSlide ? "text-white" : "text-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <Circle
              className={`h-3 w-3 ${
                index === currentSlide ? "fill-current" : "fill-none"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
