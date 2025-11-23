import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Users } from "lucide-react";

interface GerenciarEquipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obraId: number;
  obraNome: string;
}

const GerenciarEquipeDialog = ({ open, onOpenChange, obraId, obraNome }: GerenciarEquipeDialogProps) => {
  const [visualizadores, setVisualizadores] = useState<any[]>([]);
  const [equipeAtual, setEquipeAtual] = useState<string[]>([]);
  const [equipeSelecionada, setEquipeSelecionada] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      // Carregar visualizadores disponíveis
      const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
      const vizs = usuarios.filter((u: any) => u.role === "visualizador");
      setVisualizadores(vizs);

      // Carregar equipe atual da obra
      const obras = JSON.parse(localStorage.getItem("obras") || "[]");
      const obra = obras.find((o: any) => o.id === obraId);
      const equipe = obra?.equipe || [];
      setEquipeAtual(equipe);
      setEquipeSelecionada(equipe);
    }
  }, [open, obraId]);

  const handleToggleUsuario = (email: string) => {
    setEquipeSelecionada((prev) => {
      if (prev.includes(email)) {
        return prev.filter((e) => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const handleSalvar = () => {
    // Atualizar equipe da obra
    const obras = JSON.parse(localStorage.getItem("obras") || "[]");
    const obraIndex = obras.findIndex((o: any) => o.id === obraId);
    
    if (obraIndex !== -1) {
      obras[obraIndex].equipe = equipeSelecionada;
      localStorage.setItem("obras", JSON.stringify(obras));

      toast.success(`Equipe da obra "${obraNome}" atualizada com sucesso!`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Equipe</DialogTitle>
          <DialogDescription>
            Selecione os visualizadores que terão acesso à obra "{obraNome}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {visualizadores.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum visualizador cadastrado no sistema</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {visualizadores.map((usuario) => (
                <div
                  key={usuario.email}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={equipeSelecionada.includes(usuario.email)}
                      onCheckedChange={() => handleToggleUsuario(usuario.email)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{usuario.nome}</p>
                        {equipeAtual.includes(usuario.email) && (
                          <Badge variant="outline" className="text-xs">Na equipe</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{usuario.email}</p>
                      <p className="text-xs text-muted-foreground">{usuario.cargo} - {usuario.area}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>
            Salvar Equipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GerenciarEquipeDialog;
