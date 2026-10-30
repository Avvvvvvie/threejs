import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.20.0/+esm'

const reponame = '/threejs'

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

// Axes
//scene.add(new THREE.AxesHelper(20))

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

const gui = new GUI()
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

let soundMuted = false
const activeSounds = new Set()
const soundToggle = document.createElement('button')
soundToggle.id = 'sound-toggle'
soundToggle.type = 'button'
soundToggle.setAttribute('aria-pressed', 'false')
soundToggle.addEventListener('click', () => {
  soundMuted = !soundMuted
  activeSounds.forEach(audio => {
    audio.muted = soundMuted
  })
  updateSoundToggle()

  if (soundMuted) {
    onMute()
  } else {
    onUnmute()
  }
})
document.body.appendChild(soundToggle)

function updateSoundToggle() {
  soundToggle.setAttribute('aria-pressed', String(soundMuted))
  soundToggle.setAttribute('aria-label', soundMuted ? 'Unmute sound' : 'Mute sound')
  soundToggle.title = soundMuted ? 'Unmute sound' : 'Mute sound'
  soundToggle.innerHTML = `
    <svg class="sound-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      ${soundMuted ? '<path class="sound-icon-slash" d="M3 3l18 18" />' : ''}
    </svg>
  `
}

function onMute() {
  window.dispatchEvent(new Event('soundmute'))
}

function onUnmute() {
  window.dispatchEvent(new Event('soundunmute'))
}

updateSoundToggle()

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

// Load models
const models = [
  { path: reponame + '/models/Cat.glb', position: [0, 0, 0], scale: 30, visible: true, price: 666 },

  { group: 'food', path: reponame + '/models/Watermelon.glb', position: [0, 2, 9], rotation: [0, Math.PI/2 - Math.PI/9, 0], scale: 7, visible: true, price: 4 },
  { group: 'food', path: reponame + '/models/Juice.glb', position: [0, 2, 8.5], rotation: [0, Math.PI * 1.3, 0], scale: 2, price: 2 },
  { group: 'food', path: reponame + '/models/Water.glb', position: [0, -0.3, 8.5], rotation: [0, Math.PI * -0.1, 0], scale: 5, price: 1 },
  { group: 'food', path: reponame + '/models/Money.glb', position: [0, -0.2, 9], rotation: [0, 0, 0], scale: 0.3, price: 3 },
  { group: 'food', path: reponame + '/models/Orange.glb', position: [0, 2, 9], rotation: [0, 0, 0], scale: 0.05, price: 2 },
  
  { group: 'face', path: reponame + '/models/Glasses.glb', position: [-0.75, 8.4, 7.95], scale: 4.1, rotation: [0, -Math.PI/7, 0], colorable: true, color: '#4e475e', price: -1 },
  { group: 'face', path: reponame + '/models/Monocle.glb', position: [0.1, 0.1, 6.4], scale: 0.8, rotation: [0, -Math.PI/7, 0], price: 4 },
  { group: 'face', path: reponame + '/models/Bowtie.glb', position: [0, 5, 5.9], rotation: [0, -Math.PI * 0.09, 0], scale: 0.008, price: 2 },
  { group: 'face', path: reponame + '/models/Thug Life.glb', position: [0, 0, 5.9], rotation: [0, Math.PI * 0.4, 0], scale: [1, 0.8, 1], price: 3 },
  
  { group: 'hat', path: reponame + '/models/Propeller Hat.glb', position: [0.5, 9.5, 6], scale: 1.7, rotation: [0, -Math.PI/7, 0], visible: true, price: 2 },
  { group: 'hat', path: reponame + '/models/Hat.glb', position: [0.5, 8.8, 5.7], scale: 1.9, rotation: [-Math.PI * 0.05, -Math.PI/7, -Math.PI * 0.05], colorable: true, color: '#695732', price: -5 },
  { group: 'hat', path: reponame + '/models/Duck.glb', position: [0.5, 10.25, 6], scale: 1, rotation: [0, -Math.PI/7, 0], colorable: true, color: '#fff133', price: 5},
  { group: 'hat', path: reponame + '/models/Frog.glb', position: [0.5, 10.7, 6], scale: 0.2, rotation: [0, -Math.PI/7, 0], colorable: true, color: '#33ff4e', price: 4},
  { group: 'hat', path: reponame + '/models/Witch Hat.glb', position: [0.5, 14.5, 6], scale: 10, rotation: [0, Math.PI*0.3, 0], price: 2 },

  { group: 'scene', path: reponame + '/models/Bed.glb', position: [0, -5.5, 1], rotation: [0, 0, 0], scale: 10, price: 3 },
  { group: 'scene', path: reponame + '/models/Classroom.glb', position: [8, -33.5, -5], rotation: [0, -Math.PI*0.1, 0], scale: 10, price: 1 },
  { group: 'scene', path: reponame + '/models/Tea Room.glb', position: [8, -16.2, -5], rotation: [0, -Math.PI*0.4, 0], scale: 0.5, price: 2 },
  
  { group: 'food', path: reponame + '/models/Maxwell.glb', position: [0, 0, 9], rotation: [0, -Math.PI*0.2, 0], scale: 10, price: 666 },
  
  { path: reponame + '/models/Sword.glb', position: [-11, 5, 8], rotation: [-Math.PI * 0.35, Math.PI * 0.9, Math.PI * 0.5], scale: 10, price: 10 },
]

