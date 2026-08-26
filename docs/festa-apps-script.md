# Google Apps Script — Concurso de Fantasias

Backend do cadastro de fantasias e votação, separado do RSVP.

Código-fonte: [`scripts/FestaCode.gs`](../scripts/FestaCode.gs)

Arquitetura:

```text
Convidado → aniversario.ivanjunior.dev (Vite/Vercel)
         → Google Apps Script (Web App)
         → Google Sheets (Fantasias / Votos / Config)
```

---

## 1. Criar a planilha

1. Acesse [Google Sheets](https://sheets.google.com).
2. Crie uma **planilha em branco** (nova, separada da de RSVP).
3. Renomeie para algo como `Festa — Fantasias e Votos`.

---

## 2. Abrir o Apps Script e colar o código

1. Na planilha: **Extensões → Apps Script**.
2. Apague o código de exemplo.
3. Cole o conteúdo completo de [`scripts/FestaCode.gs`](../scripts/FestaCode.gs).
4. Salve.

---

## 3. Inicializar abas (`setupSpreadsheet`)

1. No seletor de funções, escolha **`setupSpreadsheet`**.
2. Clique em **Executar**.
3. Autorize a conta Google se pedido.

Isso cria/garante as abas:

### Aba `Fantasias`

| id | device_id | nome | fantasia | criado_em |
|----|-----------|------|----------|-----------|

### Aba `Votos`

| id | device_id | fantasia_id | criado_em |
|----|-----------|-------------|-----------|

Cada voto é **uma nova linha** (sem contador na fantasia).

### Aba `Config`

| chave | valor |
|-------|-------|
| `cadastro_fantasias_aberto` | `TRUE` |
| `votacao_aberta` | `FALSE` |
| `votacao_encerrada` | `FALSE` |

---

## 4. Configurar `ADMIN_SECRET`

1. No Apps Script: **Ícone de engrenagem (Configurações do projeto)**.
2. Em **Propriedades do script**, adicione:

| Propriedade | Valor |
|-------------|-------|
| `ADMIN_SECRET` | a mesma senha que você vai colocar em `VITE_ADMIN_PASSWORD` |

Não deixe o segredo hardcoded no código `.gs`.

---

## 5. Implantar como Web App

1. **Implantar → Nova implantação**.
2. Tipo: **App da Web**.
3. Configure:
   - **Descrição:** `Concurso Fantasias`
   - **Executar como:** `Eu`
   - **Quem tem acesso:** `Qualquer pessoa`
4. **Implantar** e copie a URL `/exec`.

> Use sempre a URL de implantação (`/exec`), não a de teste (`/dev`).

---

## 6. Configurar o frontend

No `.env` (e na Vercel):

```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/SEU_ID/exec
VITE_ADMIN_PASSWORD=sua-senha-forte
```

`VITE_ADMIN_PASSWORD` deve ser **igual** ao `ADMIN_SECRET` das Script Properties.

Reinicie `npm run dev` após alterar o `.env`.

Na Vercel: **Settings → Environment Variables** → adicione as duas variáveis → faça um novo deploy.

---

## 7. Atualizar o script depois de mudanças

1. Salve no editor.
2. **Implantar → Gerenciar implantações**.
3. Edite a implantação (lápis).
4. **Versão → Nova versão**.
5. **Implantar**.

Sem nova versão, o Web App continua no código antigo.

---

## 8. Ações da API

### GET

| action | params | descrição |
|--------|--------|-----------|
| `getStatus` | — | status de cadastro/votação |
| `getCostumes` | `deviceId` | lista + `myCostumeId` + `hasVoted` |

### POST (body JSON, `Content-Type: text/plain`)

| action | campos | descrição |
|--------|--------|-----------|
| `registerCostume` | `deviceId`, `name`, `costume` | cadastra fantasia |
| `vote` | `deviceId`, `fantasiaId` | registra voto |
| `getRanking` | `adminSecret` | ranking agregado |
| `setRegistrationStatus` | `adminSecret`, `open` | abre/fecha cadastro |
| `setVotingStatus` | `adminSecret`, `open` | abre/fecha votação |

Respostas:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "error": "Mensagem amigável" }
```

---

## 9. Como testar

### Local

1. Configure `.env` com a URL `/exec` e a senha.
2. `npm run dev`
3. Abra `http://localhost:5173/festa`

### Cadastro

1. `/fantasia` → preencha nome e fantasia → deve cadastrar.
2. Recarregue → deve mostrar “Você já está participando!”.
3. No `/admin`, encerre o cadastro → `/fantasia` deve mostrar cadastro encerrado.

### Votação

1. Cadastre pelo menos 2 fantasias (use janelas anônimas / outro navegador para deviceIds diferentes).
2. No `/admin`, abra a votação.
3. Em `/votar`, escolha uma fantasia e confirme.

### Um voto por navegador

1. Vote uma vez.
2. Recarregue `/votar` → “Seu voto já foi registrado!”.
3. (Opcional) Tente POST manual com o mesmo `deviceId` → API retorna “Você já votou!”.

### Não votar na própria fantasia

1. No mesmo navegador que cadastrou a fantasia A, abra `/votar`.
2. A fantasia A aparece bloqueada (“Sua fantasia”).
3. Se chamar a API votando nela mesmo assim → “Você não pode votar na sua própria fantasia.”.

### Admin

1. `/admin` → senha.
2. Alternar cadastro/votação.
3. Ranking atualiza no botão **Atualizar** e a cada ~10s.

---

## 10. QR Code da festa

O papel na mesa deve apontar para:

```text
https://aniversario.ivanjunior.dev/festa
```

Não é necessário gerar QR no sistema.

---

## Observações técnicas

- `LockService` protege cadastro, voto e mudanças de Config contra concorrência.
- Ranking = agregação das linhas da aba `Votos` (sem contador na fantasia).
- O frontend identifica o navegador com `localStorage.festa_device_id` (`crypto.randomUUID()`).
- CORS: Apps Script Web App com acesso “Qualquer pessoa”; o client usa GET para leitura e POST `text/plain` para gravação (evita preflight).
- A senha no frontend (`VITE_*`) é obscuridade para festa; a validação real das operações admin está no `ADMIN_SECRET` do Apps Script.
