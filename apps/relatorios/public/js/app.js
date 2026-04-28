const STATUS_OPTIONS = ['normal', 'atenção', 'falha'];
const YES_NO_OPTIONS = ['não', 'sim'];
const PLAYOUT_OPTIONS = ['integração eMAM/Anews', 'playout local', 'Outro / digitar manualmente'];
const EDITOR_OPTIONS = ['Selecione', 'Luana Rodrigues', 'Gustavo Almeida', 'Gabrielle Mandu', 'Outro / digitar manualmente'];
const QUADRO_OPTIONS = ['Selecione', 'Seus Direitos', 'Equipe GE', 'Bom dia Doutor', 'Na ponta do lápis', 'Quero trabalhar', 'Outro / digitar manualmente'];
const CENARIO_OPTIONS = ['Selecione', 'real', 'virtual', 'misto', 'Outro / digitar manualmente'];
const BLOCO_OPTIONS = ['Selecione', '1', '2', '3', '4', 'Outro / digitar manualmente'];
const REPORTER_OPTIONS = ['Selecione', 'Amanda Oliveira', 'Carla Carvalho', 'Richard Lauriano', 'Junior Andrade', 'Eldsion Junior', 'Lucas Thadeu', 'Pedro Marcelo', 'Outro / digitar manualmente'];
const PRACA_OPTIONS = ['Selecione', 'Rio Branco (RBR)', 'Cruzeiro do Sul (CZS)', 'Brasiléia', 'Sena Madureira', 'Tarauacá', 'Feijó', 'Outro / digitar manualmente'];
const EQUIPAMENTO_OPTIONS = ['Selecione', 'LuS300', 'LuSmart', 'LU610', 'TVU', 'Outro / digitar manualmente'];
const LIVE_RESULT_OPTIONS = ['Selecione', 'sucesso', 'oscilação', 'cancelado', 'sem participação', 'Outro / digitar manualmente'];
const TEAM_OPTIONS = ['Giordano Casagranda', 'Cladeylton', 'Felipe Oliveira', 'Alan Cairo', 'Bruno Martins', 'Gabryel Castro', 'Igor Veras', 'Edinho Maia'];
const MANUAL_OPTION = 'Outro / digitar manualmente';

const presets = {
  BDAC: {
    jornal: 'BDAC',
    horarioInicio: '07:30',
    horarioFim: '09:00',
    equipe: ['Igor Veras', 'Cladeylton'],
    lu610: '4,960 Kbps',
    editor: 'Luana Rodrigues',
    modoPlayout: 'integração eMAM/Anews',
  },
  JAC1: {
    jornal: 'JAC1',
    horarioInicio: '11:44',
    horarioFim: '13:04',
    equipe: ['Igor Veras', 'Cladeylton', 'Bruno Martins'],
    lu610: '4,754 Kbps',
    editor: 'Gustavo Almeida',
    modoPlayout: 'playout local',
  },
  JAC2: {
    jornal: 'JAC2',
    horarioInicio: '17:07',
    horarioFim: '17:37',
    equipe: ['Bruno Martins', 'Cladeylton'],
    lu610: '4,943 Kbps',
    editor: 'Gabrielle Mandu',
    modoPlayout: 'integração eMAM/Anews',
  },
};

function qs(id) { return document.getElementById(id); }
function qsa(selector, parent = document) { return Array.from(parent.querySelectorAll(selector)); }
function cleanText(value) { return String(value ?? '').trim(); }
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function currentTimeHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
function formatDateBR(iso) {
  if (!iso) return '';
  const parts = String(iso).split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : iso;
}
function createEl(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') el.className = value;
    else if (key === 'text') el.textContent = value;
    else if (key === 'html') el.innerHTML = value;
    else if (value !== undefined && value !== null) el.setAttribute(key, value);
  });
  (Array.isArray(children) ? children : [children]).filter(Boolean).forEach((child) => el.appendChild(child));
  return el;
}
function createField(labelText, control) {
  return createEl('div', { className: 'field' }, [createEl('label', { text: labelText }), control]);
}
function createInput(attrs = {}) { return createEl('input', attrs); }
function createTextarea(attrs = {}) { return createEl('textarea', attrs); }
function createSelect(options, attrs = {}) {
  const select = createEl('select', attrs);
  options.forEach((value) => select.appendChild(createEl('option', { value, text: value || 'Selecione' })));
  return select;
}
function setSelectOptions(id, options) {
  const select = qs(id);
  select.innerHTML = '';
  options.forEach((value) => select.appendChild(createEl('option', { value, text: value })));
}
function statusLabel(value) {
  const normalized = cleanText(value).toLowerCase();
  if (normalized === 'atencao' || normalized === 'atenção') return 'atenção';
  if (normalized === 'falha') return 'falha';
  return 'normal';
}

