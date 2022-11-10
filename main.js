import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'
import { Vector3 } from 'three'

import textureUrl from './src/gltf/materialbasecolortexture.png?url'
import model from './src/gltf/cane_2/cane_flat_v2.gltf?url'
import modelBin from './src/gltf/cane_2/cane_flat_v2.bin?url'

let controls
let initialPos

const totalAngle = new THREE.Vector2(Math.random(), Math.random())

const dot = new THREE.SphereGeometry(0.1, 6, 6)
const mat = new THREE.MeshStandardMaterial({ color: '#ff0000' })
const m = new THREE.Mesh(dot, mat)

const texture = new THREE.TextureLoader().load(textureUrl)

m.position.z = 3

applyDeltaRot(m, new THREE.Vector2(totalAngle.x, totalAngle.y))

// const gui = new GUI()
const COS = Math.cos
const SIN = Math.sin
const frustumSize = 5
let aspect = window.innerWidth / window.innerHeight

const startAngle = {
	x: Math.PI * 2 * Math.random(),
	y: Math.PI * 2 * Math.random(),
}

const lastMousePos = new THREE.Vector2(0, 0)
const prevMouse = new THREE.Vector2(
	Math.random() * 360 - 180,
	Math.random() * 360 - 180
)
const mouse = new THREE.Vector2().copy(prevMouse)
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

function applyDeltaRot(mesh, angle2) {
	const a = angle2.x
	const b = -angle2.y

	mesh.position.applyAxisAngle(new Vector3(0, 1, 0), a)
	mesh.position.applyAxisAngle(new Vector3(1, 0, 0), b)
}

function rotatePuzzle(group, angle2) {
	group.children.forEach((el) => {
		applyDeltaRot(el, angle2)
	})
}

function onMove(e) {
	if (!drag) return

	prevMouse.copy(mouse)

	mouse.x = -lastMousePos.x + e.pageX
	mouse.y = lastMousePos.y - e.pageY

	const diff = mouse.clone().sub(prevMouse.clone()).multiplyScalar(0.01)

	const a = diff.x
	const b = diff.y

	totalAngle.x += a
	totalAngle.y -= b

	// const m = new THREE.Matrix3(COS(a), 0, SIN(a), 0, 1, 0, -SIN(a), 0, COS(a))

	// console.log(animal)
	// console.log('prima', animal.children[0].position)
	// console.log(a, b)
	// console.log(m.position)
	const angle2 = new THREE.Vector2(a, b)
	applyDeltaRot(m, angle2)

	rotatePuzzle(animal, angle2)

	// console.log('dopo', animal.children[0].position.applyMatrix3(m))

	// console.log(mouse)
}

function onDown(e) {
	lastMousePos.x = e.pageX - mouse.x
	lastMousePos.y = e.pageY + mouse.y

	drag = true
}

window.addEventListener('mousedown', onDown)
window.addEventListener('touchstart', onDown)

function onUp() {
	drag = false

	mouse.x = 0
	mouse.y = 0
}

window.addEventListener('mouseup', onUp)
window.addEventListener('touchend', onUp)

const scene = new THREE.Scene()
// const camera = new THREE.PerspectiveCamera(
// 	75,
// 	window.innerWidth / window.innerHeight,
// 	0.1,
// 	1000
// )
// scene.add(arrow)

const camera = new THREE.OrthographicCamera(
	(frustumSize * aspect) / -2,
	(frustumSize * aspect) / 2,
	frustumSize / 2,
	frustumSize / -2,
	0.1,
	100
)

function onResize() {
	aspect = window.innerWidth / window.innerHeight

	camera.left = (frustumSize * aspect) / -2
	camera.right = (frustumSize * aspect) / 2
	camera.top = frustumSize / 2
	camera.bottom = frustumSize / -2

	camera.lookAt(new THREE.Vector3(0, 0, 0))

	camera.updateProjectionMatrix()
	controls?.update()

	renderer.setSize(window.innerWidth, window.innerHeight)
}

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

renderer.domElement.addEventListener('mousemove', onMove)
renderer.domElement.addEventListener('touchmove', onMove)

// controls = new OrbitControls(camera, renderer.domElement)

camera.position.set(0, 0, 5)
camera.lookAt(new THREE.Vector3(0, 0, 0))

controls?.update()
const uPos = { value: Math.random() * 0.3 + 0.3 }

