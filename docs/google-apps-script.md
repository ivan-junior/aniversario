# Google Apps Script — Confirmações RSVP

Este guia explica como configurar a planilha do Google Sheets e o Apps Script
para receber as confirmações de presença da landing page.

O código-fonte também está em [`scripts/Code.gs`](../scripts/Code.gs) — copie de lá.

---

## 1. Criar a planilha

1. Acesse [Google Sheets](https://sheets.google.com).
2. Clique em **Planilha em branco**.
3. Renomeie o arquivo para algo como `Festa à Fantasia — Confirmações`.

---

## 2. Criar a aba e os cabeçalhos

1. Renomeie a primeira aba para **`Confirmacoes`** (sem acento, exatamente assim).
2. Na linha 1, preencha os cabeçalhos nas colunas A–E:

| A | B | C | D | E |
|---|---|---|---|---|
| Data/Hora | Nome | Presença | Quantidade de Pessoas | Observações |

---

## 3. Abrir o Apps Script

1. No menu da planilha, vá em **Extensões → Apps Script**.
2. Apague qualquer código de exemplo que aparecer no editor.
3. Cole o conteúdo completo de [`scripts/Code.gs`](../scripts/Code.gs).
4. Ajuste `EMAIL_NOTIFICACAO` se quiser outro destinatário.
5. Clique em **Salvar**.

---

## 4. Código completo do Apps Script

O código atualizado está em **[`scripts/Code.gs`](../scripts/Code.gs)**.

Resumo do que ele faz:

1. Recebe o POST do frontend
2. Valida nome e presença
3. Grava uma linha na aba `Confirmacoes`
4. Envia e-mail de notificação via `MailApp` para `EMAIL_NOTIFICACAO`
5. Retorna `{ success: true }`

---

## 5. Autorizar o envio de e-mail (obrigatório)

O e-mail **não funciona** só com colar o código. É preciso autorizar o Gmail/Mail:

1. No editor do Apps Script, selecione a função **`autorizarEmail`** no seletor de funções (ao lado do botão Executar).
2. Clique em **Executar**.
3. O Google pedirá permissão — clique em **Revisar permissões** → escolha sua conta → **Avançado** → **Ir para o projeto (não seguro)** → **Permitir**.
4. Confira se chegou um e-mail de teste em `EMAIL_NOTIFICACAO`.

Sem esse passo, `doPost` grava na planilha, mas o envio de e-mail falha (e a execução ainda pode aparecer como "Concluído" se o erro for engolido).

---

## 6. Implantar como Web App

1. No editor do Apps Script, clique em **Implantar → Nova implantação**.
2. Ao lado de **Selecionar tipo**, clique no ícone de engrenagem e escolha **App da Web**.
3. Configure:
   - **Descrição:** `RSVP Festa à Fantasia`
   - **Executar como:** `Eu` (sua conta Google)
   - **Quem tem acesso:** `Qualquer pessoa`
4. Clique em **Implantar**.
5. Autorize se o Google pedir de novo.
6. Copie a **URL da implantação** (`/exec`).

> Importante: sempre use a URL da implantação (`/exec`), não a URL de teste (`/dev`).

---

## 7. Configurar o frontend

1. Na raiz do projeto, copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Cole a URL no `.env`:

```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/SEU_ID/exec
VITE_SITE_URL=https://seu-dominio.vercel.app
```

3. Reinicie o servidor de desenvolvimento (`npm run dev`) para carregar as variáveis.

---

## 8. Atualizar o script depois de mudanças

Se você alterar o código do Apps Script:

1. Salve o arquivo.
2. Vá em **Implantar → Gerenciar implantações**.
3. Edite a implantação ativa (ícone de lápis).
4. Em **Versão**, escolha **Nova versão**.
5. Clique em **Implantar**.

A URL normalmente permanece a mesma.

**Sem criar uma nova versão, o Web App continua rodando o código antigo** — por isso o histórico pode mostrar "Concluído" sem enviar e-mail.

---

## 9. Teste rápido

Você pode testar com `curl` (PowerShell: `Invoke-RestMethod`):

```bash
curl -X POST "SUA_URL_AQUI" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"nome":"Teste","presenca":true,"quantidadePessoas":2,"observacoes":"teste","enviadoEm":"2026-07-29T20:00:00.000Z"}'
```

Verifique:

1. Nova linha na aba **Confirmacoes**
2. E-mail na caixa de entrada (e no spam) de `EMAIL_NOTIFICACAO`

---

## Por que o e-mail não chega mesmo com execução "Concluído"?

Causas mais comuns:

1. **Código antigo ainda implantado** — salvou no editor, mas não criou **Nova versão** na implantação.
2. **Permissão do Gmail/Mail não autorizada** — rode a função `autorizarEmail` manualmente uma vez (veja abaixo).
3. **E-mail na pasta de spam**
4. **`EMAIL_NOTIFICACAO` errado** no script implantado

### Autorizar e-mail manualmente

No Apps Script, adicione e execute **uma vez** esta função:

```javascript
function autorizarEmail() {
  MailApp.sendEmail({
    to: EMAIL_NOTIFICACAO,
    subject: 'Teste RSVP — autorização OK',
    body: 'Se você recebeu este e-mail, a autorização do MailApp está funcionando.',
  });
}
```

(Ela também está no final de [`scripts/Code.gs`](../scripts/Code.gs).)

---

## Observações técnicas

- O frontend envia `Content-Type: text/plain` e usa `mode: 'no-cors'`.
- O campo `enviadoEm` chega em ISO; o script formata para `dd/MM/yyyy HH:mm` no fuso `America/Sao_Paulo`.
- Quem marca **Não** grava Quantidade de Pessoas = `0`.
- Após gravar na planilha, o script envia e-mail via `MailApp`. Se o e-mail falhar por autorização, a linha na planilha já terá sido salva.
