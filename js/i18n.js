/**
 * Sistema d'Internacionalització (i18n)
 * Suport per a: Català (ca), Castellà (es), Anglès (en), Àrab (ar)
 */

const i18n = {
    currentLang: 'ca', // Idioma per defecte

    // Diccionari de textos comuns
    translations: {
        'ca': {
            'btn_practice': 'Pràctica',
            'btn_exam': 'Examen',
            'btn_start': 'Començar',
            'btn_next': 'Següent',
            'btn_finish': 'Finalitzar',
            'score': 'Puntuació',
            'correct': 'Correcte!',
            'incorrect': 'Incorrecte.',
            'time': 'Temps',
            'loading': 'Carregant...',
            'result_saved': 'Resultat guardat correctament!',
            'result_error': 'Error al guardar el resultat.',
            'select_answer': 'Selecciona la resposta correcta:',
            'final_score': 'Puntuació Final',
            'mode_practice_desc': 'Practica sense límit de temps i amb feedback immediat. Els resultats no es guarden.',
            'mode_exam_desc': 'Posa a prova els teus coneixements. Els resultats es guardaran al teu expedient.',
            'language': 'Idioma',
            'choose_lang': 'Tria el teu idioma',
            'active_projects': 'Aquests són els teus projectes actius.',
            'hide_country': 'Amagar País',
            'show_country': 'Mostrar País',
            'act_map_title': 'Mapa del Mediterrani',
            'act_map_desc': 'Identifica els països al mapa',
            'no_projects': 'No tens projectes assignats o no s\'han pogut carregar.',
            'med_project_title': 'Projecte Mediterrani',
            'act_capitals_title': 'Capitals',
            'act_capitals_desc': 'Aprèn les capitals del Mediterrani',
            'act_sea_title': 'El Mar del Mig',
            'act_sea_desc': 'Vídeo i Test de coneixements',
            'btn_start_test': 'Començar Test',
            'par_project_title': 'Projecte Paralímpics',
            'act_microbit_title': 'Control de la Micro:bit',
            'act_microbit_desc': 'Demostra què saps sobre la placa',
            'btn_start': 'Començar'
        },
        'es': {
            'btn_practice': 'Práctica',
            'btn_exam': 'Examen',
            'btn_start': 'Empezar',
            'btn_next': 'Siguiente',
            'btn_finish': 'Finalizar',
            'score': 'Puntuación',
            'correct': '¡Correcto!',
            'incorrect': 'Incorrecto.',
            'time': 'Tiempo',
            'loading': 'Cargando...',
            'result_saved': '¡Resultado guardado correctamente!',
            'result_error': 'Error al guardar el resultado.',
            'select_answer': 'Selecciona la respuesta correcta:',
            'final_score': 'Puntuación Final',
            'mode_practice_desc': 'Practica sin límite de tiempo y con feedback inmediato. Los resultados no se guardan.',
            'mode_exam_desc': 'Pon a prueba tus conocimientos. Los resultados se guardarán en tu expediente.',
            'language': 'Idioma',
            'choose_lang': 'Elige tu idioma',
            'active_projects': 'Estos son tus proyectos activos.',
            'hide_country': 'Ocultar País',
            'show_country': 'Mostrar País',
            'act_map_title': 'Mapa del Mediterráneo',
            'act_map_desc': 'Identifica los países en el mapa',
            'no_projects': 'No tienes proyectos asignados o no se han podido cargar.',
            'med_project_title': 'Proyecto Mediterráneo',
            'act_capitals_title': 'Capitales',
            'act_capitals_desc': 'Aprende las capitales del Mediterráneo',
            'act_sea_title': 'El Mar del Medio',
            'act_sea_desc': 'Vídeo y Test de conocimientos',
            'btn_start_test': 'Empezar Test',
            'par_project_title': 'Proyecto Paralímpicos',
            'act_microbit_title': 'Control de la Micro:bit',
            'act_microbit_desc': 'Demuestra qué sabes sobre la placa',
            'btn_start': 'Comenzar'
        },
        'en': {
            'btn_practice': 'Practice',
            'btn_exam': 'Exam',
            'btn_start': 'Start',
            'btn_next': 'Next',
            'btn_finish': 'Finish',
            'score': 'Score',
            'correct': 'Correct!',
            'incorrect': 'Incorrect.',
            'time': 'Time',
            'loading': 'Loading...',
            'result_saved': 'Result saved successfully!',
            'result_error': 'Error saving result.',
            'select_answer': 'Select the correct answer:',
            'final_score': 'Final Score',
            'mode_practice_desc': 'Practice without time limit and with immediate feedback. Results are not saved.',
            'mode_exam_desc': 'Test your knowledge. Results will be saved to your record.',
            'language': 'Language',
            'choose_lang': 'Choose your language',
            'active_projects': 'These are your active projects.',
            'hide_country': 'Hide Country',
            'show_country': 'Show Country',
            'act_map_title': 'Mediterranean Map',
            'act_map_desc': 'Identify countries on the map',
            'no_projects': 'You have no assigned projects or they could not be loaded.',
            'med_project_title': 'Mediterranean Project',
            'act_capitals_title': 'Capitals',
            'act_capitals_desc': 'Learn the capitals of the Mediterranean',
            'act_sea_title': 'The Middle Sea',
            'act_sea_desc': 'Video and Knowledge Test',
            'btn_start_test': 'Start Test',
            'par_project_title': 'Paralympics Project',
            'act_microbit_title': 'Micro:bit Control',
            'act_microbit_desc': 'Show what you know about the board',
            'btn_start': 'Start'
        },
        'ar': {
            'btn_practice': 'ممارسة',
            'btn_exam': 'امتحان',
            'btn_start': 'ابدأ',
            'btn_next': 'التالي',
            'btn_finish': 'إنهاء',
            'score': 'النتيجة',
            'correct': 'صحيح!',
            'incorrect': 'خطأ.',
            'time': 'الوقت',
            'loading': 'جار التحميل...',
            'result_saved': 'تم حفظ النتيجة بنجاح!',
            'result_error': 'خطأ في حفظ النتيجة.',
            'select_answer': 'اختر الإجابة الصحيحة:',
            'final_score': 'النتيجة النهائية',
            'mode_practice_desc': 'مارس بدون حد زمني ومع تعليقات فورية. لا يتم حفظ النتائج.',
            'mode_exam_desc': 'اختبر معلوماتك. سيتم حفظ النتائج في سجلك.',
            'language': 'لغة',
            'choose_lang': 'اختر لغتك',
            'active_projects': 'هذه هي مشاريعك النشطة.',
            'hide_country': 'إخفاء البلد',
            'show_country': 'إظهار البلد',
            'act_map_title': 'خريطة البحر الأبيض المتوسط',
            'act_map_desc': 'تحديد البلدان على الخريطة',
            'no_projects': 'ليس لديك مشاريع معينة أو لم يتم تحميلها.',
            'med_project_title': 'مشروع البحر الأبيض المتوسط',
            'act_capitals_title': 'العواصم',
            'act_capitals_desc': 'تعلم عواصم البحر الأبيض المتوسط',
            'act_sea_title': 'البحر الأوسط',
            'act_sea_desc': 'فيديو واختبار المعلومات',
            'btn_start_test': 'ابدأ الاختبار',
            'par_project_title': 'مشروع بارالمبيك',
            'act_microbit_title': 'التحكم في Micro:bit',
            'act_microbit_desc': 'أظهر ما تعرفه عن اللوحة',
            'btn_start': 'ابدأ'
        }
    },

    // Funció per canviar l'idioma
    setLanguage: function (lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;

            // Actualitzar direcció del text per a Àrab
            if (lang === 'ar') {
                document.body.setAttribute('dir', 'rtl');
                document.body.classList.add('rtl');
            } else {
                document.body.setAttribute('dir', 'ltr');
                document.body.classList.remove('rtl');
            }

            // Disparar esdeveniment de canvi d'idioma per a que els jocs s'actualitzin
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));

            console.log('Idioma canviat a:', lang);
        }
    },

    // Funció per obtenir una traducció
    t: function (key) {
        const text = this.translations[this.currentLang][key];
        return text || key; // Si no troba la clau, retorna la clau mateixa
    }
};
