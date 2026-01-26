import { useState, useMemo } from "react";
import { Search, Palette, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTints, usePalettes, Tint } from "@/hooks/useTints";

interface TintPalettePickerProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  onChange: (color: string, tintName?: string) => void;
}

export const TintPalettePicker = ({ label, icon, color, onChange }: TintPalettePickerProps) => {
  const [selectedPalette, setSelectedPalette] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data: palettes = [] } = usePalettes();
  const { data: tints = [], isLoading } = useTints(selectedPalette === "all" ? undefined : selectedPalette);

  const filteredTints = useMemo(() => {
    if (!search) return tints.slice(0, 100); // Limit initial display
    const searchLower = search.toLowerCase();
    return tints.filter(t => 
      t.name.toLowerCase().includes(searchLower) || 
      t.hex_color.toLowerCase().includes(searchLower)
    ).slice(0, 100);
  }, [tints, search]);

  const selectedTint = tints.find(t => t.hex_color.toLowerCase() === color.toLowerCase());

  const handleSelectColor = (tint: Tint) => {
    onChange(tint.hex_color, tint.name);
    setOpen(false);
  };

  return (
    <div className="color-picker-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="color-picker-icon">
          {icon}
        </div>
        <span className="text-lg font-medium text-foreground">{label}</span>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between h-14 px-4"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg border-2 border-border shadow-sm"
                style={{ backgroundColor: color }}
              />
              <div className="text-left">
                <div className="font-mono text-sm">{color}</div>
                {selectedTint && (
                  <div className="text-xs text-muted-foreground">{selectedTint.name}</div>
                )}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b border-border space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedPalette} onValueChange={setSelectedPalette}>
                <SelectTrigger className="flex-1 h-9">
                  <SelectValue placeholder="Все палитры" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все палитры</SelectItem>
                  {palettes.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по коду или названию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <ScrollArea className="h-64">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Загрузка цветов...
              </div>
            ) : filteredTints.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {tints.length === 0 ? "Нет загруженных цветов" : "Ничего не найдено"}
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-1 p-2">
                {filteredTints.map((tint) => (
                  <button
                    key={tint.id}
                    onClick={() => handleSelectColor(tint)}
                    className={`
                      aspect-square rounded-md border-2 transition-all hover:scale-110 hover:z-10
                      ${color.toLowerCase() === tint.hex_color.toLowerCase() 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                    style={{ backgroundColor: tint.hex_color }}
                    title={`${tint.name}\n${tint.hex_color}`}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {tints.length > 100 && !search && (
            <div className="p-2 border-t border-border text-center text-xs text-muted-foreground">
              Показано 100 из {tints.length} цветов. Используйте поиск.
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};
