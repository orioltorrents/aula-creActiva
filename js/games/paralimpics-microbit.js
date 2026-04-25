/**
 * Activitat: CONTROL DE LA MICRO:BIT
 * Projecte: Paralímpics
 */

const microbitQuestions = [
    {
        q: "Què és la placa micro:bit?",
        a: [
            "Un ordinador de sobretaula per a jocs.",
            "Una placa programable per introduir-nos en el món de la programació i la robòtica.",
            "Un sensor que només detecta la temperatura.",
            "Una bateria externa per a telèfons mòbils."
        ],
        correct: 1, level: 'easy'
    },
    {
        q: "Quina és la mida aproximada de la placa?",
        a: ["10 x 10 cm.", "4 x 5 cm.", "2 x 2 cm.", "15 x 20 cm."],
        correct: 1, level: 'easy'
    },
    {
        q: "Com es diu l'editor de programació oficial basat en blocs per a aquesta placa?",
        a: ["Scratch.", "Microsoft MakeCode.", "Python Editor.", "Arduino IDE."],
        correct: 1, level: 'easy'
    },
    {
        q: "Quantes piles AAA s'inclouen normalment a la capsa segons la guia d'inici?",
        a: ["Una.", "Dues.", "Quatre.", "Cap, funciona amb bateria solar."],
        correct: 1, level: 'easy'
    },
    {
        q: "De quines maneres es pot alimentar o engegar la placa?",
        a: [
            "Només mitjançant Bluetooth.",
            "Únicament amb un panell solar.",
            "Connectant el compartiment de piles o mitjançant un cable micro-USB a l'ordinador.",
            "Fregant el sensor tàctil durant 10 segons."
        ],
        correct: 2, level: 'medium'
    },
    {
        q: "Què indica una llum de color taronja a la placa?",
        a: [
            "Que la bateria està a punt d'esgotar-se.",
            "Que la placa està connectada correctament a l'ordinador.",
            "Que hi ha un error en el codi.",
            "Que el sensor de llum està detectant molta claror."
        ],
        correct: 1, level: 'hard'
    },
    {
        q: "Què indica la llum vermella quan engeguem la placa?",
        a: [
            "Un error crític del processador.",
            "Que la placa està rebent càrrega o alimentació.",
            "Que el Bluetooth està activat.",
            "Que el micròfon està gravant."
        ],
        correct: 1, level: 'hard'
    },
    {
        q: "Quants LEDs té la matriu integrada a la part frontal?",
        a: ["5 LEDs.", "10 LEDs.", "25 LEDs.", "100 LEDs."],
        correct: 2, level: 'medium'
    },
    {
        q: "Com estan distribuïts els LEDs de la matriu frontal?",
        a: [
            "En un cercle.",
            "En cinc files de cinc columnes.",
            "En una sola línia horitzontal.",
            "Formant un quadrat de 4x4."
        ],
        correct: 1, level: 'easy'
    },
    {
        q: "Quin component de la placa actua com a sensor de llum ambiental?",
        a: ["El micròfon.", "Els mateixos LEDs de la matriu.", "L'antena de Bluetooth.", "El botó de reinici."],
        correct: 1, level: 'hard'
    },
    {
        q: "Quin sensor ens permet conèixer els girs i moviments que fa la placa?",
        a: ["El magnetòmetre.", "L'acceleròmetre.", "El sensor de temperatura.", "El micròfon."],
        correct: 1, level: 'medium'
    },
    {
        q: "Quina és la funció del magnetòmetre (brúixola digital)?",
        a: [
            "Mesurar la velocitat de la placa.",
            "Detectar camps magnètics i el nord magnètic de la Terra.",
            "Escalfar la placa en climes freds.",
            "Comptar els passos de l'usuari."
        ],
        correct: 1, level: 'medium'
    },
    {
        q: "Com funciona el \"sensor de contacte\" situat al logotip?",
        a: [
            "Cal prémer-lo amb molta força.",
            "És un sensor tàctil que actua sense necessitat d'exercir pressió.",
            "Només funciona si portem guants.",
            "Serveix per mesurar la humitat de la pell."
        ],
        correct: 1, level: 'medium'
    },
    {
        q: "En quina unitat mesura la temperatura el sensor integrat?",
        a: ["Graus Fahrenheit.", "Kelvin.", "Graus Celsius.", "Percentatge de calor."],
        correct: 2, level: 'easy'
    },
    {
        q: "Per a què serveix el brunzidor (altaveu) de la placa?",
        a: [
            "Per gravar converses.",
            "Per produir so i incorporar melodies als projectes.",
            "Per connectar-se a la ràdio FM.",
            "Per amplificar el so del micròfon."
        ],
        correct: 1, level: 'easy'
    },
    {
        q: "Quants pins de connexió totals té la placa a la part inferior?",
        a: ["5 pins.", "10 pins.", "25 pins.", "3 pins."],
        correct: 2, level: 'hard'
    },
    {
        q: "Quins són els noms dels 5 pins més amples per a connexió fàcil?",
        a: [
            "A, B, C, D i E.",
            "0, 1, 2, 3V i GND (terra).",
            "Nord, Sud, Est, Oest i Centre.",
            "USB, Bateria, LED, So i Llum."
        ],
        correct: 1, level: 'hard'
    },
    {
        q: "Dins de l'entorn MakeCode, on podem trobar les categories de blocs (Bàsic, Entrada, Música...)?",
        a: ["Al simulador.", "A la caixa d'eines.", "A l'espai de treball.", "Al menú d'opcions de l'engranatge."],
        correct: 1, level: 'medium'
    },
    {
        q: "Quina part de l'entorn MakeCode ens permet veure el resultat del nostre codi sense tenir la placa física connectada?",
        a: ["El simulador.", "La caixa d'eines.", "A l'espai de treball.", "El botó de transferir."],
        correct: 0, level: 'easy'
    },
    {
        q: "Quin botó hem de prémer per enviar el programa que hem creat des de l'ordinador a la placa micro:bit?",
        a: ["Desa.", "Projecte nou.", "Transferir.", "Reinicia."],
        correct: 2, level: 'easy'
    }
];

