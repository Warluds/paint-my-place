import { TintImporter } from "@/components/admin/TintImporter";
import { useTints, usePalettes } from "@/hooks/useTints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminTints = () => {
  const { data: palettes = [] } = usePalettes();
  const { data: allTints = [] } = useTints();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Управление палитрами колеровки</h1>
          <p className="text-muted-foreground mt-2">
            Импортируйте JSON-файлы с цветами для использования в визуализаторе
          </p>
        </div>

        <TintImporter />

        <Card>
          <CardHeader>
            <CardTitle>Загруженные палитры</CardTitle>
          </CardHeader>
          <CardContent>
            {palettes.length === 0 ? (
              <p className="text-muted-foreground">Нет загруженных палитр</p>
            ) : (
              <div className="space-y-4">
                {palettes.map((palette) => {
                  const paletteColors = allTints.filter(t => t.palette === palette);
                  return (
                    <div key={palette} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{palette}</h3>
                        <span className="text-sm text-muted-foreground">
                          {paletteColors.length} цветов
                        </span>
                      </div>
                      <ScrollArea className="h-20">
                        <div className="flex flex-wrap gap-1">
                          {paletteColors.slice(0, 50).map((tint) => (
                            <div
                              key={tint.id}
                              className="w-6 h-6 rounded border border-border"
                              style={{ backgroundColor: tint.hex_color }}
                              title={`${tint.name}: ${tint.hex_color}`}
                            />
                          ))}
                          {paletteColors.length > 50 && (
                            <div className="w-6 h-6 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                              +{paletteColors.length - 50}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTints;
