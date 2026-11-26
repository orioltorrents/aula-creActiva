/**
 * Dashboard de Professorat — Aula CreActiva
 * Adaptat als headers: timestamp, email, curs, grup, projecte, app, nivell, puntuacio, temps_segons, feedback_pos, feedback_neg
 */

const API_CONFIG = {
  sessioUrl: '/api/v1/auth/me',
  resultatsUrl: '/api/v1/puntuacions' // Substitueix per l'endpoint real que llegeix la taula Resultats
};

let totsElsResultats = [];
let resultatsFiltratsActuals = [];

const els = {
  profInfo: document.getElementById('prof-info'),
  curs: document.getElementById('filtre-curs'),
  grup: document.getElementById('filtre-grup'),
  projecte: document.getElementById('filtre-projecte'),
  app: document.getElementById('filtre-app'),
  nivell: document.getElementById('filtre-nivell'),
  email: document.getElementById('filtre-email'),
  vista: document.getElementById('filtre-vista'),
  tbody: document.getElementById('taula-resultats-body'),
  kpiTotal: document.getElementById('kpi-total'),
  kpiAlumnes: document.getElementById('kpi-alumnes'),
  kpiMitjana: document.getElementById('kpi-mitjana'),
  kpiAprovats: document.getElementById('kpi-aprovats')
};

document.addEventListener('DOMContentLoaded', async () => {
  registrarEsdeveniments();
  await verificarSessioProfessor();
  await carregarDadesResultats();
});

function registrarEsdeveniments() {
  els.curs.addEventListener('change', () => {
    actualitzarSelectorsDependents();
    aplicarFiltres();
  });
  els.projecte.addEventListener('change', () => {
    actualitzarSelectorsDependents();
    aplicarFiltres();
  });
  els.grup.addEventListener('change', aplicarFiltres);
  els.app.addEventListener('change', aplicarFiltres);
  els.nivell.addEventListener('change', aplicarFiltres);
  els.vista.addEventListener('change', aplicarFiltres);
  els.email.addEventListener('input', aplicarFiltres);

  document.getElementById('btn-netejar').addEventListener('click', () => {
    els.curs.value = '';
    els.grup.value = '';
    els.projecte.value = '';
    els.app.value = '';
    els.nivell.value = '';
    els.email.value = '';
    els.vista.value = 'tots';
    actualitzarSelectorsDependents();
    aplicarFiltres();
  });

  document.getElementById('btn-refrescar').addEventListener('click', carregarDadesResultats);
  document.getElementById('btn-exportar').addEventListener('click', exportarACSV);
}

async function verificarSessioProfessor() {
  try {
    const res = await fetch(API_CONFIG.sessioUrl);
    if (!res.ok) throw new Error('Sessió no validada');
    const usuari = await res.json();

    if (usuari.rol && usuari.rol !== 'professor' && usuari.rol !== 'admin') {
      alert('Accés exclusiu per al professorat.');
      window.location.href = '/index.html';
      return;
    }
    els.profInfo.textContent = `Prof. ${usuari.nom || usuari.email || 'Docent'}`;
  } catch (err) {
    console.warn('Validació de sessió pendent:', err);
  }
}

async function carregarDadesResultats() {
  els.tbody.innerHTML = '<tr><td colspan="10" class="empty-state">Carregant dades...</td></tr>';

  try {
    const res = await fetch(API_CONFIG.resultatsUrl);
    if (!res.ok) throw new Error('Error llegint el servidor');
    const data = await res.json();

    totsElsResultats = Array.isArray(data) ? data : (data.resultats || data.data || []);
  } catch (err) {
    console.error('Error carregant resultats:', err);
    els.tbody.innerHTML = `
      <tr>
        <td colspan="10" class="empty-state">
          No s'han pogut carregar les dades. Revisa l'endpoint <code>${API_CONFIG.resultatsUrl}</code>.
        </td>
      </tr>`;
    return;
  }

  poblarSelectorsInicials(totsElsResultats);
  aplicarFiltres();
}

function poblarSelectorsInicials(dades) {
  const cursos = [...new Set(dades.map(r => r.curs).filter(Boolean))].sort();
  const grups = [...new Set(dades.map(r => r.grup).filter(Boolean))].sort();
  const projectes = [...new Set(dades.map(r => r.projecte).filter(Boolean))].sort();
  const nivells = [...new Set(dades.map(r => r.nivell).filter(Boolean))].sort();

  omplirSelect(els.curs, cursos, 'Tots els cursos');
  omplirSelect(els.grup, grups, 'Tots els grups');
  omplirSelect(els.projecte, projectes, 'Tots els projectes');
  omplirSelect(els.nivell, nivells, 'Tots els nivells');
  actualitzarSelectorsDependents();
}

