import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
}

export const ImageUploader = ({ image, onImageChange }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
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

  if (image) {
    return (
      <div className="image-preview-container">
        <img 
          src={image} 
          alt="Загруженное фото" 
          className="uploaded-image"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-4 right-4 rounded-full shadow-lg"
          onClick={handleClear}
        >
          <X className="w-4 h-4" />
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
