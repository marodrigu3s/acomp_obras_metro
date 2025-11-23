import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Upload, ImagePlus, Send, X } from "lucide-react";
import { toast } from "sonner";
import { uploadFoto } from "@/services/api";

interface UploadPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obraId: string;
  onPhotoUploaded?: () => void;
}

const UploadPhotoDialog = ({ open, onOpenChange, obraId, onPhotoUploaded }: UploadPhotoDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nomeFoto, setNomeFoto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !nomeFoto) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    const resultado = await uploadFoto(
      obraId,
      selectedFile,
      nomeFoto,
      descricao,
      localizacao
    );

    if (resultado.error) {
      toast.error("Erro ao enviar foto", {
        description: resultado.error,
      });
    } else {
      toast.success("Foto enviada para análise com sucesso!");
      
      // Reset form
      setSelectedFile(null);
      setNomeFoto("");
      setDescricao("");
      setLocalizacao("");
      onOpenChange(false);
      onPhotoUploaded?.();
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setNomeFoto("");
    setDescricao("");
    setLocalizacao("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="w-5 h-5 text-primary" />
            Upload de Foto para Análise
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            {selectedFile ? (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                  <ImagePlus className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </div>
            ) : (
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-secondary rounded-lg mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground mb-1">
                  Arraste sua foto aqui
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  ou clique para selecionar
                </p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Button variant="outline" size="sm" type="button">
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </Button>
              </label>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeFoto">
                Nome da Foto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nomeFoto"
                placeholder="Ex: Estrutura Principal"
                value={nomeFoto}
                onChange={(e) => setNomeFoto(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição da Foto</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva a foto..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                placeholder="Ex: Plataforma 1, Mezanino, Sala técnica..."
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-foreground">
              <strong>Análise Automática:</strong> A foto será processada automaticamente para
              identificar elementos de segurança, qualidade da construção e conformidade com
              padrões do Metrô SP.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" />
            Enviar para Análise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPhotoDialog;
