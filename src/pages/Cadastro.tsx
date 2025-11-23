import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrainFront, User, Mail, Lock, Building2, Briefcase, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import metroLogo from "@/assets/metro-sp-logo.png";

const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cargo: "",
    area: "",
    role: "visualizador",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.senha || !formData.cargo || !formData.area || !formData.role) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    // Simulação de cadastro - salvar dados no localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    usuarios.push({
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      cargo: formData.cargo,
      area: formData.area,
      role: formData.role,
    });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    
    toast.success("Cadastro realizado com sucesso!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-4 p-2">
            <img src={metroLogo} alt="Metrô São Paulo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sistema de Obras</h1>
          <p className="text-white/80">Metrô de São Paulo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-2xl font-semibold text-foreground">Criar Nova Conta</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seuemail@metrovsp.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmarSenha"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Select value={formData.cargo} onValueChange={(value) => setFormData({ ...formData, cargo: value })}>
                    <SelectTrigger id="cargo" className="pl-10">
                      <SelectValue placeholder="Selecione seu cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engenheiro">Engenheiro(a)</SelectItem>
                      <SelectItem value="arquiteto">Arquiteto(a)</SelectItem>
                      <SelectItem value="tecnico">Técnico(a)</SelectItem>
                      <SelectItem value="supervisor">Supervisor(a)</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="diretor">Diretor(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Área de Atuação</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Select value={formData.area} onValueChange={(value) => setFormData({ ...formData, area: value })}>
                    <SelectTrigger id="area" className="pl-10">
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="obras-civis">Obras Civis</SelectItem>
                      <SelectItem value="eletrica">Elétrica</SelectItem>
                      <SelectItem value="mecanica">Mecânica</SelectItem>
                      <SelectItem value="planejamento">Planejamento</SelectItem>
                      <SelectItem value="qualidade">Qualidade</SelectItem>
                      <SelectItem value="seguranca">Segurança do Trabalho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Acesso</Label>
              <div className="relative">
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione o tipo de acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador (Controle Total)</SelectItem>
                    <SelectItem value="visualizador">Visualizador (Apenas Leitura)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {formData.role === "admin" 
                  ? "Pode criar, editar e gerenciar obras" 
                  : "Pode apenas visualizar obras e relatórios"}
              </p>
            </div>

            <Button type="submit" className="w-full">
              Criar Conta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já possui uma conta?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-primary hover:underline font-medium"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-white/60 text-sm mt-6">
          © 2024 Companhia do Metropolitano de São Paulo - Metrô
        </p>
      </div>
    </div>
  );
};

export default Cadastro;
