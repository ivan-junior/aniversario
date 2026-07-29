# Festa à Fantasia — Confirmação de Presença

Landing page responsiva (mobile-first) para confirmação de presença em uma festa à fantasia. O convidado abre o link, vê o countdown e confirma presença — a resposta é salva em uma planilha do Google Sheets.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Google Apps Script (Web App) → Google Sheets

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
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/SEU_ID/exec
VITE_SITE_URL=https://seu-dominio.vercel.app
```

| Variável | Uso |
|----------|-----|
| `VITE_GOOGLE_SCRIPT_URL` | URL da implantação do Google Apps Script |
| `VITE_SITE_URL` | URL absoluta do site em produção (Open Graph) |

## Como rodar

```bash
npm run dev
```

Abra o endereço indicado no terminal (geralmente `http://localhost:5173`).

## Scripts úteis

```bash
npm run build    # build de produção
npm run preview  # preview do build
npm run lint     # oxlint
```

## Google Sheets / Apps Script

Siga o passo a passo completo em:

**[docs/google-apps-script.md](docs/google-apps-script.md)**

Resumo:

1. Crie a planilha e a aba `Confirmacoes` com os cabeçalhos.
2. Cole o script `doPost` no Apps Script.
3. Implante como Web App com acesso **Qualquer pessoa**.
4. Cole a URL `/exec` em `VITE_GOOGLE_SCRIPT_URL`.

## Deploy na Vercel

1. Faça push do repositório para o GitHub.
2. Importe o projeto em [vercel.com](https://vercel.com).
3. Framework preset: **Vite** (detectado automaticamente).
4. Em **Environment Variables**, adicione:
   - `VITE_GOOGLE_SCRIPT_URL`
   - `VITE_SITE_URL` (ex.: `https://festa-fantasia.vercel.app`)
5. Faça o deploy.

Após o primeiro deploy, atualize `VITE_SITE_URL` com a URL final (domínio da Vercel ou domínio customizado) e faça um **redeploy** para regenerar os metadados Open Graph com URLs absolutas corretas.

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

No build, o Vite substitui `%VITE_SITE_URL%` no HTML. Em produção:

```env
VITE_SITE_URL=https://meu-dominio.com
```

Isso gera URLs absolutas como:

```
https://meu-dominio.com/og-image.jpg
```

### 4. Cache das plataformas

Alterações em título, descrição ou imagem **podem demorar** para aparecer no WhatsApp por causa de cache. Ferramentas úteis:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Às vezes é necessário limpar o cache / forçar um novo scrape

### 5. Imagem publicamente acessível

A imagem precisa estar disponível sem login em:

```
${VITE_SITE_URL}/og-image.jpg
```

### 6. URLs absolutas

`og:url` e `og:image` **devem ser absolutas** em produção. Não use caminhos relativos nos metadados de compartilhamento.

## Estrutura do projeto

```
src/
  components/     # Hero, Countdown, formulário RSVP, etc.
  services/       # Integração com Google Apps Script
  types/          # Tipos TypeScript
  utils/          # Helpers de data/countdown
docs/
  google-apps-script.md
public/
  og-image.jpg
  favicon.svg
```

## Evento

- **Data:** 29 de agosto de 2026, 20h
- **Local:** Chácara Aconchêgo — Rua E, 185, Recreio Internacional, Ribeirão Preto
- **Prêmio:** Melhor fantasia — R$ 300
