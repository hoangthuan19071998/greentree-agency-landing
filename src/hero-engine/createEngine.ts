import {
  ACESFilmicToneMapping,
  DirectionalLight,
  FogExp2,
  HemisphereLight,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three'
import { easeInOut, lerp, smoothstep } from './math'
import { HEX, col } from './palette'
import { DURATION, shotAt } from './timeline'
import { createTree } from './worlds/tree'
import { createGround } from './worlds/ground'
import { SUN_DIR, createAtmosphere } from './worlds/atmosphere'
import { RING_CENTER, createRings } from './worlds/rings'
import { createComposer } from './post/composer'

export type Quality = 'high' | 'medium' | 'low'

export interface EngineOptions {
  quality?: Quality
  /** keep the drawing buffer so stills can be read back */
  preserveDrawingBuffer?: boolean
  onFrame?: (t: number) => void
}

const v3 = (x: number, y: number, z: number) => new Vector3(x, y, z)

export function createEngine(canvas: HTMLCanvasElement, opts: EngineOptions = {}) {
  const quality = opts.quality ?? 'high'
  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: opts.preserveDrawingBuffer ?? false,
  })
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3
  renderer.shadowMap.enabled = quality !== 'low'
  renderer.shadowMap.type = PCFSoftShadowMap

  const scene = new Scene()
  scene.fog = new FogExp2(HEX.fog, 0.03)
  const camera = new PerspectiveCamera(35, 16 / 9, 0.01, 100)
  scene.add(camera)

  const sun = new DirectionalLight(col('sunlight'), 3.4)
  sun.castShadow = quality !== 'low'
  sun.shadow.mapSize.set(quality === 'high' ? 2048 : 1024, quality === 'high' ? 2048 : 1024)
  scene.add(sun, sun.target)
  const hemi = new HemisphereLight('#b9c9a0', '#2a2015', 0.9)
  scene.add(hemi)
  const fill = new DirectionalLight(col('linen'), 0.7)
  scene.add(fill)

  const tree = createTree()
  const ground = createGround()
  const atmosphere = createAtmosphere(camera)
  const rings = createRings()
  scene.add(tree.group, ground.group, atmosphere.group, rings.group)

  const post = createComposer(renderer, scene, camera)

  const pos = new Vector3()
  const look = new Vector3()

  function renderAt(time: number) {
    const s = shotAt(time)
    const frame = tree.update(s.g)
    ground.update(s.g)

    const inWorld = s.phase !== 'rings'
    tree.group.visible = ground.group.visible = inWorld
    rings.group.visible = !inWorld

    let filmOffset = 0
    if (inWorld) {
      const H = frame.height
      const target = v3(0, Math.max(0.012, H * 0.5), 0)
      const d = 0.08 + H * (2.0 + 0.35 * smoothstep(0.5, 1, s.g))
      const az = 0.55 - 0.85 * s.g + 0.04 * Math.sin(s.t * 0.4)
      pos.set(Math.sin(az) * d, target.y * 0.55 + 0.006 + d * 0.02, Math.cos(az) * d)
      look.copy(target)
      filmOffset = -2 - 4 * smoothstep(0.2, 0.6, s.g)
      if (s.phase === 'dive') {
        // orbit in toward the side-lit face of the trunk
        const e = easeInOut(s.dive)
        const P = frame.trunkPoint
        const r = lerp(Math.hypot(pos.x - P.x, pos.z - P.z), frame.trunkRadius + 0.05, Math.pow(e, 0.7))
        const a = lerp(az, 1.25, e)
        pos.set(P.x + Math.sin(a) * r, lerp(pos.y, P.y, e), P.z + Math.cos(a) * r)
        look.lerp(P, e)
        filmOffset *= 1 - e
      }
    } else {
      const e = easeInOut(s.reveal)
      const w = easeInOut(s.swirl)
      pos.copy(v3(0.62, 0.05, 0.25).lerp(v3(-0.55, 1.7, 1.6), e).lerp(v3(-0.5, 0.5, 2.0), w)).add(RING_CENTER)
      look.copy(v3(0.62, 0, 0.12).lerp(v3(-0.42, 0, 0.05), e).lerp(v3(-0.35, 0, 0.25), w)).add(RING_CENTER)
      rings.update({ twist: w * 3.5, glow: w * 0.7, time: s.t })
    }

    camera.position.copy(pos)
    camera.lookAt(look)
    camera.filmOffset = filmOffset
    const dist = pos.distanceTo(look)
    camera.near = Math.max(dist * 0.004, 0.0004)
    camera.far = Math.max(dist * 45, 4)
    camera.updateProjectionMatrix()
    ;(scene.fog as FogExp2).density = inWorld ? 0.3 / dist : 0

    // sun and its shadow frustum follow the scale of the shot
    const size = Math.max(frame.height * 1.3, dist * 1.4)
    sun.target.position.copy(inWorld ? look : RING_CENTER)
    sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, size * 4)
    const sc = sun.shadow.camera
    sc.left = sc.bottom = -size
    sc.right = sc.top = size
    sc.near = size * 0.5
    sc.far = size * 8
    sc.updateProjectionMatrix()
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = size * 0.002
    fill.position.copy(pos).add(v3(0, dist * 0.6, 0))
    fill.intensity = lerp(1.5, 0.7, smoothstep(0, 0.4, s.g))
    fill.target = sun.target

    const light = inWorld ? smoothstep(0.3, 0.95, s.g) * (1 - s.dive * 0.7) : 0
    sun.intensity = lerp(1.6, 3.6, smoothstep(0.1, 0.8, s.g))
    atmosphere.sky.visible = true
    atmosphere.update({ time: s.t, target: look, dist, height: frame.height, light, far: camera.far })

    post.set({
      dof: quality === 'high',
      focus: dist,
      aperture: 0.0009 / dist,
      maxblur: 0.009,
      fade: s.fade,
      time: s.t,
      bloom: 0.45 + 0.35 * light,
    })
    post.render()
    opts.onFrame?.(s.t)
  }

  let raf = 0
  let t0 = 0
  let offset = 0
  const loop = (now: number) => {
    renderAt(((now - t0) / 1000 + offset) % DURATION)
    raf = requestAnimationFrame(loop)
  }

  return {
    renderAt,
    setSize(w: number, h: number, dpr: number) {
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      post.setSize(w, h, dpr)
    },
    start(from = 0) {
      cancelAnimationFrame(raf)
      offset = from
      t0 = performance.now()
      raf = requestAnimationFrame(loop)
    },
    stop() {
      cancelAnimationFrame(raf)
      raf = 0
    },
    get playing() {
      return raf !== 0
    },
    dispose() {
      cancelAnimationFrame(raf)
      renderer.dispose()
    },
  }
}

export type HeroEngine = ReturnType<typeof createEngine>
