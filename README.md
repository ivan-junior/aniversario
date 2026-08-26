# Festa à Fantasia — Ivan faz 33

Landing page responsiva (mobile-first) para confirmação de presença, mais o hub da festa com cadastro de fantasias e votação da melhor fantasia.

## Stack

- React + TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide React
- Supabase (PostgreSQL + Auth + RLS) — concurso de fantasias
- Google Apps Script (Web App) → Google Sheets — somente RSVP
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
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

| Variável | Uso |
|----------|-----|
| `VITE_GOOGLE_SCRIPT_URL` | Web App do RSVP (confirmação de presença) |
| `VITE_SITE_URL` | URL absoluta do site (Open Graph) |
| `VITE_SUPABASE_URL` | URL do projeto Supabase (concurso) |
| `VITE_SUPABASE_ANON_KEY` | Chave anon/public do Supabase (segura via RLS) |

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

**[docs/SUPABASE_FESTA_SETUP.md](docs/SUPABASE_FESTA_SETUP.md)** — SQL em `docs/supabase-festa-setup.sql`

Resumo do concurso:

1. Crie um projeto no Supabase.
2. Execute o SQL de `docs/supabase-festa-setup.sql` no SQL Editor.
3. Copie Project URL e anon key para o `.env`.
4. Crie um usuário em Authentication e insira o UUID em `admin_users`.
5. Configure as mesmas variáveis na Vercel e faça redeploy.

## Deploy na Vercel

1. Faça push do repositório para o GitHub.
2. Importe o projeto em [vercel.com](https://vercel.com).
3. Framework preset: **Vite** (detectado automaticamente).
4. Em **Environment Variables**, adicione:
   - `VITE_GOOGLE_SCRIPT_URL`
   - `VITE_SITE_URL` (ex.: `https://aniversario.ivanjunior.dev`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
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
  lib/supabase.ts     # client Supabase
  services/           # rsvp.service + festaApi
  types/
  utils/              # date + deviceId
scripts/
  Code.gs             # RSVP (Apps Script)
docs/
  google-apps-script.md
  SUPABASE_FESTA_SETUP.md
  supabase-festa-setup.sql
```

## Evento

- **Data:** 29 de agosto de 2026, 19:30
- **Local:** Chácara Aconchêgo — Rua E, 185, Recreio Internacional, Ribeirão Preto
- **Prêmio:** Melhor fantasia — R$ 300
