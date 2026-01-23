import { useState } from "react";
import { Paintbrush, Square, CircleDot, Layers, Sparkles } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { ColorPicker } from "@/components/ColorPicker";
import { ColorPreview } from "@/components/ColorPreview";
import { useRecolorRoom } from "@/hooks/useRecolorRoom";

export const VisualizerSection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [wallColor, setWallColor] = useState("#E8E4E0");
  const [ceilingColor, setCeilingColor] = useState("#FFFFFF");
  const [floorColor, setFloorColor] = useState("#8B7355");
  
  const { recolorRoom, isProcessing, processedImage, resetProcessedImage } = useRecolorRoom();

  const handleImageChange = (newImage: string | null) => {
    setImage(newImage);
    resetProcessedImage();
  };

  const handleApplyColors = async () => {
    if (!image) return;
    await recolorRoom(image, wallColor, ceilingColor, floorColor);
  };

  return (
    <section id="visualizer" className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-warm/10 rounded-full text-accent-warm text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-визуализатор
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Примерьте цвета до покупки
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Загрузите фото вашей комнаты и посмотрите, как будут выглядеть выбранные цвета. 
            AI автоматически перекрасит стены, потолок и пол.
          </p>
        </div>

        {/* Visualizer Tool */}
        <div className="visualizer-container">
          <div className="grid lg:grid-cols-[1fr,380px] gap-8">
            {/* Left Panel - Image */}
            <div className="space-y-6">
              <ImageUploader 
                image={image} 
                processedImage={processedImage}
                isProcessing={isProcessing}
                onImageChange={handleImageChange}
                onApplyColors={handleApplyColors}
              />
              
              {image && !processedImage && !isProcessing && (
                <div className="tip-card">
                  <p className="text-sm">
                    💡 <strong>Совет:</strong> Выберите цвета справа и нажмите "Применить цвета на фото". 
                    AI изменит цвета стен, потолка и пола на вашем изображении.
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
                <ColorPicker
                  label="Потолок"
                  icon={<CircleDot className="w-5 h-5" />}
                  color={ceilingColor}
                  onChange={setCeilingColor}
                />
                
                <ColorPicker
                  label="Стены"
                  icon={<Square className="w-5 h-5" />}
                  color={wallColor}
                  onChange={setWallColor}
                />
                
                <ColorPicker
                  label="Пол"
                  icon={<Layers className="w-5 h-5" />}
                  color={floorColor}
                  onChange={setFloorColor}
                />
              </div>

              {/* Popular Colors */}
              <div className="p-5 rounded-xl bg-card border border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  Популярные цвета
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    "#FFFFFF", "#F5F5F0", "#E8E4E0", "#D4C4B0",
                    "#C9B99A", "#A89880", "#8B8178", "#6B635B",
                    "#E8D8C8", "#D4B896", "#B89B7A", "#967B5D",
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setWallColor(color)}
                      className="w-full aspect-square rounded-lg border-2 border-border hover:border-primary hover:scale-105 transition-all"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
