// --- CONFIGURACIÓN INICIAL DEL MAPA ---
// Centrado estratégicamente en Montevideo
const map = L.map('map').setView([-34.8850, -56.1650], 12);

// Capa de mapa urbana elegante (CartoDB Positron)
L.tileLayer('https://{s}://{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Variables de estado del mapa
let isAddMode = false;
let idCounter = 13; // Comienza posterior al conteo de árboles del PDF

// --- BASE DE DATOS INICIAL (DATOS EXTRAÍDOS DEL ANTEPROYECTO) ---
const markersData = [
    // ZONA CENTRO (Héctor Gutiérrez Ruiz y San José / Zelmar Michelini)
    { id: "CEN-01", lat: -34.9062, lng: -56.1884, lugar: "Héctor Gutiérrez Ruiz y San José", especie: "Plátano", fi: 11, zona: "Centro" },
    { id: "CEN-02", lat: -34.9064, lng: -56.1882, lugar: "Héctor Gutiérrez Ruiz y San José", especie: "Plátano", fi: 12, zona: "Centro" },
    { id: "CEN-03", lat: -34.9061, lng: -56.1886, lugar: "Héctor Gutiérrez Ruiz y San José", especie: "Plátano", fi: 11, zona: "Centro" },
    { id: "CEN-04", lat: -34.9075, lng: -56.1895, lugar: "Zelmar Michelini", especie: "Fresno", fi: 12, zona: "Centro" },
    { id: "CEN-05", lat: -34.9078, lng: -56.1893, lugar: "Zelmar Michelini", especie: "Paraíso", fi: 17, zona: "Centro" },
    { id: "CEN-06", lat: -34.9081, lng: -56.1891, lugar: "Zelmar Michelini", especie: "Fresno", fi: 6, zona: "Centro" },
    { id: "CEN-07", lat: -34.9084, lng: -56.1889, lugar: "Zelmar Michelini", especie: "Fresno", fi: 5, zona: "Centro" },
    { id: "CEN-10", lat: -34.9090, lng: -56.1883, lugar: "Zelmar Michelini", especie: "Paraíso", fi: 17, zona: "Centro" },
    { id: "CEN-11", lat: -34.9093, lng: -56.1880, lugar: "Zelmar Michelini", especie: "Fresno", fi: 15, zona: "Centro" },
    { id: "CEN-12", lat: -34.9096, lng: -56.1878, lugar: "Zelmar Michelini", especie: "Fresno", fi: 10, zona: "Centro" },

    // ZONA PRADO (Jardín Botánico / Senda Costanera / María E. Vaz Ferreira)
    { id: "PRA-01", lat: -34.8580, lng: -56.2052, lugar: "Jardín Botánico", especie: "Plátano", fi: 0, zona: "Prado" },
    { id: "PRA-02", lat: -34.8625, lng: -56.1989, lugar: "Av. Joaquín Suárez y Av. Millán", especie: "Plátano", fi: 12, zona: "Prado" },
    { id: "PRA-03", lat: -34.8565, lng: -56.2012, lugar: "Senda Costanera Jules Laforgue", especie: "Plátano", fi: 14, zona: "Prado" },
    { id: "PRA-04", lat: -34.8569, lng: -56.2015, lugar: "Senda Costanera Jules Laforgue", especie: "Ciprés pantanoso", fi: 20, zona: "Prado" },
    { id: "PRA-05", lat: -34.8572, lng: -56.2018, lugar: "Senda Costanera Jules Laforgue", especie: "Ciprés pantanoso", fi: 20, zona: "Prado" },
    { id: "PRA-11", lat: -34.8550, lng: -56.2030, lugar: "Avenida María E. Vaz Ferreira", especie: "Fresno", fi: 20, zona: "Prado" },
    { id: "PRA-12", lat: -34.8554, lng: -56.2034, lugar: "Avenida María E. Vaz Ferreira", especie: "Paraíso", fi: 10, zona: "Prado" }
];

// --- SISTEMA DE MAPEO DE COLORES SEGÚN FI (ALERTA AMBIENTAL) ---
function getColorByFi(fi) {
    if(fi <= 6) return '#ef4444';   // Rojo: Muy baja frecuencia (Aire crítico)
    if(fi <= 12) return '#f59e0b';  // Naranja: Frecuencia moderada (Intermedio)
    return '#10b981';               // Verde: Alta frecuencia (Aire limpio)
}

// --- FUNCIÓN PARA MOSTRAR DETALLES EN PANEL LATERAL ---
function selectTree(data) {
    document.getElementById('default-message').classList.add('hidden');
    const detailsElement = document.getElementById('tree-details');
    detailsElement.classList.remove('hidden');

    document.getElementById('detail-id').innerText = data.id;
    document.getElementById('detail-lugar').innerText = data.lugar;
    document.getElementById('detail-especie').innerText = data.especie;
    document.getElementById('detail-fi').innerText = data.fi;

    const badge = document.getElementById('badge-zona');
    badge.innerText = data.zona;
    
    // Asignación de estilos dinámicos del Badge y del número de frecuencia por Zona
    if(data.zona === "Centro") {
        badge.className = "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-700";
        document.getElementById('detail-fi').className = "text-3xl font-extrabold text-red-500";
    } else if(data.zona === "Prado") {
        badge.className = "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700";
        document.getElementById('detail-fi').className = "text-3xl font-extrabold text-emerald-500";
    } else {
        badge.className = "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-700";
        document.getElementById('detail-fi').className = "text-3xl font-extrabold text-amber-500";
    }
}

// --- FUNCIÓN PARA CREAR Y AGREGAR MARCADORES ---
function createMarker(data) {
    const markerColor = getColorByFi(data.fi);
    
    // Estilo inyectado con clases nativas y CSS personalizado
    const customIcon = L.divIcon({
        html: `<div class="custom-marker-circle" style="background-color: ${markerColor};"></div>`,
        className: 'custom-marker-icon-container',
        iconSize:,
        iconAnchor: [8, 8]
    });

    const marker = L.marker([data.lat, data.lng], { icon: customIcon }).addTo(map);
    
    // Popup básico en el mapa
    marker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 2px;">
            <strong style="color: #1e293b; font-size: 13px;">${data.id}</strong><br>
            <span style="color: #64748b; font-size: 11px;">${data.especie} (fi: ${data.fi})</span>
        </div>
    `);

    // Evento al hacer clic en el marcador
    marker.on('click', () => {
        selectTree(data);
    });
}

// Inicializar la carga de los marcadores por defecto
markersData.forEach(tree => createMarker(tree));

// --- MANEJO DEL MODO RELEVAMIENTO (AGREGAR NUEVO ÁRBOL) ---
const btnAddMode = document.getElementById('btn-add-mode');
const addText = document.getElementById('add-text');
const addIcon = document.getElementById('add-icon');

btnAddMode.addEventListener('click', () => {
    isAddMode = !isAddMode;
    if(isAddMode) {
        map.getContainer().style.cursor = 'crosshair';
        btnAddMode.className = "w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2";
        addText.innerText = "Cancelar Selección (Hacer clic en mapa)";
        addIcon.innerText = "❌";
    } else {
        resetAddMode();
    }
});

function resetAddMode() {
    isAddMode = false;
    map.getContainer().style.cursor = '';
    btnAddMode.className = "w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2";
    addText.innerText = "Registrar Árbol en el Mapa";
    addIcon.innerText = "📍";
}

// --- CAPTURA DE UBICACIÓN EN EL MAPA ---
map.on('click', function(e) {
    if (!isAddMode) return;

    // Cuadros de diálogo secuenciales
    const especieInput = prompt("Ingrese la Especie del Árbol (ej. Plátano, Fresno, Paraíso, Ciprés):", "Fresno");
    if (!especieInput) { resetAddMode(); return; }

    const fiInput = prompt("Ingrese el índice de frecuencia fi hallado (0 a 20):", "12");
    if (fiInput === null) { resetAddMode(); return; }
    const fiValue = parseInt(fiInput) || 0;

    const zonaInput = prompt("Ingrese la Zona/Barrio (Centro, Colón o Prado):", "Colón");
    if (!zonaInput) { resetAddMode(); return; }

    // Estructuración del objeto para la nueva estación
    const newTree = {
        id: `${zonaInput.substring(0,3).toUpperCase()}-${idCounter++}`,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        lugar: `Coordenadas: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`,
        especie: especieInput,
        fi: fiValue,
        zona: zonaInput.charAt(0).toUpperCase() + zonaInput.slice(1).toLowerCase()
    };

    // Creación y renderizado dinámico
    createMarker(newTree);
    selectTree(newTree);
    resetAddMode();
});
