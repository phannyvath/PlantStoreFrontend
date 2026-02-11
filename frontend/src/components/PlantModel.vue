<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const canvasRef = ref(null)
let scene, camera, renderer, group, model, frameId
let resizeHandler = null

const GRAVITY = 14
const BOUNCE = 0.58
const GROUND_FRICTION = 0.92
const WALL_BOUNCE = 0.4
const DRAG_PLANE_Y = 0.6
const FLOOR_MIN_X = -0.72
const FLOOR_MAX_X = 0.72
const FLOOR_MIN_Z = -0.72
const FLOOR_MAX_Z = 0.72
const RAYCASTER = new THREE.Raycaster()
const MOUSE_RAY = new THREE.Vector2()
const INTERSECT_POINT = new THREE.Vector3()
const PLANE_NORMAL = new THREE.Vector3(0, 1, 0)
const DRAG_PLANE = new THREE.Plane(PLANE_NORMAL.clone(), 0)

let groundY = 0.4
let velocity = new THREE.Vector3(0, 0, 0)
let isDragging = false
let canvasEl = null
let onPointerDown, onPointerMove, onPointerUp, onPointerCancel

onMounted(() => {
  const canvas = canvasRef.value
  canvasEl = canvas
  if (!canvas) return

  function init() {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (width <= 0 || height <= 0) {
      requestAnimationFrame(init)
      return
    }

    scene = new THREE.Scene()
    scene.background = null

    camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100)
    camera.position.set(0, 0.75, 3.2)
    camera.lookAt(0, 0.2, 0)

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.85
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    const ambient = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambient)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 0.9)
    keyLight.position.set(2, 3, 2)
    keyLight.castShadow = true
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xb8d4b8, 0.4)
    fillLight.position.set(-1.5, 1, 1)
    scene.add(fillLight)
    const backLight = new THREE.DirectionalLight(0xffffff, 0.25)
    backLight.position.set(0, 1, -2)
    scene.add(backLight)

    group = new THREE.Group()
    group.position.set(0, groundY, 0)
    scene.add(group)

    const loader = new GLTFLoader()
    loader.load(
      '/plant.glb',
      (gltf) => {
        model = gltf.scene
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        model.position.sub(center)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 0.95 / maxDim
        model.scale.setScalar(scale)
        groundY = (size.y * scale) * 0.5 + 0.01
        group.position.y = groundY
        group.add(model)
        camera.lookAt(0, groundY + 0.22, 0)
      },
      undefined,
      (err) => console.error('GLB load error:', err)
    )

    function getPointerNdc(clientX, clientY) {
      const rect = canvas.getBoundingClientRect()
      MOUSE_RAY.x = ((clientX - rect.left) / rect.width) * 2 - 1
      MOUSE_RAY.y = -((clientY - rect.top) / rect.height) * 2 + 1
    }

    onPointerDown = function (e) {
      e.preventDefault()
      if (!group) return
      getPointerNdc(e.clientX, e.clientY)
      RAYCASTER.setFromCamera(MOUSE_RAY, camera)
      const toIntersect = model || group
      const intersects = RAYCASTER.intersectObject(toIntersect, true)
      if (intersects.length > 0) {
        isDragging = true
        velocity.set(0, 0, 0)
        canvas.style.cursor = 'grabbing'
        canvas.setPointerCapture(e.pointerId)
      }
    }

    onPointerMove = function (e) {
      if (!isDragging || !group) return
      e.preventDefault()
      getPointerNdc(e.clientX, e.clientY)
      DRAG_PLANE.setFromNormalAndCoplanarPoint(PLANE_NORMAL, new THREE.Vector3(0, DRAG_PLANE_Y, 0))
      RAYCASTER.setFromCamera(MOUSE_RAY, camera)
      if (RAYCASTER.ray.intersectPlane(DRAG_PLANE, INTERSECT_POINT)) {
        group.position.x = Math.max(FLOOR_MIN_X, Math.min(FLOOR_MAX_X, INTERSECT_POINT.x))
        group.position.z = Math.max(FLOOR_MIN_Z, Math.min(FLOOR_MAX_Z, INTERSECT_POINT.z))
        group.position.y = DRAG_PLANE_Y
      }
    }

    onPointerUp = function (e) {
      if (!isDragging) return
      isDragging = false
      canvas.style.cursor = 'grab'
      if (group) group.position.y = DRAG_PLANE_Y
      velocity.set(0, -0.5, 0)
      try { canvas.releasePointerCapture(e.pointerId) } catch (_) {}
    }

    onPointerCancel = onPointerUp

    canvas.addEventListener('pointerdown', onPointerDown, { passive: false })
    canvas.addEventListener('pointermove', onPointerMove, { passive: false })
    canvas.addEventListener('pointerup', onPointerUp, { passive: false })
    canvas.addEventListener('pointercancel', onPointerCancel, { passive: false })
    canvas.addEventListener('pointerleave', onPointerUp, { passive: false })
    canvas.style.cursor = 'grab'

    let lastTime = performance.now()
    function animate() {
      frameId = requestAnimationFrame(animate)
      const time = performance.now()
      const dt = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time

      if (group && !isDragging) {
        velocity.y -= GRAVITY * dt
        group.position.x += velocity.x * dt
        group.position.y += velocity.y * dt
        group.position.z += velocity.z * dt

        if (group.position.x < FLOOR_MIN_X) { group.position.x = FLOOR_MIN_X; velocity.x = -velocity.x * WALL_BOUNCE }
        if (group.position.x > FLOOR_MAX_X) { group.position.x = FLOOR_MAX_X; velocity.x = -velocity.x * WALL_BOUNCE }
        if (group.position.z < FLOOR_MIN_Z) { group.position.z = FLOOR_MIN_Z; velocity.z = -velocity.z * WALL_BOUNCE }
        if (group.position.z > FLOOR_MAX_Z) { group.position.z = FLOOR_MAX_Z; velocity.z = -velocity.z * WALL_BOUNCE }

        if (group.position.y < groundY) {
          group.position.y = groundY
          velocity.y = -velocity.y * BOUNCE
          velocity.x *= GROUND_FRICTION
          velocity.z *= GROUND_FRICTION
          if (Math.abs(velocity.y) < 0.2) velocity.y = 0
          if (Math.abs(velocity.x) < 0.01) velocity.x = 0
          if (Math.abs(velocity.z) < 0.01) velocity.z = 0
        }
      }

      renderer.render(scene, camera)
    }
    animate()
  }

  requestAnimationFrame(init)

  resizeHandler = () => {
    if (!canvasRef.value || !renderer || !camera) return
    const w = canvasRef.value.clientWidth
    const h = canvasRef.value.clientHeight
    if (w <= 0 || h <= 0) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (canvasEl) {
    canvasEl.removeEventListener('pointerdown', onPointerDown)
    canvasEl.removeEventListener('pointermove', onPointerMove)
    canvasEl.removeEventListener('pointerup', onPointerUp)
    canvasEl.removeEventListener('pointercancel', onPointerCancel)
    canvasEl.removeEventListener('pointerleave', onPointerUp)
  }
  if (frameId != null) cancelAnimationFrame(frameId)
  if (renderer) renderer.dispose()
})
</script>

<template>
  <div class="absolute inset-0 h-full w-full select-none" style="touch-action: none; -webkit-user-select: none; user-select: none;">
    <canvas ref="canvasRef" class="block h-full w-full" aria-label="Playful 3D plant — drag to pick up, release to drop" />
  </div>
</template>
