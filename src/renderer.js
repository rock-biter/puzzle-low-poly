import { WebGLRenderer as Renderer, ACESFilmicToneMapping, Color } from 'three'

const renderer = new Renderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.physicallyCorrectLights = true
renderer.toneMapping = ACESFilmicToneMapping
renderer.toneMappingExposure = 3
renderer.setClearColor(new Color('#dcddff'))

window.addEventListener('resize', onResize)

function onResize() {
	renderer.setSize(window.innerWidth, window.innerHeight)
}

onResize()

export default renderer
