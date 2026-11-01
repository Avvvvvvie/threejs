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

const effects = createEffects(
  scene,
  () => loadedObjects.get(0),
  () => models
    .map((item, index) => item.spin ? loadedObjects.get(index) : undefined)
    .filter(object => object !== undefined)
)

const spinButton = document.createElement('button')
spinButton.id = 'spin-toggle'
spinButton.type = 'button'
spinButton.setAttribute('aria-label', 'OIIAI')
spinButton.title = 'OIIAI'
spinButton.textContent = 'OIIAI'
spinButton.addEventListener('click', () => {
  effects.spin().catch(console.error)
})
document.body.appendChild(spinButton)

const patButton = document.createElement('button')
patButton.id = 'pat-toggle'
patButton.type = 'button'
patButton.setAttribute('aria-pressed', 'false')
patButton.setAttribute('aria-label', 'Pat the cat')
patButton.title = 'Pat the cat'
patButton.innerHTML = `
  <svg viewBox="-1.2 -1.2 17.40 17.40" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.03"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M6.8113 1.64706C6.62188 2.87918 6.68268 3.88523 6.76848 5.30499C6.78415 5.56426 6.80065 5.83732 6.81661 6.12808C6.83111 6.39208 6.63758 6.62172 6.37495 6.65217C6.11232 6.68262 5.87138 6.50334 5.82509 6.24304L5.74754 5.80698C5.64402 5.16529 5.48355 4.25481 5.17807 3.44741C4.86241 2.61312 4.4486 2.04121 3.93436 1.86044C3.64994 1.76104 3.41901 1.84279 3.25868 2.01052C3.08746 2.18962 2.9976 2.47065 3.0627 2.75399C3.2146 3.34424 3.44627 3.9167 3.69836 4.51802C3.72082 4.57158 3.74346 4.62543 3.76621 4.67954C3.9954 5.22457 4.23619 5.7972 4.41644 6.39081L4.41691 6.39238C4.562 6.87586 4.65646 7.2595 4.73086 7.56165C4.76034 7.68138 4.78667 7.78831 4.81175 7.88359C4.86768 8.09606 4.77836 8.32014 4.59161 8.43588C4.40486 8.55161 4.16445 8.53188 3.99907 8.38725C3.73749 8.15848 3.515 7.92784 3.31817 7.71802C3.27627 7.67335 3.23602 7.63018 3.19705 7.58838C3.04777 7.42826 2.91712 7.28812 2.78334 7.16029C2.45989 6.85122 2.18398 6.68004 1.80585 6.64369L1.80324 6.64343C1.56117 6.61888 1.41402 6.66441 1.31756 6.72627C1.21899 6.78947 1.11988 6.90414 1.03784 7.1123C0.976576 7.28492 1.01515 7.62987 1.1929 7.96911L1.19728 7.97747C1.40086 8.38452 1.74475 8.81587 2.18141 9.29299C2.39739 9.52898 2.62872 9.76849 2.86934 10.0174L2.87966 10.0281C3.11546 10.2721 3.35962 10.5247 3.59713 10.7827C4.4288 11.6863 5.27706 12.7538 5.4627 14H11.5087C11.5636 12.4353 11.8756 11.268 12.2875 10.1346C12.4454 9.70041 12.6121 9.28412 12.7826 8.85829C13.1097 8.04139 13.4509 7.18937 13.7705 6.10824C14.0989 4.99737 14.0097 4.37033 13.8613 4.03984C13.717 3.71858 13.4914 3.61786 13.3816 3.59606C13.1381 3.54774 13.0384 3.60947 12.9698 3.67901C12.867 3.78316 12.7698 3.98273 12.6921 4.30269C12.6166 4.61345 12.5752 4.96517 12.533 5.32501L12.5298 5.35285C12.4924 5.67242 12.4505 6.03016 12.3665 6.30098C12.3383 6.40699 12.2819 6.50407 12.1979 6.57539C12.1382 6.6261 12.0104 6.70818 11.8309 6.69312C11.5424 6.66891 11.3712 6.42143 11.365 6.14783C11.356 5.75454 11.3883 5.35864 11.4074 4.96608C11.4428 4.23646 11.477 3.5337 11.4245 2.8342L11.4242 2.82934C11.3916 2.32997 11.0493 2.00228 10.7007 1.9228C10.5305 1.88401 10.369 1.90601 10.2347 1.9835C10.103 2.05946 9.95535 2.21318 9.8574 2.51394L9.85631 2.51726C9.81525 2.6404 9.77298 2.87753 9.73606 3.2124C9.70044 3.53542 9.67337 3.91279 9.65156 4.29418C9.6329 4.62033 9.61785 4.9584 9.60434 5.26194C9.58728 5.64529 9.57267 5.97357 9.55633 6.1532C9.54983 6.22459 9.52939 6.29493 9.49501 6.35785C9.47356 6.39711 9.36115 6.60947 9.07106 6.61843C8.77917 6.62744 8.63975 6.40057 8.61698 6.35919C8.55634 6.24899 8.55066 6.11807 8.54754 5.99283C8.54474 5.88064 8.54294 5.71798 8.54174 5.54767C8.53935 5.20582 8.53935 4.81919 8.53935 4.70952C8.53935 3.6657 8.53838 2.65372 8.44714 1.64372C8.39183 1.24127 8.06278 1.00455 7.6436 1.00005C7.22399 0.995552 6.87918 1.22704 6.8113 1.64706ZM9.41219 1.3617C9.21469 0.448484 8.39913 0.00810324 7.65433 0.00011154C6.86452 -0.00836308 5.98761 0.465881 5.82365 1.49037L5.82318 1.49334C5.78239 1.7584 5.75229 2.01481 5.7309 2.26652C5.39423 1.67364 4.92622 1.14894 4.2655 0.916859C3.58661 0.679312 2.9492 0.887087 2.53582 1.31952C2.13415 1.73971 1.94438 2.36742 2.09031 2.98746L2.09269 2.99713C2.26478 3.66808 2.52396 4.30316 2.77613 4.90465C2.79814 4.95717 2.8201 5.00941 2.84194 5.06139C3.02139 5.48842 3.19378 5.89866 3.33871 6.31256C2.96404 5.98142 2.51925 5.70796 1.90276 5.6484C1.48865 5.60663 1.10391 5.67536 0.777805 5.88444C0.454239 6.0919 0.240671 6.40405 0.104187 6.75406L0.100868 6.76281C-0.10184 7.31286 0.0663312 7.97157 0.304895 8.42897C0.573704 8.96474 0.996104 9.47904 1.44372 9.96813C1.67046 10.2159 1.91136 10.4652 2.15033 10.7124L2.15682 10.7191C2.39524 10.9658 2.63217 11.2109 2.86134 11.4599C3.80937 12.49 4.50002 13.4632 4.50002 14.5C4.50002 14.7761 4.72388 15 5.00002 15H12C12.2762 15 12.5 14.7761 12.5 14.5C12.5 12.8212 12.8021 11.6462 13.2274 10.4762C13.3653 10.0968 13.5216 9.70579 13.6868 9.29247C14.0238 8.44922 14.398 7.51298 14.7295 6.39175C15.0956 5.15324 15.0559 4.25904 14.7735 3.63017C14.487 2.99208 13.9798 2.6953 13.5763 2.6152C13.1276 2.52614 12.7367 2.60475 12.4268 2.83081C12.4253 2.80773 12.4236 2.78468 12.4219 2.76167C12.3587 1.8105 11.6907 1.12285 10.923 0.947821C10.5346 0.859287 10.1111 0.900393 9.73509 1.11724C9.61852 1.18446 9.51055 1.26623 9.41219 1.3617Z" fill="#000000"></path> </g></svg>
`
patButton.addEventListener('click', () => {
  setPattingMode(patButton.getAttribute('aria-pressed') !== 'true')
})
document.body.appendChild(patButton)

