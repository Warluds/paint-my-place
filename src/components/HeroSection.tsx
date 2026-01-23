import { ArrowRight, Palette, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import promoBanner from "@/assets/banners/promo-banner.jpg";
import livingRoom from "@/assets/interiors/living-room.jpg";
import childrenRoom from "@/assets/interiors/children-room.jpg";
import kitchen from "@/assets/interiors/kitchen.jpg";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <img 
          src={promoBanner} 
          alt="Акция - скидки до 20%" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      <div className="container py-16 md:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-warm/20 backdrop-blur-sm rounded-full text-accent-warm text-sm font-medium border border-accent-warm/30">
              <Palette className="w-4 h-4" />
              Скидки до 20% на все краски
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Краски для <span className="text-accent-warm">идеального</span> интерьера
            </h1>
            
            <p className="text-lg text-white/80 max-w-lg">
              Широкий выбор интерьерных и фасадных красок от ведущих производителей. 
              Бесплатная колеровка по вашему цвету за 15 минут.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="h-14 px-8 text-base bg-accent-warm hover:bg-accent-warm/90 text-white">
                Каталог красок
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10">
                AI-визуализатор
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { icon: Palette, text: "Колеровка за 15 мин" },
                { icon: Truck, text: "Доставка по городу" },
                { icon: Shield, text: "Гарантия качества" },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <feature.icon className="w-6 h-6 text-accent-warm" />
                  <span className="text-sm font-medium text-white">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interior Images */}
          <div className="hidden lg:block relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img 
                    src={livingRoom} 
                    alt="Гостиная" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img 
                    src={kitchen} 
                    alt="Кухня" 
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
              <div className="pt-8">
                <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img 
                    src={childrenRoom} 
                    alt="Детская" 
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Color count badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-card px-6 py-3 rounded-full shadow-xl border border-border">
              <p className="text-2xl font-bold text-primary">10 000+ <span className="text-sm font-normal text-muted-foreground">оттенков</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
