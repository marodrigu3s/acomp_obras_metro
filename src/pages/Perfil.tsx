import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrainFront, ArrowLeft, User, Mail, Briefcase, Building2, Save } from "lucide-react";
import { toast } from "sonner";

const Perfil = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "Carlos Silva",
    email: "carlos.silva@metrovsp.com.br",
    cargo: "engenheiro",
    area: "obras-civis",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.cargo || !formData.area) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    toast.success("Perfil atualizado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <TrainFront className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
              <p className="text-sm text-muted-foreground">Gerencie suas informações</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <Card className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{formData.nome}</h2>
              <p className="text-muted-foreground">{formData.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
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

            <div className="grid md:grid-cols-2 gap-6">
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

            <div className="pt-6 border-t border-border">
              <Button type="submit" className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Perfil;
