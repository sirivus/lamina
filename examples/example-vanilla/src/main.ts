import './style.css'
import * as THREE from 'three'
import { LayerMaterial, Base, Depth, Fresnel, Noise } from 'lamina/vanilla'
import { Vector3 } from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer()
renderer.setClearColor('#ebebeb')
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.domElement.style.width = '100%'
renderer.domElement.style.height = '100%'
document.body.appendChild(renderer.domElement)

const randomProps = new Array(20).fill(0).map(() => {
  return {
    position: [
      THREE.MathUtils.randFloat(-5, 5), //
      THREE.MathUtils.randFloat(-5, 5),
      THREE.MathUtils.randFloat(-20, 5),
    ],
    rotation: [
      THREE.MathUtils.randFloat(-10, 10), //
      THREE.MathUtils.randFloat(-10, 10),
      THREE.MathUtils.randFloat(-20, 10),
    ],
    scale: THREE.MathUtils.randFloat(0.05, 1),
  }
})

randomProps.forEach((prop) => {
  const geometry = new THREE.SphereGeometry(1, 128, 64)
  const material = new LayerMaterial({
    layers: [
      new Base({
        color: '#d9d9d9',
        alpha: 1,
        mode: 'normal',
      }),
      new Depth({
        colorA: '#002f4b',
        colorB: '#f2fdff',
        alpha: 1,
        mode: 'multiply',
        near: 0,
        far: 2,
        origin: new Vector3(1, 1, 1),
      }),
      new Fresnel({
        color: '#bffbff',
        alpha: 1,
        mode: 'softlight',
        power: 2,
        intensity: 1,
        bias: 0.1,
      }),
      new Noise({
        colorA: '#a3a3a3',
        alpha: 0.1,
        mode: 'normal',
        scale: 1,
      }),
    ],
  })

  const mesh = new THREE.Mesh(geometry, material)

  const group = new THREE.Group()
  group.add(mesh)
  group.position.fromArray(prop.position)
  group.rotation.fromArray(prop.rotation)
  group.scale.setScalar(prop.scale)

  scene.add(group)
})

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate()
