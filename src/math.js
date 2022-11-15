import { Vector3 } from 'three'
import gsap from 'gsap'

export function applyDeltaRot(mesh, angle2, ease = false, duration = 0.5) {
	const a = angle2.x
	const b = -angle2.y

	if (!ease) {
		mesh.position.applyAxisAngle(new Vector3(0, 1, 0), a)
		mesh.position.applyAxisAngle(new Vector3(1, 0, 0), b)
	} else {
		const p = mesh.position.clone()

		p.applyAxisAngle(new Vector3(0, 1, 0), a)
		p.applyAxisAngle(new Vector3(1, 0, 0), b)

		gsap.to(mesh.position, { duration, x: p.x, y: p.y, z: p.z })
	}
}

export function getAngle(v1, v2) {
	const XYNormal = new Vector3(0, 0, 1)
	const v1p = v1.clone().normalize().projectOnPlane(XYNormal)
	const v2p = v2.clone().normalize().projectOnPlane(XYNormal)
	const { x1, y1 } = v1p
	const { x2, y2 } = v2p

	const a = Math.atan2(
		v1p.clone().cross(v2p.clone()).dot(XYNormal),
		v1p.dot(v2p)
	)

	return a
}
