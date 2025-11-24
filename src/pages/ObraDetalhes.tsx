import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { getObraDetalhes, deletarFoto, listarRelatorios /*, listarAlertas */ } from "@/services/api";
import { toast } from "sonner";

const ObraDetalhes = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [equipeDialogOpen, setEquipeDialogOpen] = useState(false);
  const [relatorioDialogOpen, setRelatorioDialogOpen] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<any>(null);
  const [fotoSelecionada, setFotoSelecionada] = useState<any>(null);
  const [fotoDialogOpen, setFotoDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [searchFotos, setSearchFotos] = useState("");
  const [obra, setObra] = useState<any>(null);
  const [fotos, setFotos] = useState<any[]>([]);
  const [arquivosBIM, setArquivosBIM] = useState<any[]>([]);
  const [relatorios, setRelatorios] = useState<any[]>([]);
  // const [alertas, setAlertas] = useState<any[]>([]); // DESABILITADO - Sistema de alertas removido
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
      // Formatar dados da obra - normalizar formato da API
      const obraData = resultado.data.obra || resultado.data;
      const obraFormatada = {
        id: obraData.id_obra,
        nome: obraData.nome_obra,
        engenheiro: obraData.engenheiro_responsavel,
        localizacao: obraData.localizacao,
        previsaoTermino: new Date(obraData.previsao_termino).toLocaleDateString("pt-BR"),
        status: obraData.status,
        progresso: obraData.progresso,
      };
      setObra(obraFormatada);

      // Formatar fotos
      const fotosFormatadas = (resultado.data.fotos || []).map((foto: any) => ({
        id: foto.id_foto,
        titulo: foto.nome_foto,
        data: new Date(foto.data_upload).toLocaleDateString("pt-BR"),
        camera: foto.localizacao || "Não especificado",
        analise: foto.descricao || "Análise pendente",
        status: foto.status || "aprovado",
        url: foto.url_foto,
      }));
      setFotos(fotosFormatadas);

      // Formatar arquivos BIM
      const arquivosFormatados = (resultado.data.arquivos_bim || []).map((arquivo: any) => ({
        id: arquivo.id_arquivo,
        nome: arquivo.nome_arquivo,
        tamanho: `${(arquivo.tamanho / (1024 * 1024)).toFixed(2)} MB`,
        tipo: arquivo.tipo_arquivo,
        dataUpload: new Date(arquivo.data_upload).toLocaleDateString("pt-BR"),
        url: arquivo.url_arquivo,
      }));
      setArquivosBIM(arquivosFormatados);

      // Buscar relatórios e alertas
      await carregarRelatoriosEAlertas(id, fotosFormatadas);
    }
    setLoading(false);
  };

  const carregarRelatoriosEAlertas = async (obraId: string, fotosData: any[]) => {
    // Buscar relatórios
    const resultadoRelatorios = await listarRelatorios(obraId);
    if (!resultadoRelatorios.error && resultadoRelatorios.data) {
      const relatoriosFormatados = (resultadoRelatorios.data.relatorios || []).map((relatorio: any) => {
        const dataRelatorio = new Date(relatorio.data_criacao);
        const titulo = `Relatório de Progresso - ${dataRelatorio.toLocaleDateString("pt-BR")}`;
        
        // Contar quantas fotos existiam até a data deste relatório
        const fotosAteRelatorio = fotosData.filter((foto: any) => {
          const dataFoto = foto.data.split('/').reverse().join('-'); // Converter DD/MM/YYYY para YYYY-MM-DD
          const dataRel = relatorio.data_criacao.split('T')[0]; // Pegar apenas a data sem hora
          return dataFoto <= dataRel;
        }).length;
        
        return {
          id: relatorio.id_relatorio,
          titulo: titulo,
          data: dataRelatorio.toLocaleDateString("pt-BR"),
          totalFotos: fotosAteRelatorio,
          arquivo_pdf: relatorio.arquivo_pdf || null,
          status: relatorio.status || "Em Andamento",
          descricao: relatorio.descricao || "Relatório de acompanhamento da obra.",
        };
      });
      setRelatorios(relatoriosFormatados);
    } else {
      setRelatorios([]);
    }

    // DESABILITADO - Sistema de alertas removido
    /* 
    // Buscar alertas
    const resultadoAlertas = await listarAlertas(obraId);
    if (!resultadoAlertas.error && resultadoAlertas.data) {
      const alertasFormatados = (resultadoAlertas.data.alertas || []).map((alerta: any) => ({
        id: alerta.id_alerta,
        mensagem: alerta.mensagem,
        gravidade: alerta.gravidade,
        data: new Date(alerta.data_criacao).toLocaleDateString('pt-BR'),
      }));
      setAlertas(alertasFormatados);
    } else {
      setAlertas([]);
    }
    */
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
              <div className="flex items-center justify-center w-18 h-12 bg-white rounded-lg p-1.5">
                <img src={metroLogo} alt="Metrô São Paulo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{obra.nome}</h1>
                <p className="text-sm text-muted-foreground">{obra.localizacao}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={`${obra.status === "ongoing" ? "bg-status-ongoing/10 text-status-ongoing" : "bg-status-completed/10 text-status-completed"} border-0 px-4 py-2`}
              >
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
                <p className="text-sm text-muted-foreground mb-1">Localização</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <p className="text-foreground">{obra.localizacao}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* DESABILITADO - Sistema de alertas removido */}
          {/*
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-semibold text-lg text-foreground mb-4">Alertas e Observações</h3>
            {alertas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum alerta no momento</p>
              </div>
            ) : (
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
            )}
          </Card>
          */}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="relatorios" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            <TabsTrigger value="fotos">Fotos Analisadas</TabsTrigger>
            <TabsTrigger value="arquivo">Arquivo do Projeto</TabsTrigger>
          </TabsList>

          <TabsContent value="relatorios">
            {relatorios.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum relatório disponível</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatorios.map((relatorio) => (
                  <Card 
                    key={relatorio.id} 
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => {
                      setRelatorioSelecionado(relatorio);
                      setRelatorioDialogOpen(true);
                    }}
                  >
                    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border-b border-border/50">
                      <div className="flex items-start justify-between mb-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          {relatorio.data}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {relatorio.titulo}
                      </h3>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrainFront className="w-4 h-4" />
                          <span className="font-medium">Obra:</span>
                        </div>
                        <p className="text-foreground font-medium">{obra?.nome}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium">Progresso:</span>
                          </div>
                          <span className="font-bold text-primary">{obra?.progresso}%</span>
                        </div>
                        <Progress value={obra?.progresso} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Camera className="w-4 h-4" />
                          <span>Fotos Analisadas:</span>
                        </div>
                        <span className="font-bold text-foreground">{relatorio.totalFotos || 0}</span>
                      </div>

                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

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
                .filter(
                  (foto) =>
                    foto.titulo.toLowerCase().includes(searchFotos.toLowerCase()) ||
                    foto.camera.toLowerCase().includes(searchFotos.toLowerCase()) ||
                    foto.analise.toLowerCase().includes(searchFotos.toLowerCase()),
                )
                .map((foto) => (
                  <Card 
                    key={foto.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setFotoSelecionada(foto);
                      setFotoDialogOpen(true);
                    }}
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      {foto.url ? (
                        <img 
                          src={foto.url} 
                          alt={foto.titulo} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-12 h-12 text-primary/30" />
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-foreground mb-2">{foto.titulo}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{foto.analise}</p>
                    </div>
                  </Card>
                ))}
            </div>
            {fotos.filter(
              (foto) =>
                foto.titulo.toLowerCase().includes(searchFotos.toLowerCase()) ||
                foto.camera.toLowerCase().includes(searchFotos.toLowerCase()) ||
                foto.analise.toLowerCase().includes(searchFotos.toLowerCase()),
            ).length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma foto encontrada</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="arquivo">
            <Card className="p-6">
              {arquivosBIM.length > 0 ? (
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{arquivosBIM[0].nome}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tipo de Arquivo</p>
                        <p className="text-foreground font-medium">{arquivosBIM[0].tipo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tamanho</p>
                        <p className="text-foreground font-medium">{arquivosBIM[0].tamanho}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum arquivo BIM disponível</p>
                </div>
              )}
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

      {/* Dialog de Detalhes do Relatório */}
      <Dialog open={relatorioDialogOpen} onOpenChange={setRelatorioDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              {relatorioSelecionado?.titulo}
            </DialogTitle>
          </DialogHeader>
          
          {relatorioSelecionado && obra && (
            <div className="space-y-6 py-4">
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-background">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <span className="font-semibold text-lg text-foreground">Progresso da Obra</span>
                  </div>
                  <span className="text-4xl font-bold text-primary">{obra.progresso}%</span>
                </div>
                <Progress value={obra.progresso} className="h-3" />
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border-l-4 border-l-primary">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <TrainFront className="w-4 h-4" />
                    <span className="font-medium">Obra</span>
                  </div>
                  <p className="text-lg font-bold text-foreground truncate" title={obra.nome}>
                    {obra.nome}
                  </p>
                </Card>

                <Card className="p-4 border-l-4 border-l-primary">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Localização</span>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate" title={obra.localizacao}>
                    {obra.localizacao}
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Camera className="w-4 h-4" />
                    <span className="font-medium">Fotos Analisadas</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{relatorioSelecionado.totalFotos || 0}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Status</span>
                  </div>
                  <Badge variant={
                    relatorioSelecionado.status === "Concluído" ? "default" :
                    relatorioSelecionado.status === "Em Andamento" ? "secondary" :
                    "outline"
                  } className="text-sm">
                    {relatorioSelecionado.status}
                  </Badge>
                </Card>
              </div>

              {relatorioSelecionado.descricao && (
                <Card className="p-4 bg-muted/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Descrição</span>
                  </div>
                  <p className="text-sm text-foreground">{relatorioSelecionado.descricao}</p>
                </Card>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setRelatorioDialogOpen(false)}
                >
                  Fechar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    if (relatorioSelecionado.arquivo_pdf) {
                      window.open(relatorioSelecionado.arquivo_pdf, '_blank');
                      toast.success("Baixando relatório PDF");
                    } else {
                      toast.error("Arquivo PDF não disponível", {
                        description: "O PDF deste relatório ainda não foi gerado pelo backend.",
                      });
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização de Foto */}
      <Dialog open={fotoDialogOpen} onOpenChange={setFotoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 pr-8">
              <Camera className="w-5 h-5 text-primary" />
              {fotoSelecionada?.titulo}
            </DialogTitle>
          </DialogHeader>
          
          {fotoSelecionada && (
            <div className="space-y-4">
              <div className="w-full bg-muted/30 rounded-lg overflow-hidden">
                {fotoSelecionada.url ? (
                  <img 
                    src={fotoSelecionada.url} 
                    alt={fotoSelecionada.titulo}
                    className="w-full h-auto max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <Camera className="w-24 h-24 text-primary/30" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Descrição</h4>
                <p className="text-muted-foreground">{fotoSelecionada.analise}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setFotoDialogOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ObraDetalhes;
