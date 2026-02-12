/**
 * JOC: MAPA DEL MEDITERRANI
 * Objectiu: Clicar sobre el país correcte al mapa.
 * Versió fusionada amb millores:
 * - SVG amb fons + styles inline (sempre es veu)
 * - data-country + event delegation (sense onclick inline)
 * - min-height recomanat al contenidor (comentat)
 * - seguretat si pathEl no existeix
 * - lock anti multi-click
 */

const medMapData = [
    { id: 'esp', iso: 'es', name: { ca: 'Espanya', es: 'España', en: 'Spain', ar: 'إسبانيا' } },
    { id: 'fra', iso: 'fr', name: { ca: 'França', es: 'Francia', en: 'France', ar: 'فرنسا' } },
    { id: 'ita', iso: 'it', name: { ca: 'Itàlia', es: 'Italia', en: 'Italy', ar: 'إيطاليا' } },
    { id: 'gre', iso: 'gr', name: { ca: 'Grècia', es: 'Grecia', en: 'Greece', ar: 'اليونان' } },
    { id: 'tur', iso: 'tr', name: { ca: 'Turquia', es: 'Turquía', en: 'Turkey', ar: 'تركيا' } },
    { id: 'egy', iso: 'eg', name: { ca: 'Egipte', es: 'Egipto', en: 'Egypt', ar: 'مصر' } },
    { id: 'mar', iso: 'ma', name: { ca: 'Marroc', es: 'Marruecos', en: 'Morocco', ar: 'المغرب' } },
    { id: 'tun', iso: 'tn', name: { ca: 'Tunísia', es: 'Túnez', en: 'Tunisia', ar: 'تونس' } },
    { id: 'alg', iso: 'dz', name: { ca: 'Algèria', es: 'Argelia', en: 'Algeria', ar: 'الجزائر' } },
    { id: 'lby', iso: 'ly', name: { ca: 'Líbia', es: 'Libia', en: 'Libya', ar: 'ليبيا' } }
    // ... simplificat per a la demo de mapa, podem afegir més
];

let medMapState = {
    mode: null,
    score: 0,
    currentQuestionIndex: 0,
    questions: [],
    timer: null,
    timeLeft: 60,
    examFinished: false,
    showName: true,
    wasShown: false,
    locked: false
};

// IMPORTANT (CSS recomanat, fora del JS):
// #map-container { width: 100%; min-height: 320px; }
// #map-container svg { width: 100%; height: 100%; display: block; }

// SVG PATHS (Simplified coordinates for Mediterranean)
// - Afegim fons + styles inline perquè SEMPRE es vegi
// - Canviem onclick per data-country (event delegation)
const MAP_SVG = `
<svg id="med-svg" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa del Mediterrani">
  <style>
    .sea { fill: #cfe9ff; }
    .country-path { fill: #d9d9d9; stroke: #222; stroke-width: 1; cursor: pointer; transition: opacity .15s ease; }
    .country-path:hover { opacity: .85; }
    .correct { fill: #7CFC90 !important; }
    .incorrect { fill: #FF7A7A !important; }
  </style>

  <!-- Background -->
  <rect class="sea" x="0" y="0" width="800" height="400"></rect>

  <!-- Spain -->
  <path id="path-esp" data-country="esp" class="country-path" d="M100,200 L150,200 L150,250 L100,250 Z" />
  <!-- France -->
  <path id="path-fra" data-country="fra" class="country-path" d="M150,150 L200,150 L200,200 L150,200 Z" />
  <!-- Italy -->
  <path id="path-ita" data-country="ita" class="country-path" d="M250,200 L270,250 L290,250 L270,200 Z" />
  <!-- Greece -->
  <path id="path-gre" data-country="gre" class="country-path" d="M350,250 L370,250 L370,270 L350,270 Z" />
  <!-- Turkey -->
  <path id="path-tur" data-country="tur" class="country-path" d="M450,200 L550,200 L550,250 L450,250 Z" />
  <!-- Egypt -->
  <path id="path-egy" data-country="egy" class="country-path" d="M500,300 L600,300 L600,350 L500,350 Z" />
  <!-- Libya -->
  <path id="path-lby" data-country="lby" class="country-path" d="M400,300 L500,300 L500,350 L400,350 Z" />
  <!-- Tunisia -->
  <path id="path-tun" data-country="tun" class="country-path" d="M300,280 L330,280 L330,310 L300,310 Z" />
  <!-- Algeria -->
  <path id="path-alg" data-country="alg" class="country-path" d="M200,300 L300,300 L300,350 L200,350 Z" />
  <!-- Morocco -->
  <path id="path-mar" data-country="mar" class="country-path" d="M100,300 L200,300 L200,350 L100,350 Z" />
</svg>
`;

