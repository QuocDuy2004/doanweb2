import { User, Star } from "lucide-react";

const TestimonialCard = ({ name, role, text }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center mb-4">
      <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
        <User className="h-6 w-6 text-indigo-600" />
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{name}</h4>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
    <p className="text-gray-600 italic">{text}</p>
    <div className="flex mt-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />
      ))}
    </div>
  </div>
);

export default TestimonialCard;