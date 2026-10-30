const wrapper = document.getElementById('map-wrapper');

// Dimensiones de la rejilla esquemática
const w = 1000;
const h = 800;

// Construcción del plano interactivo y visual de Montevideo
const svgMap = `
<svg id="mvd-interactive-map" viewBox="0 0 ${w} ${h}" xmlns="http://w3.org" class="w-full h-full">
    <defs>
        <!-- Gradientes Estéticos para el Agua y Fondos -->
        <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0a0f1d" />
            <stop offset="100%" stop-color="#070a14" />
        </linearGradient>
        <linearGradient id="coastGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e293b" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.1"/>
        </linearGradient>
    </defs>

    <!-- Líneas de fondo tecnológicas (Grid) -->
    <g stroke="#1e293b" stroke-width="0.5" stroke-dasharray="5,5" opacity="0.4">
        ${Array.from({length: 20}, (_, i) => `<line x1="${i*50}" y1="0" x2="${i*50}" y2="${h}" />`).join('')}
        ${Array.from({length: 16}, (_, i) => `<line x1="0" y1="${i*50}" x2="${w}" y2="${i*50}" />`).join('')}
    </g>

    <!-- Río de la Plata y Bahía de Montevideo -->
    <path d="M 0,600 Q 250,560 400,640 T 600,550 Q 620,400 750,420 T 900,520 Q 950,550 1000,520 L 1000,800 L 0,800 Z" fill="url(#waterGrad)"/>
    <path d="M 0,600 Q 250,560 400,640 T 600,550 Q 620,400 750,420 T 900,520 Q 950,550 1000,520" fill="none" stroke="#0ea5e9" stroke-width="3" opacity="0.5"/>

    <!-- ÁREAS RELEVADAS CON ESTILO DE INTERFAZ CIENTÍFICA -->
    <!-- COLÓN (Área Naranja) -->
    <polygon points="150,150 400,120 370,320 120,350" fill="#f59e0b" fill-opacity="0.04" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,4" class="zone-poly"/>
    <text x="140" y="145" fill="#f59e0b" font-family="JetBrains Mono" font-size="12" font-weight="bold" tracking-wider opacity="0.7">📍 ZONA COLÓN [INTERMEDIO]</text>

    <!-- PRADO (Área Verde) -->
    <polygon points="420,300 620,250 580,480 380,520" fill="#10b981" fill-opacity="0.04" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,4" class="zone-poly"/>
    <text x="410" y="290" fill="#10b981" font-family="JetBrains Mono" font-size="12" font-weight="bold" tracking-wider opacity="0.7">📍 ZONA PRADO [CONTROL]</text>

    <!-- CENTRO (Área Roja) -->
    <polygon points="630,500 850,470 880,650 660,680" fill="#ef4444" fill-opacity="0.04" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,4" class="zone-poly"/>
    <text x="640" y="490" fill="#ef4444" font-family="JetBrains Mono" font-size="12" font-weight="bold" tracking-wider opacity="0.7">📍 ZONA CENTRO [CRÍTICO]</text>

    <!-- Ejes de Avenidas Estilizadas -->
    <path d="M 220,130 Q 420,280 750,560" fill="none" stroke="#334155" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    <path d="M 480,270 L 760,260" fill="none" stroke="#334155" stroke-width="2" stroke-linecap="round" opacity="0.4"/>

    <!-- Contenedor dinámico de Nodos -->
    <g id="nodes-container"></g>
</svg>
`;

wrapper.innerHTML = svgMap;
const nodesContainer = document.getElementById('nodes-container');
const svgEl = document.getElementById('mvd-interactive-map');

let isAddMode = false;
let idCounter = 13;

// --- REGISTROS REALES DEL TRABAJO DE CAMPO DE TU ANTEPROYECTO ---
const initialTrees = [
    // Centro
    { id: "CEN-01", x: 670, y: 530, lugar: "Héctor Gutiérrez Ruiz y San José", especie: "Plátano", fi: 11, zona: "Centro" },
    { id: "CEN-02", x: 690, y: 540, lugar: "Héctor Gutiérrez Ruiz y San José", especie: "Plátano", fi: 12, zona: "Centro" },
    { id: "CEN-03", x: 660, y: 550, lugar: "Héctor Gutiérrez Ruiz y San José", especie: "Plátano", fi: 11, zona: "Centro" },
    { id: "CEN-04", x: 720, y: 570, lugar: "Zelmar Michelini", especie: "Fresno", fi: 12, zona: "Centro" },
    { id: "CEN-05", x: 735, y: 580, lugar: "Zelmar Michelini", especie: "Paraíso", fi: 17, zona: "Centro" },
    { id: "CEN-06", x: 750, y: 590, lugar: "Zelmar Michelini", especie: "Fresno", fi: 6, zona: "Centro" },
    { id: "CEN-07", x: 765, y: 600, lugar: "Zelmar Michelini", especie: "Fresno", fi: 5, zona: "Centro" },
    { id: "CEN-10", x: 780, y: 610, lugar: "Zelmar Michelini", especie: "Paraíso", fi: 17, zona: "Centro" },

    // Prado
    { id: "PRA-01", x: 450, y: 350, lugar: "Jardín Botánico", especie: "Plátano", fi: 0, zona: "Prado" },
    { id: "PRA-02", x: 500, y: 330, lugar: "Av. Joaquín Suárez y Av. Millán", especie: "Plátano", fi: 12, zona: "Prado" },
    { id: "PRA-03", x: 470, y: 410, lugar: "Senda Costanera Jules Laforgue", especie: "Plátano", fi: 14, zona: "Prado" },
    { id: "PRA-04", x: 485, y: 420, lugar: "Senda Costanera Jules Laforgue", especie: "Ciprés pantanoso", fi: 20, zona: "Prado" },
    { id: "PRA-05", x: 500, y: 430, lugar: "Senda Costanera Jules Laforgue", especie: "Ciprés pantanoso", fi: 20, zona: "Prado" },
    { id: "PRA-11", x: 540, y: 390, lugar: "Avenida María E. Vaz Ferreira", especie: "Fresno", fi: 20, zona: "Prado" }
];