function bindManualToggle(select, input) {
  const update = () => input.classList.toggle('hidden', select.value !== MANUAL_OPTION);
  select.addEventListener('change', update);
  update();
}
function comboValue(select, input) {
  return select.value === MANUAL_OPTION ? cleanText(input.value) : (select.value === 'Selecione' ? '' : cleanText(select.value));
}
function setComboValue(select, input, value) {
  const text = cleanText(value);
  const options = Array.from(select.options).map((opt) => opt.value);
  if (!text) {
    select.value = options.includes('Selecione') ? 'Selecione' : '';
    input.value = '';
  } else if (options.includes(text)) {
    select.value = text;
    input.value = '';
  } else {
    select.value = MANUAL_OPTION;
    input.value = text;
  }
  input.classList.toggle('hidden', select.value !== MANUAL_OPTION);
}

function createMultiSelect(containerId, options) {
  const container = qs(containerId);
  container.innerHTML = '';
  const trigger = createEl('button', { type: 'button', className: 'multi-trigger', text: 'Selecionar equipe técnica' });
  const panel = createEl('div', { className: 'multi-panel hidden' });
  const list = createEl('div', { className: 'check-list' });
  const chips = createEl('div', { className: 'chips' });
  const hint = createEl('div', { className: 'manual-note', text: 'Você pode marcar mais de um nome.' });

  options.forEach((name) => {
    const checkbox = createEl('input', { type: 'checkbox', value: name, 'data-team': '1' });
    const label = createEl('label', { className: 'check-item' }, [checkbox, createEl('span', { text: name })]);
    list.appendChild(label);
    checkbox.addEventListener('change', update);
  });

  function getValues() {
    return qsa('input[data-team]:checked', panel).map((item) => item.value);
  }
  function setValues(values) {
    const set = new Set(values || []);
    qsa('input[data-team]', panel).forEach((item) => { item.checked = set.has(item.value); });
    update();
  }
  function update() {
    const selected = getValues();
    chips.innerHTML = '';
    if (!selected.length) {
      trigger.textContent = 'Selecionar equipe técnica';
      chips.appendChild(createEl('span', { className: 'chip', text: 'Nenhum nome selecionado' }));
      return;
    }
    trigger.textContent = `${selected.length} selecionado(s)`;
    selected.forEach((value) => chips.appendChild(createEl('span', { className: 'chip', text: value })));
  }

  trigger.addEventListener('click', () => panel.classList.toggle('hidden'));
  document.addEventListener('click', (event) => {
    if (!container.contains(event.target)) panel.classList.add('hidden');
  });

  panel.appendChild(hint);
  panel.appendChild(list);
  container.appendChild(trigger);
  container.appendChild(panel);
  container.appendChild(chips);
  update();
  return { getValues, setValues };
}

let equipeTecnicaControl;

function fillBaseOptions() {
  ['switcher_playout', 'switcher_integracao', 'switcher_estacoes', 'switcher_graficas', 'switcher_mesaAudio', 'studio_microfones', 'studio_pilhas', 'studio_iluminacao', 'studio_celulares']
    .forEach((id) => setSelectOptions(id, STATUS_OPTIONS));
  setSelectOptions('oc_tecnica_houve', YES_NO_OPTIONS);
  setSelectOptions('oc_operacional_houve', YES_NO_OPTIONS);
  setSelectOptions('nomeEditorChefe', EDITOR_OPTIONS);
  setSelectOptions('modoPlayout', PLAYOUT_OPTIONS);
  bindManualToggle(qs('nomeEditorChefe'), qs('nomeEditorChefeManual'));
  bindManualToggle(qs('modoPlayout'), qs('modoPlayoutManual'));
  equipeTecnicaControl = createMultiSelect('equipeTecnicaMulti', TEAM_OPTIONS);
}

