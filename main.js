import './style.css'
import renderer from './src/renderer'
import scene from './src/scene'
import camera from './src/camera'
import load from './src/loader'
import Puzzle from './src/Puzzle'
import Controller from './src/Controller'

import { GUI } from 'dat.gui'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TextureLoader } from 'three'

import textureUrl from './src/gltf/materialbasecolortexture.png?url'
import model from './src/gltf/cane_2/cane_flat_v2.gltf?url'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
// import {  } from 'three/examples/js/postprocessing/';
import { BokehPass } from './src/addon/postprocessing/BokehPass'

const postprocessing = {}

const effectController = {
	focus: 4,
	aperture: 4.3,
	maxblur: 0.0037,
}

const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
const bokehPass = new BokehPass(scene, camera, {
	...effectController,
})
composer.addPass(renderPass)
composer.addPass(bokehPass)

postprocessing.bokeh = bokehPass

let controls

// controls = new OrbitControls(camera, renderer.domElement)
controls?.update()

const puzzle = new Puzzle({ srcModel: model, srcTexture: textureUrl })

const init = async () => {
	await puzzle.load()

	scene.add(puzzle.model)
	// scene.add(puzzle.handle)

	puzzle.show()

	document.body.appendChild(renderer.domElement)

	function animate() {
		requestAnimationFrame(animate)
		controls?.update()

		// renderer.render(scene, camera)
		composer.render(0.1)
	}

	animate()

	new Controller()

	const matChanger = function () {
		postprocessing.bokeh.uniforms['focus'].value = effectController.focus
		postprocessing.bokeh.uniforms['aperture'].value =
			effectController.aperture * 0.00001
		postprocessing.bokeh.uniforms['maxblur'].value = effectController.maxblur
	}

	// const gui = new GUI()
	// gui.add(effectController, 'focus', -100, 100, 1).onChange(matChanger)
	// gui.add(effectController, 'aperture', 0, 10, 0.01).onChange(matChanger)
	// gui.add(effectController, 'maxblur', 0.0, 0.01, 0.0001).onChange(matChanger)
	// gui.close()

	matChanger()
}

init()
