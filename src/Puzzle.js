import { TextureLoader } from 'three'
import load from './loader'

const tLoader = new TextureLoader()

export default class Puzzle {
	srcModel
	model

	srcTexture
	texture

	initialPos

	constructor({ srcModel, srcTexture }) {
		this.srcModel = srcModel
		this.srcTexture = srcTexture
	}

	load() {
		return new Promise((resolve, reject) => {
			tLoader.load(this.srcTexture, async (texture) => {
				this.texture = texture
				const { group, initialPos } = await load(this.srcModel, this.texture)
				this.model = group
				this.initialPos = initialPos

				resolve()
			})
		})
	}

	onComplete() {}

	onBeforeMount() {}
}