const yippeeButton = document.createElement('button')
yippeeButton.id = 'yippee-toggle'
yippeeButton.type = 'button'
yippeeButton.setAttribute('aria-label', 'YIPPEE')
yippeeButton.title = 'YIPPEE'
yippeeButton.textContent = 'YIPPEE'
yippeeButton.addEventListener('click', () => {
  effects.yippee().catch(console.error)
})
document.body.appendChild(yippeeButton)

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let patPointerId

function setPattingMode(patting) {
  patButton.setAttribute('aria-pressed', String(patting))
  effects.setPatting(patting)
  camControls.enabled = !patting
  document.documentElement.classList.toggle('patting', patting)
  if (!patting) {
    document.documentElement.classList.remove('pat-pressed')
    patPointerId = undefined
  }
}

function getCatIntersection(event) {
  const cat = loadedObjects.get(0)
  const bounds = renderer.domElement.getBoundingClientRect()
  if (!cat || bounds.width === 0 || bounds.height === 0) return
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  ) return

  pointer.set(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  )
  raycaster.setFromCamera(pointer, camera)
  return raycaster.intersectObject(cat, true)[0]
}

renderer.domElement.addEventListener('pointerdown', (event) => {
  if (patButton.getAttribute('aria-pressed') === 'true') {
    if (!event.isPrimary || event.button !== 0) return
    patPointerId = event.pointerId
    document.documentElement.classList.add('pat-pressed')
    effects.setPattingContact(getCatIntersection(event)?.point)
  }
})

