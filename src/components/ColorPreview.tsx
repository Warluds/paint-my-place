interface ColorPreviewProps {
  wallColor: string;
  ceilingColor: string;
  floorColor: string;
}

export const ColorPreview = ({ wallColor, ceilingColor, floorColor }: ColorPreviewProps) => {
  return (
    <div className="color-preview-panel">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
        Превью цветов
      </h3>
      
      <div className="room-preview">
        {/* Ceiling */}
        <div 
          className="room-ceiling"
          style={{ backgroundColor: ceilingColor }}
        >
          <span className="room-label">Потолок</span>
        </div>
        
        {/* Wall */}
        <div 
          className="room-wall"
          style={{ backgroundColor: wallColor }}
        >
          <span className="room-label">Стены</span>
          
          {/* Window decoration */}
          <div className="room-window">
            <div className="window-pane" />
            <div className="window-pane" />
          </div>
        </div>
        
        {/* Floor */}
        <div 
          className="room-floor"
          style={{ backgroundColor: floorColor }}
        >
          <span className="room-label">Пол</span>
        </div>
      </div>
      
      <div className="color-swatches-row">
        <div className="swatch-item">
          <div className="swatch-circle" style={{ backgroundColor: ceilingColor }} />
          <span className="swatch-code">{ceilingColor}</span>
        </div>
        <div className="swatch-item">
          <div className="swatch-circle" style={{ backgroundColor: wallColor }} />
          <span className="swatch-code">{wallColor}</span>
        </div>
        <div className="swatch-item">
          <div className="swatch-circle" style={{ backgroundColor: floorColor }} />
          <span className="swatch-code">{floorColor}</span>
        </div>
      </div>
    </div>
  );
};
