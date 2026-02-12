/**
 * Activitat: EL MAR DEL MIG (Vídeo + Test)
 * Projecte: Mediterrani
 */

const marDelMigQuestions = [
    { q: "On desemboca el riu Llobregat?", a: ["Al mar Negre", "A l’oceà Atlàntic", "Al mar Mediterrani", "Al mar Roig"], correct: 2 },
    { q: "Quin estret connecta la Mediterrània amb l’oceà Atlàntic?", a: ["Bòsfor", "Dardanels", "Gibraltar", "Messina"], correct: 2 },
    { q: "Quin canal connecta la Mediterrània amb el mar Roig?", a: ["Panamà", "Suez", "Corint", "Kiel"], correct: 1 },
    { q: "Quin estret connecta el mar Negre amb el mar de Màrmara?", a: ["Gibraltar", "Bòsfor", "Suez", "Sicília"], correct: 1 },
    { q: "Quina península sembla una bota?", a: ["Ibèrica", "Balcànica", "Anatòlia", "Apenins"], correct: 3 },
    { q: "Quina és una gran illa mediterrània?", a: ["Islàndia", "Sicília", "Irlanda", "Madeira"], correct: 1 },
    { q: "Quin és el riu més gran que desemboca a la Mediterrània?", a: ["Llobregat", "Tíber", "Nil", "Ebre"], correct: 2 },
    { q: "On va néixer la civilització egípcia?", a: ["Al delta del Nil", "A Roma", "A Grècia", "A Cartago"], correct: 0 },
    { q: "Quin poble va crear un dels primers alfabets fonètics?", a: ["Romans", "Grecs", "Fenicis", "Egipcis"], correct: 2 },
    { q: "Quina ciutat va ser un centre important fenici?", a: ["Atenes", "Cartago", "Roma", "Alexandria"], correct: 1 },
    { q: "Quin poble va adaptar l’alfabet fenici?", a: ["Romans", "Grecs", "Àrabs", "Egipcis"], correct: 1 },
    { q: "Quin d’aquests és un invent o aportació grega?", a: ["Democràcia", "Jeroglífics", "Aqüeductes", "Números romans"], correct: 0 },
    { q: "On es trobava la famosa biblioteca que conservava saber grec?", a: ["Roma", "Alexandria", "Atenes", "Jerusalem"], correct: 1 },
    { q: "Com anomenaven els romans la Mediterrània?", a: ["Pontus Mare", "Mare Nostrum", "Oceanus", "Mare Magnum"], correct: 1 },
    { q: "De quina llengua provenen el castellà, el francès o l’italià?", a: ["Grec", "Fenici", "Llatí", "Àrabs"], correct: 2 },
    { q: "On va néixer l’islam?", a: ["Roma", "Jerusalem", "La Meca", "Alexandria"], correct: 2 },
    { q: "Qui va fundar l’islam?", a: ["Moisès", "Jesús", "Muhammad", "Constantí"], correct: 2 },
    { q: "Quin territori peninsular va formar part d’Al-Àndalus?", a: ["França", "Península Ibèrica", "Itàlia", "Grècia"], correct: 1 },
    { q: "Quines tres religions monoteistes conviuen a la Mediterrània?", a: ["Cristianisme, budisme i islam", "Judaisme, cristianisme i islam", "Hinduïsme, judaisme i islam", "Cristianisme, islam i taoisme"], correct: 1 },
    { q: "Quin imperi va dominar el nord d’Àfrica abans del colonialisme europeu?", a: ["Grec", "Romà", "Otomà", "Fenici"], correct: 2 },
    { q: "Quin producte és típic del clima mediterrani?", a: ["Arròs tropical", "Olives", "Coco", "Cacau"], correct: 1 },
    { q: "Quin d’aquests plats forma part de la cuina mediterrània?", a: ["Sushi", "Tacos", "Falàfel", "Hamburguesa"], correct: 2 },
    { q: "Per què la Mediterrània ha estat una cruïlla de civilitzacions?", a: ["Perquè és molt freda", "Perquè connecta continents", "Perquè és un oceà", "Perquè no té ports"], correct: 1 },
    { q: "Quin problema actual es menciona al text?", a: ["La desertificació del Nil", "La desaparició de les illes", "La mort de migrants al mar", "El tancament del canal de Suez"], correct: 2 },
    { q: "Què simbolitza avui la Mediterrània segons el text?", a: ["Només turisme", "Una frontera", "Un desert", "Un llac interior"], correct: 1 }
];

let medTestState = {
    currentQ: 0,
    score: 0,
    answers: [] // Per guardar què ha respost
};

// --- NAVEGACIÓ MENÚ ---

