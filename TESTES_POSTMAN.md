# Guia de Testes no Postman

## Configuração Inicial

### Base URL
```
http://localhost:3000/api
```
(Ajuste conforme seu ambiente: produção, desenvolvimento, etc.)

### Headers Comuns
Para todas as requisições que enviam JSON:
```
Content-Type: application/json
```

---

## 1. PROJETOS (OBRAS)

### 1.1 Criar Projeto
**POST** `/projects`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nome_obra": "Estação Vila Prudente",
  "localizacao": "Av. Prof. Luiz Ignácio Anhaia Mello, 5555",
  "engenheiro_responsavel": "João Silva",
  "data_inicio": "2024-01-15",
  "status": "em_andamento",
  "progresso": 45
}
```

**Resposta Esperada (200):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome_obra": "Estação Vila Prudente",
    "localizacao": "Av. Prof. Luiz Ignácio Anhaia Mello, 5555",
    "engenheiro_responsavel": "João Silva",
    "data_inicio": "2024-01-15",
    "status": "em_andamento",
    "progresso": 45,
    "criado_em": "2024-01-15T10:30:00Z"
  },
  "error": null
}
```

---

### 1.2 Listar Todos os Projetos
**GET** `/projects`

**Sem Body**

**Resposta Esperada (200):**
```json
{
  "data": {
    "projects": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "nome_obra": "Estação Vila Prudente",
        "localizacao": "Av. Prof. Luiz Ignácio Anhaia Mello, 5555",
        "engenheiro_responsavel": "João Silva",
        "data_inicio": "2024-01-15",
        "status": "em_andamento",
        "progresso": 45,
        "criado_em": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "error": null
}
```

---

### 1.3 Obter Detalhes de um Projeto
**GET** `/projects/:id`

Exemplo: `/projects/550e8400-e29b-41d4-a716-446655440000`

**Sem Body**

**Resposta Esperada (200):**
```json
{
  "data": {
    "obra": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nome_obra": "Estação Vila Prudente",
      "localizacao": "Av. Prof. Luiz Ignácio Anhaia Mello, 5555",
      "engenheiro_responsavel": "João Silva",
      "data_inicio": "2024-01-15",
      "status": "em_andamento",
      "progresso": 45
    },
    "fotos": [
      {
        "id": "foto-001",
        "url_foto": "https://...",
        "nome_foto": "Fundação Norte",
        "data_foto": "2024-01-20",
        "descricao_foto": "Conclusão das vigas"
      }
    ],
    "arquivos_bim": [
      {
        "id": "bim-001",
        "url_arquivo": "https://...",
        "nome_arquivo": "modelo_estrutural.ifc"
      }
    ]
  },
  "error": null
}
```

---

### 1.4 Editar Projeto
**PUT** `/projects/:id`

Exemplo: `/projects/550e8400-e29b-41d4-a716-446655440000`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nome_obra": "Estação Vila Prudente - Atualizada",
  "localizacao": "Av. Prof. Luiz Ignácio Anhaia Mello, 5555",
  "engenheiro_responsavel": "Maria Santos",
  "data_inicio": "2024-01-15",
  "status": "em_andamento",
  "progresso": 60
}
```

**Resposta Esperada (200):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome_obra": "Estação Vila Prudente - Atualizada",
    "progresso": 60,
    "atualizado_em": "2024-01-25T14:20:00Z"
  },
  "error": null
}
```

---

### 1.5 Deletar Projeto
**DELETE** `/projects/:id`

Exemplo: `/projects/550e8400-e29b-41d4-a716-446655440000`

**Sem Body**

**Resposta Esperada (200):**
```json
{
  "data": {
    "message": "Projeto deletado com sucesso"
  },
  "error": null
}
```

---

### 1.6 Atualizar Progresso do Projeto
**PATCH** `/projects/:id/progress`

Exemplo: `/projects/550e8400-e29b-41d4-a716-446655440000/progress`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "progresso": 75,
  "status": "em_andamento"
}
```

**Resposta Esperada (200):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "progresso": 75,
    "status": "em_andamento",
    "atualizado_em": "2024-01-30T16:45:00Z"
  },
  "error": null
}
```

---

## 2. FOTOS

### 2.1 Upload de Foto
**POST** `/projects/:project_id/photos`

Exemplo: `/projects/550e8400-e29b-41d4-a716-446655440000/photos`

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data):**
```
foto: [selecione o arquivo de imagem]
nome_foto: Fundação Setor A
data_foto: 2024-01-20
descricao_foto: Concretagem finalizada
```

**Resposta Esperada (200):**
```json
{
  "data": {
    "id": "foto-123",
    "url_foto": "https://storage.example.com/fotos/foto-123.jpg",
    "nome_foto": "Fundação Setor A",
    "data_foto": "2024-01-20",
    "descricao_foto": "Concretagem finalizada",
    "criado_em": "2024-01-20T10:30:00Z"
  },
  "error": null
}
```

