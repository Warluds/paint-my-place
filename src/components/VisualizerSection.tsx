import { useState, useCallback } from "react";
import { Square, CircleDot, Layers, Sparkles, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export const VisualizerSection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [wallColor, setWallColor] = useState("#E8E4E0");
  const [ceilingColor, setCeilingColor] = useState("#FFFFFF");
  const [floorColor, setFloorColor] = useState("#8B7355");
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [paintCalculation, setPaintCalculation] = useState<CalculationResult | null>(null);
  
  const { recolorRoom, isProcessing, processedImage, resetProcessedImage } = useRecolorRoom();
  const { suggestColors, isAnalyzing, suggestions, clearSuggestions } = useSuggestColors();

  const handleCalculationChange = useCallback((calc: CalculationResult | null) => {
    setPaintCalculation(calc);
  }, []);

  const handleImageChange = (newImage: string | null) => {
    setImage(newImage);
    resetProcessedImage();
    clearSuggestions();
    setSelectedPalette(null);
  };

  const handleApplyColors = async () => {
    if (!image) return;
    await recolorRoom(image, wallColor, ceilingColor, floorColor);
  };

  const handleSuggestColors = async () => {
    if (!image) return;
    await suggestColors(image, selectedStyle);
  };

  const handleApplyPalette = (palette: ColorPalette) => {
    setCeilingColor(palette.ceiling);
    setWallColor(palette.walls);
    setFloorColor(palette.floor);
    setSelectedPalette(palette);
  };

  return (
    <section id="visualizer" className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-warm/10 rounded-full text-accent-warm text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-визуализатор и дизайнер
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Примерьте цвета до покупки
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Загрузите фото комнаты — AI подберёт идеальные цвета или перекрасит по вашему выбору
          </p>
        </div>

        {/* Visualizer Tool */}
        <div className="visualizer-container">
          <div className="grid lg:grid-cols-[1fr,400px] gap-8">
            {/* Left Panel - Image */}
            <div className="space-y-6">
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
            <div className="space-y-6">
              <ColorPreview 
                wallColor={wallColor}
                ceilingColor={ceilingColor}
                floorColor={floorColor}
              />
              
              <div className="space-y-4">
                <TintPalettePicker
                  label="Потолок"
                  icon={<CircleDot className="w-5 h-5" />}
                  color={ceilingColor}
                  onChange={(c) => { setCeilingColor(c); setSelectedPalette(null); }}
                />
                
                <TintPalettePicker
                  label="Стены"
                  icon={<Square className="w-5 h-5" />}
                  color={wallColor}
                  onChange={(c) => { setWallColor(c); setSelectedPalette(null); }}
                />
                
                <TintPalettePicker
                  label="Пол"
                  icon={<Layers className="w-5 h-5" />}
                  color={floorColor}
                  onChange={(c) => { setFloorColor(c); setSelectedPalette(null); }}
                />
              </div>

              {/* Info about palette */}
              <div className="p-4 rounded-xl bg-accent/30 border border-border">
                <p className="text-sm text-muted-foreground">
                  💡 Все цвета из официальной палитры колеровки centr-krasok.kz
                </p>
              </div>
              
              {/* Paint Calculator - moved to bottom */}
              <PaintCalculator onCalculationChange={handleCalculationChange} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
