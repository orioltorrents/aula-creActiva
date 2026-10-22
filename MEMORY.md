# Memòria Global del Projecte: aulaCreActiva

## Estat actual
- Les skills del projecte es mantenen a `.agents/skills/`; `.opencode/` es reserva per a dependències i configuració local d'OpenCode.
- `AGENTS.md` conté les regles permanents; aquest fitxer només conserva l'estat actual, els riscos oberts i els tres últims passos significatius.

## Riscos oberts
- Cap risc obert registrat.

## Roadmap vigent
- Cap 

## Tres últims passos

### 2026-10-22 - Segona clau dicotòmica d'insectes aquàtics
- Afegit un selector entre la clau de grans grups i la clau dels ordres d'insectes en fase aquàtica.
- La segona clau inclou resultats en català per Dípters, Odonats, Efemeròpters, Tricòpters i la resta d'ordres del document, amb famílies quan estan disponibles.

### 2026-10-22 - Model 3D de la larva de Culex
- Afegit Culex al selector de l'activitat 3D amb `Culex_web.glb` i `Anatomia_Culex.json`.
- Les preguntes anatòmiques es carreguen des del JSON i tenen dades de reserva integrades.

### 2026-10-22 - Primera clau dicotòmica de macroinvertebrats
- Integrada l'activitat `clau-macroinvertebrats` amb set espècies, decisions guiades, feedback i puntuació.
- Les imatges provenen de `assets/images/natura/clau-macroinvertebrats/` i els resultats es desen amb `saveResult`.