---

### 2.2 Listar Fotos de um Projeto
**GET** `/projects/:project_id/photos`

Exemplo: `/projects/550e8400-e29b-41d4-a716-446655440000/photos`

**Sem Body**

**Resposta Esperada (200):**
```json
{
  "data": {
    "fotos": [
      {
        "id": "foto-123",
        "url_foto": "https://storage.example.com/fotos/foto-123.jpg",
        "nome_foto": "Fundação Setor A",
        "data_foto": "2024-01-20",
        "descricao_foto": "Concretagem finalizada",
        "criado_em": "2024-01-20T10:30:00Z"
      }
    ]
  },
  "error": null
}
```

---

### 2.3 Deletar Foto
**DELETE** `/photos/:id`

Exemplo: `/photos/foto-123`

**Sem Body**

**Resposta Esperada (200):**
```json
{
  "data": {
    "message": "Foto deletada com sucesso"
  },
  "error": null
}
```

---

## 3. ARQUIVOS BIM

### 3.1 Upload de Arquivo BIM
**POST** `/projects/:project_id/bim-files`

Exemplo: `/projects/550e8400-e29b-41d4-a716-446655440000/bim-files`

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data):**
```
arquivo: [selecione o arquivo .ifc, .rvt, etc.]
```

**Resposta Esperada (200):**
```json
{
  "data": {
    "id": "bim-456",
    "url_arquivo": "https://storage.example.com/bim/modelo.ifc",
    "nome_arquivo": "modelo_estrutural.ifc",
    "tamanho": 15728640,
    "criado_em": "2024-01-20T11:00:00Z"
  },
  "error": null
}
```

---

### 3.2 Listar Arquivos BIM de um Projeto
**GET** `/projects/:project_id/bim-files`

Exemplo: `/projects/550e8400-e29b-41d4-a716-446655440000/bim-files`

**Sem Body**

**Resposta Esperada (200):**
```json
{
  "data": {
    "arquivos": [
      {
        "id": "bim-456",
        "url_arquivo": "https://storage.example.com/bim/modelo.ifc",
        "nome_arquivo": "modelo_estrutural.ifc",
        "tamanho": 15728640,
        "criado_em": "2024-01-20T11:00:00Z"
      }
    ]
  },
  "error": null
}
```

---

## 4. TRATAMENTO DE ERROS

### Erro 400 - Bad Request
```json
{
  "data": null,
  "error": "Dados inválidos: nome_obra é obrigatório"
}
```

### Erro 404 - Not Found
```json
{
  "data": null,
  "error": "Projeto não encontrado"
}
```

### Erro 500 - Internal Server Error
```json
{
  "data": null,
  "error": "Erro interno do servidor"
}
```

---

## 5. DICAS PARA TESTES

### Fluxo Completo de Teste:
1. **Criar um projeto** (POST `/projects`)
2. **Listar projetos** (GET `/projects`) - verificar se o projeto aparece
3. **Obter detalhes** (GET `/projects/:id`) - verificar dados completos
4. **Upload de foto** (POST `/projects/:id/photos`) - adicionar foto
5. **Upload de BIM** (POST `/projects/:id/bim-files`) - adicionar arquivo
6. **Listar fotos** (GET `/projects/:id/photos`) - verificar lista
7. **Atualizar progresso** (PATCH `/projects/:id/progress`) - alterar status
8. **Editar projeto** (PUT `/projects/:id`) - modificar dados
9. **Deletar foto** (DELETE `/photos/:id`) - remover foto
10. **Deletar projeto** (DELETE `/projects/:id`) - remover projeto

### Variáveis de Ambiente no Postman:
Crie variáveis para facilitar os testes:
- `{{base_url}}` = `http://localhost:3000/api`
- `{{project_id}}` = `550e8400-e29b-41d4-a716-446655440000`
- `{{foto_id}}` = `foto-123`

### Como Usar:
Use `{{base_url}}/projects` em vez de digitar a URL completa sempre.

---

## 6. OBSERVAÇÕES IMPORTANTES

⚠️ **Autenticação e Usuários NÃO estão integrados ao backend**
- Login, cadastro e gerenciamento de usuários são simulados no localStorage
- Não existem rotas de autenticação no backend
- Não é necessário enviar tokens de autenticação

✅ **Funcionalidades Integradas:**
- Projetos (CRUD completo)
- Fotos (Upload, Listagem, Deleção)
- Arquivos BIM (Upload, Listagem)

📝 **Formatos de Data:**
- Use formato ISO 8601: `YYYY-MM-DD`
- Exemplo: `2024-01-20`
