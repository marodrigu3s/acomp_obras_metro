import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface NovoUsuarioDialogProps {
  onUsuarioCriado: () => void;
}

const NovoUsuarioDialog = ({ onUsuarioCriado }: NovoUsuarioDialogProps) => {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("");
  const [area, setArea] = useState("");
  const [role, setRole] = useState<"admin_obra" | "visualizador">("visualizador");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!nome.trim() || !email.trim() || !senha.trim() || !cargo.trim() || !area.trim()) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    if (senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email válido.");
      return;
    }

    // Verificar se o email já existe
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const emailExiste = usuarios.some((u: any) => u.email === email);
    
    if (emailExiste) {
      toast.error("Este email já está cadastrado.");
      return;
    }

    // Criar novo usuário
    const novoUsuario = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha,
      cargo: cargo.trim(),
      area: area.trim(),
      role,
      dataCadastro: new Date().toISOString(),
    };

    usuarios.push(novoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    const roleLabel = role === "admin_obra" ? "Admin Responsável" : "Visualizador";
    toast.success(`Usuário ${nome} criado com sucesso como ${roleLabel}!`);

    // Limpar formulário e fechar dialog
    setNome("");
    setEmail("");
    setSenha("");
    setCargo("");
    setArea("");
    setRole("visualizador");
    setOpen(false);
    onUsuarioCriado();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Cadastre um novo usuário no sistema com suas permissões de acesso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              placeholder="Digite o nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha *</Label>
            <Input
              id="senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo *</Label>
            <Input
              id="cargo"
              placeholder="Ex: Engenheiro Civil"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Área *</Label>
            <Input
              id="area"
              placeholder="Ex: Infraestrutura"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Nível de Acesso *</Label>
            <Select value={role} onValueChange={(value: "admin_obra" | "visualizador") => setRole(value)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione o nível de acesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visualizador">Visualizador</SelectItem>
                <SelectItem value="admin_obra">Admin Responsável pela Obra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Criar Usuário
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoUsuarioDialog;
