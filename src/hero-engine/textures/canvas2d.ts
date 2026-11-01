import { CanvasTexture, RepeatWrapping, SRGBColorSpace, NoColorSpace } from 'three'
import { mulberry32 } from '../math'

// Every texture in the hero is painted here with Canvas 2D: no image files.

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

const toTexture = (c: HTMLCanvasElement, srgb = true, repeat = false) => {
  const t = new CanvasTexture(c)
  t.colorSpace = srgb ? SRGBColorSpace : NoColorSpace
  t.anisotropy = 8
  if (repeat) t.wrapS = t.wrapT = RepeatWrapping
  return t
}

export function leafTexture() {
  const rnd = mulberry32(11)
  const c = canvas(256, 512)
  const g = c.getContext('2d')!
  const leaf = new Path2D()
  leaf.moveTo(128, 506)
  leaf.bezierCurveTo(30, 420, 6, 220, 128, 10)
  leaf.bezierCurveTo(250, 220, 226, 420, 128, 506)

  const grad = g.createLinearGradient(0, 512, 0, 0)
  grad.addColorStop(0, '#2c5236')
  grad.addColorStop(0.55, '#4f7a3f')
  grad.addColorStop(1, '#86a04c')
  g.fillStyle = grad
  g.fill(leaf)

  g.save()
  g.clip(leaf)
  for (let i = 0; i < 700; i++) {
    const light = rnd() > 0.5
    g.fillStyle = light ? 'rgba(201,216,176,0.06)' : 'rgba(20,38,30,0.08)'
    g.beginPath()
    g.arc(rnd() * 256, rnd() * 512, 2 + rnd() * 10, 0, Math.PI * 2)
    g.fill()
  }
  g.strokeStyle = 'rgba(221,226,170,0.55)'
  g.lineWidth = 4
  g.beginPath()
  g.moveTo(128, 506)
  g.lineTo(128, 30)
  g.stroke()
  g.lineWidth = 2
  for (let i = 0; i < 9; i++) {
    const y = 450 - i * 46
    for (const side of [-1, 1]) {
      g.beginPath()
      g.moveTo(128, y)
      g.quadraticCurveTo(128 + side * 50, y - 30, 128 + side * 100, y - 80)
      g.stroke()
    }
  }
  g.lineWidth = 8
  g.strokeStyle = 'rgba(20,38,30,0.45)'
  g.stroke(leaf)
  g.restore()
  return toTexture(c)
}

export function barkTexture() {
  const rnd = mulberry32(23)
  const c = canvas(512, 1024)
  const g = c.getContext('2d')!
  g.fillStyle = '#3a3127'
  g.fillRect(0, 0, 512, 1024)
  for (let i = 0; i < 320; i++) {
    const dark = rnd() > 0.45
    g.strokeStyle = dark ? 'rgba(18,15,11,0.55)' : 'rgba(118,100,78,0.32)'
    g.lineWidth = dark ? 3 + rnd() * 9 : 2 + rnd() * 5
    let x = rnd() * 512
    const y0 = rnd() * 300 - 150
    const len = 300 + rnd() * 900
    g.beginPath()
    g.moveTo(x, y0)
    for (let y = y0; y < y0 + len; y += 24) {
      x += (rnd() - 0.5) * 9
      g.lineTo(x, y)
    }
    g.stroke()
  }
  for (let i = 0; i < 60; i++) {
    g.fillStyle = 'rgba(16,13,10,0.5)'
    g.fillRect(rnd() * 512, rnd() * 1024, 10 + rnd() * 30, 2 + rnd() * 3)
  }
  // moss creeping up from the bottom of each segment
  for (let k = 0; k < 40; k++) {
    const cx = rnd() * 512
    const cy = 1024 - Math.pow(rnd(), 2.2) * 700
    for (let i = 0; i < 60; i++) {
      g.fillStyle = `rgba(${70 + rnd() * 40},${95 + rnd() * 40},${40 + rnd() * 20},${0.15 + rnd() * 0.25})`
      g.beginPath()
      g.arc(cx + (rnd() - 0.5) * 50, cy + (rnd() - 0.5) * 70, 1 + rnd() * 2.5, 0, Math.PI * 2)
      g.fill()
    }
  }
  const map = toTexture(c, true, true)
  const bump = toTexture(c, false, true)
  return { map, bump }
}

export function soilTexture() {
  const rnd = mulberry32(5)
  const c = canvas(512, 512)
  const g = c.getContext('2d')!
  g.fillStyle = '#231b14'
  g.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 9000; i++) {
    const v = rnd()
    g.fillStyle =
      v < 0.5 ? `rgba(12,9,6,${0.3 + rnd() * 0.4})` : v < 0.9 ? `rgba(70,54,38,${0.2 + rnd() * 0.4})` : `rgba(120,100,70,${0.3 + rnd() * 0.4})`
    const r = 0.5 + rnd() * 3
    g.fillRect(rnd() * 512, rnd() * 512, r, r)
  }
  return toTexture(c, true, true)
}

export function dotTexture() {
  const c = canvas(64, 64)
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.55)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return toTexture(c)
}

export function rayTexture() {
  const c = canvas(128, 256)
  const g = c.getContext('2d')!
  const across = g.createLinearGradient(0, 0, 128, 0)
  across.addColorStop(0, 'rgba(255,255,255,0)')
  across.addColorStop(0.5, 'rgba(255,255,255,1)')
  across.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = across
  g.fillRect(0, 0, 128, 256)
  g.globalCompositeOperation = 'destination-in'
  const along = g.createLinearGradient(0, 0, 0, 256)
  along.addColorStop(0, 'rgba(0,0,0,0)')
  along.addColorStop(0.25, 'rgba(0,0,0,1)')
  along.addColorStop(0.7, 'rgba(0,0,0,0.8)')
  along.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = along
  g.fillRect(0, 0, 128, 256)
  return toTexture(c)
}
