/**
 * Catàleg de projectes disponibles per curs.
 */

function getProjects(curs) {
    // Catàleg manual de projectes. Si algun dia vols que sigui editable sense tocar codi,
    // aquest objecte es pot moure a una pestanya "projectes" del Google Sheet.

    const catalog = {
        // Noms de curs habituals.
        '1r ESO': [
            { id: 'p1_rates', titol: 'Rates a la carrera', descripcio: 'Projecte de biologia i matemàtiques.' },
            { id: 'p1_mediterrani', titol: 'Mediterrani', descripcio: 'Història i geografia del mar Mediterrani.' }
        ],
        '2n ESO': [
            { id: 'p2_paralimpics', titol: 'Paralímpics', descripcio: 'Educació física i valors.' },
            { id: 'p2_biologia', titol: 'Biologia', descripcio: 'Estudi dels éssers vius i el seu entorn.' },
            { id: 'p2_radio', titol: 'Ràdio', descripcio: 'Comunicació, locució i edició radiofònica.' }
        ],
        '3r ESO': [
            { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.' }
        ],
        '4t ESO': [
            { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.' },
            { id: 'p4_digitalitzacio', titol: 'Digitalització', descripcio: 'Eines i recursos digitals per al segle XXI.' }
        ],
        // Batxillerat.
        '1r Batxillerat': [
            { id: 'batx1_tr', titol: 'Treball de recerca', descripcio: 'Aprendre a formular bones preguntes investigables.' }
        ],
        '2n Batxillerat': [],
        // Aliases: acceptem també versions curtes que poden aparèixer al Sheet.
        '1ESO': [
            { id: 'p1_rates', titol: 'Rates a la carrera', descripcio: 'Projecte de biologia i matemàtiques.' },
            { id: 'p1_mediterrani', titol: 'Mediterrani', descripcio: 'Història i geografia del mar Mediterrani.' }
        ],
        '2ESO': [
            { id: 'p2_paralimpics', titol: 'Paralímpics', descripcio: 'Educació física i valors.' },
            { id: 'p2_biologia', titol: 'Biologia', descripcio: 'Estudi dels éssers vius i el seu entorn.' },
            { id: 'p2_radio', titol: 'Ràdio', descripcio: 'Comunicació, locució i edició radiofònica.' }
        ],
        '3ESO': [
            { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.' }
        ],
        '4ESO': [
            { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.' },
            { id: 'p4_digitalitzacio', titol: 'Digitalització', descripcio: 'Eines i recursos digitals per al segle XXI.' }
        ],
        '1Batx': [
            { id: 'batx1_tr', titol: 'Treball de recerca', descripcio: 'Aprendre a formular bones preguntes investigables.' }
        ],
        '2Batx': []
    };

    const projectes = catalog[curs] || [];

    return { status: 'success', projectes: projectes };
}
