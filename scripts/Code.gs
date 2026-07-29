/**
 * Web App para receber confirmações de presença da Festa à Fantasia.
 * Implantar como Web App com acesso "Qualquer pessoa".
 *
 * Cole este arquivo em: Planilha → Extensões → Apps Script
 * Guia completo: docs/google-apps-script.md
 *
 * Altere EMAIL_NOTIFICACAO para o endereço que deve receber os avisos.
 */
var EMAIL_NOTIFICACAO = 'ivanbjunior.93@gmail.com';

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

    if (
      typeof data.presenca !== 'boolean' &&
      data.presenca !== 'true' &&
      data.presenca !== 'false'
    ) {
      return jsonResponse_({ success: false, error: 'Campo "presenca" inválido.' });
    }

    if (!presenca) {
      quantidadePessoas = 0;
    } else if (!isFinite(quantidadePessoas) || quantidadePessoas < 1) {
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
      enviadoEm instanceof Date && !isNaN(enviadoEm.getTime())
        ? enviadoEm
        : new Date(),
      'America/Sao_Paulo',
      'dd/MM/yyyy HH:mm'
    );

    var presencaTexto = presenca ? 'Sim' : 'Não';

    sheet.appendRow([
      dataHoraFormatada,
      nome,
      presencaTexto,
      quantidadePessoas,
      observacoes,
    ]);

    enviarNotificacaoConfirmacao_({
      nome: nome,
      presenca: presenca,
      presencaTexto: presencaTexto,
      quantidadePessoas: quantidadePessoas,
      observacoes: observacoes,
      dataHora: dataHoraFormatada,
    });

    return jsonResponse_({ success: true });
  } catch (error) {
    return jsonResponse_({
      success: false,
      error: error && error.message ? error.message : 'Erro interno',
    });
  }
}

/**
 * Envia e-mail de notificação para cada nova confirmação.
 * Se falhar por falta de autorização, a execução fica VERMELHA nos logs —
 * assim dá para diagnosticar. A linha na planilha já terá sido salva.
 */
function enviarNotificacaoConfirmacao_(confirmacao) {
  var assunto = confirmacao.presenca
    ? 'Nova confirmação: ' + confirmacao.nome + ' vai à festa!'
    : 'Resposta RSVP: ' + confirmacao.nome + ' não poderá ir';

  var observacoesHtml = confirmacao.observacoes
    ? escapeHtml_(confirmacao.observacoes)
    : '<em>Nenhuma</em>';

  var htmlEmail =
    '<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">' +
    '<h2 style="margin-bottom: 8px;">Festa à Fantasia — Nova resposta</h2>' +
    '<p style="color: #666; margin-top: 0;">Registrado em ' +
    confirmacao.dataHora +
    '</p>' +
    '<table style="border-collapse: collapse; width: 100%;">' +
    linhaEmail_('Nome', escapeHtml_(confirmacao.nome)) +
    linhaEmail_('Presença', confirmacao.presencaTexto) +
    linhaEmail_('Quantidade de pessoas', String(confirmacao.quantidadePessoas)) +
    linhaEmail_('Observações', observacoesHtml) +
    '</table>' +
    '<p style="margin-top: 20px; color: #666; font-size: 13px;">' +
    'Confira também a aba Confirmacoes na planilha.' +
    '</p>' +
    '</div>';

  var textoSimples =
    'Festa à Fantasia — Nova resposta\n\n' +
    'Data/Hora: ' +
    confirmacao.dataHora +
    '\n' +
    'Nome: ' +
    confirmacao.nome +
    '\n' +
    'Presença: ' +
    confirmacao.presencaTexto +
    '\n' +
    'Quantidade de pessoas: ' +
    confirmacao.quantidadePessoas +
    '\n' +
    'Observações: ' +
    (confirmacao.observacoes || 'Nenhuma') +
    '\n';

  // MailApp costuma pedir menos escopos; GmailApp também funciona.
  // Usamos MailApp por ser mais simples em Web Apps.
  MailApp.sendEmail({
    to: EMAIL_NOTIFICACAO,
    subject: assunto,
    body: textoSimples,
    htmlBody: htmlEmail,
  });
}

function linhaEmail_(rotulo, valor) {
  return (
    '<tr>' +
    '<td style="padding: 8px; border: 1px solid #ddd; background: #f7f7f7; width: 40%;"><strong>' +
    rotulo +
    '</strong></td>' +
    '<td style="padding: 8px; border: 1px solid #ddd;">' +
    valor +
    '</td>' +
    '</tr>'
  );
}

function escapeHtml_(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function doGet() {
  return jsonResponse_({
    ok: true,
    message: 'Web App RSVP ativo. Use POST para enviar confirmações.',
  });
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Execute ESTA função uma vez no editor (botão Executar)
 * para autorizar o envio de e-mails. Sem isso, doPost grava
 * na planilha mas o e-mail não sai.
 */
function autorizarEmail() {
  MailApp.sendEmail({
    to: EMAIL_NOTIFICACAO,
    subject: 'Teste RSVP — autorização OK',
    body: 'Se você recebeu este e-mail, a autorização do MailApp está funcionando.',
  });
}
