/**
 * JOC: CAPITALS DEL MEDITERRANI
 * Objectiu: Encertar la capital del país seleccionat.
 * Modes: Pràctica (feedback immediat) i Examen (temps limitat, guarda nota).
 */

const mediterraniData = [
    { id: 'esp', iso: 'es', country: { ca: 'Espanya', es: 'España', en: 'Spain', ar: 'إسبانيا' }, capital: 'Madrid' },
    { id: 'fra', iso: 'fr', country: { ca: 'França', es: 'Francia', en: 'France', ar: 'فرنسا' }, capital: 'París' },
    { id: 'ita', iso: 'it', country: { ca: 'Itàlia', es: 'Italia', en: 'Italy', ar: 'إيطاليا' }, capital: 'Roma' },
    { id: 'gre', iso: 'gr', country: { ca: 'Grècia', es: 'Grecia', en: 'Greece', ar: 'اليونان' }, capital: 'Atenes' },
    { id: 'tur', iso: 'tr', country: { ca: 'Turquia', es: 'Turquía', en: 'Turkey', ar: 'تركيا' }, capital: 'Ankara' },
    { id: 'egy', iso: 'eg', country: { ca: 'Egipte', es: 'Egipto', en: 'Egypt', ar: 'مصر' }, capital: 'El Caire' },
    { id: 'mar', iso: 'ma', country: { ca: 'Marroc', es: 'Marruecos', en: 'Morocco', ar: 'المغرب' }, capital: 'Rabat' },
    { id: 'tun', iso: 'tn', country: { ca: 'Tunísia', es: 'Túnez', en: 'Tunisia', ar: 'تونس' }, capital: 'Tunis' },
    { id: 'alg', iso: 'dz', country: { ca: 'Algèria', es: 'Argelia', en: 'Algeria', ar: 'الجزائر' }, capital: 'Alger' },
    { id: 'lby', iso: 'ly', country: { ca: 'Líbia', es: 'Libia', en: 'Libya', ar: 'ليبيا' }, capital: 'Trípoli' },
    { id: 'isr', iso: 'il', country: { ca: 'Israel', es: 'Israel', en: 'Israel', ar: 'إسرائيل' }, capital: 'Jerusalem' },
    { id: 'lbn', iso: 'lb', country: { ca: 'Líban', es: 'Líbano', en: 'Lebanon', ar: 'لبنان' }, capital: 'Beirut' },
    { id: 'cyp', iso: 'cy', country: { ca: 'Xipre', es: 'Chipre', en: 'Cyprus', ar: 'قبرص' }, capital: 'Nicòsia' },
    { id: 'mlt', iso: 'mt', country: { ca: 'Malta', es: 'Malta', en: 'Malta', ar: 'مالطا' }, capital: 'La Valletta' },
    { id: 'hrv', iso: 'hr', country: { ca: 'Croàcia', es: 'Croacia', en: 'Croatia', ar: 'كرواتيا' }, capital: 'Zagreb' },
    { id: 'alb', iso: 'al', country: { ca: 'Albània', es: 'Albania', en: 'Albania', ar: 'ألبانيا' }, capital: 'Tirana' },
    { id: 'mne', iso: 'me', country: { ca: 'Montenegro', es: 'Montenegro', en: 'Montenegro', ar: 'الجبل الأسود' }, capital: 'Podgorica' },
    { id: 'svn', iso: 'si', country: { ca: 'Eslovènia', es: 'Eslovenia', en: 'Slovenia', ar: 'سلوفينيا' }, capital: 'Ljubljana' },
    { id: 'bih', iso: 'ba', country: { ca: 'Bòsnia i Hercegovina', es: 'Bosnia y Herzegovina', en: 'Bosnia and Herzegovina', ar: 'البوسنة والهرسك' }, capital: 'Sarajevo' },
    { id: 'mon', iso: 'mc', country: { ca: 'Mònaco', es: 'Mónaco', en: 'Monaco', ar: 'موناكو' }, capital: 'Mònaco' }
];

let medGameState = {
    mode: null, // 'practice' or 'exam'
    score: 0,
    currentQuestionIndex: 0,
    questions: [],
    timer: null,
    timeLeft: 60,
    examFinished: false
};

let showCountryName = true;

