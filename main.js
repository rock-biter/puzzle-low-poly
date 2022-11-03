import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'

const gui = new GUI()

const startAngle = {
	x: Math.PI * 2 * Math.random(),
	y: Math.PI * 2 * Math.random(),
}

const lastMousePos = new THREE.Vector2(0, 0)
const mouse = new THREE.Vector2(
	Math.random() * 360 - 180,
	Math.random() * 360 - 180
)
let drag = false

const dir = new THREE.Vector3().setFromSphericalCoords(
	1,
	startAngle.y + mouse.y,
	startAngle.x + mouse.x
)
const arrow = new THREE.ArrowHelper(
	dir,
	new THREE.Vector3(0, 0, 0),
	2,
	'#ff0000'
)

function onMove(e) {
	if (!drag) return
	mouse.x = -lastMousePos.x + e.pageX
	mouse.y = lastMousePos.y - e.pageY

	console.log(mouse)
}

window.addEventListener('mousedown', function (e) {
	lastMousePos.x = e.pageX - mouse.x
	lastMousePos.y = e.pageY + mouse.y

	drag = true
})

window.addEventListener('mouseup', function () {
	drag = false
})

window.addEventListener('mousemove', onMove)

const scene = new THREE.Scene()
// const camera = new THREE.PerspectiveCamera(
// 	75,
// 	window.innerWidth / window.innerHeight,
// 	0.1,
// 	1000
// )
// scene.add(arrow)
const width = window.innerWidth * 0.005
const height = window.innerHeight * 0.005

const camera = new THREE.OrthographicCamera(
	-width / 2,
	width / 2,
	height / 2,
	-height / 2,
	0.1,
	100
)

const axesHelper = new THREE.AxesHelper(5)
// scene.add(axesHelper)

const renderer = new THREE.WebGLRenderer({
	antialias: true,
})

renderer.physicallyCorrectLights = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 4

renderer.setClearColor(new THREE.Color('#dcddff'))
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// const controls = new OrbitControls(camera, renderer.domElement)

camera.position.set(0, 0, 5)
camera.lookAt(new THREE.Vector3(0, 0, 0))

// controls.update()
const uPos = { value: Math.random() * 0.3 + 0.3 }

gui.add(uPos, 'value', 0, 1).name('uPos')

let foxMeshes = []

const loader = new GLTFLoader()

/**
 *
 * @param {THREE.Mesh} mesh
 */
function breakMesh(group) {
	foxMeshes = group.children
	foxMeshes.forEach(({ children }) => {
		const [mesh] = children
		const m = new THREE.MeshStandardMaterial({
			color: mesh.material.color,
			side: THREE.DoubleSide,
		})
		m.onBeforeCompile = (shader) => {
			shader.uniforms = Object.assign(shader.uniforms, {
				uOffset: { value: Math.random() },
				uPos,
				uMouse: { value: mouse },
				uCenter: { value: mesh.geometry.boundingSphere.center },
			})

			console.log(shader.vertexShader)

			shader.vertexShader = shader.vertexShader.replace(
				'#include <common>',
				`
				#include <common>
				uniform float uOffset;
				uniform float uPos;
				uniform vec2 uMouse;
				uniform vec3 uCenter;

				mat2 rotate2d(float _angle) {
					return mat2(cos(_angle),-sin(_angle),
											sin(_angle),cos(_angle));
				}

				vec2 rotateAroundVertex(float _angle,vec2 p,vec2 o) {
					p -= o;
					p *= rotate2d(_angle);
					p += o;
					return p;
				}
			`
			)

			shader.vertexShader = shader.vertexShader.replace(
				'#include <begin_vertex>',
				`
				
				vec3 transformed = vec3( position );
				float nOffset = uOffset -.5;
				float offset = dot(normalize(uMouse),vec2(0,1)) - 1.;
				float zOffset = 60.;
				
				// transformed *= offset * nOffset;
				float a = -uMouse.y * 0.01;
				float b = -uMouse.x * 0.01;
				
				vec3 center = uCenter + vec3(0,0,zOffset * nOffset);
				transformed.z += zOffset * nOffset;

				transformed.xz *= rotate2d( b );
				transformed.yz *= rotate2d( a );

				center.xz *= rotate2d( b );
				center.yz *= rotate2d( a );
				
				
				transformed.xz = rotateAroundVertex( -b ,transformed.xz, center.xz );
				transformed.yz = rotateAroundVertex( -a ,transformed.yz, center.yz );

				// vec2 p = vec2(transformed.xy) - vec2(20.,0);
				// transformed.xy = p*rotate2d( a ) + vec2(20.,0) ;

				transformed.xy = rotateAroundVertex( sin(b) * sin(b) * sin(b) * 3.14 ,transformed.xy,center.xy );
			
			`
			)
		}

		mesh.material = m
	})
}

// loader.load('./src/gltf/Fox.gltf', (gltf) => {
// 	// const fox = gltf.scene.children[0].children[0].children[0].children[0]
// 	const animal = gltf.scene
// 	// fox.rotateX(-Math.PI * 0.5)
// 	// fox.position.set(0, 0, 2)
// 	scene.add(animal)
// 	console.log(animal)

// 	// breakMesh(animal)
// })

let animal
let meshes = []
let positions = []

loader.load('./src/gltf/cane_flat.gltf', (gltf) => {
	// const fox = gltf.scene.children[0].children[0].children[0].children[0]
	animal = gltf.scene
	// fox.rotateX(-Math.PI * 0.5)
	// fox.position.set(0, 0, 2)
	animal.scale.copy(new THREE.Vector3(5, 5, 5))
	scene.add(animal)
	console.log(animal)

	breakMesh(animal)

	animal.children.forEach((el) => {
		// el.position.z += (Math.random() - 0.5) * 1
		// const mesh = el.children[0]
		// positions.push(mesh.localToWorld(mesh.geometry.boundingSphere.center))
		// mesh.position.z += (Math.random() - 0.5) * 1.5
		// meshes.push(mesh)
		// scene.add(mesh)
	})

	console.log(positions, meshes)
	// camera.lookAt(animal)
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
	// controls.update()
	const t = clock.getElapsedTime()

	// foxMeshes.forEach((mesh, i) => {
	// 	mesh.position.x += Math.sin(t + i * 10) ** 2 * 0.001
	// 	mesh.position.y +=
	// 		(Math.sin(t + i * 10) ** 2 - Math.cos(t + i * 10) ** 2) * 0.001
	// 	// mesh.position.z += Math.sin(t + i * 10) * 0.01
	// })
	arrow.setDirection(
		new THREE.Vector3().setFromSphericalCoords(
			1,
			startAngle.y + mouse.y / 300,
			startAngle.x + mouse.x / 300
		)
	)

	if (animal) {
		const x = -mouse.x / 300
		const y = -mouse.y / 300

		// animal.rotation.x = -mouse.y / 300
		// animal.rotation.y = mouse.x / 300

		// meshes.forEach((el, i) => {
		// 	// el.rotation.z = Math.PI * 2. * sin
		// 	// const r = positions[i].length()
		// 	// const x = Math.sin(y) * r
		// 	// el.position.x = positions[i].x + addX
		// 	el.position.x =
		// 		positions[i].x * Math.cos(x) + positions[i].z * Math.sin(x)
		// 	// el.position.z = positions[i].z + addZ
		// 	el.position.z =
		// 		positions[i].x * Math.sin(x) - positions[i].z * Math.cos(x)
		// })
	}

	renderer.render(scene, camera)
}

animate()
