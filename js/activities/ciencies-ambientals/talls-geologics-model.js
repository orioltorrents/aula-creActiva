/* Model didàctic en metres. Cap dependència del DOM; seed + nivell + versió
 * determinen terreny, contactes i solució. Y creix cap al sud. */
const GeologicalModel = (() => {
    const version = '1.0';
    const width = 400;
    const height = 280;
    const sectionY = 110;
    function randomSource(seed) {
        let h = 2166136261;
        for (const char of String(seed)) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
        return () => {
            h += 0x6D2B79F5;
            let t = Math.imul(h ^ h >>> 15, 1 | h);
            t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    function create(seed, advanced = false) {
        const random = randomSource(seed);
        const template = Math.floor(random() * 3);
        const offset = (random() - 0.5) * 24;
        const breadth = 35 + random() * 8;
        const relief = 40 + random() * 3;
        const contactZ = [105, 110, 115][Math.floor(random() * 3)];
        const slope = advanced ? (random() < 0.5 ? -1 : 1) * (0.035 + random() * 0.025) : 0;
        const rocks = [0, 1, 2, 3];
        for (let i = rocks.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [rocks[i], rocks[j]] = [rocks[j], rocks[i]];
        }
        const channels = y => {
            if (template === 0) {
                const spread = Math.max(0, 90 * (1 - y / 215));
                return spread < 1 ? [200 + offset] : [200 + offset - spread, 200 + offset + spread];
            }
            if (template === 1) return [200 + offset + 12 * Math.sin(y / 95)];
            return [100 + offset + 8 * Math.sin(y / 100), 300 + offset + 8 * Math.sin(y / 100)];
        };
        const distance = (x, y) => Math.min(...channels(y).map(cx => Math.abs(x - cx)));
        const terrain = (x, y) => 87 + (height - y) * 0.022 + relief * (1 - Math.exp(-Math.pow(distance(x, y) / breadth, 2)));
        const contact = x => contactZ + slope * (x - width / 2);
        const depositDepth = (x, y) => Math.max(0, 4 * (1 - Math.pow(distance(x, y) / 13, 2)));
        const rockAt = (x, y) => depositDepth(x, y) > 0 ? 4 : terrain(x, y) > contact(x) ? rocks[0] : rocks[1];
        const model = { version, seed: String(seed), advanced, template, width, height, sectionY,
            rocks, contactZ, slope, channels, distance, terrain, contact, depositDepth, rockAt };
        model.direction = slope === 0 ? 'horizontal' : slope > 0 ? 'west' : 'east';
        model.angle = Math.atan(Math.abs(slope)) * 180 / Math.PI;
        model.sites = [
            { key: 'village', x: channels(190)[0] + 5, y: 190 },
            { key: 'camp', x: channels(65).slice(-1)[0] - 5, y: 65 },
            { key: 'castle', x: template === 1 ? 35 : 200 + offset, y: 35 }
        ];
        model.targets = targets(model);
        model.regions = regions(model);
        return model;
    }
    function targets(m) {
        const xs = [0, m.width, ...m.channels(m.sectionY)];
        const fields = [90, 100, 110, 120, 130].map(z => x => m.terrain(x, m.sectionY) - z);
        fields.push(x => m.terrain(x, m.sectionY) - m.contact(x));
        for (const field of fields) {
            for (let x = 1; x <= m.width; x++) {
                const a = field(x - 1), b = field(x);
                if (a * b < 0) xs.push(x - 1 + Math.abs(a) / (Math.abs(a) + Math.abs(b)));
            }
        }
        return xs.sort((a, b) => a - b).filter((x, i, arr) => i === 0 || x - arr[i - 1] > 2)
            .map(x => ({ x, z: m.terrain(x, m.sectionY) }));
    }
    // Polígons per bandes contigües; la base erosiva retalla les dues unitats.
    function regions(m) {
        const result = [];
        for (const layer of ['lower', 'upper', 'alluvium']) {
            let top = [], bottom = [];
            const flush = () => {
                if (top.length > 1) result.push({ id: result.length, layer,
                    rock: layer === 'alluvium' ? 4 : m.rocks[layer === 'upper' ? 0 : 1],
                    points: [...top, ...bottom.reverse()] });
                top = []; bottom = [];
            };
            for (let x = 0; x <= m.width; x += 0.5) {
                const surface = m.terrain(x, m.sectionY);
                const base = surface - m.depositDepth(x, m.sectionY);
                const c = m.contact(x);
                const hi = layer === 'alluvium' ? surface : layer === 'upper' ? base : Math.min(base, c);
                const lo = layer === 'alluvium' ? base : layer === 'upper' ? c : 80;
                if (hi - lo > 0.001) { top.push([x, hi]); bottom.push([x, lo]); }
                else flush();
            }
            flush();
        }
        return result;
    }
    // Marching triangles: sense casos ambigus als colls, interpolació lineal.
    function contours(field, levels, step = 5) {
        const output = levels.map(level => ({ level, segments: [] }));
        for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) {
            const points = [[x, y], [x + step, y], [x + step, y + step], [x, y + step]];
            const values = points.map(p => field(...p));
            for (const ids of [[0, 1, 2], [0, 2, 3]]) for (const row of output) {
                const hits = [];
                for (let i = 0; i < 3; i++) {
                    const a = ids[i], b = ids[(i + 1) % 3];
                    if ((values[a] < row.level) === (values[b] < row.level)) continue;
                    const t = (row.level - values[a]) / (values[b] - values[a]);
                    hits.push(points[a].map((v, j) => v + t * (points[b][j] - v)));
                }
                if (hits.length === 2) row.segments.push(hits);
            }
        }
        return output;
    }
    const correctElevation = (expected, actual) => Number.isFinite(actual) && Math.abs(expected - actual) <= 5 + 1e-9;
    function score(m, answers) {
        const profile = m.targets.filter((t, i) => correctElevation(t.z, answers.profile[i])).length / m.targets.length;
        const contacts = [answers.contactType === 'concordant', answers.direction === m.direction,
            answers.alluvialType === 'discordant', answers.alluvialShape === 'lens'].filter(Boolean).length / 4;
        const lithology = m.regions.filter(r => answers.fills[r.id] === r.rock).length / m.regions.length;
        const expected = m.channels(m.sectionY);
        const used = new Set();
        let correct = 0;
        for (const p of answers.streams) {
            const channels = m.channels(p.y);
            const index = channels.findIndex(x => Math.abs(x - p.x) <= 10);
            // Marcatge de branques: només la banda al voltant d'A–B és avaluable.
            if (Math.abs(p.y - m.sectionY) <= 20 && index >= 0 && !used.has(index)) { used.add(index); correct++; }
        }
        const torrents = correct / Math.max(expected.length, answers.streams.length);
        const riskExpected = ['flood', 'flood', 'valley', 'valley', 'relocate', 'alert'];
        const risk = riskExpected.filter((v, i) => answers.risk[i] === v).length / riskExpected.length;
        const detail = { profile: profile * 3, contacts: contacts * 2.5, lithology: lithology * 2,
            torrents, risk: risk * 1.5 };
        const note = Object.values(detail).reduce((sum, v) => sum + v, 0);
        return { detail, note, pau: note / 4 };
    }
    return { version, create, contours, score, correctElevation };
})();
if (typeof module !== 'undefined') module.exports = GeologicalModel;
