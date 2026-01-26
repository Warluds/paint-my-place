import { useState, useCallback } from "react";
import { Upload, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TintData {
  COLOR: string;
  NAME: string;
  SERIES: string;
  PALETTE: string;
}

export const TintImporter = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; palettes: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setResult(null);
    setError(null);

    try {
      const text = await file.text();
      const tints: TintData[] = JSON.parse(text);

      if (!Array.isArray(tints) || tints.length === 0) {
        throw new Error("Invalid JSON: expected array of tint objects");
      }

      // Validate structure
      const firstTint = tints[0];
      if (!firstTint.COLOR || !firstTint.NAME || !firstTint.PALETTE) {
        throw new Error("Invalid tint format: expected COLOR, NAME, PALETTE fields");
      }

      // Get unique palette name to clear existing
      const paletteName = tints[0].PALETTE;

      console.log(`Importing ${tints.length} tints from palette: ${paletteName}`);

      const { data, error: fnError } = await supabase.functions.invoke('import-tints', {
        body: { 
          tints, 
          clearPalette: paletteName 
        }
      });

      if (fnError) throw fnError;

      if (data?.success) {
        setResult({ imported: data.imported, palettes: data.palettes });
        toast({
          title: "Импорт завершён",
          description: `Загружено ${data.imported} цветов`,
        });
      } else {
        throw new Error(data?.error || "Unknown error");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка импорта";
      setError(message);
      toast({
        title: "Ошибка импорта",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset input
      event.target.value = "";
    }
  }, []);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Импорт палитры колеровки</CardTitle>
        <CardDescription>
          Загрузите JSON-файл с цветами в формате: 
          {`[{"COLOR": "#hex", "NAME": "код", "SERIES": "", "PALETTE": "название"}]`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button asChild disabled={isImporting} variant="outline">
            <label className="cursor-pointer">
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Импортирую...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Выбрать JSON файл
                </>
              )}
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          </Button>
        </div>

        {result && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-accent text-accent-foreground">
            <Check className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">Успешно загружено: {result.imported} цветов</p>
              <p className="text-sm opacity-80">Палитры: {result.palettes.join(", ")}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">Ошибка</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