function getCost() {
  return - 666 + models.reduce(
    (sum, item) => sum + (item.visible === true ? item.price ?? 0 : 0),
    0
  )
}

function updatePrice() {
  const total = getCost()
  priceDisplay.textContent = `Cost: ${total} Meows`
}

const particleColors = ['#F6A6C8', '#B8A7F2', '#A8DADC', '#FFD6A5']
const particleTextures = new Map()
const particles = []

function getParticleTexture(text, color) {
  const key = JSON.stringify([text, color])
  if (!particleTextures.has(key)) {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 96

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not create the particle texture.')
    }

    context.font = 'bold 68px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.lineWidth = 5
    context.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    context.strokeText(text, canvas.width / 2, canvas.height / 2)
    context.fillStyle = color
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    particleTextures.set(key, texture)
  }

  return particleTextures.get(key)
}

function createParticle(origin, text, delay = 0, fixedColor = null) {
  let oldText = text
  if(soundMuted) {
    text = '?'
  }

  const color = fixedColor ?? particleColors[
    Math.floor(Math.random() * particleColors.length)
  ]
  const material = new THREE.SpriteMaterial({
    map: getParticleTexture(text, color),
    transparent: true,
    depthWrite: false
  })
  const sprite = new THREE.Sprite(material)
  const startX = origin.x + (Math.random() - 0.5) * 2.5
  const startY = origin.y + Math.random() * 0.4

  sprite.position.set(
    startX,
    startY,
    origin.z + (Math.random() - 0.5) * 0.8
  )
  sprite.scale.set(9, 3.375, 1)

  particles.push({
    sprite,
    material,
    startX,
    startY,
    delay,
    elapsed: 0,
    spawned: false,
    lifetime: 2 + Math.random() * 0.8,
    rise: 7 + Math.random() * 3,
    swayAmount: 0.3 + Math.random() * 0.6,
    swayFrequency: 1.5 + Math.random() * 1.5,
    swayPhase: Math.random() * Math.PI * 2,
    color,
    text,
    oldText
  })
}

function getCatOrigin() {
  const cat = loadedObjects.get(0)
  const origin = new THREE.Vector3(0, 11.5, 6.5)

  if (cat) {
    cat.getWorldPosition(origin)
    origin.add(new THREE.Vector3(0, 11.5, 6.5))
  }
  return origin
}

function spawnMeowParticle() {
  createParticle(getCatOrigin(), 'meow')
}

function updateParticles(deltaTime) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i]
    particle.elapsed += deltaTime
    if (particle.elapsed < particle.delay) continue

    if (!particle.spawned) {
      scene.add(particle.sprite)
      particle.spawned = true
    }

    const age = particle.elapsed - particle.delay
    const progress = Math.min(age / particle.lifetime, 1)
    const sway = Math.sin(
      age * particle.swayFrequency + particle.swayPhase
    ) * particle.swayAmount + Math.sin(
      age * particle.swayFrequency * 2.1 + particle.swayPhase
    ) * particle.swayAmount * 0.2

    particle.sprite.position.x = particle.startX + sway
    particle.sprite.position.y = particle.startY + particle.rise * progress
    particle.material.opacity = 1 - THREE.MathUtils.smoothstep(progress, 0.45, 1)

    if (progress === 1) {
      scene.remove(particle.sprite)
      particle.material.dispose()
      particles.splice(i, 1)
    }
  }
}

