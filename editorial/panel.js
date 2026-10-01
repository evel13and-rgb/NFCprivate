const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const loginView = $('#login-view');
const appView = $('#app-view');
const content = $('#content');
const drawer = $('#editor-drawer');
const drawerBackdrop = $('#drawer-backdrop');
const editorForm = $('#editor-form');
const editorFields = $('#editor-fields');
const editorOriginals = $('#editor-originals');
const editorError = $('#editor-error');

const state = {
  user: null,
  view: 'overview',
  page: 1,
  search: '',
  filter: '',
  references: { authors: [], works: [] },
  currentRecord: null,
  currentOriginals: [],
  loading: false,
};

const labels = {
  draft: 'Borrador', in_review: 'En revisión', approved: 'Aprobado', archived: 'Archivado',
  pending: 'Pendiente', partially_verified: 'Verificación parcial', verified: 'Verificado',
  rejected: 'Rechazado', hidden: 'Oculto', public: 'Público', scheduled: 'Programado',
  cleared: 'Derechos revisados', restricted: 'Restringido', unknown: 'Desconocido',
  preview: 'Vista previa', production: 'Producción', started: 'Iniciada', validated: 'Validada',
  published: 'Publicada', failed: 'Fallida', prose: 'Prosa', poem: 'Verso',
};

const views = {
  overview: { title: 'Resumen editorial', kicker: 'Hoy en Páramo' },
  quotes: { title: 'Fragmentos', kicker: 'Catálogo literario' },
  authors: { title: 'Autores', kicker: 'Fichas biográficas' },
  works: { title: 'Obras', kicker: 'Biblioteca de Páramo' },
  sources: { title: 'Fuentes', kicker: 'Verificación y derechos' },
  publication_runs: { title: 'Publicaciones', kicker: 'Historial y trazabilidad' },
};

const collectionUi = {
  quotes: {
    noun: 'fragmentos',
    search: 'Buscar por texto, autor, obra o ID…',
    filterField: 'workflow_status',
    filterOptions: ['draft', 'in_review', 'approved', 'archived'],
    title: (record) => excerpt(record.text, 92),
    subtitle: (record) => `${record.id} · ${referenceLabel('works', record.work_id)}`,
    columns: [
      ['Fragmento', (record) => recordTitle(record)],
      ['Flujo', (record) => badge(record.workflow_status)],
      ['Verificación', (record) => badge(record.verification_status)],
      ['Visibilidad', (record) => badge(record.visibility)],
    ],
  },
  authors: {
    noun: 'autores', search: 'Buscar un autor…', filterField: 'visibility',
    filterOptions: ['hidden', 'public', 'scheduled'],
    title: (record) => record.display_name,
    subtitle: (record) => [record.country, record.period].filter(Boolean).join(' · ') || record.id,
    columns: [
      ['Autor', (record) => recordTitle(record)],
      ['Flujo', (record) => badge(record.workflow_status)],
      ['Verificación', (record) => badge(record.verification_status)],
      ['Visibilidad', (record) => badge(record.visibility)],
    ],
  },
  works: {
    noun: 'obras', search: 'Buscar una obra…', filterField: 'visibility',
    filterOptions: ['hidden', 'public', 'scheduled'],
    title: (record) => record.public_title || record.display_title,
    subtitle: (record) => `${referenceLabel('authors', record.primary_author_id)}${record.publication_year ? ` · ${record.publication_year}` : ''}`,
    columns: [
      ['Obra', (record) => recordTitle(record)],
      ['Flujo', (record) => badge(record.workflow_status)],
      ['Verificación', (record) => badge(record.verification_status)],
      ['Visibilidad', (record) => badge(record.visibility)],
    ],
  },
  sources: {
    noun: 'fuentes', search: 'Buscar una referencia…', filterField: 'rights_status',
    filterOptions: ['pending', 'cleared', 'restricted', 'unknown'],
    title: (record) => record.citation_label,
    subtitle: (record) => [record.creator, record.publication_year].filter(Boolean).join(' · ') || record.id,
    columns: [
      ['Referencia', (record) => recordTitle(record)],
      ['Tipo', (record) => plain(record.source_type)],
      ['Verificación', (record) => badge(record.verification_status)],
      ['Derechos', (record) => badge(record.rights_status)],
    ],
  },
  publication_runs: {
    noun: 'ejecuciones', search: 'Buscar en el historial…', filterField: 'environment',
    filterOptions: ['preview', 'production'],
    title: (record) => `${labels[record.environment] || record.environment} · ${labels[record.status] || record.status}`,
    subtitle: (record) => `${formatDate(record.started_at)} · ${record.git_commit ? record.git_commit.slice(0, 9) : 'sin commit'}`,
    columns: [
      ['Ejecución', (record) => recordTitle(record)],
      ['Entorno', (record) => badge(record.environment)],
      ['Estado', (record) => badge(record.status)],
      ['Finalizada', (record) => plain(formatDate(record.finished_at))],
    ],
  },
};

