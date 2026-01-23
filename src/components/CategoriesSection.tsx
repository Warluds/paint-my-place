import { Paintbrush, Home, Building2, Wrench, Droplets, SprayCan } from "lucide-react";

const categories = [
  {
    icon: Home,
    title: "Интерьерные краски",
    description: "Для стен, потолков и мебели",
    color: "from-blue-500 to-blue-600",
    count: "250+ товаров"
  },
  {
    icon: Building2,
    title: "Фасадные краски",
    description: "Устойчивы к погодным условиям",
    color: "from-orange-500 to-orange-600",
    count: "120+ товаров"
  },
  {
    icon: Droplets,
    title: "Лаки и пропитки",
    description: "Защита и декор древесины",
    color: "from-amber-500 to-amber-600",
    count: "80+ товаров"
  },
  {
    icon: SprayCan,
    title: "Аэрозольные краски",
    description: "Для декора и DIY проектов",
    color: "from-purple-500 to-purple-600",
    count: "60+ товаров"
  },
  {
    icon: Paintbrush,
    title: "Кисти и валики",
    description: "Профессиональный инструмент",
    color: "from-green-500 to-green-600",
    count: "150+ товаров"
  },
  {
    icon: Wrench,
    title: "Расходные материалы",
    description: "Малярная лента, плёнка, ёмкости",
    color: "from-slate-500 to-slate-600",
    count: "200+ товаров"
  },
];

export const CategoriesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Каталог товаров
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Всё необходимое для профессиональной покраски и ремонта
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <a
              key={index}
              href="#"
              className="group category-card"
            >
              <div className={`category-icon bg-gradient-to-br ${category.color}`}>
                <category.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
                <span className="inline-block mt-3 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {category.count}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
