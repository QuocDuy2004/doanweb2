import { Search } from "lucide-react";

const CategoryCard = ({ name }) => (
  <a href="#" className="group">
    <div className="bg-gray-100 rounded-lg p-4 transition-all duration-300 group-hover:shadow-md group-hover:bg-gray-50 text-center">
      <div className="w-12 h-12 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-3">
        <Search className="h-6 w-6 text-indigo-600" />
      </div>
      <span className="font-medium text-gray-900">{name}</span>
    </div>
  </a>
);

export default CategoryCard;