// gui.add(uPos, 'value', 0, 1).name('uPos')
// gui.add(totalAngle, 'x', -10.0, 10.0).name('x angle').listen()
// gui.add(totalAngle, 'y', -10.0, 10.0).name('y angle').listen()

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
			map: texture,
		})
		m.onBeforeCompile = (shader) => {
			shader.uniforms = Object.assign(shader.uniforms, {
				uOffset: { value: Math.random() },
				uPos,
				uMouse: { value: mouse },
				uPrevMouse: { value: prevMouse },
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
				uniform vec2 uPrevMouse;
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

				vec2 mouse = uMouse * 0.01;
				vec2 prevMouse = uPrevMouse * 0.01;
				vec2 deltaMouse = prevMouse - mouse;
				
				// transformed *= offset * nOffset;
				float a = -mouse.y;
				float b = -mouse.x;
				float deltaA = deltaMouse.x;
				float deltaB = deltaMouse.y;
				
				// vec3 center = uCenter + vec3(0,0,zOffset * nOffset);
				// transformed.z += zOffset * nOffset;

				// transformed.xz *= rotate2d( b  );
				// transformed.yz *= rotate2d( a );

				// center.xz *= rotate2d( b  );
				// center.yz *= rotate2d( a );
				
				
				// transformed.xz = rotateAroundVertex( -b ,transformed.xz, center.xz );
				// transformed.yz = rotateAroundVertex( -a ,transformed.yz, center.yz );

				// vec2 p = vec2(transformed.xy) - vec2(20.,0);
				// transformed.xy = p*rotate2d( a ) + vec2(20.,0) ;

				// transformed.xy = rotateAroundVertex( sin(b) * sin(b) * sin(b) * 3.14 ,transformed.xy,center.xy );
			
			`
			)
		}

		mesh.material = m
	})
}

let animal
let meshes = []
let positions = []

loader.load(model, (gltf) => {
	// const fox = gltf.scene.children[0].children[0].children[0].children[0]
	animal = gltf.scene
	// fox.rotateX(-Math.PI * 0.5)
	// fox.position.set(0, 0, 2)
	animal.scale.copy(new THREE.Vector3(5, 5, 5))
	scene.add(animal)
	console.log(animal)

	breakMesh(animal)

	animal.children.forEach((el, i) => {
		if (i === 0) {
			initialPos = el.position.clone()
		}

		el.position.z = 0
		el.position.z += (Math.random() - 0.5) * 0.75

		const angle2 = new THREE.Vector2(totalAngle.x, totalAngle.y)
		applyDeltaRot(el, angle2)

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

// scene.add(m)

function getAngle(v1, v2) {
	// console.log('getAngle', v1, v2)
	const XYNormal = new THREE.Vector3(0, 0, 1)
	const v1p = v1.clone().normalize().projectOnPlane(XYNormal)
	const v2p = v2.clone().normalize().projectOnPlane(XYNormal)

	return v1p.angleTo(v2p)
}

function animate() {
	requestAnimationFrame(animate)

	// required if controls.enableDamping or controls.autoRotate are set to true
	// controls?.update()
	const t = clock.getElapsedTime()

	if (animal) {
		// 	const x = -mouse.x / 300
		// 	const y = -mouse.y / 300
		// 	// animal.rotation.x = -mouse.y / 300
		// 	// animal.rotation.y = mouse.x / 300
		let angle = 0
		const dotP = m.position.clone().normalize().dot(new THREE.Vector3(0, 0, 1))
		// console.log(dotP, dotP - 1, (dotP - 1) * Math.PI)

		// console.log(initialPos)
		if (initialPos) {
			angle = getAngle(initialPos, animal.children[0].position)
			console.log(angle)
		}

		animal.children.forEach((el) => {
			el.children[0].rotation.y = (dotP - 1) * Math.PI + angle
			// SIN(totalAngle.y) * SIN(totalAngle.x) * Math.PI
		})
		// 	// meshes.forEach((el, i) => {
		// 	// 	// el.rotation.z = Math.PI * 2. * sin
		// 	// 	// const r = positions[i].length()
		// 	// 	// const x = Math.sin(y) * r
		// 	// 	// el.position.x = positions[i].x + addX
		// 	// 	el.position.x =
		// 	// 		positions[i].x * Math.cos(x) + positions[i].z * Math.sin(x)
		// 	// 	// el.position.z = positions[i].z + addZ
		// 	// 	el.position.z =
		// 	// 		positions[i].x * Math.sin(x) - positions[i].z * Math.cos(x)
		// 	// })
	}

	renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', onResize)

// wheel stop event
/**
 * function createWheelStopListener(element, callback, timeout) {
        var handle = null;
        var onScroll = function() {
            if (handle) {
                clearTimeout(handle);
            }
            handle = setTimeout(callback, timeout || 200); // default 200 ms
        };
        element.addEventListener('wheel', onScroll);
        return function() {
            element.removeEventListener('wheel', onScroll);
        };
    }

    // Example usage:

    createWheelStopListener(window, function() {
        console.log('onwheelstop');
    });
 */
