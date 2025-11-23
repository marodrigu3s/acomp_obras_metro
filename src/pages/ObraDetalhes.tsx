import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrainFront,
  ArrowLeft,
  Camera,
  FileText,
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Settings,
  Search,
} from "lucide-react";
import UploadPhotoDialog from "@/components/UploadPhotoDialog";
import EditarObraDialog from "@/components/EditarObraDialog";
import GerenciarEquipeDialog from "@/components/GerenciarEquipeDialog";
import metroLogo from "@/assets/metro-sp-logo.png";
import { getObraDetalhes, deletarFoto } from "@/services/api";
import { toast } from "sonner";

const ObraDetalhes = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [equipeDialogOpen, setEquipeDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [searchFotos, setSearchFotos] = useState("");
  const [obra, setObra] = useState<any>(null);
  const [fotos, setFotos] = useState<any[]>([]);
  const [arquivosBIM, setArquivosBIM] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
      navigate("/");
      return;
    }
    
    const userData = JSON.parse(usuarioLogado);
    setUserRole(userData.role || "visualizador");

    // Carregar dados da obra
    carregarDadosObra();
  }, [navigate, id]);

  const carregarDadosObra = async () => {
    if (!id) return;
    
    setLoading(true);
    const resultado = await getObraDetalhes(id);
    
    if (resultado.error) {
      toast.error("Erro ao carregar obra", {
        description: resultado.error,
      });
      navigate("/dashboard");
    } else {
      // Formatar dados da obra
      const obraData = resultado.data.obra;
      const obraFormatada = {
        id: obraData.id_obra,
        nome: obraData.nome_obra,
        engenheiro: obraData.engenheiro_responsavel,
        localizacao: obraData.localizacao,
        previsaoTermino: new Date(obraData.previsao_termino).toLocaleDateString('pt-BR'),
        status: obraData.status,
        progresso: obraData.progresso,
      };
      setObra(obraFormatada);
      
      // Formatar fotos
      const fotosFormatadas = resultado.data.fotos.map((foto: any) => ({
        id: foto.id_foto,
        titulo: foto.nome_foto,
        data: new Date(foto.data_upload).toLocaleDateString('pt-BR'),
        camera: foto.localizacao || "Não especificado",
        analise: foto.descricao || "Análise pendente",
        status: foto.status || "aprovado",
        url: foto.url_foto,
      }));
      setFotos(fotosFormatadas);
      
      // Formatar arquivos BIM
      const arquivosFormatados = resultado.data.arquivos_bim.map((arquivo: any) => ({
        id: arquivo.id_arquivo,
        nome: arquivo.nome_arquivo,
        tamanho: `${(arquivo.tamanho / (1024 * 1024)).toFixed(2)} MB`,
        tipo: arquivo.tipo_arquivo,
        dataUpload: new Date(arquivo.data_upload).toLocaleDateString('pt-BR'),
        url: arquivo.url_arquivo,
      }));
      setArquivosBIM(arquivosFormatados);
    }
    setLoading(false);
  };

  const handleFotoDeleted = async (fotoId: string) => {
    const resultado = await deletarFoto(fotoId);
    if (resultado.error) {
      toast.error("Erro ao deletar foto", {
        description: resultado.error,
      });
    } else {
      toast.success("Foto deletada com sucesso");
      carregarDadosObra();
    }
  };

  const handlePhotoUploaded = () => {
    carregarDadosObra();
  };

  const handleObraUpdated = () => {
    carregarDadosObra();
  };

  const relatorios = [
    {
      id: 1,
      titulo: "Relatório Semanal - Semana 3",
      data: "2024-01-15",
      tipo: "Semanal",
    },
    {
      id: 2,
      titulo: "Análise de Segurança - Janeiro",
      data: "2024-01-10",
      tipo: "Segurança",
    },
    {
      id: 3,
      titulo: "Comparativo BIM vs Realidade",
      data: "2024-01-05",
      tipo: "Técnico",
    },
  ];

  const alertas = [
    {
      id: 1,
      mensagem: "Pequeno desvio estrutural detectado - Fundação Norte",
      gravidade: "media",
      data: "2024-01-14",
    },
    {
      id: 2,
      mensagem: "Verificação de qualidade pendente - Área C",
      gravidade: "baixa",
      data: "2024-01-12",
    },
  ];

  // Loading state
  if (loading || !obra) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados da obra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg p-1.5">
                <img src={metroLogo} alt="Metrô São Paulo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{obra.nome}</h1>
                <p className="text-sm text-muted-foreground">{obra.localizacao}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${obra.status === "ongoing" ? "bg-status-ongoing/10 text-status-ongoing" : "bg-status-completed/10 text-status-completed"} border-0 px-4 py-2`}>
                {obra.status === "ongoing" ? "Em andamento" : "Finalizado"}
              </Badge>
              {(userRole === "admin_geral" || userRole === "admin_obra") && (
                <>
                  {userRole === "admin_geral" && (
                    <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Editar Obra
                    </Button>
                  )}
                  {userRole === "admin_obra" && (
                    <Button variant="outline" onClick={() => setEquipeDialogOpen(true)}>
                      <Users className="w-4 h-4 mr-2" />
                      Gerenciar Equipe
                    </Button>
                  )}
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Camera className="w-4 h-4 mr-2" />
                    Nova Foto
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Progresso</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">{obra.progresso}%</p>
            <Progress value={obra.progresso} className="h-2" />
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Previsão de Término</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{obra.previsaoTermino}</p>
          </Card>
        </div>

        {/* Details and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 lg:col-span-1">
            <h3 className="font-semibold text-lg text-foreground mb-4">Informações da Obra</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Engenheiro Responsável</p>
                <p className="text-foreground font-medium">{obra.engenheiro}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Localização Específica</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <p className="text-foreground">{obra.localizacao}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h3 className="font-semibold text-lg text-foreground mb-4">Alertas e Observações</h3>
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`p-4 rounded-lg border ${
                    alerta.gravidade === "media"
                      ? "bg-status-ongoing/5 border-status-ongoing/20"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`w-5 h-5 mt-0.5 ${
                        alerta.gravidade === "media" ? "text-status-ongoing" : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-foreground font-medium mb-1">{alerta.mensagem}</p>
                      <p className="text-xs text-muted-foreground">{alerta.data}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="fotos" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="fotos">Fotos Analisadas</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            <TabsTrigger value="arquivo">Arquivo do Projeto</TabsTrigger>
          </TabsList>

          <TabsContent value="fotos">
            <div className="mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar fotos..."
                  value={searchFotos}
                  onChange={(e) => setSearchFotos(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {fotos
                .filter((foto) =>
                  foto.titulo.toLowerCase().includes(searchFotos.toLowerCase()) ||
                  foto.camera.toLowerCase().includes(searchFotos.toLowerCase()) ||
                  foto.analise.toLowerCase().includes(searchFotos.toLowerCase())
                )
                .map((foto) => (
                <Card key={foto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-primary/30" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{foto.titulo}</h4>
                      {foto.status === "aprovado" ? (
                        <CheckCircle2 className="w-5 h-5 text-status-completed flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-status-ongoing flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{foto.analise}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Camera className="w-3 h-3" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[150px]">{foto.camera}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{foto.camera}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span>•</span>
                      <span>{foto.data}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {fotos.filter((foto) =>
              foto.titulo.toLowerCase().includes(searchFotos.toLowerCase()) ||
              foto.camera.toLowerCase().includes(searchFotos.toLowerCase()) ||
              foto.analise.toLowerCase().includes(searchFotos.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma foto encontrada</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="relatorios">
            <Card>
              <div className="divide-y divide-border">
                {relatorios.map((relatorio) => (
                  <div 
                    key={relatorio.id} 
                    className="p-6 hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (!obra) return;
                      
                      // Abrir nova tela com JSON do relatório
                      const jsonData = {
                        id: relatorio.id,
                        titulo: relatorio.titulo,
                        data: relatorio.data,
                        tipo: relatorio.tipo,
                        obraId: obra.id,
                        obraNome: obra.nome,
                        detalhes: {
                          progresso: obra.progresso,
                          fotosAnalisadas: fotos.length,
                          alertasAtivos: alertas.length,
                        }
                      };
                      const jsonWindow = window.open('', '_blank');
                      if (jsonWindow) {
                        jsonWindow.document.write(`
                          <html>
                            <head>
                              <title>${relatorio.titulo}</title>
                              <style>
                                body { 
                                  font-family: monospace; 
                                  padding: 20px; 
                                  background: #1e1e1e; 
                                  color: #d4d4d4; 
                                }
                                pre { 
                                  background: #252526; 
                                  padding: 20px; 
                                  border-radius: 8px; 
                                  overflow-x: auto;
                                }
                              </style>
                            </head>
                            <body>
                              <h1>Relatório JSON</h1>
                              <pre>${JSON.stringify(jsonData, null, 2)}</pre>
                            </body>
                          </html>
                        `);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{relatorio.titulo}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline">{relatorio.tipo}</Badge>
                            <span className="text-sm text-muted-foreground">{relatorio.data}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="arquivo">
            <Card className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {obra.arquivoProjeto.nome}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tipo de Arquivo</p>
                      <p className="text-foreground font-medium">{obra.arquivoProjeto.tipo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tamanho</p>
                      <p className="text-foreground font-medium">{obra.arquivoProjeto.tamanho}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <UploadPhotoDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen}
        obraId={id || ""}
        onPhotoUploaded={handlePhotoUploaded}
      />
      <EditarObraDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        obra={obra}
        onObraUpdated={handleObraUpdated}
      />
      <GerenciarEquipeDialog 
        open={equipeDialogOpen} 
        onOpenChange={setEquipeDialogOpen} 
        obraId={Number(id)} 
        obraNome={obra.nome}
      />
    </div>
  );
};

export default ObraDetalhes;
