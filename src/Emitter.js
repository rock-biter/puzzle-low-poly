import {
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
	Color,
	DynamicDrawUsage,
	InstancedMesh,
	Matrix4,
	MeshBasicMaterial,
	MeshNormalMaterial,
	Points,
	PointsMaterial,
} from 'three'

export default class Emitter {
	system
	number = 4

	life = 3

	position

	positions

	constructor({ position }) {
		this.position = position.clone()
		this.geometry = new BoxGeometry(0.005, 0.01, 0.001)

		// this.geometry = new BufferGeometry()
		// this.setPositionAttribute()

		// this.material = new PointsMaterial({
		// 	size: 3,
		// 	sizeAttenuation: true,
		// })
		this.material = new MeshNormalMaterial()

		// this.points = new Points(this.geometry, this.material)
		const mesh = new InstancedMesh(
			this.geometry,
			this.material,
			this.number * this.number * this.number
		)
		mesh.instanceMatrix.setUsage(DynamicDrawUsage)

		mesh.position.set(0, 0, 0)
		let i = 0

		const matrix = new Matrix4()

		for (let x = 0; x < this.number; x++) {
			for (let y = 0; y < this.number; y++) {
				for (let z = 0; z < this.number; z++) {
					matrix.setPosition(x / 10, y / 10, z / 10)

					mesh.setMatrixAt(i, matrix)
					// mesh.setColorAt( i, color );
					mesh.setColorAt(i, new Color('#ff0000'))

					i++
				}
			}
		}

		this.points = mesh
	}

	setPositionAttribute() {
		this.positions = new Float32Array(this.number * 3)

		for (let i = 0; i < this.number; i++) {
			const i3 = i * 3
			this.positions[i3 + 0] = Math.random() - 0.5 //this.position.x
			this.positions[i3 + 1] = Math.random() - 0.5 //this.position.y
			this.positions[i3 + 2] = Math.random() - 0.5 //this.position.z
		}

		this.geometry.setAttribute(
			'position',
			new BufferAttribute(this.positions, 3)
		)
	}
}
