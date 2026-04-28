const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json({ limit: '2mb' }));
const ROOT = __dirname;
const SCALE_DATA_DIR = path.join(ROOT, 'apps', 'escalas', 'data');
const SCALE_STATE_FILE = path.join(SCALE_DATA_DIR, 'state.json');

if (!fs.existsSync(SCALE_DATA_DIR)) {
  fs.mkdirSync(SCALE_DATA_DIR, { recursive: true });
}

if (!fs.existsSync(SCALE_STATE_FILE)) {
  fs.writeFileSync(SCALE_STATE_FILE, JSON.stringify({}, null, 2), 'utf8');
}

app.use(express.static(path.join(ROOT, 'public')));
app.use('/relatorios', express.static(path.join(ROOT, 'apps', 'relatorios', 'public')));
app.use('/escalas', express.static(path.join(ROOT, 'apps', 'escalas')));

function sendScaleState(req, res) {
  try {
    const raw = fs.readFileSync(SCALE_STATE_FILE, 'utf8');
    res.json(JSON.parse(raw || '{}'));
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível ler a escala salva.' });
  }
}

function saveScaleState(req, res) {
  try {
    fs.writeFileSync(SCALE_STATE_FILE, JSON.stringify(req.body || {}, null, 2), 'utf8');
    res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível salvar a escala.' });
  }
}

app.get(['/api/state', '/escalas/api/state'], sendScaleState);
app.post(['/api/state', '/escalas/api/state'], saveScaleState);

app.get('/relatorios', (req, res) => res.redirect('/relatorios/'));
app.get('/escalas', (req, res) => res.redirect('/escalas/'));

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanText(value) {
  return String(value ?? '').trim();
}

function normalizeStatus(value) {
  const text = cleanText(value).toLowerCase();
  if (text === 'atenção' || text === 'atencao') return 'atenção';
  if (text === 'falha') return 'falha';
  return 'normal';
}

function composeHorario(dados) {
  const horario = cleanText(dados.horario);
  if (horario) return horario;

  const inicio = cleanText(dados.horarioInicio);
  const fim = cleanText(dados.horarioFim);
  if (inicio && fim) return `${inicio} às ${fim}`;
  return inicio || fim || '';
}