window.addEventListener('pointermove', (event) => {
  if (event.pointerId !== patPointerId) return
  effects.setPattingContact(getCatIntersection(event)?.point)
})

renderer.domElement.addEventListener('pointerup', (event) => {
  if (event.pointerId !== patPointerId) return

  if (patButton.getAttribute('aria-pressed') === 'true') {
    const intersection = getCatIntersection(event)
    effects.setPattingContact(intersection?.point)
    if (intersection) effects.pat()
  }
  setPattingMode(false)
})

window.addEventListener('pointerup', (event) => {
  if (event.pointerId === patPointerId) setPattingMode(false)
})

window.addEventListener('pointercancel', (event) => {
  if (event.pointerId === patPointerId) setPattingMode(false)
})

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

let isPlayingMeows = false

function playMeows(cost) {
  if (isPlayingMeows) return

  isPlayingMeows = true
  effects.playMeows(cost, effects.spawnMeowParticle)
    .catch(console.error)
    .finally(() => {
      isPlayingMeows = false
      console.log("finally")
    })
}

function execute() {
  const cost = getCost()
  if (cost > 0) {
    playMeows(cost)
  } else {
    effects.disapprove()
  }
}

function scheduleRandomMeows() {
  const delay = 15_000 + Math.random() * 20_000
  setTimeout(() => {
    if (!isPlayingMeows) {
      playMeows(1)
    }
    scheduleRandomMeows()
  }, delay)
}

scheduleRandomMeows()

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

function getHue(r, g, b) {
  const maximum = Math.max(r, g, b)
  const minimum = Math.min(r, g, b)
  const delta = maximum - minimum
  if (delta === 0) return 0

  let hue
  if (maximum === r) hue = (g - b) / delta % 6
  else if (maximum === g) hue = (b - r) / delta + 2
  else hue = (r - g) / delta + 4

  return (hue / 6 + 1) % 1
}

function getColorHue(color) {
  const value = Number.parseInt(color.slice(1), 16)
  return getHue(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255
  )
}

