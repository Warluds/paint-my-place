import { Phone, Mail, MapPin, Clock, Instagram, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-foreground/20 to-accent/30 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold">ЦК</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Центр Красок</h3>
                <p className="text-sm text-background/60">С 2010 года</p>
              </div>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              Крупнейший магазин лакокрасочных материалов в Казахстане. 
              Профессиональная консультация и бесплатная колеровка.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Каталог</h4>
            <ul className="space-y-2 text-background/70">
              {["Интерьерные краски", "Фасадные краски", "Лаки и пропитки", "Инструменты", "Грунтовки", "Шпатлёвки"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-background transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold mb-4">Информация</h4>
            <ul className="space-y-2 text-background/70">
              {["О компании", "Доставка и оплата", "Возврат товара", "Акции", "Блог", "Контакты"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-background transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3 text-background/70">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 text-accent-warm" />
                <div>
                  <a href="tel:+77172123456" className="hover:text-background transition-colors block">+7 (7172) 12-34-56</a>
                  <a href="tel:+77001234567" className="hover:text-background transition-colors block">+7 (700) 123-45-67</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 text-accent-warm" />
                <a href="mailto:info@centr-krasok.kz" className="hover:text-background transition-colors">info@centr-krasok.kz</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-accent-warm" />
                <span>г. Астана, ул. Примерная, 123</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 mt-0.5 text-accent-warm" />
                <div>
                  <span className="block">Пн-Сб: 9:00 - 19:00</span>
                  <span className="block">Вс: 10:00 - 17:00</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/50">
          <p>© 2024 Центр Красок. Все права защищены.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-background transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-background transition-colors">Публичная оферта</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