function normalizeReport(dados = {}) {
  const identificacao = dados.identificacao || {};
  const checklist = dados.checklist || {};
  const execucao = dados.execucao || {};

  return {
    jornal: cleanText(dados.jornal ?? identificacao.jornal ?? ''),
    data: cleanText(dados.data ?? identificacao.data ?? ''),
    horarioInicio: cleanText(dados.horarioInicio ?? identificacao.horarioInicio ?? ''),
    horarioFim: cleanText(dados.horarioFim ?? identificacao.horarioFim ?? ''),
    horario: composeHorario({
      horario: dados.horario ?? identificacao.horario ?? '',
      horarioInicio: dados.horarioInicio ?? identificacao.horarioInicio ?? '',
      horarioFim: dados.horarioFim ?? identificacao.horarioFim ?? '',
    }),
    equipe: cleanText(dados.equipe ?? identificacao.equipe ?? ''),
    switcher: {
      playout: normalizeStatus(dados.switcher?.playout ?? checklist.switcher?.playout ?? ''),
      integracao: normalizeStatus(dados.switcher?.integracao ?? checklist.switcher?.integracao ?? ''),
      estacoes: normalizeStatus(dados.switcher?.estacoes ?? checklist.switcher?.estacoes ?? ''),
      graficas: normalizeStatus(dados.switcher?.graficas ?? checklist.switcher?.graficas ?? ''),
      mesaAudio: normalizeStatus(dados.switcher?.mesaAudio ?? checklist.switcher?.mesaAudio ?? ''),
      lu610: cleanText(dados.switcher?.lu610 ?? checklist.switcher?.lu610 ?? ''),
    },
    estudio: {
      microfones: normalizeStatus(dados.estudio?.microfones ?? checklist.estudio?.microfones ?? ''),
      pilhas: normalizeStatus(dados.estudio?.pilhas ?? checklist.estudio?.pilhas ?? ''),
      iluminacao: normalizeStatus(dados.estudio?.iluminacao ?? checklist.estudio?.iluminacao ?? ''),
      celulares: normalizeStatus(dados.estudio?.celulares ?? checklist.estudio?.celulares ?? ''),
    },
    execucao: {
      horarioTeste: cleanText(dados.execucao?.horarioTeste ?? execucao.horarioTeste ?? dados.horarioTeste ?? ''),
      horarioPreparacao: cleanText(dados.execucao?.horarioPreparacao ?? execucao.horarioPreparacao ?? dados.horarioPreparacao ?? ''),
      horarioPosicionamento: cleanText(dados.execucao?.horarioPosicionamento ?? execucao.horarioPosicionamento ?? dados.horarioPosicionamento ?? ''),
      horarioTestePlayout: cleanText(dados.execucao?.horarioTestePlayout ?? execucao.horarioTestePlayout ?? dados.horarioTestePlayout ?? ''),
      horarioTesteMicrofones: cleanText(dados.execucao?.horarioTesteMicrofones ?? execucao.horarioTesteMicrofones ?? dados.horarioTesteMicrofones ?? ''),
      nomeEditorChefe: cleanText(dados.execucao?.nomeEditorChefe ?? execucao.nomeEditorChefe ?? dados.nomeEditorChefe ?? ''),
      modoPlayout: cleanText(dados.execucao?.modoPlayout ?? execucao.modoPlayout ?? dados.modoPlayout ?? ''),
      observacao: cleanText(dados.execucao?.observacao ?? execucao.observacao ?? dados.execObservacao ?? ''),
    },
    houveOcTec: cleanText(dados.houveOcTec ?? ''),
    ocorrenciasTecnicas: Array.isArray(dados.ocorrenciasTecnicas) ? dados.ocorrenciasTecnicas.map(cleanText).filter(Boolean) : [],
    houveOcOp: cleanText(dados.houveOcOp ?? ''),
    ocorrenciasOperacionais: Array.isArray(dados.ocorrenciasOperacionais) ? dados.ocorrenciasOperacionais.map(cleanText).filter(Boolean) : [],
    participacoes: Array.isArray(dados.participacoes) ? dados.participacoes : [],
    entradasAoVivo: Array.isArray(dados.entradasAoVivo) ? dados.entradasAoVivo : Array.isArray(dados.aovivo) ? dados.aovivo : [],
    outrasInfo: cleanText(dados.outrasInfo ?? ''),
  };
}

function statusLabel(value) {
  const normalized = normalizeStatus(value);
  if (normalized === 'atenção') return 'atenção';
  if (normalized === 'falha') return 'falha';
  return 'normal';
}

function renderStatusLine(label, value) {
  return `<p>✅ <strong>${escapeHtml(label)}:</strong> ${escapeHtml(statusLabel(value))}</p>`;
}

function renderChecklist(items) {
  return items.join('\n');
}

function renderParagraphs(text) {
  const lines = cleanText(text)
    ? String(text)
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  if (!lines.length) {
    return '<p>✅ Nenhuma informação registrada.</p>';
  }

  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('\n');
}

function renderList(items, emptyMessage) {
  if (!items.length) {
    return `<p>✅ ${escapeHtml(emptyMessage)}</p>`;
  }

  return items
    .map((item, index) => `<p>${index + 1}️⃣ ${escapeHtml(item)}</p>`)
    .join('\n');
}

function renderParticipation(p, index) {
  const bloco = cleanText(p.bloco || p.blocoSelecionado || '');
  const equipe = cleanText(p.equipeConvidado || p.equipe || p.descricao || '');
  const quadro = cleanText(p.quadro || '');
  const cenario = cleanText(p.cenario || '');
  const observacao = cleanText(p.observacao || '');

  if (!bloco && !equipe && !quadro && !cenario && !observacao) {
    return '';
  }

  return `
    <div style="margin-bottom:14px;">
      <p><strong>🔹 ${index + 1}º Bloco:</strong> ${escapeHtml(bloco || '-')}</p>
      <p><strong>Equipe/Convidado:</strong> ${escapeHtml(equipe || '-')}</p>
      <p><strong>Quadro:</strong> ${escapeHtml(quadro || '-')}</p>
      <p><strong>Cenário:</strong> ${escapeHtml(cenario || '-')}</p>
      <p><strong>Observação:</strong> ${escapeHtml(observacao || '-')}</p>
    </div>
  `;
}

