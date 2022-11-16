import { viteStaticCopy } from 'vite-plugin-static-copy'

export default {
	plugins: [
		viteStaticCopy({
			targets: [
				{
					src: 'src/gltf/materialbasecolortexture.png',
					dest: 'assets',
				},
				{
					src: 'src/gltf/cane_2/cane_flat_v2.bin',
					dest: 'assets',
				},
				{
					src: 'src/gltf/pesca/pesca.jpeg',
					dest: 'assets',
				},
				{
					src: 'src/gltf/pesca/pesca.bin',
					dest: 'assets',
				},
			],
		}),
	],
}
