import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Eye, UserCog } from "lucide-react";
import { toast } from "sonner";
import metroLogo from "@/assets/metro-sp-logo.png";
import NovoUsuarioDialog from "@/components/NovoUsuarioDialog";

const Usuarios = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    // Verificar se usuário está logado e é admin geral
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
      navigate("/");
      return;
    }
    
    const userData = JSON.parse(usuarioLogado);
    if (userData.role !== "admin_geral") {
      toast.error("Acesso negado. Apenas o administrador geral pode acessar esta página.");
      navigate("/dashboard");
      return;
    }

    // Carregar usuários
    const usuariosData = JSON.parse(localStorage.getItem("usuarios") || "[]");
    setUsuarios(usuariosData);
  }, [navigate]);

  const toggleRole = (index: number) => {
    const novosUsuarios = [...usuarios];
    const currentRole = novosUsuarios[index].role;
    
    // Alternar entre admin_obra e visualizador
    novosUsuarios[index].role = currentRole === "admin_obra" ? "visualizador" : "admin_obra";
    setUsuarios(novosUsuarios);
    localStorage.setItem("usuarios", JSON.stringify(novosUsuarios));
    
    const roleLabel = novosUsuarios[index].role === "admin_obra" ? "Admin Responsável" : "Visualizador";
    toast.success(`Permissão de ${novosUsuarios[index].nome} atualizada para ${roleLabel}`);
  };

  const carregarUsuarios = () => {
    const usuariosData = JSON.parse(localStorage.getItem("usuarios") || "[]");
    setUsuarios(usuariosData);
  };

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center justify-center w-18 h-12 bg-white rounded-lg p-1.5">
              <img src={metroLogo} alt="Metrô São Paulo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Gerenciar Usuários</h1>
              <p className="text-sm text-muted-foreground">Controle de acesso e permissões</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Usuários Cadastrados</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Total: {usuarios.length} usuário{usuarios.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <NovoUsuarioDialog onUsuarioCriado={carregarUsuarios} />
            </div>
          </div>

          <div className="space-y-3">
            {usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </div>
            ) : (
              usuariosFiltrados.map((usuario, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        usuario.role === "admin_obra" ? "bg-primary/10" : "bg-muted"
                      }`}>
                        {usuario.role === "admin_obra" ? (
                          <UserCog className="w-6 h-6 text-primary" />
                        ) : (
                          <Eye className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{usuario.nome}</h3>
                          <Badge
                            className={
                              usuario.role === "admin_obra"
                                ? "bg-primary/10 text-primary border-0"
                                : "bg-muted text-muted-foreground border-0"
                            }
                          >
                            {usuario.role === "admin_obra" ? "Admin Responsável" : "Visualizador"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{usuario.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {usuario.cargo}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {usuario.area}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={usuario.role === "admin_obra" ? "outline" : "default"}
                      onClick={() => {
                        const idx = usuarios.findIndex(u => u.email === usuario.email);
                        toggleRole(idx);
                      }}
                    >
                      {usuario.role === "admin_obra" ? "Tornar Visualizador" : "Tornar Admin Responsável"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Usuarios;
