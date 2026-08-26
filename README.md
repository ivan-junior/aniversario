# Festa à Fantasia — Ivan faz 33

Landing page responsiva (mobile-first) para confirmação de presença, mais o hub da festa com cadastro de fantasias e votação da melhor fantasia.

## Stack

- React + TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide React
- Google Apps Script (Web App) → Google Sheets
- Vercel (frontend)

## Como instalar

```bash
npm install
```

## Como configurar o `.env`

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Preencha as variáveis:

```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/RSVP_ID/exec
VITE_SITE_URL=https://aniversario.ivanjunior.dev
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/FESTA_ID/exec
VITE_ADMIN_PASSWORD=sua-senha-forte
```

| Variável | Uso |
|----------|-----|
| `VITE_GOOGLE_SCRIPT_URL` | Web App do RSVP (confirmação de presença) |
| `VITE_SITE_URL` | URL absoluta do site (Open Graph) |
| `VITE_APPS_SCRIPT_URL` | Web App do concurso de fantasias |
| `VITE_ADMIN_PASSWORD` | Senha do `/admin` (igual ao `ADMIN_SECRET` no Apps Script) |

## Como rodar

```bash
npm run dev
```

Abra o endereço indicado no terminal (geralmente `http://localhost:5173`).

Rotas úteis:

| Rota | Função |
|------|--------|
| `/` | Landing + RSVP |
| `/festa` | Hub do concurso (QR Code) |
| `/fantasia` | Cadastro de fantasia |
| `/votar` | Votação |
| `/admin` | Painel + ranking |

## Scripts úteis

```bash
npm run build    # build de produção
npm run preview  # preview do build
npm run lint     # oxlint
```

## Google Sheets / Apps Script

### RSVP (confirmação de presença)

**[docs/google-apps-script.md](docs/google-apps-script.md)** — script em `scripts/Code.gs`

### Concurso de fantasias (cadastro + votação)

**[docs/festa-apps-script.md](docs/festa-apps-script.md)** — script em `scripts/FestaCode.gs`

Resumo do concurso:

1. Crie uma planilha nova e cole `scripts/FestaCode.gs`.
2. Execute `setupSpreadsheet()`.
3. Configure a Script Property `ADMIN_SECRET`.
4. Implante como Web App (**Qualquer pessoa**) e copie a URL `/exec`.
5. Preencha `VITE_APPS_SCRIPT_URL` e `VITE_ADMIN_PASSWORD`.

## Deploy na Vercel

1. Faça push do repositório para o GitHub.
2. Importe o projeto em [vercel.com](https://vercel.com).
3. Framework preset: **Vite** (detectado automaticamente).
4. Em **Environment Variables**, adicione:
   - `VITE_GOOGLE_SCRIPT_URL`
   - `VITE_SITE_URL` (ex.: `https://aniversario.ivanjunior.dev`)
   - `VITE_APPS_SCRIPT_URL`
   - `VITE_ADMIN_PASSWORD`
5. Faça o deploy.

O arquivo `vercel.json` já redireciona rotas SPA para `index.html`.

## QR Code da festa

Aponte o QR Code físico para:

```text
https://aniversario.ivanjunior.dev/festa
```

## Open Graph / Preview do WhatsApp

Quando o link for compartilhado no WhatsApp, o preview usa os metadados definidos em `index.html` e a imagem em `public/og-image.jpg`.

### 1. Substituir a imagem de compartilhamento

Substitua o arquivo:

```
public/og-image.jpg
```

Mantenha o mesmo nome de arquivo (ou atualize as tags `og:image` / `twitter:image` no `index.html`).

### 2. Tamanho recomendado

- **1200 × 630 px**
- Formato JPG ou PNG
- Pouco texto (ex.: título + data)

### 3. Configurar `VITE_SITE_URL`

```env
VITE_SITE_URL=https://aniversario.ivanjunior.dev
```

### 4. Cache das plataformas

Alterações em título, descrição ou imagem **podem demorar** para aparecer no WhatsApp. Ferramenta útil:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

## Estrutura do projeto

```
src/
  pages/              # Home, Festa, Fantasia, Votacao, Admin
  components/         # Hero, RSVP, AtmosphericBackground...
  components/festa/   # UI do concurso
  services/           # rsvp.service + festaApi
  types/
  utils/              # date + deviceId
scripts/
  Code.gs             # RSVP
  FestaCode.gs        # Concurso
docs/
  google-apps-script.md
  festa-apps-script.md
```

## Evento

- **Data:** 29 de agosto de 2026, 19:30
- **Local:** Chácara Aconchêgo — Rua E, 185, Recreio Internacional, Ribeirão Preto
- **Prêmio:** Melhor fantasia — R$ 300