function actualitzarSelectorsDependents() {
  const fCurs = els.curs.value;
  const fProj = els.projecte.value;

  const subconjunt = totsElsResultats.filter(r => {
    if (fCurs && r.curs !== fCurs) return false;
    if (fProj && r.projecte !== fProj) return false;
    return true;
  });

  const apps = [...new Set(subconjunt.map(r => r.app).filter(Boolean))].sort();
  omplirSelect(els.app, apps, 'Totes les apps');
}

function omplirSelect(selectEl, opcions, textPerDefecte) {
  const valorPrevi = selectEl.value;
  selectEl.innerHTML = `<option value="">${textPerDefecte}</option>`;
  opcions.forEach(op => {
    const opt = document.createElement('option');
    opt.value = op;
    opt.textContent = op;
    selectEl.appendChild(opt);
  });
  if (opcions.includes(valorPrevi)) selectEl.value = valorPrevi;
}

function aplicarFiltres() {
  const fCurs = els.curs.value;
  const fGrup = els.grup.value;
  const fProj = els.projecte.value;
  const fApp = els.app.value;
  const fNivell = els.nivell.value;
  const fEmail = els.email.value.trim().toLowerCase();
  const modeVista = els.vista.value;

  let filtrats = totsElsResultats.filter(r => {
    if (fCurs && r.curs !== fCurs) return false;
    if (fGrup && r.grup !== fGrup) return false;
    if (fProj && r.projecte !== fProj) return false;
    if (fApp && r.app !== fApp) return false;
    if (fNivell && r.nivell !== fNivell) return false;
    if (fEmail && !(r.email || '').toLowerCase().includes(fEmail)) return false;
    return true;
  });

  // Ordenar del més recent al més antic
  filtrats.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  // Agrupació per nota màxima per alumne + projecte + app + nivell
  if (modeVista === 'millor') {
    const mapaMillors = new Map();
    filtrats.forEach(reg => {
      const clauUnica = `${reg.email || 'anonim'}__${reg.curs}__${reg.projecte}__${reg.app}__${reg.nivell || ''}`;
      const existent = mapaMillors.get(clauUnica);
      const notaActual = parseFloat(String(reg.puntuacio).replace(',', '.')) || 0;
      const notaExistent = existent ? (parseFloat(String(existent.puntuacio).replace(',', '.')) || 0) : -1;

      if (!existent || notaActual > notaExistent) {
        mapaMillors.set(clauUnica, { ...reg, _intents: (existent?._intents || 0) + 1 });
      } else {
        existent._intents = (existent._intents || 1) + 1;
      }
    });
    filtrats = Array.from(mapaMillors.values());
  }

  resultatsFiltratsActuals = filtrats;
  actualitzarKPIs(filtrats);
  renderitzarTaula(filtrats);
}

function actualitzarKPIs(dades) {
  els.kpiTotal.textContent = dades.length;

  const emailsUnics = new Set(dades.map(r => r.email).filter(Boolean));
  els.kpiAlumnes.textContent = emailsUnics.size;

  if (dades.length === 0) {
    els.kpiMitjana.textContent = '—';
    els.kpiAprovats.textContent = '—';
    return;
  }

  const notes = dades.map(r => parseFloat(String(r.puntuacio).replace(',', '.')) || 0);
  const suma = notes.reduce((acc, n) => acc + n, 0);
  const mitjana = (suma / notes.length).toFixed(2);
  const aprovats = notes.filter(n => n >= 5).length;

  els.kpiMitjana.textContent = mitjana;
  els.kpiAprovats.textContent = `${Math.round((aprovats / notes.length) * 100)}%`;
}

