import './style.css'
import renderer from './src/renderer'
import scene from './src/scene'
import camera from './src/camera'
import load from './src/loader'
import Puzzle from './src/Puzzle'
import Controller from './src/Controller'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TextureLoader } from 'three'

import textureUrl from './src/gltf/materialbasecolortexture.png?url'
import model from './src/gltf/cane_2/cane_flat_v2.gltf?url'

let controls = new OrbitControls(camera, renderer.domElement)
controls.update()

const puzzle = new Puzzle({ srcModel: model, srcTexture: textureUrl })

{
	await puzzle.load()

	scene.add(puzzle.model)

	setTimeout(() => {
		puzzle.show()
	}, 3000)

	document.body.appendChild(renderer.domElement)

	function animate() {
		requestAnimationFrame(animate)
		controls.update()

		renderer.render(scene, camera)
	}

	animate()

	new Controller()
}
