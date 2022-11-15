import { TextureLoader, Vector3, Vector2 } from 'three'
import gsap from 'gsap'
import load from './loader'

export function applyDeltaRot(mesh, angle2) {
	const a = angle2.x
	const b = -angle2.y

	mesh.position.applyAxisAngle(new Vector3(0, 1, 0), a)
	mesh.position.applyAxisAngle(new Vector3(1, 0, 0), b)
}

const tLoader = new TextureLoader()

export default class Puzzle {
	srcModel
	model

	srcTexture
	texture

	initialPos

	tl

	drag = false

	angle2 = new Vector2(0, 0)

	isActive = false

	constructor({ srcModel, srcTexture }) {
		this.srcModel = srcModel
		this.srcTexture = srcTexture

		this.tl = gsap.timeline({ paused: true })
	}

	load() {
		return new Promise((resolve, reject) => {
			tLoader.load(this.srcTexture, async (texture) => {
				this.texture = texture
				const { group, initialPos } = await load(this.srcModel, this.texture)
				this.model = group
				this.initialPos = initialPos

				this.initTimeline()

				resolve()
			})
		})
	}

	get scaleMap() {
		return this.model.children
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

	onComplete() {}

	onBeforeMount() {}

	show() {
		this.tl.restart()
	}

	hide() {
		this.tl.reverse()
	}

	applyAngle(angle2) {
		this.model.children.forEach((el) => {
			applyDeltaRot(el, angle2)
		})
	}
}