function showMediterraniMenu() {
    // Amagar activitats, mostrar menú
    document.getElementById('med-activities-menu').classList.remove('hidden');
    document.getElementById('med-activity-capitals').classList.add('hidden');
    document.getElementById('med-activity-test_mar').classList.add('hidden');
}

function openMediterraniActivity(activityId) {
    document.getElementById('med-activities-menu').classList.add('hidden');

    if (activityId === 'capitals') {
        document.getElementById('med-activity-capitals').classList.remove('hidden');
        // Inicialitzem capitells si cal, però ja ho fa el botó 'Pràctica'/'Examen'
    } else if (activityId === 'test_mar') {
        document.getElementById('med-activity-test_mar').classList.remove('hidden');
    }
}

// --- LÒGICA DEL TEST ---

function initMediterraniTest() {
    medTestState.currentQ = 0;
    medTestState.score = 0;
    medTestState.answers = new Array(marDelMigQuestions.length).fill(null);

    document.getElementById('test-container').classList.remove('hidden');
    document.getElementById('test-results').classList.add('hidden');
    document.querySelector('#med-activity-test_mar .game-controls').classList.add('hidden'); // Amagar botó començar

    showTestQuestion();
}

function showTestQuestion() {
    const qData = marDelMigQuestions[medTestState.currentQ];

    // UI Update
    document.getElementById('test-progress').innerText = `Pregunta ${medTestState.currentQ + 1}/${marDelMigQuestions.length}`;
    document.getElementById('test-score').innerText = `Encerts: ${medTestState.score}`;

    document.getElementById('test-question-text').innerText = qData.q;

    // Options
    const optsContainer = document.getElementById('test-options');
    optsContainer.innerHTML = '';

    qData.a.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-option w-full text-left mb-2'; // w-full i text-left si tinguéssim tailwind, sino CSS normal a sota
        btn.innerText = optText;
        btn.onclick = () => handleTestAnswer(idx, btn);
        optsContainer.appendChild(btn);
    });

    document.getElementById('test-feedback').innerText = '';
    const nextBtn = document.getElementById('test-next-btn');
    nextBtn.classList.add('hidden');
    nextBtn.classList.remove('active-step'); // Important: Reset flag so we can answer next question
}

function handleTestAnswer(selectedIndex, btnElement) {
    // Evitar respondre dos cops
    if (document.getElementById('test-next-btn').classList.contains('active-step')) return; // flag simple

    const qData = marDelMigQuestions[medTestState.currentQ];
    const isCorrect = selectedIndex === qData.correct;

    // Estils visual
    const buttons = document.getElementById('test-options').querySelectorAll('button');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === qData.correct) btn.classList.add('correct');
        else if (idx === selectedIndex) btn.classList.add('incorrect');
    });

    if (isCorrect) {
        medTestState.score++;
        document.getElementById('test-feedback').innerText = "Correcte!";
        document.getElementById('test-feedback').style.color = 'green';
    } else {
        document.getElementById('test-feedback').innerText = "Incorrecte.";
        document.getElementById('test-feedback').style.color = 'red';
    }

    // Mostrar botó següent
    const nextBtn = document.getElementById('test-next-btn');
    nextBtn.classList.remove('hidden');
    nextBtn.classList.add('active-step'); // Flag per no re-clicar opcions
}

function nextTestQuestion() {
    medTestState.currentQ++;
    if (medTestState.currentQ >= marDelMigQuestions.length) {
        finishTest();
    } else {
        showTestQuestion();
    }
}

async function finishTest() {
    document.getElementById('test-container').classList.add('hidden');
    document.getElementById('test-results').classList.remove('hidden');

    document.getElementById('test-final-score').innerText = `${medTestState.score} / ${marDelMigQuestions.length}`;

    const percentage = (medTestState.score / marDelMigQuestions.length) * 100;
    let msg = "";
    if (percentage >= 90) msg = "Excel·lent!";
    else if (percentage >= 70) msg = "Molt bé!";
    else if (percentage >= 50) msg = "Aprovat.";
    else msg = "Has de repassar el vídeo.";

    document.getElementById('test-message').innerText = msg;

    // Guardar al Backend
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const resultData = {
            email: user.email,
            curs: user.curs,
            projecte: 'Mediterrani',
            app: 'Mar del Mig (Test)',
            nivell: 'Nivell 1',
            puntuacio: medTestState.score, // Sobre 25
            temps_segons: 0, // No calculem temps aquí
            feedback_pos: '',
            feedback_neg: ''
        };

        try {
            const response = await callApi('saveResult', resultData);
            if (response && response.status === 'success') {
                document.getElementById('test-message').innerText += " (Resultat guardat!)";
            } else {
                document.getElementById('test-message').innerText += " (Error al guardar)";
            }
        } catch (e) {
            console.error("Error saving test", e);
            document.getElementById('test-message').innerText += " (Error de connexió)";
        }
    }
}
