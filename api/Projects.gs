/**
 * Cataleg de projectes disponibles per curs.
 */

function getProjects(curs) {
    // Cataleg manual de projectes. Si algun dia vols que sigui editable sense tocar codi,
    // aquest objecte es pot moure a una pestanya "projectes" del Google Sheet.

    const catalog = {
        // Noms de curs habituals.
        '1r ESO': [
            { id: 'p1_rates', titol: 'Rates a la carrera', descripcio: 'Projecte de biologia i matematiques.' },
            { id: 'p1_mediterrani', titol: 'Mediterrani', descripcio: 'Historia i geografia del mar Mediterrani.' },
            { id: 'p1_biologia', titol: 'Biologia 1r ESO', descripcio: 'Conceptes de Biologia i material de laboratori.' }
        ],
        '2n ESO': [
            { id: 'p2_paralimpics', titol: 'Paralimpics', descripcio: 'Educacio fisica i valors.' },
            { id: 'p2_biologia', titol: 'Biologia', descripcio: 'Estudi dels essers vius i el seu entorn.' },
            { id: 'p2_radio', titol: 'Radio', descripcio: 'Comunicacio, locucio i edicio radiofonica.' }
        ],
        '3r ESO': [
            { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.' },
            { id: 'p3_biologia', titol: 'Biologia 3r ESO', descripcio: 'Biologia humana i activitats de repas.' }
        ],
        '4t ESO': [
            { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.' },
            { id: 'p4_digitalitzacio', titol: 'Digitalitzacio', descripcio: 'Eines i recursos digitals per al segle XXI.' },
            { id: 'p4_biologia', titol: 'Biologia 4t ESO', descripcio: 'Genetica, pedigrees i herencia.' }
        ],
        // Batxillerat.
        '1r Batxillerat': [
            { id: 'batx1_tr', titol: 'Treball de recerca', descripcio: 'Aprendre a formular bones preguntes investigables.' }
        ],
        '2n Batxillerat': [],
        // Aliases: acceptem tambe versions curtes que poden apareixer al Sheet.
        '1ESO': [
            { id: 'p1_rates', titol: 'Rates a la carrera', descripcio: 'Projecte de biologia i matematiques.' },
            { id: 'p1_mediterrani', titol: 'Mediterrani', descripcio: 'Historia i geografia del mar Mediterrani.' },
            { id: 'p1_biologia', titol: 'Biologia 1r ESO', descripcio: 'Conceptes de Biologia i material de laboratori.' }
        ],
        '2ESO': [
            { id: 'p2_paralimpics', titol: 'Paralimpics', descripcio: 'Educacio fisica i valors.' },
            { id: 'p2_biologia', titol: 'Biologia', descripcio: 'Estudi dels essers vius i el seu entorn.' },
            { id: 'p2_radio', titol: 'Radio', descripcio: 'Comunicacio, locucio i edicio radiofonica.' }
        ],
        '3ESO': [
            { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.' },
            { id: 'p3_biologia', titol: 'Biologia 3r ESO', descripcio: 'Biologia humana i activitats de repas.' }
        ],
        '4ESO': [
            { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.' },
            { id: 'p4_digitalitzacio', titol: 'Digitalitzacio', descripcio: 'Eines i recursos digitals per al segle XXI.' },
            { id: 'p4_biologia', titol: 'Biologia 4t ESO', descripcio: 'Genetica, pedigrees i herencia.' }
        ],
        '1Batx': [
            { id: 'batx1_tr', titol: 'Treball de recerca', descripcio: 'Aprendre a formular bones preguntes investigables.' }
        ],
        '2Batx': []
    };

    const projectes = catalog[curs] || [];

    return { status: 'success', projectes: projectes };
}
