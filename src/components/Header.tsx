import { useState } from "react";
import { Menu, X, Phone, MapPin, ShoppingCart, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+77172123456" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone className="w-4 h-4" />
              <span>+7 (7172) 12-34-56</span>
            </a>
            <span className="hidden md:flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>г. Астана, ул. Примерная, 123</span>
            </span>
          </div>
          <div className="hidden md:block">
            <span>Пн-Сб: 9:00 - 19:00 | Вс: 10:00 - 17:00</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-warm rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">ЦК</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground leading-tight">Центр Красок</h1>
              <p className="text-xs text-muted-foreground">Всё для ремонта и покраски</p>
            </div>
          </a>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Поиск товаров..."
                className="w-full h-12 pl-5 pr-12 rounded-full border border-border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <Button size="icon" className="absolute right-1 top-1 h-10 w-10 rounded-full">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-warm text-white text-xs rounded-full flex items-center justify-center">0</span>
            </Button>
            <Button className="hidden sm:flex">
              Заказать звонок
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`${isMenuOpen ? 'block' : 'hidden'} lg:block mt-4 lg:mt-0`}>
          <ul className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-0">
            {[
              { name: "Каталог", hasDropdown: true },
              { name: "Интерьерные краски" },
              { name: "Фасадные краски" },
              { name: "Инструменты" },
              { name: "Визуализатор", highlight: true },
              { name: "Акции" },
              { name: "Контакты" },
            ].map((item) => (
              <li key={item.name}>
                <a
                  href={item.name === "Визуализатор" ? "#visualizer" : "#"}
                  className={`flex items-center gap-1 px-4 py-2.5 rounded-lg transition-all ${
                    item.highlight 
                      ? "bg-accent-warm/10 text-accent-warm font-medium hover:bg-accent-warm/20" 
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  {item.name}
                  {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};
