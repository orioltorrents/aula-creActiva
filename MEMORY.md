# Memòria Global del Projecte: aulaCreActiva

## Estat actual
- Les skills del projecte es mantenen a `.agents/skills/`; `.opencode/` es reserva per a dependències i configuració local d'OpenCode.
- `AGENTS.md` conté les regles permanents; aquest fitxer només conserva l'estat actual, els riscos oberts i els tres últims passos significatius.

## Riscos oberts
- Cap risc obert registrat.

## Roadmap vigent
- Cap 

## Tres últims passos

### 2026-10-22 - Suport per a animacions 3D i Echinogammarus_animat
- Activat el reproductor d'animacions de Three.js (AnimationMixer i Clock) per executar animacions en carregar models GLB.
- Vinculat el model d'Echinogammarus a la versió animada `Echinogammarus_animat.glb` amb la seva miniatura corresponent.

### 2026-10-22 - Ajustos a bioindicadors, qüestionari 3D i model de Baetis
- Configurada mostra aleatòria d'entre 6 i 10 espècies per ronda a l'activitat de bioindicadors.
- Limitat el mode practicar dels models 3D a una selecció aleatòria de 10 preguntes per sessió.
- Canviat el nom del model de bètid a "Larva de Baetis" en la interfície i configuracions.

### 2026-10-22 - Integrat el model 3D d'Echinogammarus
- Afegit Echinogammarus al selector del visor 3D d'anatomia de macroinvertebrats amb model GLB, JSON anatòmic complet i fallback de preguntes.
- Adaptat el selector de models 3D amb graella fluida i responsive per a 5 models.