function renderLiveEntry(entry, title) {
  const praca = cleanText(entry.praca || entry.local || '');
  const equipamento = cleanText(entry.equipamento || entry.tipo || '');
  const reporter = cleanText(entry.reporter || entry.nome || '');
  const conectado = cleanText(entry.conectado || entry.conectadoEm || '');
  const testado = cleanText(entry.testado || entry.inicio || '');
  const entrada = cleanText(entry.entrada || '');
  const encerramento = cleanText(entry.encerramento || entry.fim || '');
  const resultado = cleanText(entry.resultado || '');
  const observacao = cleanText(entry.observacao || '');

  if (!praca && !equipamento && !reporter && !conectado && !testado && !entrada && !encerramento && !resultado && !observacao) {
    return '';
  }

  return `
    <div style="margin-bottom:16px;">
      <p><strong>${escapeHtml(title)}</strong></p>
      <p><strong>📍 Praça:</strong> ${escapeHtml(praca || '-')}</p>
      <p><strong>Equipamento:</strong> ${escapeHtml(equipamento || '-')}</p>
      <p><strong>Repórter:</strong> ${escapeHtml(reporter || '-')}</p>
      <p><strong>Horário conectado:</strong> ${escapeHtml(conectado || '-')}</p>
      <p><strong>Horário testado:</strong> ${escapeHtml(testado || '-')}</p>
      <p><strong>Horário entrada:</strong> ${escapeHtml(entrada || '-')}</p>
      <p><strong>Horário encerramento:</strong> ${escapeHtml(encerramento || '-')}</p>
      <p><strong>Resultado:</strong> ${escapeHtml(resultado || '-')}</p>
      <p><strong>Observação:</strong> ${escapeHtml(observacao || '-')}</p>
    </div>
  `;
}

function renderLinePrefix(prefix, text) {
  if (!cleanText(text)) return '';
  return `${prefix} ${cleanText(text)}`;
}