function toggleCountryName() {
    showCountryName = !showCountryName;
    const btn = document.getElementById('btn-toggle-country');
    const label = document.getElementById('med-country-label');

    if (showCountryName) {
        btn.innerText = i18n.t('hide_country');
        if (label) label.style.visibility = 'visible';
    } else {
        btn.innerText = i18n.t('show_country');
        if (label) label.style.visibility = 'hidden';
    }
}

// Inicialitza el joc
function initMediterraniGame(mode) {
    medGameState.mode = mode;
    medGameState.score = 0;
    medGameState.currentQuestionIndex = 0;
    medGameState.examFinished = false;

    // Reset toggle state per defecte? O mantenim? Mantenim selecció usuari és millor UX.
    // Només assegurem que el botó tingui el text correcte
    const btn = document.getElementById('btn-toggle-country');
    if (btn) btn.innerText = showCountryName ? i18n.t('hide_country') : i18n.t('show_country');

    // Preparar preguntes (barrejar)
    medGameState.questions = [...mediterraniData].sort(() => 0.5 - Math.random()).slice(0, 10); // 10 preguntes per partida


    // UI Setup
    document.getElementById('med-game-area').classList.remove('hidden');
    document.getElementById('med-score').innerText = `${i18n.t('score')}: 0`;
    document.getElementById('med-feedback').innerText = '';

    if (mode === 'exam') {
        medGameState.timeLeft = 60;
        document.getElementById('med-time').classList.remove('hidden');
        document.getElementById('med-time').innerText = `${i18n.t('time')}: 60s`;
        startTimer();
    } else {
        document.getElementById('med-time').classList.add('hidden');
        if (medGameState.timer) clearInterval(medGameState.timer);
    }

    showNextQuestion();
}

function startTimer() {
    if (medGameState.timer) clearInterval(medGameState.timer);
    medGameState.timer = setInterval(() => {
        medGameState.timeLeft--;
        document.getElementById('med-time').innerText = `${i18n.t('time')}: ${medGameState.timeLeft}s`;
        if (medGameState.timeLeft <= 0) {
            finishGame();
        }
    }, 1000);
}

function showNextQuestion() {
    if (medGameState.currentQuestionIndex >= medGameState.questions.length) {
        finishGame();
        return;
    }

    const currentQ = medGameState.questions[medGameState.currentQuestionIndex];
    const lang = i18n.currentLang;

    // Actualitzar text de la pregunta
    // Format: [Bandera] [País]
    const countryName = currentQ.country[lang] || currentQ.country['ca'];
    const flagUrl = `https://flagcdn.com/h240/${currentQ.iso}.png`;

    document.getElementById('med-question').innerHTML = `
        <div class="flag-container">
            <img src="${flagUrl}" alt="Bandera" class="med-flag">
        </div>
        <span>${countryName}</span>
    `;
    document.getElementById('med-feedback').innerText = i18n.t('select_answer');

    // Generar opcions (1 correcta + 3 incorrectes)
    const options = generateOptions(currentQ);
    renderOptions(options, currentQ);
}

function generateOptions(correctAnswer) {
    let options = [correctAnswer];
    while (options.length < 4) {
        const random = mediterraniData[Math.floor(Math.random() * mediterraniData.length)];
        if (!options.find(o => o.id === random.id)) {
            options.push(random);
        }
    }
    return options.sort(() => 0.5 - Math.random());
}

function renderOptions(options, correctQ) {
    const container = document.getElementById('med-options');
    container.innerHTML = '';

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn-option'; // Caldrà definir aquest estil CSS
        btn.innerText = opt.capital;
        btn.onclick = () => handleAnswer(opt, correctQ, btn);
        container.appendChild(btn);
    });
}

function handleAnswer(selected, correct, btnElement) {
    if (medGameState.examFinished) return;

    const isCorrect = selected.id === correct.id;

    if (isCorrect) {
        medGameState.score += 10;
        document.getElementById('med-score').innerText = `${i18n.t('score')}: ${medGameState.score}`;

        if (medGameState.mode === 'practice') {
            btnElement.classList.add('correct');
            document.getElementById('med-feedback').innerText = i18n.t('correct');
            document.getElementById('med-feedback').style.color = 'green';
            setTimeout(() => {
                medGameState.currentQuestionIndex++;
                showNextQuestion();
            }, 1000);
        } else {
            // Mode Examen: No diem si és correcte o no immediatament (o sí, però ràpid)
            medGameState.currentQuestionIndex++;
            showNextQuestion();
        }
    } else {
        if (medGameState.mode === 'practice') {
            btnElement.classList.add('incorrect');
            document.getElementById('med-feedback').innerText = i18n.t('incorrect');
            document.getElementById('med-feedback').style.color = 'red';
        } else {
            // Mode Examen: Passem a la següent sense feedback
            medGameState.currentQuestionIndex++;
            showNextQuestion();
        }
    }
}

