import * as THREE from 'three'
import { assetBasePath } from './models.js'

export function createEffects(scene, getCat, getSpinModels) {
  let soundMuted = false
  const yippeeVolume = 10 ** (-28 / 20)
  const activeSounds = new Set()
  let spinAnimation
  let isSpinPending = false
  let patting = false
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

  const particleColors = ['#F6A6C8', '#B8A7F2', '#A8DADC', '#FFD6A5']
  const confettiColors = ['#F94144', '#F9C74F', '#90BE6D', '#43AA8B', '#577590', '#C77DFF']
  const particleTextures = new Map()
  const ringTextures = new Map()
  const particles = []
  const pattingRingOptions = {
    particlesPerSecond: 8,
    rateVariation: 3,
    size: 0.75,
    lifetime: 1,
    drift: 10
  }
  let pattingContact
  let pattingParticleElapsed = 0
  let nextPattingParticleDelay = getPattingParticleDelay()

  function getPattingParticleDelay() {
    const rate = pattingRingOptions.particlesPerSecond +
      (Math.random() * 2 - 1) * pattingRingOptions.rateVariation
    const delay = 1 / Math.max(rate, Number.EPSILON)
    return delay
  }

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

  function getRingTexture(color) {
    if (!ringTextures.has(color)) {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64

      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Could not create the ring particle texture.')
      }

      context.beginPath()
      context.arc(32, 32, 23, 0, Math.PI * 2)
      context.lineWidth = 10
      context.strokeStyle = color
      context.stroke()

      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      ringTextures.set(color, texture)
    }

    return ringTextures.get(color)
  }

  function spawnRingParticle(origin, {
    size = pattingRingOptions.size,
    lifetime = pattingRingOptions.lifetime,
    drift = pattingRingOptions.drift
  } = {}) {
    const color = particleColors[
      Math.floor(Math.random() * particleColors.length)
    ]
    const material = new THREE.SpriteMaterial({
      map: getRingTexture(color),
      transparent: true,
      depthTest: false,
      depthWrite: false
    })
    const sprite = new THREE.Sprite(material)
    sprite.position.copy(origin)
    sprite.scale.set(size, size, 1)

    particles.push({
      sprite,
      material,
      isPattingRing: true,
      velocity: new THREE.Vector3(),
      targetVelocity: new THREE.Vector3(),
      directionChangeTime: 0,
      delay: 0,
      elapsed: 0,
      spawned: false,
      lifetime,
      drift
    })
  }

  function createParticle(origin, text) {
    const oldText = text
    if (soundMuted) {
      text = '?'
    }

    const color = particleColors[
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
      delay: 0,
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
    const cat = getCat()
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

  function setPatting(value) {
    patting = value
    if (!patting) setPattingContact()
  }

  function setPattingContact(position) {
    const enteringContact = !pattingContact && position
    pattingContact = position?.clone()
    if (!pattingContact) {
      pattingParticleElapsed = 0
      return
    }

    if (patting && enteringContact) {
      spawnRingParticle(pattingContact)
      pattingParticleElapsed = 0
      nextPattingParticleDelay = getPattingParticleDelay()
    }
  }

  function pat() {
    if (patting) {
      playMeows(1, () => {
        spawnMeowParticle()
      }).catch(console.error)
    }
  }

  function updatePattingParticles(deltaTime) {
    if (!patting || !pattingContact) {
      pattingParticleElapsed = 0
      return
    }

    pattingParticleElapsed += deltaTime
    while (pattingParticleElapsed >= nextPattingParticleDelay) {
      pattingParticleElapsed -= nextPattingParticleDelay
      spawnRingParticle(pattingContact)
      nextPattingParticleDelay = getPattingParticleDelay()
    }
  }

  function confetti() {
    const cat = getCat()
    if (!cat) return

    const start = getCatOrigin()
    start.y = 0
    const confettiCount = 96
    const launchDuration = 1.5

    for (let i = 0; i < confettiCount; i++) {
      const rise = 18 + Math.random() * 8
      const spread = Math.sqrt(Math.random()) * Math.tan(Math.PI / 6) * rise
      const direction = Math.random() * Math.PI * 2
      const geometry = new THREE.PlaneGeometry(
        0.18 + Math.random() * 0.2,
        0.28 + Math.random() * 0.22
      )
      const material = new THREE.MeshBasicMaterial({
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false
      })
      const sprite = new THREE.Mesh(geometry, material)
      const startX = start.x
      const startY = start.y
      sprite.position.copy(start)
      sprite.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )

      particles.push({
        sprite,
        material,
        geometry,
        startZ: start.z,
        startX,
        startY,
        spreadX: Math.cos(direction) * spread,
        spreadZ: Math.sin(direction) * spread,
        delay: i / confettiCount * launchDuration,
        elapsed: 0,
        spawned: false,
        lifetime: 2.4 + Math.random() * 1.2,
        rise,
        swayAmount: 0,
        swayFrequency: 2 + Math.random() * 2,
        swayPhase: Math.random() * Math.PI * 2,
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        )
      })
    }
  }

  function updateParticles(deltaTime) {
    updatePattingParticles(deltaTime)

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
      if (particle.isPattingRing) {
        particle.directionChangeTime -= deltaTime
        if (particle.directionChangeTime <= 0) {
          particle.targetVelocity.set(
            (Math.random() - 0.5) * particle.drift,
            (Math.random() - 0.5) * particle.drift,
            (Math.random() - 0.5) * particle.drift
          )
          particle.directionChangeTime = 0.12 + Math.random() * 0.35
        }
        particle.velocity.lerp(
          particle.targetVelocity,
          1 - Math.exp(-5 * deltaTime)
        )
        particle.sprite.position.addScaledVector(particle.velocity, deltaTime)
        particle.material.opacity = 1 - progress
      } else {
        const sway = Math.sin(
          age * particle.swayFrequency + particle.swayPhase
        ) * particle.swayAmount + Math.sin(
          age * particle.swayFrequency * 2.1 + particle.swayPhase
        ) * particle.swayAmount * 0.2

        particle.sprite.position.x =
          particle.startX + (particle.spreadX ?? 0) * progress + sway
        particle.sprite.position.y = particle.startY + particle.rise * progress
        if (particle.spreadZ !== undefined) {
          particle.sprite.position.z =
            particle.startZ + particle.spreadZ * progress
        }
        if (particle.rotationSpeed) {
          particle.sprite.rotation.x += particle.rotationSpeed.x * deltaTime
          particle.sprite.rotation.y += particle.rotationSpeed.y * deltaTime
          particle.sprite.rotation.z += particle.rotationSpeed.z * deltaTime
        }
        particle.material.opacity = 1 - THREE.MathUtils.smoothstep(progress, 0.45, 1)
      }

      if (progress === 1) {
        scene.remove(particle.sprite)
        particle.geometry?.dispose()
        particles.splice(i, 1)
        particle.material.dispose()
      }
    }
  }

  const meowFiles = [
    assetBasePath + '/sounds/meow3.mp3',
    assetBasePath + '/sounds/meow2.mp3',
    assetBasePath + '/sounds/meow4.mp3',
    assetBasePath + '/sounds/meow5.mp3',
    assetBasePath + '/sounds/meow6.mp3',
    assetBasePath + '/sounds/meow7.mp3',
    assetBasePath + '/sounds/meow8.mp3',
    assetBasePath + '/sounds/meow2.mp3',
    assetBasePath + '/sounds/meow4.mp3',
    assetBasePath + '/sounds/meow5.mp3',
    assetBasePath + '/sounds/meow6.mp3',
    assetBasePath + '/sounds/meow7.mp3',
    assetBasePath + '/sounds/meow8.mp3',
  ]

  function playSound(soundFile, playbackRate = 1, onStart, volume = 1) {
    const audio = new Audio(soundFile)
    audio.playbackRate = playbackRate
    audio.volume = volume
    audio.muted = soundMuted
    activeSounds.add(audio)

    return new Promise((resolve, reject) => {
      let durationTimeout
      let hasDuration = false
      let hasStarted = false
      let settled = false

      const cleanup = () => {
        window.clearTimeout(durationTimeout)
        activeSounds.delete(audio)
        audio.removeEventListener('playing', onPlaying)
        audio.removeEventListener('ended', onEnded)
        audio.removeEventListener('error', onError)
      }

      const finish = error => {
        if (settled) return
        settled = true
        cleanup()
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      }

      const onPlaying = () => {
        if (hasStarted) return
        hasStarted = true
        const duration = audio.duration / audio.playbackRate
        if (Number.isFinite(duration) && duration > 0) {
          hasDuration = true
          durationTimeout = window.setTimeout(finish, Math.ceil(duration * 1000))
        }
        onStart?.(audio)
      }
      const onEnded = () => {
        if (!hasDuration) finish()
      }
      const onError = () => finish(new Error(`Could not load ${soundFile}`))

      audio.addEventListener('playing', onPlaying)
      audio.addEventListener('ended', onEnded)
      audio.addEventListener('error', onError)

      audio.play().catch(error => {
        finish(error)
      })
    })
  }

  function startSpin(cat, speedRadiansPerSecond, durationSeconds) {
    const spinModels = [...new Set([...getSpinModels(), cat])]
    const bodyCenter = new THREE.Box3()
      .setFromObject(cat)
      .getCenter(new THREE.Vector3())
    // The tail shifts the full bounds backward, so use the cat origin for body depth.
    bodyCenter.z = cat.getWorldPosition(new THREE.Vector3()).z
    const pivot = new THREE.Group()
    pivot.position.copy(bodyCenter)
    scene.add(pivot)
    spinModels.forEach(model => pivot.attach(model))

    spinAnimation = {
      pivot,
      models: spinModels,
      speedRadiansPerSecond,
      durationSeconds,
      elapsed: 0
    }
  }

  function spin(speedRadiansPerSecond = Math.PI * 10, durationSeconds = 1.8) {
    const rotationDuration = 2 * Math.PI / Math.abs(speedRadiansPerSecond)
    durationSeconds = Math.ceil(durationSeconds / rotationDuration) * rotationDuration

    if (!Number.isFinite(speedRadiansPerSecond) || speedRadiansPerSecond === 0) {
      return Promise.reject(new RangeError('Spin speed must be a non-zero number.'))
    }
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return Promise.reject(new RangeError('Spin duration must be a positive number.'))
    }
    if (isSpinPending || spinAnimation) return Promise.resolve()

    const cat = getCat()
    if (!cat) {
      return Promise.reject(new Error('Cannot spin models before the cat has loaded.'))
    }

    isSpinPending = true
    return playSound(assetBasePath + '/sounds/spin.mp3', 1, () => {
      startSpin(cat, speedRadiansPerSecond, durationSeconds)
    }).finally(() => {
      isSpinPending = false
    })
  }

  function yippee() {
    return playSound(assetBasePath + '/sounds/yippee.mp3', 1, confetti, yippeeVolume)
  }

  function updateSpin(deltaTime) {
    if (!spinAnimation) return

    spinAnimation.elapsed = Math.min(
      spinAnimation.elapsed + deltaTime,
      spinAnimation.durationSeconds
    )
    spinAnimation.pivot.rotation.y =
      spinAnimation.speedRadiansPerSecond * spinAnimation.elapsed

    if (spinAnimation.elapsed === spinAnimation.durationSeconds) {
      const { pivot, models: spinModels } = spinAnimation
      spinModels.forEach(model => scene.attach(model))
      scene.remove(pivot)
      spinAnimation = undefined
    }
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
    playSound(assetBasePath + '/sounds/disapproval.mp3').catch(console.error)
    disapprovalOverlay?.()
    disapprovalOverlay = overlay('disapproved', 'disapproval-overlay', 'alert', 6000)
  }

  function replaceParticleText(text) {
    for (const particle of particles) {
      if(!particle.text) continue
      particle.oldText = particle.text
      particle.text = text
      particle.material.map = getParticleTexture(text, particle.color)
      particle.material.needsUpdate = true
    }
  }

  function revertParticleText() {
    for (const particle of particles) {
      if(!particle.text) continue
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

  return {
    disapprove,
    playMeows,
    spawnMeowParticle,
    setPatting,
    setPattingContact,
    pat,
    spawnRingParticle,
    updateParticles,
    spin,
    yippee,
    updateSpin
  }
}