function setStatusDefaults() {
  ['switcher_playout', 'switcher_integracao', 'switcher_estacoes', 'switcher_graficas', 'switcher_mesaAudio', 'studio_microfones', 'studio_pilhas', 'studio_iluminacao', 'studio_celulares']
    .forEach((id) => { qs(id).value = 'normal'; });
}

function updateClock() {
  const now = new Date();
  qs('computerClock').textContent = now.toLocaleTimeString('pt-BR');
  qs('computerDate').textContent = now.toLocaleDateString('pt-BR');
}

function setSelectedModelLabel(value) {
  qs('selectedModelLabel').textContent = value || 'Custom';
}

function updateOccurrenceUI(type) {
  const select = qs(type === 'tecnica' ? 'oc_tecnica_houve' : 'oc_operacional_houve');
  const list = qs(type === 'tecnica' ? 'ocTechList' : 'ocOpList');
  const empty = qs(type === 'tecnica' ? 'ocTechState' : 'ocOpState');
  const hasOccurrence = select.value === 'sim';
  const hasItems = list.children.length > 0;
  list.classList.toggle('hidden', !hasItems);
  empty.classList.toggle('hidden', hasItems);
  if (!hasItems) {
    empty.textContent = hasOccurrence ? 'Clique em “Adicionar” para registrar a ocorrência.' : 'Nenhuma ocorrência adicionada.';
  }
}
function renumberOccurrenceItems(type) {
  const list = qs(type === 'tecnica' ? 'ocTechList' : 'ocOpList');
  qsa('.repeat-card', list).forEach((card, index) => {
    const title = card.querySelector('h4');
    if (title) title.textContent = `Ocorrência ${index + 1}`;
  });
}
function addOccurrenceItem(type, value = '') {
  const select = qs(type === 'tecnica' ? 'oc_tecnica_houve' : 'oc_operacional_houve');
  select.value = 'sim';
  const list = qs(type === 'tecnica' ? 'ocTechList' : 'ocOpList');
  const textarea = createTextarea({ rows: '4', placeholder: 'Descreva a ocorrência...' });
  textarea.value = value;
  const card = createEl('div', { className: 'repeat-card' }, [
    createEl('div', { className: 'repeat-header' }, [
      createEl('h4', { text: 'Ocorrência' }),
      createEl('button', { type: 'button', className: 'btn-small btn-danger', text: 'Remover' }),
    ]),
    createField('Descrição', textarea),
  ]);
  card.querySelector('button').addEventListener('click', () => {
    card.remove();
    renumberOccurrenceItems(type);
    updateOccurrenceUI(type);
  });
  list.appendChild(card);
  renumberOccurrenceItems(type);
  updateOccurrenceUI(type);
}

function updateRepeatVisibility(containerId, emptyId) {
  const container = qs(containerId);
  const empty = qs(emptyId);
  const hasItems = container.children.length > 0;
  container.classList.toggle('hidden', !hasItems);
  empty.classList.toggle('hidden', hasItems);
}

function createComboField(label, options, fieldName, manualName, value = '') {
  const select = createSelect(options, { 'data-field': fieldName });
  const input = createInput({ 'data-manual': manualName, class: 'hidden', placeholder: 'Digite manualmente' });
  bindManualToggle(select, input);
  setComboValue(select, input, value);
  return createField(label, createEl('div', { className: 'combo-wrap' }, [select, input]));
}
function getComboValueFromCard(card, fieldName, manualName) {
  const select = card.querySelector(`[data-field="${fieldName}"]`);
  const input = card.querySelector(`[data-manual="${manualName}"]`);
  return comboValue(select, input);
}

