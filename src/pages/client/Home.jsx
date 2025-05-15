import Slide from "./Slide";
import Category from "./Category";
import FlashSale from "./FlashSale";
import FProduct from "./FProduct";
import Protomo from "./Protomo";
import ProductNew from "./ProductNew";
import Review from "./Review";
import FormEmail from "./FormEmail";

const Home = () => {
  return (
    <div className="bg-gray-50">
      <Slide />
      <Category />
      <FlashSale />
      <FProduct />
      <Protomo />
      <ProductNew />
      <Review />
      <FormEmail />
    </div>
  );
};

export default Home;