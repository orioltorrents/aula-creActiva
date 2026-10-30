/* Parts del microscopi optic: visor Three.js i identificacio per clic. */
(function () {
    const DATA_URL = 'assets/models/microscopi-optic/Anatomia_Microscopi.json';
    const CONTROLS_DATA_URL = 'assets/models/microscopi-optic/microscopi-controls.json';
    const MODEL_URL = 'assets/models/microscopi-optic/microscopi-optic-complet.glb';
    let data = null;
    let controlsData = null;
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
    let clock = null;
    let mixer = null;
    let animationClips = [];
    let revolverAction = null;
    let revolverAnimating = false;
    let revolverSegment = null;
    let revolverPosition = 0;
    let revolverSelected = false;
    let explodedActions = [];
    let explodedRunning = false;
    let explodedEndTime = 0;
    let highlighted = [];
    let pointerStart = null;
    let canvas = null;
    let focusSupport = null;
    let focusObjectives = [];
    let focusOffsetMm = 0;
    let focusInitialY = 0;
    let focusDrag = null;
    let stageDrag = null;
    let diaphragmDrag = null;
    let carNodes = { x: null, y: null, preparation: null };
    let carInitial = { x: 0, y: 0 };
    let diaphragmPivot = null;
    let diaphragmInitialRotation = 0;
    let diaphragmOpening = 0;
    let lightSwitch = null;
    let lightSwitchInitialRotation = null;
    let beam = null;
    let beamMaterials = [];
    let indicator = null;
    let microscopeLight = null;
    let lightLevel = 0;
    let lightTarget = 0;
    let interactiveNames = new Set();

    function get(id) { return document.getElementById(id); }

    function resetBioMicroscopiOptic3DGame() {
        if (frameId) cancelAnimationFrame(frameId);
        frameId = null;
        mixer = null;
        animationClips = [];
        revolverAction = null;
        revolverAnimating = false;
        revolverSegment = null;
        revolverPosition = 0;
        revolverSelected = false;
        explodedActions = [];
        explodedRunning = false;
        window.removeEventListener('resize', resize);
        if (canvas) {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointercancel', handlePointerCancel);
        }
        if (controls) controls.enabled = true;
        focusDrag = null;
        stageDrag = null;
        diaphragmDrag = null;
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
        focusSupport = null;
        focusObjectives = [];
        carNodes = { x: null, y: null, preparation: null };
        diaphragmPivot = null;
        lightSwitch = beam = indicator = microscopeLight = null;
        beamMaterials = [];
        lightLevel = lightTarget = 0;
        interactiveNames = new Set();
        focusOffsetMm = 0;
        focusInitialY = 0;
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
            if (!controlsData) {
                const response = await fetch(CONTROLS_DATA_URL);
                if (!response.ok) throw new Error('No s\'ha pogut carregar la configuracio dels controls.');
                controlsData = await response.json();
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
        clock = new THREE.Clock();
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
                animationClips = gltf.animations || [];
                mixer = new THREE.AnimationMixer(gltf.scene);
                applyPartMetadata(modelRoot);
                setupMicroscopeControls(modelRoot);
                setupAnimations(animationClips);
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

    function setupMicroscopeControls(root) {
        focusSupport = findNode(root, 'MIC_Suport_Enfocament');
        carNodes.x = findNode(root, 'MIC_Carro_X');
        carNodes.y = findNode(root, 'MIC_Carro_Y');
        carNodes.preparation = findNode(root, 'MIC_Preparacio');
        diaphragmPivot = findNode(root, 'MIC_Diafragma_Palanca_Pivot');
        lightSwitch = findNode(root, 'MIC_Interruptor_Cos');
        beam = findNode(root, 'MIC_Feix_Llum_Visible');
        indicator = findNode(root, 'MIC_Indicador_Llum');
        if (lightSwitch) lightSwitchInitialRotation = lightSwitch.rotation.clone();
        if (diaphragmPivot) diaphragmInitialRotation = diaphragmPivot.rotation.z;
        if (carNodes.x) carInitial.x = carNodes.x.position.x;
        if (carNodes.y) carInitial.y = carNodes.y.position.z;
        if (beam) {
            beamMaterials = (Array.isArray(beam.material) ? beam.material : [beam.material]).filter(Boolean).map(material => {
                const clone = material.clone();
                clone.transparent = true;
                beam.material = Array.isArray(beam.material)
                    ? beam.material.map(item => item === material ? clone : item)
                    : clone;
                return clone;
            });
        }
        const lightSource = findNode(root, 'MIC_Font_Llum') || findNode(root, 'MIC_Llum_Preparacio');
        if (!lightSource) console.error("Microscopi: no s'ha trobat la font de llum MIC_Font_Llum ni MIC_Llum_Preparacio");
        if (lightSource && scene) {
            microscopeLight = new THREE.SpotLight(0xffe9b0, 0, 3, 0.45, 0.35, 1);
            lightSource.getWorldPosition(microscopeLight.position);
            microscopeLight.target.position.set(0, -1, 0);
            scene.add(microscopeLight, microscopeLight.target);
        }
        [
            'MIC_Revolver', 'MIC_Enfocament_Macro_Dret', 'MIC_Enfocament_Macro_Esquerre',
            'MIC_Enfocament_Micro_Dret', 'MIC_Enfocament_Micro_Esquerre', 'MIC_Suport_Enfocament',
            'MIC_Carro_X', 'MIC_Carro_Y', 'MIC_Interruptor', 'MIC_Diafragma',
            'MIC_Diafragma_Palanca_Pivot'
        ].forEach(name => { if (findNode(root, name)) interactiveNames.add(name); else console.error(`Microscopi: no s'ha trobat el node ${name}`); });
        focusObjectives = [];
        root.traverse(node => {
            if (node.isMesh && node.name.startsWith('MIC_Objectiu_')) focusObjectives.push(node);
        });
        if (focusSupport) {
            focusInitialY = focusSupport.position.y;
            focusOffsetMm = 0;
        }
        if (!diaphragmPivot) console.error("Microscopi: no s'ha trobat el node MIC_Diafragma_Palanca_Pivot");
        if (!beam) console.error("Microscopi: no s'ha trobat el node MIC_Feix_Llum_Visible");
        if (!indicator) console.error("Microscopi: no s'ha trobat el node MIC_Indicador_Llum");
        if (!lightSwitch) console.error("Microscopi: no s'ha trobat el node MIC_Interruptor_Cos");
        if (!carNodes.preparation) console.error("Microscopi: no s'ha trobat el node MIC_Preparacio");
        setDiaphragmOpening(0);
        updateMicroscopeLight(0);
    }

    function setupAnimations(clips) {
        const revolverClip = clips.find(clip => clip.name === 'MIC_Revolver_Canvi_Objectius_Local');
        if (!revolverClip) console.error('Microscopi: no s\'ha trobat l\'animació MIC_Revolver_Canvi_Objectius_Local');
        else revolverAction = mixer.clipAction(revolverClip);
        explodedActions = clips.filter(clip => clip.name.startsWith('MIC_Exploded')).map(clip => {
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            return action;
        });
        if (!explodedActions.length) console.error('Microscopi: no s\'han trobat animacions MIC_Exploded');
    }

    function findNode(root, name) {
        let result = null;
        root?.traverse(node => {
            if (!result && node.name === name) result = node;
        });
        return result;
    }

    function findNamedAncestor(node, names) {
        const expected = new Set(names);
        let current = node;
        while (current && current !== modelRoot) {
            if (expected.has(current.name)) return current;
            current = current.parent;
        }
        return null;
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
        if (explodedRunning) return;
        const interaction = resolveInteraction(event);
        if (interaction?.name === 'MIC_Revolver') {
            if (revolverSelected) {
                advanceRevolver();
            } else {
                const part = findPartForObject(interaction.object);
                if (part) selectPart(part);
                else selectFirstPart(event);
                revolverSelected = true;
            }
            pointerStart = null;
            return;
        }
        const focusControl = interaction && getFocusControl(interaction.name);
        if (focusControl) {
            focusDrag = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                lastY: event.clientY,
                maxDistance: 0,
                control: focusControl
            };
            controls.enabled = false;
            canvas.setPointerCapture?.(event.pointerId);
            event.preventDefault();
            return;
        }
        if (interaction?.name === 'MIC_Carro_X' || interaction?.name === 'MIC_Carro_Y') {
            stageDrag = { pointerId: event.pointerId, name: interaction.name, startX: event.clientX, startY: event.clientY, initialX: carNodes.x?.position.x ?? 0, initialY: carNodes.y?.position.z ?? 0 };
            controls.enabled = false;
            canvas.setPointerCapture?.(event.pointerId);
            event.preventDefault();
            return;
        }
        if (interaction?.name === 'MIC_Diafragma' || interaction?.name === 'MIC_Diafragma_Palanca_Pivot') {
            diaphragmDrag = { pointerId: event.pointerId, startY: event.clientY, initial: diaphragmOpening, maxDistance: 0 };
            controls.enabled = false;
            canvas.setPointerCapture?.(event.pointerId);
            event.preventDefault();
            return;
        }
        if (interaction?.name === 'MIC_Interruptor') {
            toggleMicroscopeLight();
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
        if (stageDrag?.pointerId === event.pointerId) {
            const delta = stageDrag.name === 'MIC_Carro_X'
                ? (event.clientX - stageDrag.startX) * 0.0015
                : -(event.clientY - stageDrag.startY) * 0.0015;
            if (stageDrag.name === 'MIC_Carro_X' && carNodes.x) carNodes.x.position.x = stageDrag.initialX + delta;
            if (stageDrag.name === 'MIC_Carro_Y' && carNodes.y) carNodes.y.position.z = stageDrag.initialY + delta;
            event.preventDefault();
            return;
        }
        if (diaphragmDrag?.pointerId === event.pointerId) {
            const delta = (diaphragmDrag.startY - event.clientY) * 0.004;
            diaphragmDrag.maxDistance = Math.max(diaphragmDrag.maxDistance, Math.abs(delta));
            setDiaphragmOpening(diaphragmDrag.initial + delta);
            event.preventDefault();
            return;
        }
        if (focusDrag?.pointerId === event.pointerId) {
            const deltaY = event.clientY - focusDrag.lastY;
            focusDrag.lastY = event.clientY;
            focusDrag.maxDistance = Math.max(
                focusDrag.maxDistance,
                Math.hypot(event.clientX - focusDrag.startX, event.clientY - focusDrag.startY)
            );
            applyFocusRadians(-deltaY * 0.02, focusDrag.control);
            event.preventDefault();
            return;
        }
        if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;
        pointerStart.maxDistance = Math.max(
            pointerStart.maxDistance,
            Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
        );
    }

    function handlePointerCancel(event) {
        if (focusDrag?.pointerId === event.pointerId) finishFocusDrag(event);
        if (stageDrag?.pointerId === event.pointerId || diaphragmDrag?.pointerId === event.pointerId) finishControlDrag(event);
        if (pointerStart?.pointerId === event.pointerId) pointerStart = null;
    }

    function handlePointerUp(event) {
        if (stageDrag?.pointerId === event.pointerId || diaphragmDrag?.pointerId === event.pointerId) {
            finishControlDrag(event);
            return;
        }
        if (focusDrag?.pointerId === event.pointerId) {
            const wasClick = focusDrag.maxDistance <= 8;
            finishFocusDrag(event);
            if (wasClick) selectFirstPart(event);
            return;
        }
        const start = pointerStart;
        pointerStart = null;
        if (!start || !event.isPrimary || start.pointerId !== event.pointerId
            || start.maxDistance > 8 || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;
        if (!canvas || !modelRoot) return;
        selectFirstPart(event);
    }

    function selectFirstPart(event) {
        const intersections = raycastAt(event);
        for (const hit of intersections) {
            const node = resolveInteractionNode(hit.object);
            if (node?.object?.userData?.microscopePart) {
                selectPart(node.object.userData.microscopePart);
                return;
            }
            let partNode = hit.object;
            while (partNode && partNode !== modelRoot && !partNode.userData?.microscopePart) partNode = partNode.parent;
            if (partNode?.userData?.microscopePart) {
                selectPart(partNode.userData.microscopePart);
                return;
            }
        }
    }

    function findPartForObject(object) {
        let node = object;
        while (node && node !== modelRoot) {
            if (node.userData?.microscopePart) return node.userData.microscopePart;
            node = node.parent;
        }
        return null;
    }

    function raycastAt(event) {
        if (!canvas || !modelRoot) return [];
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return [];
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        camera.updateMatrixWorld();
        modelRoot.updateMatrixWorld(true);
        raycaster.setFromCamera(pointer, camera);
        return raycaster.intersectObject(modelRoot, true);
    }

    function pickFocusControl(event) {
        const names = [
            'MIC_Enfocament_Macro_Dret',
            'MIC_Enfocament_Macro_Esquerre',
            'MIC_Enfocament_Micro_Dret',
            'MIC_Enfocament_Micro_Esquerre'
        ];
        for (const hit of raycastAt(event)) {
            const node = resolveInteractionNode(hit.object);
            if (node && names.includes(node.name)) return node.name.includes('Macro') ? 'macro' : 'micro';
        }
        return null;
    }

    function finishFocusDrag(event) {
        focusDrag = null;
        controls.enabled = true;
        canvas.releasePointerCapture?.(event.pointerId);
    }

    function finishControlDrag(event) {
        stageDrag = null;
        diaphragmDrag = null;
        controls.enabled = true;
        canvas.releasePointerCapture?.(event.pointerId);
    }

    function getFocusControl(name) {
        return name?.includes('Macro') ? 'macro' : name?.includes('Micro') ? 'micro' : null;
    }

    function resolveInteraction(event) {
        for (const hit of raycastAt(event)) {
            const node = resolveInteractionNode(hit.object);
            if (node) return node;
        }
        return null;
    }

    function resolveInteractionNode(object) {
        let node = object;
        while (node && node !== modelRoot) {
            const target = node.userData?.selection_target || node.userData?.click_action;
            if (interactiveNames.has(node.name) || target || node.userData?.is_interactive_candidate) {
                const name = target || node.name;
                return { object: node, name: name === 'MIC_Interruptor' ? 'MIC_Interruptor' : name };
            }
            node = node.parent;
        }
        return null;
    }

    function applyFocusRadians(radians, control) {
        if (!focusSupport) return;
        const rate = control === 'macro'
            ? 2.5
            : 0.15;
        const limits = [-20, 22.745];
        const requested = Math.max(limits[0], Math.min(limits[1], focusOffsetMm + radians * rate));
        if (requested === focusOffsetMm) return;
        const previousY = focusSupport.position.y;
        const previousOffset = focusOffsetMm;
        focusOffsetMm = requested;
        focusSupport.position.y = focusInitialY + focusOffsetMm * 0.001;
        focusSupport.updateMatrixWorld(true);
        modelRoot.updateMatrixWorld(true);
        if (!isFocusPositionSafe()) {
            focusSupport.position.y = previousY;
            focusOffsetMm = previousOffset;
        }
    }

    function isFocusPositionSafe() {
        if (!focusSupport || !focusObjectives.length) return true;
        const supportBox = new THREE.Box3().setFromObject(focusSupport);
        const objectiveBox = new THREE.Box3();
        focusObjectives.forEach(node => objectiveBox.expandByObject(node));
        return objectiveBox.isEmpty() || !supportBox.intersectsBox(objectiveBox);
    }

    function setDiaphragmOpening(value) {
        diaphragmOpening = Math.max(0, Math.min(1, value));
        if (diaphragmPivot) {
            const degrees = -17.6 + (22 - (-17.6)) * diaphragmOpening;
            diaphragmPivot.rotation.z = diaphragmInitialRotation + THREE.MathUtils.degToRad(degrees);
        }
        if (microscopeLight) microscopeLight.angle = 0.35 + 0.8 * diaphragmOpening;
        if (beam) {
            const scale = 0.55 + diaphragmOpening * 0.9;
            beam.scale.x = scale;
            beam.scale.z = scale;
        }
    }

    function toggleMicroscopeLight() {
        lightTarget = lightTarget > 0.5 ? 0 : 1;
        if (lightSwitch && lightSwitchInitialRotation) {
            lightSwitch.rotation.x = lightSwitchInitialRotation.x + (lightTarget ? -0.35 : 0.35);
        }
        if (indicator?.material) {
            const materials = Array.isArray(indicator.material) ? indicator.material : [indicator.material];
            materials.forEach(material => material.emissive?.setHex(lightTarget ? 0xffd166 : 0x222222));
        }
    }

    function updateMicroscopeLight(delta) {
        lightLevel += (lightTarget - lightLevel) * Math.min(1, delta * 5);
        if (microscopeLight) microscopeLight.intensity = 2.2 * lightLevel;
        beamMaterials.forEach(material => { material.opacity = lightLevel * 0.55; });
        if (beam) beam.visible = lightLevel > 0.01;
    }

    function advanceRevolver() {
        if (!revolverAction || revolverAnimating || explodedRunning) return;
        const frames = [1, 37, 73, 109, 145];
        const start = frames[revolverPosition] / 24;
        const end = frames[revolverPosition + 1] / 24;
        revolverAction.enabled = true;
        revolverAction.paused = false;
        revolverAction.setLoop(THREE.LoopOnce, 1);
        revolverAction.clampWhenFinished = true;
        revolverAction.time = start;
        revolverAction.play();
        revolverSegment = { start, end };
        revolverAnimating = true;
        revolverPosition = (revolverPosition + 1) % 4;
    }

    function playExplodedView() {
        if (!explodedActions.length || explodedRunning) return;
        if (revolverAction) revolverAction.paused = true;
        explodedActions.forEach(action => {
            action.stop().reset();
            action.time = 180 / 24;
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            action.play();
        });
        explodedRunning = true;
        explodedEndTime = performance.now() + (400 - 180) / 24 * 1000;
        updateInteractionLock();
    }

    function updateInteractionLock() {
        get('bio-microscopi-optic-3d-exploded')?.toggleAttribute('disabled', explodedRunning);
    }

    function selectPart(part) {
        revolverSelected = part.anatomy_id === 'revolver';
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
    function animate() {
        frameId = requestAnimationFrame(animate);
        const delta = clock?.getDelta() || 0;
        mixer?.update(delta);
        if (revolverAnimating && revolverSegment && revolverAction.time >= revolverSegment.end) {
            revolverAction.time = revolverSegment.end;
            revolverAction.paused = true;
            revolverAnimating = false;
            revolverSegment = null;
        }
        if (explodedRunning && performance.now() >= explodedEndTime) {
            explodedActions.forEach(action => action.stop());
            explodedRunning = false;
            updateInteractionLock();
        }
        updateMicroscopeLight(delta);
        controls?.update();
        renderer?.render(scene, camera);
    }

    window.startBioMicroscopiOptic3D = startBioMicroscopiOptic3D;
    window.nextBioMicroscopiOptic3DQuestion = nextBioMicroscopiOptic3DQuestion;
    window.resetBioMicroscopiOptic3DGame = resetBioMicroscopiOptic3DGame;
    window.playBioMicroscopiOptic3DExploded = playExplodedView;
})();