function toggleCountryNameMap() {
    medMapState.showName = !medMapState.showName;
    const btn = document.getElementById('btn-toggle-country-map');
    const label = document.getElementById('med-map-country-name');

    if (medMapState.showName) {
        if (btn) btn.innerText = i18n.t('hide_country');
        if (label) label.style.visibility = 'visible';
        medMapState.wasShown = true;
    } else {
        if (btn) btn.innerText = i18n.t('show_country');
        if (label) label.style.visibility = 'hidden';
    }
}

// Event delegation: un sol listener per l’SVG
function onSvgMapClick(e) {
    if (medMapState.examFinished || medMapState.locked) return;

    const target = e.target.closest('[data-country]');
    if (!target) return; // han clicat al mar/fons

    const countryId = target.getAttribute('data-country');
    handleMapClick(countryId);
}

const SVG_PATH = 'assets/maps/mediterrani.svg';

async function loadExternalSvg() {
    try {
        const response = await fetch(SVG_PATH);
        const svgText = await response.text();
        // Netegem el text per evitar conflictes de IDs o estils si cal
        return svgText;
    } catch (e) {
        console.error("Error carregant el mapa SVG:", e);
        return MAP_SVG; // Fallback al mapa simplificat
    }
}

async function initMediterraniMapGame(mode) {
    medMapState.mode = mode;
    medMapState.score = 0;
    medMapState.currentQuestionIndex = 0;
    medMapState.examFinished = false;
    medMapState.wasShown = medMapState.showName;
    medMapState.locked = false;

    // IMPORTANT: mostra l'àrea abans d'injectar (evita SVG amb 0 alçada si estava hidden)
    document.getElementById('med-map-area').classList.remove('hidden');

    // Inject Map (Càrrega externa)
    const container = document.getElementById('map-container');
    const svgContent = await loadExternalSvg();
    container.innerHTML = svgContent;

    // Ajustem l'SVG per assegurar que sigui interactiu
    const svg = container.querySelector('svg');
    if (svg) {
        svg.id = "med-svg"; // Forcem ID per coherència
        svg.style.width = "100%";
        svg.style.height = "auto";
        svg.addEventListener('click', onSvgMapClick);

        // HELPER PER A IDENTIFICAR IDs (Esborrar en producció)
        svg.addEventListener('click', (e) => {
            const target = e.target.closest('path, polygon, rect');
            if (target) {
                const id = target.id || "SENSE ID";
                document.getElementById('med-map-feedback').innerText = `Has clicat l'ID: ${id}`;
                document.getElementById('med-map-feedback').style.color = 'orange';
                console.log("Element SVG:", target);
            }
        });
    }

    // Setup UI
    document.getElementById('med-map-score').innerText = `${i18n.t('score')}: 0`;
    document.getElementById('med-map-feedback').innerText = '';

    // Shuffle questions
    medMapState.questions = [...medMapData].sort(() => 0.5 - Math.random()).slice(0, 10);

    if (mode === 'exam') {
        medMapState.timeLeft = 60;
        document.getElementById('med-map-time').classList.remove('hidden');
        startMapTimer();
    } else {
        document.getElementById('med-map-time').classList.add('hidden');
        if (medMapState.timer) clearInterval(medMapState.timer);
    }

    showNextMapQuestion();
}

