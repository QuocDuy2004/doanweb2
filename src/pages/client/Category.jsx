import CategoryCard from "./CategoryCard";

const Category = () => {
  const categories = ["Điện thoại", "Laptop", "Thời trang", "Đồng hồ", "Mỹ phẩm", "Đồ gia dụng"];

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Danh mục nổi bật</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <CategoryCard key={index} name={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;