async function finishGame() {
    if (medGameState.timer) clearInterval(medGameState.timer);
    medGameState.examFinished = true;

    const container = document.getElementById('question-container');
    // Hide questions
    document.getElementById('med-options').innerHTML = '';
    document.getElementById('med-question').innerText = i18n.t('final_score');
    document.getElementById('med-feedback').innerText = `${medGameState.score} / 100`;
    document.getElementById('med-feedback').style.color = 'black';

    if (medGameState.mode === 'exam') {
        // Guardar resultat
        document.getElementById('med-feedback').innerText += ` - ${i18n.t('loading')}`;

        // Preparar dades per l'API
        // Necessitem l'usuari actual de l'estat global de l'app (accessible via window.state o similar si és global)
        const user = JSON.parse(localStorage.getItem('user')); // Fallback si state no és accessible directament

        if (user) {
            const resultData = {
                email: user.email,
                curs: user.curs,
                projecte: 'Mediterrani',
                app: 'Capitals',
                nivell: 'General',
                puntuacio: medGameState.score,
                temps_segons: 60 - medGameState.timeLeft,
                feedback_pos: '',
                feedback_neg: ''
            };

            try {
                // Assumim que callApi és global o està disponible
                const response = await callApi('saveResult', resultData);
                if (response && response.status === 'success') {
                    document.getElementById('med-feedback').innerText += `\n${i18n.t('result_saved')}`;
                } else {
                    document.getElementById('med-feedback').innerText += `\n${i18n.t('result_error')}`;
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
}

// Funció per actualitzar textos quan canvia l'idioma sense avançar pregunta
function updateMediterraniLanguage() {
    // Actualitzar textos estàtics del joc (puntuació, temps...)
    document.getElementById('med-score').innerText = `${i18n.t('score')}: ${medGameState.score}`;
    if (medGameState.mode === 'exam') {
        document.getElementById('med-time').innerText = `${i18n.t('time')}: ${medGameState.timeLeft}s`;
    }

    // Si el joc ha acabat, mostrar missatge final traduït
    if (medGameState.examFinished) {
        document.getElementById('med-question').innerText = i18n.t('final_score');
        return;
    }

    // Si hi ha una pregunta activa, refrescar-la
    if (medGameState.questions.length > 0 && medGameState.currentQuestionIndex < medGameState.questions.length) {
        const currentQ = medGameState.questions[medGameState.currentQuestionIndex];
        const lang = i18n.currentLang;

        // Refrescar pregunta (mantenint la bandera si ja hi és, o regenerant-la)
        // Com que hem canviat a innerHTML, millor regenerar-ho tot per simplicitat
        const countryName = currentQ.country[lang] || currentQ.country['ca'];
        const flagUrl = `https://flagcdn.com/h240/${currentQ.iso}.png`;

        document.getElementById('med-question').innerHTML = `
            <div class="flag-container">
                <img src="${flagUrl}" alt="Bandera" class="med-flag">
            </div>
            <span id="med-country-label" style="visibility: ${showCountryName ? 'visible' : 'hidden'}">${countryName}</span>
        `;

        // Refrescar feedback si n'hi ha
        const feedbackEl = document.getElementById('med-feedback');
        if (feedbackEl.innerText !== '') {
            // Si estem mostrant 'correct'/'incorrect', ho traduïm.
            // Això és una mica 'tricky' si no sabem l'estat exacte, 
            // però podem deduir-ho pel color o estil, o simplificar mostrant 'select_answer'
            // Per simplicitat, si no hem respost (color negre o buit), posem 'select_answer'.
            if (!feedbackEl.style.color || feedbackEl.style.color === 'black') {
                feedbackEl.innerText = i18n.t('select_answer');
            } else if (feedbackEl.style.color === 'green') {
                feedbackEl.innerText = i18n.t('correct');
            } else if (feedbackEl.style.color === 'red') {
                feedbackEl.innerText = i18n.t('incorrect');
            }
        }
    }
}
