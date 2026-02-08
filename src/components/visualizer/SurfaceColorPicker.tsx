import { Checkbox } from "@/components/ui/checkbox";
import { TintPalettePicker } from "@/components/visualizer/TintPalettePicker";
import { ReactNode } from "react";

interface SurfaceColorPickerProps {
  label: string;
  icon: ReactNode;
  color: string;
  enabled: boolean;
  onColorChange: (color: string) => void;
  onEnabledChange: (enabled: boolean) => void;
}

export const SurfaceColorPicker = ({
  label,
  icon,
  color,
  enabled,
  onColorChange,
  onEnabledChange,
}: SurfaceColorPickerProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Checkbox 
          id={`surface-${label}`}
          checked={enabled} 
          onCheckedChange={(checked) => onEnabledChange(checked === true)}
        />
        <label 
          htmlFor={`surface-${label}`}
          className="text-sm font-medium cursor-pointer flex items-center gap-2"
        >
          {icon}
          {label}
        </label>
      </div>
      {enabled && (
        <div className="ml-7">
          <TintPalettePicker
            label=""
            icon={null}
            color={color}
            onChange={onColorChange}
          />
        </div>
      )}
    </div>
  );
};
