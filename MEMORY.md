# Memòria Global del Projecte: aulaCreActiva

## Estat actual
- Les skills del projecte es mantenen a `.agents/skills/`; `.opencode/` es reserva per a dependències i configuració local d'OpenCode.
- `AGENTS.md` conté les regles permanents; aquest fitxer només conserva l'estat actual, els riscos oberts i els tres últims passos significatius.
- Unificada l'activitat "Estris de laboratori" com a principal a Biologia, amb opcions de resposta en matriu de 2x2, eliminant la versió 2D antiga.
- El catàleg i el banc de preguntes incorporen també l'espàtula i la vareta de vidre.
- El catàleg i el banc incorporen la pipeta Pasteur de LDPE amb capacitat nominal de 3 mL.
- Generades variants de proveta de 500 mL amb líquid a 300 mL i 200 mL per a preguntes de resta de volums.

## Riscos oberts
- Cap risc obert registrat.

## Tres últims passos

### 2026-10-24 - Filtres per Tema, Dificultat i refactorització BEM
- Afegits selectors BEM per Tema (Noms, Funcions, Capacitats, Clic 3D) i Dificultat (Fàcil, Mitjà, Difícil).
- Refactoritzat l'estil dels botons d'opció i filtre segons el mandat BEM oficial a `AGENTS.md` i `css/components/buttons.css`.

### 2026-10-24 - Banc de 60 preguntes 3D, nivell de líquid dinàmic i rondes de 10 preguntes
- Ampliat el banc a 60 preguntes a `preguntes-pilot-3d.json` integrant el matràs aforat, la gradeta de plàstic i el tub d'assaig.
- Afegit el control dinàmic d'alçada de líquid (`morphTargetInfluences`) i configurat el selector atzarós Fisher-Yates per a 10 preguntes per sessió.

### 2026-10-24 - Unificació de l'activitat d'Estris de Laboratori i matriu 2x2
- Eliminat el mòdul 2D antic i establerta l'activitat unificada oficial com a "Estris de laboratori".
- Configurada la disposició de les opcions de resposta en una matriu de 2x2 (`grid-template-columns: repeat(2, 1fr)`).

### 2026-10-24 - Integració d'espàtula i vareta de vidre
- Afegits `espatula_200mm` i `vareta-de-vidre_6x200mm` a `catalog-estris.json`.
- Ampliat el banc a 69 preguntes amb nom, funcions, selecció 3D i relació del borosilicat amb els àcids.
- Inclosa l'excepció didàctica de l'àcid fluorhídric (HF), que ataca el vidre.

### 2026-10-24 - Integració de la pipeta Pasteur
- Afegida `pipeta-pasteur_3mL` al catàleg i ampliat el banc a 74 preguntes.
- Les preguntes distingeixen capacitat nominal i mesura precisa, material LDPE i compatibilitat condicionada amb àcids.

### 2026-10-24 - Comparació de volums en provetes
- Exportades `proveta_500ml-amb-liquid-300ml.glb` i `proveta_500ml-amb-liquid-200ml.glb`.
- Afegida una pregunta amb els dos models: calcular els 100 mL abocats entre els dos nivells.
