import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.20.0/+esm';

const reponame = ''

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xEEEEEE);

const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(-25, 30, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.getElementById('webgl-container').appendChild(renderer.domElement);

// Orbit controls
const camControls = new OrbitControls(camera, renderer.domElement);
camControls.enableDamping = true;
camControls.dampingFactor = 0.2;
camControls.target.set(5, 5, 5);

// Axes
//scene.add(new THREE.AxesHelper(20));

// Lighting
scene.add(new THREE.AmbientLight(0xffead2, 2.5));

const directionalLight = new THREE.DirectionalLight(0xffd2a1, 3.5);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const spotLight = new THREE.SpotLight(0xffc987, 1);
spotLight.position.set(-70, 90, 35);
scene.add(spotLight);

const headLight = new THREE.PointLight(0xffdfb5, 1);
scene.add(headLight);

const gui = new GUI();
const guiContainer = document.createElement('div');
guiContainer.id = 'model-gui';
document.body.appendChild(guiContainer);


// Load models
const models = [
  { path: reponame + '/models/Cat.glb', position: [0, 0, 0], scale: 30, visible: true },

  { group: 'food', path: reponame + '/models/Watermelon.glb', position: [0, 2, 9], rotation: [0, Math.PI/2 - Math.PI/9, 0], scale: 7, visible: true },
  { group: 'food', path: reponame + '/models/Juice.glb', position: [0, 2, 8.5], rotation: [0, Math.PI * 1.3, 0], scale: 2 },
  { group: 'food', path: reponame + '/models/Water.glb', position: [0, -0.3, 8.5], rotation: [0, Math.PI * -0.1, 0], scale: 5 },
  { group: 'food', path: reponame + '/models/Money.glb', position: [0, -0.2, 9], rotation: [0, 0, 0], scale: 0.3 },
  { group: 'food', path: reponame + '/models/Orange.glb', position: [0, 2, 9], rotation: [0, 0, 0], scale: 0.05 },
  
  { group: 'face', path: reponame + '/models/Glasses.glb', position: [-0.75, 8.4, 7.95], scale: 4.1, rotation: [0, -Math.PI/7, 0], colorable: true, color: '#4e475e' },
  { group: 'face', path: reponame + '/models/Monocle.glb', position: [0.1, 0.1, 6.4], scale: 0.8, rotation: [0, -Math.PI/7, 0] },
  { group: 'face', path: reponame + '/models/Bowtie.glb', position: [0, 5, 5.9], rotation: [0, -Math.PI * 0.09, 0], scale: 0.008 },
  { group: 'face', path: reponame + '/models/Thug Life.glb', position: [0, 0, 5.9], rotation: [0, Math.PI * 0.4, 0], scale: [1, 0.8, 1] },
  
  { group: 'hat', path: reponame + '/models/Propeller Hat.glb', position: [0.5, 9.5, 6], scale: 1.7, rotation: [0, -Math.PI/7, 0], visible: true },
  { group: 'hat', path: reponame + '/models/Hat.glb', position: [0.5, 8.8, 5.7], scale: 1.9, rotation: [-Math.PI * 0.05, -Math.PI/7, -Math.PI * 0.05], colorable: true, color: '#695732' },
  { group: 'hat', path: reponame + '/models/Duck.glb', position: [0.5, 10.25, 6], scale: 1, rotation: [0, -Math.PI/7, 0], colorable: true, color: '#fff133'},
  { group: 'hat', path: reponame + '/models/Frog.glb', position: [0.5, 10.7, 6], scale: 0.2, rotation: [0, -Math.PI/7, 0], colorable: true, color: '#33ff4e'},
  { group: 'hat', path: reponame + '/models/Witch Hat.glb', position: [0.5, 14.5, 6], scale: 10, rotation: [0, Math.PI*0.3, 0] },

  { group: 'scene', path: reponame + '/models/Bed.glb', position: [0, -5.5, 1], rotation: [0, 0, 0], scale: 10 },
  { group: 'scene', path: reponame + '/models/Classroom.glb', position: [8, -33.5, -5], rotation: [0, -Math.PI*0.1, 0], scale: 10 },
  { group: 'scene', path: reponame + '/models/Tea Room.glb', position: [8, -16.2, -5], rotation: [0, -Math.PI*0.4, 0], scale: 0.5 },
  
  { group: 'food', path: reponame + '/models/Maxwell.glb', position: [0, 0, 9], rotation: [0, -Math.PI*0.2, 0], scale: 10 },
  
  { path: reponame + '/models/Sword.glb', position: [-11, 2, 11.2], rotation: [-Math.PI * 0.2, Math.PI * 0.9, Math.PI * 0.4], scale: 10 },
];

const loadedObjects = new Map();
const groups = new Map();
const standaloneItems = [];

models.forEach((item, index) => {
  if (item.group) {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group).push({ item, index });
  } else {
    standaloneItems.push({ item, index });
  }
});

function getLabel(item) {
  return item.label ??
    item.path.split('/').pop().replace(/\.(glb|gltf)$/i, '');
}


