import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ label, icon, color, onChange }: ColorPickerProps) => {
  const [hexInput, setHexInput] = useState(color);

  useEffect(() => {
    setHexInput(color);
  }, [color]);

  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    onChange(newColor);
    setHexInput(newColor);
  };

  return (
    <div className="color-picker-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="color-picker-icon">
          {icon}
        </div>
        <Label className="text-lg font-medium text-foreground">{label}</Label>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="color"
            value={color}
            onChange={handleColorPickerChange}
            className="color-input-native"
          />
          <div 
            className="color-swatch"
            style={{ backgroundColor: color }}
          />
        </div>
        
        <div className="flex-1">
          <Input
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#FFFFFF"
            className="hex-input font-mono"
            maxLength={7}
          />
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-2">
        <div 
          className="w-full h-3 rounded-full"
          style={{ 
            background: `linear-gradient(to right, ${color}00, ${color})` 
          }}
        />
      </div>
    </div>
  );
};
