# Memòria Global del Projecte: aulaCreActiva

## Estat actual
- Les skills del projecte es mantenen a `.agents/skills/`; `.opencode/` es reserva per a dependències i configuració local d'OpenCode.
- `AGENTS.md` conté les regles permanents; aquest fitxer només conserva l'estat actual, els riscos oberts i els tres últims passos significatius.

## Riscos oberts
- Cap risc obert registrat.

## Roadmap vigent
- Cap 

## Tres últims passos

### 2026-10-22 - Correcció d'etiquetes HTML al fragment d'Entorns de Natura
- Eliminada una etiqueta `</div>` sobrant al final de `fragments/projects/entorns/index.html` que tancava el contenidor `#app` prematurament i deixava la pàgina en blanc.
- Totes les etiquetes HTML de fragments queden balancejades.

### 2026-10-22 - Connexió de la navegació de l'activitat 3D
- Afegit el cas `betid-3d` a la funció activa `openNaturaActivity()` de `js/app.js`.
- La targeta ara mostra `natura-activity-betid-3d` i inicialitza el visor amb `initBetid3DGame()`.

### 2026-10-22 - Selector de larves de macroinvertebrats
- L'activitat 3D ara permet escollir entre el Bètid i Simulium, carregant els seus GLB i JSON corresponents.
- Afegit selector visual, canvi de model, dades de reserva i identificació de l'activitat per model als resultats.
