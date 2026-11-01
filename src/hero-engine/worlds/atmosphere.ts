import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three'
import { TAU, mulberry32, smoothstep } from '../math'
import { col } from '../palette'
import { dotTexture, rayTexture } from '../textures/canvas2d'

// Sky glow, sun shafts, floating dust and out-of-focus bokeh lights.

export const SUN_DIR = new Vector3(0.55, 0.62, -0.62).normalize()

export function createAtmosphere(camera: PerspectiveCamera) {
  const group = new Group()
  const rnd = mulberry32(31)

  const sky = new Mesh(
    new SphereGeometry(1, 48, 24),
    new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uLow: { value: col('skyLow') },
        uHigh: { value: col('skyHigh') },
        uSun: { value: col('sunlight') },
        uSunDir: { value: SUN_DIR },
        uSunAmt: { value: 1 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vDir = normalize(wp.xyz - cameraPosition);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uLow, uHigh, uSun, uSunDir;
        uniform float uSunAmt;
        varying vec3 vDir;
        void main() {
          float h = vDir.y;
          vec3 c = mix(uLow, uHigh, smoothstep(-0.05, 0.7, h));
          float d = max(dot(vDir, uSunDir), 0.0);
          c += uSun * (pow(d, 14.0) * 0.28 + pow(d, 90.0) * 2.2) * uSunAmt;
          gl_FragColor = vec4(c, 1.0);
        }`,
    }),
  )
  sky.frustumCulled = false
  sky.renderOrder = -1
  group.add(sky)

  // sun shafts: camera-facing planes along the light direction
  const rayMat = new MeshBasicMaterial({
    map: rayTexture(),
    color: col('sunlight'),
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    fog: false,
    opacity: 0,
  })
  const rays = Array.from({ length: 11 }, () => {
    const m = new Mesh(new PlaneGeometry(1, 1), rayMat.clone())
    m.frustumCulled = false
    group.add(m)
    return { m, ox: (rnd() - 0.3) * 1.4, oz: (rnd() - 0.5) * 1.0, w: 0.05 + rnd() * 0.18, a: 0.4 + rnd() * 0.6 }
  })

  const dot = dotTexture()
  const dustCount = 900
  const dustBase = new Float32Array(dustCount * 3)
  const dustPhase = new Float32Array(dustCount)
  for (let i = 0; i < dustCount; i++) {
    dustBase[i * 3] = (rnd() - 0.5) * 2
    dustBase[i * 3 + 1] = (rnd() - 0.5) * 1.4
    dustBase[i * 3 + 2] = (rnd() - 0.5) * 2
    dustPhase[i] = rnd() * TAU
  }
  const dustGeo = new BufferGeometry()
  dustGeo.setAttribute('position', new Float32BufferAttribute(dustBase.slice(), 3))
  const dust = new Points(
    dustGeo,
    new PointsMaterial({
      map: dot,
      color: col('sunlight'),
      size: 0.01,
      transparent: true,
      opacity: 0.75,
      blending: AdditiveBlending,
      depthWrite: false,
      fog: false,
    }),
  )
  dust.frustumCulled = false
  group.add(dust)

  // bokeh: big soft discs riding with the camera, far behind the subject
  const bokeh = new Group()
  for (const [count, size, colour, opacity] of [
    [70, 22, 'sunlight', 0.22],
    [40, 46, 'lichen', 0.12],
  ] as const) {
    const pos: number[] = []
    for (let i = 0; i < count; i++) pos.push((rnd() - 0.3) * 1.6, (rnd() - 0.2) * 0.9, -1)
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(pos, 3))
    const pts = new Points(
      g,
      new PointsMaterial({
        map: dot,
        color: col(colour),
        size,
        sizeAttenuation: false,
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    )
    pts.frustumCulled = false
    bokeh.add(pts)
  }
  camera.add(bokeh)

  const basis = new Matrix4()
  const x = new Vector3()
  const z = new Vector3()
  const axis = SUN_DIR.clone().negate()

  function update(opts: { time: number; target: Vector3; dist: number; height: number; light: number; far: number }) {
    const { time, target, dist, height, light, far } = opts
    sky.position.copy(camera.position)
    sky.scale.setScalar(far * 0.85)

    const H = Math.max(height, 0.05)
    for (const r of rays) {
      const center = new Vector3(r.ox * H, H * 0.62, r.oz * H)
      const toCam = camera.position.clone().sub(center).normalize()
      x.crossVectors(axis, toCam).normalize()
      z.crossVectors(x, axis)
      basis.makeBasis(x, axis, z)
      r.m.position.copy(center)
      r.m.quaternion.setFromRotationMatrix(basis)
      r.m.scale.set(H * r.w, H * 2.4, 1)
      ;(r.m.material as MeshBasicMaterial).opacity = 0.13 * r.a * light * (0.85 + 0.15 * Math.sin(time * 0.6 + r.ox * 5))
    }

    const p = dustGeo.attributes.position as Float32BufferAttribute
    for (let i = 0; i < dustCount; i++) {
      const ph = dustPhase[i]
      p.setXYZ(
        i,
        dustBase[i * 3] + Math.sin(time * 0.13 + ph) * 0.06,
        dustBase[i * 3 + 1] + Math.sin(time * 0.09 + ph * 2) * 0.05 + ((time * 0.01 + ph) % 0.2),
        dustBase[i * 3 + 2] + Math.cos(time * 0.11 + ph) * 0.06,
      )
    }
    p.needsUpdate = true
    dust.position.copy(target)
    dust.scale.setScalar(dist * 0.9)
    ;(dust.material as PointsMaterial).size = dist * 0.0045
    ;(dust.material as PointsMaterial).opacity = 0.35 + 0.45 * smoothstep(0.2, 0.8, light)

    bokeh.scale.setScalar(far * 0.6)
  }

  return { group, update, sky }
}
