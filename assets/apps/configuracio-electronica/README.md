# Configuració electrònica

Còpia integrada a Aula CreActiva de la [revisió original de Felip Sarroca](https://github.com/felipsarroca/edu-apps/tree/565bcd75ae974afccea667a993fa91e84f59dc6e/ConfiguracioElectronica). El simulador conserva el comportament i l'atribució originals.

Aplicació web per **construir els àtoms electró a electró** i veure, en una sola pantalla i alhora, com canvien la configuració electrònica, el diagrama d'orbitals i el model de Bohr. Pensada per a física i química d'ESO i batxillerat.

## Què mostra
- **Taula periòdica** (forma de 18 columnes recomanada per la IUPAC): un clic sobre un element carrega la seva configuració. Es pot acolorir **per blocs** (s, p, d, f, amb els mateixos colors que els orbitals) o **per famílies**.
- **Diagrama d'orbitals** per nivells i subnivells, amb la **regla de Hund** (primer un electró per orbital i després s'aparellen). La casella que brilla indica on anirà el següent electró. Si fas clic en qualsevol casella, l'àtom s'omple fins a aquell electró.
- **Diagrama de Moeller** amb l'ordre d'ompliment: els subnivells plens es pinten i el que s'està omplint queda marcat.
- **Fitxa de l'element**: període, grup, bloc, família, massa atòmica i capa de valència.
- **Configuració completa i abreujada** (amb el gas noble anterior) i **nombres quàntics de l'últim electró** (n, l, mₗ, mₛ).
- **Excepcions**: per a Cr, Cu, Nb, Mo, Ru, Rh, Pd, Ag, La, Ce, Gd, Pt, Au, Ac, Th, Pa, U, Np, Cm i Lr s'indica la configuració real (experimental) i se n'explica breument el motiu.
- **Model de Bohr** amb els electrons dibuixats a cada capa (K, L, M…) i la capa de valència destacada.

## Ús
- Botons **+** i **−**, o tecles **→ / +** i **← / −**. **Inici** reinicia i **Fi** va fins a l'oganessó (118).
- Clic a un element de la taula o a una casella del diagrama d'orbitals per anar-hi directament.
- Botó de tema clar o fosc.

## Adaptació a la pantalla
El disseny de referència és de 1440 × 800 px útils. En pantalles d'ordinador més petites (1366 × 768, escalat del sistema del 125 % o el 150 %) tot s'escala uniformement, i en pantalles grans i pissarres digitals s'amplia fins a 1,4×. L'escala es recalcula en redimensionar la finestra o canviar de monitor. En mòbils i tauletes estretes, els blocs s'apilen en una columna i la taula es desplaça horitzontalment dins del seu marc.

## Tecnologia
HTML, CSS i JavaScript sense dependències ni compilació: obre `index.html` en un navegador.

---
Aplicació creada per [Felip Sarroca](https://ja.cat/felipsarroca) amb assistència de la IA · Obra sota llicència [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ca)
