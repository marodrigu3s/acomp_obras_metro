/**
 * ========================================
 * SERVIÇO DE INTEGRAÇÃO COM BACKEND
 * ========================================
 * 
 * Configurado conforme documentação da API do backend.
 * Base URL: http://localhost:3000/api
 * 
 * IMPORTANTE: 
 * - Autenticação e usuários são SIMULADOS no front-end (localStorage)
 * - Apenas obras, fotos e arquivos BIM são integrados com backend real
 * 
 * PARA ALTERAR A URL DO BACKEND:
 * Modifique a constante BASE_URL abaixo
 */

// ============================================
// CONFIGURAÇÃO DA BASE URL
// ============================================
// 🔧 ALTERE AQUI para apontar para seu backend em produção
const BASE_URL = 'http://localhost:3000/api';

// ============================================
// HELPER: HEADERS DE AUTENTICAÇÃO
// ============================================
const getAuthHeaders = () => {
  const usuarioLogado = localStorage.getItem('usuarioLogado');
  let token = '';
  
  if (usuarioLogado) {
    const userData = JSON.parse(usuarioLogado);
    token = userData.token || '';
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// ============================================
// HELPER: CONVERSÃO DE DATAS
// ============================================
/**
 * Converte data de YYYY-MM-DD para DD-MM-YYYY (formato do backend)
 */
const formatDateToBackend = (date: string): string => {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
};

/**
 * Converte data de DD-MM-YYYY (backend) para YYYY-MM-DD (frontend)
 */
const formatDateToFrontend = (date: string): string => {
  if (!date) return '';
  const [day, month, year] = date.split('-');
  return `${year}-${month}-${day}`;
};

// ============================================
// HELPER: FAZER REQUISIÇÃO HTTP
// ============================================
const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
) => {
  try {
    const headers = {
      ...getAuthHeaders(),
      ...customHeaders,
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Para FormData (upload), remove Content-Type para o browser definir
        delete headers['Content-Type'];
        config.body = body;
      } else {
        config.body = JSON.stringify(body);
      }
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
      throw new Error(error.message || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error: any) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    return { data: null, error: error.message || 'Erro desconhecido' };
  }
};

// ============================================
// 1. OBRAS (PROJECTS)
// ============================================

/**
 * Criar nova obra com arquivo BIM
 * Endpoint: POST /api/projects
 * 
 * FormData fields:
 * - nome_obra: string (obrigatório)
 * - responsavel_obra: string (obrigatório)
 * - localizacao: string (obrigatório)
 * - previsao_termino: DD-MM-YYYY (obrigatório)
 * - observacoes: string (opcional)
 * - arquivo: arquivo BIM (obrigatório - .ifc, .rvt, .nwd, .nwc, .dwg, .dxf)
 */
export const criarObra = async (formData: FormData) => {
  // Converte a data de YYYY-MM-DD para DD-MM-YYYY
  const previsaoTermino = formData.get('previsao_termino');
  if (previsaoTermino && typeof previsaoTermino === 'string') {
    formData.set('previsao_termino', formatDateToBackend(previsaoTermino));
  }
  
  return apiRequest('/projects', 'POST', formData);
};

/**
 * Editar obra existente
 * Endpoint: PUT /api/projects/:id
 * NOTA: Backend aceita apenas nome_obra e localizacao
 */
export const editarObra = async (id: string, obraData: {
  nome_obra?: string;
  localizacao?: string;
}) => {
  return apiRequest(`/projects/${id}`, 'PUT', obraData);
};

/**
 * Listar todas as obras ativas
 * Endpoint: GET /api/projects
 * 
 * Resposta: Array de objetos com:
 * - id, nome_obra, responsavel_obra, localizacao, previsao_termino (DD-MM-YYYY),
 *   observacoes, progresso (0-100), status, created_at (DD-MM-YYYY)
 */
export const listarObras = async () => {
  const result = await apiRequest('/projects', 'GET');
  
  // Converte datas do backend (DD-MM-YYYY) para frontend (YYYY-MM-DD)
  if (result.data && Array.isArray(result.data)) {
    result.data = result.data.map((obra: any) => ({
      ...obra,
      previsao_termino: obra.previsao_termino ? formatDateToFrontend(obra.previsao_termino) : null,
      created_at: obra.created_at ? formatDateToFrontend(obra.created_at) : null,
    }));
  }
  
  return result;
};

/**
 * Obter detalhes completos de uma obra
 * Endpoint: GET /api/projects/:id
 * 
 * Resposta: Objeto com dados da obra (id, nome_obra, responsavel_obra, localizacao,
 * previsao_termino, observacoes, progresso, status, created_at)
 */
export const getObraDetalhes = async (id: string) => {
  const result = await apiRequest(`/projects/${id}`, 'GET');
  
  // Converte datas do backend (DD-MM-YYYY) para frontend (YYYY-MM-DD)
  if (result.data) {
    result.data = {
      ...result.data,
      previsao_termino: result.data.previsao_termino ? formatDateToFrontend(result.data.previsao_termino) : null,
      created_at: result.data.created_at ? formatDateToFrontend(result.data.created_at) : null,
    };
  }
  
  return result;
};

/**
 * Listar relatórios de uma obra
 * Endpoint: GET /api/reports/:obraId
 * 
 * Resposta: Array com relatórios (id, nome_relatorio, analysis_id, analyzed_at, 
 * overall_progress, sequence_number, created_at)
 */
export const listarRelatorios = async (obraId: string) => {
  const result = await apiRequest(`/reports/${obraId}`, 'GET');
  
  // Converte datas e formata dados
  if (result.data && Array.isArray(result.data)) {
    result.data = result.data.map((relatorio: any) => ({
      ...relatorio,
      // Mantém analyzed_at no formato original DD-MM-YYYY HH:mm:ss
      // Converte overall_progress de 0.0-1.0 para 0-100
      progresso: relatorio.overall_progress ? Math.round(relatorio.overall_progress * 100) : 0,
      data_criacao: relatorio.analyzed_at || relatorio.created_at,
      // Adiciona campo para download de PDF usando analysis_id
      arquivo_pdf: relatorio.analysis_id ? `/reports/analysis/${relatorio.analysis_id}` : null,
    }));
  }
  
  return result;
};

/**
 * DESABILITADO - Sistema de alertas removido
 * Listar alertas de uma obra
 * Endpoint: GET /alerts/:obraId
 */
/*
export const listarAlertas = async (obraId: string) => {
  return apiRequest(`/alerts/${obraId}`, 'GET');
};
*/

/**
 * Obter PDF de relatório
 * Endpoint: GET /api/reports/analysis/:analysisId
 * Retorna o PDF como blob
 */
export const getRelatorioPDF = async (analysisId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/reports/analysis/${analysisId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao obter PDF do relatório');
    }
    
    const blob = await response.blob();
    return { data: blob, error: null };
  } catch (error: any) {
    console.error('Erro ao obter PDF:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Deletar uma obra
 * Endpoint: DELETE /api/projects/:id
 * Remove automaticamente fotos, relatórios e arquivos BIM vinculados (CASCADE)
 */
export const deletarObra = async (id: string) => {
  return apiRequest(`/projects/${id}`, 'DELETE');
};

/**
 * Atualizar progresso de uma obra
 * Endpoint: PATCH /api/projects/:id/progress
 */
export const atualizarProgresso = async (id: string, progressData: {
  progresso: number; // 0 a 100
  status: 'planejamento' | 'em_andamento' | 'concluido' | 'pausado';
}) => {
  return apiRequest(`/projects/${id}/progress`, 'PATCH', progressData);
};

// ============================================
// 2. FOTOS
// ============================================

/**
 * Upload de foto para uma obra
 * Endpoint: POST /api/photos/:obraId
 * 
 * IMPORTANTE: Envia foto automaticamente para análise da IA VIRAG-BIM
 * Retorna resultado da análise e cria relatório automaticamente
 * 
 * FormData fields:
 * - foto: arquivo de imagem (obrigatório - .jpg, .jpeg, .png, .bmp, .tiff, max 10MB)
 * - nome_foto: string (obrigatório)
 * - descricao_foto: string (opcional)
 * - data_foto: DD-MM-YYYY (opcional, usa data atual se omitido)
 */
export const uploadFoto = async (
  obraId: string,
  foto: File,
  nome_foto: string,
  data_foto?: string,
  descricao_foto?: string
) => {
  const formData = new FormData();
  formData.append('foto', foto);
  formData.append('nome_foto', nome_foto);
  
  if (data_foto) {
    // Converte data de YYYY-MM-DD para DD-MM-YYYY
    formData.append('data_foto', formatDateToBackend(data_foto));
  }
  
  if (descricao_foto) {
    formData.append('descricao_foto', descricao_foto);
  }

  return apiRequest(`/photos/${obraId}`, 'POST', formData);
};

/**
 * Listar fotos de uma obra
 * Endpoint: GET /api/photos/:obraId
 * 
 * Resposta: Array com fotos (id, nome_foto, descricao_foto, data_foto, url_s3, obra_id, created_at)
 */
export const listarFotos = async (obraId: string) => {
  const result = await apiRequest(`/photos/${obraId}`, 'GET');
  
  // Mapeia campos do backend para o formato esperado pelo frontend
  if (result.data && Array.isArray(result.data)) {
    result.data = result.data.map((foto: any) => ({
      id_foto: foto.id,
      nome_foto: foto.nome_foto,
      descricao: foto.descricao_foto,
      data_upload: foto.data_foto ? formatDateToFrontend(foto.data_foto) : null,
      url_foto: foto.url_s3,
      status: 'analisada', // Todas as fotos são analisadas automaticamente
    }));
  }
  
  return result;
};

/**
 * Deletar uma foto
 * Endpoint: DELETE /api/photos/:id
 * Remove foto do banco e do S3
 */
export const deletarFoto = async (id: string) => {
  return apiRequest(`/photos/${id}`, 'DELETE');
};

// ============================================
// 3. ARQUIVOS BIM
// ============================================

/**
 * Upload de arquivo BIM para uma obra
 * Endpoint: POST /api/bim/:projectId
 * 
 * IMPORTANTE: Se já existir arquivo BIM, o antigo será deletado automaticamente
 * 
 * FormData fields:
 * - arquivo: arquivo BIM (.ifc, .rvt, .nwd, .nwc, .dwg, .dxf)
 * 
 * Sem limite de tamanho
 */
export const uploadArquivoBIM = async (projectId: string, arquivo: File) => {
  const formData = new FormData();
  formData.append('arquivo', arquivo);

  return apiRequest(`/bim/${projectId}`, 'POST', formData);
};

/**
 * Obter metadados do arquivo BIM de uma obra
 * Endpoint: GET /api/bim/:projectId
 * 
 * Resposta: Objeto com (id, nome_arquivo, tipo_arquivo, tamanho_arquivo, url_s3, obra_id, created_at)
 * ou erro 404 se não houver arquivo BIM
 */
export const listarArquivosBIM = async (projectId: string) => {
  const result = await apiRequest(`/bim/${projectId}`, 'GET');
  
  // Retorna array para manter compatibilidade com código existente
  if (result.data && !Array.isArray(result.data)) {
    result.data = [result.data];
  }
  
  return result;
};

/**
 * Obter URL pré-assinada para download de arquivo BIM
 * Endpoint: GET /api/bim/download/:projectId
 * 
 * Resposta: { downloadUrl: string (válida por 1 hora), expiresIn: string }
 */
export const downloadArquivoBIM = async (projectId: string) => {
  return apiRequest(`/bim/download/${projectId}`, 'GET');
};

/**
 * Deletar arquivo BIM de uma obra
 * Endpoint: DELETE /api/bim/:projectId
 */
export const deletarArquivoBIM = async (projectId: string) => {
  return apiRequest(`/bim/${projectId}`, 'DELETE');
};

// ============================================
// ⚠️ AUTENTICAÇÃO E USUÁRIOS - APENAS SIMULAÇÃO
// ============================================
// IMPORTANTE: Estas funcionalidades são SIMULADAS no front-end usando localStorage.
// NÃO há integração real com backend para autenticação e gerenciamento de usuários.
// 
// As seguintes funcionalidades continuam usando localStorage:
// - Login/Logout (páginas Login.tsx e Cadastro.tsx)
// - Gerenciamento de usuários (página Usuarios.tsx)
// - Perfil de usuário (página Perfil.tsx)
// - Gerenciamento de equipes (componente GerenciarEquipeDialog.tsx)
// 
// Não é necessário alterar nada nessas páginas/componentes.
