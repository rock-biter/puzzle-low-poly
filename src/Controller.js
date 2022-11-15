import { Vector2 } from 'three'

export default class Controller {
	mouse = new Vector2(0, 0)
	prevMouse = new Vector2(0, 0)
	startMouse = new Vector2(0, 0)

	constructor() {
		window.addEventListener('mousedown', (e) => this.onDragStart(e))
		window.addEventListener('touchstart', (e) => this.onDragStart(e))
		window.addEventListener('mouseup', (e) => this.onDragEnd(e))
		window.addEventListener('touchend', (e) => this.onDragEnd(e))
		window.addEventListener('mousemove', (e) => this.onDrag(e))
		window.addEventListener('touchmove', (e) => this.onDrag(e))
	}

	onDrag(e) {
		if (!this.drag) return

		this.prevMouse.copy(this.mouse)

		this.mouse.x = -this.startMouse.x + e.pageX
		this.mouse.y = this.startMouse.y - e.pageY

		const diff = this.mouse
			.clone()
			.sub(this.prevMouse.clone())
			.multiplyScalar(0.01)

		const a = diff.x
		const b = diff.y

		// totalAngle.x += a
		// totalAngle.y -= b

		const angle2 = new Vector2(a, b)
		console.log(angle2)

		// TODO emit event

		// applyDeltaRot(m, angle2)

		// rotatePuzzle(animal, angle2)
	}

	onDragStart(e) {
		this.startMouse.x = e.pageX - this.mouse.x
		this.startMouse.y = e.pageY + this.mouse.y

		this.drag = true
	}

	onDragEnd() {
		this.drag = false

		this.mouse.x = 0
		this.mouse.y = 0
	}
}
