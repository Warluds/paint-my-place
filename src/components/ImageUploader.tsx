import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  image: string | null;
  processedImage: string | null;
  isProcessing: boolean;
  onImageChange: (image: string | null) => void;
  onApplyColors: () => void;
}

export const ImageUploader = ({ 
  image, 
  processedImage,
  isProcessing,
  onImageChange, 
  onApplyColors 
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImage = showOriginal ? image : (processedImage || image);

  if (image) {
    return (
      <div className="space-y-4">
        <div className="image-preview-container">
          {isProcessing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg font-medium">AI обрабатывает изображение...</p>
                <p className="text-sm text-muted-foreground">Это может занять до 30 секунд</p>
              </div>
            </div>
          )}
          <img 
            src={displayImage!} 
            alt="Фото комнаты" 
            className="uploaded-image"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full shadow-lg"
              onClick={handleClear}
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {processedImage && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Button
                variant={showOriginal ? "secondary" : "default"}
                size="sm"
                onClick={() => setShowOriginal(false)}
                className="rounded-full shadow-lg"
              >
                Результат
              </Button>
              <Button
                variant={showOriginal ? "default" : "secondary"}
                size="sm"
                onClick={() => setShowOriginal(true)}
                className="rounded-full shadow-lg"
              >
                Оригинал
              </Button>
            </div>
          )}
        </div>
        
        <Button 
          onClick={onApplyColors}
          disabled={isProcessing}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Обработка...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Применить цвета на фото
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`upload-zone ${isDragging ? "upload-zone-active" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="upload-icon-wrapper">
        <Upload className="w-8 h-8 text-primary" />
      </div>
      
      <div className="text-center">
        <p className="text-lg font-medium text-foreground mb-1">
          Загрузите фото комнаты
        </p>
        <p className="text-sm text-muted-foreground">
          Перетащите файл или нажмите для выбора
        </p>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
        <ImageIcon className="w-4 h-4" />
        <span>JPG, PNG, WEBP</span>
      </div>
    </div>
  );
};
