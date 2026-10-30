// --- DATOS VERÍDICOS EXTRAÍDOS DE LAS PÁGINAS DE TU PDF ---
const realPDFData = {
    Centro: {
        name: "Physcia urbana / Physcia adscendens",
        biotype: "Líquenes Tolerantes (Foco Centro)",
        desc: "Talos foliáceos de color gris claro o ceniza. Crecen pegados a la corteza en zonas con alto tráfico vehicular y depósitos de nitrógeno de los escapes en Zelmar Michelini.",
        fi: 12, // Tomamos de ejemplo la estación de Zelmar Michelini con fi:12
        tree: "Fresno (Fraxinus)",
        cortexClass: "cortex-centro",
        blobColor: "#cbd5e1", // Gris ceniza claro real del catálogo
        // Cuadrantes fijos donde aparece el liquen en la rejilla de 40 celdas
        occupiedCells:,
        isCritical: true
    },
    Prado: {
        name: "Flavoparmelia caperata / Ramalina celastri",
        biotype: "Líquenes Intermedios/Sensibles (Foco Prado)",
        desc: "Foliáceo grande de color verde-amarillento y fruticulosos tipo cintas colgantes. Abundantes en áreas limpias como la Senda Costanera del Prado.",
        fi: 20, // Estación real con fi:20 del ciprés pantanoso del PDF
        tree: "Ciprés Pantanoso",
        cortexClass: "cortex-prado",
        blobColor: "#a7f3d0", // Verde-amarillento brillante del catálogo
        occupiedCells:,
        isCritical: false
    }
};

const gridContainer = document.getElementById('sampling-grid');
const coloniesLayer = document.getElementById('lichen-colonies-layer');
const barkBg = document.getElementById('tree-bark-bg');

// --- DIBUJAR LA REJILLA DE 40 CUADRANTES ---
function buildGrid() {
    gridContainer.innerHTML = "";
    for (let i = 0; i < 40; i++) {
        const cell = document.createElement('div');
        cell.className = "grid-cell";
        cell.setAttribute('data-index', i);
        gridContainer.appendChild(cell);
    }
}

// --- RENDERIZAR LAS COLONIAS DE LÍQUENES SOBRE EL TRONCO ---
function renderLichenBlobs(cells, color) {
    coloniesLayer.innerHTML = ""; // Limpiar tronco
    
    cells.forEach(cellIndex => {
        // Encontrar la posición física aproximada de la celda para dibujar el líquen abajo
        const cell = gridContainer.children[cellIndex];
        if (!cell) return;
        
        const blob = document.createElement('div');
        blob.className = "lichen-blob";
        
        // Ajustar el tamaño para que desborde de forma realista sobre la corteza
        blob.style.width = "45px";
        blob.style.height = "35px";
        blob.style.backgroundColor = color;
        
        // Posicionar relativamente respecto al cuadrante
        const row = Math.floor(cellIndex / 4);
        const col = cellIndex % 4;
        
        blob.style.top = `${row * 10 + 2}%`;
        blob.style.left = `${col * 25 + 2}%`;
        
        coloniesLayer.appendChild(blob);
    });
}

// --- ACTUALIZAR LA SIMULACIÓN CON LOS DATOS REALES ---
function updateGridInspection(zone) {
    const data = realPDFData[zone];

    // 1. Cargar textos técnicos de la investigación
    document.getElementById('comp-name').innerText = data.name;
    document.getElementById('comp-biotype').innerText = data.biotype;
    document.getElementById('comp-desc').innerText = data.desc;
    document.getElementById('comp-fi').innerText = `${data.fi} subcuadrantes`;
    document.getElementById('comp-tree').innerText = data.tree;

    // Ajustar color del biotipo
    const biotypeLabel = document.getElementById('comp-biotype');
    if(data.isCritical) biotypeLabel.className = "text-[10px] font-mono bg-red-500/10 text-red-400 px-2 py-1 rounded-md uppercase tracking-wider";
    else biotypeLabel.className = "text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md uppercase tracking-wider";

    // 2. Cambiar la textura e iluminación de la corteza
    barkBg.className = `absolute inset-0 transition-all duration-700 ${data.cortexClass}`;

    // 3. Pintar líquenes biológicos en el fondo
    renderLichenBlobs(data.occupiedCells, data.blobColor);

    // 4. Resetear e iluminar los hilos de la rejilla según los datos del PDF
    buildGrid();
    
    // Iluminar automáticamente los cuadrantes donde tu investigación contó líquenes
    data.occupiedCells.forEach(index => {
        const cell = gridContainer.children[index];
        if(cell) {
            cell.classList.add(data.isCritical ? 'contains-lichen-critical' : 'contains-lichen');
        }
    });

    // Actualizar el marcador numérico inferior
    document.getElementById('active-squares').innerText = data.occupiedCells.length;
}

// --- ESCUCHADORES DE CLIC EN LOS BOTONES DE LABORATORIO ---
document.querySelectorAll('.zone-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = e.currentTarget;
        activeBtn.classList.add('active');
        updateGridInspection(activeBtn.getAttribute('data-zone'));
    });
});

// Inicializar la cuadrícula directo con los datos críticos del Centro de tu PDF
updateGridInspection("Centro");

