import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'

const gui = new GUI()

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)

const renderer = new THREE.WebGLRenderer({
	antialias: true,
})

renderer.physicallyCorrectLights = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 4

renderer.setClearColor(new THREE.Color('#dcddff'))
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

camera.position.set(4, 1, 3)
controls.update()
const uPos = { value: Math.random() * 0.3 + 0.3 }

gui.add(uPos, 'value', 0, 1).name('uPos')

let foxMeshes = []

const loader = new GLTFLoader()

/**
 *
 * @param {THREE.Mesh} mesh
 */
function breakMesh(mesh) {
	// const { geometry: geom } = mesh
	// const index = geom.index

	// console.log(index)

	// for (let i = 0; i < index.count; i++) {
	// 	const a = index.getX(i)
	// 	const b = index.getY(i)
	// 	const c = index.getZ(i)

	// 	const vertices = [a, b, c]
	// }
	// console.log(mesh.children)

	foxMeshes = mesh.children
	foxMeshes.forEach((el) => {
		const m = new THREE.MeshStandardMaterial({ color: el.material.color })
		m.onBeforeCompile = (shader) => {
			shader.uniforms = Object.assign(shader.uniforms, {
				uOffset: { value: Math.random() },
				uPos,
			})

			console.log(shader.vertexShader)

			shader.vertexShader = shader.vertexShader.replace(
				'#include <common>',
				`
				#include <common>
				uniform float uOffset;
				uniform float uPos;

				mat2 rotate2d(float _angle) {
					return mat2(cos(_angle),-sin(_angle),
											sin(_angle),cos(_angle));
				}
			`
			)

			shader.vertexShader = shader.vertexShader.replace(
				'#include <begin_vertex>',
				`
				
			vec3 transformed = vec3( position );
			float nOffset = uOffset -.5;
			
			transformed.x += nOffset * uPos * 3.;
			// transformed.y *= sin( nOffset * uPos ) * 5. * nOffset;
			transformed.xz *= rotate2d(-uOffset * uPos * 3.14 * 0.25);
			transformed.yz *= rotate2d(-uOffset * uPos * 3.14 * 0.25);
			
			
			`
			)
		}

		el.material = m
	})
}

loader.load('./src/gltf/Fox.gltf', (gltf) => {
	// const fox = gltf.scene.children[0].children[0].children[0].children[0]
	const fox = gltf.scene
	// fox.rotateX(-Math.PI * 0.5)
	// fox.position.set(0, 0, 2)
	scene.add(fox)
	console.log(fox)

	breakMesh(fox)
})

const aLight = new THREE.AmbientLight(0xffffff, 0.5) // soft white light
scene.add(aLight)

const lightA = new THREE.PointLight(0xff9999, 40, 100)
lightA.position.set(20, 20, 20)
scene.add(lightA)

const lightB = new THREE.PointLight(0x8888ff, 20, 100)
lightB.position.set(-10, -0, 0)
scene.add(lightB)

const lightC = new THREE.PointLight(0xffffaa, 25, 300)
lightC.position.set(0, 10, 0)
scene.add(lightC)
let clock = new THREE.Clock()
clock.start()

function animate() {
	requestAnimationFrame(animate)

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update()
	const t = clock.getElapsedTime()

	// foxMeshes.forEach((mesh, i) => {
	// 	mesh.position.x += Math.sin(t + i * 10) ** 2 * 0.001
	// 	mesh.position.y +=
	// 		(Math.sin(t + i * 10) ** 2 - Math.cos(t + i * 10) ** 2) * 0.001
	// 	// mesh.position.z += Math.sin(t + i * 10) * 0.01
	// })

	renderer.render(scene, camera)
}

animate()