function updateParticipationTitle(card) {
  const bloco = getComboValueFromCard(card, 'bloco', 'blocoManual');
  const quadro = getComboValueFromCard(card, 'quadro', 'quadroManual');
  const equipe = cleanText(card.querySelector('[data-field="equipeConvidado"]').value);
  const title = card.querySelector('[data-role="title"]');
  title.textContent = `Participação${bloco ? ` ${bloco}º bloco` : ''}${quadro ? ` — ${quadro}` : equipe ? ` — ${equipe}` : ''}`;
}
function addParticipationItem(data = {}) {
  const blocoField = createComboField('Bloco', BLOCO_OPTIONS, 'bloco', 'blocoManual', data.bloco || '');
  const equipe = createInput({ 'data-field': 'equipeConvidado', placeholder: 'Equipe ou convidado' });
  equipe.value = data.equipeConvidado || '';
  const quadroField = createComboField('Quadro', QUADRO_OPTIONS, 'quadro', 'quadroManual', data.quadro || '');
  const cenarioField = createComboField('Cenário', CENARIO_OPTIONS, 'cenario', 'cenarioManual', data.cenario || '');
  const observacao = createTextarea({ 'data-field': 'observacao', rows: '4', placeholder: 'Observação opcional.' });
  observacao.value = data.observacao || '';

  const card = createEl('div', { className: 'repeat-card' }, [
    createEl('div', { className: 'repeat-header' }, [
      createEl('h4', { 'data-role': 'title', text: 'Participação' }),
      createEl('button', { type: 'button', className: 'btn-small btn-danger', text: 'Remover' }),
    ]),
    createEl('div', { className: 'repeat-grid' }, [blocoField, createField('Equipe / convidado', equipe), quadroField, cenarioField]),
    createField('Observação', observacao),
  ]);

  qsa('input,select,textarea', card).forEach((field) => {
    field.addEventListener('input', () => updateParticipationTitle(card));
    field.addEventListener('change', () => updateParticipationTitle(card));
  });
  card.querySelector('button').addEventListener('click', () => {
    card.remove();
    updateRepeatVisibility('participacoes', 'participacoesEmpty');
  });
  qs('participacoes').appendChild(card);
  updateParticipationTitle(card);
  updateRepeatVisibility('participacoes', 'participacoesEmpty');
}

function createTimeField(fieldName, label, value = '') {
  const input = createInput({ type: 'time', 'data-field': fieldName });
  input.value = value;
  const button = createEl('button', { type: 'button', className: 'btn-now', text: 'Agora' });
  button.addEventListener('click', () => { input.value = currentTimeHHMM(); });
  return createField(label, createEl('div', { className: 'time-field' }, [input, button]));
}
function updateLiveTitle(card) {
  const reporter = getComboValueFromCard(card, 'reporter', 'reporterManual');
  const praca = getComboValueFromCard(card, 'praca', 'pracaManual');
  const equipamento = getComboValueFromCard(card, 'equipamento', 'equipamentoManual');
  const title = card.querySelector('[data-role="title"]');
  title.textContent = `Entrada ao vivo${reporter ? ` — ${reporter}` : ''}${praca ? ` / ${praca}` : equipamento ? ` / ${equipamento}` : ''}`;
}
function addLiveItem(data = {}) {
  const ativa = createSelect(YES_NO_OPTIONS, { 'data-field': 'ativa' });
  ativa.value = data.ativa || 'sim';
  const pracaField = createComboField('Praça', PRACA_OPTIONS, 'praca', 'pracaManual', data.praca || '');
  const equipamentoField = createComboField('Equipamento', EQUIPAMENTO_OPTIONS, 'equipamento', 'equipamentoManual', data.equipamento || '');
  const reporterField = createComboField('Repórter', REPORTER_OPTIONS, 'reporter', 'reporterManual', data.reporter || '');
  const resultadoField = createComboField('Resultado', LIVE_RESULT_OPTIONS, 'resultado', 'resultadoManual', data.resultado || '');
  const observacao = createTextarea({ 'data-field': 'observacao', rows: '4', placeholder: 'Observação opcional.' });
  observacao.value = data.observacao || '';

  const card = createEl('div', { className: 'repeat-card' }, [
    createEl('div', { className: 'repeat-header' }, [
      createEl('h4', { 'data-role': 'title', text: 'Entrada ao vivo' }),
      createEl('button', { type: 'button', className: 'btn-small btn-danger', text: 'Remover' }),
    ]),
    createEl('div', { className: 'repeat-grid-3' }, [
      createField('Ativa?', ativa),
      pracaField,
      equipamentoField,
      reporterField,
      resultadoField,
      createField(' ', createEl('div', { className: 'manual-note', text: 'Se não encontrar uma opção, escolha “Outro / digitar manualmente”.' })),
    ]),
    createEl('div', { className: 'repeat-grid-3' }, [
      createTimeField('conectado', 'Conectado', data.conectado || ''),
      createTimeField('testado', 'Testado', data.testado || ''),
      createTimeField('entrada', 'Entrada', data.entrada || ''),
      createTimeField('encerramento', 'Encerramento', data.encerramento || ''),
    ]),
    createField('Observação', observacao),
  ]);
  qsa('input,select,textarea', card).forEach((field) => {
    field.addEventListener('input', () => updateLiveTitle(card));
    field.addEventListener('change', () => updateLiveTitle(card));
  });
  card.querySelector('button').addEventListener('click', () => {
    card.remove();
    updateRepeatVisibility('aovivo', 'aovivoEmpty');
  });
  qs('aovivo').appendChild(card);
  updateLiveTitle(card);
  updateRepeatVisibility('aovivo', 'aovivoEmpty');
}

