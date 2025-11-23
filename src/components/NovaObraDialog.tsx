import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X } from "lucide-react";
import { criarObra } from "@/services/api";
import { toast } from "sonner";

interface NovaObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onObraCreated?: () => void;
}

const NovaObraDialog = ({ open, onOpenChange, onObraCreated }: NovaObraDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [adminsObra, setAdminsObra] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    engenheiro: "",
    localizacao: "",
    previsaoTermino: "",
    observacoes: "",
  });

  useEffect(() => {
    // Carregar admins de obra disponíveis
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const admins = usuarios.filter((u: any) => u.role === "admin_obra");
    setAdminsObra(admins);
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById("projeto-file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.engenheiro || !selectedFile) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha todos os campos obrigatórios e envie o arquivo do projeto.",
      });
      return;
    }

    setLoading(true);

    try {
      // Criar FormData com todos os campos incluindo o arquivo BIM
      const formDataToSend = new FormData();
      formDataToSend.append('nome_obra', formData.nome);
      formDataToSend.append('responsavel_obra', formData.engenheiro);
      formDataToSend.append('localizacao', formData.localizacao);
      formDataToSend.append('previsao_termino', formData.previsaoTermino);
      if (formData.observacoes) {
        formDataToSend.append('observacoes', formData.observacoes);
      }
      formDataToSend.append('arquivo', selectedFile);

      // Enviar tudo em uma única requisição
      const resultadoObra = await criarObra(formDataToSend);

      if (resultadoObra.error) {
        toast.error("Erro ao criar obra", {
          description: resultadoObra.error,
        });
        setLoading(false);
        return;
      }

      toast.success("Obra criada com sucesso!", {
        description: `A obra "${formData.nome}" foi criada e o arquivo do projeto foi enviado para análise.`,
      });

      // Reset form
      setSelectedFile(null);
      setFormData({
        nome: "",
        engenheiro: "",
        localizacao: "",
        previsaoTermino: "",
        observacoes: "",
      });
      setLoading(false);
      onOpenChange(false);
      onObraCreated?.();
    } catch (error) {
      console.error("Erro ao criar obra:", error);
      toast.error("Erro inesperado ao criar obra");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setFormData({
      nome: "",
      engenheiro: "",
      localizacao: "",
      previsaoTermino: "",
      observacoes: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Obra</DialogTitle>
          <DialogDescription>
            Cadastre uma nova obra e envie o arquivo do projeto (simulação/modelo BIM) para comparação com as fotos de andamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Arquivo do Projeto */}
          <div className="space-y-2">
            <Label htmlFor="projeto-file" className="text-foreground">
              Arquivo do Projeto (BIM/Simulação) *
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
              {selectedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label htmlFor="projeto-file" className="cursor-pointer block text-center">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-foreground font-medium mb-1">
                    Clique para selecionar o arquivo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    IFC, RVT, DWG ou outros formatos de projeto
                  </p>
                  <input
                    id="projeto-file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".ifc,.rvt,.dwg,.pdf,.zip"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Nome da Obra */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-foreground">
              Nome da Obra *
            </Label>
            <Input
              id="nome"
              placeholder="Ex: Estação Morumbi"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          {/* Engenheiro Responsável */}
          <div className="space-y-2">
            <Label htmlFor="engenheiro" className="text-foreground">
              Engenheiro Responsável *
            </Label>
            <Input
              id="engenheiro"
              placeholder="Ex: Eng. João Silva"
              value={formData.engenheiro}
              onChange={(e) => setFormData({ ...formData, engenheiro: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Localização */}
            <div className="space-y-2">
              <Label htmlFor="localizacao" className="text-foreground">
                Localização
              </Label>
              <Input
                id="localizacao"
                placeholder="Ex: Av. Paulista, 1000"
                value={formData.localizacao}
                onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
              />
            </div>

            {/* Previsão de Término */}
            <div className="space-y-2">
              <Label htmlFor="previsaoTermino" className="text-foreground">
                Previsão de Término
              </Label>
              <Input
                id="previsaoTermino"
                type="date"
                value={formData.previsaoTermino}
                onChange={(e) => setFormData({ ...formData, previsaoTermino: e.target.value })}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-foreground">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre a obra..."
              className="min-h-[100px] resize-none"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Criar Obra
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NovaObraDialog;