const fieldDefinitions = {
  quotes: [
    field('id', 'Identificador', 'readonly'),
    field('legacy_index', 'Índice histórico', 'readonly'),
    field('text', 'Traducción o actualización', 'textarea', true),
    field('highlight', 'Pasaje destacado', 'textarea', true, true),
    field('speaker_display_name', 'Voz o personaje', 'text', false, true),
    field('language', 'Idioma', 'text'),
    field('quote_type', 'Forma', 'select', false, false, [['prose', 'Prosa'], ['poem', 'Verso']]),
    field('author_id', 'Autor', 'authors', false, true),
    field('work_id', 'Obra', 'works'),
    field('attribution_type', 'Tipo de atribución', 'text'),
    ...statusFields(),
    field('publication_excluded', 'Excluir de la publicación', 'checkbox', true),
  ],
  quote_originals: [
    field('id', 'Identificador', 'readonly'),
    field('quote_id', 'Fragmento', 'readonly'),
    field('original_text', 'Texto original', 'textarea', true),
    field('language', 'Idioma', 'text'),
    field('label', 'Etiqueta pública', 'text'),
    field('source_note', 'Nota privada de fuente', 'textarea', true, true),
    field('is_primary', 'Original principal', 'checkbox'),
    ...statusFields(),
  ],
  authors: [
    field('id', 'Identificador estable', 'readonly'),
    field('display_name', 'Nombre público', 'text'),
    field('canonical_name', 'Nombre canónico', 'text'),
    field('birth_year', 'Año de nacimiento', 'number', false, true),
    field('death_year', 'Año de muerte', 'number', false, true),
    field('country', 'País', 'text', false, true),
    field('language', 'Lengua', 'text', false, true),
    field('period', 'Periodo', 'text', false, true),
    field('movement', 'Movimiento', 'text', false, true),
    field('short_biography', 'Biografía breve', 'textarea', true, true),
    field('public_biography_long', 'Biografía pública', 'textarea', true, true),
    field('public_tone_notes', 'Tono y estilo', 'textarea', true, true),
    field('public_why_in_paramo', 'Por qué está en Páramo', 'textarea', true, true),
    field('public_information_sources', 'Fuentes públicas (JSON)', 'json', true),
    field('portrait_path', 'Ruta del retrato', 'text', true, true),
    field('portrait_alt', 'Texto alternativo', 'text', true, true),
    field('portrait_credit', 'Crédito del retrato', 'text', true, true),
    field('portrait_rights', 'Derechos del retrato', 'text', true, true),
    field('portrait_source_url', 'URL de origen', 'url', true, true),
    ...statusFields(),
  ],
  works: [
    field('id', 'Identificador estable', 'readonly'),
    field('display_title', 'Título canónico', 'text'),
    field('public_title', 'Título público', 'text', false, true),
    field('original_title', 'Título original', 'text', false, true),
    field('primary_author_id', 'Autor principal', 'authors', false, true),
    field('publication_year', 'Año de publicación', 'number', false, true),
    field('genre', 'Género', 'text', false, true),
    field('public_language', 'Lengua de la obra', 'text', false, true),
    field('short_summary', 'Resumen breve', 'textarea', true, true),
    field('public_summary_long', 'Resumen público', 'textarea', true, true),
    field('context', 'Contexto', 'textarea', true, true),
    field('tone', 'Tono', 'textarea', true, true),
    field('public_fragment_notes', 'Notas sobre los fragmentos', 'textarea', true, true),
    field('public_why_in_paramo', 'Por qué está en Páramo', 'textarea', true, true),
    field('public_information_sources', 'Fuentes públicas (JSON)', 'json', true),
    ...statusFields(),
  ],
  sources: [
    field('id', 'Identificador estable', 'readonly'),
    field('citation_label', 'Referencia breve', 'text', true),
    field('source_type', 'Tipo de fuente', 'text'),
    field('creator', 'Autoría', 'text', false, true),
    field('institution', 'Institución', 'text', false, true),
    field('title', 'Título', 'text', true, true),
    field('edition', 'Edición', 'text', false, true),
    field('publisher', 'Editorial', 'text', false, true),
    field('publication_year', 'Año', 'number', false, true),
    field('pages', 'Páginas o localización', 'text', false, true),
    field('translator_name', 'Traducción', 'text', false, true),
    field('source_url', 'URL', 'url', true, true),
    field('accessed_at', 'Fecha de consulta', 'date', false, true),
    field('language', 'Idioma', 'text', false, true),
    field('bibliographic_identifiers', 'Identificadores (JSON)', 'json', true),
    field('verification_status', 'Verificación', 'select', false, false, statusOptions('verification')),
    field('rights_status', 'Derechos', 'select', false, false, ['pending', 'cleared', 'restricted', 'unknown'].map(optionPair)),
    field('rights_notes', 'Notas de derechos (privadas)', 'textarea', true, true),
    field('notes', 'Notas editoriales (privadas)', 'textarea', true, true),
  ],
  publication_runs: [
    field('id', 'Identificador', 'readonly'),
    field('environment', 'Entorno', 'readonly'),
    field('status', 'Estado', 'readonly'),
    field('started_at', 'Inicio', 'readonly'),
    field('finished_at', 'Fin', 'readonly'),
    field('git_commit', 'Commit', 'readonly'),
    field('entity_counts', 'Recuentos', 'readonly-json', true),
    field('artifact_hashes', 'Huellas', 'readonly-json', true),
    field('warnings', 'Advertencias', 'readonly-json', true),
    field('errors', 'Errores', 'readonly-json', true),
    field('notes', 'Notas', 'readonly', true),
  ],
};

