import { ArrowRight, Palette, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary" />
        <div className="absolute top-40 right-20 w-48 h-48 rounded-full bg-accent-warm" />
        <div className="absolute bottom-20 left-1/3 w-24 h-24 rounded-full bg-accent-cool" />
      </div>

      <div className="container py-16 md:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-warm/10 rounded-full text-accent-warm text-sm font-medium">
              <Palette className="w-4 h-4" />
              Более 10 000 оттенков в наличии
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Краски для <span className="text-gradient">идеального</span> интерьера
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Широкий выбор интерьерных и фасадных красок от ведущих производителей. 
              Бесплатная колеровка по вашему цвету.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="h-14 px-8 text-base">
                Каталог красок
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                Попробовать визуализатор
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { icon: Palette, text: "Колеровка за 15 мин" },
                { icon: Truck, text: "Доставка по городу" },
                { icon: Shield, text: "Гарантия качества" },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
                  <feature.icon className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image / Color Swatches */}
          <div className="relative">
            <div className="hero-image-container">
              {/* Main Color Circles */}
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Large circle */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse-slow" />
                
                {/* Color swatches arranged in circle */}
                {[
                  { color: "#E8D4C4", top: "5%", left: "40%", size: "80px" },
                  { color: "#7BA3A8", top: "15%", right: "10%", size: "60px" },
                  { color: "#C4A77D", top: "35%", right: "5%", size: "70px" },
                  { color: "#8B7355", bottom: "25%", right: "15%", size: "55px" },
                  { color: "#5D7A5D", bottom: "10%", right: "35%", size: "65px" },
                  { color: "#A67B5B", bottom: "15%", left: "15%", size: "50px" },
                  { color: "#9B8E7E", top: "45%", left: "5%", size: "75px" },
                  { color: "#6B7B8C", top: "20%", left: "10%", size: "45px" },
                ].map((swatch, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer border-4 border-white"
                    style={{
                      backgroundColor: swatch.color,
                      width: swatch.size,
                      height: swatch.size,
                      top: swatch.top,
                      left: swatch.left,
                      right: swatch.right,
                      bottom: swatch.bottom,
                    }}
                  />
                ))}

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8 bg-card/90 backdrop-blur-md rounded-2xl shadow-xl border border-border">
                    <p className="text-5xl font-bold text-primary">10 000+</p>
                    <p className="text-muted-foreground mt-2">оттенков</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
