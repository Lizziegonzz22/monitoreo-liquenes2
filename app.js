// --- CONFIGURACIÓN DE NIVELES ECOLÓGICOS (DATOS DEL PDF) ---
const stages = {
    clean: {
        traffic: "Zona de Control (Prado)",
        trafficClass: "text-green",
        bgClass: "bg-prado-clean",
        name: "Usnea sp. (Barba de Viejo) / Teloschistes",
        badge: "Fruticuloso / Muy Sensible",
        desc: "Exigen aire completamente puro. Sus filamentos naranja y verde brillante demuestran que el nivel de dióxido de azufre es nulo.",
        healthTitle: "Entorno Seguro (Prado)",
        healthText: "Las áreas de parques absorben gases pesados. Atmósfera ideal libre de riesgos respiratorios en el Prado.",
        healthClass: "panel-card alert-system border-green",
        healthIcon: "🌿",
        lichenColor: "#10b981", // Verde neón
        // Cuadrantes recomendados donde brotan en la pantalla
        spots: 
    },
    medium: {
        traffic: "Moderado / Avenidas (Colón)",
        trafficClass: "text-amber",
        bgClass: "bg-colon-medium",
        name: "Flavoparmelia caperata / Ramalina",
        badge: "Foliáceo / Resistencia Media",
        desc: "Las especies ramificadas mueren. Sobreviven láminas verde-amarillentas que toleran el impacto intermedio de Av. Garzón.",
        healthTitle: "Atención Respiratoria (Colón)",
        healthText: "Nivel transicional. Concentración moderada de partículas en suspensión pero estable.",
        healthClass: "panel-card alert-system border-amber",
        healthIcon: "🏡",
        lichenColor: "#eab308", // Amarillo azufre
        spots: 
    },
    toxic: {
        traffic: "Efecto Cañón / Saturado (Centro)",
        trafficClass: "text-red",
        bgClass: "bg-centro-smog",
        name: "Physcia urbana / Lepraria incana",
        badge: "Crustoso / Muy Tolerante",
        desc: "Toda la diversidad biológica desaparece. Solo quedan costras grises pegadas al tronco que toleran el esmog de Zelmar Michelini.",
        healthTitle: "Alerta Crítica (Centro)",
        healthText: "Los edificios retienen los gases de escape. Riesgo muy elevado de asma e infecciones pulmonares infantiles.",
        healthClass: "panel-card alert-system border-red",
        healthIcon: "☣",
        lichenColor: "#94a3b8", // Gris ceniza marchito
        spots: 
    }
};

const slider = document.getElementById('smog-slider');
const grid = document.getElementById('interactive-grid');
const lichenGarden = document.getElementById('lichen-garden');

let countedSquares = new Set();
let currentActiveSpots = [];

// --- CREAR MATRIZ INTERACTIVA DE 40 CASILLEROS ---
function initInteractiveMatrix() {
    grid.innerHTML = "";
    countedSquares.clear();
    document.getElementById('lbl-counted').innerText = "0";
    document.getElementById('lbl-ipa').innerText = "0 / 20";
    document.getElementById('lbl-ipa').className = "text-green font-black text-lg";

    for (let i = 0; i < 40; i++) {
        const cell = document.createElement('div');
        cell.className = "matrix-cell";
        
        // Evento interactivo de conteo al hacer clic en los hilos de luz
        cell.addEventListener('click', () => {
            if (currentActiveSpots.includes(i)) {
                if (countedSquares.has(i)) {
                    countedSquares.delete(i);
                    cell.classList.remove('counted-active');
                } else {
                    countedSquares.add(i);
                    cell.classList.add('counted-active');
                }
                
                // Calcular IPA dinámico en base al conteo del usuario
                const score = countedSquares.size;
                document.getElementById('lbl-counted').innerText = score;
                document.getElementById('lbl-ipa').innerText = `${score} / 20`;
                
                // Cambiar color del marcador digital inteligente
                const ipaLabel = document.getElementById('lbl-ipa');
                if(score <= 6) ipaLabel.className = "text-red font-black text-lg animate-pulse";
                else if(score <= 12) ipaLabel.className = "text-amber font-black text-lg";
                else ipaLabel.className = "text-green font-black text-lg";
            }
        });
        grid.appendChild(cell);
    }
}

