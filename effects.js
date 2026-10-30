import * as THREE from 'three'
import { assetBasePath } from './models.js'

export function createEffects(scene, getCat) {
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

  function playSound(soundFile, playbackRate = 1, onStart) {
    const audio = new Audio(soundFile)
    audio.playbackRate = playbackRate
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

  return {
    disapprove,
    playMeows,
    spawnMeowParticle,
    updateParticles
  }
}
