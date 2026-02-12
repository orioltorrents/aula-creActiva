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
            'active_projects': 'Aquests són els teus projectes actius.'
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
            'active_projects': 'Estos son tus proyectos activos.'
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
            'active_projects': 'These are your active projects.'
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
            'active_projects': 'هذه هي مشاريعك النشطة.'
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
