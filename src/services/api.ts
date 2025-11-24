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
 * Endpoint: POST /projects
 * 
 * FormData fields:
 * - nome_obra: string (obrigatório)
 * - responsavel_obra: string (obrigatório)
 * - localizacao: string (obrigatório)
 * - previsao_termino: YYYY-MM-DD (obrigatório)
 * - observacoes: string (opcional)
 * - arquivo: arquivo BIM (obrigatório - .ifc, .rvt, .nwd, .nwc, .dwg, .dxf)
 */
export const criarObra = async (formData: FormData) => {
  return apiRequest('/projects', 'POST', formData);
};

/**
 * Editar obra existente
 * Endpoint: PUT /projects/:id
 */
export const editarObra = async (id: string, obraData: {
  nome_obra?: string;
  localizacao?: string;
  responsavel_obra?: string;
  previsao_termino?: string;
  observacoes?: string;
}) => {
  return apiRequest(`/projects/${id}`, 'PUT', obraData);
};

/**
 * Listar todas as obras ativas
 * Endpoint: GET /projects
 * 
 * Resposta: { projects: Array<{ nome_projeto, progresso, status, nome_engenheiro_responsavel }> }
 */
export const listarObras = async () => {
  return apiRequest('/projects', 'GET');
};

/**
 * Obter detalhes completos de uma obra
 * Endpoint: GET /projects/:id
 * 
 * Resposta: { obra, fotos, relatorios, alertas, arquivos_bim }
 */
export const getObraDetalhes = async (id: string) => {
  return apiRequest(`/projects/${id}`, 'GET');
};

/**
 * Listar relatórios de uma obra
 * Endpoint: GET /reports/:obraId
 */
export const listarRelatorios = async (obraId: string) => {
  return apiRequest(`/reports/${obraId}`, 'GET');
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
 * Deletar uma obra
 * Endpoint: DELETE /projects/:id
 */
export const deletarObra = async (id: string) => {
  return apiRequest(`/projects/${id}`, 'DELETE');
};

/**
 * Atualizar progresso de uma obra
 * Endpoint: PATCH /projects/:id/progress
 */
export const atualizarProgresso = async (id: string, progressData: {
  progresso: number; // 0.00 a 100.00
  status: 'em andamento' | 'finalizado';
}) => {
  return apiRequest(`/projects/${id}/progress`, 'PATCH', progressData);
};

// ============================================
// 2. FOTOS
// ============================================

/**
 * Upload de foto para uma obra
 * Endpoint: POST /photos/:obraId
 * 
 * FormData fields:
 * - foto: arquivo de imagem (obrigatório)
 * - nome_foto: string (obrigatório)
 * - descricao_foto: string (opcional)
 * - data_foto: YYYY-MM-DD (obrigatório)
 */
export const uploadFoto = async (
  obraId: string,
  foto: File,
  nome_foto: string,
  data_foto: string,
  descricao_foto?: string
) => {
  const formData = new FormData();
  formData.append('foto', foto);
  formData.append('nome_foto', nome_foto);
  formData.append('data_foto', data_foto);
  if (descricao_foto) {
    formData.append('descricao_foto', descricao_foto);
  }

  return apiRequest(`/photos/${obraId}`, 'POST', formData);
};

/**
 * Listar fotos de uma obra
 * Endpoint: GET /photos/:obraId
 */
export const listarFotos = async (obraId: string) => {
  return apiRequest(`/photos/${obraId}`, 'GET');
};

/**
 * Deletar uma foto
 * Endpoint: DELETE /photos/:id
 */
export const deletarFoto = async (id: string) => {
  return apiRequest(`/photos/${id}`, 'DELETE');
};

// ============================================
// 3. ARQUIVOS BIM
// ============================================

/**
 * Upload de arquivo BIM para uma obra
 * Endpoint: POST /bim/:obraId
 * 
 * FormData fields:
 * - arquivo: arquivo BIM (.ifc, .rvt, .nwd, .nwc, .dwg, .dxf)
 * 
 * Limite: 100MB
 */
export const uploadArquivoBIM = async (obraId: string, arquivo: File) => {
  const formData = new FormData();
  formData.append('arquivo', arquivo);

  return apiRequest(`/bim/${obraId}`, 'POST', formData);
};

/**
 * Listar arquivos BIM de uma obra
 * Endpoint: GET /bim/:obraId
 */
export const listarArquivosBIM = async (obraId: string) => {
  return apiRequest(`/bim/${obraId}`, 'GET');
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
