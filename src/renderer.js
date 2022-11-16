import {
	WebGLRenderer as Renderer,
	ACESFilmicToneMapping,
	ReinhardToneMapping,
	CineonToneMapping,
	Color,
} from 'three'

const renderer = new Renderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.physicallyCorrectLights = true
renderer.toneMapping = ReinhardToneMapping
renderer.toneMappingExposure = 8
renderer.setClearColor(new Color('#ffffff'))

window.addEventListener('resize', onResize)

function onResize() {
	renderer.setSize(window.innerWidth, window.innerHeight)
}

onResize()

export default renderer
