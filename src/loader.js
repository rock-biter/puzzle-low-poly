import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {
	MeshStandardMaterial,
	MeshBasicMaterial,
	DoubleSide,
	Vector3,
} from 'three'

const loader = new GLTFLoader()

function breakMesh(group, texture) {
	group.children.forEach(({ children }) => {
		const [mesh] = children
		const m = new MeshBasicMaterial({
			color: mesh.material.color,
			side: DoubleSide,
			map: texture,
		})

		mesh.material = m
	})
}

export default function load(model, texture) {
	return new Promise((resolve, reject) => {
		try {
			loader.load(model, (gltf) => {
				const group = gltf.scene
				let initialPos

				breakMesh(group, texture)

				group.children.forEach((el, i) => {
					if (i === 0) {
						initialPos = el.position.clone()
					}

					el.position.z = 0
					el.position.z += (Math.random() - 0.5) * 0.75
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
