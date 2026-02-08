import { useState, useCallback } from "react";
import { Square, CircleDot, Layers, Sparkles, Loader2, Lightbulb, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/ImageUploader";
import { TintPalettePicker } from "@/components/visualizer/TintPalettePicker";
import { ColorPreview } from "@/components/ColorPreview";
import { AISuggestions } from "@/components/AISuggestions";
import { PaintCalculator, CalculationResult } from "@/components/visualizer/PaintCalculator";
import { useRecolorRoom } from "@/hooks/useRecolorRoom";
import { useSuggestColors, ColorPalette } from "@/hooks/useSuggestColors";

const styles = [
  { value: "modern", label: "Современный" },
  { value: "scandinavian", label: "Скандинавский" },
  { value: "classic", label: "Классический" },
  { value: "cozy", label: "Уютный" },
  { value: "bold", label: "Смелый" },
  { value: "natural", label: "Природный" },
];

interface SurfaceConfig {
  enabled: boolean;
  color: string;
}

interface SurfacesState {
  ceiling: SurfaceConfig;
  ceilingMolding: SurfaceConfig;
  walls: SurfaceConfig;
  floorMolding: SurfaceConfig;
  floor: SurfaceConfig;
}

export const VisualizerSection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [paintCalculation, setPaintCalculation] = useState<CalculationResult | null>(null);
  
  const [surfaces, setSurfaces] = useState<SurfacesState>({
    ceiling: { enabled: true, color: "#FFFFFF" },
    ceilingMolding: { enabled: false, color: "#FFFFFF" },
    walls: { enabled: true, color: "#E8E4E0" },
    floorMolding: { enabled: false, color: "#8B7355" },
    floor: { enabled: true, color: "#8B7355" },
  });
  
  const { recolorRoom, isProcessing, processedImage, resetProcessedImage } = useRecolorRoom();
  const { suggestColors, isAnalyzing, suggestions, clearSuggestions } = useSuggestColors();

  const handleCalculationChange = useCallback((calc: CalculationResult | null) => {
    setPaintCalculation(calc);
  }, []);

  const updateSurface = (key: keyof SurfacesState, update: Partial<SurfaceConfig>) => {
    setSurfaces(prev => ({
      ...prev,
      [key]: { ...prev[key], ...update }
    }));
    setSelectedPalette(null);
  };

  const handleImageChange = (newImage: string | null) => {
    setImage(newImage);
    resetProcessedImage();
    clearSuggestions();
    setSelectedPalette(null);
  };

  const handleApplyColors = async () => {
    if (!image) return;
    
    // Pass only enabled surfaces
    await recolorRoom(
      image, 
      surfaces.walls.enabled ? surfaces.walls.color : null,
      surfaces.ceiling.enabled ? surfaces.ceiling.color : null,
      surfaces.floor.enabled ? surfaces.floor.color : null,
      surfaces.ceilingMolding.enabled ? surfaces.ceilingMolding.color : null,
      surfaces.floorMolding.enabled ? surfaces.floorMolding.color : null
    );
  };

  const handleSuggestColors = async () => {
    if (!image) return;
    await suggestColors(image, selectedStyle);
  };

  const handleApplyPalette = (palette: ColorPalette) => {
    setSurfaces(prev => ({
      ...prev,
      ceiling: { ...prev.ceiling, color: palette.ceiling },
      walls: { ...prev.walls, color: palette.walls },
      floor: { ...prev.floor, color: palette.floor },
    }));
    setSelectedPalette(palette);
  };

  const surfaceItems = [
    { key: 'ceiling' as const, label: 'Потолок', icon: <CircleDot className="w-4 h-4" /> },
    { key: 'ceilingMolding' as const, label: 'Потолочные плинтуса', icon: <Minus className="w-4 h-4" /> },
    { key: 'walls' as const, label: 'Стены', icon: <Square className="w-4 h-4" /> },
    { key: 'floorMolding' as const, label: 'Напольные плинтуса', icon: <Minus className="w-4 h-4" /> },
    { key: 'floor' as const, label: 'Пол', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <section id="visualizer" className="py-8 md:py-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-warm/10 rounded-full text-accent-warm text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-визуализатор и дизайнер
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Примерьте цвета до покупки
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Загрузите фото комнаты — AI подберёт идеальные цвета или перекрасит по вашему выбору
          </p>
        </div>

        {/* Visualizer Tool */}
        <div className="visualizer-container">
          <div className="grid lg:grid-cols-[1fr,380px] gap-6">
            {/* Left Panel - Image */}
            <div className="space-y-4">
              <ImageUploader 
                image={image} 
                processedImage={processedImage}
                isProcessing={isProcessing}
                onImageChange={handleImageChange}
                onApplyColors={handleApplyColors}
              />
              
              {/* AI Designer Panel */}
              {image && !isProcessing && (
                <div className="ai-designer-panel">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-accent-warm" />
                    <h3 className="font-semibold text-foreground">AI-дизайнер</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Выберите стиль и AI предложит оптимальные цвета для вашей комнаты
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Выберите стиль" />
                      </SelectTrigger>
                      <SelectContent>
                        {styles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button 
                      onClick={handleSuggestColors}
                      disabled={isAnalyzing}
                      className="sm:w-auto"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Анализирую...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Подобрать цвета
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              {suggestions && (
                <AISuggestions 
                  analysis={suggestions.analysis}
                  palettes={suggestions.palettes}
                  onApplyPalette={handleApplyPalette}
                  selectedPalette={selectedPalette}
                />
              )}

              {image && !processedImage && !isProcessing && !suggestions && (
                <div className="tip-card">
                  <p className="text-sm">
                    💡 <strong>Совет:</strong> Нажмите "Подобрать цвета" чтобы AI проанализировал комнату, 
                    или выберите цвета вручную справа.
                  </p>
                </div>
              )}

              {processedImage && (
                <div className="tip-card">
                  <p className="text-sm">
                    ✨ <strong>Понравился результат?</strong> Запишите коды цветов и закажите колеровку в нашем магазине!
                  </p>
                </div>
              )}
            </div>

            {/* Right Panel - Controls */}
            <div className="space-y-4">
              <ColorPreview 
                surfaces={surfaces}
              />
              
              {/* Surface Controls with Checkboxes */}
              <div className="space-y-3 p-4 rounded-xl bg-card border border-border">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Что красим
                </h3>
                
                {surfaceItems.map(({ key, label, icon }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id={`surface-${key}`}
                        checked={surfaces[key].enabled} 
                        onCheckedChange={(checked) => updateSurface(key, { enabled: checked === true })}
                      />
                      <label 
                        htmlFor={`surface-${key}`}
                        className="text-sm font-medium cursor-pointer flex items-center gap-2 flex-1"
                      >
                        {icon}
                        {label}
                      </label>
                      {surfaces[key].enabled && (
                        <div 
                          className="w-6 h-6 rounded-md border-2 border-border shadow-sm"
                          style={{ backgroundColor: surfaces[key].color }}
                        />
                      )}
                    </div>
                    {surfaces[key].enabled && (
                      <div className="ml-7">
                        <TintPalettePicker
                          label=""
                          icon={null}
                          color={surfaces[key].color}
                          onChange={(c) => updateSurface(key, { color: c })}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Info about palette */}
              <div className="p-4 rounded-xl bg-accent/30 border border-border">
                <p className="text-sm text-muted-foreground">
                  💡 Все цвета из официальной палитры колеровки centr-krasok.kz
                </p>
              </div>
              
              {/* Paint Calculator */}
              <PaintCalculator onCalculationChange={handleCalculationChange} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
