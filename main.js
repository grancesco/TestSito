import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Creazione scena, camera e renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Funzione per generare un colore random
const getRandomColor = () => {
    return new THREE.Color(Math.random(), Math.random(), Math.random());
};

// Funzione per creare una stanza ottagonale
const createOctagonRoom = () => {
    const radius = 5;
    const height = 3;

    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const geometry = new THREE.PlaneGeometry(radius * 1.5, height);
        const material = new THREE.MeshBasicMaterial({ color: getRandomColor(), side: THREE.DoubleSide }); // Colore random per ogni parete
        const wall = new THREE.Mesh(geometry, material);
        
        wall.position.set(x, height / 2, z);
        wall.lookAt(0, height / 2, 0);
        
        scene.add(wall);

        // Aggiungi una proprietà per distinguere le pareti (non devono ruotare)
        wall.name = `wall_${i}`;
    }
};

// Aggiunta delle pareti con colori differenti
createOctagonRoom();

// Pavimento con colore fisso
const floorGeometry = new THREE.CircleGeometry(5, 8);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Aggiungi il controllo della telecamera in prima persona (PointerLockControls)
const controls = new PointerLockControls(camera, renderer.domElement);

// Eventi per iniziare il controllo della telecamera
document.body.addEventListener('click', () => {
    controls.lock();
});

// Configurazione della telecamera prima persona
camera.position.set(0, 1.5, 0);  // Posizionare la camera all'interno della stanza, all'altezza di 1.5m

// Variabili per il raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;  // L'oggetto attualmente selezionato (cliccato)

// Aggiungi oggetti 3D (cubi) agli angoli della stanza con una posizione più centrale e colori differenti
const addObjectsInCorners = () => {
    const radius = 3;  // Riduci il raggio per centralizzare meglio gli oggetti nella stanza

    // Crea 8 cubi, uno per ogni angolo dell'ottagono
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x = Math.cos(angle) * radius;  // Posizione x in base all'angolo e al raggio
        const z = Math.sin(angle) * radius;  // Posizione z in base all'angolo e al raggio

        // Geometria del cubo
        const geometry = new THREE.BoxGeometry(1, 1, 1); // Cubo 1x1x1
        const material = new THREE.MeshBasicMaterial({ color: getRandomColor() }); // Colore random per ogni cubo
        const cube = new THREE.Mesh(geometry, material);

        // Posiziona il cubo più centralmente rispetto alla stanza
        cube.position.set(x, 0.5, z);  // Altezza del cubo a 0.5 (appoggiato sul pavimento)

        // Aggiungi il cubo alla scena
        scene.add(cube);

        // Aggiungi una proprietà per distinguere i cubi (devono ruotare)
        cube.name = `cube_${i}`;
    }
};

// Aggiungi gli oggetti 3D agli angoli con la nuova configurazione
addObjectsInCorners();

// Funzione di raycasting per rilevare il clic sugli oggetti
const onMouseClick = (event) => {
    // Calcola la posizione del mouse nella scena (normalizzato)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Aggiorna il raycaster con la posizione del mouse
    raycaster.setFromCamera(mouse, camera);

    // Trova gli oggetti che il raggio interseca
    const intersects = raycaster.intersectObjects(scene.children);

    // Se c'è una collisione con un oggetto
    if (intersects.length > 0) {
        selectedObject = intersects[0].object;  // L'oggetto selezionato
        console.log('Oggetto cliccato:', selectedObject.name); // Mostra il nome dell'oggetto in console

        // Se è un cubo (ruota solo i cubi)
        if (selectedObject.name.startsWith("cube")) {
            // Se vuoi visualizzare il nome nell'interfaccia utente
            nameDisplay.textContent = `Oggetto cliccato: ${selectedObject.name}`;
        } else {
            // Se è una parete o pavimento, non fare nulla
            nameDisplay.textContent = `Oggetto cliccato: ${selectedObject.name} (non rotabile)`;
            selectedObject = null; // Non selezionare oggetti che non devono ruotare
        }
    } else {
        selectedObject = null;  // Nessun oggetto cliccato
    }
};

// Aggiungi evento di clic per il raycasting
window.addEventListener('click', onMouseClick, false);

// Funzione di rotazione dell'oggetto
const rotateObject = () => {
    if (selectedObject && selectedObject.name.startsWith("cube")) {
        selectedObject.rotation.x += 0.01;
        selectedObject.rotation.y += 0.01;
    }
};

// Funzione di animazione e aggiornamento
function animate() {
    requestAnimationFrame(animate);

    // Ruota l'oggetto selezionato
    rotateObject();

    // Renderizza la scena
    renderer.render(scene, camera);
}

// Crea un display per il nome dell'oggetto cliccato
const nameDisplay = document.createElement('div');
nameDisplay.style.position = 'absolute';
nameDisplay.style.top = '20px';
nameDisplay.style.left = '20px';
nameDisplay.style.color = 'white';
nameDisplay.style.fontSize = '18px';
document.body.appendChild(nameDisplay);

// Avvia l'animazione
animate();
