// --- CONFIGURACIÓN BASE DEL MAPA VECTORIAL INTEGRADO ---
const container = document.getElementById('canvas-container');

// Creamos un escenario matemático SVG autogestionado de 1000x800 píxeles
const viewBoxWidth = 1000;
const viewBoxHeight = 800;

const svgHTML = `
<svg id="montevideo-vector-map" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" xmlns="http://w3.org">
    <!-- Rejilla de Fondo Científica -->
    <g class="map-grid">
        ${Array.from({length: 20}, (_, i) => `<line x1="${i*50}" y1="0" x2="${i*50}" y2="${viewBoxHeight}" />`).join('')}
        ${Array.from({length: 16}, (_, i) => `<line x1="0" y1="${i*50}" x2="${viewBoxWidth}" y2="${i*50}" />`).join('')}
    </g>

    <!-- Geometría Abstracta de la Costa de Montevideo y Bahía -->
    <path d="M 0,650 Q 200,630 350,680 T 550,620 Q 580,500 680,520 T 800,600 Q 900,630 1000,600 L 1000,800 L 0,800 Z" fill="#131c33" opacity="0.6"/>
    <path d="M 0,650 Q 200,630 350,680 T 550,620 Q 580,500 680,520 T 800,600 Q 900,630 1000,600" fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.4"/>

    <!-- Polígonos de los Límites de los Tres Barrios de Estudio -->
    <!-- BARRIO PRADO -->
    <polygon points="380,320 540,280 500,450 360,420" fill="#10b981" opacity="0.08" stroke="#10b981" stroke-width="1" stroke-dasharray="3,3"/>
    <text x="410" y="310" fill="#10b981" font-size="11" font-family="monospace" opacity="0.6" tracking-widest>ZONA_PRADO [Bajo Impacto]</text>

    <!-- BARRIO COLÓN -->
    <polygon points="180,120 380,100 340,260 160,240" fill="#f59e0b" opacity="0.06" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3"/>
    <text x="200" y="115" fill="#f59e0b" font-size="11" font-family="monospace" opacity="0.6" tracking-widest>ZONA_COLÓN [Intermedio]</text>

    <!-- BARRIO CENTRO -->
    <polygon points="560,510 720,490 750,610 590,620" fill="#ef4444" opacity="0.08" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3"/>
    <text x="610" y="505" fill="#ef4444" font-size="11" font-family="monospace" opacity="0.6" tracking-widest>ZONA_CENTRO [Crítico]</text>

    <!-- Red de Avenidas Principales Dibujadas Matemáticamente -->
    <path d="M 260,100 L 440,360 L 640,560" fill="none" stroke="#334155" stroke-width="2" id="av-garzon-ancap"/>
    <path d="M 440,360 L 660,370" fill="none" stroke="#334155" stroke-width="1.5"/>

    <!-- Grupo donde se inyectarán los árboles recolectados -->
    <g id="nodes-group"></g>
</svg>
`;

container.innerHTML = svgHTML;
const nodesGroup = document.getElementById('nodes-group');
const svgElement = document.getElementById('montevideo-vector-map');

let isAddMode = false;
let idCounter = 13;

// --- BASE DE DATOS LOCALES EXTRAÍDA DE TU INVESTIGACIÓN ---
const markersData = [
    // Centro (Héctor Gutiérrez Ruiz y San José / Zelmar Michelini)
    { id: "CEN-01", x: 620, y: 540, lugar: "Héctor Gutiérrez Ruiz y San José", especie: "Plátano", fi: 11, zona: "Centro" },
    { id: "CEN-02", x: 635, y: 545, lugar: "Héctor Gutiérrez Ruiz y San José", especie: "Plátano", fi: 12, zona: "Centro" },
    { id: "CEN-03", x: 610, y: 550, lugar: "Héctor Gutiérrez Ruiz y San José", especie: "Plátano", fi: 11, zona: "Centro" },
    { id: "CEN-04", x: 660, y: 570, lugar: "Zelmar Michelini", especie: "Fresno", fi: 12, zona: "Centro" },
    { id: "CEN-05", x: 670, y: 575, lugar: "Zelmar Michelini", especie: "Paraíso", fi: 17, zona: "Centro" },
    { id: "CEN-06", x: 680, y: 580, lugar: "Zelmar Michelini", especie: "Fresno", fi: 6, zona: "Centro" },
    { id: "CEN-07", x: 690, y: 585, lugar: "Zelmar Michelini", especie: "Fresno", fi: 5, zona: "Centro" },
    { id: "CEN-10", x: 700, y: 590, lugar: "Zelmar Michelini", especie: "Paraíso", fi: 17, zona: "Centro" },

    // Prado (Jardín Botánico / Senda Costanera Jules Laforgue)
    { id: "PRA-01", x: 420, y: 350, lugar: "Jardín Botánico", especie: "Plátano", fi: 0, zona: "Prado" },
    { id: "PRA-02", x: 460, y: 340, lugar: "Av. Joaquín Suárez y Av. Millán", especie: "Plátano", fi: 12, zona: "Prado" },
    { id: "PRA-03", x: 430, y: 390, lugar: "Senda Costanera Jules Laforgue", especie: "Plátano", fi: 14, zona: "Prado" },
    { id: "PRA-04", x: 440, y: 395, lugar: "Senda Costanera Jules Laforgue", especie: "Ciprés pantanoso", fi: 20, zona: "Prado" },
    { id: "PRA-05", x: 450, y: 400, lugar: "Senda Costanera Jules Laforgue", especie: "Ciprés pantanoso", fi: 20, zona: "Prado" },
    { id: "PRA-11", x: 480, y: 370, lugar: "Avenida María E. Vaz Ferreira", especie: "Fresno", fi: 20, zona: "Prado" }
];