let paralimpicsState = {
    activeQuestions: [],
    currentQ: 0,
    score: 0,
    examFinished: false,
    locked: false,
    level: 'mixed'
};

function initParalimpicsMicrobit(selectedLevel) {
    paralimpicsState.level = selectedLevel;
    paralimpicsState.currentQ = 0;
    paralimpicsState.score = 0;
    paralimpicsState.examFinished = false;
    paralimpicsState.locked = false;

    // Filtrar i barrejar preguntes
    let pool = [];
    if (selectedLevel === 'mixed') {
        pool = [...microbitQuestions];
    } else {
        pool = microbitQuestions.filter(q => q.level === selectedLevel);
    }

    // Barrejar i agafar màxim 10
    paralimpicsState.activeQuestions = pool.sort(() => Math.random() - 0.5).slice(0, 10);

    document.getElementById('paralimpics-quiz-container').classList.remove('hidden');
    document.getElementById('paralimpics-results').classList.add('hidden');
    document.querySelector('#paralimpics-activity-microbit .game-controls').classList.add('hidden');

    showParalimpicsQuestion();
}

function showParalimpicsQuestion() {
    const qData = paralimpicsState.activeQuestions[paralimpicsState.currentQ];

    document.getElementById('paralimpics-progress').innerText = `${i18n.t('question') || 'Pregunta'} ${paralimpicsState.currentQ + 1}/${paralimpicsState.activeQuestions.length}`;
    document.getElementById('paralimpics-score').innerText = `${i18n.t('score')}: ${paralimpicsState.score}`;

    document.getElementById('paralimpics-question-text').innerText = qData.q;

    const optsContainer = document.getElementById('paralimpics-options');
    optsContainer.innerHTML = '';

    qData.a.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-option w-full text-left mb-2';
        btn.innerText = optText;
        btn.onclick = () => handleParalimpicsAnswer(idx);
        optsContainer.appendChild(btn);
    });

    document.getElementById('paralimpics-feedback').innerText = '';
}

function handleParalimpicsAnswer(selectedIndex) {
    if (paralimpicsState.locked) return;
    paralimpicsState.locked = true;

    const qData = paralimpicsState.activeQuestions[paralimpicsState.currentQ];
    const isCorrect = selectedIndex === qData.correct;

    const buttons = document.getElementById('paralimpics-options').querySelectorAll('button');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === qData.correct) btn.classList.add('correct');
        else if (idx === selectedIndex) btn.classList.add('incorrect');
    });

    if (isCorrect) {
        paralimpicsState.score += 10;
        document.getElementById('paralimpics-feedback').innerText = i18n.t('correct');
        document.getElementById('paralimpics-feedback').style.color = 'green';
    } else {
        document.getElementById('paralimpics-feedback').innerText = i18n.t('incorrect');
        document.getElementById('paralimpics-feedback').style.color = 'red';
    }

    setTimeout(() => {
        paralimpicsState.currentQ++;
        paralimpicsState.locked = false;
        if (paralimpicsState.currentQ >= paralimpicsState.activeQuestions.length) {
            finishParalimpicsGame();
        } else {
            showParalimpicsQuestion();
        }
    }, 1500);
}

async function finishParalimpicsGame() {
    paralimpicsState.examFinished = true;
    document.getElementById('paralimpics-quiz-container').classList.add('hidden');
    document.getElementById('paralimpics-results').classList.remove('hidden');

    const totalPossible = paralimpicsState.activeQuestions.length * 10;
    document.getElementById('paralimpics-final-score').innerText = `${paralimpicsState.score} / ${totalPossible}`;

    // Missatge de feedback segons puntuació
    const percentage = (paralimpicsState.score / totalPossible) * 100;
    let msg = "";
    if (percentage >= 90) msg = "Excel·lent! Ets un expert en micro:bit!";
    else if (percentage >= 70) msg = "Molt bé! Tens un bon control de la placa.";
    else if (percentage >= 50) msg = "Ho has superat, però cal repassar alguns conceptes.";
    else msg = "Has de repassar la guia de la micro:bit. Ànims!";

    document.getElementById('paralimpics-message').innerText = msg;

    // Guardar al Backend
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const resultData = {
            email: user.email,
            curs: user.curs,
            projecte: 'Paralímpics',
            app: 'Microbit Control',
            nivell: paralimpicsState.level.charAt(0).toUpperCase() + paralimpicsState.level.slice(1),
            puntuacio: paralimpicsState.score,
            temps_segons: 0,
            feedback_pos: '',
            feedback_neg: ''
        };

        try {
            const response = await callApi('saveResult', resultData);
            if (response && response.status === 'success') {
                document.getElementById('paralimpics-message').innerText += `\n(${i18n.t('result_saved')})`;
            }
        } catch (e) {
            console.error("Error saving paralimpics results", e);
        }
    }
}

function updateParalimpicsLanguage() {
    if (!paralimpicsState.examFinished && paralimpicsState.activeQuestions.length > 0) {
        showParalimpicsQuestion();
    }
}