function clearDynamicLists() {
  qs('ocTechList').innerHTML = '';
  qs('ocOpList').innerHTML = '';
  qs('participacoes').innerHTML = '';
  qs('aovivo').innerHTML = '';
  updateOccurrenceUI('tecnica');
  updateOccurrenceUI('operacional');
  updateRepeatVisibility('participacoes', 'participacoesEmpty');
  updateRepeatVisibility('aovivo', 'aovivoEmpty');
}
function clearForm() {
  qs('jornal').value = '';
  qs('data').value = todayISO();
  qs('switcher_lu610').value = '';
  qs('horarioInicio').value = '';
  qs('horarioFim').value = '';
  qs('equipeTecnicaManual').value = '';
  equipeTecnicaControl.setValues([]);
  qs('horarioTeste').value = '';
  qs('horarioPreparacao').value = '';
  qs('horarioPosicionamento').value = '';
  qs('horarioTestePlayout').value = '';
  qs('horarioTesteMicrofones').value = '';
  setComboValue(qs('nomeEditorChefe'), qs('nomeEditorChefeManual'), '');
  setComboValue(qs('modoPlayout'), qs('modoPlayoutManual'), 'integração eMAM/Anews');
  qs('execObservacao').value = '';
  qs('outrasInfo').value = '';
  qs('oc_tecnica_houve').value = 'não';
  qs('oc_operacional_houve').value = 'não';
  setStatusDefaults();
  clearDynamicLists();
  setSelectedModelLabel('Custom');
}
function fillFromPreset(model) {
  clearForm();
  const preset = presets[model];
  if (!preset) return;
  qs('jornal').value = preset.jornal || model;
  qs('data').value = todayISO();
  qs('horarioInicio').value = preset.horarioInicio || '';
  qs('horarioFim').value = preset.horarioFim || '';
  qs('switcher_lu610').value = preset.lu610 || '';
  equipeTecnicaControl.setValues(preset.equipe || []);
  setComboValue(qs('nomeEditorChefe'), qs('nomeEditorChefeManual'), preset.editor || '');
  setComboValue(qs('modoPlayout'), qs('modoPlayoutManual'), preset.modoPlayout || '');
  setSelectedModelLabel(model);
}