function field(name, label, type = 'text', wide = false, nullable = false, options = []) {
  return { name, label, type, wide, nullable, options };
}

function optionPair(value) { return [value, labels[value] || value]; }

function statusOptions(kind) {
  const values = kind === 'workflow'
    ? ['draft', 'in_review', 'approved', 'archived']
    : kind === 'visibility'
      ? ['hidden', 'public', 'scheduled']
      : ['pending', 'partially_verified', 'verified', 'rejected'];
  return values.map(optionPair);
}

function statusFields() {
  return [
    field('workflow_status', 'Flujo editorial', 'select', false, false, statusOptions('workflow')),
    field('verification_status', 'Verificación', 'select', false, false, statusOptions('verification')),
    field('visibility', 'Visibilidad', 'select', false, false, statusOptions('visibility')),
  ];
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}

function excerpt(value, maximum = 90) {
  const compact = String(value || '').replace(/\s+/g, ' ').trim();
  return compact.length > maximum ? `${compact.slice(0, maximum - 1)}…` : compact;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function referenceLabel(kind, id) {
  if (!id) return 'Sin asignar';
  const item = state.references[kind]?.find((candidate) => candidate.id === id);
  return item?.display_name || item?.display_title || id;
}

function badge(value) {
  const safe = escapeHtml(value || 'unknown');
  return `<span class="badge ${safe}">${escapeHtml(labels[value] || value || '—')}</span>`;
}

function plain(value) { return `<span>${escapeHtml(value ?? '—')}</span>`; }

function recordTitle(record) {
  const config = collectionUi[state.view];
  return `<span class="record-title"><strong>${escapeHtml(config.title(record))}</strong><small>${escapeHtml(config.subtitle(record))}</small></span>`;
}

async function api(path, options = {}) {
  const response = await fetch(`/editorial/api${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json', 'x-paramo-editorial-request': '1' } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401 && path !== '/login') {
    showLogin();
    throw new Error(payload.message || 'La sesión ha caducado.');
  }
  if (!response.ok) throw new Error(payload.message || 'No se pudo completar la operación.');
  return payload;
}

function setUser(user) {
  state.user = user;
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Equipo editorial';
  $('#user-name').textContent = name;
  $('#user-email').textContent = user.email || '';
  $('#user-avatar').textContent = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function showLogin() {
  state.user = null;
  appView.hidden = true;
  loginView.hidden = false;
  closeDrawer();
}

async function showApp(user) {
  setUser(user);
  loginView.hidden = true;
  appView.hidden = false;
  try {
    state.references = await api('/references');
  } catch (error) {
    toast(error.message, true);
  }
  await navigate('overview');
}

function setLoading(loading) {
  state.loading = loading;
  $('#refresh-button').disabled = loading;
  $('#connection-status').style.opacity = loading ? '.55' : '1';
}

async function navigate(view) {
  if (!views[view]) return;
  state.view = view;
  state.page = 1;
  state.search = '';
  state.filter = '';
  $$('.nav-item').forEach((item) => item.classList.toggle('is-active', item.dataset.view === view));
  $('#view-title').textContent = views[view].title;
  $('#view-kicker').textContent = views[view].kicker;
  $('.sidebar').classList.remove('is-open');
  await renderCurrentView();
}

async function renderCurrentView() {
  setLoading(true);
  content.innerHTML = '<div class="content-inner"><div class="panel skeleton"></div></div>';
  try {
    if (state.view === 'overview') await renderOverview();
    else await renderList();
  } catch (error) {
    content.innerHTML = `<div class="content-inner"><div class="panel empty-state"><div><strong>No se pudo abrir esta sección</strong>${escapeHtml(error.message)}</div></div></div>`;
  } finally {
    setLoading(false);
  }
}

async function renderOverview() {
  const data = await api('/overview');
  const firstName = state.user?.first_name ? `, ${state.user.first_name}` : '';
  const date = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const maxWorkflow = Math.max(1, ...Object.values(data.workflow));
  const metrics = [
    ['Fragmentos', data.metrics.quotes, `${data.metrics.ready_quotes} listos para exportar`, '❝', 'quotes'],
    ['En revisión', data.metrics.in_review, 'requieren una decisión editorial', '◇', 'quotes', data.metrics.in_review > 0],
    ['Fichas públicas', data.metrics.public_authors + data.metrics.public_works, `${data.metrics.public_authors} autores · ${data.metrics.public_works} obras`, 'Aa', 'authors'],
    ['Fuentes pendientes', data.metrics.pending_sources, 'verificación o derechos', '⌘', 'sources', data.metrics.pending_sources > 0],
  ];

  content.innerHTML = `
    <div class="content-inner">
      <div class="welcome-row">
        <div><h2>Buenos días${escapeHtml(firstName)}.</h2><p>Este es el pulso del catálogo. Editar y publicar siguen siendo dos decisiones separadas.</p></div>
        <span class="date-note">${escapeHtml(date)}</span>
      </div>
      <div class="metrics-grid">
        ${metrics.map(([name, value, note, symbol, view, warning]) => `
          <button class="metric-card ${warning ? 'is-warning' : ''}" type="button" data-go="${view}" style="text-align:left;cursor:pointer">
            <span class="metric-top"><span>${escapeHtml(name)}</span><span class="metric-symbol">${symbol}</span></span>
            <strong>${Number(value).toLocaleString('es-ES')}</strong><small>${escapeHtml(note)}</small>
          </button>`).join('')}
      </div>
      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-heading"><h3>Estado de los fragmentos</h3><span>${data.metrics.quotes} registros</span></div>
          <div class="workflow-bars">
            ${Object.entries(data.workflow).map(([status, count]) => `
              <div class="workflow-row"><span>${escapeHtml(labels[status] || status)}</span><div class="bar"><i style="width:${Math.max(count ? 2 : 0, count / maxWorkflow * 100)}%"></i></div><strong>${count}</strong></div>`).join('')}
          </div>
        </section>
        <section class="panel">
          <div class="panel-heading"><h3>Actividad de publicación</h3><button class="icon-button" type="button" data-go="publication_runs" aria-label="Ver historial">→</button></div>
          <div class="run-list">
            ${data.recent_runs.length ? data.recent_runs.map((run) => `
              <div class="run-item"><i class="run-dot ${escapeHtml(run.status)}"></i><span class="run-copy"><strong>${escapeHtml(labels[run.environment] || run.environment)} · ${escapeHtml(labels[run.status] || run.status)}</strong><small>${escapeHtml(run.git_commit ? run.git_commit.slice(0, 9) : 'sin commit')}</small></span><time>${escapeHtml(formatDate(run.started_at))}</time></div>`).join('') : '<div class="empty-state" style="min-height:180px"><div><strong>Aún no hay ejecuciones</strong>El historial aparecerá aquí.</div></div>'}
          </div>
        </section>
      </div>
    </div>`;
  $$('[data-go]', content).forEach((button) => button.addEventListener('click', () => navigate(button.dataset.go)));
}

async function renderList() {
  const config = collectionUi[state.view];
  const query = new URLSearchParams({ page: String(state.page), limit: '30' });
  if (state.search) query.set('search', state.search);
  if (state.filter) query.set(config.filterField, state.filter);
  const data = await api(`/records/${state.view}?${query}`);
  const pageCount = Math.max(1, Math.ceil(data.total / data.limit));

  content.innerHTML = `
    <div class="content-inner">
      <div class="list-toolbar">
        <label class="search-box"><span class="eyebrow" hidden>Buscar</span><input id="record-search" type="search" value="${escapeHtml(state.search)}" placeholder="${escapeHtml(config.search)}"></label>
        <select id="record-filter" class="filter-select" aria-label="Filtrar registros">
          <option value="">Todos los estados</option>
          ${config.filterOptions.map((value) => `<option value="${value}" ${state.filter === value ? 'selected' : ''}>${escapeHtml(labels[value] || value)}</option>`).join('')}
        </select>
      </div>
      <section class="panel table-panel">
        <div class="table-meta"><span>${data.total.toLocaleString('es-ES')} ${escapeHtml(config.noun)}</span><span>Página ${data.page} de ${pageCount}</span></div>
        ${data.records.length ? `<div class="table-scroll"><table class="data-table"><thead><tr>${config.columns.map(([label]) => `<th>${escapeHtml(label)}</th>`).join('')}</tr></thead><tbody>${data.records.map((record) => `<tr data-record-id="${escapeHtml(record.id)}">${config.columns.map(([, render]) => `<td>${render(record)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<div class="empty-state"><div><strong>No hay resultados</strong>Prueba con otra búsqueda o elimina el filtro.</div></div>'}
      </section>
      <div class="pagination">
        <button id="previous-page" class="button button-secondary" type="button" ${data.page <= 1 ? 'disabled' : ''}>← Anterior</button>
        <span>${data.page} / ${pageCount}</span>
        <button id="next-page" class="button button-secondary" type="button" ${data.page >= pageCount ? 'disabled' : ''}>Siguiente →</button>
      </div>
    </div>`;

  let searchTimer;
  $('#record-search')?.addEventListener('input', (event) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = event.target.value.trim();
      state.page = 1;
      renderCurrentView();
    }, 320);
  });
  $('#record-filter')?.addEventListener('change', (event) => {
    state.filter = event.target.value;
    state.page = 1;
    renderCurrentView();
  });
  $('#previous-page')?.addEventListener('click', () => { state.page -= 1; renderCurrentView(); });
  $('#next-page')?.addEventListener('click', () => { state.page += 1; renderCurrentView(); });
  $$('[data-record-id]', content).forEach((row) => row.addEventListener('click', () => openRecord(state.view, row.dataset.recordId)));
}

function inputOptions(options, selected) {
  return options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${String(selected ?? '') === value ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('');
}

function renderField(definition, record, readOnlyCollection = false) {
  const value = record[definition.name];
  const className = definition.wide ? 'field-wide' : '';
  const disabled = readOnlyCollection || definition.type.startsWith('readonly');
  const attribute = `name="${definition.name}" data-type="${definition.type}" data-nullable="${definition.nullable}"`;
  let control;

  if (definition.type === 'readonly' || definition.type === 'readonly-json') {
    const display = definition.type === 'readonly-json' ? JSON.stringify(value ?? null, null, 2) : (value ?? '—');
    control = `<div class="readonly-field">${escapeHtml(display)}</div>`;
  } else if (definition.type === 'textarea' || definition.type === 'json') {
    const display = definition.type === 'json' ? JSON.stringify(value ?? (definition.nullable ? null : {}), null, 2) : (value ?? '');
    control = `<textarea ${attribute} ${disabled ? 'disabled' : ''}>${escapeHtml(display)}</textarea>`;
  } else if (definition.type === 'select') {
    control = `<select ${attribute} ${disabled ? 'disabled' : ''}>${inputOptions(definition.options, value)}</select>`;
  } else if (definition.type === 'authors' || definition.type === 'works') {
    const items = state.references[definition.type] || [];
    const options = items.map((item) => [item.id, item.display_name || item.display_title]);
    control = `<select ${attribute} ${disabled ? 'disabled' : ''}>${definition.nullable ? '<option value="">Sin asignar</option>' : ''}${inputOptions(options, value)}</select>`;
  } else if (definition.type === 'checkbox') {
    return `<label class="checkbox-field ${className}"><input type="checkbox" ${attribute} ${value ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span>${escapeHtml(definition.label)}</span></label>`;
  } else {
    control = `<input type="${definition.type}" ${attribute} value="${escapeHtml(value ?? '')}" ${disabled ? 'disabled' : ''}>`;
  }
  return `<label class="${className}"><span>${escapeHtml(definition.label)}</span>${control}</label>`;
}

async function openRecord(collection, id) {
  editorError.hidden = true;
  editorFields.innerHTML = '<div class="field-wide skeleton" style="min-height:280px"></div>';
  editorOriginals.hidden = true;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  drawerBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';

  try {
    const data = await api(`/records/${collection}/${encodeURIComponent(id)}`);
    state.currentRecord = { collection, record: data.record };
    state.currentOriginals = data.originals || [];
    const config = collectionUi[collection] || { title: () => labels[collection] || collection };
    $('#drawer-kicker').textContent = views[collection]?.kicker || 'Texto original';
    $('#drawer-title').textContent = excerpt(config.title?.(data.record) || data.record.label || data.record.id, 60);
    const readOnly = collection === 'publication_runs';
    editorFields.innerHTML = fieldDefinitions[collection].map((definition) => renderField(definition, data.record, readOnly)).join('');
    $('#save-button').hidden = readOnly;
    $('#save-status').textContent = readOnly ? 'Registro de auditoría: solo lectura.' : 'Los cambios no se publican automáticamente.';
    renderOriginals(collection, state.currentOriginals);
  } catch (error) {
    editorFields.innerHTML = '';
    editorError.textContent = error.message;
    editorError.hidden = false;
  }
}

function renderOriginals(collection, originals) {
  if (collection !== 'quotes') {
    editorOriginals.hidden = true;
    return;
  }
  editorOriginals.hidden = false;
  editorOriginals.innerHTML = `
    <div class="originals-heading"><h3>Texto${originals.length === 1 ? '' : 's'} original${originals.length === 1 ? '' : 'es'}</h3><span class="badge ${originals.length ? 'verified' : 'pending'}">${originals.length}</span></div>
    ${originals.length ? originals.map((original) => `<button class="original-card" type="button" data-original-id="${escapeHtml(original.id)}" style="width:100%;text-align:left;cursor:pointer"><strong>${escapeHtml(original.label)} · ${escapeHtml(original.language)}</strong><p>${escapeHtml(original.original_text)}</p></button>`).join('') : '<div class="original-card"><p>No hay originales vinculados a este fragmento.</p></div>'}`;
  $$('[data-original-id]', editorOriginals).forEach((button) => button.addEventListener('click', () => openRecord('quote_originals', button.dataset.originalId)));
}

function collectChanges(collection) {
  const changes = {};
  const current = state.currentRecord?.record || {};
  for (const definition of fieldDefinitions[collection]) {
    if (definition.type.startsWith('readonly')) continue;
    const input = editorForm.elements.namedItem(definition.name);
    if (!input || input.disabled) continue;
    let value;
    if (definition.type === 'checkbox') value = input.checked;
    else if (definition.type === 'number') value = input.value === '' && definition.nullable ? null : Number.parseInt(input.value, 10);
    else if (definition.type === 'json') {
      try { value = JSON.parse(input.value); } catch { throw new Error(`${definition.label}: el JSON no es válido.`); }
    } else value = input.value === '' && definition.nullable ? null : input.value;
    const previous = current[definition.name];
    const equal = (value && typeof value === 'object') || (previous && typeof previous === 'object')
      ? JSON.stringify(value) === JSON.stringify(previous)
      : value === previous;
    if (!equal) changes[definition.name] = value;
  }
  if (!Object.keys(changes).length) throw new Error('No has realizado ningún cambio.');
  return changes;
}

function closeDrawer() {
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  drawerBackdrop.hidden = true;
  document.body.style.overflow = '';
  state.currentRecord = null;
}

function toast(message, isError = false) {
  const element = document.createElement('div');
  element.className = `toast${isError ? ' is-error' : ''}`;
  element.textContent = message;
  $('#toast-region').append(element);
  setTimeout(() => element.remove(), 4200);
}

$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = $('button[type="submit"]', form);
  const errorElement = $('#login-error');
  submit.disabled = true;
  errorElement.hidden = true;
  const values = Object.fromEntries(new FormData(form));
  try {
    const data = await api('/login', { method: 'POST', body: JSON.stringify(values) });
    form.reset();
    await showApp(data.user);
  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.hidden = false;
  } finally {
    submit.disabled = false;
  }
});

editorForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!state.currentRecord) return;
  const { collection, record } = state.currentRecord;
  const saveButton = $('#save-button');
  editorError.hidden = true;
  saveButton.disabled = true;
  try {
    const changes = collectChanges(collection);
    const data = await api(`/records/${collection}/${encodeURIComponent(record.id)}`, {
      method: 'PATCH', body: JSON.stringify({ changes }),
    });
    state.currentRecord.record = data.record;
    toast(data.review_reset
      ? 'Cambios guardados. El registro ha vuelto a revisión.'
      : 'Cambios editoriales guardados.');
    closeDrawer();
    await renderCurrentView();
  } catch (error) {
    editorError.textContent = error.message;
    editorError.hidden = false;
  } finally {
    saveButton.disabled = false;
  }
});

$$('.nav-item').forEach((item) => item.addEventListener('click', () => navigate(item.dataset.view)));
$('#refresh-button').addEventListener('click', renderCurrentView);
$('#drawer-close').addEventListener('click', closeDrawer);
$('#cancel-button').addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);
$('#menu-button').addEventListener('click', () => $('.sidebar').classList.toggle('is-open'));
$('#logout-button').addEventListener('click', async () => {
  try { await api('/logout', { method: 'POST', body: '{}' }); } catch { /* La sesión local se limpia al mostrar login. */ }
  showLogin();
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDrawer(); });

async function boot() {
  try {
    const data = await api('/session');
    await showApp(data.user);
  } catch {
    showLogin();
  }
}

boot();
