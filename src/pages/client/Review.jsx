import TestimonialCard from "./TestimonialCard";

const Review = () => {
  const testimonials = [
    { name: "Nguyễn Văn A", role: "Khách hàng", text: "Sản phẩm chất lượng cao và dịch vụ khách hàng tuyệt vời. Tôi đã mua nhiều lần và luôn hài lòng với trải nghiệm mua sắm." },
    { name: "Trần Thị B", role: "Khách hàng thân thiết", text: "Giao hàng nhanh chóng và đúng hẹn. Chất lượng sản phẩm vượt xa mong đợi của tôi. Chắc chắn sẽ quay lại mua hàng." },
    { name: "Lê Văn C", role: "Khách hàng mới", text: "Đây là lần đầu tiên tôi mua hàng và tôi rất ấn tượng với quy trình đặt hàng dễ dàng và chăm sóc khách hàng chuyên nghiệp." },
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Khách hàng nói gì về chúng tôi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Review;