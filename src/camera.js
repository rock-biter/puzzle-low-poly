import { OrthographicCamera, Vector3 } from 'three'

let aspect = window.innerWidth / window.innerHeight,
	frustumSize = 5

const camera = new OrthographicCamera(
	(frustumSize * aspect) / -2,
	(frustumSize * aspect) / 2,
	frustumSize / 2,
	frustumSize / -2,
	0.1,
	100
)

camera.position.set(0, 0, 5)

function onResize() {
	aspect = window.innerWidth / window.innerHeight

	camera.left = (frustumSize * aspect) / -2
	camera.right = (frustumSize * aspect) / 2
	camera.top = frustumSize / 2
	camera.bottom = frustumSize / -2

	camera.lookAt(new Vector3(0, 0, 0))

	camera.updateProjectionMatrix()
	controls?.update()

	renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', onResize)

export default camera
