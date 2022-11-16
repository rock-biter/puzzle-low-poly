import { Vector3 } from 'three'
import Emitter from './Emitter'
import Puzzle from './Puzzle'

export default class Slider {
	slides = []
	sources = []

	scene

	activeIndex = 0

	emitter

	constructor({ sources = [], scene }) {
		this.sources = sources
		this.scene = scene

		// this.emitter = new Emitter({ position: new Vector3(0, 0, 1) })
		// this.scene.add(this.emitter.points)
	}

	async mount() {
		for await (const source of this.sources) {
			const puzzle = new Puzzle({ ...source, scene: this.scene })
			this.slides.push(puzzle)

			await await puzzle.load()

			puzzle.registerCallback(
				'onComplete',
				() => {
					setTimeout(() => {
						this.next()
					}, 3000)
				},
				this
			)
		}

		this.currentSlide?.show()
	}

	get currentSlide() {
		return this.slides[this.activeIndex]
	}

	next() {
		this.currentSlide?.hide()
		this.incrementIndex()
		setTimeout(() => {
			this.currentSlide?.show()
		}, 500)
	}

	incrementIndex() {
		this.activeIndex < this.slides.length - 1
			? this.activeIndex++
			: (this.activeIndex = 0)
	}
}
