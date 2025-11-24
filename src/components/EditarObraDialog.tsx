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
import { editarObra } from "@/services/api";
import { toast } from "sonner";

interface EditarObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obra: {
    id: number | string;
    nome: string;
    engenheiro: string;
    localizacao: string;
    previsaoTermino: string;
  };
  onObraUpdated?: () => void;
}

const EditarObraDialog = ({ open, onOpenChange, obra, onObraUpdated }: EditarObraDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    engenheiro: "",
    localizacao: "",
    previsaoTermino: "",
    observacoes: "",
  });

  // Preencher formulário com dados da obra ao abrir
  useEffect(() => {
    if (open && obra) {
      setFormData({
        nome: obra.nome,
        engenheiro: obra.engenheiro,
        localizacao: obra.localizacao,
        previsaoTermino: obra.previsaoTermino.split("/").reverse().join("-"),
        observacoes: "",
      });
    }
  }, [open, obra]);

  const handleSubmit = async () => {
    if (!formData.nome || !formData.localizacao) {
      toast.error("Campos obrigatórios", {
        description: "Por favor, preencha nome e localização da obra.",
      });
      return;
    }

    setLoading(true);

    const dadosAtualizados = {
      nome_obra: formData.nome,
      localizacao: formData.localizacao,
    };

    const resultado = await editarObra(obra.id.toString(), dadosAtualizados);

    if (resultado.error) {
      toast.error("Erro ao atualizar obra", {
        description: resultado.error,
      });
    } else {
      toast.success("Obra atualizada com sucesso!", {
        description: `As informações da obra "${formData.nome}" foram atualizadas.`,
      });
      onOpenChange(false);
      onObraUpdated?.();
    }

    setLoading(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Obra</DialogTitle>
          <DialogDescription>
            Atualize as informações da obra.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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

          {/* Localização */}
          <div className="space-y-2">
            <Label htmlFor="localizacao" className="text-foreground">
              Localização *
            </Label>
            <Input
              id="localizacao"
              placeholder="Ex: Av. Paulista, 1000"
              value={formData.localizacao}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
            />
          </div>

          {/* Info: Campos não editáveis */}
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> Responsável, previsão de término e observações não podem ser alterados após a criação da obra.
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div>
                <span className="font-medium">Responsável:</span> {formData.engenheiro}
              </div>
              <div>
                <span className="font-medium">Previsão:</span> {new Date(formData.previsaoTermino).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditarObraDialog;
