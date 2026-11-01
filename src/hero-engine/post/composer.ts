import { Vector2, type PerspectiveCamera, type Scene, type WebGLRenderer } from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { col } from '../palette'

// DOF → Bloom → Tone mapping (ACES, in OutputPass) → Grade.

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uFade: { value: 0 },
    uVignette: { value: 0.9 },
    uGrain: { value: 0.045 },
    uShadow: { value: col('heartwood') },
    uHigh: { value: col('sunlight') },
    uRes: { value: new Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uFade, uVignette, uGrain;
    uniform vec3 uShadow, uHigh;
    uniform vec2 uRes;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      // split-tone: forest in the shadows, sunlight in the highlights
      c = mix(c, c * 0.6 + uShadow * 0.5, (1.0 - smoothstep(0.0, 0.45, l)) * 0.35);
      c = mix(c, c * (0.85 + uHigh * 0.3), smoothstep(0.45, 1.0, l) * 0.5);
      c = mix(vec3(l), c, 0.92);
      vec2 d = vUv - 0.5;
      d.x *= uRes.x / uRes.y;
      float v = smoothstep(1.05, 0.25, length(d));
      c *= mix(1.0, v, uVignette);
      c += (hash(vUv * uRes + fract(uTime) * 100.0) - 0.5) * uGrain;
      c = mix(c, uShadow * 0.6, uFade);
      gl_FragColor = vec4(c, 1.0);
    }`,
}

export function createComposer(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera) {
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bokeh = new BokehPass(scene, camera, { focus: 1, aperture: 0.002, maxblur: 0.008 })
  composer.addPass(bokeh)
  const bloom = new UnrealBloomPass(new Vector2(1, 1), 0.55, 0.7, 0.82)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())
  const grade = new ShaderPass(GradeShader)
  composer.addPass(grade)

  const bu = bokeh.uniforms as Record<string, { value: number }>

  return {
    composer,
    setSize(w: number, h: number, dpr: number) {
      composer.setPixelRatio(dpr)
      composer.setSize(w, h)
      grade.uniforms.uRes.value.set(w * dpr, h * dpr)
    },
    set(opts: { focus: number; aperture: number; maxblur: number; fade: number; time: number; bloom: number; dof: boolean }) {
      bokeh.enabled = opts.dof
      bu.focus.value = opts.focus
      bu.aperture.value = opts.aperture
      bu.maxblur.value = opts.maxblur
      bloom.strength = opts.bloom
      grade.uniforms.uFade.value = opts.fade
      grade.uniforms.uTime.value = opts.time
    },
    render() {
      composer.render()
    },
  }
}
