# Com pujar el projecte a GitHub

Aquí tens els passos per pujar la teva web a GitHub amb el nom **aula-creActiva**.

## Pas 1: Crear el repositori a GitHub

1.  Ves a [github.com/new](https://github.com/new).
2.  Si no has iniciat sessió, fes-ho.
3.  A **Repository name**, escriu exactament: `aula-creActiva`.
4.  Deixa-ho en **Public**.
5.  **IMPORTANT**: No marquis cap casella (ni "Add a README file", ni ".gitignore"). El repositori ha d'estar buit.
6.  Clica el botó verd **Create repository**.

## Pas 2: Pujar el codi des del teu ordinador

Ara necessites obrir un terminal a la carpeta del teu projecte i executar aquestes comandes una per una.

1.  **Obre el terminal** a la carpeta del projecte (`d:\77 - Intermunicipal\Curs 2025-2026\aulaCreActiva`).
2.  Executa aquestes comandes:

```bash
# 1. Inicialitzar Git (si no ho has fet ja)
git init

# 2. Afegir tots els fitxers
git add .

# 3. Guardar la primera versió
git commit -m "Primera versió aula-creActiva"

# 4. Canviar el nom de la branca principal a 'main'
git branch -M main

# 5. Connectar amb GitHub (SUBSTITUEIX 'EL_TEU_USUARI' pel teu nom d'usuari de GitHub!)
git remote add origin https://github.com/EL_TEU_USUARI/aula-creActiva.git

# 6. Pujar els fitxers
git push -u origin main
```

## Pas 3: Activar GitHub Pages (per veure la web online)

Un cop hagis pujat el codi:

1.  Dins del teu repositori a GitHub, ves a la pestanya **Settings** (a dalt a la dreta).
2.  Al menú de l'esquerra, clica a **Pages**.
3.  A "Source", sota "Branch", canvia `None` per `main`.
4.  Clica **Save**.
5.  Espera uns minuts i et donarà la URL de la teva nova web (serà algo com `https://el_teu_usuari.github.io/aula-creActiva/`).

---

**Nota**: Recorda actualitzar la URL de l'API al fitxer `js/app.js` si encara no ho has fet!
