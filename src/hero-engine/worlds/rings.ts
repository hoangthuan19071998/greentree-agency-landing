import { CircleGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, RingGeometry, ShaderMaterial, Vector3 } from 'three'
import { col } from '../palette'
import { barkTexture } from '../textures/canvas2d'

// The cross-section the camera finds inside the trunk. Growth rings, rays and
// grain are all computed in the shader; uTwist turns them into the closing swirl.

export const RING_CENTER = new Vector3(0, -200, 0)

export function createRings() {
  const group = new Group()
  group.position.copy(RING_CENTER)

  const mat = new ShaderMaterial({
    fog: false,
    uniforms: {
      uTwist: { value: 0 },
      uTime: { value: 0 },
      uLight: { value: col('woodLight') },
      uDark: { value: col('woodDark') },
      uSun: { value: col('sunlight') },
      uGlow: { value: col('lichen') },
      uGlowAmt: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vP = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTwist, uTime, uGlowAmt;
      uniform vec3 uLight, uDark, uSun, uGlow;
      varying vec2 vP;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float s = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; }
        return s;
      }
      void main() {
        float r = length(vP);
        float a = atan(vP.y, vP.x);
        a += uTwist * pow(1.0 - r, 2.0) * 5.0;
        vec2 q = vec2(cos(a), sin(a)) * r;
        float rr = r + (fbm(q * 2.5 + 3.0) - 0.5) * 0.09 + (fbm(q * 11.0) - 0.5) * 0.012;
        float rings = rr * 42.0 + fbm(vec2(rr * 6.0, 1.7)) * 4.0;
        float f = fract(rings);
        float late = smoothstep(0.62, 0.9, f) * (1.0 - smoothstep(0.93, 1.0, f));
        float grain = (fbm(vec2(a * 60.0, rr * 260.0)) - 0.5) * 0.35;
        float age = smoothstep(0.0, 0.9, r);
        vec3 wood = mix(uDark * 1.2, uLight, 0.55 + 0.45 * age);
        vec3 c = mix(wood, uDark * 0.7, late * 0.85);
        c *= 1.0 + grain * 0.4;
        // medullary rays
        float ray = smoothstep(0.996, 1.0, abs(sin(a * 41.0 + fbm(q * 6.0) * 3.0))) * 0.25;
        c *= 1.0 - ray;
        // radial checks (drying cracks)
        float crack = smoothstep(0.9993, 1.0, abs(sin(a * 1.0 + 0.6 + fbm(vec2(rr * 3.0, a)) * 1.4))) * smoothstep(0.35, 0.95, r);
        c = mix(c, uDark * 0.25, crack);
        // raking light across the ridges
        float ridge = cos(rings * 6.2831853);
        vec3 n = normalize(vec3(normalize(vP + 1e-5) * ridge * 0.22, 1.0));
        vec3 l = normalize(vec3(0.55, 0.45, 0.7));
        float diff = max(dot(n, l), 0.0);
        float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 30.0);
        c = c * (0.25 + 0.8 * diff) + uSun * spec * 0.45;
        c *= mix(0.55, 1.0, smoothstep(0.0, 0.05, r));
        // warm glow at the heart, darker toward the bark
        c *= mix(1.25, 0.45, smoothstep(0.05, 1.0, r));
        // closing swirl: rings light up as lines of lichen-light
        c = mix(c, uGlow * (0.06 + late * 0.75) * mix(1.2, 0.5, r), uGlowAmt);
        gl_FragColor = vec4(c, 1.0);
      }`,
  })

  const disc = new Mesh(new CircleGeometry(1, 256), mat)
  disc.rotation.x = -Math.PI / 2
  group.add(disc)

  const bark = barkTexture()
  bark.map.repeat.set(8, 0.5)
  const barkMat = new MeshStandardMaterial({ map: bark.map, bumpMap: bark.bump, bumpScale: 3, roughness: 0.95, color: '#9a8f80' })
  const lip = new Mesh(new RingGeometry(0.985, 1.07, 256, 1), barkMat)
  lip.rotation.x = -Math.PI / 2
  lip.position.y = 0.002
  const side = new Mesh(new CylinderGeometry(1.07, 1.07, 0.6, 128, 1, true), barkMat)
  side.position.y = -0.3
  group.add(lip, side)

  function update(opts: { twist: number; glow: number; time: number }) {
    mat.uniforms.uTwist.value = opts.twist
    mat.uniforms.uGlowAmt.value = opts.glow
    mat.uniforms.uTime.value = opts.time
  }

  return { group, update }
}
