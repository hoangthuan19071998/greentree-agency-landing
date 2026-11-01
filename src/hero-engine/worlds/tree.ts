import {
  CylinderGeometry,
  DynamicDrawUsage,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  Vector2,
  Vector3,
  Color,
  DoubleSide,
} from 'three'
import { TAU, mulberry32, smoothstep } from '../math'
import { barkTexture, leafTexture } from '../textures/canvas2d'

// One procedural tree that grows continuously with g ∈ [0, 1]:
// seed (0) → sprout → sapling → young tree → mature tree (1).

interface Seg {
  parent: number
  dir: Vector3
  quat: Quaternion
  len: number
  r0: number
  r1: number
  birth: number
  dur: number
  depth: number
  root: boolean
}

interface Leaf {
  seg: number
  along: number
  jitter: Vector3
  quat: Quaternion
  size: number
  birth: number
  die: number
}

const UP = new Vector3(0, 1, 0)
const SEGS_BY_DEPTH = [8, 5, 4, 3, 2]

function grow(seed: number) {
  const rnd = mulberry32(seed)
  const segs: Seg[] = []
  const leaves: Leaf[] = []
  let golden = rnd() * TAU

  const jitterDir = (d: Vector3, amt: number) =>
    d
      .clone()
      .add(new Vector3((rnd() - 0.5) * amt, (rnd() - 0.5) * amt, (rnd() - 0.5) * amt))
      .normalize()

  const addLeaves = (seg: number, count: number, size: number, birth: number, die: number) => {
    for (let k = 0; k < count; k++) {
      const q = new Quaternion().setFromAxisAngle(UP, rnd() * TAU)
      q.multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -0.4 - rnd() * 1.4))
      q.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), (rnd() - 0.5) * 1.2))
      leaves.push({
        seg,
        along: 0.25 + rnd() * 0.75,
        jitter: new Vector3(rnd() - 0.5, rnd() - 0.4, rnd() - 0.5).multiplyScalar(0.45),
        quat: q,
        size: size * (0.75 + rnd() * 0.5),
        birth,
        die,
      })
    }
  }

  const branch = (
    parent: number,
    dir0: Vector3,
    length: number,
    radius: number,
    depth: number,
    birth: number,
    segDur: number,
  ) => {
    const n = SEGS_BY_DEPTH[depth]
    let dir = dir0.clone()
    let prev = parent
    for (let i = 0; i < n; i++) {
      const tropism = depth === 0 ? 0.1 : depth === 1 ? 0.07 : -0.05
      dir = jitterDir(dir, depth === 0 ? 0.16 : 0.32)
      dir.y += tropism
      dir.normalize()
      const f0 = 1 - (i / n) * 0.5
      const f1 = 1 - ((i + 1) / n) * 0.5
      const idx = segs.length
      const segBirth = birth + i * segDur
      segs.push({
        parent: prev,
        dir: dir.clone(),
        quat: new Quaternion().setFromUnitVectors(UP, dir),
        len: length / n,
        r0: radius * f0,
        r1: radius * f1,
        birth: segBirth,
        dur: segDur * 1.5,
        depth,
        root: false,
      })
      prev = idx
      const segEnd = segBirth + segDur

      const canBranch = depth < 4 && (depth === 0 ? i >= 3 : i >= 1 && rnd() < 0.55)
      if (canBranch) {
        const count = depth === 0 ? (i === n - 1 ? 3 : 2) : rnd() < 0.5 ? 2 : 1
        for (let c = 0; c < count; c++) {
          golden += 2.39996
          const spread = depth === 0 ? 0.8 + rnd() * 0.35 : 0.45 + rnd() * 0.45
          const ref = Math.abs(dir.y) < 0.9 ? UP : new Vector3(1, 0, 0)
          const perp = new Vector3().crossVectors(dir, ref).normalize().applyAxisAngle(dir, golden)
          const childDir = dir
            .clone()
            .multiplyScalar(Math.cos(spread))
            .addScaledVector(perp, Math.sin(spread))
            .normalize()
          const childLen = length * (depth === 0 ? 0.62 : 0.7) * (1 - (i / n) * 0.3) * (0.8 + rnd() * 0.4)
          const childR = radius * f1 * (depth === 0 ? 0.55 : 0.62)
          branch(idx, childDir, childLen, childR, depth + 1, segEnd + 0.01, segDur * 0.85)
        }
      }

      // Early leaves on the young stem fall as the crown takes over.
      if (depth === 0 && i < 4) addLeaves(idx, 3, 0.55, segEnd - segDur * 0.4, 0.4 + i * 0.05)
      if (depth === 1) addLeaves(idx, 4, 0.9, segEnd - segDur * 0.5, 0.8)
      if (depth >= 2) addLeaves(idx, depth >= 3 ? 11 : 6, 1, segEnd - segDur * 0.3, 9)
    }
  }

  branch(-1, UP, 3.8, 0.32, 0, 0, 0.065)

  // Buttress roots flare into the soil late in the growth.
  for (let k = 0; k < 6; k++) {
    const az = (k / 6) * TAU + rnd() * 0.5
    let dir = new Vector3(Math.cos(az), -0.18, Math.sin(az)).normalize()
    let prev = -1
    const len = 0.7 + rnd() * 0.5
    for (let i = 0; i < 2; i++) {
      dir = new Vector3(dir.x, dir.y - 0.12, dir.z).normalize()
      segs.push({
        parent: prev,
        dir: dir.clone(),
        quat: new Quaternion().setFromUnitVectors(UP, dir),
        len: len / 2,
        r0: i === 0 ? 0.2 : 0.11,
        r1: i === 0 ? 0.11 : 0.03,
        birth: 0.38 + i * 0.08,
        dur: 0.2,
        depth: 0,
        root: true,
      })
      prev = segs.length - 1
    }
  }

  const end = Math.max(...segs.map((s) => s.birth + s.dur))
  const k = 0.88 / end
  for (const s of segs) {
    if (s.root) continue
    s.birth *= k
    s.dur *= k
  }
  for (const l of leaves) {
    l.birth *= k
  }
  return { segs, leaves }
}

