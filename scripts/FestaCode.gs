/**
 * Web App — Concurso de Fantasias (cadastro + votação)
 *
 * Planilha com abas: Fantasias | Votos | Config
 * 1) Cole este arquivo em Extensões → Apps Script
 * 2) Execute setupSpreadsheet() uma vez
 * 3) Em Configurações do projeto → Propriedades do script:
 *    ADMIN_SECRET = mesma senha de VITE_ADMIN_PASSWORD
 * 4) Implantar como Web App (Qualquer pessoa) e copiar a URL /exec
 *
 * Guia: docs/festa-apps-script.md
 */

var SHEET_FANTASIAS = 'Fantasias';
var SHEET_VOTOS = 'Votos';
var SHEET_CONFIG = 'Config';

var CONFIG_REGISTRATION = 'cadastro_fantasias_aberto';
var CONFIG_VOTING = 'votacao_aberta';
var CONFIG_VOTING_ENDED = 'votacao_encerrada';

var MAX_NAME = 60;
var MAX_COSTUME = 80;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

/**
 * Cria abas, cabeçalhos e valores padrão de Config.
 * Execute uma vez no editor do Apps Script.
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  ensureSheet_(ss, SHEET_FANTASIAS, [
    'id',
    'device_id',
    'nome',
    'fantasia',
    'criado_em',
  ]);

  ensureSheet_(ss, SHEET_VOTOS, [
    'id',
    'device_id',
    'fantasia_id',
    'criado_em',
  ]);

  var config = ensureSheet_(ss, SHEET_CONFIG, ['chave', 'valor']);
  ensureConfigDefault_(config, CONFIG_REGISTRATION, 'TRUE');
  ensureConfigDefault_(config, CONFIG_VOTING, 'FALSE');
  ensureConfigDefault_(config, CONFIG_VOTING_ENDED, 'FALSE');

  SpreadsheetApp.flush();
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    var existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    var empty = existing.every(function (cell) {
      return cell === '' || cell === null;
    });
    if (empty) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function ensureConfigDefault_(sheet, key, value) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) {
      return;
    }
  }
  sheet.appendRow([key, value]);
}

// ---------------------------------------------------------------------------
// HTTP entry points
// ---------------------------------------------------------------------------

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    var action = String(params.action || '').trim();

    if (action === 'getStatus') {
      return jsonResponse_(ok_({ data: getStatusData_() }));
    }

    if (action === 'getCostumes') {
      return jsonResponse_(ok_({ data: getCostumesData_(params.deviceId) }));
    }

    return jsonResponse_(fail_('Ação GET inválida.'));
  } catch (error) {
    return jsonResponse_(fail_(friendlyError_(error)));
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_(fail_('Corpo da requisição ausente.'));
    }

    var body = JSON.parse(e.postData.contents);
    var action = String(body.action || '').trim();

    if (action === 'registerCostume') {
      return jsonResponse_(ok_({ data: registerCostume_(body) }));
    }

    if (action === 'vote') {
      return jsonResponse_(ok_({ data: vote_(body) }));
    }

    if (action === 'getRanking') {
      assertAdmin_(body.adminSecret);
      return jsonResponse_(ok_({ data: getRankingData_() }));
    }

    if (action === 'setRegistrationStatus') {
      assertAdmin_(body.adminSecret);
      return jsonResponse_(
        ok_({ data: setRegistrationStatus_(body.open === true || body.open === 'true') }),
      );
    }

    if (action === 'setVotingStatus') {
      assertAdmin_(body.adminSecret);
      return jsonResponse_(
        ok_({ data: setVotingStatus_(body.open === true || body.open === 'true') }),
      );
    }

    return jsonResponse_(fail_('Ação POST inválida.'));
  } catch (error) {
    return jsonResponse_(fail_(friendlyError_(error)));
  }
}

// ---------------------------------------------------------------------------
// Business logic
// ---------------------------------------------------------------------------

function getStatusData_() {
  return {
    registrationOpen: getConfigBool_(CONFIG_REGISTRATION, true),
    votingOpen: getConfigBool_(CONFIG_VOTING, false),
    votingEnded: getConfigBool_(CONFIG_VOTING_ENDED, false),
  };
}

function getCostumesData_(deviceId) {
  var status = getStatusData_();
  var sheet = getSheet_(SHEET_FANTASIAS);
  var rows = getDataRows_(sheet);
  var safeDeviceId = String(deviceId || '').trim();
  var myCostumeId = null;
  var costumes = [];

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var id = String(row[0] || '').trim();
    var ownerDevice = String(row[1] || '').trim();
    var nome = String(row[2] || '').trim();
    var fantasia = String(row[3] || '').trim();

    if (!id) continue;

    var isMine = safeDeviceId && ownerDevice === safeDeviceId;
    if (isMine) myCostumeId = id;

    costumes.push({
      id: id,
      name: nome,
      costume: fantasia,
      isMine: isMine,
    });
  }

  return {
    costumes: costumes,
    myCostumeId: myCostumeId,
    hasVoted: safeDeviceId ? hasVoted_(safeDeviceId) : false,
    votingOpen: status.votingOpen,
    votingEnded: status.votingEnded,
    registrationOpen: status.registrationOpen,
  };
}

function registerCostume_(body) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    if (!getConfigBool_(CONFIG_REGISTRATION, true)) {
      throw userError_('Cadastro de fantasias encerrado.');
    }

    var deviceId = String(body.deviceId || '').trim();
    var name = String(body.name || '').trim();
    var costume = String(body.costume || '').trim();

    if (!deviceId) throw userError_('Identificador do aparelho ausente.');
    if (!name) throw userError_('Informe seu nome.');
    if (!costume) throw userError_('Informe sua fantasia.');
    if (name.length > MAX_NAME) throw userError_('Nome muito longo.');
    if (costume.length > MAX_COSTUME) throw userError_('Nome da fantasia muito longo.');

    var existing = findCostumeByDevice_(deviceId);
    if (existing) {
      return {
        costume: existing,
        alreadyRegistered: true,
      };
    }

    var sheet = getSheet_(SHEET_FANTASIAS);
    var id = Utilities.getUuid();
    var createdAt = formatNow_();

    sheet.appendRow([id, deviceId, name, costume, createdAt]);

    return {
      costume: {
        id: id,
        name: name,
        costume: costume,
        isMine: true,
      },
      alreadyRegistered: false,
    };
  } finally {
    lock.releaseLock();
  }
}

function vote_(body) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    if (!getConfigBool_(CONFIG_VOTING, false)) {
      if (getConfigBool_(CONFIG_VOTING_ENDED, false)) {
        throw userError_('Votação encerrada!');
      }
      throw userError_('A votação ainda não está aberta.');
    }

    var deviceId = String(body.deviceId || '').trim();
    var fantasiaId = String(body.fantasiaId || '').trim();

    if (!deviceId) throw userError_('Identificador do aparelho ausente.');
    if (!fantasiaId) throw userError_('Selecione uma fantasia.');

    if (hasVoted_(deviceId)) {
      throw userError_('Você já votou!');
    }

    var target = findCostumeById_(fantasiaId);
    if (!target) {
      throw userError_('Fantasia não encontrada.');
    }

    if (target.deviceId === deviceId) {
      throw userError_('Você não pode votar na sua própria fantasia.');
    }

    var sheet = getSheet_(SHEET_VOTOS);
    sheet.appendRow([
      Utilities.getUuid(),
      deviceId,
      fantasiaId,
      formatNow_(),
    ]);

    return { voted: true };
  } finally {
    lock.releaseLock();
  }
}

function getRankingData_() {
  var costumesSheet = getSheet_(SHEET_FANTASIAS);
  var votesSheet = getSheet_(SHEET_VOTOS);
  var costumeRows = getDataRows_(costumesSheet);
  var voteRows = getDataRows_(votesSheet);

  var byId = {};
  for (var i = 0; i < costumeRows.length; i++) {
    var c = costumeRows[i];
    var id = String(c[0] || '').trim();
    if (!id) continue;
    byId[id] = {
      id: id,
      name: String(c[2] || '').trim(),
      costume: String(c[3] || '').trim(),
      votes: 0,
    };
  }

  var totalVotes = 0;
  for (var j = 0; j < voteRows.length; j++) {
    var fantasiaId = String(voteRows[j][2] || '').trim();
    if (!fantasiaId) continue;
    totalVotes++;
    if (byId[fantasiaId]) {
      byId[fantasiaId].votes++;
    }
  }

  var list = [];
  for (var key in byId) {
    if (Object.prototype.hasOwnProperty.call(byId, key)) {
      list.push(byId[key]);
    }
  }

  list.sort(function (a, b) {
    if (b.votes !== a.votes) return b.votes - a.votes;
    return String(a.costume).localeCompare(String(b.costume), 'pt-BR');
  });

  var ranking = list.map(function (entry, index) {
    return {
      position: index + 1,
      id: entry.id,
      name: entry.name,
      costume: entry.costume,
      votes: entry.votes,
    };
  });

  return {
    ranking: ranking,
    totalVotes: totalVotes,
    totalCostumes: list.length,
    status: getStatusData_(),
  };
}

function setRegistrationStatus_(open) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    setConfigBool_(CONFIG_REGISTRATION, open);
    return getStatusData_();
  } finally {
    lock.releaseLock();
  }
}

function setVotingStatus_(open) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    setConfigBool_(CONFIG_VOTING, open);
    if (open) {
      setConfigBool_(CONFIG_VOTING_ENDED, false);
    } else {
      setConfigBool_(CONFIG_VOTING_ENDED, true);
    }
    return getStatusData_();
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Sheet helpers
// ---------------------------------------------------------------------------

function getSheet_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) {
    throw userError_('Aba "' + name + '" não encontrada. Execute setupSpreadsheet().');
  }
  return sheet;
}

function getDataRows_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  return sheet.getRange(2, 1, lastRow, lastCol).getValues();
}

function findCostumeByDevice_(deviceId) {
  var rows = getDataRows_(getSheet_(SHEET_FANTASIAS));
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][1] || '').trim() === deviceId) {
      return {
        id: String(rows[i][0] || '').trim(),
        name: String(rows[i][2] || '').trim(),
        costume: String(rows[i][3] || '').trim(),
        isMine: true,
      };
    }
  }
  return null;
}

function findCostumeById_(fantasiaId) {
  var rows = getDataRows_(getSheet_(SHEET_FANTASIAS));
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0] || '').trim() === fantasiaId) {
      return {
        id: fantasiaId,
        deviceId: String(rows[i][1] || '').trim(),
        name: String(rows[i][2] || '').trim(),
        costume: String(rows[i][3] || '').trim(),
      };
    }
  }
  return null;
}

function hasVoted_(deviceId) {
  var rows = getDataRows_(getSheet_(SHEET_VOTOS));
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][1] || '').trim() === deviceId) {
      return true;
    }
  }
  return false;
}

function getConfigBool_(key, defaultValue) {
  var sheet = getSheet_(SHEET_CONFIG);
  var rows = getDataRows_(sheet);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0] || '').trim() === key) {
      return parseBool_(rows[i][1], defaultValue);
    }
  }
  return defaultValue;
}

function setConfigBool_(key, value) {
  var sheet = getSheet_(SHEET_CONFIG);
  var lastRow = sheet.getLastRow();
  var text = value ? 'TRUE' : 'FALSE';

  if (lastRow < 2) {
    sheet.appendRow([key, text]);
    return;
  }

  var range = sheet.getRange(2, 1, lastRow, 2);
  var values = range.getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim() === key) {
      sheet.getRange(i + 2, 2).setValue(text);
      return;
    }
  }

  sheet.appendRow([key, text]);
}

function parseBool_(value, defaultValue) {
  if (value === true || value === false) return value;
  var text = String(value || '')
    .trim()
    .toUpperCase();
  if (text === 'TRUE' || text === '1' || text === 'SIM' || text === 'YES') {
    return true;
  }
  if (text === 'FALSE' || text === '0' || text === 'NAO' || text === 'NÃO' || text === 'NO') {
    return false;
  }
  return defaultValue;
}

function formatNow_() {
  return Utilities.formatDate(
    new Date(),
    'America/Sao_Paulo',
    'dd/MM/yyyy HH:mm:ss',
  );
}

// ---------------------------------------------------------------------------
// Auth / response helpers
// ---------------------------------------------------------------------------

function assertAdmin_(secret) {
  var expected = PropertiesService.getScriptProperties().getProperty('ADMIN_SECRET');
  if (!expected) {
    throw userError_('ADMIN_SECRET não configurado no Apps Script.');
  }
  if (String(secret || '') !== expected) {
    throw userError_('Não autorizado.');
  }
}

function userError_(message) {
  var error = new Error(message);
  error.userFacing = true;
  return error;
}

function friendlyError_(error) {
  if (error && error.userFacing && error.message) {
    return error.message;
  }
  return 'Ops! Não conseguimos processar agora. Tente novamente em alguns segundos.';
}

function ok_(payload) {
  return {
    success: true,
    data: payload.data,
  };
}

function fail_(message) {
  return {
    success: false,
    error: message,
  };
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
