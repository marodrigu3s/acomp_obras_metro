# 📋 Guia de Integração com Backend

## ✅ Status da Configuração

O arquivo `src/services/api.ts` foi configurado com base na documentação oficial da API do backend.

### **Funcionalidades do Sistema:**

#### 🔌 **Integração Real com Backend**
- ✅ Obras (Projects) - CRUD completo
- ✅ Fotos - Upload, listagem e exclusão
- ✅ Arquivos BIM - Upload e listagem

#### 💾 **Simulação Local (localStorage)**
- ⚠️ Autenticação (login/logout)
- ⚠️ Gerenciamento de usuários
- ⚠️ Perfil de usuário
- ⚠️ Gerenciamento de equipes
- ⚠️ Relatórios
- ⚠️ Alertas
- ⚠️ Estatísticas do dashboard

---

## 🔧 Configuração Inicial

### 1. Alterar Base URL

Edite o arquivo `src/services/api.ts` e altere a constante `BASE_URL`:

```typescript
// Linha 20 do arquivo src/services/api.ts
const BASE_URL = 'http://localhost:3000/api'; // 🔧 Altere aqui
```

**Exemplos:**
- Desenvolvimento local: `http://localhost:3000/api`
- Produção: `https://api.metrosp.com.br/api`

---

## 📡 Endpoints Documentados

### 1. **Obras (Projects)**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/projects` | Criar nova obra |
| PUT | `/projects/:id` | Editar obra |
| GET | `/projects` | Listar obras ativas |
| GET | `/projects/:id` | Detalhes da obra |
| DELETE | `/projects/:id` | Deletar obra |
| PATCH | `/projects/:id/progress` | Atualizar progresso |

### 2. **Fotos**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/photos/:obraId` | Upload de foto |
| GET | `/photos/:obraId` | Listar fotos |
| DELETE | `/photos/:id` | Deletar foto |

### 3. **Arquivos BIM**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/bim/:obraId` | Upload de arquivo BIM |
| GET | `/bim/:obraId` | Listar arquivos BIM |

---

## 🔄 Como Integrar nos Componentes

### **Dashboard.tsx**

**Substituir:**
```typescript
// ANTES (usando localStorage)
const obras = JSON.parse(localStorage.getItem('obras') || '[]');
```

**Por:**
```typescript
// DEPOIS (usando API)
import { listarObras } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const [obras, setObras] = useState([]);
const [loading, setLoading] = useState(true);
const { toast } = useToast();

useEffect(() => {
  const carregarObras = async () => {
    setLoading(true);
    const { data, error } = await listarObras();
    
    if (error) {
      toast({
        title: "Erro ao carregar obras",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    setObras(data.projects || []);
    setLoading(false);
  };
  
  carregarObras();
}, []);
```

---

### **ObraDetalhes.tsx**

**Substituir:**
```typescript
// ANTES
const obra = obras.find(o => o.id === id);
const fotos = [...]; // dados mockados
const relatorios = [...]; // dados mockados
const arquivos_bim = [...]; // dados mockados
```

**Por:**
```typescript
import { getObraDetalhes } from '@/services/api';

const [obra, setObra] = useState(null);
const [fotos, setFotos] = useState([]);
const [relatorios, setRelatorios] = useState([]);
const [arquivosBIM, setArquivosBIM] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const carregarDetalhes = async () => {
    setLoading(true);
    const { data, error } = await getObraDetalhes(id);
    
    if (error) {
      toast({
        title: "Erro ao carregar detalhes",
        description: error,
        variant: "destructive"
      });
      return;
    }
    
    setObra(data.obra);
    setFotos(data.fotos || []);
    setRelatorios(data.relatorios || []); // Ainda pode vir vazio se não documentado
    setArquivosBIM(data.arquivos_bim || []);
    setLoading(false);
  };
  
  carregarDetalhes();
}, [id]);
```

---

### **NovaObraDialog.tsx**

**Substituir:**
```typescript
// ANTES
const novaObra = {
  id: Date.now().toString(),
  nome: formData.nome,
  localizacao: formData.localizacao,
  // ...
};
const obrasAtualizadas = [...obras, novaObra];
localStorage.setItem('obras', JSON.stringify(obrasAtualizadas));
```

**Por:**
```typescript
import { criarObra } from '@/services/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  const { data, error } = await criarObra({
    nome_obra: formData.nome,
    responsavel_obra: formData.responsavel,
    localizacao: formData.localizacao,
    previsao_termino: formData.dataTermino, // YYYY-MM-DD
    observacoes: formData.observacoes
  });

  if (error) {
    toast({
      title: "Erro ao criar obra",
      description: error,
      variant: "destructive"
    });
    setLoading(false);
    return;
  }

  toast({
    title: "Obra criada com sucesso!",
  });
  
  onObraCriada(); // Recarregar lista
  setOpen(false);
  setLoading(false);
};
```

---

### **EditarObraDialog.tsx**

**Substituir:**
```typescript
// ANTES
const obrasAtualizadas = obras.map(o => 
  o.id === obra.id ? { ...o, ...dadosEditados } : o
);
localStorage.setItem('obras', JSON.stringify(obrasAtualizadas));
```

