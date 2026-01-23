import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import dulux3DWhite from "@/assets/products/dulux-3d-white.jpeg";
import marshallExport from "@/assets/products/marshall-export.jpeg";

const products = [
  {
    id: 1,
    name: "Краска Dulux 3D White матовая BW 9л",
    image: dulux3DWhite,
    oldPrice: "43 460 тг",
    newPrice: "34 768 тг",
    discount: "-20%",
    rating: 4.9,
    reviews: 124,
  },
  {
    id: 2,
    name: "Краска Marshall EXPORT Кухни и Ванные 9л",
    image: marshallExport,
    oldPrice: "39 970 тг",
    newPrice: "33 975 тг",
    discount: "-15%",
    rating: 4.8,
    reviews: 89,
  },
  {
    id: 3,
    name: "Краска Dulux 3D White матовая BW 9л",
    image: dulux3DWhite,
    oldPrice: "43 460 тг",
    newPrice: "34 768 тг",
    discount: "-20%",
    rating: 4.9,
    reviews: 124,
  },
  {
    id: 4,
    name: "Краска Marshall EXPORT Кухни и Ванные 9л",
    image: marshallExport,
    oldPrice: "39 970 тг",
    newPrice: "33 975 тг",
    discount: "-15%",
    rating: 4.8,
    reviews: 89,
  },
];

export const ProductsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Товары со скидкой
            </h2>
            <p className="text-muted-foreground">
              Успейте купить по выгодным ценам
            </p>
          </div>
          <Button variant="outline" className="hidden sm:flex">
            Все акции
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="product-card group">
              {/* Discount Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-accent-warm text-white text-sm font-bold px-3 py-1 rounded-full">
                  {product.discount}
                </span>
              </div>

              {/* Image */}
              <div className="relative overflow-hidden rounded-xl mb-4 bg-secondary/50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-accent-warm text-accent-warm" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-xs text-muted-foreground">({product.reviews})</span>
              </div>

              {/* Title */}
              <h3 className="font-medium text-foreground mb-3 line-clamp-2 min-h-[48px]">
                {product.name}
              </h3>

              {/* Prices */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xl font-bold text-foreground">{product.newPrice}</span>
                <span className="text-sm text-muted-foreground line-through">{product.oldPrice}</span>
              </div>

              {/* Button */}
              <Button className="w-full" variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                В корзину
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
