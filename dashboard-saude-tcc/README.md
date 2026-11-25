# Dashboard de Saúde — TCC (frontend + backend + banco)

```
dashboard-saude-tcc/
├── frontend/   React + Vite  (o site, porta 5173)
├── backend/    Node + Express (a API, porta 3001)
└── README.md   este arquivo
```

O site tem **tela de login/cadastro**. Depois de entrar, o Resumo busca os
dados na API, que lê do **MariaDB**.

---

## Passo a passo para rodar

### Passo 1 — Ligar o MariaDB
O backend só funciona com o MariaDB ligado (porta **3307**, usuário **senai**).

- **Se usa XAMPP:** abra o *XAMPP Control Panel* e clique em **Start** na linha do **MySQL**.
- **Se é instalação avulsa:** aperte `Win + R`, digite `services.msc`, ache
  **MariaDB** (ou MySQL), clique com o botão direito → **Iniciar**.

Teste no **HeidiSQL**: se conectar sem erro, está ligado. (Erro **10061** =
o MariaDB está desligado ou a porta não é 3307.)

### Passo 2 — Backend (a API)
Abra um terminal na pasta `backend` e rode, um por vez:

```bash
npm install
copy .env.example .env
```
Abra o arquivo `.env` e ajuste:
- `DB_PASSWORD=` → a mesma senha que você usa no HeidiSQL;
- `JWT_SECRET=` → qualquer texto longo e aleatório;
- se a porta do seu MariaDB não for 3307, ajuste `DB_PORT`.

Depois:
```bash
npm run db:setup
```
Isso **cria o banco `dashboard_saude`, as tabelas e a conta de demonstração**
com 7 dias de dados. Deve terminar com "Dados de demonstração criados".

```bash
npm run dev
```
Deve aparecer `Conectado ao MariaDB com sucesso.` e
`Servidor rodando em http://localhost:3001`. **Deixe esse terminal aberto.**

### Passo 3 — Frontend (o site)
Abra **outro** terminal, na pasta `frontend`:

```bash
npm install
npm run dev
```
Abra o endereço mostrado (normalmente http://localhost:5173).

### Passo 4 — Entrar
Na tela de login clique em **Usar conta de demonstração** e depois **Entrar**:

- e-mail: `adriana@demo.com`
- senha: `demo1234`

Também dá para **Criar conta** — a conta nova já nasce com 7 dias de dados
fictícios (para desligar, coloque `SEED_DEMO_DATA_ON_REGISTER=false` no `.env`
do backend).

---

## O banco de dados

O script completo é o arquivo **`banco-completo-heidisql.sql`** (cópia de
`backend/database/schema.sql`). No HeidiSQL: conecte, menu **Arquivo →
Executar arquivo SQL…**, escolha o arquivo e depois atualize (F5). Pode rodar
quantas vezes quiser — nunca apaga dados. (`npm run db:setup` faz o mesmo.)

São **15 tabelas** no banco `dashboard_saude`:

| Tabela | O que guarda | Ligada ao site? |
|---|---|---|
| `users` | nome, e-mail, senha **criptografada (bcrypt)**, iniciais | Sim (login) |
| `activity_entries` | movimento, exercício, em pé e metas | Sim |
| `cycle_entries` | dia do ciclo, fase, sintomas | Sim |
| `audio_entries` | status e níveis de exposição sonora | Sim |
| `heart_rate_entries` | BPM em repouso e série do dia | Sim |
| `sleep_entries` | horas, minutos e estágios do sono | Sim |
| `emotional_entries` | frase do momento, humor (1–5), tags | Sim |
| `medications` / `medication_logs` | remédios e registro de cada dose | Tabela pronta |
| `body_measurement_entries` | peso e altura (IMC é calculado) | Tabela pronta |
| `mobility_entries` | velocidade, passo, assimetria, distância, passos | Tabela pronta |
| `nutrition_entries` | água e calorias do dia | Tabela pronta |
| `respiratory_entries` | frequência respiratória, SpO₂, sessões | Tabela pronta |
| `symptom_entries` | sintomas e intensidade (vários por dia) | Tabela pronta |
| `shares` | com quem os dados são compartilhados | Tabela pronta |

As tabelas de dados têm `user_id` ligado a `users(id)` com `ON DELETE CASCADE`
(16 chaves estrangeiras no total) — cada usuário só enxerga os próprios dados.
As de resumo guardam **1 registro por usuário por dia**.

> Como o site, a API e o banco se conectam, e como conferir cada ligação:
> veja **`LIGANDO_FRONT_BACK_E_BANCO.md`**.

---

## O que já vem do banco e o que ainda é fixo

| Parte do site | Origem |
|---|---|
| Login, cadastro, sair, sessão salva | **Backend + banco** |
| Nome/avatar e "Última sincronização" | **Backend + banco** |
| 6 cards do Resumo (Atividade, Ciclo, Fones, Batimentos, Sono, Emocional) | **Backend + banco** |
| Seção Tendências (5 cards, calculados do histórico de 7 dias) | **Backend + banco** |
| Telas individuais das 12 categorias | Dados fictícios fixos no front (`src/data/categoryDetails.js`); as tabelas já existem no banco |
| Compartilhamento e modal "Todos os Dados de Saúde" | Dados fictícios fixos no front |

## Rotas da API
Documentação interativa (Swagger): http://localhost:3001/api/docs

`POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` ·
`GET /api/health/summary` · `GET /api/health/trends?days=7` ·
`GET|POST /api/health/{activity|cycle|audio|heart-rate|sleep|emotional}`

As rotas de saúde exigem o header `Authorization: Bearer <token>`.

---

## Problemas comuns

| Mensagem | O que fazer |
|---|---|
| `ECONNREFUSED` / 10061 / "Falha ao conectar ao MariaDB" | MariaDB desligado (Passo 1) ou `DB_PORT` errada no `.env` |
| `Access denied for user 'senai'` | `DB_PASSWORD` do `.env` diferente da senha do HeidiSQL |
| `ER_NOT_SUPPORTED_AUTH_MODE` / erro de autenticação | No HeidiSQL, rode: `ALTER USER 'senai'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('SUA_SENHA'); FLUSH PRIVILEGES;` |
| Site mostra "Não foi possível conectar ao servidor" | Backend não está rodando (Passo 2) |
| Erro de CORS no navegador | Confira a porta do site e coloque-a em `CORS_ORIGIN` no `.env` do backend |
| `EADDRINUSE :3001` | Já existe um backend aberto; feche o outro terminal ou mude `PORT` |
| Mudou algo no `.env` | Pare o backend (Ctrl+C) e rode `npm run dev` de novo |
