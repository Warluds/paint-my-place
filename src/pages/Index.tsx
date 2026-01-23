import { useState } from "react";
import { Paintbrush, Square, CircleDot, Layers } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { ColorPicker } from "@/components/ColorPicker";
import { ColorPreview } from "@/components/ColorPreview";

const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [wallColor, setWallColor] = useState("#E8E4E0");
  const [ceilingColor, setCeilingColor] = useState("#FFFFFF");
  const [floorColor, setFloorColor] = useState("#8B7355");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <div className="header-icon">
              <Paintbrush className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Визуализатор цветов интерьера
              </h1>
              <p className="text-sm text-muted-foreground">
                Загрузите фото и подберите идеальные цвета
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          {/* Left Panel - Image */}
          <div className="space-y-6">
            <ImageUploader image={image} onImageChange={setImage} />
            
            {image && (
              <div className="tip-card">
                <p className="text-sm">
                  💡 <strong>Совет:</strong> Используйте панель справа для выбора цветов стен, потолка и пола. 
                  Вы можете ввести HEX-код цвета вручную или использовать палитру.
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
