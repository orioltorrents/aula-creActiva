/* ==========================================================================
   Estris de Laboratori 3D
   Lògica interactiva amb Three.js, Raycaster, filtres de tema i dificultat
   ========================================================================== */

(function () {
    const JSON_QUESTIONS_URL = 'assets/models/estris-laboratori/preguntes-pilot-3d.json';

    let gameData = null;
    let filteredQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let hasAnsweredCurrent = false;

    // Filtres seleccionats
    let selectedTopic = 'all';
    let selectedLevel = 'all';

    // Variables de Three.js
    let scene = null;
    let camera = null;
    let renderer = null;
    let controls = null;
    let raycaster = null;
    let mouse = null;
    let animationFrameId = null;

    let loadedModels = [];
    let originalMaterialsMap = new Map();

    function initBioLabTools3DGame() {
        resetBioLabTools3DGame();

        const startScreen = document.getElementById('bio-lab-tools-3d-start');
        const gameScreen = document.getElementById('bio-lab-tools-3d-game');
        const resultsScreen = document.getElementById('bio-lab-tools-3d-results');

        if (!startScreen || !gameScreen || !resultsScreen) return;

        startScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
        resultsScreen.classList.add('hidden');

        setupFilterListeners();
    }

    function setupFilterListeners() {
        const topicContainer = document.getElementById('bio-lab-3d-topic-filters');
        if (topicContainer) {
            topicContainer.querySelectorAll('.quiz-filter-button').forEach(btn => {
                btn.onclick = () => {
                    topicContainer.querySelectorAll('.quiz-filter-button').forEach(b => b.classList.remove('is-active'));
                    btn.classList.add('is-active');
                    selectedTopic = btn.dataset.topic || 'all';
                };
            });
        }

        const levelContainer = document.getElementById('bio-lab-3d-level-filters');
        if (levelContainer) {
            levelContainer.querySelectorAll('.quiz-filter-button').forEach(btn => {
                btn.onclick = () => {
                    levelContainer.querySelectorAll('.quiz-filter-button').forEach(b => b.classList.remove('is-active'));
                    btn.classList.add('is-active');
                    selectedLevel = btn.dataset.level || 'all';
                };
            });
        }
    }

    function resetBioLabTools3DGame() {
        currentQuestionIndex = 0;
        score = 0;
        hasAnsweredCurrent = false;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        cleanupThreeScene();
    }

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    async function startBioLabTools3DGame() {
        const startScreen = document.getElementById('bio-lab-tools-3d-start');
        const gameScreen = document.getElementById('bio-lab-tools-3d-game');
        const resultsScreen = document.getElementById('bio-lab-tools-3d-results');
        const loaderEl = document.getElementById('bio-lab-tools-3d-loader');

        if (startScreen) startScreen.classList.add('hidden');
        if (resultsScreen) resultsScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden');
        if (loaderEl) loaderEl.classList.remove('hidden');

        try {
            if (!gameData) {
                const response = await fetch(JSON_QUESTIONS_URL);
                if (!response.ok) throw new Error(`No s'ha pogut carregar ${JSON_QUESTIONS_URL}`);
                gameData = await response.json();
            }

            // Filtrar preguntes segons tema i nivell seleccionats
            let candidates = filterQuestions(gameData.questions || [], selectedTopic, selectedLevel);

            if (candidates.length === 0) {
                candidates = gameData.questions || [];
            }

            // Mesclar amb Fisher-Yates i agafar fins a un màxim de 10 preguntes per sessió
            filteredQuestions = shuffleArray(candidates).slice(0, 10);

            currentQuestionIndex = 0;
            score = 0;

            setupThreeViewport();
            loadCurrentQuestion();
        } catch (error) {
            console.error("Error inicialitzant l'activitat 3D:", error);
            const promptEl = document.getElementById('bio-lab-tools-3d-prompt');
            if (promptEl) {
                promptEl.textContent = "Error en carregar les preguntes 3D. Si us plau, torna-ho a intentar.";
            }
        }
    }

    function filterQuestions(questions, topic, level) {
        return questions.filter(q => {
            const matchesTopic = (topic === 'all') || (q.topic === topic);
            const matchesLevel = (level === 'all') || (q.level === level);
            return matchesTopic && matchesLevel;
        });
    }

    function setupThreeViewport() {
        const container = document.getElementById('bio-lab-tools-3d-viewport');
        const canvas = document.getElementById('bio-lab-tools-3d-canvas');
        if (!container || !canvas || typeof THREE === 'undefined') return;

        if (renderer) {
            onWindowResize();
            return;
        }

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 420;

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0.35, 0.85);

        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Il·luminació avançada per a vidre i estris
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.8);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight1.position.set(5, 10, 7);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight2.position.set(-5, -5, -5);
        scene.add(dirLight2);

        // OrbitControls
        const OrbitControlsClass = THREE.OrbitControls || (window.THREE && window.THREE.OrbitControls);
        if (OrbitControlsClass) {
            controls = new OrbitControlsClass(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 0.2;
            controls.maxDistance = 3;
            controls.target.set(0, 0.1, 0);
        }

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        canvas.addEventListener('click', handleCanvasClick);
        window.addEventListener('resize', onWindowResize);

        animate();
    }

    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        if (controls) controls.update();
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    function onWindowResize() {
        const container = document.getElementById('bio-lab-tools-3d-viewport');
        if (!container || !renderer || !camera) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 420;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    function clearLoadedModels() {
        loadedModels.forEach(model => scene.remove(model));
        loadedModels = [];
        originalMaterialsMap.clear();
    }

    function cleanupThreeScene() {
        clearLoadedModels();
        if (renderer) {
            renderer.dispose();
            renderer = null;
        }
        scene = null;
        camera = null;
        controls = null;
    }

    async function loadCurrentQuestion() {
        if (!filteredQuestions || filteredQuestions.length === 0 || currentQuestionIndex >= filteredQuestions.length) {
            finishBioLabTools3DGame();
            return;
        }

        hasAnsweredCurrent = false;

        const question = filteredQuestions[currentQuestionIndex];
        const loaderEl = document.getElementById('bio-lab-tools-3d-loader');
        const feedbackEl = document.getElementById('bio-lab-tools-3d-feedback');
        const nextBtn = document.getElementById('bio-lab-tools-3d-next-btn');

        if (loaderEl) loaderEl.classList.remove('hidden');
        if (feedbackEl) {
            feedbackEl.textContent = '';
            feedbackEl.className = 'game-panel__feedback text-center mt-2 p-2 rounded hidden';
        }
        if (nextBtn) nextBtn.classList.add('hidden');

        updateStatsUI();
        clearLoadedModels();

        const promptEl = document.getElementById('bio-lab-tools-3d-prompt');
        const optionsEl = document.getElementById('bio-lab-tools-3d-options');
        const hintEl = document.getElementById('bio-lab-tools-3d-hint');

        if (promptEl) promptEl.textContent = question.prompt;
        if (optionsEl) optionsEl.innerHTML = '';

        try {
            if (question.type === 'single_model_quiz') {
                if (hintEl) hintEl.textContent = 'Pots girar i apropar l\'estri amb el ratolí o pantalles tàctils.';
                const model = await loadSingleGLBModel(question.model);
                if (typeof question.liquid_ml === 'number') {
                    setLiquidLevel(model, question.liquid_ml, question.liquid_min_ml || 100, question.liquid_max_ml || 500);
                }
                renderMultipleChoiceOptions(question);
            } else if (question.type === 'multi_model_click') {
                if (hintEl) hintEl.textContent = 'Clica directament damunt de l\'estri en 3D que creguis correcte.';
                await loadMultiGLBModels(question.models);
                if (optionsEl) {
                    optionsEl.innerHTML = `<div class="col-span-full text-center text-slate-500 font-semibold italic p-2 bg-slate-100 rounded">Fes clic sobre l'estri 3D de l'escena</div>`;
                }
            } else if (question.type === 'multi_model_quiz') {
                if (hintEl) hintEl.textContent = 'Observa els dos models 3D i tria la resposta correcta.';
                await loadMultiGLBModels(question.models);
                renderMultipleChoiceOptions(question);
            }
        } catch (err) {
            console.error("Error carregant models GLB per a la pregunta:", err);
            if (promptEl) promptEl.textContent = "S'ha produït un error carregant el model 3D.";
        } finally {
            if (loaderEl) loaderEl.classList.add('hidden');
        }
    }

    function renderMultipleChoiceOptions(question) {
        const optionsEl = document.getElementById('bio-lab-tools-3d-options');
        if (!optionsEl || !question.options) return;

        optionsEl.innerHTML = '';
        question.options.forEach((optText, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn quiz-option-button bio-lab-3d__option-btn';
            btn.textContent = `${String.fromCharCode(65 + index)}) ${optText}`;
            btn.onclick = () => handleMultipleChoiceAnswer(index, question);
            optionsEl.appendChild(btn);
        });
    }

    function handleMultipleChoiceAnswer(selectedIndex, question) {
        if (hasAnsweredCurrent) return;
        hasAnsweredCurrent = true;

        const isCorrect = selectedIndex === question.correct_index;
        const optionsEl = document.getElementById('bio-lab-tools-3d-options');
        const feedbackEl = document.getElementById('bio-lab-tools-3d-feedback');
        const nextBtn = document.getElementById('bio-lab-tools-3d-next-btn');

        if (optionsEl) {
            const buttons = optionsEl.querySelectorAll('.bio-lab-3d__option-btn');
            buttons.forEach((btn, idx) => {
                btn.disabled = true;
                if (idx === question.correct_index) {
                    btn.classList.add('quiz-option-button--correct', 'bio-lab-3d__option-btn--correct');
                } else if (idx === selectedIndex) {
                    btn.classList.add('quiz-option-button--incorrect', 'bio-lab-3d__option-btn--incorrect');
                }
            });
        }

        if (isCorrect) {
            score++;
            updateStatsUI();
            if (feedbackEl) {
                feedbackEl.className = 'game-panel__feedback text-center mt-2 p-2 rounded feedback-panel--success';
                feedbackEl.textContent = question.feedback_correct || 'Correcte!';
            }
            if (loadedModels.length > 0) ressaltarNode(loadedModels[0], 0x10b981);
        } else {
            if (feedbackEl) {
                feedbackEl.className = 'game-panel__feedback text-center mt-2 p-2 rounded feedback-panel--error';
                feedbackEl.textContent = question.feedback_incorrect || 'Incorrecte!';
            }
            if (loadedModels.length > 0) ressaltarNode(loadedModels[0], 0xef4444);
        }

        if (nextBtn) nextBtn.classList.remove('hidden');
    }

    function handleCanvasClick(event) {
        if (!filteredQuestions || hasAnsweredCurrent) return;

        const currentQ = filteredQuestions[currentQuestionIndex];
        if (!currentQ || currentQ.type !== 'multi_model_click') return;

        const canvas = document.getElementById('bio-lab-tools-3d-canvas');
        if (!canvas || !camera || loadedModels.length === 0) return;

        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(loadedModels, true);

        if (intersects.length > 0) {
            const hitMesh = intersects[0].object;
            const rootModel = findRootModel(hitMesh);

            if (rootModel && rootModel.userData) {
                handleMultiModelAnswer(rootModel, currentQ);
            }
        }
    }

    function findRootModel(mesh) {
        let curr = mesh;
        while (curr && curr.parent && curr.parent !== scene) {
            curr = curr.parent;
        }
        return curr;
    }

    function handleMultiModelAnswer(selectedModel, question) {
        hasAnsweredCurrent = true;

        const selectedVariantId = selectedModel.userData.variant_id;
        const isCorrect = selectedVariantId === question.correct_variant_id;

        const feedbackEl = document.getElementById('bio-lab-tools-3d-feedback');
        const nextBtn = document.getElementById('bio-lab-tools-3d-next-btn');

        if (isCorrect) {
            score++;
            updateStatsUI();
            ressaltarNode(selectedModel, 0x10b981);
            if (feedbackEl) {
                feedbackEl.className = 'game-panel__feedback text-center mt-2 p-2 rounded feedback-panel--success';
                feedbackEl.textContent = question.feedback_correct || 'Molt bé! Has trobat l\'estri correcte.';
            }
        } else {
            ressaltarNode(selectedModel, 0xef4444);
            if (feedbackEl) {
                feedbackEl.className = 'game-panel__feedback text-center mt-2 p-2 rounded feedback-panel--error';
                feedbackEl.textContent = question.feedback_incorrect || 'Aquest no és l\'estri correcte.';
            }
        }

        if (nextBtn) nextBtn.classList.remove('hidden');
    }

    function setLiquidLevel(model, ml, minMl = 100, maxMl = 500) {
        if (!model || typeof ml !== 'number') return;
        model.traverse((child) => {
            if (child.isMesh && child.morphTargetInfluences && child.morphTargetInfluences.length > 0) {
                const factor = Math.max(0, Math.min(1, (ml - minMl) / (maxMl - minMl)));
                child.morphTargetInfluences[0] = factor;
            }
        });
    }

    function formatLiquidMaterial(child) {
        if (!child.isMesh || !child.material) return;
        const meshName = (child.name || '').toLowerCase();
        const matName = (child.material.name || '').toLowerCase();

        if (meshName.includes('liquid') || matName.includes('liquid') || matName.includes('blau')) {
            child.material = child.material.clone();
            if (child.material.color) {
                child.material.color.setHex(0x38bdf8); // Blau cel suau i fluixet (#38bdf8)
            }
            child.material.transparent = true;
            child.material.opacity = 0.45; // Opacitat baixa (45%) per veure clarament les marques
            child.material.depthWrite = false;
        }
    }

    function formatGlassRodMaterial(child) {
        if (!child.isMesh || !child.material) return;
        const meshName = (child.name || '').toLowerCase();
        const matName = (child.material.name || '').toLowerCase();

        // Només s'aplica a la vareta; altres recipients també són de vidre.
        if (!meshName.includes('vareta') && !matName.includes('vareta')) return;

        child.material = child.material.clone();
        if (child.material.color) child.material.color.setHex(0xb9e6ff);
        child.material.transparent = true;
        child.material.opacity = 0.78;
        child.material.depthWrite = false;
        if ('transmission' in child.material) child.material.transmission = 0.35;
        if ('roughness' in child.material) child.material.roughness = 0.12;
    }

    function loadSingleGLBModel(url) {
        return new Promise((resolve, reject) => {
            const LoaderClass = THREE.GLTFLoader || (window.THREE && window.THREE.GLTFLoader);
            if (!LoaderClass) return reject(new Error('GLTFLoader no disponible'));

            const loader = new LoaderClass();
            loader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;
                    model.position.set(0, 0, 0);

                    model.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.side = THREE.DoubleSide;
                            formatLiquidMaterial(child);
                            formatGlassRodMaterial(child);
                            originalMaterialsMap.set(child.uuid, child.material);
                        }
                    });

                    scene.add(model);
                    loadedModels.push(model);
                    frameAndCenterModel(model);
                    resolve(model);
                },
                undefined,
                (err) => reject(err)
            );
        });
    }

    function loadMultiGLBModels(modelsConfig) {
        const promises = modelsConfig.map(cfg => {
            return new Promise((resolve, reject) => {
                const LoaderClass = THREE.GLTFLoader || (window.THREE && window.THREE.GLTFLoader);
                if (!LoaderClass) return reject(new Error('GLTFLoader no disponible'));

                const loader = new LoaderClass();
                loader.load(
                    cfg.glb,
                    (gltf) => {
                        const model = gltf.scene;
                        const [px, py, pz] = cfg.position || [0, 0, 0];
                        model.position.set(px, py, pz);
                        model.userData.variant_id = cfg.variant_id;

                        model.traverse((child) => {
                            if (child.isMesh && child.material) {
                                child.material.side = THREE.DoubleSide;
                                formatLiquidMaterial(child);
                                formatGlassRodMaterial(child);
                                originalMaterialsMap.set(child.uuid, child.material);
                            }
                        });

                        scene.add(model);
                        loadedModels.push(model);
                        resolve(model);
                    },
                    undefined,
                    (err) => reject(err)
                );
            });
        });

        return Promise.all(promises).then(() => {
            if (camera && loadedModels.length > 0) {
                const groupBoundingBox = new THREE.Box3();
                loadedModels.forEach(m => groupBoundingBox.expandByObject(m));

                const center = groupBoundingBox.getCenter(new THREE.Vector3());
                const size = groupBoundingBox.getSize(new THREE.Vector3());

                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * (Math.PI / 180);
                let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.85;

                camera.position.set(center.x, center.y + size.y * 0.15, center.z + cameraDistance);
                if (controls) {
                    controls.target.copy(center);
                    controls.minDistance = cameraDistance * 0.2;
                    controls.maxDistance = cameraDistance * 3.0;
                    controls.update();
                }
            }
        });
    }

    function frameAndCenterModel(model) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim <= 0) return;

        const fov = camera.fov * (Math.PI / 180);
        let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.9;
        if (cameraDistance < 0.2) cameraDistance = 0.25;

        camera.position.set(center.x, center.y + size.y * 0.15, center.z + cameraDistance);
        if (controls) {
            controls.target.copy(center);
            controls.minDistance = cameraDistance * 0.2;
            controls.maxDistance = cameraDistance * 4.0;
            controls.update();
        }
    }

    function ressaltarNode(node, colorHex) {
        restaurarMaterials();
        node.traverse((child) => {
            if (child.isMesh && child.material) {
                const clonedMat = child.material.clone();
                if (clonedMat.emissive) {
                    clonedMat.emissive.setHex(colorHex);
                    clonedMat.emissiveIntensity = 0.5;
                } else if (clonedMat.color) {
                    clonedMat.color.setHex(colorHex);
                }
                child.material = clonedMat;
            }
        });
    }

    function restaurarMaterials() {
        loadedModels.forEach(model => {
            model.traverse((child) => {
                if (child.isMesh && originalMaterialsMap.has(child.uuid)) {
                    child.material = originalMaterialsMap.get(child.uuid);
                }
            });
        });
    }

    function nextQuestion() {
        currentQuestionIndex++;
        loadCurrentQuestion();
    }

    function updateStatsUI() {
        const total = filteredQuestions ? filteredQuestions.length : 0;
        const currentNum = Math.min(currentQuestionIndex + 1, total);

        const scoreEl = document.getElementById('bio-lab-tools-3d-score');
        const roundEl = document.getElementById('bio-lab-tools-3d-round');

        if (scoreEl) scoreEl.textContent = score;
        if (roundEl) roundEl.textContent = `${currentNum} / ${total}`;
    }

    function finishBioLabTools3DGame() {
        const gameScreen = document.getElementById('bio-lab-tools-3d-game');
        const resultsScreen = document.getElementById('bio-lab-tools-3d-results');
        const finalScoreEl = document.getElementById('bio-lab-tools-3d-final-score');
        const messageEl = document.getElementById('bio-lab-tools-3d-message');

        if (gameScreen) gameScreen.classList.add('hidden');
        if (resultsScreen) resultsScreen.classList.remove('hidden');

        const total = filteredQuestions ? filteredQuestions.length : 1;
        const percentage = Math.round((score / total) * 100);

        if (finalScoreEl) finalScoreEl.textContent = `${score} / ${total} (${percentage}%)`;
        if (messageEl) {
            if (percentage >= 80) {
                messageEl.textContent = "Excel·lent! Tens un bon domini de la identificació i ús dels estris de laboratori.";
            } else if (percentage >= 50) {
                messageEl.textContent = "Bon treball! Repassa les característiques d'alguns estris per aconseguir la màxima puntuació.";
            } else {
                messageEl.textContent = "Cal praticar un mica més la identificació dels estris de laboratori.";
            }
        }

        saveBioLabTools3DResult(percentage, total);
    }

    function getLevelLabel(levelCode) {
        if (levelCode === 'easy') return 'Fàcil';
        if (levelCode === 'medium') return 'Mitjà';
        if (levelCode === 'hard') return 'Difícil';
        return 'Tots els nivells';
    }

    function getTopicLabel(topicCode) {
        if (topicCode === 'noms') return 'Noms';
        if (topicCode === 'funcions') return 'Funcions';
        if (topicCode === 'capacitat') return 'Capacitats';
        if (topicCode === 'seleccio3d') return 'Clic 3D';
        return 'Tots els temes';
    }

    function saveBioLabTools3DResult(percentage, total) {
        if (typeof state === "undefined" || !state.user || typeof callApi !== "function") return;

        const nivellText = `${getLevelLabel(selectedLevel)} - ${getTopicLabel(selectedTopic)}`;

        callApi("saveResult", {
            email: state.user.email,
            curs: state.user.curs,
            grup: state.user.grup || state.user.curs,
            projecte: state.currentProject ? state.currentProject.titol : "Biologia",
            app: "Estris de laboratori",
            nivell: nivellText,
            puntuacio: percentage,
            temps_segons: 0,
            feedback_pos: `${score} d'un total de ${total} encerts`,
            feedback_neg: ""
        }).catch(err => console.error("Error guardant resultats d'estris de laboratori:", err));
    }

    // Exportar funcions globals per a la web
    window.initBioLabTools3DGame = initBioLabTools3DGame;
    window.resetBioLabTools3DGame = resetBioLabTools3DGame;
    window.startBioLabTools3DGame = startBioLabTools3DGame;
    window.nextBioLabTools3DQuestion = nextQuestion;
})();