function getColorByFi(fi) {
    if(fi <= 6) return '#ef4444';   // Crítico
    if(fi <= 12) return '#f59e0b';  // Moderado
    return '#10b981';               // Óptimo
}

// --- RENDERIZAR UN NODO DENTRO DEL CONTENEDOR VECTORIAL ---
function renderNode(data) {
    const color = getColorByFi(data.fi);
    
    // Creamos elementos SVG dinámicamente usando el namespace adecuado
    const g = document.createElementNS("http://w3.org", "g");
    g.setAttribute("class", "tree-node");
    g.setAttribute("style", `color: ${color}; transform-origin: ${data.x}px ${data.y}px;`);

    // Anillo de brillo exterior para nodos limpios
    if(data.fi > 12) {
        const pulse = document.createElementNS("http://w3.org", "circle");
        pulse.setAttribute("cx", data.x);
        pulse.setAttribute("cy", data.y);
        pulse.setAttribute("r", 12);
        pulse.setAttribute("fill", color);
        pulse.setAttribute("opacity", "0.2");
        g.appendChild(pulse);
    }

    const circle = document.createElementNS("http://w3.org", "circle");
    circle.setAttribute("cx", data.x);
    circle.setAttribute("cy", data.y);
    circle.setAttribute("r", 7);
    circle.setAttribute("fill", color);
    circle.setAttribute("stroke", "#ffffff");
    circle.setAttribute("stroke-width", "2");

    g.appendChild(circle);
    nodesGroup.appendChild(g);

    g.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita interferir con el clic de inserción de fondo
        selectNode(data);
    });
}

function selectNode(data) {
    document.getElementById('default-message').classList.add('hidden');
    const details = document.getElementById('tree-details');
    details.classList.remove('hidden');

    document.getElementById('detail-id').innerText = data.id;
    document.getElementById('detail-lugar').innerText = data.lugar;
    document.getElementById('detail-especie').innerText = data.especie;
    document.getElementById('detail-fi').innerText = data.fi;

    const badge = document.getElementById('badge-zona');
    badge.innerText = data.zona;

    if(data.zona === "Centro") {
        badge.className = "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30";
        document.getElementById('detail-fi').className = "text-3xl font-black font-mono text-red-500";
    } else if(data.zona === "Prado") {
        badge.className = "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        document.getElementById('detail-fi').className = "text-3xl font-black font-mono text-emerald-500";
    } else {
        badge.className = "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30";
        document.getElementById('detail-fi').className = "text-3xl font-black font-mono text-amber-500";
    }
}

// Cargar catálogo inicial
markersData.forEach(node => renderNode(node));

// --- MANEJO DE REGISTRO ACTIVO ---
const btnAddMode = document.getElementById('btn-add-mode');
const addText = document.getElementById('add-text');
const addIcon = document.getElementById('add-icon');

btnAddMode.addEventListener('click', () => {
    isAddMode = !isAddMode;
    if(isAddMode) {
        svgElement.classList.add('capturing-mode');
        btnAddMode.className = "w-full bg-rose-600 hover:bg-rose-500 text-white py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2";
        addText.innerText = "Abortar Escaneo del Sensor";
        addIcon.innerText = "⚡";
    } else {
        resetAddMode();
    }
});

function resetAddMode() {
    isAddMode = false;
    svgElement.classList.remove('capturing-mode');
    btnAddMode.className = "w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2";
    addText.innerText = "Activar Sensor de Registro";
    addIcon.innerText = "⚡";
}

// Interceptar clics dentro del SVG para mapear coordenadas matriciales exactas
svgElement.addEventListener('click', function(e) {
    if (!isAddMode) return;

    // Calcular las coordenadas exactas escaladas respecto al espacio vectorial 1000x800
    const rect = svgElement.getBoundingClientRect();
    const xVector = ((e.clientX - rect.left) / rect.width) * viewBoxWidth;
    const yVector = ((e.clientY - rect.top) / rect.height) * viewBoxHeight;

    const especie = prompt("Especie del Árbol encontrado (Plátano, Fresno, Paraíso, etc.):", "Plátano");
    if (!especie) { resetAddMode(); return; }

    const fiInput = prompt("Valor de Frecuencia de líquenes hallado (fi de 0 a 20):", "14");
    if (fiInput === null) { resetAddMode(); return; }
    const fi = parseInt(fiInput) || 0;

    const zona = prompt("Barrio donde se encuentra (Centro, Prado, Colón):", "Colón");
    if (!zona) { resetAddMode(); return; }

    const newNode = {
        id: `${zona.substring(0,3).toUpperCase()}-${idCounter++}`,
        x: Math.round(xVector),
        y: Math.round(yVector),
        lugar: `Matriz SVG Vectorial [X: ${Math.round(xVector)}, Y: ${Math.round(yVector)}]`,
        especie: especie,
        fi: fi,
        zona: zona.charAt(0).toUpperCase() + 
            zona.slice(1).toLowerCase()
    };
    
    renderNode(newNode);
    selectNode(newNode);
    resetAddMode();
});
        