function teamValues() {
  const selected = equipeTecnicaControl.getValues();
  const manual = cleanText(qs('equipeTecnicaManual').value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return [...selected, ...manual];
}
function readOccurrenceItems(type) {
  const list = qs(type === 'tecnica' ? 'ocTechList' : 'ocOpList');
  return qsa('textarea', list).map((textarea) => cleanText(textarea.value)).filter(Boolean);
}
function readParticipations() {
  return qsa('#participacoes .repeat-card').map((card) => ({
    bloco: getComboValueFromCard(card, 'bloco', 'blocoManual'),
    equipeConvidado: cleanText(card.querySelector('[data-field="equipeConvidado"]').value),
    quadro: getComboValueFromCard(card, 'quadro', 'quadroManual'),
    cenario: getComboValueFromCard(card, 'cenario', 'cenarioManual'),
    observacao: cleanText(card.querySelector('[data-field="observacao"]').value),
  })).filter((item) => Object.values(item).some(Boolean));
}
function readLiveEntries() {
  return qsa('#aovivo .repeat-card').map((card) => ({
    ativa: card.querySelector('[data-field="ativa"]').value,
    praca: getComboValueFromCard(card, 'praca', 'pracaManual'),
    equipamento: getComboValueFromCard(card, 'equipamento', 'equipamentoManual'),
    reporter: getComboValueFromCard(card, 'reporter', 'reporterManual'),
    conectado: card.querySelector('[data-field="conectado"]').value,
    testado: card.querySelector('[data-field="testado"]').value,
    entrada: card.querySelector('[data-field="entrada"]').value,
    encerramento: card.querySelector('[data-field="encerramento"]').value,
    resultado: getComboValueFromCard(card, 'resultado', 'resultadoManual'),
    observacao: cleanText(card.querySelector('[data-field="observacao"]').value),
  })).filter((item) => item.ativa === 'sim' || Object.values(item).some(Boolean));
}

function buildPayload() {
  return {
    jornal: qs('jornal').value,
    data: formatDateBR(qs('data').value),
    horarioInicio: qs('horarioInicio').value,
    horarioFim: qs('horarioFim').value,
    equipe: teamValues().join(', '),
    switcher: {
      playout: qs('switcher_playout').value,
      integracao: qs('switcher_integracao').value,
      estacoes: qs('switcher_estacoes').value,
      graficas: qs('switcher_graficas').value,
      mesaAudio: qs('switcher_mesaAudio').value,
      lu610: cleanText(qs('switcher_lu610').value),
    },
    estudio: {
      microfones: qs('studio_microfones').value,
      pilhas: qs('studio_pilhas').value,
      iluminacao: qs('studio_iluminacao').value,
      celulares: qs('studio_celulares').value,
    },
    execucao: {
      horarioTeste: qs('horarioTeste').value,
      horarioPreparacao: qs('horarioPreparacao').value,
      horarioPosicionamento: qs('horarioPosicionamento').value,
      horarioTestePlayout: qs('horarioTestePlayout').value,
      horarioTesteMicrofones: qs('horarioTesteMicrofones').value,
      nomeEditorChefe: comboValue(qs('nomeEditorChefe'), qs('nomeEditorChefeManual')),
      modoPlayout: comboValue(qs('modoPlayout'), qs('modoPlayoutManual')),
      observacao: cleanText(qs('execObservacao').value),
    },
    ocorrenciasTecnicas: qs('oc_tecnica_houve').value === 'sim' ? readOccurrenceItems('tecnica') : [],
    ocorrenciasOperacionais: qs('oc_operacional_houve').value === 'sim' ? readOccurrenceItems('operacional') : [],
    participacoes: readParticipations(),
    entradasAoVivo: readLiveEntries(),
    outrasInfo: cleanText(qs('outrasInfo').value),
  };
}

function renderReportText(dados) {
  const lines = [];
  const horario = [dados.horarioInicio, dados.horarioFim].filter(Boolean).join(' às ');
  lines.push(`🔰  *RELATÓRIO JORNAL ${dados.jornal || '-'}* 🔰`);
  lines.push(`🗓️  *DATA:* ${dados.data || '-'}`);
  lines.push(`⌚ *Horário:* ${horario || '-'}`);
  lines.push(`👨‍🔧  *Equipe Técnica:* ${dados.equipe || '-'}.`);
  lines.push(`--`);
  lines.push(`📝 *CHECKLIST | Tecnologia - ${dados.jornal || '-'}*`);
  lines.push('');
  lines.push(`🎛️ *SWITCHER - JORNALISMO*`);
  lines.push(`✅ Playout 1 / Playout 2: ${statusLabel(dados.switcher.playout)}`);
  lines.push(`✅ Integração anews: ${statusLabel(dados.switcher.integracao)}`);
  lines.push(`✅ Estações (Produtor / NB Visão / BG / OBS / Interação): ${statusLabel(dados.switcher.estacoes)}`);
  lines.push(`✅ Estações gráficas (Axymettria / vMix / GC / TP): ${statusLabel(dados.switcher.graficas)}`);
  lines.push(`✅ Mesa de áudio: ${statusLabel(dados.switcher.mesaAudio)}`);
  lines.push(`✅ Lu610: ${dados.switcher.lu610 || '-'}`);
  lines.push('');
  lines.push(`📹 *ESTÚDIO - JORNALISMO*`);
  lines.push(`✅ Microfones / Retorno: ${statusLabel(dados.estudio.microfones)}`);
  lines.push(`✅ Pilhas / Baterias: ${statusLabel(dados.estudio.pilhas)}`);
  lines.push(`✅ Iluminação / LEDs / TVs: ${statusLabel(dados.estudio.iluminacao)}`);
  lines.push(`✅ Celulares produtor: ${statusLabel(dados.estudio.celulares)}`);
  lines.push(`---`);
  lines.push(`🎬 *EXECUÇÃO DO JORNAL*`);
  if (dados.execucao.horarioTeste) lines.push(`⏱️ Horário dos testes: ${dados.execucao.horarioTeste}`);
  if (dados.execucao.horarioPreparacao) lines.push(`🟢 Início da preparação: ${dados.execucao.horarioPreparacao}`);
  if (dados.execucao.horarioPosicionamento) lines.push(`🟢 Posicionamento no switcher: ${dados.execucao.horarioPosicionamento}`);
  if (dados.execucao.horarioTestePlayout) lines.push(`🟢 Teste de playout: ${dados.execucao.horarioTestePlayout}`);
  if (dados.execucao.horarioTesteMicrofones) lines.push(`🟢 Teste de microfones: ${dados.execucao.horarioTesteMicrofones}`);
  if (dados.execucao.nomeEditorChefe) lines.push(`✅ Editor-chefe / produtor: ${dados.execucao.nomeEditorChefe}`);
  if (dados.execucao.modoPlayout) lines.push(`✅ Modo de playout: ${dados.execucao.modoPlayout}`);
  if (dados.execucao.observacao) lines.push(`✅ Observação: ${dados.execucao.observacao}`);
  lines.push(`---`);
  lines.push(`⚠️ *Ocorrências Técnicas:*`);
  if (dados.ocorrenciasTecnicas.length) {
    dados.ocorrenciasTecnicas.forEach((item, index) => lines.push(`${index + 1}️⃣ ${item}`));
  } else {
    lines.push(`✅ Não houve registros de ocorrências técnicas.`);
  }
  lines.push(`---`);
  lines.push(`⚠️ *Ocorrências Operacionais:*`);
  if (dados.ocorrenciasOperacionais.length) {
    dados.ocorrenciasOperacionais.forEach((item, index) => lines.push(`${index + 1}️⃣ ${item}`));
  } else {
    lines.push(`✅ Não houve registros de ocorrências operacionais.`);
  }
  if (dados.participacoes.length) {
    lines.push(`---`);
    lines.push(`🎙️ *Participações no estúdio:*`);
    dados.participacoes.forEach((item, index) => {
      lines.push(`🔹 *Participação ${index + 1}*`);
      lines.push(`Bloco: ${item.bloco || '-'}`);
      lines.push(`Equipe/Convidado: ${item.equipeConvidado || '-'}`);
      lines.push(`Quadro: ${item.quadro || '-'}`);
      lines.push(`Cenário: ${item.cenario || '-'}`);
      if (item.observacao) lines.push(`Observação: ${item.observacao}`);
    });
  }
  if (dados.entradasAoVivo.length) {
    lines.push(`---`);
    lines.push(`📡 *Entradas ao vivo:*`);
    dados.entradasAoVivo.forEach((item, index) => {
      lines.push(`🔹 *Ao vivo ${index + 1}*`);
      lines.push(`Ativa: ${item.ativa || '-'}`);
      lines.push(`Praça: ${item.praca || '-'}`);
      lines.push(`Equipamento: ${item.equipamento || '-'}`);
      lines.push(`Repórter: ${item.reporter || '-'}`);
      lines.push(`Conectado: ${item.conectado || '-'}`);
      lines.push(`Testado: ${item.testado || '-'}`);
      lines.push(`Entrada: ${item.entrada || '-'}`);
      lines.push(`Encerramento: ${item.encerramento || '-'}`);
      lines.push(`Resultado: ${item.resultado || '-'}`);
      if (item.observacao) lines.push(`Observação: ${item.observacao}`);
    });
  }
  if (dados.outrasInfo) {
    lines.push(`---`);
    lines.push(`📌 *Outras Informações:*`);
    String(dados.outrasInfo).split(/\n+/).map((line) => line.trim()).filter(Boolean).forEach((line) => lines.push(`✅ ${line}`));
  }
  return lines.join('\n');
}

function openForm() {
  qs('startScreen').classList.add('hidden');
  qs('resultScreen').classList.add('hidden');
  qs('reportForm').classList.remove('hidden');
}
function openStart() {
  qs('resultScreen').classList.add('hidden');
  qs('reportForm').classList.add('hidden');
  qs('startScreen').classList.remove('hidden');
}
function showResult(payload) {
  qs('reportText').value = renderReportText(payload);
  window.lastReportPayload = payload;
  qs('reportForm').classList.add('hidden');
  qs('startScreen').classList.add('hidden');
  qs('resultScreen').classList.remove('hidden');
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function expandOrCollapseAll(open) {
  qsa('#reportForm details.section').forEach((detail) => { detail.open = open; });
}

function attachEvents() {
  document.body.addEventListener('click', (event) => {
    const card = event.target.closest('.model-card');
    if (card && card.dataset.model) {
      fillFromPreset(card.dataset.model);
      openForm();
      return;
    }
    if (event.target.id === 'customStart') {
      clearForm();
      openForm();
    }
    const nowBtn = event.target.closest('.btn-now');
    if (nowBtn?.dataset.target) {
      const input = qs(nowBtn.dataset.target);
      if (input) input.value = currentTimeHHMM();
    }
  });

  qs('backToModels').addEventListener('click', () => { clearForm(); openStart(); });
  qs('markAllNormal').addEventListener('click', setStatusDefaults);
  qs('switcherAllNormal').addEventListener('click', () => ['switcher_playout', 'switcher_integracao', 'switcher_estacoes', 'switcher_graficas', 'switcher_mesaAudio'].forEach((id) => { qs(id).value = 'normal'; }));
  qs('studioAllNormal').addEventListener('click', () => ['studio_microfones', 'studio_pilhas', 'studio_iluminacao', 'studio_celulares'].forEach((id) => { qs(id).value = 'normal'; }));
  qs('expandAll').addEventListener('click', () => expandOrCollapseAll(true));
  qs('collapseAll').addEventListener('click', () => expandOrCollapseAll(false));
  qs('jornal').addEventListener('change', () => setSelectedModelLabel(qs('jornal').value || 'Custom'));
  qs('oc_tecnica_houve').addEventListener('change', () => {
    if (qs('oc_tecnica_houve').value === 'não') qs('ocTechList').innerHTML = '';
    updateOccurrenceUI('tecnica');
  });
  qs('oc_operacional_houve').addEventListener('change', () => {
    if (qs('oc_operacional_houve').value === 'não') qs('ocOpList').innerHTML = '';
    updateOccurrenceUI('operacional');
  });
  qs('addOcTec').addEventListener('click', () => addOccurrenceItem('tecnica'));
  qs('addOcOp').addEventListener('click', () => addOccurrenceItem('operacional'));
  qs('addPart').addEventListener('click', () => addParticipationItem({}));
  qs('addAoVivo').addEventListener('click', () => addLiveItem({ ativa: 'sim' }));

  qs('concluirBtn').addEventListener('click', () => {
    const payload = buildPayload();
    if (!payload.jornal) {
      alert('Selecione um jornal antes de gerar o relatório.');
      return;
    }
    showResult(payload);
  });

  qs('copyReport').addEventListener('click', async () => {
    if (!qs('reportText').value) return;
    await navigator.clipboard.writeText(qs('reportText').value);
    alert('Texto copiado.');
  });
  qs('shareWhatsapp').addEventListener('click', () => {
    if (!qs('reportText').value) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(qs('reportText').value)}`, '_blank');
  });
  qs('downloadPdf').addEventListener('click', async () => {
    const payload = window.lastReportPayload || buildPayload();
    try {
      const response = await fetch('/relatorios/gerar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('PDF indisponível');
      const blob = await response.blob();
      downloadBlob(blob, `relatorio-${payload.jornal || 'jornal'}.pdf`);
    } catch (error) {
      alert('Não foi possível gerar o PDF neste ambiente. Se estiver usando GitHub Pages, essa função só funciona com Node/Render.');
    }
  });
  qs('editAgain').addEventListener('click', () => {
    qs('resultScreen').classList.add('hidden');
    qs('reportForm').classList.remove('hidden');
  });
  qs('newReport').addEventListener('click', () => {
    clearForm();
    openStart();
  });
}

function init() {
  fillBaseOptions();
  clearForm();
  attachEvents();
  updateClock();
  setInterval(updateClock, 1000);
}

document.addEventListener('DOMContentLoaded', init);
