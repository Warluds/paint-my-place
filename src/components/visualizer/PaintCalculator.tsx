import { useState, useEffect } from "react";
import { Calculator, Ruler, Layers, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Surface types affect paint consumption
const SURFACE_TYPES = [
  { value: "smooth", label: "Гладкая (гипсокартон, штукатурка)", factor: 1.0 },
  { value: "textured", label: "Фактурная (обои под покраску)", factor: 1.15 },
  { value: "porous", label: "Пористая (бетон, кирпич)", factor: 1.25 },
  { value: "rough", label: "Грубая (необработанная)", factor: 1.4 },
];

// Default coverage values (m²/L) for different paint types
const PAINT_COVERAGE = {
  economy: { min: 8, max: 10, label: "Эконом" },
  standard: { min: 10, max: 12, label: "Стандарт" },
  premium: { min: 12, max: 14, label: "Премиум" },
};

interface PaintCalculatorProps {
  onCalculationChange?: (calculation: CalculationResult | null) => void;
}

export interface CalculationResult {
  floorArea: number;
  ceilingHeight: number;
  wallArea: number;
  ceilingArea: number;
  totalArea: number;
  surfaceType: string;
  surfaceFactor: number;
  paintLitersMin: number;
  paintLitersMax: number;
  coats: number;
}

export const PaintCalculator = ({ onCalculationChange }: PaintCalculatorProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [floorArea, setFloorArea] = useState<string>("");
  const [ceilingHeight, setCeilingHeight] = useState<string>("2.7");
  const [manualWallArea, setManualWallArea] = useState<string>("");
  const [surfaceType, setSurfaceType] = useState("smooth");
  const [paintCoats, setPaintCoats] = useState<string>("2");
  const [paintQuality, setPaintQuality] = useState<keyof typeof PAINT_COVERAGE>("standard");
  const [includeCeiling, setIncludeCeiling] = useState(true);

  // Calculate wall area using formula: S_walls ≈ S_floor × 2.5-3.0
  // More accurate: perimeter × height. Assuming square room: perimeter ≈ 4 × √S_floor
  const calculateWallArea = (floorSqm: number, heightM: number): number => {
    // Perimeter of a square room with given floor area
    const sideLength = Math.sqrt(floorSqm);
    const perimeter = 4 * sideLength;
    // Wall area = perimeter × height
    return perimeter * heightM;
  };

  const [calculation, setCalculation] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const floorNum = parseFloat(floorArea);
    const heightNum = parseFloat(ceilingHeight);
    const coatsNum = parseInt(paintCoats) || 2;
    const manualWall = parseFloat(manualWallArea);

    if (!floorNum || floorNum <= 0 || !heightNum || heightNum <= 0) {
      setCalculation(null);
      onCalculationChange?.(null);
      return;
    }

    const surfaceData = SURFACE_TYPES.find(s => s.value === surfaceType);
    const surfaceFactor = surfaceData?.factor || 1.0;

    // Use manual wall area if provided, otherwise calculate
    const wallArea = manualWall > 0 ? manualWall : calculateWallArea(floorNum, heightNum);
    const ceilingArea = includeCeiling ? floorNum : 0;
    const totalArea = wallArea + ceilingArea;

    // Apply surface factor and coats
    const adjustedArea = totalArea * surfaceFactor * coatsNum;

    // Calculate liters based on coverage
    const coverage = PAINT_COVERAGE[paintQuality];
    const litersMin = Math.ceil(adjustedArea / coverage.max);
    const litersMax = Math.ceil(adjustedArea / coverage.min);

    const result: CalculationResult = {
      floorArea: floorNum,
      ceilingHeight: heightNum,
      wallArea: Math.round(wallArea * 10) / 10,
      ceilingArea,
      totalArea: Math.round(totalArea * 10) / 10,
      surfaceType,
      surfaceFactor,
      paintLitersMin: litersMin,
      paintLitersMax: litersMax,
      coats: coatsNum,
    };

    setCalculation(result);
    onCalculationChange?.(result);
  }, [floorArea, ceilingHeight, manualWallArea, surfaceType, paintCoats, paintQuality, includeCeiling, onCalculationChange]);

  return (
    <div className="paint-calculator-panel">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Калькулятор расхода</h3>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-4">
          {/* Room dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="floorArea" className="text-sm flex items-center gap-1">
                Площадь комнаты
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Площадь пола в квадратных метрах</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <Input
                  id="floorArea"
                  type="number"
                  placeholder="16"
                  value={floorArea}
                  onChange={(e) => setFloorArea(e.target.value)}
                  className="pr-10"
                  min="1"
                  max="500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  м²
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ceilingHeight" className="text-sm">
                Высота потолков
              </Label>
              <div className="relative">
                <Input
                  id="ceilingHeight"
                  type="number"
                  placeholder="2.7"
                  value={ceilingHeight}
                  onChange={(e) => setCeilingHeight(e.target.value)}
                  className="pr-8"
                  min="2"
                  max="10"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  м
                </span>
              </div>
            </div>
          </div>

          {/* Manual wall area override */}
          <div className="space-y-1.5">
            <Label htmlFor="manualWallArea" className="text-sm flex items-center gap-1">
              Площадь стен (опционально)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Оставьте пустым для авторасчёта. Укажите, если знаете точную площадь или нужно вычесть окна/двери.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="relative">
              <Input
                id="manualWallArea"
                type="number"
                placeholder={calculation ? `≈ ${calculation.wallArea}` : "Авторасчёт"}
                value={manualWallArea}
                onChange={(e) => setManualWallArea(e.target.value)}
                className="pr-10"
                min="1"
                max="1000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                м²
              </span>
            </div>
          </div>

          {/* Surface type */}
          <div className="space-y-1.5">
            <Label className="text-sm">Тип поверхности</Label>
            <Select value={surfaceType} onValueChange={setSurfaceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SURFACE_TYPES.map((surface) => (
                  <SelectItem key={surface.value} value={surface.value}>
                    {surface.label}
                    {surface.factor > 1 && (
                      <span className="text-muted-foreground ml-1">
                        (+{Math.round((surface.factor - 1) * 100)}%)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Coats and quality */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Количество слоёв</Label>
              <Select value={paintCoats} onValueChange={setPaintCoats}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 слой</SelectItem>
                  <SelectItem value="2">2 слоя</SelectItem>
                  <SelectItem value="3">3 слоя</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Класс краски</Label>
              <Select value={paintQuality} onValueChange={(v) => setPaintQuality(v as keyof typeof PAINT_COVERAGE)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAINT_COVERAGE).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label} ({val.min}-{val.max} м²/л)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Include ceiling toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCeiling}
              onChange={(e) => setIncludeCeiling(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">Включить потолок в расчёт</span>
          </label>

          {/* Results */}
          {calculation && (
            <div className="calculation-results">
              <div className="text-sm text-muted-foreground mb-2">Результат расчёта:</div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <span>Стены:</span>
                  <span className="font-medium">{calculation.wallArea} м²</span>
                </div>
                {includeCeiling && (
                  <div className="flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    <span>Потолок:</span>
                    <span className="font-medium">{calculation.ceilingArea} м²</span>
                  </div>
                )}
              </div>

              <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-sm text-muted-foreground">Потребуется краски:</div>
                <div className="text-2xl font-bold text-primary">
                  {calculation.paintLitersMin === calculation.paintLitersMax
                    ? `${calculation.paintLitersMin} л`
                    : `${calculation.paintLitersMin}–${calculation.paintLitersMax} л`}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  На {calculation.totalArea} м² × {calculation.coats} {calculation.coats === 1 ? 'слой' : 'слоя'}
                  {calculation.surfaceFactor > 1 && ` (+${Math.round((calculation.surfaceFactor - 1) * 100)}% на поверхность)`}
                </div>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