// --- ACTUALIZACIÓN INTERACTIVA SEGÚN TU INYECCIÓN DE CONTAMINACIÓN ---
function runAtmosphereSimulation(pollutionLevel) {
    let mode = "clean";
    if (pollutionLevel >= 35 && pollutionLevel < 75) mode = "medium";
    if (pollutionLevel >= 75) mode = "toxic";

    const config = stages[mode];
    currentActiveSpots = config.spots;

    // 1. Forzar textos y telemetrías
    const txtTraffic = document.getElementById('txt-traffic');
    txtTraffic.innerText = config.traffic;
    txtTraffic.className = `metric-val ${config.trafficClass}`;

    document.getElementById('specie-name').innerText = config.name;
    document.getElementById('specie-type').innerText = config.badge;
    document.getElementById('specie-desc').innerText = config.desc;
    
    const speciesBox = document.getElementById('lichen-species-box');
    speciesBox.className = `species-status-card state-${mode === 'clean' ? 'clean' : (mode === 'medium' ? 'medium' : 'toxic')}`;

    document.getElementById('health-title').innerText = config.healthTitle;
    document.getElementById('health-text').innerText = config.healthText;
    document.getElementById('health-icon').innerText = config.healthIcon;
    document.getElementById('health-alert-box').className = config.healthClass;

    // 2. Modificar el domo ambiental (Gradientes)
    document.getElementById('atmosphere-glow').className = `environment-container ${config.bgClass}`;

    // 3. Brotación orgánica y fluida de líquenes en la corteza
    lichenGarden.innerHTML = "";
    config.spots.forEach(index => {
        const blob = document.createElement('div');
        blob.className = "lichen-element";
        
        // Traducir el índice de la matriz en coordenadas X/Y reales sobre el tronco
        const row = Math.floor(index / 4);
        const col = index % 4;
        
        blob.style.width = mode === 'toxic' ? "25px" : "40px";
        blob.style.height = mode === 'toxic' ? "20px" : "32px";
        blob.style.top = `${row * 10 + 2}%`;
        blob.style.left = `${col * 22 + 10}%`;
        blob.style.backgroundColor = config.lichenColor;
        blob.style.boxShadow = `0 0 15px ${config.lichenColor}`;

        lichenGarden.appendChild(blob);
        
        // Retraso milimétrico para activar el efecto de crecimiento orgánico fluido
        setTimeout(() => blob.classList.add('spawned'), 50);
    });

    // Limpiar cuadrantes marcados si el líguen desapareció por el esmog
    Array.from(grid.children).forEach((cell, i) => {
        if (!config.spots.includes(i)) {
            cell.classList.remove('counted-active');
            countedSquares.delete(i);
        }
    });
    document.getElementById('lbl-counted').innerText = countedSquares.size;
}

// --- CONTROLES DE LA REJILLA TRANSPARENTE ---
const btnGrid = document.getElementById('btn-toggle-grid');
let gridVisible = true;
btnGrid.addEventListener('click', () => {
    gridVisible = !gridVisible;
    grid.style.opacity = gridVisible ? "1" : "0";
    btnGrid.innerText = gridVisible ? "Ocultar Rejilla" : "Mostrar Rejilla";
});

// Oír movimientos del inyector manual
slider.addEventListener('input', (e) => {
    runAtmosphereSimulation(parseInt(e.target.value));
});

// Inicializar mesa de simulación limpia
initInteractiveMatrix();
runAtmosphereSimulation(0);

