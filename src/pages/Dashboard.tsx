import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { TrainFront, MapPin, Camera, FileText, Plus, LogOut, User, Search, Users as UsersIcon } from "lucide-react";
import NovaObraDialog from "@/components/NovaObraDialog";
import metroLogo from "@/assets/metro-sp-logo.png";
import { listarObras } from "@/services/api";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [novaObraDialogOpen, setNovaObraDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
      navigate("/");
      return;
    }
    
    const user = JSON.parse(usuarioLogado);
    setUserData(user);
    setUserRole(user.role || "visualizador");
    
    // Carregar obras da API
    carregarObras();
  }, [navigate]);

  const carregarObras = async () => {
    setLoading(true);
    const resultado = await listarObras();
    
    if (resultado.error) {
      toast.error("Erro ao carregar obras", {
        description: resultado.error,
      });
      setObras([]);
    } else {
      // Mapear dados da API para o formato esperado
      const obrasFormatadas = resultado.data.projects.map((projeto: any) => ({
        id: projeto.id_obra,
        nome: projeto.nome_obra,
        engenheiro: projeto.engenheiro_responsavel,
        localizacao: projeto.localizacao,
        previsaoTermino: new Date(projeto.previsao_termino).toLocaleDateString('pt-BR'),
        status: projeto.status,
        progresso: projeto.progresso,
        fotos: projeto.total_fotos || 0,
        ultimaFoto: projeto.ultima_foto 
          ? `Há ${Math.floor((Date.now() - new Date(projeto.ultima_foto).getTime()) / (1000 * 60 * 60))} horas`
          : "Nenhuma foto",
        equipe: [], // TODO: Implementar gestão de equipe na API
      }));
      setObras(obrasFormatadas);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    navigate("/");
  };

  const handleObraCreated = () => {
    carregarObras();
  };

  // Filtrar e formatar obras
  const obrasFiltradas = obras
    .filter((obra: any) => {
      if (userRole === "admin_geral") {
        return true;
      } else if (userRole === "visualizador") {
        return obra.equipe?.includes(userData?.email);
      }
      return false;
    })
    .map((obra: any) => ({
      ...obra,
      statusLabel: obra.status === "em_andamento" ? "Em andamento" : 
                   obra.status === "planejamento" ? "Planejamento" : 
                   obra.status === "concluida" ? "Finalizada" : "Em andamento",
      corBorda: obra.status === "em_andamento" ? "border-l-status-ongoing" : 
                obra.status === "planejamento" ? "border-l-status-planning" : 
                obra.status === "concluida" ? "border-l-status-completed" : "border-l-status-ongoing",
    }));

  const statusConfig = {
    em_andamento: { bg: "bg-status-ongoing/10", text: "text-status-ongoing", label: "Em andamento" },
    planejamento: { bg: "bg-status-planning/10", text: "text-status-planning", label: "Planejamento" },
    concluida: { bg: "bg-status-completed/10", text: "text-status-completed", label: "Finalizada" },
  };

  const atividades = [
    {
      id: 1,
      tipo: "foto",
      titulo: "Nova foto analisada - Estação Vila Sônia",
      descricao: "Relatório de segurança gerado automaticamente",
      tempo: "2 min atrás",
      obraId: 1,
    },
    {
      id: 2,
      tipo: "alerta",
      titulo: "Alerta de qualidade detectado",
      descricao: "Extensão Linha 2-Verde - Verificação necessária",
      tempo: "18 min atrás",
      obraId: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg p-1.5">
                <img src={metroLogo} alt="Metrô São Paulo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Sistema de Obras</h1>
                <p className="text-sm text-muted-foreground">Metrô de São Paulo</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {userRole === "admin_geral" && (
                <>
                  <Button onClick={() => setNovaObraDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Obra
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/usuarios")}>
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Usuários
                  </Button>
                </>
              )}
              <div className="flex items-center gap-3 px-4 py-2 bg-secondary/50 rounded-lg border border-border">
                <User className="w-5 h-5 text-primary" />
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{userData?.nome}</p>
                  <p className="text-xs text-muted-foreground">{userData?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Total de Obras</span>
              <TrainFront className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {loading ? "..." : obrasFiltradas.length}
            </div>
          </Card>
          <Card className="p-6 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Fotos Analisadas</span>
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {loading ? "..." : obrasFiltradas.reduce((acc: number, obra: any) => acc + (obra.fotos || 0), 0)}
            </div>
          </Card>
          <Card className="p-6 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Relatórios</span>
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {loading ? "..." : obrasFiltradas.length * 3}
            </div>
          </Card>
        </div>

        {/* Active Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Obras Ativas</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar obras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-8 text-muted-foreground">Carregando obras...</div>
            ) : obrasFiltradas.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-muted-foreground">Nenhuma obra encontrada</div>
            ) : (
              obrasFiltradas
                .filter((obra) => 
                  obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  obra.engenheiro.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  obra.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((obra) => (
              <Card
                key={obra.id}
                className={`p-6 border-l-4 ${obra.corBorda} hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => navigate(`/obra/${obra.id}`)}
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-foreground">{obra.nome}</h3>
                    <Badge className={`${statusConfig[obra.status as keyof typeof statusConfig].bg} ${statusConfig[obra.status as keyof typeof statusConfig].text} border-0`}>
                      {obra.statusLabel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{obra.localizacao}</p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold text-foreground">{obra.progresso}%</span>
                  </div>
                  <Progress value={obra.progresso} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Camera className="w-4 h-4" />
                    <span>{obra.fotos} Fotos</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>Última foto</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">{obra.ultimaFoto}</div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{obra.engenheiro}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <FileText className="w-4 h-4 mr-2" />
                  Relatórios
                </Button>
              </Card>
            ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Atividade Recente</h2>
          <Card className="divide-y divide-border">
            {atividades.map((atividade) => (
              <div 
                key={atividade.id} 
                className="p-6 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/obra/${atividade.obraId}`)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    atividade.tipo === 'foto' ? 'bg-status-completed/10' : 'bg-status-alert/10'
                  }`}>
                    {atividade.tipo === 'foto' ? (
                      <Camera className={`w-5 h-5 ${atividade.tipo === 'foto' ? 'text-status-completed' : 'text-status-alert'}`} />
                    ) : (
                      <FileText className="w-5 h-5 text-status-alert" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{atividade.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{atividade.descricao}</p>
                    <p className="text-xs text-muted-foreground mt-2">{atividade.tempo}</p>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </main>

      <NovaObraDialog open={novaObraDialogOpen} onOpenChange={setNovaObraDialogOpen} />
    </div>
  );
};

export default Dashboard;