function hslToRgb(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const segment = hue * 6
  const secondary = chroma * (1 - Math.abs(segment % 2 - 1))
  const offset = lightness - chroma / 2
  const sector = Math.floor(segment)

  let r = 0
  let g = 0
  let b = 0
  if (sector === 0) [r, g] = [chroma, secondary]
  else if (sector === 1) [r, g] = [secondary, chroma]
  else if (sector === 2) [g, b] = [chroma, secondary]
  else if (sector === 3) [g, b] = [secondary, chroma]
  else if (sector === 4) [r, b] = [secondary, chroma]
  else [r, b] = [chroma, secondary]

  return [r + offset, g + offset, b + offset]
}

function rotateImageHue(imageData, originalPixels, hueShift) {
  const pixels = imageData.data
  pixels.set(originalPixels)

  for (let i = 0; i < pixels.length; i += 4) {
    const r = originalPixels[i] / 255
    const g = originalPixels[i + 1] / 255
    const b = originalPixels[i + 2] / 255
    const maximum = Math.max(r, g, b)
    const minimum = Math.min(r, g, b)
    const delta = maximum - minimum
    if (delta === 0) continue

    const lightness = (maximum + minimum) / 2
    const saturation = delta / (1 - Math.abs(2 * lightness - 1))
    const hue = (getHue(r, g, b) + hueShift + 1) % 1
    const [nextR, nextG, nextB] = hslToRgb(hue, saturation, lightness)
    pixels[i] = nextR * 255
    pixels[i + 1] = nextG * 255
    pixels[i + 2] = nextB * 255
  }
}

function applyModelColor(object, color) {
  const targetHue = getColorHue(color)

  object.traverse((child) => {
    if (!child.isMesh || !child.material) return

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material]

    materials.forEach((material) => {
      if (!material.map) return

      let tint = material.userData.hueTint
      if (!tint) {
        const image = material.map.image
        const width = image?.width ?? image?.naturalWidth
        const height = image?.height ?? image?.naturalHeight
        if (!width || !height) {
          console.error('Cannot tint model material without a readable texture image.')
          return
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) {
          console.error('Cannot tint model material: 2D canvas is unavailable.')
          return
        }

        context.drawImage(image, 0, 0, width, height)
        const imageData = context.getImageData(0, 0, width, height)
        tint = material.userData.hueTint = {
          baseHue: targetHue,
          sourceTexture: material.map,
          texture: null,
          context,
          canvas,
          imageData,
          originalPixels: new Uint8ClampedArray(imageData.data)
        }
      }

      const hueShift = targetHue - tint.baseHue
      if (Math.abs(hueShift) < 1e-6 && !tint.texture) return

      if (!tint.texture) {
        tint.texture = tint.sourceTexture.clone()
        tint.texture.image = tint.canvas
        material.map = tint.texture
        material.needsUpdate = true
      }

      rotateImageHue(tint.imageData, tint.originalPixels, hueShift)
      tint.context.putImageData(tint.imageData, 0, 0)
      tint.texture.needsUpdate = true
    })
  })
}

function replaceModelComponents(object, color, item) {
  const target = new THREE.Color(color)
  const meshNames = new Set(item.colorMeshes ?? [])
  const materialNames = new Set(item.colorMaterials ?? [])

  object.traverse((child) => {
    if (!child.isMesh || !child.material) return

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material]
    const replaceMeshMaterials = meshNames.has(child.name)

    materials.forEach((material) => {
      if (!material.color) return
      if (!replaceMeshMaterials && !materialNames.has(material.name)) return

      material.color.copy(target)
    })
  })
}

function updateModelColor(object, color, item) {
  if (item.colorMode === 'tint') {
    applyModelColor(object, color)
  } else {
    replaceModelComponents(object, color, item)
  }
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
      if (object) updateModelColor(object, colorInput.value, item)
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
      updateModelColor(object, initialColor, item)
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
  const deltaTime = clock.getDelta()
  effects.updateParticles(deltaTime)
  effects.updateSpin(deltaTime)

  headLight.position.copy(camera.position)
  renderer.render(scene, camera)
}

animate()