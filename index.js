import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createEffects } from './effects.js'
import { models } from './models.js'

// Scene setup
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 1000
)
camera.position.set(-25, 30, 50)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
const container = document.getElementById('webgl-container')
renderer.setSize(container.clientWidth, container.clientHeight)
renderer.setPixelRatio(window.devicePixelRatio)

container.appendChild(renderer.domElement)

// Orbit controls
const camControls = new OrbitControls(camera, renderer.domElement)
camControls.enableDamping = true
camControls.dampingFactor = 0.2
camControls.target.set(5, 5, 5)

// Lighting
scene.add(new THREE.AmbientLight(0xffead2, 2.5))

const directionalLight = new THREE.DirectionalLight(0xffd2a1, 3.5)
directionalLight.position.set(5, 10, 7)
scene.add(directionalLight)

const spotLight = new THREE.SpotLight(0xffc987, 1)
spotLight.position.set(-70, 90, 35)
scene.add(spotLight)

const headLight = new THREE.PointLight(0xffdfb5, 1)
scene.add(headLight)

const loadedObjects = new Map()

// Scene controls and price display
const guiContainer = document.createElement('div')
guiContainer.id = 'model-gui'
guiContainer.setAttribute('aria-label', 'Scene controls')
document.body.appendChild(guiContainer)

const guiToggle = document.createElement('button')
guiToggle.id = 'model-gui-toggle'
guiToggle.type = 'button'
guiToggle.setAttribute('aria-controls', guiContainer.id)
guiToggle.addEventListener('click', () => {
  guiContainer.hidden = !guiContainer.hidden
  guiToggle.setAttribute('aria-expanded', String(!guiContainer.hidden))
  guiToggle.textContent = guiContainer.hidden ? 'Show menu' : 'Hide menu'
})
document.body.appendChild(guiToggle)

const effects = createEffects(scene, () => loadedObjects.get(0))

const compactViewport = window.matchMedia('(max-width: 700px), (max-height: 500px)')
guiContainer.hidden = compactViewport.matches
guiToggle.setAttribute('aria-expanded', String(!guiContainer.hidden))
guiToggle.textContent = guiContainer.hidden ? 'Show menu' : 'Hide menu'
compactViewport.addEventListener('change', () => {
  guiContainer.hidden = compactViewport.matches
  guiToggle.setAttribute('aria-expanded', String(!guiContainer.hidden))
  guiToggle.textContent = guiContainer.hidden ? 'Show menu' : 'Hide menu'
})

const priceBar = document.createElement('div')
priceBar.id = 'model-price-bar'

const priceDisplay = document.createElement('div')
priceDisplay.id = 'model-price'
priceDisplay.setAttribute('role', 'status')
priceDisplay.setAttribute('aria-live', 'polite')
priceBar.appendChild(priceDisplay)
priceDisplay.classList.add('cursive')

const confirmButton = document.createElement('button')
confirmButton.id = 'model-confirm'
confirmButton.type = 'button'
confirmButton.textContent = 'Confirm'
confirmButton.addEventListener('click', execute)
priceBar.appendChild(confirmButton)
document.body.appendChild(priceBar)
confirmButton.classList.add('cursive')

// Pricing
function getCost() {
  return -666 + models.reduce(
    (sum, item) => sum + (item.visible === true ? item.price ?? 0 : 0),
    0
  )
}

function updatePrice() {
  const total = getCost()
  priceDisplay.textContent = `Cost: ${total} Meows`
}

updatePrice()

function execute() {
  const cost = getCost()
  if (cost > 0) {
    effects.playMeows(cost, effects.spawnMeowParticle).catch(console.error)
  } else {
    effects.disapprove()
  }
}

// Model controls and selection state
const groups = new Map()
const standaloneItems = []

models.forEach((item, index) => {
  if (item.group) {
    if (!groups.has(item.group)) groups.set(item.group, [])
    groups.get(item.group).push({ item, index })
  } else {
    standaloneItems.push({ item, index })
  }
})

function getModelName(item) {
  return item.label ??
    item.path.split('/').pop().replace(/\.(glb|gltf)$/i, '')
}


function createSection(titleText, onClear = null) {
  const section = document.createElement('section')
  section.className = 'model-group'

  const header = document.createElement('div')
  header.className = 'model-group-header'

  const title = document.createElement('div')
  title.className = 'model-group-title'
  title.textContent = titleText
  header.appendChild(title)

  if (onClear) {
    const clearButton = document.createElement('button')
    clearButton.type = 'button'
    clearButton.className = 'model-group-clear'
    clearButton.textContent = 'Clear'
    clearButton.title = `Clear ${titleText}`
    clearButton.addEventListener('click', onClear)
    header.appendChild(clearButton)
  }

  section.appendChild(header)
  guiContainer.appendChild(section)
  return section
}

