// --- CENTRAL DE DATOS DE SIMULACIÓN (BASADO EN TU ANTEPROYECTO) ---
const simulationData = {
    Prado: {
        traffic: 10,
        fi: 20,
        trafficText: "Muy Bajo (Parque/Control)",
        lichenName: "Usnea sp. (Barba de Viejo)",
        lichenStatus: "Fruticuloso • Altamente Sensible",
        lichenDesc: "Líquenes filamentosos colgantes de color verde pálido. Su presencia es el indicador más alto de aire puro en el Prado.",
        health: "Impacto en Salud: Óptimo. Aire puro ideal sin riesgos respiratorios en el Prado.",
        treeColor: "#10b981", // Verde vivo
        lichenColor: "#34d399", // Turquesa radiante
        leafOpacity: 0.9,
        cloudColor: "rgba(16,185,129,0.03)"
    },
    Colon: {
        traffic: 50,
        fi: 12,
        trafficText: "Moderado (Comercial / Avenidas)",
        lichenName: "Flavoparmelia caperata / Ramalina",
        lichenStatus: "Foliáceo • Resistencia Intermedia",
        lichenDesc: "Líquenes folíaceos grandes verde-amarillentos. Indican condiciones de transición atmosférica en el barrio Colón.",
        health: "Impacto en Salud: Aceptable. Concentración moderada de gases por combustión vehicular.",
        treeColor: "#f59e0b", // Ámbar/Ocre
        lichenColor: "#fbbf24", // Amarillo claro
        leafOpacity: 0.5,
        cloudColor: "rgba(245,158,11,0.05)"
    },
    Centro: {
        traffic: 95,
        fi: 5,
        trafficText: "Crítico / Efecto Cañón Urbano",
        lichenName: "Physcia urbana / Lepraria incana",
        lichenStatus: "Crustoso • Altamente Tolerante",
        lichenDesc: "Líquenes reducidos a costras grisáceas pegadas al tronco. Es lo único que sobrevive al dióxido de azufre del Centro.",
        health: "Impacto en Salud: Alerta. Riesgo elevado de asma, afecciones cardiovasculares y daño pulmonar infantil.",
        treeColor: "#475569", // Gris ceniza enfermo
        lichenColor: "#94a3b8", // Gris opaco
        leafOpacity: 0.1,
        cloudColor: "rgba(239,68,68,0.18)" // Humo rojo/negro de polución
    }
};

// --- RENDERIZADOR DEL ÁRBOL MATEMÁTICO EN SVG ---
const container = document.getElementById('tree-container');

function buildTreeSVG() {
    return `
    <svg id="live-tree-svg" viewBox="0 0 600 600" xmlns="http://w3.org" class="w-full h-full live-tree">
        <!-- Raíces y Suelo Tecnológico -->
        <path d="M 180,560 Q 300,540 420,560 L 390,580 L 210,580 Z" fill="#1e293b" opacity="0.3"/>
        <line x1="150" y1="560" x2="450" y2="560" stroke="#334155" stroke-width="2" stroke-dasharray="4,4"/>

        <!-- TRONCO PRINCIPAL (Geometría orgánica agrietada) -->
        <path id="tree-trunk" d="M 280,560 Q 290,380 260,280 Q 240,200 200,150 L 220,145 Q 260,190 280,260 Q 310,380 320,560 Z" fill="#475569" transition="all 0.5s"/>
        
        <!-- Ramas Secundarias Izquierda y Derecha -->
        <path id="branch-left" d="M 270,330 Q 200,280 150,280 L 150,270 Q 210,270 273,315 Z" fill="#475569"/>
        <path id="branch-right" d="M 295,310 Q 380,240 430,220 L 435,230 Q 380,250 293,325 Z" fill="#475569"/>

        <!-- FOLLAJE / HOJAS FLOTANTES (Cambian su opacidad y color) -->
        <g id="foliage-group" class="transition-all duration-700">
            <!-- Copa Alta -->
            <circle cx="210" cy="140" r="45" fill="#10b981" class="tree-leaf" />
            <circle cx="250" cy="120" r="55" fill="#10b981" class="tree-leaf" />
            <!-- Copa Izquierda -->
            <circle cx="140" cy="270" r="40" fill="#10b981" class="tree-leaf" />
            <!-- Copa Derecha -->
            <circle cx="420" cy="220" r="45" fill="#10b981" class="tree-leaf" />
        </g>

        <!-- RED DE COMUNIDADES DE LÍQUENES EN LA CORTEZA -->
        <g id="lichen-group">
            <!-- Líquenes en la base del tronco -->
            <circle cx="295" cy="510" r="14" class="lichen-spot" />
            <circle cx="305" cy="460" r="9" class="lichen-spot" />
            <!-- Líquenes en la zona media expuesta al aire -->
            <circle cx="285" cy="390" r="16" class="lichen-spot" />
            <circle cx="275" cy="340" r="11" class="lichen-spot" />
            <!-- Líquenes colonizando las ramas -->
            <circle cx="210" cy="290" r="8" class="lichen-spot" />
            <circle cx="350" cy="265" r="12" class="lichen-spot" />
        </g>
    </svg>
    `;
}

