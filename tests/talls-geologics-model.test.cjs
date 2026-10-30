const assert = require('node:assert/strict');
const model = require('../js/activities/ciencies-ambientals/talls-geologics-model.js');

const templates = new Set();
for (let seed = 0; seed < 300; seed++) for (const advanced of [false, true]) {
    const m = model.create(`test-${seed}`, advanced);
    const repeat = model.create(`test-${seed}`, advanced);
    templates.add(m.template);
    assert.deepEqual(m.targets, repeat.targets, 'La llavor ha de reproduir els punts');
    assert.deepEqual(m.regions, repeat.regions, 'La llavor ha de reproduir els polígons');
    assert.ok(m.targets.length > 5);
    assert.ok(m.targets.every(p => p.x >= 0 && p.x <= 400 && p.z > 80 && p.z < 140));
    assert.equal(m.direction, m.slope === 0 ? 'horizontal' : m.slope > 0 ? 'west' : 'east');
    assert.deepEqual(new Set(m.regions.map(r => r.rock)), new Set([m.rocks[0], m.rocks[1], 4]));
    for (const region of m.regions) {
        assert.ok(region.points.length >= 4);
        assert.ok(region.points.every(([x, z]) => x >= 0 && x <= 400 && z >= 80 && z <= m.terrain(x, m.sectionY) + 1e-8));
    }
    // La cartografia dels emplaçaments ha de justificar el risc proposat.
    for (const site of m.sites.slice(0, 2)) assert.equal(m.rockAt(site.x, site.y), 4);
    for (let y = 0; y <= 280; y += 20) for (const x of m.channels(y)) {
        assert.ok(m.terrain(x, y) < m.terrain(x + 15, y));
    }
    const perfect = { profile: m.targets.map(p => p.z), streams: m.channels(m.sectionY).map(x => ({ x, y: m.sectionY })),
        contactType: 'concordant', direction: m.direction, alluvialType: 'discordant', alluvialShape: 'lens',
        fills: Object.fromEntries(m.regions.map(r => [r.id, r.rock])), risk: ['flood', 'flood', 'valley', 'valley', 'relocate', 'alert'] };
    assert.equal(model.score(m, perfect).note, 10);
    assert.equal(model.score(m, perfect).pau, 2.5);
    const empty = { profile: [], streams: [], fills: {}, risk: [] };
    assert.equal(model.score(m, empty).note, 0);
    const edge = { ...perfect, profile: m.targets.map(p => p.z + 5) };
    assert.equal(model.score(m, edge).detail.profile, 3);
    edge.profile = m.targets.map(p => p.z + 5.001);
    assert.equal(model.score(m, edge).detail.profile, 0);
    const spam = { ...perfect, streams: [...perfect.streams, ...perfect.streams] };
    assert.equal(model.score(m, spam).detail.torrents, 0.5);
    const misplaced = { ...perfect, streams: perfect.streams.map(p => ({ x: p.x, y: 0 })) };
    assert.equal(model.score(m, misplaced).detail.torrents, 0);
}
assert.equal(templates.size, 3);
// La interpolació de contorns d'un pla ha de coincidir amb la solució analítica.
for (const row of model.contours((x, y) => x + 2 * y, [100, 200])) {
    assert.ok(row.segments.length > 0);
    for (const segment of row.segments) for (const [x, y] of segment) assert.ok(Math.abs(x + 2 * y - row.level) < 1e-8);
}
console.log('OK: 600 escenaris, reproducció, geometria, riscos, puntuació, toleràncies i contorns.');
