# AulaLog

Uma aplicação web completa para registro de aulas assistidas por estudantes.

![AulaLog](https://via.placeholder.com/800x420/4f46e5/ffffff?text=AulaLog)

## ✨ Funcionalidades

- **Autenticação completa**: Login, Cadastro e Recuperação de senha (simulada)
- **CRUD de Aulas**: Criar, visualizar, editar e excluir registros
- **Dashboard com estatísticas**: Total de aulas, disciplinas únicas e última aula
- **Busca em tempo real** por disciplina, título ou professor
- **Interface responsiva** com cards elegantes (mobile-first)
- **Modo Demo** persistente com localStorage
- **Validações**: Resumo mínimo de 30 caracteres, campos obrigatórios
- **Feedbacks visuais**: Toasts e alertas em todas as operações

## 🛠️ Tecnologias

- **React 19** + **TypeScript**
- **Vite** (bundler)
- **Tailwind CSS v4**
- **React Router DOM**
- **Lucide React** (ícones)
- **date-fns** (formatação de datas)
- **shadcn/ui** style (UI components customizados com Tailwind)
- LocalStorage (persistência em modo demo)

**Nota**: O projeto foi implementado em modo DEMO com armazenamento local. A integração com Supabase está preparada (arquivos `supabaseClient.ts` e `.env.example`).

## 🚀 Como Executar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
4. Execute o projeto:
   ```bash
   npm run dev
   ```

## ⚙️ Configuração do Supabase (Produção)

1. Crie um projeto no [Supabase](https://supabase.com)
2. Adicione as credenciais no arquivo `.env`
3. Execute o SQL fornecido na seção "Banco de Dados" do briefing original
4. Ative Row Level Security (RLS) conforme especificado

## 📋 Banco de Dados (SQL para Supabase)

```sql
create table aulas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text not null,
  disciplina text not null,
  professor text not null,
  data date not null,
  resumo text not null check (char_length(resumo) >= 30),
  duracao_minutos integer,
  tags text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table aulas enable row level security;

create policy "Usuários só acessam suas próprias aulas" 
  on aulas for all 
  using (auth.uid() = user_id);
```

## 📱 Uso

- **Login Demo**: Utilize qualquer e-mail e uma senha com pelo menos 6 caracteres
- **Cadastro**: Crie uma conta (simulada)
- No Dashboard:
  - Visualize estatísticas no topo
  - Use a barra de busca
  - Adicione novas aulas com o botão "NOVA AULA"
  - Clique nos cards para editar ou excluir
  - O resumo deve ter no mínimo 30 caracteres

## 📁 Estrutura de Pastas

```
src/
├── components/     # (UI integrada no App para simplificação)
├── lib/
│   └── supabaseClient.ts
├── types/
│   └── index.ts
├── utils/
│   └── cn.ts
├── App.tsx         # Toda a aplicação (rotas + componentes)
├── main.tsx
└── index.css
```

## 🎯 Checklist de Implementação

- [x] Autenticação (Login, Register, Forgot Password)
- [x] Dashboard protegido
- [x] CRUD completo de aulas
- [x] Busca por disciplina/título/professor
- [x] Validação do resumo (30+ caracteres)
- [x] Design responsivo com cards
- [x] Toasts de feedback
- [x] Estatísticas dinâmicas
- [x] Persistência com localStorage
- [x] Interface moderna dark theme (inspirada em shadcn/ui)
- [x] Suporte a tags e duração
- [x] Data formatada em português

---

**Projeto construído como demonstração completa e funcional.**