export interface TreeFrame {
  height: number
  /** A point on the trunk surface axis at ~1.5m, for the camera dive. */
  trunkPoint: Vector3
  trunkRadius: number
  tip: Vector3
}

export function createTree() {
  const { segs, leaves } = grow(7)
  const group = new Group()

  const bark = barkTexture()
  bark.map.repeat.set(2, 1)
  bark.bump.repeat.set(2, 1)
  const barkMat = new MeshStandardMaterial({
    map: bark.map,
    bumpMap: bark.bump,
    bumpScale: 2.5,
    roughness: 0.92,
    color: new Color('#c9bfae'),
  })
  const young = { value: 1 }
  barkMat.onBeforeCompile = (shader) => {
    shader.uniforms.uYoung = young
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uYoung;')
      .replace(
        '#include <map_fragment>',
        '#include <map_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.27, 0.07), uYoung);',
      )
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aTaper;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.xz *= mix(1.0, aTaper, position.y);')
  }

  const segGeo = new CylinderGeometry(1, 1, 1, 14, 1, true)
  segGeo.translate(0, 0.5, 0)
  const segMesh = new InstancedMesh(segGeo, barkMat, segs.length)
  segMesh.instanceMatrix.setUsage(DynamicDrawUsage)
  segGeo.setAttribute(
    'aTaper',
    new InstancedBufferAttribute(new Float32Array(segs.map((s) => s.r1 / s.r0)), 1),
  )
  segMesh.castShadow = segMesh.receiveShadow = true
  segMesh.frustumCulled = false

  const jointMesh = new InstancedMesh(new SphereGeometry(1, 12, 8), barkMat, segs.length)
  jointMesh.instanceMatrix.setUsage(DynamicDrawUsage)
  jointMesh.castShadow = jointMesh.receiveShadow = true
  jointMesh.frustumCulled = false
  // spheres have no aTaper; give them a constant one
  ;(jointMesh.geometry as SphereGeometry).setAttribute(
    'aTaper',
    new InstancedBufferAttribute(new Float32Array(segs.length).fill(1), 1),
  )

  const leafMat = new MeshStandardMaterial({
    map: leafTexture(),
    alphaTest: 0.5,
    side: DoubleSide,
    roughness: 0.6,
    emissive: new Color('#7f9a3a'),
    emissiveIntensity: 0.55,
  })
  leafMat.emissiveMap = leafMat.map
  const leafGeo = new PlaneGeometry(0.55, 1)
  leafGeo.translate(0, 0.5, 0)
  const leafMesh = new InstancedMesh(leafGeo, leafMat, leaves.length + 2)
  leafMesh.instanceMatrix.setUsage(DynamicDrawUsage)
  leafMesh.castShadow = true
  leafMesh.receiveShadow = true
  leafMesh.frustumCulled = false
  const rnd = mulberry32(3)
  const tint = new Color()
  for (let i = 0; i < leaves.length + 2; i++) {
    const v = rnd()
    tint.setRGB(0.75 + v * 0.35, 0.8 + v * 0.25, 0.65 + v * 0.2)
    leafMesh.setColorAt(i, tint)
  }

  // The seed: an almond-shaped shell, split by the first shoot.
  const pts: Vector2[] = []
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    pts.push(new Vector2(Math.sin(Math.PI * t) * 0.011 * (1 - 0.3 * t), -Math.cos(Math.PI * t) * 0.02))
  }
  const seed = new Mesh(
    new LatheGeometry(pts, 40),
    new MeshPhysicalMaterial({ color: '#6b4a2b', roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.3, sheen: 0.4 }),
  )
  seed.castShadow = seed.receiveShadow = true
  seed.rotation.z = 0.55
  seed.position.set(0.011, 0.006, -0.002)
  group.add(segMesh, jointMesh, leafMesh, seed)

  const m = new Matrix4()
  const q = new Quaternion()
  const sc = new Vector3()
  const starts = segs.map(() => new Vector3())
  const ends = segs.map(() => new Vector3())
  const zero = new Matrix4().makeScale(0, 0, 0)
  const o = new Object3D()

  function update(g: number): TreeFrame {
    // young stems are green; bark browns in with age
    young.value = 1 - smoothstep(0.12, 0.42, g)
    barkMat.bumpScale = 2.5 * smoothstep(0.15, 0.5, g)
    const s = 0.04 + 0.96 * Math.pow(g, 1.3)
    const thick = 0.1 + 0.9 * Math.pow(g, 1.1)
    let height = 0.02
    let tip = new Vector3()
    let tipY = -1

    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i]
      const p = smoothstep(seg.birth, seg.birth + seg.dur, g)
      const start = starts[i]
      // the shoot leaves through the seed's tip, then the seed sinks away
      if (seg.parent < 0) start.set(0, seg.root ? 0.04 * s : 0.019 * (1 - smoothstep(0.12, 0.34, g)), 0)
      else start.copy(ends[seg.parent])
      const len = seg.len * p * s
      ends[i].copy(start).addScaledVector(seg.dir, len)
      if (p <= 0.0001) {
        segMesh.setMatrixAt(i, zero)
        jointMesh.setMatrixAt(i, zero)
        continue
      }
      const r = seg.r0 * s * thick * (0.35 + 0.65 * p)
      m.compose(start, seg.quat, sc.set(r, len, r))
      segMesh.setMatrixAt(i, m)
      m.compose(start, q.identity(), sc.set(r, r, r))
      jointMesh.setMatrixAt(i, m)
      height = Math.max(height, ends[i].y)
      if (seg.depth === 0 && !seg.root && ends[i].y > tipY) {
        tipY = ends[i].y
        tip = ends[i].clone()
      }
    }

    const leafScale = 0.24 * (0.55 + 0.45 * smoothstep(0, 0.8, g))
    for (let i = 0; i < leaves.length; i++) {
      const L = leaves[i]
      const segP = smoothstep(segs[L.seg].birth, segs[L.seg].birth + segs[L.seg].dur, g)
      const lp = smoothstep(L.birth, L.birth + 0.07, g) * (1 - smoothstep(L.die, L.die + 0.08, g)) * smoothstep(0.2, 0.6, segP)
      if (lp <= 0.001) {
        leafMesh.setMatrixAt(i, zero)
        continue
      }
      o.position.copy(starts[L.seg]).lerp(ends[L.seg], L.along).addScaledVector(L.jitter, s * 0.9)
      o.quaternion.copy(L.quat)
      const k = L.size * leafScale * lp
      o.scale.set(k, k, k)
      o.updateMatrix()
      leafMesh.setMatrixAt(i, o.matrix)
      height = Math.max(height, o.position.y + k * 0.5)
    }

    // Two seed leaves (cotyledons) open at the tip of the sprout, then wither.
    const cot = smoothstep(0.035, 0.09, g) * (1 - smoothstep(0.28, 0.38, g))
    for (let c = 0; c < 2; c++) {
      const idx = leaves.length + c
      if (cot <= 0.001) {
        leafMesh.setMatrixAt(idx, zero)
        continue
      }
      o.position.copy(tip)
      o.quaternion.setFromAxisAngle(UP, c * Math.PI + 0.4)
      o.quaternion.multiply(q.setFromAxisAngle(new Vector3(1, 0, 0), 1.0 - cot * 0.3))
      const k = 0.032 * cot
      o.scale.set(k * 1.3, k, k)
      o.updateMatrix()
      leafMesh.setMatrixAt(idx, o.matrix)
    }

    segMesh.instanceMatrix.needsUpdate = true
    jointMesh.instanceMatrix.needsUpdate = true
    leafMesh.instanceMatrix.needsUpdate = true

    const seedK = 1 - smoothstep(0.22, 0.34, g)
    seed.visible = seedK > 0.001
    seed.scale.setScalar(Math.max(seedK, 0.001))

    // trunk dive target: trunk segment 2 (≈ 1.2–1.7 m on the grown tree)
    const ti = 2
    const trunkPoint = starts[ti].clone().lerp(ends[ti], 0.5)
    const trunkRadius = segs[ti].r0 * s * thick * 0.85
    return { height, trunkPoint, trunkRadius, tip }
  }

  return { group, update }
}