**Por:**
```typescript
import { editarObra } from '@/services/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  const { data, error } = await editarObra(obra.id, {
    nome_obra: formData.nome,
    localizacao: formData.localizacao,
    responsavel_obra: formData.responsavel,
    previsao_termino: formData.dataTermino,
    observacoes: formData.observacoes
  });

  if (error) {
    toast({
      title: "Erro ao editar obra",
      description: error,
      variant: "destructive"
    });
    setLoading(false);
    return;
  }

  toast({
    title: "Obra atualizada com sucesso!",
  });
  
  onObraEditada();
  setOpen(false);
  setLoading(false);
};
```

---

### **UploadPhotoDialog.tsx**

**Substituir:**
```typescript
// ANTES
const novaFoto = {
  id: Date.now(),
  titulo: formData.titulo,
  data: formData.data,
  url: URL.createObjectURL(file)
};
```

**Por:**
```typescript
import { uploadFoto } from '@/services/api';

const handleUpload = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!arquivo) {
    toast({
      title: "Selecione uma foto",
      variant: "destructive"
    });
    return;
  }
  
  setLoading(true);
  
  const { data, error } = await uploadFoto(
    obraId,
    arquivo, // File object
    formData.titulo,
    formData.data, // YYYY-MM-DD
    formData.descricao
  );

  if (error) {
    toast({
      title: "Erro no upload da foto",
      description: error,
      variant: "destructive"
    });
    setLoading(false);
    return;
  }

  toast({
    title: "Foto enviada com sucesso!",
  });
  
  onFotoUpload(); // Recarregar lista
  setOpen(false);
  setLoading(false);
};
```

---

## 📝 Estrutura de Dados Esperada

### **Obra**
```typescript
{
  id: string;
  nome_obra: string;
  responsavel_obra: string;
  localizacao: string;
  data_inicio: string; // DD-MM-YYYY
  previsao_termino: string; // DD-MM-YYYY
  observacoes?: string;
  status: 'em andamento' | 'finalizado';
  progresso: number; // 0.00 a 100.00
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### **Foto**
```typescript
{
  id: number;
  obra_id: string;
  nome_foto: string;
  descricao_foto?: string;
  data_foto: string; // YYYY-MM-DD
  url_s3: string; // URL completa da imagem
  created_at: string; // ISO 8601
}
```

### **Arquivo BIM**
```typescript
{
  id: number;
  obra_id: string;
  nome_arquivo: string;
  tipo_arquivo: string;
  tamanho_arquivo: number; // em bytes
  url_s3: string; // URL completa do arquivo
  created_at: string; // ISO 8601
}
```

---

## 💾 Funcionalidades Simuladas (localStorage)

As seguintes funcionalidades **NÃO** se conectam ao backend e continuam usando `localStorage`:

### **Login e Autenticação**
- `src/pages/Login.tsx` - Sistema de login simulado
- `src/pages/Cadastro.tsx` - Cadastro de novos usuários
- Dados salvos em: `localStorage.getItem('usuarioLogado')`

### **Gerenciamento de Usuários**
- `src/pages/Usuarios.tsx` - Lista e gerencia usuários
- Dados salvos em: `localStorage.getItem('usuarios')`

### **Perfil**
- `src/pages/Perfil.tsx` - Edição de perfil do usuário logado

### **Equipes**
- `src/components/GerenciarEquipeDialog.tsx` - Gerenciamento de equipes por obra

### **Relatórios e Alertas**
- Arrays mockados em `src/pages/ObraDetalhes.tsx`
- Não há endpoints no backend para esses recursos ainda

---

## 🚨 Tratamento de Erros

Todas as funções da API retornam:
```typescript
{ data: any | null, error: string | null }
```

**Sempre verifique erros:**
```typescript
const { data, error } = await criarObra(dados);

if (error) {
  toast({
    title: "Erro",
    description: error,
    variant: "destructive"
  });
  return;
}

// Sucesso - use 'data'
console.log(data);
```

---

## 📊 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `404` - Recurso não encontrado
- `409` - Conflito (ID duplicado)
- `500` - Erro interno do servidor

---

## 🎯 Próximos Passos para Integração

1. ✅ Alterar `BASE_URL` no `api.ts`
2. ✅ Integrar **Dashboard** com `listarObras()`
3. ✅ Integrar **ObraDetalhes** com `getObraDetalhes()`
4. ✅ Integrar **NovaObraDialog** com `criarObra()`
5. ✅ Integrar **EditarObraDialog** com `editarObra()`
6. ✅ Integrar **UploadPhotoDialog** com `uploadFoto()`
7. ✅ Adicionar loading states em todos os componentes
8. ✅ Testar cada funcionalidade integrada
9. ⚠️ Manter autenticação e usuários usando localStorage (simulado)

---

## ⚠️ Importante

- **Autenticação e usuários** continuam simulados no front-end
- **NÃO altere** as páginas: `Login.tsx`, `Cadastro.tsx`, `Usuarios.tsx`, `Perfil.tsx`
- **NÃO altere** o componente: `GerenciarEquipeDialog.tsx`
- Essas funcionalidades não serão integradas com o backend

---

## 📞 Suporte

Em caso de dúvidas sobre os endpoints ou estrutura de dados, entre em contato com a equipe de backend.