const meowFiles = [
  reponame + '/sounds/meow3.mp3',
  reponame + '/sounds/meow2.mp3',
  reponame + '/sounds/meow4.mp3',
  reponame + '/sounds/meow5.mp3',
  reponame + '/sounds/meow6.mp3',
  reponame + '/sounds/meow7.mp3',
  reponame + '/sounds/meow8.mp3',
  reponame + '/sounds/meow2.mp3',
  reponame + '/sounds/meow4.mp3',
  reponame + '/sounds/meow5.mp3',
  reponame + '/sounds/meow6.mp3',
  reponame + '/sounds/meow7.mp3',
  reponame + '/sounds/meow8.mp3',
]

function playSound(soundFile, playbackRate = 1, onStart) {
  const audio = new Audio(soundFile)
  audio.playbackRate = playbackRate
  audio.muted = soundMuted
  activeSounds.add(audio)

  return new Promise((resolve, reject) => {
    audio.addEventListener('playing', () => onStart?.(audio), { once: true })
    audio.addEventListener('ended', () => {
      activeSounds.delete(audio)
      resolve()
    }, { once: true })
    audio.addEventListener('error', () => {
      activeSounds.delete(audio)
      reject(new Error(`Could not load ${soundFile}`))
    }, { once: true })

    audio.play().catch(error => {
      activeSounds.delete(audio)
      reject(error)
    })
  })
}

async function playMeows(count, onSoundStart) {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error('Enter a non-negative whole number.')
  }

  let previousIndex = -1

  for (let i = 0; i < count; i++) {
    let index = Math.floor(Math.random() * meowFiles.length)

    // Avoid an identical sound back-to-back when there is more than one choice.
    while (meowFiles.length > 1 && index === previousIndex) {
      index = Math.floor(Math.random() * meowFiles.length)
    }
    previousIndex = index

    await playSound(meowFiles[index], 0.96 + Math.random() * 0.08, onSoundStart)
  }
}

function overlay(text, className, role = 'status', duration = 3000) {
  let element = document.createElement('div')
  element.className = className
  element.setAttribute('role', role)
  element.textContent = text
  element.style.setProperty('--overlay-duration', `${duration}ms`)
  document.body.appendChild(element)

  let timeoutId
  const stop = () => {
    if (!element) return
    window.clearTimeout(timeoutId)
    element.remove()
    element = null
  }
  timeoutId = window.setTimeout(stop, duration)

  return stop
}

let disapprovalOverlay
function disapprove() {
  playSound(reponame + '/sounds/disapproval.mp3').catch(console.error)
  disapprovalOverlay?.()
  disapprovalOverlay = overlay('disapproved', 'disapproval-overlay', 'alert', 6000)
}

function replaceParticleText(text) {
  for (const particle of particles) {
    particle.oldText = particle.text
    particle.text = text
    particle.material.map = getParticleTexture(text, particle.color)
    particle.material.needsUpdate = true
  }
}

function revertParticleText() {
  for (const particle of particles) {
    particle.text = particle.oldText
    particle.material.map = getParticleTexture(particle.text, particle.color)
    particle.material.needsUpdate = true
  }
}

window.addEventListener('soundmute', () => {
  replaceParticleText('?')
})

window.addEventListener('soundunmute', () => {
  revertParticleText()
})


function execute() {
  let cost = getCost()
  if(cost > 0) {
      playMeows(cost, spawnMeowParticle).catch(console.error)
  } else {
      disapprove()
  }
}

updatePrice()

const loadedObjects = new Map()
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

function getLabel(item) {
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

  // Hide every object belonging to the group.<
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
  text.textContent = getLabel(item)

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

// Load all models.
const loader = new GLTFLoader()

models.forEach((item, index) => {
  loader.load(item.path, (gltf) => {
    const object = gltf.scene

    object.position.set(...(item.position ?? [0, 0, 0]))
    object.rotation.set(...(item.rotation ?? [0, 0, 0]))

    const scale = Array.isArray(item.scale) ? item.scale : ([item.scale, item.scale, item.scale] ?? [1, 1, 1])
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
  updateParticles(clock.getDelta())

  headLight.position.copy(camera.position)
  renderer.render(scene, camera)
}

animate()