container.innerHTML = buildTreeSVG();

// --- SISTEMA DE ACTUALIZACIÓN INTERACTIVO ---
let activeZone = "Prado";

function updateSimulation(zoneName) {
    activeZone = zoneName;
    const data = simulationData[zoneName];

    // 1. Sincronizar controles e inputs de la UI
    document.getElementById('slider-traffic').value = data.traffic;
    document.getElementById('val-traffic').innerText = data.trafficText;
    document.getElementById('val-fi').innerText = `${data.fi} / 20`;
    
    // Cambiar colores del texto de tránsito según riesgo
    const trafficElement = document.getElementById('val-traffic');
    if(zoneName === "Centro") trafficElement.className = "text-rose-500 font-bold animate-pulse";
    else if(zoneName === "Colon") trafficElement.className = "text-amber-400 font-bold";
    else trafficElement.className = "text-cyan-400 font-bold";

    // Barra de progreso fi
    const barFi = document.getElementById('bar-fi');
    barFi.style.width = `${(data.fi / 20) * 100}%`;
    if(data.fi <= 6) barFi.className = "h-full bg-gradient-to-r from-rose-600 to-red-500 rounded-full transition-all duration-500";
    else if(data.fi <= 12) barFi.className = "h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500";
    else barFi.className = "h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500";

    // 2. Cambiar la Ficha Biológica
    document.getElementById('lich-name').innerText = data.lichenName;
    document.getElementById('lich-desc').innerText = data.lichenDesc;
    
    const statusLabel = document.getElementById('lich-status');
    statusLabel.innerText = data.lichenStatus;
    if(zoneName === "Centro") statusLabel.className = "text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-block";
    else if(zoneName === "Colon") statusLabel.className = "text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block";
    else statusLabel.className = "text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block";

    document.getElementById('health-warning').innerText = data.health;
    document.getElementById('cortex-state').innerText = zoneName === "Centro" ? "Necrosis / Crítica" : (zoneName === "Colon" ? "Alterada" : "Estable / Limpia");
    document.getElementById('cortex-state').className = zoneName === "Centro" ? "text-rose-500 font-bold" : (zoneName === "Colon" ? "text-amber-400 font-bold" : "text-emerald-400 font-bold");

    // 3. MUTACIÓN DEL ÁRBOL EN TIEMPO REAL (Lógica SVG)
    document.getElementById('tree-trunk').setAttribute("fill", data.treeColor);
    document.getElementById('branch-left').setAttribute("fill", data.treeColor);
    document.getElementById('branch-right').setAttribute("fill", data.treeColor);

    // Cambiar opacidad y color de las hojas (Follaje marchito o ausente)
    const leaves = document.querySelectorAll('.tree-leaf');
    leaves.forEach(leaf => {
        leaf.setAttribute("fill", data.treeColor === "#475569" ? "#64748b" : (data.treeColor === "#f59e0b" ? "#b45309" : "#10b981"));
        leaf.setAttribute("fill-opacity", data.leafOpacity);
    });

    // Mutar los líquenes adheridos a la corteza
    const spots = document.querySelectorAll('.lichen-spot');
    spots.forEach(spot => {
        spot.setAttribute("fill", data.lichenColor);
        spot.setAttribute("fill-opacity", zoneName === "Centro" ? "0.4" : "0.85");
        // En el centro los líquenes se encogen drásticamente
        spot.setAttribute("stroke", zoneName === "Centro" ? "#475569" : "#ffffff");
        spot.setAttribute("stroke-width", zoneName === "Centro" ? "1" : "2");
    });

    // Cambiar atmósfera de humo/smog de fondo
    document.getElementById('pollution-cloud').style.background = `radial-gradient(circle, ${data.cloudColor} 0%, rgba(5,7,15,0) 70%)`;
}

// --- ESCUCHADORES DE CLIC EN LOS BOTONES DE BARRIO ---
document.querySelectorAll('.zone-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
        const button = e.currentTarget;
        button.classList.add('active');
        updateSimulation(button.getAttribute('data-zone'));
    });
});

// --- ENLAZAR EL SLIDER PARA DETECTAR CAMBIOS MANUALES ---
document.getElementById('slider-traffic').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    
    // Forzar cambios dinámicos según la posición libre del slider
    if (value < 35) {
        syncZoneUI('Prado');
    } else if (value < 75) {
        syncZoneUI('Colon');
    } else {
        syncZoneUI('Centro');
    }
    document.getElementById('slider-traffic').value = value; // Evita que se mueva el slider fijo
});

function syncZoneUI(zone) {
    document.querySelectorAll('.zone-btn').forEach(b => {
        if(b.getAttribute('data-zone') === zone) b.classList.add('active');
        else b.classList.remove('active');
    });
    updateSimulation(zone);
}

// Arrancar simulación por defecto en el Prado
updateSimulation("Prado");

