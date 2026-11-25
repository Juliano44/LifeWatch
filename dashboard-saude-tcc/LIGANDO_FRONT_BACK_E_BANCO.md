# Como o site, a API e o banco se ligam

## 1. O desenho geral

```
 NAVEGADOR (site React)          API (Node + Express)             BANCO (MariaDB)
 http://localhost:5173   ──────▶  http://localhost:3001   ──────▶  127.0.0.1:3307
                        fetch +                         mysql2 +
                        token JWT                       usuário senai
```

O site **nunca** fala com o banco. Ele só chama a API; a API valida o token,
consulta o MariaDB e devolve JSON.

## 2. Os 3 pontos de ligação (e onde configurar cada um)

| Ligação | Onde se configura | Valor padrão |
|---|---|---|
| **Backend → Banco** | `backend/.env` → `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | `127.0.0.1`, `3307`, `senai`, *(sua senha)*, `dashboard_saude` |
| **Site → Backend** | `frontend/.env` → `VITE_API_URL` | `http://localhost:3001/api` |
| **Backend aceita o site** (CORS) | `backend/.env` → `CORS_ORIGIN` | `http://localhost:5173,http://localhost:5174` |

Se o site abrir em outra porta (ex.: 5175), acrescente-a em `CORS_ORIGIN`
e reinicie o backend. Mexeu em qualquer `.env`? Pare (Ctrl+C) e rode
`npm run dev` de novo.

## 3. Passo a passo para conferir cada ligação

Siga na ordem; se um passo falhar, o problema está **naquela** ligação.

1. **Banco ligado?** O HeidiSQL conecta e mostra o banco `dashboard_saude`
   com 15 tabelas.
2. **Backend → Banco:** ao rodar `npm run dev` na pasta `backend` deve
   aparecer `Conectado ao MariaDB com sucesso.`
3. **Backend no ar?** Abra no navegador
   http://localhost:3001/api/health-check → deve mostrar `"status":"ok"`.
4. **Documentação/teste da API:** http://localhost:3001/api/docs (Swagger).
5. **Site → Backend:** abra o site, aperte **F12 → aba Network**, faça login.
   Devem aparecer as chamadas `login` e depois `summary` e `trends`, todas
   com status **200**. Se aparecer *CORS* em vermelho, veja `CORS_ORIGIN`.
6. **Dado certo?** No HeidiSQL rode `SELECT * FROM users;` — sua conta
   aparece lá, com a senha em forma de hash (isso é o esperado).

## 4. O caminho de um dado (exemplo: o card "Sono")

| Etapa | Arquivo |
|---|---|
| Linha gravada na tabela | `sleep_entries` (banco) |
| SQL que busca o registro mais recente | `backend/src/models/healthModel.js` → `getLatestSleep` |
| Converte para o formato do site | `backend/src/utils/formatters.js` → `formatSleep` |
| Monta a resposta do Resumo | `backend/src/controllers/healthController.js` → `getSummary` |
| Rota | `GET /api/health/summary` (`backend/src/routes/healthRoutes.js`) |
| Chamada feita pelo site | `frontend/src/services/api.js` → `fetchSummary` |
| Guarda o resultado em estado | `frontend/src/hooks/useHealthData.js` |
| Entrega ao card | `frontend/src/pages/DashboardPage.jsx` → `<SleepCard data=... />` |

## 5. Teste mágico: mude o banco e veja o site mudar

No HeidiSQL, aba de consulta, rode (troque o e-mail se usar outra conta):

```sql
USE dashboard_saude;

INSERT INTO sleep_entries (user_id, entry_date, hours, minutes, stages_json)
VALUES ((SELECT id FROM users WHERE email = 'adriana@demo.com'), CURDATE(), 8, 5,
        '[{"label":"REM","value":1.6,"color":"#6A6BFF"},{"label":"Leve","value":4,"color":"#9B9CFF"}]')
ON DUPLICATE KEY UPDATE hours = VALUES(hours), minutes = VALUES(minutes),
                        stages_json = VALUES(stages_json);
```

Volte ao site e aperte **F5**: o card Sono passa a mostrar **8 h 05 min**.
Isso prova que banco → API → site estão ligados.

## 6. Ligando uma categoria nova (as que têm tabela pronta mas ainda usam dado fixo)

Exemplo: **Nutrição** (`nutrition_entries`). Os passos são sempre os mesmos:

1. **Model** (`backend/src/models/healthModel.js`): crie `getLatestNutrition`
   e `upsertNutrition`, copiando o padrão de `getLatestSleep`/`upsertSleep`.
2. **Formatter** (`backend/src/utils/formatters.js`): crie `formatNutrition`
   convertendo `water_l` → `waterL` etc.
3. **Controller + rota**: em `healthController.js` use `createHandlers` (já
   existe) e registre `GET/POST /nutrition` em `healthRoutes.js`.
4. **Resumo/histórico**: acrescente o novo dado em `getSummary` ou crie uma
   rota de histórico (como `getTrends`).
5. **Site — serviço**: adicione `fetchNutrition` em `frontend/src/services/api.js`.
6. **Site — tela**: em `frontend/src/components/CategoryPage.jsx`, troque os
   dados de `categoryDetails.js` pelos recebidos da API.

> Quando quiser, me peça "ligue a categoria X" que eu faço esses 6 passos.
