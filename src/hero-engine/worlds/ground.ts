import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
} from 'three'
import { TAU, fbm2, mulberry32, smoothstep } from '../math'
import { soilTexture } from '../textures/canvas2d'

// Soil, pebbles, grass, moss and a distant forest. Detail is concentrated near
// the seed (macro shots) and spreads outward as the tree grows.

function bladeGeometry() {
  const rows = 5
  const pos: number[] = []
  const idx: number[] = []
  for (let r = 0; r <= rows; r++) {
    const t = r / rows
    const w = 0.5 * (1 - t) + 0.02
    const bend = t * t * 0.35
    pos.push(-w, t, bend, w, t, bend)
  }
  for (let r = 0; r < rows; r++) {
    const a = r * 2
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

export function createGround() {
  const group = new Group()
  const rnd = mulberry32(17)
  const o = new Object3D()
  const zero = new Matrix4().makeScale(0, 0, 0)

  const soil = soilTexture()
  soil.repeat.set(220, 220)
  const groundGeo = new PlaneGeometry(90, 90, 280, 280)
  groundGeo.rotateX(-Math.PI / 2)
  const p = groundGeo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const z = p.getZ(i)
    const r = Math.hypot(x, z)
    const far = smoothstep(2, 10, r)
    p.setY(i, (fbm2(x * 0.12, z * 0.12) - 0.5) * 2.2 * far + (fbm2(x * 3, z * 3) - 0.5) * 0.04 * smoothstep(0.6, 2, r))
  }
  groundGeo.computeVertexNormals()
  const ground = new Mesh(
    groundGeo,
    new MeshStandardMaterial({ map: soil, color: '#8a7a68', roughness: 1 }),
  )
  ground.receiveShadow = true
  group.add(ground)

  // soil crumbs around the seed
  const crumbs = new InstancedMesh(
    new IcosahedronGeometry(1, 1),
    new MeshStandardMaterial({ color: '#3a2d21', roughness: 1 }),
    4200,
  )
  const c = new Color()
  for (let i = 0; i < crumbs.count; i++) {
    const near = i < 3600
    const r = near ? Math.sqrt(rnd()) * 0.3 + 0.012 : 0.3 + rnd() * 3
    const a = rnd() * TAU
    const size = near ? 0.0004 + Math.pow(rnd(), 4) * 0.0028 : 0.004 + Math.pow(rnd(), 2) * 0.03
    o.position.set(Math.cos(a) * r, size * 0.25, Math.sin(a) * r)
    o.rotation.set(rnd() * TAU, rnd() * TAU, rnd() * TAU)
    o.scale.set(size, size * (0.5 + rnd() * 0.5), size)
    o.updateMatrix()
    crumbs.setMatrixAt(i, o.matrix)
    const v = 0.6 + rnd() * 0.7
    crumbs.setColorAt(i, c.setRGB(v, v * 0.92, v * 0.8))
  }
  crumbs.castShadow = crumbs.receiveShadow = true
  group.add(crumbs)

  // grass spreads outward from the trunk as the tree matures
  const grassCount = 14000
  const grass = new InstancedMesh(
    bladeGeometry(),
    new MeshStandardMaterial({ color: '#ffffff', roughness: 1, side: DoubleSide }),
    grassCount,
  )
  grass.frustumCulled = false
  const grassData = Array.from({ length: grassCount }, () => {
    const r = 0.45 + Math.pow(rnd(), 0.7) * 14
    const a = rnd() * TAU
    return {
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      r,
      h: 0.07 + rnd() * 0.2,
      w: 0.012 + rnd() * 0.01,
      yaw: rnd() * TAU,
      lean: (rnd() - 0.5) * 0.5,
    }
  })
  for (let i = 0; i < grassCount; i++) {
    const v = rnd()
    grass.setColorAt(i, c.setRGB(0.1 + v * 0.12, 0.2 + v * 0.16, 0.07 + v * 0.05))
  }
  grass.receiveShadow = true
  group.add(grass)

  const moss = new InstancedMesh(
    new IcosahedronGeometry(1, 1),
    new MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }),
    1400,
  )
  moss.frustumCulled = false
  const mossData = Array.from({ length: moss.count }, () => {
    const r = 0.25 + Math.pow(rnd(), 1.5) * 1.8
    const a = rnd() * TAU
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.02 + rnd() * 0.06, birth: 0.5 + rnd() * 0.25 }
  })
  for (let i = 0; i < moss.count; i++) {
    const v = rnd()
    moss.setColorAt(i, c.setRGB(0.1 + v * 0.08, 0.17 + v * 0.1, 0.05 + v * 0.03))
  }
  moss.receiveShadow = true
  group.add(moss)

  function update(g: number) {
    for (let i = 0; i < grassCount; i++) {
      const d = grassData[i]
      const k = smoothstep(0.22 + d.r * 0.02, 0.42 + d.r * 0.025, g)
      if (k <= 0.001) {
        grass.setMatrixAt(i, zero)
        continue
      }
      o.position.set(d.x, 0, d.z)
      o.rotation.set(d.lean, d.yaw, 0)
      o.scale.set(d.w, d.h * k, d.w)
      o.updateMatrix()
      grass.setMatrixAt(i, o.matrix)
    }
    grass.instanceMatrix.needsUpdate = true

    for (let i = 0; i < moss.count; i++) {
      const d = mossData[i]
      const k = smoothstep(d.birth, d.birth + 0.15, g)
      if (k <= 0.001) {
        moss.setMatrixAt(i, zero)
        continue
      }
      o.position.set(d.x, 0, d.z)
      o.rotation.set(0, 0, 0)
      o.scale.set(d.s * k, d.s * 0.45 * k, d.s * k)
      o.updateMatrix()
      moss.setMatrixAt(i, o.matrix)
    }
    moss.instanceMatrix.needsUpdate = true
  }

  return { group, update }
}
