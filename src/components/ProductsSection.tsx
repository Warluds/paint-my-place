import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

// Fallback images for demo when no products in DB
import dulux3DWhite from "@/assets/products/dulux-3d-white.jpeg";
import marshallExport from "@/assets/products/marshall-export.jpeg";

const demoProducts = [
  {
    id: "1",
    name: "Краска Dulux 3D White матовая BW 9л",
    main_image: dulux3DWhite,
    old_price: 43460,
    price: 34768,
    discount_percent: 20,
    quantity: 10,
  },
  {
    id: "2",
    name: "Краска Marshall EXPORT Кухни и Ванные 9л",
    main_image: marshallExport,
    old_price: 39970,
    price: 33975,
    discount_percent: 15,
    quantity: 5,
  },
  {
    id: "3",
    name: "Краска Dulux 3D White матовая BW 9л",
    main_image: dulux3DWhite,
    old_price: 43460,
    price: 34768,
    discount_percent: 20,
    quantity: 8,
  },
  {
    id: "4",
    name: "Краска Marshall EXPORT Кухни и Ванные 9л",
    main_image: marshallExport,
    old_price: 39970,
    price: 33975,
    discount_percent: 15,
    quantity: 3,
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-KZ", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(price) + " тг";
}

export const ProductsSection = () => {
  const { data: products, isLoading } = useProducts({ limit: 8, discountOnly: true });

  // Use demo products if no products in database
  const displayProducts = products && products.length > 0 ? products : demoProducts;

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

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="product-card">
                <Skeleton className="w-full h-48 rounded-xl mb-4" />
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => {
              const discountPercent = product.discount_percent || 
                (product.old_price 
                  ? Math.round((1 - product.price / product.old_price) * 100) 
                  : 0);

              return (
                <div key={product.id} className="product-card group">
                  {/* Discount Badge */}
                  {discountPercent > 0 && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-accent-warm text-white text-sm font-bold px-3 py-1 rounded-full">
                        -{discountPercent}%
                      </span>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative overflow-hidden rounded-xl mb-4 bg-secondary/50">
                    <img
                      src={product.main_image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-48 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Rating - placeholder for now */}
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-accent-warm text-accent-warm" />
                    <span className="text-sm font-medium">4.9</span>
                    <span className="text-xs text-muted-foreground">(124)</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-medium text-foreground mb-3 line-clamp-2 min-h-[48px]">
                    {product.name}
                  </h3>

                  {/* Prices */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(product.price)}
                    </span>
                    {product.old_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.old_price)}
                      </span>
                    )}
                  </div>

                  {/* Button */}
                  <Button className="w-full" variant="outline">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    В корзину
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