function getColor(fi) {
    if(fi <= 6) return '#ef4444'; // Rojo neón
    if(fi <= 12) return '#f59e0b'; // Ámbar
    return '#10b981'; // Esmeralda
}

function drawNode(data) {
    const color = getColor(data.fi);
    const g = document.createElementNS("http://w3.org", "g");
    g.setAttribute("class", "map-node");
    g.setAttribute("style", `color: ${color}; transform-origin: ${data.x}px ${data.y}px;`);

    // Anillo luminoso exterior (Halo)
    const halo = document.createElementNS("http://w3.org", "circle");
    halo.setAttribute("cx", data.x);
    halo.setAttribute("cy", data.y);
    halo.setAttribute("r", data.fi > 12 ? 15 : 10);
    halo.setAttribute("fill", color);
    halo.setAttribute("opacity", data.fi > 12 ? "0.2" : "0.1");
    g.appendChild(halo);

    // Núcleo del marcador
    const core = document.createElementNS("http://w3.org", "circle");
    core.setAttribute("cx", data.x);
    core.setAttribute("cy", data.y);
    core.setAttribute("r", 6);
    core.setAttribute("fill", color);
    core.setAttribute("stroke", "#ffffff");
    core.setAttribute("stroke-width", "2");
    g.appendChild(core);

    nodesContainer.appendChild(g);

    g.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetails(data);
    });
}

function openDetails(data) {
    document.getElementById('default-message').classList.add('hidden');
    const panel = document.getElementById('tree-details');
    panel.classList.remove('hidden');

    document.getElementById('detail-id').innerText = data.id;
    document.getElementById('detail-lugar').innerText = `📍 ${data.lugar}`;
    document.getElementById('detail-especie').innerText = data.especie;
    document.getElementById('detail-fi').innerText = data.fi;

    const badge = document.getElementById('badge-zona');
    badge.innerText = data.zona;

    // Colores dinámicos del panel según zona
    if(data.zona === "Centro") {
        badge.className = "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono";
        document.getElementById('detail-fi').className = "text-4xl font-black font-mono text-rose-500";
    } else if(data.zona === "Prado") {
        badge.className = "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono";
        document.getElementById('detail-fi').className = "text-4xl font-black font-mono text-emerald-400";
    } else {
        badge.className = "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono";
        document.getElementById('detail-fi').className = "text-4xl font-black font-mono text-amber-400";
    }
}

// Dibujar árboles iniciales y actualizar contador
initialTrees.forEach(t => drawNode(t));
document.getElementById('stats-count').innerText = initialTrees.length;

// --- LÓGICA DE AGREGAR PUNTO ---
const btn = document.getElementById('btn-add-mode');
const txt = document.getElementById('add-text');
const icon = document.getElementById('add-icon');

btn.addEventListener('click', () => {
    isAddMode = !isAddMode;
    if(isAddMode) {
        svgEl.classList.add('capture-active');
        btn.className = "w-full bg-gradient-to-r from-rose-500 to-red-500 text-white py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 border border-rose-400/20";
        txt.innerText = "Cancelar Registro Activo";
        icon.innerText = "❌";
    } else {
        cancelAddMode();
    }
});

function cancelAddMode() {
    isAddMode = false;
    svgEl.classList.remove('capture-active');
    btn.className = "w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 border border-emerald-400/20";
    txt.innerText = "Registrar Nueva Estación";
    icon.innerText = "📍";
}

svgEl.addEventListener('click', function(e) {
    if (!isAddMode) return;

    const bounds = svgEl.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) / bounds.width) * w;
    const y = ((e.clientY - bounds.top) / bounds.height) * h;

    const esp = prompt("Especie del Árbol (Plátano, Fresno, Paraíso, etc.):", "Plátano");
    if (!esp) { cancelAddMode(); return; }

    const fiVal = prompt("Frecuencia liquénica hallada (fi de 0 a 20):", "15");
    if (fiVal === null) { cancelAddMode(); return; }
    const fi = parseInt(fiVal) || 0;

    const bar = prompt("Barrio/Zona (Centro, Prado, Colón):", "Colón");
    if (!bar) { cancelAddMode(); return; }

    const newTree = {
        id: 
            ${bar.substring(0,3).toUpperCase()}-${idCounter+
        +},
    x: Math.round(x),
        y: Math.round(y),
        lugar: Coordenadas Plano: [X: ${Math.round(x)}, Y: 
    ${Math.round(y)}],
especie: esp,
fi: fi,
zona: bar.charAt(0).toUpperCase() + 
    bar.slice(1).toLowerCase()
};
initialTrees.push(newTree);
drawNode(newTree);
openDetails(newTree);
document.getElementById('stats-count').innerText = initialTrees.length;
cancelAddMode();
});
        
