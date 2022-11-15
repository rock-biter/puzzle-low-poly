import {
	TextureLoader,
	Vector3,
	Vector2,
	SphereGeometry,
	Mesh,
	MeshBasicMaterial,
} from 'three'
import gsap from 'gsap'
import load from './loader'
import { getAngle, applyDeltaRot } from './math'

const tLoader = new TextureLoader()

export default class Puzzle {
	srcModel
	model
	handle

	srcTexture
	texture

	initialPos

	tl

	angle = 0
	angle2 = new Vector2(0, 0)
	startAngle2 = new Vector2(0, 0)

	isActive = false

	constructor({ srcModel, srcTexture }) {
		this.srcModel = srcModel
		this.srcTexture = srcTexture

		this.tl = gsap.timeline({ paused: true })

		window.addEventListener('ondrag', this.onDrag)
	}

	initHandle() {
		const dot = new SphereGeometry(0.01, 4, 4)
		const mat = new MeshBasicMaterial({ color: '#ff0000' })
		const m = new Mesh(dot, mat)
		m.position.z = 1

		this.handle = m
	}

	onDrag = (e) => {
		const { angle2 } = e.detail
		// console.log(this.angle2)
		this.rotatePuzzle(angle2)
	}

	rotatePuzzle(angle2) {
		this.angle2.x += angle2.x
		this.angle2.y += angle2.y

		// console.log(this.angle2)

		if (this.isActive) {
			// console.log(this.meshDotHandle)
			this.applyAngle(angle2)
		}
	}

	rotateToSnap() {
		// const angle = this.angle2.clone().add(this.startAngle2).negate()
		// const { x, y } = angle
		const rif = new Vector3(0, 0, 1)
		const diff = rif.sub(this.handle.position.clone().normalize())

		console.log('diff', diff)

		// this.model.children.forEach((el) => {
		// 	const length = el.position.length()
		// 	const p = el.position.clone().add(diff)

		// 	console.log('----->', el.position, p)

		// 	gsap.to(el.position, { duration: 1, x: p.x, y: p.y, z: p.z })
		// })

		this.applyAngle(diff, true, 0.5)
	}

	load() {
		return new Promise((resolve, reject) => {
			try {
				tLoader.load(this.srcTexture, async (texture) => {
					this.texture = texture
					const { group, initialPos } = await load(this.srcModel, this.texture)
					this.model = group
					this.initialPos = initialPos
					this.initHandle()

					this.initTimeline()

					resolve()
				})
			} catch (error) {
				reject()
			}
		})
	}

	get scaleMap() {
		return [...this.model.children]
			.sort((a, b) => Math.abs(a.position.x) - Math.abs(b.position.x))
			.map(({ scale }) => scale)
	}

	initTimeline() {
		gsap.set(this.scaleMap, {
			x: 0,
			y: 0,
			z: 0,
		})

		this.tl.to(this.scaleMap, {
			x: 1,
			y: 1,
			z: 1,
			duration: 0.3,
			onComplete: () => {
				this.isActive = true
			},
			onReverseComplete: () => {
				this.isActive = false
			},
			stagger: {
				amount: 0.5,
				from: 'random',
			},
		})
	}

	get meshDotHandle() {
		const dotP = this.handle.position
			.clone()
			.normalize()
			.dot(new Vector3(0, 0, 1))

		if (dotP >= 0.9999 && this.isActive) {
			// this.hide()
			// this.isActive = false
			// this.rotateToSnap()
			// setTimeout(() => {
			// 	this.randomize()
			// }, 2000)
			this.onComplete()
		}

		return dotP
	}

	getAngleBetween() {
		let angle = 0

		if (this.initialPos) {
			angle = -getAngle(this.initialPos, this.model.children[0].position)
		}

		return angle
	}

	onComplete() {
		this.isActive = false
		this.rotateToSnap()
		gsap.to(this.model.rotation, { duration: 1, z: this.angle })
	}

	onBeforeMount() {}

	show() {
		this.randomize()
		gsap.fromTo(
			this.model.scale,
			{ x: 0.2, y: 0.2, z: 0.2 },
			{ duration: 0.8, x: 1, y: 1, z: 1 }
		)
		this.tl.restart()
	}

	hide() {
		this.tl.reverse()
	}

	applyAngle(angle2, ease = false, duration = 0.5) {
		applyDeltaRot(this.handle, angle2, ease, duration)
		this.model.children.forEach((el) => {
			applyDeltaRot(el, angle2, ease, duration)
		})
		this.rotatePolygon()
	}

	rotatePolygon() {
		this.angle = this.getAngleBetween()
		// console.log('angle between', angle)
		// console.log('dot', this.meshDotHandle)
		this.model.children.forEach((el) => {
			el.children[0].rotation.y =
				(this.meshDotHandle - 1) * Math.PI + this.angle
		})
	}

	randomize() {
		this.reset()
		const angle2 = new Vector2(Math.random() * Math.PI, Math.random() * Math.PI)
		this.startAngle2.copy(angle2)
		// console.log('start', this.startAngle2)
		// const angle2 = new Vector2(0, 0)
		this.applyAngle(angle2)
	}

	reset() {
		this.model.rotation.z = 0
	}
}
