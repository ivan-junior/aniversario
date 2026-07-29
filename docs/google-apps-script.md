# Google Apps Script — Confirmações RSVP

Este guia explica como configurar a planilha do Google Sheets e o Apps Script
para receber as confirmações de presença da landing page.

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
3. Cole o código completo da seção abaixo.
4. Clique em **Salvar** (ícone de disquete) e dê um nome ao projeto, por exemplo `RSVP Fantasia`.

---

## 4. Código completo do Apps Script

```javascript
/**
 * Web App para receber confirmações de presença da Festa à Fantasia.
 * Implantar como Web App com acesso "Qualquer pessoa".
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ success: false, error: 'Corpo da requisição ausente.' });
    }

    var data = JSON.parse(e.postData.contents);

    var nome = (data.nome || '').toString().trim();
    var presenca = data.presenca === true || data.presenca === 'true';
    var quantidadePessoas = Number(data.quantidadePessoas);
    var observacoes = (data.observacoes || '').toString().trim();
    var enviadoEm = data.enviadoEm ? new Date(data.enviadoEm) : new Date();

    if (!nome) {
      return jsonResponse_({ success: false, error: 'Campo "nome" é obrigatório.' });
    }

    if (typeof data.presenca !== 'boolean' && data.presenca !== 'true' && data.presenca !== 'false') {
      return jsonResponse_({ success: false, error: 'Campo "presenca" inválido.' });
    }

    if (!presenca) {
      quantidadePessoas = 0;
    } else if (!Number.isFinite(quantidadePessoas) || quantidadePessoas < 1) {
      quantidadePessoas = 1;
    }

    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName('Confirmacoes');

    if (!sheet) {
      sheet = spreadsheet.insertSheet('Confirmacoes');
      sheet.appendRow([
        'Data/Hora',
        'Nome',
        'Presença',
        'Quantidade de Pessoas',
        'Observações',
      ]);
    }

    var dataHoraFormatada = Utilities.formatDate(
      enviadoEm instanceof Date && !isNaN(enviadoEm.getTime()) ? enviadoEm : new Date(),
      'America/Sao_Paulo',
      'dd/MM/yyyy HH:mm'
    );

    sheet.appendRow([
      dataHoraFormatada,
      nome,
      presenca ? 'Sim' : 'Não',
      quantidadePessoas,
      observacoes,
    ]);

    return jsonResponse_({ success: true });
  } catch (error) {
    return jsonResponse_({
      success: false,
      error: error && error.message ? error.message : 'Erro interno',
    });
  }
}

/**
 * Resposta opcional para testes no navegador (GET).
 */
function doGet() {
  return jsonResponse_({
    ok: true,
    message: 'Web App RSVP ativo. Use POST para enviar confirmações.',
  });
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 5. Implantar como Web App

1. No editor do Apps Script, clique em **Implantar → Nova implantação**.
2. Ao lado de **Selecionar tipo**, clique no ícone de engrenagem e escolha **App da Web**.
3. Configure:
   - **Descrição:** `RSVP Festa à Fantasia`
   - **Executar como:** `Eu` (sua conta Google)
   - **Quem tem acesso:** `Qualquer pessoa`
4. Clique em **Implantar**.
5. Autorize o aplicativo quando o Google solicitar (revise as permissões e avance).
6. Copie a **URL da implantação** (termina algo como `/exec`).

> Importante: sempre use a URL da implantação (`/exec`), não a URL de teste (`/dev`).

---

## 6. Configurar o frontend

1. Na raiz do projeto, copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Cole a URL no `.env`:

```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/SEU_ID/exec
VITE_SITE_URL=https://seu-dominio.vercel.app
```

3. Reinicie o servidor de desenvolvimento (`npm run dev`) para carregar as variáveis.

---

## 7. Atualizar o script depois de mudanças

Se você alterar o código do Apps Script:

1. Salve o arquivo.
2. Vá em **Implantar → Gerenciar implantações**.
3. Edite a implantação ativa (ícone de lápis).
4. Em **Versão**, escolha **Nova versão**.
5. Clique em **Implantar**.

A URL normalmente permanece a mesma.

---

## 8. Teste rápido

Você pode testar com `curl` (PowerShell: `Invoke-RestMethod`):

```bash
curl -X POST "SUA_URL_AQUI" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{"nome":"Teste","presenca":true,"quantidadePessoas":2,"observacoes":"teste","enviadoEm":"2026-07-29T20:00:00.000Z"}'
```

Verifique se uma nova linha apareceu na aba **Confirmacoes**.

---

## Observações técnicas

- O frontend envia `Content-Type: text/plain` e usa `mode: 'no-cors'`.
  Web Apps do Google Apps Script **não** devolvem o cabeçalho
  `Access-Control-Allow-Origin`, então o navegador bloqueia a leitura da
  resposta em modo CORS normal (mesmo com status 200). Com `no-cors`, o
  POST chega ao script e a planilha é atualizada; a resposta fica opaca
  e o frontend trata o envio como sucesso se a requisição não falhar na rede.
- O campo `enviadoEm` chega em ISO; o script formata para `dd/MM/yyyy HH:mm` no fuso `America/Sao_Paulo`.
- Quem marca **Não** grava Quantidade de Pessoas = `0`.
