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
import { GUI } from 'dat.gui'

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

	callbacks = {
		onComplete: [],
		onMount: [],
	}

	uScale = { value: 0.0 }
	uOpacity = { value: 0.0 }

	scene

	constructor({ srcModel, srcTexture, scene }) {
		this.scene = scene
		this.srcModel = srcModel
		this.srcTexture = srcTexture

		this.tl = gsap.timeline({ paused: true })

		window.addEventListener('ondrag', this.onDrag)

		// this.gui()
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
		this.rotatePuzzle(angle2)
	}

	rotatePuzzle(angle2) {
		this.angle2.x += angle2.x
		this.angle2.y += angle2.y

		if (this.isActive) {
			this.applyAngle(angle2)
		}
	}

	rotateToSnap() {
		const rif = new Vector3(0, 0, 1)
		const diff = rif.sub(this.handle.position.clone().normalize())
		this.applyAngle(diff, true, 0.5)
	}

	load() {
		return new Promise((resolve, reject) => {
			try {
				tLoader.load(this.srcTexture, async (texture) => {
					this.texture = texture
					const { group, initialPos } = await load(
						this.srcModel,
						this.texture,
						this.uScale,
						this.uOpacity
					)
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
		gsap.set(this.model.scale, {
			x: 0,
			y: 0,
			z: 0,
		})

		this.tl
			.addLabel('show')
			.fromTo(
				this.model.scale,
				{ x: 0, y: 0, z: 0 },
				{ duration: 0.8, x: 1, y: 1, z: 1 }
			)
			.fromTo(this.uOpacity, { value: 0 }, { duration: 0.6, value: 1 }, '<')
			.fromTo(
				this.uScale,
				{ value: 0 },
				{
					duration: 0.8,
					value: 1,
					onComplete: () => {
						this.isActive = true
						this.tl.pause()
					},
					onStart: () => {
						this.scene.add(this.model)
					},
				},
				'<'
			)

		this.tl
			.addLabel('completed')
			.to(this.uScale, { duration: 0.5, value: 0.5 })
			.to(this.uScale, {
				duration: 0.5,
				value: 1.001,
				onComplete: () => {
					this.tl.pause()
				},
			})

		this.tl
			.addLabel('hide')
			.fromTo(
				this.model.scale,
				{ x: 1, y: 1, z: 1 },
				{
					duration: 0.5,
					x: 0,
					y: 0,
					z: 0,
					onComplete: () => {
						this.uScale.value = 0
						this.scene.remove(this.model)
					},
				}
			)
			.to(this.uOpacity, { duration: 0.3, value: 0 }, '<')
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
		gsap.to(this.model.rotation, {
			duration: 1,
			z: this.angle,
			onComplete: () => {
				this.tl.play('completed')

				for (const callback of this.onCompleteCallbacks) {
					callback.callback.call(callback.thisArg)
				}
			},
		})
	}

	onBeforeMount() {}

	show() {
		this.randomize()
		this.tl.play('show')
	}

	hide() {
		this.tl.play('hide')
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
		this.model.children.forEach((el) => {
			el.children[0].rotation.y =
				(this.meshDotHandle - 1) * Math.PI + this.angle
		})
	}

	randomize() {
		this.reset()
		const angle2 = new Vector2(Math.random() * Math.PI, Math.random() * Math.PI)
		this.startAngle2.copy(angle2)
		this.applyAngle(angle2)
	}

	reset() {
		this.model.rotation.z = 0
	}

	registerCallback(type, callback, thisArg) {
		if (type && typeof callback === 'function') {
			this.callbacks[type].push({ callback, thisArg })
		}
	}

	get onCompleteCallbacks() {
		return this.callbacks['onComplete']
	}

	gui() {
		const gui = new GUI()
		gui.add(this.uScale, 'value', 0, 1, 0.01).name('scala')
		gui.add(this.uOpacity, 'value', 0, 1, 0.01).name('opacità')
	}
}
