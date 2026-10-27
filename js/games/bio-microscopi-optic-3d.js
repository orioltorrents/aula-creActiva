/* Parts del microscopi optic: visor Three.js i identificacio per clic. */
(function () {
    const DATA_URL = 'assets/models/microscopi-optic/Anatomia_Microscopi.json';
    const MODEL_URL = 'assets/models/microscopi-optic/microscopi-optic-complet.glb';
    let data = null;
    let mode = 'explore';
    let questions = [];
    let questionIndex = 0;
    let score = 0;
    let answered = false;
    let scene = null;
    let camera = null;
    let renderer = null;
    let controls = null;
    let modelRoot = null;
    let raycaster = null;
    let pointer = null;
    let frameId = null;
    let highlighted = [];
    let pointerStart = null;
    let canvas = null;

    function get(id) { return document.getElementById(id); }

    function resetBioMicroscopiOptic3DGame() {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = null;
        window.removeEventListener('resize', resize);
        if (canvas) {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointercancel', handlePointerCancel);
        }
        pointerStart = null;
        clearHighlight();
        if (modelRoot) {
            const disposedGeometries = new Set();
            const disposedMaterials = new Set();
            modelRoot.traverse(node => {
                if (node.geometry && !disposedGeometries.has(node.geometry)) {
                    node.geometry.dispose();
                    disposedGeometries.add(node.geometry);
                }
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach(material => {
                    if (material && !disposedMaterials.has(material)) {
                        material.dispose();
                        disposedMaterials.add(material);
                    }
                });
            });
        }
        if (controls) controls.dispose();
        if (renderer) renderer.dispose();
        scene = camera = renderer = controls = modelRoot = null;
        raycaster = pointer = canvas = null;
        highlighted = [];
        mode = 'explore';
        questionIndex = 0;
        score = 0;
        answered = false;
        get('bio-microscopi-optic-3d-start')?.classList.remove('hidden');
        get('bio-microscopi-optic-3d-game')?.classList.add('hidden');
        get('bio-microscopi-optic-3d-results')?.classList.add('hidden');
    }

    async function startBioMicroscopiOptic3D(selectedMode) {
        mode = selectedMode || 'explore';
        get('bio-microscopi-optic-3d-start')?.classList.add('hidden');
        get('bio-microscopi-optic-3d-results')?.classList.add('hidden');
        get('bio-microscopi-optic-3d-game')?.classList.remove('hidden');
        get('bio-microscopi-optic-3d-loader')?.classList.remove('hidden');
        try {
            if (!data) {
                const response = await fetch(DATA_URL);
                if (!response.ok) throw new Error('No s\'ha pogut carregar la configuracio del microscopi.');
                data = await response.json();
            }
            questions = mode === 'practice' ? shuffle(data.questions || []) : [];
            questionIndex = 0;
            score = 0;
            answered = false;
            setupViewport();
            if (!modelRoot) await loadModel();
            updateQuestion();
        } catch (error) {
            console.error('Error inicialitzant el microscopi 3D:', error);
            get('bio-microscopi-optic-3d-loader')?.classList.add('hidden');
            const prompt = get('bio-microscopi-optic-3d-prompt');
            if (prompt) prompt.textContent = 'No s’ha pogut carregar el model 3D. Torna-ho a provar.';
        }
    }

    function setupViewport() {
        const container = get('bio-microscopi-optic-3d-viewport');
        canvas = get('bio-microscopi-optic-3d-canvas');
        if (!container || !canvas || typeof THREE === 'undefined') throw new Error('Three.js no disponible.');
        if (renderer) { resize(); return; }
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 480;
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x475569);
        camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 1000);
        camera.position.set(0.9, 0.6, 1.35);
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        scene.add(new THREE.HemisphereLight(0xffffff, 0x64748b, 2));
        const light = new THREE.DirectionalLight(0xffffff, 2.2);
        light.position.set(3, 5, 4);
        scene.add(light);
        controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.target.set(0, 0.35, 0);
        raycaster = new THREE.Raycaster();
        pointer = new THREE.Vector2();
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointercancel', handlePointerCancel);
        window.addEventListener('resize', resize);
        animate();
    }

    function loadModel() {
        return new Promise((resolve, reject) => {
            const Loader = THREE.GLTFLoader;
            if (!Loader) return reject(new Error('GLTFLoader no disponible.'));
            new Loader().load(MODEL_URL, gltf => {
                modelRoot = gltf.scene;
                applyPartMetadata(modelRoot);
                scene.add(modelRoot);
                frameModel(modelRoot);
                get('bio-microscopi-optic-3d-loader')?.classList.add('hidden');
                resolve();
            }, undefined, reject);
        });
    }

    function applyPartMetadata(root) {
        (data.parts || []).forEach(part => {
            root.traverse(node => {
                const name = node.name || '';
                if (part.meshes.some(mesh => name === mesh || name.startsWith(`${mesh}_`))) {
                    node.userData.microscopePart = part;
                }
            });
        });
    }

    function frameModel(root) {
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        root.position.sub(center);
        camera.position.set(maxSize * 1.3, maxSize * 0.75, maxSize * 1.8);
        camera.near = maxSize / 100;
        camera.far = maxSize * 100;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.update();
    }

    function handlePointerDown(event) {
        if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) {
            pointerStart = null;
            return;
        }
        pointerStart = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            maxDistance: 0
        };
    }

    function handlePointerMove(event) {
        if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;
        pointerStart.maxDistance = Math.max(
            pointerStart.maxDistance,
            Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
        );
    }

    function handlePointerCancel(event) {
        if (pointerStart?.pointerId === event.pointerId) pointerStart = null;
    }

    function handlePointerUp(event) {
        const start = pointerStart;
        pointerStart = null;
        if (!start || !event.isPrimary || start.pointerId !== event.pointerId
            || start.maxDistance > 8 || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;
        if (!canvas || !modelRoot) return;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        camera.updateMatrixWorld();
        modelRoot.updateMatrixWorld(true);
        raycaster.setFromCamera(pointer, camera);
        const intersections = raycaster.intersectObject(modelRoot, true);
        for (const hit of intersections) {
            let node = hit.object;
            while (node && node !== modelRoot && !node.userData.microscopePart) node = node.parent;
            if (node?.userData?.microscopePart) {
                selectPart(node.userData.microscopePart);
                return;
            }
        }
    }

    function selectPart(part) {
        if (mode === 'practice' && answered) return;
        clearHighlight();
        highlightPart(part.anatomy_id);
        if (mode === 'explore') {
            const selected = get('bio-microscopi-optic-3d-selected');
            if (selected) selected.textContent = `${part.label_ca}: explora aquesta peça girant el model.`;
            return;
        }
        if (answered) return;
        const question = questions[questionIndex];
        const correct = question && part.anatomy_id === question.target_anatomy_id;
        const feedback = get('bio-microscopi-optic-3d-feedback');
        feedback?.classList.remove('hidden');
        if (correct) {
            score++;
            answered = true;
            feedback.textContent = 'Correcte!';
            feedback.className = 'game-panel__feedback text-center mt-2 p-2 rounded feedback-panel--success';
            get('bio-microscopi-optic-3d-next')?.classList.remove('hidden');
        } else {
            feedback.textContent = 'Aquesta és una altra part. Torna-ho a provar.';
            feedback.className = 'game-panel__feedback text-center mt-2 p-2 rounded feedback-panel--error';
        }
        get('bio-microscopi-optic-3d-score').textContent = score;
    }

    function updateQuestion() {
        const prompt = get('bio-microscopi-optic-3d-prompt');
        const round = get('bio-microscopi-optic-3d-round');
        const feedback = get('bio-microscopi-optic-3d-feedback');
        const next = get('bio-microscopi-optic-3d-next');
        answered = false;
        clearHighlight();
        if (mode === 'explore') {
            prompt.textContent = 'Clica una part del microscopi per veure’n el nom.';
            round.textContent = '0 / 0';
            get('bio-microscopi-optic-3d-mode').textContent = 'Exploració lliure';
        } else if (questions[questionIndex]) {
            prompt.textContent = questions[questionIndex].prompt;
            round.textContent = `${questionIndex + 1} / ${questions.length}`;
            get('bio-microscopi-optic-3d-mode').textContent = 'Pràctica d’identificació';
        } else {
            finishPractice();
        }
        feedback?.classList.add('hidden');
        next?.classList.add('hidden');
        get('bio-microscopi-optic-3d-score').textContent = score;
    }

    function nextBioMicroscopiOptic3DQuestion() { questionIndex++; updateQuestion(); }

    function finishPractice() {
        get('bio-microscopi-optic-3d-game')?.classList.add('hidden');
        get('bio-microscopi-optic-3d-results')?.classList.remove('hidden');
        const total = questions.length;
        const percentage = total ? Math.round(score / total * 100) : 0;
        get('bio-microscopi-optic-3d-final-score').textContent = `${score} / ${total}`;
        get('bio-microscopi-optic-3d-message').textContent = percentage === 100 ? 'Excel·lent! Coneixes molt bé el microscopi.' : `Has aconseguit un ${percentage}%. Continua practicant!`;
        if (typeof saveResult === 'function') {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            saveResult({ email: user.email || 'anonim@escola.cat', curs: user.curs || '1r ESO', grup: user.grup || user.curs || '1r ESO', projecte: 'Biologia', app: 'microscopi-optic-3d', nivell: 'estàndard', puntuacio: percentage, temps_segons: 0, feedback_pos: `Punts: ${score}/${total}`, feedback_neg: '' });
        }
    }

    function highlightPart(anatomyId) {
        if (!modelRoot) return;
        modelRoot.traverse(node => {
            if (!node.isMesh || !node.parent || !node.material) return;
            let current = node;
            while (current && current !== modelRoot && !current.userData.microscopePart) current = current.parent;
            if (current?.userData?.microscopePart?.anatomy_id === anatomyId) {
                const originalMaterial = node.material;
                const clonedMaterials = Array.isArray(originalMaterial)
                    ? originalMaterial.map(material => material.clone())
                    : originalMaterial.clone();
                const materials = Array.isArray(clonedMaterials) ? clonedMaterials : [clonedMaterials];
                materials.forEach(material => {
                    material.emissive?.setHex(0x38bdf8);
                    material.emissiveIntensity = 0.8;
                });
                node.material = clonedMaterials;
                highlighted.push({ node, originalMaterial });
            }
        });
    }

    function clearHighlight() {
        highlighted.forEach(({ node, originalMaterial }) => { node.material = originalMaterial; });
        highlighted = [];
    }

    function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
    function resize() {
        const container = get('bio-microscopi-optic-3d-viewport');
        if (!container || !renderer || !camera) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
    function animate() { frameId = requestAnimationFrame(animate); controls?.update(); renderer?.render(scene, camera); }

    window.startBioMicroscopiOptic3D = startBioMicroscopiOptic3D;
    window.nextBioMicroscopiOptic3DQuestion = nextBioMicroscopiOptic3DQuestion;
    window.resetBioMicroscopiOptic3DGame = resetBioMicroscopiOptic3DGame;
})();
