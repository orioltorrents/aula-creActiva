# SPDX-License-Identifier: AGPL-3.0-or-later
"""Comprovació visual i interactiva al navegador (capítols 2D/WebP + visor 3D)."""
import argparse
import functools
import http.server
import json
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
CAPS = ['camp', 'vapor', 'textil', 'fabrica', 'metalls', 'tren', 'vaixell', 'capital']
VIEWPORTS = [(1920, 1080, 1), (1366, 768, 1), (1093, 614, 1.25), (911, 512, 1.5), (390, 844, 1)]
MODELS_SMOKE = ['watt', 'mula', 'rocket', 'western', 'helix', 'sembradora', 'rotativa', 'altforn', 'vaporera']
MODELS_LAYOUT = ['rocket', 'western', 'watt']


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


class ThreadedHTTP(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True


def start_server():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    srv = ThreadedHTTP(('127.0.0.1', 0), handler)
    th = threading.Thread(target=srv.serve_forever, daemon=True)
    th.start()
    return srv, f'http://127.0.0.1:{srv.server_address[1]}'


def check_visor_3d(browser, base_url, errors, inspect_dir):
    tested_3d = 0
    for width, height, dpr in [(1920, 1080, 1), (1366, 768, 1), (390, 844, 1)]:
        models = MODELS_SMOKE if width == 1366 else MODELS_LAYOUT
        page = browser.new_page(viewport={'width': width, 'height': height}, device_scale_factor=dpr)
        page.on('pageerror', lambda e: errors.append(f'visor3d@{width}: {e}'))
        for mid in models:
            page.goto(f'{base_url}/visor-3d.html?m={mid}', wait_until='domcontentloaded')
            page.wait_for_function("() => { const m = document.querySelector('#mv'); return !!(m && m.loaded); }", timeout=25000)
            page.wait_for_timeout(350)
            tested_3d += 1
            overflow = page.evaluate('() => document.documentElement.scrollWidth > innerWidth + 2')
            if overflow:
                errors.append(['visor3d-overflow', mid, width])
            hs_cnt = page.locator('#mv .hs').count()
            if hs_cnt < 3:
                errors.append(['visor3d-hotspots', mid, hs_cnt])

            # Test guided interior tour & popup navigation
            page.locator('#btn-tour').click()
            page.wait_for_timeout(120)
            assert page.locator('#btn-tour').get_attribute('aria-pressed') == 'true'
            assert page.locator('#mv-pop').evaluate('(n) => n.classList.contains("obert")')
            tit1 = page.locator('#mv-pop-tit').inner_text()
            page.locator('#mv-pop-next').click()
            page.wait_for_timeout(120)
            tit2 = page.locator('#mv-pop-tit').inner_text()
            if tit1 == tit2:
                errors.append(['visor3d-tour-next', mid, tit1])

            if inspect_dir and mid in ('rocket', 'western') and width in (1366, 390):
                page.screenshot(path=str(inspect_dir / f'visor-{mid}-{width}-tour.png'))

            page.locator('#mv-pop-reset').click()
            page.wait_for_timeout(120)

            # Test progress bar scrub
            page.locator('#mv-seek').evaluate('(n) => { n.value = 350; n.dispatchEvent(new Event("input")); }')
            page.wait_for_timeout(80)
            pct = page.locator('#mv-pct').inner_text().strip()
            if pct != '35%':
                errors.append(['visor3d-seek', mid, pct])

            if inspect_dir and mid in ('rocket', 'western') and width in (1366, 390):
                page.screenshot(path=str(inspect_dir / f'visor-{mid}-{width}.png'))

        if width == 1366:
            page.goto(f'{base_url}/vapor.html#rotativa', wait_until='domcontentloaded')
            page.wait_for_timeout(150)
            btn3d = page.locator('#b-3d')
            if btn3d.count() and btn3d.is_visible():
                btn3d.click()
                page.wait_for_timeout(200)
                assert page.locator('#modal-3d').evaluate('(n) => n.classList.contains("obert")')
                if inspect_dir:
                    page.screenshot(path=str(inspect_dir / 'modal-3d-vapor-1366.png'))
                page.locator('#modal-3d-tanca').click()
                page.wait_for_timeout(120)
                assert not page.locator('#modal-3d').evaluate('(n) => n.classList.contains("obert")')
        page.close()
    return tested_3d


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--inspect-dir', default='', help='Carpeta temporal opcional per a captures d’inspecció 3D i Plan B')
    args = ap.parse_args()
    inspect_dir = Path(args.inspect_dir) if args.inspect_dir else None
    if inspect_dir:
        inspect_dir.mkdir(parents=True, exist_ok=True)

    srv, base_url = start_server()
    errors = []
    count = 0
    tested_3d = 0
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                channel='chrome',
                headless=True,
                args=['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
            )
            for width, height, dpr in VIEWPORTS:
                page = browser.new_page(viewport={'width': width, 'height': height}, device_scale_factor=dpr)
                page.on('pageerror', lambda e: errors.append(str(e)))
                for cap in CAPS:
                    page.goto((ROOT / f'{cap}.html').as_uri())
                    total = page.locator('#escenes [data-esc]:not([data-esc="repte"])').count()
                    for i in range(total):
                        page.evaluate('i=>RI.ves(i,.15)', i)
                        page.wait_for_timeout(60)
                        count += 1
                        assert page.locator('#comp,[data-recons],[data-vista-btn]').count() == 0
                        bounds = page.evaluate("""()=>({overflow:document.documentElement.scrollWidth>innerWidth+2,
                          desktop:document.documentElement.classList.contains('escriptori'),
                          nav:document.querySelector('.p-nav').getBoundingClientRect().bottom,
                          footer:document.querySelector('.felip-app-footer').getBoundingClientRect().top})""")
                        if bounds['overflow'] or (bounds['desktop'] and bounds['nav'] > bounds['footer'] + 2):
                            errors.append([cap, i, width, bounds])
                        mounted = page.locator('[data-capa="_real"]')
                        if mounted.count():
                            assert mounted.get_attribute('aria-pressed') == 'true'
                            assert page.locator('#b-play').is_disabled()
                            page.wait_for_function("document.querySelector('#lamina-real img').naturalWidth>0")
                            keys = page.locator('#lamina-real .lamina-clau button')
                            if keys.count():
                                keys.first.click()
                                assert page.locator('.fitxa').is_visible()
                                page.locator('.fitxa-tanca').first.click()
                            page.locator('[data-capa="_exp"]').click()
                            assert page.locator('[data-capa="_exp"]').get_attribute('aria-pressed') == 'true'
                            assert mounted.get_attribute('aria-pressed') == 'false'
                            page.wait_for_function("document.querySelector('#lamina-exp img').naturalWidth>0")
                            assert page.locator('#b-play').is_disabled()
                            assert page.locator('#lamina-exp .plate-mark').count() >= 3
                            page.locator('[data-zoom]').click()
                            assert page.locator('#lamina-exp .lamina-zoom').evaluate('(n)=>n.classList.contains("zoom")')
                            page.locator('[data-zoom]').click()
                            page.locator('[data-capa="_mov"]').click()
                            assert not page.locator('#b-play').is_disabled()
                        labels = page.locator('[data-capa="_etq"]')
                        if labels.count():
                            for _ in range(3):
                                labels.click()
                            assert labels.inner_text().endswith('del pas')
                        for moment in ([0, 200, 400, 600, 800, 999] if cap == 'textil' else [400]):
                            page.locator('#lliscador').evaluate('(n,v)=>{n.value=v;n.dispatchEvent(new Event("input"));}', moment)
                            page.wait_for_timeout(45)
                            bad = page.locator('#tela > svg').evaluate('(n)=>/NaN|Infinity/.test(n.innerHTML)')
                            if bad:
                                errors.append([cap, i, width, 'invalid geometry'])
                            if cap == 'textil':
                                expected = page.evaluate('([id,p])=>RI.TEXTIL_ESTATS[id](p).action', [['roda', 'llancadora', 'jenny', 'water', 'mula', 'cartwright'][i], moment / 1000])
                                page.wait_for_function('(expected)=>document.querySelector("#tx-action")?.textContent===expected', arg=expected, timeout=2500)
                                assert page.locator('#tx-action').inner_text() == expected
                                assert page.locator('.tx-compara').is_visible()
                                assert page.locator('#tx-product').inner_text()
                                assert page.locator('#tela > svg').count() == 1
                                assert page.locator('#tela > svg [data-part]').count() >= 4
                    if cap == 'textil':
                        assert total == 6
                        if bounds['desktop']:
                            assert page.locator('[data-esc="repte"]').evaluate('(n)=>n.getBoundingClientRect().right<=innerWidth+1')
                        assert page.locator('#escenes [aria-selected="true"]').evaluate('(n)=>{const a=n.getBoundingClientRect(),b=n.parentElement.getBoundingClientRect();return a.left>=b.left-1&&a.right<=b.right+1;}')
                    page.locator('[data-esc="repte"]').click()
                    assert page.locator('.q').count() > 0
                footer = page.locator('.felip-app-footer')
                assert footer.get_by_role('link', name='AGPLv3', exact=True).get_attribute('href').endswith('/RevolucioIndustrial/LICENSE')
                assert footer.get_by_role('link', name='CC BY-NC-SA 4.0', exact=True).get_attribute('href') == 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ca'
                if width in (1920, 1366, 390):
                    page.goto((ROOT / 'textil.html').as_uri() + '#llancadora')
                    page.locator('[data-capa="_exp"]').click()
                    page.wait_for_function("document.querySelector('#lamina-exp img').naturalWidth>0")
                    page.wait_for_timeout(200)
                    page.screenshot(path=str(ROOT / 'captures' / f'teler-explotat-{width}.png'), full_page=width == 390)
                    page.locator('[data-capa="_mov"]').click()
                    page.locator('#lliscador').evaluate('(n)=>{n.value=250;n.dispatchEvent(new Event("input"));}')
                    page.wait_for_timeout(260)
                    page.screenshot(path=str(ROOT / 'captures' / f'teler-moviment-{width}.png'), full_page=width == 390)
                page.close()

            tested_3d = check_visor_3d(browser, base_url, errors, inspect_dir)
            if inspect_dir:
                p2 = browser.new_page(viewport={'width': 1366, 'height': 768})
                for tid in ('mula', 'water'):
                    p2.goto(f'{base_url}/textil.html#{tid}')
                    p2.locator('[data-capa="_mov"]').click()
                    p2.locator('#lliscador').evaluate('(n)=>{n.value=450;n.dispatchEvent(new Event("input"));}')
                    p2.wait_for_timeout(350)
                    p2.screenshot(path=str(inspect_dir / f'textil-mov-{tid}-1366.png'))
                p2.close()

            browser.close()
    finally:
        srv.shutdown()

    print(json.dumps({'scene_viewports': count, 'visor3d_checks': tested_3d, 'errors': errors}))
    if errors:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