function startMapTimer() {
    if (medMapState.timer) clearInterval(medMapState.timer);
    medMapState.timer = setInterval(() => {
        medMapState.timeLeft--;
        document.getElementById('med-map-time').innerText = `${i18n.t('time')}: ${medMapState.timeLeft}s`;
        if (medMapState.timeLeft <= 0) finishMapGame();
    }, 1000);
}

function showNextMapQuestion() {
    if (medMapState.currentQuestionIndex >= medMapState.questions.length) {
        finishMapGame();
        return;
    }

    const currentQ = medMapState.questions[medMapState.currentQuestionIndex];
    const lang = i18n.currentLang;
    const countryName = currentQ.name[lang] || currentQ.name['ca'];
    const flagUrl = `https://flagcdn.com/h240/${currentQ.iso}.png`;

    // “wasShown” = si el nom estava visible en aquesta pregunta
    medMapState.wasShown = medMapState.showName;

    document.getElementById('med-map-question').innerHTML = `
    <img src="${flagUrl}" class="med-flag-map" alt="Bandera de ${countryName}">
    <span id="med-map-country-name" style="visibility: ${medMapState.showName ? 'visible' : 'hidden'}">${countryName}</span>
  `;

    document.getElementById('med-map-feedback').innerText = i18n.t('select_answer');
    document.getElementById('med-map-feedback').style.color = '';
}

function handleMapClick(countryId) {
    if (medMapState.examFinished || medMapState.locked) return;
    medMapState.locked = true;

    const correctQ = medMapState.questions[medMapState.currentQuestionIndex];
    const isCorrect = countryId === correctQ.id;

    const pathEl = document.getElementById(`path-${countryId}`);
    if (!pathEl) {
        medMapState.locked = false;
        return;
    }

    if (isCorrect) {
        const points = medMapState.wasShown ? 10 : 20;
        medMapState.score += points;
        document.getElementById('med-map-score').innerText = `${i18n.t('score')}: ${medMapState.score}`;

        pathEl.classList.add('correct');
        document.getElementById('med-map-feedback').innerText = i18n.t('correct');
        document.getElementById('med-map-feedback').style.color = 'green';

        setTimeout(() => {
            pathEl.classList.remove('correct');
            medMapState.currentQuestionIndex++;
            medMapState.locked = false;
            showNextMapQuestion();
        }, 800);
    } else {
        pathEl.classList.add('incorrect');
        document.getElementById('med-map-feedback').innerText = i18n.t('incorrect');
        document.getElementById('med-map-feedback').style.color = 'red';

        // (Opcional pedagògic) en mode pràctica, marca el correcte breument
        if (medMapState.mode !== 'exam') {
            const correctEl = document.getElementById(`path-${correctQ.id}`);
            if (correctEl) {
                correctEl.classList.add('correct');
                setTimeout(() => correctEl.classList.remove('correct'), 600);
            }
        }

        if (medMapState.mode === 'exam') {
            setTimeout(() => {
                pathEl.classList.remove('incorrect');
                medMapState.currentQuestionIndex++;
                medMapState.locked = false;
                showNextMapQuestion();
            }, 800);
        } else {
            setTimeout(() => {
                pathEl.classList.remove('incorrect');
                medMapState.locked = false;
            }, 800);
        }
    }
}

async function finishMapGame() {
    if (medMapState.timer) clearInterval(medMapState.timer);
    medMapState.examFinished = true;
    medMapState.locked = false;

    document.getElementById('med-map-question').innerText = i18n.t('final_score');
    document.getElementById('med-map-feedback').innerText = `${medMapState.score} / 200`;

    // Similar save logic as capitals game (callApi...)
}