function clearGroup(groupName) {
  // Deselect the group's radio buttons.
  const radioName = `model-group-${groupName}`
  guiContainer
    .querySelectorAll(`input[type="radio"]`)
    .forEach(radio => {
      if (radio.name === radioName) radio.checked = false
    })

  // Hide every object belonging to the group.
  for (const entry of groups.get(groupName) ?? []) {
    const object = loadedObjects.get(entry.index)
    if (object) object.visible = false
    entry.item.visible = false
  }
  updatePrice()
}



function applyModelColor(object, color) {
  const target = new THREE.Color(color)

  object.traverse((child) => {
    if (!child.isMesh || !child.material) return

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material]

    materials.forEach((material) => {
      if (!material.color) return

      if (!material.userData.originalRGB) {
        material.userData.originalRGB = {
          r: material.color.r,
          g: material.color.g,
          b: material.color.b
        }
      }

      const original = material.userData.originalRGB

      const dr = original.r - target.r
      const dg = original.g - target.g
      const db = original.b - target.b

      const distance = Math.sqrt(dr * dr + dg * dg + db * db) /
        Math.sqrt(3)

      // Identical colors: no change.
      // Contrasting colors: strong replacement.
      const strength = THREE.MathUtils.smoothstep(distance, 0.2, 0.9)

      material.color.setRGB(
        THREE.MathUtils.lerp(original.r, target.r, strength),
        THREE.MathUtils.lerp(original.g, target.g, strength),
        THREE.MathUtils.lerp(original.b, target.b, strength)
      )
    })
  })
}

function createControl(entry, type, section, radioName) {
  const { item, index } = entry
  const label = document.createElement('label')
  label.className = 'model-option'

  const input = document.createElement('input')
  input.type = type
  input.checked = item.visible === true

  if (type === 'radio') {
    input.name = radioName
    input.value = String(index)
  }

  const text = document.createElement('span')
  text.textContent = getModelName(item)

  label.append(input, text)
  section.appendChild(label)

  if (item.colorable) {
    const colorWrapper = document.createElement('div')
    colorWrapper.className = 'color-wrapper'
    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.className = 'model-color'
    colorInput.value = item.color ?? '#ffffff'
    colorInput.title = 'Change model color'

    colorInput.addEventListener('input', () => {
      const object = loadedObjects.get(index)
      if (object) applyModelColor(object, colorInput.value)
      item.color = colorInput.value
    })

    colorWrapper.appendChild(colorInput)
    label.appendChild(colorWrapper)
  }

  input.addEventListener('change', () => {
    if (type === 'radio' && !input.checked) return

    if (type === 'radio') {
      // Hide other objects in this group.
      const groupItems = groups.get(item.group) ?? []
      for (const other of groupItems) {
        const object = loadedObjects.get(other.index)
        const visible = other.index === index
        if (object) object.visible = visible
        other.item.visible = visible
      }
    } else {
      // Standalone items toggle independently.
      const object = loadedObjects.get(index)
      if (object) object.visible = input.checked
      item.visible = input.checked
    }
    updatePrice()
  })
}

// Mutually exclusive groups: radio buttons.
for (const [groupName, entries] of groups) {
  const section = createSection(
    groupName,
    () => clearGroup(groupName)
  )

  const radioName = `model-group-${groupName}`

  entries.forEach(entry =>
    createControl(entry, 'radio', section, radioName)
  )
}

// Ungrouped items: independent checkboxes.
if (standaloneItems.length) {
  const section = createSection('Objects')

  standaloneItems.forEach(entry =>
    createControl(entry, 'checkbox', section)
  )
}

// Model loading
const loader = new GLTFLoader()

models.forEach((item, index) => {
  loader.load(item.path, (gltf) => {
    const object = gltf.scene

    object.position.set(...(item.position ?? [0, 0, 0]))
    object.rotation.set(...(item.rotation ?? [0, 0, 0]))

    const scale = Array.isArray(item.scale)
      ? item.scale
      : [item.scale ?? 1, item.scale ?? 1, item.scale ?? 1]
    object.scale.set(scale[0], scale[1], scale[2])
    
    object.visible = item.visible === true
    if (item.colorable) {
      const initialColor = item.color ?? '#ffffff'
      applyModelColor(object, initialColor)
    }

    loadedObjects.set(index, object)
    scene.add(object)
  }, undefined, error => {
    console.error(`Failed to load ${item.path}:`, error)
  })
})

// Resize the scene and adjust its framing for narrow viewports.
let viewportZoom = 1
function resizeScene() {
  const width = container.clientWidth
  const height = container.clientHeight
  const aspect = width / height
  const nextViewportZoom = THREE.MathUtils.clamp(1.15 / aspect, 1, 1.5)
  const cameraOffset = camera.position.clone().sub(camControls.target)
  cameraOffset.setLength(cameraOffset.length() * nextViewportZoom / viewportZoom)
  camera.position.copy(camControls.target).add(cameraOffset)
  viewportZoom = nextViewportZoom

  camera.aspect = aspect
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

window.addEventListener('resize', resizeScene)
resizeScene()

// Render loop
const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  camControls.update()
  effects.updateParticles(clock.getDelta())

  headLight.position.copy(camera.position)
  renderer.render(scene, camera)
}

animate()