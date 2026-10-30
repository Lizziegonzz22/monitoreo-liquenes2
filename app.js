// --- CENTRAL DE DATOS EXTRAÍDOS DEL ANTEPROYECTO DEL LICEO ---
const dataset = {
    Centro: {
        tree: "Fresno (Fraxinus)",
        fi: "12 Subcuadrantes",
        purity: "CRÍTICA (Efecto Cañón)",
        purityClass: "text-red",
        biotype: "Biotipo Crustoso / Tolerante",
        biotypeClass: "badge-red",
        name: "Physcia urbana / adscendens",
        desc: "Talos foliáceos de color gris claro o ceniza. Crecen pegados a la corteza en zonas con alto tráfico vehicular en Zelmar Michelini. Absorben contaminación continua sin morir por inanición.",
        health: "Alerta Crítica: El estancamiento de gases por la densidad edilicia del Centro eleva riesgos de asma y daños pulmonares severos.",
        healthClass: "alert-red",
        healthIcon: "☣",
        lensTexture: "texture-centro",
        blobColor: "rgba(148, 163, 184, 0.85)", // Gris ceniza del catálogo
        cells: [1, 2, 5, 6, 9, 10, 14, 15, 21, 22, 33, 34] // Coordenadas del PDF
    },
    Prado: {
        tree: "Ciprés Pantanoso",
        fi: "20 Subcuadrantes (Máximo)",
        purity: "ÓPTIMA (Foco de Control)",
        purityClass: "text-green",
        biotype: "Biotipo Fruticuloso / Sensible",
        biotypeClass: "badge-green",
        name: "Flavoparmelia / Ramalina celastri",
        desc: "Foliáceos grandes verde-amarillentos y ramificaciones colgantes tipo cintas. Exigen aire marcadamente limpio, por lo que tapizan por completo los árboles de la Senda Costanera del Prado.",
        health: "Entorno Seguro: Atmósfera oxigenada gracias a las extensas áreas verdes del Prado, actuando como amortiguadores ambientales eficientes.",
        healthClass: "alert-green",
        healthIcon: "🌿",
        lensTexture: "texture-prado",
        blobColor: "rgba(52, 211, 153, 0.9)", // Verde esmeralda neón del catálogo
        cells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19] // Tapizado completo
    }
};

const gridElement = document.getElementById('hologram-grid');
const blobsContainer = document.getElementById('lichen-blobs-layer');
const lensElement = document.getElementById('microscope-lens');

// Generar celdas transparentes fijas
function buildGridStructure() {
    gridElement.innerHTML = "";
    for (let i = 0; i < 40; i++) {
        const cell = document.createElement('div');
        cell.className = "grid-cell";
        gridElement.appendChild(cell);
    }
}

// Cambiar de estación analizada
function switchLaboratoryMode(zone) {
    // Alternar clases activas de los botones de la interfaz
    document.getElementById('btn-centro').classList.remove('active');
    document.getElementById('btn-prado').classList.remove('active');
    
    if (zone === 'Centro') {
        document.getElementById('btn-centro').classList.add('active');
    } else {
        document.getElementById('btn-prado').classList.add('active');
    }

    const data = dataset[zone];

    // Cargar textos en los paneles correspondientes
    document.getElementById('data-tree').innerText = data.tree;
    document.getElementById('data-fi').innerText = data.fi;
    
    const purity = document.getElementById('data-purity');
    purity.innerText = data.purity;
    purity.className = `value ${data.purityClass}`;

    document.getElementById('data-name').innerText = data.name;
    document.getElementById('data-desc').innerText = data.desc;
    document.getElementById('data-health').innerText = data.health;

    const biotype = document.getElementById('data-biotype');
    biotype.innerText = data.biotype;
    biotype.className = `badge-tag ${data.biotypeClass}`;

    const healthCard = document.getElementById('health-card');
    healthCard.className = `panel-section alert-card ${data.healthClass}`;
    healthCard.querySelector('.alert-icon').innerText = data.healthIcon;

    // Cambiar la textura de fondo de la corteza
    lensElement.className = `lens-viewport ${data.lensTexture}`;

    // Limpiar visor y reconstruir rejilla
    blobsContainer.innerHTML = "";
    buildGridStructure();

    // Dibujar líquenes reales y encender hilos de luz de la rejilla
    data.cells.forEach(index => {
        const cell = gridElement.children[index];
        if (!cell) return;

        cell.classList.add(zone === 'Centro' ? 'glow-red' : 'glow-green');

        const blob = document.createElement('div');
        blob.className = "organic-blob";
        blob.style.backgroundColor = data.blobColor;
        blob.style.boxShadow = `0 0 15px ${data.blobColor}`;
        
        // Distribución matemática en base al cuadrante real
        const row = Math.floor(index / 4);
        const col = index % 4;
        blob.style.top = `${row * 10 + 1}%`;
        blob.style.left = `${col * 25 + 2}%`;

        blobsContainer.appendChild(blob);
    });
}

// Configurar los escuchadores de eventos al cargar el script
document.getElementById('btn-centro').addEventListener('click', () => switchLaboratoryMode('Centro'));
document.getElementById('btn-prado').addEventListener('click', () => switchLaboratoryMode('Prado'));

// Arrancar por defecto en el estado crítico del Centro
switchLaboratoryMode('Centro');

