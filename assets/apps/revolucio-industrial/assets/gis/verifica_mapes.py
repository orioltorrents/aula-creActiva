# SPDX-License-Identifier: AGPL-3.0-or-later
"""Verifica els dos mapes al Chrome local i actualitza les captures."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
SHOTS = ROOT / "captures"
SHOTS.mkdir(exist_ok=True)

with sync_playwright() as pw:
    browser = pw.chromium.launch(channel="chrome", headless=True)
    failures = []
    for chapter, scene in (("tren", "mapa"), ("vaixell", "atlantic")):
        for width, height in ((1920, 1080), (1366, 768), (1093, 614), (911, 512), (390, 844)):
            page = browser.new_page(viewport={"width": width, "height": height})
            page.on("pageerror", lambda error: failures.append(str(error)))
            page.goto((ROOT / f"{chapter}.html").as_uri() + f"#{scene}")
            route_id = "#rail-ruta" if chapter == "tren" else "#mar-ruta"
            page.wait_for_selector(f"#tela svg {route_id}")
            if page.locator("#b-play").get_attribute("aria-pressed") == "true":
                page.locator("#b-play").click()
            page.locator("#lliscador").evaluate("el => {el.value = 650; el.dispatchEvent(new Event('input'));}")
            page.wait_for_timeout(150)
            status = page.evaluate("""() => ({
                overflow: document.documentElement.scrollWidth > innerWidth + 2,
                route: document.querySelector('#tela svg path[id$="-ruta"]').getTotalLength(),
                marker: !!document.querySelector('#tela svg g[id$="-tren"], #tela svg g[id$="-vaixell"]'),
                title: document.querySelector('#tela svg title')?.textContent
            })""")
            assert status["route"] > 500 and status["marker"] and status["title"] and not status["overflow"], (chapter, width, status)
            if chapter == "vaixell":
                comparison = page.evaluate("""() => {
                    const svg = document.querySelector('#tela svg');
                    const out = [...svg.querySelectorAll('text')].filter(el => {
                        const b = el.getBBox();
                        return b.x < -60 || b.y < 0 || b.x + b.width > 1260 || b.y + b.height > 720;
                    }).map(el => el.textContent);
                    return {
                        out,
                        steam: +document.querySelector('#mar-barra-vapor').getAttribute('width'),
                        sail: +document.querySelector('#mar-barra-vela').getAttribute('width'),
                        ships: !!document.querySelector('#mar-vaixell') && !!document.querySelector('#mar-veler')
                    };
                }""")
                assert not comparison["out"] and comparison["steam"] > comparison["sail"] and comparison["ships"], (width, comparison)
            if width in (1366, 390):
                path = SHOTS / f"{chapter}-mapa-{width}.png"
                page.screenshot(path=str(path), full_page=True)
            print(chapter, width, status["route"])
            page.close()
    browser.close()
    if failures:
        raise AssertionError(failures)
