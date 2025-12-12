import Header from "./components/Header";
import ProductsGrid from "./components/ProductsGrid";
import PromotionsSlider from "./components/PromotionsSlider";

export default function Home() {
  return (
    <div>
              <PromotionsSlider />
      <ProductsGrid />
    </div>
  );
}
