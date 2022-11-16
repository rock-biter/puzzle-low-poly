import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {
	MeshStandardMaterial,
	MeshBasicMaterial,
	DoubleSide,
	Vector3,
	sRGBEncoding,
	LinearEncoding,
} from 'three'

const loader = new GLTFLoader()
const size = 0.3

function breakMesh(
	group,
	texture,
	uScale = { value: 1 },
	uOpacity = { value: 1 }
) {
	group.children.forEach(({ children }) => {
		const [mesh] = children

		mesh.material.map.encoding = sRGBEncoding
		mesh.material.map.encoding = sRGBEncoding
		mesh.material.transparent = true
		// console.log(mesh.material)
		// const m = new MeshStandardMaterial({
		// 	color: mesh.material.color,
		// 	side: DoubleSide,
		// 	map: texture,
		// 	transparent: true,
		// })
		// mesh.material.map = texture

		// console.log(m)

		mesh.material.onBeforeCompile = (shader) => {
			shader.uniforms = Object.assign(shader.uniforms, {
				uScale,
				uOpacity,
			})

			shader.vertexShader = shader.vertexShader.replace(
				'#include <common>',
				`
				#include <common>
				uniform float uScale;
			`
			)

			shader.vertexShader = shader.vertexShader.replace(
				'#include <begin_vertex>',
				`

				vec3 transformed = vec3( position ) * uScale;

			`
			)

			shader.fragmentShader = shader.fragmentShader.replace(
				'uniform float opacity;',
				`
				uniform float opacity;
				uniform float uOpacity;
				`
			)

			shader.fragmentShader = shader.fragmentShader.replace(
				'}',
				`
				gl_FragColor.a = uOpacity;
			}
				`
			)
			console.log(shader.fragmentShader)
		}

		// mesh.material = m
	})
}

export default function load(
	model,
	texture,
	uScale = { value: 1 },
	uOpacity = { value: 1 }
) {
	return new Promise((resolve, reject) => {
		try {
			loader.load(model, (gltf) => {
				const group = gltf.scene
				let initialPos

				breakMesh(group, texture, uScale, uOpacity)

				group.children.forEach((el, i) => {
					if (i === 0) {
						initialPos = el.position.clone()
					}

					el.position.z = 0
					el.position.z +=
						(Math.random() - 0.5) * 0.25 +
						Math.sin(el.position.x * 10) * 0.25 * Math.random() -
						Math.cos(el.position.y * 10) * 0.15 * Math.random()
					el.z *= size
				})

				resolve({
					group,
					initialPos,
				})
			})
		} catch (error) {
			reject()
		}
	})
}
