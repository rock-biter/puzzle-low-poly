import './style.css'
import renderer from './src/renderer'
import scene from './src/scene'
import camera from './src/camera'
import Controller from './src/Controller'
import Slider from './src/Slider'
import logo from './src/image/logo.png?url'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { GUI } from 'dat.gui'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// import textureUrl from './src/gltf/materialbasecolortexture.png?url'
// import model from './src/gltf/cane_2/cane_flat_v2.gltf?url'

import textureUrl from './src/gltf/pesca/pesca.jpeg?url'
import model from './src/gltf/pesca/pesca.gltf?url'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
// import {  } from 'three/examples/js/postprocessing/';
import { BokehPass } from './src/addon/postprocessing/BokehPass'
import { AmbientLight } from 'three'

const logoImage = (document.getElementById('logo').src = logo)

const postprocessing = {}

const effectController = {
	focus: 10,
	aperture: 3,
	maxblur: 0.004,
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

const sources = [
	{ srcModel: model, srcTexture: textureUrl },
	{ srcModel: model, srcTexture: textureUrl },
	{ srcModel: model, srcTexture: textureUrl },
	{ srcModel: model, srcTexture: textureUrl },
]

const slider = new Slider({ sources, scene })

const init = async () => {
	await slider.mount()

	// scene.add(puzzle.handle)

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
	// // gui.close()

	matChanger()

	// const pesca = new GLTFLoader().load(model, (gltf) => {
	// 	scene.add(gltf.scene)
	// })

	const light = new AmbientLight('#ffffff', 5)
	scene.add(light)
}

init()
