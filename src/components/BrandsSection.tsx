const brands = [
  { name: "Tikkurila", logo: "TK" },
  { name: "Dulux", logo: "DX" },
  { name: "Caparol", logo: "CP" },
  { name: "Alpina", logo: "AL" },
  { name: "Marshall", logo: "MR" },
  { name: "Belinka", logo: "BL" },
];

export const BrandsSection = () => {
  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Официальный дилер ведущих брендов
          </h2>
          <p className="text-muted-foreground">
            Только оригинальная продукция с гарантией производителя
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="brand-card"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-primary">{brand.logo}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
