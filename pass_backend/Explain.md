# Projeto FleetManager (Desafio Técnico)

Este projeto é um sistema completo de gestão de frotas utilizando **Next.js** (Frontend) e **Fastify** (Backend).

## 🚀 Objetivo
Construir um sistema robusto para gerenciar veículos, abastecimentos, ocorrências e documentos, focando em performance, tipagem estática e arquitetura limpa.

## 🛠 Stack Tecnológica
- **Backend:** Node.js, Fastify, TypeScript, Prisma ORM, Zod, PostgreSQL.
- **Frontend:** Next.js (App Router), React Query, Shadcn/ui, Tailwind.
- **Infra:** Docker (Postgres + MinIO).

---

## 🗺️ Guia de Inicialização (Passo a Passo para o Desenvolvedor)

Siga esta ordem para construir o backend manualmente:

### Fase 1: Fundação
1.  **Docker:** Subir o container do PostgreSQL e garantir que consegue conectar nele.
2.  **Setup Node:** Inicializar `package.json`, instalar TypeScript, Fastify e criar o `tsconfig.json`.
3.  **Database:** Criar o arquivo `schema.prisma` (já fornecido), rodar o `npx prisma migrate dev` para criar as tabelas no Docker.
4.  **Server Entrypoint:** Criar o arquivo `server.ts` simples que apenas sobe o servidor na porta 3333.

### Fase 2: Estrutura e Primeira Rota
1.  **Pastas:** Criar `src/http/controllers`, `src/http/routes`, `src/services`, `src/lib`.
2.  **Lib:** Configurar a instância do Prisma Client em `src/lib/prisma.ts`.
3.  **Rota de Criação (POST /vehicles):**
    * Criar validação com Zod (body schema).
    * Criar o Controller (recebe req/res).
    * Criar o Service (chama o Prisma).
    * Registrar a rota no `server.ts`.

---

## 🤖 Perguntas Guia para Consultar a IA (Mentor Mode)

*Utilize estas perguntas quando estiver travado ou quiser validar se seu código está seguindo boas práticas. Copie e cole no chat.*

### Sobre Configuração Inicial
> "Estou configurando o `server.ts` com Fastify. Qual é a maneira correta de registrar o validador e o serializador do **Zod** para que ele faça a validação automática dos tipos nas rotas?"

> "Criei meu `docker-compose.yml` para o Postgres. Como configuro a variável `DATABASE_URL` no meu `.env` para que o Prisma consiga acessar esse container rodando localmente?"

### Sobre Criação de Rotas e Arquitetura
> "Fiz a separação em Controllers e Services. O meu Controller deve ter try/catch ou é melhor configurar um `errorHandler` global no Fastify? Se for global, como seria uma estrutura simples disso?"

> "Estou criando a rota de `POST /vehicles`. Como tipar o `request.body` dentro do handler do Fastify usando a inferência do Zod (`z.infer`) para eu não precisar criar interfaces manuais?"

### Sobre Regras de Negócio e Prisma
> "No meu `CreateVehicleService`, preciso verificar se a placa já existe antes de criar. Qual método do Prisma é mais performático para isso: `findUnique` ou `count`? E como devo retornar esse erro para o Controller?"

> "Preciso salvar a data de abastecimento que vem do front (string) no banco (DateTime). O Zod consegue fazer essa transformação (coerce) automaticamente na validação? Como fica o schema?"

### Sobre Uploads (Futuro)
> "Para a rota de upload de imagens, vou usar o `fastify-multipart`. Qual é a melhor estratégia: salvar o arquivo em disco temporário e depois subir pro MinIO, ou fazer stream direto da requisição para o bucket?"