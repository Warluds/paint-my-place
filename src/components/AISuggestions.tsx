import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorPalette } from "@/hooks/useSuggestColors";

interface AISuggestionsProps {
  analysis: string;
  palettes: ColorPalette[];
  onApplyPalette: (palette: ColorPalette) => void;
  selectedPalette: ColorPalette | null;
}

export const AISuggestions = ({ 
  analysis, 
  palettes, 
  onApplyPalette,
  selectedPalette 
}: AISuggestionsProps) => {
  return (
    <div className="ai-suggestions-panel">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent-warm" />
        <h3 className="font-semibold text-foreground">AI-дизайнер рекомендует</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        {analysis}
      </p>

      <div className="space-y-4">
        {palettes.map((palette, index) => {
          const isSelected = selectedPalette?.name === palette.name;
          
          return (
            <div 
              key={index}
              className={`palette-card ${isSelected ? 'palette-card-selected' : ''}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    {palette.name}
                    {isSelected && <Check className="w-4 h-4 text-accent-warm" />}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {palette.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: palette.ceiling }}
                    title={`Потолок: ${palette.ceiling}`}
                  />
                  <div 
                    className="w-8 h-8 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: palette.walls }}
                    title={`Стены: ${palette.walls}`}
                  />
                  <div 
                    className="w-8 h-8 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: palette.floor }}
                    title={`Пол: ${palette.floor}`}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  <div>П: {palette.ceiling}</div>
                  <div>С: {palette.walls}</div>
                  <div>Л: {palette.floor}</div>
                </div>
              </div>

              <Button 
                size="sm" 
                variant={isSelected ? "default" : "outline"}
                className="w-full"
                onClick={() => onApplyPalette(palette)}
              >
                {isSelected ? "Выбрано" : "Применить палитру"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