function renderReportText(dados) {
  const report = normalizeReport(dados);
  const lines = [];

  lines.push(`🔰  *RELATÓRIO JORNAL ${report.jornal || '-'}* 🔰`);
  lines.push(`🗓️  *DATA:* ${report.data || '-'}`);
  lines.push(`⌚ *Horário:* ${report.horario || '-'}`);
  lines.push(`👨‍🔧  *Equipe Técnica:* ${report.equipe || '-'}.`);
  lines.push(`--`);
  lines.push(`📝 *CHECKLIST | Tecnologia - ${report.jornal || '-'}*`);
  lines.push('');
  lines.push(`🎛️ *SWITCHER - JORNALISMO*`);
  lines.push(`✅ Playout 1 / Playout 2: ${statusLabel(report.switcher.playout)}`);
  lines.push(`✅ Integração anews: ${statusLabel(report.switcher.integracao)}`);
  lines.push(`✅️ Estações ( Produtor / NB Visão / BG / OBS / Interação ): ${statusLabel(report.switcher.estacoes).replace(/^./, (m) => m.toUpperCase())}`);
  lines.push(`✅️ Estações gráficas ( Axymettria / vMix / GC / TP ): ${statusLabel(report.switcher.graficas).replace(/^./, (m) => m.toUpperCase())}`);
  lines.push(`✅ Mesa de áudio : ${statusLabel(report.switcher.mesaAudio)}`);
  lines.push(`✅ Lu610: ${report.switcher.lu610 || '-'}`);
  lines.push('');
  lines.push(`📹 *ESTÚDIO - JORNALISMO*`);
  lines.push(`✅ Microfones / Retorno: ${statusLabel(report.estudio.microfones)}`);
  lines.push(`✅ Pilhas / Baterias: ${statusLabel(report.estudio.pilhas)}`);
  lines.push(`✅ Iluminação / LEDs / TVs: ${statusLabel(report.estudio.iluminacao)}`);
  lines.push(`✅ Celulares produtor: ${statusLabel(report.estudio.celulares)}`);
  lines.push(`---`);
  lines.push(`🎬 *EXECUÇÃO DO JORNAL*`);
  lines.push('');
  lines.push(`⏱️  *Testes do jornal*`);
  lines.push(`🟢 Horário: ${report.execucao.horarioTeste || '-'}`);
  if (report.execucao.horarioPreparacao) {
    lines.push(`✅ Às *${report.execucao.horarioPreparacao}*, a equipe técnica iniciou a preparação e os testes dos equipamentos para a transmissão do jornal, com todos os sistemas operando normalmente.`);
  }
  if (report.execucao.horarioPosicionamento) {
    lines.push(`✅ Às *${report.execucao.horarioPosicionamento}*, as equipes de Tecnologia e Jornalismo iniciaram o posicionamento no switcher para a execução do jornal.`);
  }
  if (report.execucao.horarioTestePlayout) {
    lines.push(`🔹 Às *${report.execucao.horarioTestePlayout}*, foi realizado teste de *Playout*, após solicitação da central via intercom.`);
  }
  if (report.execucao.horarioTesteMicrofones) {
    lines.push(`🔹 Às *${report.execucao.horarioTesteMicrofones}*, foram realizados os testes de microfones e do ponto eletrônico. Sem registro de falhas.`);
  }
  if (cleanText(report.execucao.nomeEditorChefe)) {
    lines.push(`✅ ${report.execucao.nomeEditorChefe} utilizou os playouts em modo ${cleanText(report.execucao.modoPlayout) || 'normal'}, sem registro de falhas.`);
  }
  if (cleanText(report.execucao.observacao)) {
    lines.push(`✅ ${report.execucao.observacao}`);
  }
  lines.push(`---`);
  lines.push(`⚠️ *Ocorrências Técnicas:*`);
  if (report.ocorrenciasTecnicas.length) {
    report.ocorrenciasTecnicas.forEach((item, index) => {
      lines.push(`${index + 1}️⃣ ${item}`);
    });
  } else {
    lines.push(`✅ Nao houve outros registros de ocorrências técnicas.`);
  }
  lines.push(`---`);
  lines.push(`⚠️ *Ocorrências Operacionais:*`);
  if (report.ocorrenciasOperacionais.length) {
    report.ocorrenciasOperacionais.forEach((item, index) => {
      lines.push(`${index + 1}️⃣ ${item}`);
    });
  } else {
    lines.push(`✅️ Não foram observados outros erros operacionais durante a execução do jornal.`);
  }
  if (cleanText(report.outrasInfo)) {
    lines.push(`---`);
    lines.push(`📌 *Outras Informações:*`);
    String(report.outrasInfo)
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => lines.push(`✅ ${line}`));
  }
  lines.push(`---`);
  lines.push(`🎙️ *Participações no Estúdio:*`);
  if (report.participacoes.length) {
    report.participacoes.forEach((p) => {
      const bloco = cleanText(p.bloco || p.blocoSelecionado || '');
      const equipe = cleanText(p.equipeConvidado || p.equipe || p.descricao || '');
      const quadro = cleanText(p.quadro || '');
      const cenario = cleanText(p.cenario || '');
      const observacao = cleanText(p.observacao || '');
      lines.push(`🔹 *${bloco || '-'}º Bloco:* Recebemos no estúdio ${equipe ? `o ${equipe}` : 'a participação'}${quadro ? `, para o quadro *${quadro}*` : ''}.${cenario ? ` A participação ocorreu no cenário ${cenario}` : ''}${observacao ? `, ${observacao}` : '.'}`);
    });
  } else {
    lines.push(`✅️ Não houve participação no estúdio.`);
  }
  lines.push(`---`);
  lines.push(`🔴 *Entradas ao Vivo – Testes e Execução*`);

  const grouped = report.entradasAoVivo.reduce((acc, entry) => {
    const praca = cleanText(entry.praca || entry.local || 'Outra');
    if (!acc[praca]) acc[praca] = [];
    acc[praca].push(entry);
    return acc;
  }, {});

  const groupNames = Object.keys(grouped);
  if (groupNames.length) {
    groupNames.forEach((praca) => {
      lines.push(`📍 *${praca}:*`);
      lines.push('');
      grouped[praca].forEach((entry, index) => {
        const equipamento = cleanText(entry.equipamento || entry.tipo || '');
        const reporter = cleanText(entry.reporter || entry.nome || '');
        const conectado = cleanText(entry.conectado || '');
        const testado = cleanText(entry.testado || entry.inicio || '');
        const entrada = cleanText(entry.entrada || '');
        const encerramento = cleanText(entry.encerramento || entry.fim || '');
        const resultado = cleanText(entry.resultado || '');
        lines.push(`🔹*${index + 1}ª Ao vivo (${equipamento || 'outro'}) - ${reporter || '-'}*  Conectado às *${conectado || '-'}* testado às *${testado || '-'}*`);
        lines.push(`Entrada às *${entrada || '-'}* encerramento às *${encerramento || '-'}*. ${resultado ? `Transmissão realizada com ${resultado}.` : ''}`.trim());
        if (cleanText(entry.observacao) && entry.observacao !== 'Transmissão realizada com sucesso.') {
          lines.push(cleanText(entry.observacao));
        }
        lines.push('');
      });
      lines.push('---');
    });
  } else {
    lines.push(`✅ Nenhuma entrada ao vivo registrada.`);
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function renderReportHtml(dados) {
  const report = normalizeReport(dados);
  const text = renderReportText(report);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Relatório ${escapeHtml(report.jornal)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background:#f1f5f9; margin:0; padding:24px; color:#111827; }
    .container { max-width: 980px; margin: 0 auto; }
    .card { background:#fff; border-radius:16px; padding:20px 22px; margin-bottom:18px; box-shadow:0 8px 24px rgba(15,23,42,0.08); }
    h1 { margin:0 0 12px 0; font-size:28px; }
    .section-title { font-weight:700; margin-bottom:12px; font-size:18px; color:#0f172a; }
    pre { white-space: pre-wrap; word-break: break-word; margin:0; font-family: inherit; line-height:1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <pre>${escapeHtml(text)}</pre>
    </div>
  </div>
</body>
</html>`;
}

function sanitizePdfText(text) {
  let sanitized = String(text ?? '')
    .replace(/([0-9])\uFE0F?\u20E3/g, '$1.')
    .replace(/\*/g, '')
    .replace(/[\u200D\uFE0F]/g, '')
    .replace(/\r\n/g, '\n');

  try {
    sanitized = sanitized.replace(new RegExp('\\p{Extended_Pictographic}', 'gu'), '');
  } catch (err) {
    sanitized = sanitized
      .replace(/[\u2300-\u23FF]/g, '')
      .replace(/[\u2600-\u27BF]/g, '')
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
  }

  return sanitized
    .split('\n')
    .map((line) => line.replace(/[ \t]{2,}/g, ' ').trim())
    .map((line) => (/^-+$/.test(line) ? '' : line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderPdfText(dados) {
  return sanitizePdfText(renderReportText(dados));
}

app.post(['/gerar', '/relatorios/gerar'], (req, res) => {
  try {
    const html = renderReportHtml(req.body || {});
    res.type('html').send(html);
  } catch (err) {
    console.error('gerar error', err);
    res.status(500).json({ error: err.message });
  }
});

app.post(['/gerar-pdf', '/relatorios/gerar-pdf'], async (req, res) => {
  try {
    const text = renderPdfText(req.body || {});

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ autoFirstPage: true, margin: 36 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      res.set('Content-Type', 'application/pdf');
      res.send(result);
    });

    doc.font('Helvetica').fontSize(11).text(text, { lineGap: 4 });
    doc.end();
  } catch (err) {
    console.error('pdf error', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Central de Operações rodando em http://localhost:${PORT}`);
});