function createSection(titleText, onClear = null) {
  const section = document.createElement('section');
  section.className = 'model-group';

  const header = document.createElement('div');
  header.className = 'model-group-header';

  const title = document.createElement('div');
  title.className = 'model-group-title';
  title.textContent = titleText;
  header.appendChild(title);

  if (onClear) {
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'model-group-clear';
    clearButton.textContent = 'Clear';
    clearButton.title = `Clear ${titleText}`;
    clearButton.addEventListener('click', onClear);
    header.appendChild(clearButton);
  }

  section.appendChild(header);
  guiContainer.appendChild(section);
  return section;
}

function clearGroup(groupName) {
  // Deselect the group's radio buttons.
  const radioName = `model-group-${groupName}`;
  guiContainer
    .querySelectorAll(`input[type="radio"]`)
    .forEach(radio => {
      if (radio.name === radioName) radio.checked = false;
    });

  // Hide every object belonging to the group.<
  for (const entry of groups.get(groupName) ?? []) {
    const object = loadedObjects.get(entry.index);
    if (object) object.visible = false;
  }
}



function applyModelColor(object, color) {
  const target = new THREE.Color(color);

  object.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      if (!material.color) return;

      if (!material.userData.originalRGB) {
        material.userData.originalRGB = {
          r: material.color.r,
          g: material.color.g,
          b: material.color.b
        };
      }

      const original = material.userData.originalRGB;

      const dr = original.r - target.r;
      const dg = original.g - target.g;
      const db = original.b - target.b;

      const distance = Math.sqrt(dr * dr + dg * dg + db * db) /
        Math.sqrt(3);

      // Identical colors: no change.
      // Contrasting colors: strong replacement.
      const strength = THREE.MathUtils.smoothstep(distance, 0.2, 0.9);

      material.color.setRGB(
        THREE.MathUtils.lerp(original.r, target.r, strength),
        THREE.MathUtils.lerp(original.g, target.g, strength),
        THREE.MathUtils.lerp(original.b, target.b, strength)
      );
    });
  });
}



function createControl(entry, type, section, radioName) {
  const { item, index } = entry;
  const label = document.createElement('label');
  label.className = 'model-option';

  const input = document.createElement('input');
  input.type = type;
  input.checked = item.visible === true;

  if (type === 'radio') {
    input.name = radioName;
    input.value = String(index);
  }

  const text = document.createElement('span');
  text.textContent = getLabel(item);

  label.append(input, text);
  section.appendChild(label);

  if (item.colorable) {
    const colorWrapper = document.createElement('div')
    colorWrapper.className = 'color-wrapper'
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'model-color';
    colorInput.value = item.color ?? '#ffffff';
    colorInput.title = 'Change model color';

    colorInput.addEventListener('input', () => {
      const object = loadedObjects.get(index);
      if (object) applyModelColor(object, colorInput.value);
      item.color = colorInput.value;
    });

    colorWrapper.appendChild(colorInput)
    label.appendChild(colorWrapper)
  }

  input.addEventListener('change', () => {
    if (type === 'radio' && !input.checked) return;

    if (type === 'radio') {
      // Hide other objects in this group.
      const groupItems = groups.get(item.group) ?? [];
      for (const other of groupItems) {
        const object = loadedObjects.get(other.index);
        if (object) object.visible = other.index === index;
      }
    } else {
      // Standalone items toggle independently.
      const object = loadedObjects.get(index);
      if (object) object.visible = input.checked;
    }
  });
}

// Mutually exclusive groups: radio buttons.
for (const [groupName, entries] of groups) {
  const section = createSection(
    groupName,
    () => clearGroup(groupName)
  );

  const radioName = `model-group-${groupName}`;

  entries.forEach(entry =>
    createControl(entry, 'radio', section, radioName)
  );
}

// Ungrouped items: independent checkboxes.
if (standaloneItems.length) {
  const section = createSection('Objects');

  standaloneItems.forEach(entry =>
    createControl(entry, 'checkbox', section)
  );
}

// Load all models.
const loader = new GLTFLoader();

models.forEach((item, index) => {
  loader.load(item.path, (gltf) => {
    const object = gltf.scene;

    object.position.set(...(item.position ?? [0, 0, 0]));
    object.rotation.set(...(item.rotation ?? [0, 0, 0]));

    const scale = Array.isArray(item.scale) ? item.scale : ([item.scale, item.scale, item.scale] ?? [1, 1, 1]);
    object.scale.set(scale[0], scale[1], scale[2]);
    
    object.visible = item.visible === true;
    if (item.colorable) {
      const initialColor = item.color ?? '#ffffff';
      applyModelColor(object, initialColor);
    }

    loadedObjects.set(index, object);
    scene.add(object);
  }, undefined, error => {
    console.error(`Failed to load ${item.path}:`, error);
  });
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
function animate() {
  requestAnimationFrame(animate);
  camControls.update();

  headLight.position.copy(camera.position);
  renderer.render(scene, camera);
}

animate();