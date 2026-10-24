/* ==========================================================================
   ACTIVITAT 3D: ANATOMIA DEL BÈTID
   Visor i quiz d'identificació anatòmica del bètid (Projecte Rius)
   ========================================================================== */

(function () {
    let scene = null;
    let camera = null;
    let renderer = null;
    let controls = null;
    let modelRoot = null;
    let raycaster = null;
    let mouse = null;

    let isInitialized = false;
    let isModelLoaded = false;
    let animationFrameId = null;

    let gameData = null;
    let activeModelKey = 'betid';
    let currentMode = 'explore'; // 'explore' o 'practice'
    let currentQuestionIndex = 0;
    let score = 0;
    let hasAttemptedCurrentQuestion = false;
    let activePracticeQuestions = [];
    let mixer = null;
    const clock = new THREE.Clock();

    const originalMaterialsMap = new Map();
    let highlightedNode = null;

    let pointerDownX = 0;
    let pointerDownY = 0;
    let maxDisplacement = 0;
    let isPointerDown = false;

    const FALLBACK_GAME_DATA = {
        "title": "Identifica les parts de la larva de Baetis",
        "model": "Betid_web.glb",
        "language": "ca",
        "questions": [
            { "id": "cap", "prompt": "Clica: Cap", "target_anatomy_id": "cap" },
            { "id": "ulls", "prompt": "Clica: Ulls compostos", "target_anatomy_id": "ulls" },
            { "id": "peces_bucals", "prompt": "Clica: Peces bucals", "target_anatomy_id": "peces_bucals" },
            { "id": "antenes", "prompt": "Clica: Antenes", "target_anatomy_id": "antenes" },
            { "id": "torax", "prompt": "Clica: Tòrax", "target_anatomy_id": "torax" },
            { "id": "esbossos_alars", "prompt": "Clica: Esbossos alars", "target_anatomy_id": "esbossos_alars" },
            { "id": "potes", "prompt": "Clica: Potes", "target_anatomy_id": "potes" },
            { "id": "abdomen", "prompt": "Clica: Abdomen", "target_anatomy_id": "abdomen" },
            { "id": "branquies", "prompt": "Clica: Brànquies", "target_anatomy_id": "branquies" },
            { "id": "cercs", "prompt": "Clica: Cercs laterals", "target_anatomy_id": "cercs" },
            { "id": "filament_central", "prompt": "Clica: Filament caudal central", "target_anatomy_id": "filament_central" }
        ]
    };

    const FALLBACK_SIMULIUM_DATA = {
        "title": "Identifica les parts de la larva de Simulium",
        "questions": [
            { "id": "torax", "prompt": "Clica: Tòrax", "target_anatomy_id": "torax" },
            { "id": "abdomen", "prompt": "Clica: Abdomen", "target_anatomy_id": "abdomen" },
            { "id": "cap", "prompt": "Clica: Càpsula cefàlica", "target_anatomy_id": "cap" },
            { "id": "taques_oculars", "prompt": "Clica: Taques oculars", "target_anatomy_id": "taques_oculars" },
            { "id": "antenes", "prompt": "Clica: Antenes", "target_anatomy_id": "antenes" },
            { "id": "peces_bucals", "prompt": "Clica: Peces bucals", "target_anatomy_id": "peces_bucals" },
            { "id": "ventalls_filtradors", "prompt": "Clica: Ventalls cefàlics filtradors", "target_anatomy_id": "ventalls_filtradors" },
            { "id": "pseudopodi_toracic", "prompt": "Clica: Pseudopodi toràcic", "target_anatomy_id": "pseudopodi_toracic" },
            { "id": "corona_ganxos", "prompt": "Clica: Corona posterior de ganxos", "target_anatomy_id": "corona_ganxos" },
            { "id": "esclerit_anal", "prompt": "Clica: Esclerit anal", "target_anatomy_id": "esclerit_anal" },
            { "id": "papilles_rectals", "prompt": "Clica: Papil·les rectals", "target_anatomy_id": "papilles_rectals" }
        ]
    };

    const FALLBACK_CULEX_DATA = {
        "title": "Culex",
        "questions": [
            { "id": "q_cap", "prompt": "Assenyala: Càpsula cefàlica", "target_anatomy_id": "cap" },
            { "id": "q_ulls", "prompt": "Assenyala: Taques oculars", "target_anatomy_id": "ulls" },
            { "id": "q_antenes", "prompt": "Assenyala: Antenes", "target_anatomy_id": "antenes" },
            { "id": "q_setes_antenals", "prompt": "Assenyala: Plomalls de les antenes", "target_anatomy_id": "setes_antenals" },
            { "id": "q_raspalls_bucals", "prompt": "Assenyala: Raspalls bucals filtradors", "target_anatomy_id": "raspalls_bucals" },
            { "id": "q_peces_bucals", "prompt": "Assenyala: Peces bucals", "target_anatomy_id": "peces_bucals" },
            { "id": "q_torax", "prompt": "Assenyala: Tòrax", "target_anatomy_id": "torax" },
            { "id": "q_abdomen", "prompt": "Assenyala: Abdomen (segments I-VIII)", "target_anatomy_id": "abdomen" },
            { "id": "q_setes_cos", "prompt": "Assenyala: Setes del cos", "target_anatomy_id": "setes_cos" },
            { "id": "q_sifo", "prompt": "Assenyala: Sifó respiratori", "target_anatomy_id": "sifo" },
            { "id": "q_espiracles", "prompt": "Assenyala: Obertura respiratòria", "target_anatomy_id": "espiracles" },
            { "id": "q_setes_sifo", "prompt": "Assenyala: Plomalls del sifó", "target_anatomy_id": "setes_sifo" },
            { "id": "q_pecten", "prompt": "Assenyala: Pecten del sifó", "target_anatomy_id": "pecten" },
            { "id": "q_pinta", "prompt": "Assenyala: Pinta del segment VIII", "target_anatomy_id": "pinta" },
            { "id": "q_segment_anal", "prompt": "Assenyala: Segment anal (X)", "target_anatomy_id": "segment_anal" },
            { "id": "q_sella", "prompt": "Assenyala: Sella del segment anal", "target_anatomy_id": "sella" },
            { "id": "q_papilles_anals", "prompt": "Assenyala: Papil·les anals", "target_anatomy_id": "papilles_anals" },
            { "id": "q_raspall_ventral", "prompt": "Assenyala: Raspall ventral del segment anal", "target_anatomy_id": "raspall_ventral" },
            { "id": "q_setes_anals", "prompt": "Assenyala: Setes anals dorsals", "target_anatomy_id": "setes_anals" }
        ]
    };

    const FALLBACK_HYDROPSYCHE_DATA = {
        "title": "Hydropsyche",
        "questions": [
            { "id": "q_cap", "prompt": "Assenyala: Càpsula cefàlica", "target_anatomy_id": "cap" },
            { "id": "q_ulls", "prompt": "Assenyala: Taques oculars", "target_anatomy_id": "ulls" },
            { "id": "q_antenes", "prompt": "Assenyala: Antenes curtes", "target_anatomy_id": "antenes" },
            { "id": "q_mandibules", "prompt": "Assenyala: Mandíbules", "target_anatomy_id": "mandibules" },
            { "id": "q_palps", "prompt": "Assenyala: Palps bucals", "target_anatomy_id": "palps" },
            { "id": "q_labre", "prompt": "Assenyala: Labre", "target_anatomy_id": "labre" },
            { "id": "q_torax", "prompt": "Assenyala: Tòrax", "target_anatomy_id": "torax" },
            { "id": "q_pronot", "prompt": "Assenyala: Pronot (placa del protòrax)", "target_anatomy_id": "pronot" },
            { "id": "q_mesonot", "prompt": "Assenyala: Mesonot (placa del mesotòrax)", "target_anatomy_id": "mesonot" },
            { "id": "q_metanot", "prompt": "Assenyala: Metanot (placa del metatòrax)", "target_anatomy_id": "metanot" },
            { "id": "q_potes", "prompt": "Assenyala: Potes toràciques", "target_anatomy_id": "potes" },
            { "id": "q_ungles_potes", "prompt": "Assenyala: Ungles de les potes", "target_anatomy_id": "ungles_potes" },
            { "id": "q_setes", "prompt": "Assenyala: Setes del cos i les potes", "target_anatomy_id": "setes" },
            { "id": "q_abdomen", "prompt": "Assenyala: Abdomen (segments I–IX)", "target_anatomy_id": "abdomen" },
            { "id": "q_branquies", "prompt": "Assenyala: Brànquies abdominals ramificades", "target_anatomy_id": "branquies" },
            { "id": "q_segment_anal", "prompt": "Assenyala: Segment anal", "target_anatomy_id": "segment_anal" },
            { "id": "q_pseudopodis_anals", "prompt": "Assenyala: Pseudopodis anals", "target_anatomy_id": "pseudopodis_anals" },
            { "id": "q_ganxos_anals", "prompt": "Assenyala: Ganxos anals", "target_anatomy_id": "ganxos_anals" },
            { "id": "q_plomalls_anals", "prompt": "Assenyala: Plomalls de setes anals", "target_anatomy_id": "plomalls_anals" }
        ]
    };

    const FALLBACK_ECHINOGAMMARUS_DATA = {
        "title": "Echinogammarus longisetosus",
        "questions": [
            { "id": "q_cap", "prompt": "Assenyala: Cap", "target_anatomy_id": "cap" },
            { "id": "q_ulls", "prompt": "Assenyala: Ulls compostos", "target_anatomy_id": "ulls" },
            { "id": "q_antenes_1", "prompt": "Assenyala: Antènules (primer parell)", "target_anatomy_id": "antenes_1" },
            { "id": "q_antenes_2", "prompt": "Assenyala: Antenes (segon parell)", "target_anatomy_id": "antenes_2" },
            { "id": "q_peces_bucals", "prompt": "Assenyala: Peces bucals", "target_anatomy_id": "peces_bucals" },
            { "id": "q_pereon", "prompt": "Assenyala: Perèon", "target_anatomy_id": "pereon" },
            { "id": "q_pleon", "prompt": "Assenyala: Pleon", "target_anatomy_id": "pleon" },
            { "id": "q_urosoma", "prompt": "Assenyala: Urosoma", "target_anatomy_id": "urosoma" },
            { "id": "q_gnatopodes", "prompt": "Assenyala: Gnatòpodes", "target_anatomy_id": "gnatopodes" },
            { "id": "q_pereiopodes", "prompt": "Assenyala: Pereiòpodes caminadors (P3–P7)", "target_anatomy_id": "pereiopodes" },
            { "id": "q_branquies", "prompt": "Assenyala: Brànquies coxals", "target_anatomy_id": "branquies" },
            { "id": "q_pleopodes", "prompt": "Assenyala: Pleòpodes nedadors", "target_anatomy_id": "pleopodes" },
            { "id": "q_uropodes", "prompt": "Assenyala: Uropodes", "target_anatomy_id": "uropodes" },
            { "id": "q_telson", "prompt": "Assenyala: Tèlson bilobulat", "target_anatomy_id": "telson" }
        ]
    };

    const FALLBACK_PERLA_MARGINATA_DATA = {
        "title": "Nimfa de Perla marginata",
        "questions": [
            { "id": "q_cap", "prompt": "Assenyala: Càpsula cefàlica", "target_anatomy_id": "cap" },
            { "id": "q_ulls", "prompt": "Assenyala: Ulls compostos", "target_anatomy_id": "ulls" },
            { "id": "q_antenes", "prompt": "Assenyala: Antenes", "target_anatomy_id": "antenes" },
            { "id": "q_torax", "prompt": "Assenyala: Tòrax", "target_anatomy_id": "torax" },
            { "id": "q_pronot", "prompt": "Assenyala: Pronot", "target_anatomy_id": "pronot" },
            { "id": "q_esbossos_alars", "prompt": "Assenyala: Esbossos alars", "target_anatomy_id": "esbossos_alars" },
            { "id": "q_abdomen", "prompt": "Assenyala: Abdomen (segments I-X)", "target_anatomy_id": "abdomen" },
            { "id": "q_cers", "prompt": "Assenyala: Cercs caudals", "target_anatomy_id": "cers" },
            { "id": "q_branquies", "prompt": "Assenyala: Brànquies toràciques", "target_anatomy_id": "branquies" },
            { "id": "q_cercs", "prompt": "Assenyala: Cercs caudals", "target_anatomy_id": "cercs" },
            { "id": "q_setes", "prompt": "Assenyala: Setes", "target_anatomy_id": "setes" }
        ]
    };

    const MODEL_CONFIGS = {
        betid: {
            title: 'Baetis',
            modelUrl: 'assets/models/macroinvertebrats/Baetis_animat/Baetis_animat.glb',
            jsonUrl: 'assets/models/macroinvertebrats/Baetis_animat/Anatomia_Baetis.json',
            fallback: FALLBACK_GAME_DATA
        },
        simulium: {
            title: 'Simulium',
            modelUrl: 'assets/models/macroinvertebrats/Simulium_animat/Simulium_animat.glb',
            jsonUrl: 'assets/models/macroinvertebrats/Simulium_animat/Anatomia_Simulium.json',
            fallback: FALLBACK_SIMULIUM_DATA
        },
        culex: {
            title: 'Culex',
            modelUrl: 'assets/models/macroinvertebrats/Culex/Culex_web.glb',
            jsonUrl: 'assets/models/macroinvertebrats/Culex/Anatomia_Culex.json',
            fallback: FALLBACK_CULEX_DATA
        },
        hydropsyche: {
            title: 'Hydropsyche',
            modelUrl: 'assets/models/macroinvertebrats/Hydropsyche_animat/Hydropsyche_animat.glb',
            jsonUrl: 'assets/models/macroinvertebrats/Hydropsyche_animat/Anatomia_Hydropsyche.json',
            fallback: FALLBACK_HYDROPSYCHE_DATA
        },
        echinogammarus: {
            title: 'Echinogammarus',
            modelUrl: 'assets/models/macroinvertebrats/Echinogammarus_animat/Echinogammarus_animat.glb',
            jsonUrl: 'assets/models/macroinvertebrats/Echinogammarus_animat/Anatomia_Echinogammarus.json',
            fallback: FALLBACK_ECHINOGAMMARUS_DATA
        },
        perlaMarginata: {
            title: 'Perla marginata',
            modelUrl: 'assets/models/macroinvertebrats/Perla_marginata_animat/Perla_marginata_animada.glb',
            jsonUrl: 'assets/models/macroinvertebrats/Perla_marginata_animat/Anatomia_Perla_marginata.json',
            fallback: FALLBACK_PERLA_MARGINATA_DATA
        }
    };

    async function initBetid3DGame() {
        const canvas = document.getElementById('betid-3d-canvas');
        const container = document.getElementById('betid-3d-viewport');
        const loaderEl = document.getElementById('betid-3d-loader');

        if (!canvas || !container) return;

        if (typeof THREE === 'undefined') {
            console.error('Three.js no s\'ha carregat correctament.');
            if (loaderEl) {
                loaderEl.innerHTML = '<p class="p-4 text-red-400">No s\'ha trobat la biblioteca Three.js.</p>';
            }
            return;
        }

        if (!isInitialized) {
            setupThreeScene(canvas, container);
            setupEventListeners(canvas);
            isInitialized = true;
        }

        updateModelTitle();
        setTimeout(onWindowResize, 100);
        setTimeout(onWindowResize, 300);

        if (!isModelLoaded) {
            await loadActiveModel(loaderEl);
        }

        setBetid3DMode(currentMode);
        animate();
    }

    async function selectMacroModel(modelKey) {
        if (!MODEL_CONFIGS[modelKey] || modelKey === activeModelKey && isModelLoaded) return;

        activeModelKey = modelKey;
        currentQuestionIndex = 0;
        score = 0;
        hasAttemptedCurrentQuestion = false;
        isModelLoaded = false;
        disposeCurrentModel();

        const loaderEl = document.getElementById('betid-3d-loader');
        if (loaderEl) {
            loaderEl.innerHTML = '<div class="betid-3d-spinner"></div><span>Carregant el model 3D...</span>';
            loaderEl.classList.remove('hidden');
        }

        updateModelTitle();
        updateModelSelector();
        await loadActiveModel(loaderEl);
        setBetid3DMode(currentMode);
        onWindowResize();
    }

    async function loadActiveModel(loaderEl) {
        try {
            await Promise.all([loadJSONData(), loadGLTFModel()]);
            isModelLoaded = true;
            if (loaderEl) loaderEl.classList.add('hidden');
        } catch (err) {
            console.error('Error carregant el model 3D:', err);
            if (loaderEl) {
                loaderEl.innerHTML = '<p class="p-4 text-red-400">Error carregant el model 3D.<br>Verifica la connexió o el navegador.</p>';
            }
        }
    }

    function updateModelTitle() {
        const config = MODEL_CONFIGS[activeModelKey];
        const titleEl = document.getElementById('betid-3d-model-title');
        if (titleEl && config) titleEl.textContent = config.title;
    }

    function updateModelSelector() {
        document.querySelectorAll('[data-macro-model]').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.macroModel === activeModelKey);
        });
    }

    function disposeCurrentModel() {
        restaurarMaterials();
        if (mixer) {
            mixer.stopAllAction();
            mixer = null;
        }
        if (!modelRoot) return;

        modelRoot.traverse((child) => {
            if (!child.isMesh) return;
            child.geometry?.dispose();
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => material?.dispose());
        });
        scene.remove(modelRoot);
        modelRoot = null;
        originalMaterialsMap.clear();
    }

    function setupThreeScene(canvas, container) {
        scene = new THREE.Scene();

        const aspect = (container.clientWidth || 800) / (container.clientHeight || 480);
        camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        camera.position.set(0, 1.5, 3);

        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(container.clientWidth || 800, container.clientHeight || 480);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight1.position.set(5, 10, 7);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x90b0ff, 0.8);
        dirLight2.position.set(-5, -5, -5);
        scene.add(dirLight2);

        const OrbitControlsClass = THREE.OrbitControls || (window.THREE && window.THREE.OrbitControls);
        if (OrbitControlsClass) {
            controls = new OrbitControlsClass(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 0.5;
            controls.maxDistance = 10;
        }

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        window.addEventListener('resize', onWindowResize);
    }

    function setupEventListeners(canvas) {
        canvas.addEventListener('pointerdown', (e) => {
            isPointerDown = true;
            pointerDownX = e.clientX;
            pointerDownY = e.clientY;
            maxDisplacement = 0;
        });

        canvas.addEventListener('pointermove', (e) => {
            if (isPointerDown) {
                const disp = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
                if (disp > maxDisplacement) {
                    maxDisplacement = disp;
                }
            }
        });

        canvas.addEventListener('pointerup', (e) => {
            if (isPointerDown && maxDisplacement < 6) {
                handleCanvasClick(e, canvas);
            }
            isPointerDown = false;
        });

        canvas.addEventListener('pointercancel', () => {
            isPointerDown = false;
        });
    }

    async function loadJSONData() {
        const config = MODEL_CONFIGS[activeModelKey];
        try {
            const res = await fetch(config.jsonUrl);
            if (!res.ok) throw new Error(`No s'ha trobat ${config.jsonUrl}`);
            gameData = await res.json();
        } catch (err) {
            console.warn('Fent servir dades anatòmiques de reserva (fallback):', err);
            gameData = config.fallback;
        }
    }

    function loadGLTFModel() {
        return new Promise((resolve, reject) => {
            const config = MODEL_CONFIGS[activeModelKey];
            const LoaderClass = THREE.GLTFLoader || (window.THREE && window.THREE.GLTFLoader);
            if (!LoaderClass) {
                reject(new Error('GLTFLoader no està disponible.'));
                return;
            }

            const loader = new LoaderClass();
            loader.load(
                config.modelUrl,
                (gltf) => {
                    modelRoot = gltf.scene;

                    modelRoot.traverse((child) => {
                        if (child.isMesh) {
                            originalMaterialsMap.set(child.uuid, child.material);
                        }
                    });

                    scene.add(modelRoot);
                    if (gltf.animations && gltf.animations.length > 0) {
                        mixer = new THREE.AnimationMixer(modelRoot);
                        gltf.animations.forEach((clip) => {
                            mixer.clipAction(clip).play();
                        });
                    }
                    frameModel();
                    resolve();
                },
                undefined,
                (err) => reject(err)
            );
        });
    }

    function frameModel() {
        if (!modelRoot) return;

        const box = new THREE.Box3().setFromObject(modelRoot);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        if (controls) controls.target.copy(center);

        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.8;

        camera.position.set(center.x, center.y + maxDim * 0.6, center.z + cameraZ);
        camera.lookAt(center);
        if (controls) controls.update();
    }

    function onWindowResize() {
        const container = document.getElementById('betid-3d-viewport');
        if (!container || !renderer || !camera) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 480;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);
        if (controls) controls.update();
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    function trobarPartAnatomica(object) {
        let curr = object;
        while (curr && curr !== scene) {
            if (curr.userData && typeof curr.userData.anatomy_id === 'string') {
                return curr;
            }
            curr = curr.parent;
        }
        return null;
    }

    function handleCanvasClick(event, canvas) {
        if (!modelRoot || !camera) return;

        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(modelRoot.children, true);

        if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            const nodeAnatomic = trobarPartAnatomica(hitObject);

            if (nodeAnatomic) {
                onPartSelected(nodeAnatomic.userData, nodeAnatomic);
            }
        }
    }

    function onPartSelected(userData, nodeAnatomic) {
        if (currentMode === 'explore') {
            ressaltarNode(nodeAnatomic, 0x8b5cf6);
            const labelEl = document.getElementById('betid-3d-label');
            if (labelEl) {
                labelEl.textContent = `Part seleccionada: ${userData.label_ca || 'Part anatòmica'}`;
            }
        } else if (currentMode === 'practice') {
            const currentQuestion = activePracticeQuestions[currentQuestionIndex];
            if (!currentQuestion) return;

            const isCorrect = userData.anatomy_id === currentQuestion.target_anatomy_id;
            const feedbackEl = document.getElementById('betid-3d-feedback');
            const nextBtn = document.getElementById('betid-3d-next-btn');

            if (isCorrect) {
                ressaltarNode(nodeAnatomic, 0x10b981);
                if (!hasAttemptedCurrentQuestion) {
                    score++;
                    updateScoreUI();
                }

                if (feedbackEl) {
                    feedbackEl.className = 'game-panel__feedback text-center mt-2 p-2 rounded feedback-panel--success';
                    feedbackEl.textContent = 'Correcte!';
                    feedbackEl.classList.remove('hidden');
                }

                if (nextBtn) nextBtn.classList.remove('hidden');
            } else {
                ressaltarNode(nodeAnatomic, 0xef4444);
                hasAttemptedCurrentQuestion = true;

                if (feedbackEl) {
                    feedbackEl.className = 'game-panel__feedback text-center mt-2 p-2 rounded feedback-panel--error';
                    feedbackEl.textContent = `Això són ${userData.label_ca || 'una altra part'}. Torna-ho a provar!`;
                    feedbackEl.classList.remove('hidden');
                }
            }
        }
    }

    function ressaltarNode(node, colorHex) {
        restaurarMaterials();

        highlightedNode = node;
        node.traverse((child) => {
            if (child.isMesh && child.material) {
                const clonedMat = child.material.clone();
                if (clonedMat.emissive) {
                    clonedMat.emissive.setHex(colorHex);
                    clonedMat.emissiveIntensity = 0.6;
                } else {
                    clonedMat.color.setHex(colorHex);
                }
                child.material = clonedMat;
            }
        });
    }

    function restaurarMaterials() {
        if (highlightedNode) {
            highlightedNode.traverse((child) => {
                if (child.isMesh && originalMaterialsMap.has(child.uuid)) {
                    child.material = originalMaterialsMap.get(child.uuid);
                }
            });
            highlightedNode = null;
        }
    }

    function setBetid3DMode(mode) {
        currentMode = mode;
        restaurarMaterials();

        const exploreBtn = document.getElementById('betid-mode-explore-btn');
        const practiceBtn = document.getElementById('betid-mode-practice-btn');
        const labelBadge = document.getElementById('betid-3d-label');
        const quizPanel = document.getElementById('betid-3d-quiz-panel');
        const resultsPanel = document.getElementById('betid-3d-results');

        if (mode === 'explore') {
            if (exploreBtn) { exploreBtn.className = 'btn btn--primary'; }
            if (practiceBtn) { practiceBtn.className = 'btn btn--outline'; }
            if (labelBadge) {
                labelBadge.classList.remove('hidden');
                labelBadge.textContent = 'Clica una part per identificar-la';
            }
            if (quizPanel) quizPanel.classList.add('hidden');
            if (resultsPanel) resultsPanel.classList.add('hidden');
        } else {
            if (exploreBtn) { exploreBtn.className = 'btn btn--outline'; }
            if (practiceBtn) { practiceBtn.className = 'btn btn--primary'; }
            if (labelBadge) labelBadge.classList.add('hidden');
            if (resultsPanel) resultsPanel.classList.add('hidden');

            startBetid3DPracticeQuiz();
        }
    }

    function shuffleArray(arr) {
        return arr.slice().sort(() => Math.random() - 0.5);
    }

    function startBetid3DPracticeQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        hasAttemptedCurrentQuestion = false;

        const allQuestions = gameData?.questions || [];
        activePracticeQuestions = shuffleArray(allQuestions).slice(0, 10);

        const quizPanel = document.getElementById('betid-3d-quiz-panel');
        if (quizPanel) quizPanel.classList.remove('hidden');

        showCurrentQuestion();
    }

    function showCurrentQuestion() {
        restaurarMaterials();
        hasAttemptedCurrentQuestion = false;

        const totalQuestions = activePracticeQuestions.length;

        if (currentQuestionIndex >= totalQuestions) {
            finishBetid3DQuiz();
            return;
        }

        const currentQ = activePracticeQuestions[currentQuestionIndex];

        const progressEl = document.getElementById('betid-3d-progress');
        const promptEl = document.getElementById('betid-3d-prompt');
        const feedbackEl = document.getElementById('betid-3d-feedback');
        const nextBtn = document.getElementById('betid-3d-next-btn');

        if (progressEl) progressEl.textContent = `Pregunta ${currentQuestionIndex + 1} / ${totalQuestions}`;
        if (promptEl) promptEl.textContent = currentQ.prompt || 'Clica la part corresponent';
        if (feedbackEl) feedbackEl.classList.add('hidden');
        if (nextBtn) nextBtn.classList.add('hidden');

        updateScoreUI();
    }

    function nextBetid3DQuestion() {
        currentQuestionIndex++;
        showCurrentQuestion();
    }

    function updateScoreUI() {
        const scoreEl = document.getElementById('betid-3d-score');
        if (scoreEl) scoreEl.textContent = `Punts: ${score}`;
    }

    function finishBetid3DQuiz() {
        const quizPanel = document.getElementById('betid-3d-quiz-panel');
        const resultsPanel = document.getElementById('betid-3d-results');

        if (quizPanel) quizPanel.classList.add('hidden');
        if (resultsPanel) resultsPanel.classList.remove('hidden');

        const totalQuestions = activePracticeQuestions.length || 10;
        const percentage = Math.round((score / totalQuestions) * 100);

        const finalScoreEl = document.getElementById('betid-3d-final-score');
        const finalPercentageEl = document.getElementById('betid-3d-final-percentage');
        const finalMsgEl = document.getElementById('betid-3d-final-msg');

        if (finalScoreEl) finalScoreEl.textContent = `${score} / ${totalQuestions}`;
        if (finalPercentageEl) finalPercentageEl.textContent = `${percentage}%`;

        const modelTitle = MODEL_CONFIGS[activeModelKey].title;
        let msg = `Molt bé! Has identificat les parts anatòmiques de la ${modelTitle.toLowerCase()}.`;
        if (percentage === 100) {
            msg = `Excel·lent! Coneixes l'anatomia de la ${modelTitle.toLowerCase()} a la perfecció!`;
        } else if (percentage < 50) {
            msg = 'Pots millorar! Utilitza el mode explorar per repassar les parts.';
        }

        if (finalMsgEl) finalMsgEl.textContent = msg;

        if (typeof saveResult === 'function') {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            saveResult({
                email: currentUser.email || 'anonim@escola.cat',
                curs: currentUser.curs || '4t ESO',
                grup: currentUser.grup || currentUser.curs || '4t ESO',
                projecte: 'Entorns de Natura',
                app: `macroinvertebrat-3d-${activeModelKey}`,
                nivell: 'estàndard',
                puntuacio: percentage,
                temps_segons: 0,
                feedback_pos: `Punts: ${score}/${totalQuestions}`,
                feedback_neg: ''
            });
        }
    }

    function resetBetid3DCamera() {
        frameModel();
    }

    function setBetid3DCameraView(viewType) {
        if (!modelRoot || !controls) return;

        const box = new THREE.Box3().setFromObject(modelRoot);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        if (controls) controls.target.copy(center);

        if (viewType === 'dorsal') {
            camera.position.set(center.x, center.y + maxDim * 2.2, center.z + 0.01);
        } else if (viewType === 'ventral') {
            camera.position.set(center.x, center.y - maxDim * 2.2, center.z + 0.01);
        }

        camera.lookAt(center);
        if (controls) controls.update();
    }

    window.initBetid3DGame = initBetid3DGame;
    window.selectMacroModel = selectMacroModel;
    window.setBetid3DMode = setBetid3DMode;
    window.resetBetid3DCamera = resetBetid3DCamera;
    window.setBetid3DCameraView = setBetid3DCameraView;
    window.nextBetid3DQuestion = nextBetid3DQuestion;
})();