function renderitzarTaula(dades) {
  if (dades.length === 0) {
    els.tbody.innerHTML = '<tr><td colspan="10" class="empty-state">No hi ha resultats amb els filtres seleccionats.</td></tr>';
    return;
  }

  els.tbody.innerHTML = dades.map((r, idx) => {
    const numNota = parseFloat(String(r.puntuacio ?? 0).replace(',', '.'));
    const notaMostrar = isNaN(numNota) ? (r.puntuacio ?? '—') : numNota.toFixed(2);
    const classeNota = numNota >= 5 ? 'nota-aprovat' : 'nota-suspes';

    const dataFormatada = r.timestamp
      ? new Date(r.timestamp).toLocaleString('ca-ES', { dateStyle: 'short', timeStyle: 'short' })
      : '—';

    const tempsText = r._intents
      ? `${r.temps_segons ?? 0}s (millor de ${r._intents})`
      : `${r.temps_segons ?? 0}s`;

    return `
      <tr>
        <td>${dataFormatada}</td>
        <td><strong>${escaparHTML(r.email || '—')}</strong></td>
        <td>${escaparHTML(r.curs || '—')}</td>
        <td>${escaparHTML(r.grup || '—')}</td>
        <td>${escaparHTML(r.projecte || '—')}</td>
        <td>${escaparHTML(r.app || '—')}</td>
        <td>${escaparHTML(r.nivell || '—')}</td>
        <td><span class="badge-nota ${classeNota}">${notaMostrar}</span></td>
        <td>${tempsText}</td>
        <td>
          <button type="button" class="btn btn-outline" style="padding: 0.25rem 0.6rem; font-size: 0.78rem;" onclick="veureFeedback(${idx})">
            Veure detall
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Formata tant strings plans com JSON stringificats de feedback_pos i feedback_neg
function formatarBlocFeedback(valor) {
  if (!valor) return '<em>Sense registre.</em>';
  let dades = valor;
  if (typeof valor === 'string') {
    try {
      dades = JSON.parse(valor);
    } catch {
      return `<pre>${escaparHTML(valor)}</pre>`;
    }
  }
  if (Array.isArray(dades)) {
    if (dades.length === 0) return '<em>Cap element.</em>';
    return `<ul>${dades.map(item => `<li>${escaparHTML(typeof item === 'object' ? JSON.stringify(item) : String(item))}</li>`).join('')}</ul>`;
  }
  return `<pre>${escaparHTML(JSON.stringify(dades, null, 2))}</pre>`;
}

window.veureFeedback = function(index) {
  const reg = resultatsFiltratsActuals[index];
  if (!reg) return;

  document.getElementById('modal-titol').textContent = `${reg.email} — ${reg.app} (${reg.puntuacio})`;
  document.getElementById('modal-contingut').innerHTML = `
    <div class="feedback-box fb-ok">
      <h4>Feedback Positiu (feedback_pos)</h4>
      ${formatarBlocFeedback(reg.feedback_pos)}
    </div>
    <div class="feedback-box fb-err">
      <h4>Feedback Negatiu i Recomanacions (feedback_neg)</h4>
      ${formatarBlocFeedback(reg.feedback_neg)}
    </div>
  `;
  document.getElementById('modal-feedback').showModal();
};

function exportarACSV() {
  if (resultatsFiltratsActuals.length === 0) {
    alert('No hi ha dades filtrades per exportar.');
    return;
  }

  // Mateixes capçaleres exactes que la teva taula Resultats
  const capcaleres = [
    'timestamp',
    'email',
    'curs',
    'grup',
    'projecte',
    'app',
    'nivell',
    'puntuacio',
    'temps_segons',
    'feedback_pos',
    'feedback_neg'
  ];

  const files = resultatsFiltratsActuals.map(r => [
    r.timestamp || '',
    r.email || '',
    r.curs || '',
    r.grup || '',
    r.projecte || '',
    r.app || '',
    r.nivell || '',
    String(r.puntuacio ?? '').replace('.', ','), // Coma decimal per obrir directe a Excel
    r.temps_segons ?? '',
    typeof r.feedback_pos === 'object' ? JSON.stringify(r.feedback_pos) : (r.feedback_pos || ''),
    typeof r.feedback_neg === 'object' ? JSON.stringify(r.feedback_neg) : (r.feedback_neg || '')
  ]);

  const csvContingut = [capcaleres, ...files]
    .map(fila => fila.map(camp => `"${String(camp).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContingut], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const nomCurs = (els.curs.value || 'tots_cursos').toLowerCase().replace(/\s+/g, '_');
  const nomProj = (els.projecte.value || 'tots_projectes').toLowerCase().replace(/\s+/g, '_');
  const nomGrup = (els.grup.value || 'tots_grups').toLowerCase().replace(/\s+/g, '_');
  const dataAvui = new Date().toISOString().slice(0, 10);

  const enllac = document.createElement('a');
  enllac.href = url;
  enllac.download = `resultats_${nomCurs}_${nomProj}_${nomGrup}_${dataAvui}.csv`;
  document.body.appendChild(enllac);
  enllac.click();
  document.body.removeChild(enllac);
  URL.revokeObjectURL(url);
}

function escaparHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}