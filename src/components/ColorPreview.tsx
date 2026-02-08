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

interface ColorPreviewProps {
  surfaces: SurfacesState;
}

export const ColorPreview = ({ surfaces }: ColorPreviewProps) => {
  const enabledSurfaces = Object.entries(surfaces).filter(([_, config]) => config.enabled);
  
  return (
    <div className="color-preview-panel">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
        Превью цветов
      </h3>
      
      <div className="room-preview">
        {/* Ceiling */}
        <div 
          className="room-ceiling"
          style={{ backgroundColor: surfaces.ceiling.enabled ? surfaces.ceiling.color : '#f5f5f5' }}
        >
          {surfaces.ceiling.enabled && <span className="room-label">Потолок</span>}
        </div>
        
        {/* Ceiling Molding */}
        {surfaces.ceilingMolding.enabled && (
          <div 
            className="room-ceiling-molding"
            style={{ backgroundColor: surfaces.ceilingMolding.color }}
          />
        )}
        
        {/* Wall */}
        <div 
          className="room-wall"
          style={{ backgroundColor: surfaces.walls.enabled ? surfaces.walls.color : '#f5f5f5' }}
        >
          {surfaces.walls.enabled && <span className="room-label">Стены</span>}
          
          {/* Window decoration */}
          <div className="room-window">
            <div className="window-pane" />
            <div className="window-pane" />
          </div>
        </div>
        
        {/* Floor Molding */}
        {surfaces.floorMolding.enabled && (
          <div 
            className="room-floor-molding"
            style={{ backgroundColor: surfaces.floorMolding.color }}
          />
        )}
        
        {/* Floor */}
        <div 
          className="room-floor"
          style={{ backgroundColor: surfaces.floor.enabled ? surfaces.floor.color : '#f5f5f5' }}
        >
          {surfaces.floor.enabled && <span className="room-label">Пол</span>}
        </div>
      </div>
      
      <div className="color-swatches-row">
        {enabledSurfaces.map(([key, config]) => {
          const labels: Record<string, string> = {
            ceiling: 'Потолок',
            ceilingMolding: 'Пот. плинтус',
            walls: 'Стены',
            floorMolding: 'Нап. плинтус',
            floor: 'Пол',
          };
          return (
            <div key={key} className="swatch-item">
              <div className="swatch-circle" style={{ backgroundColor: config.color }} />
              <span className="swatch-code text-xs">{labels[key]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
