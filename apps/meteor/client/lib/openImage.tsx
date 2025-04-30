import Viewer from 'viewerjs';

export function openImage(imageUrl: string) {
	const container = document.createElement('div');
	const image = document.createElement('img');
	image.src = imageUrl;
	container.appendChild(image);

	const viewer = new Viewer(container, {
		inline: false,
		navbar: false,
		toolbar: {
			zoomIn: 1,
			zoomOut: 1,
			oneToOne: 0,
			reset: 1,
			prev: 0,
			play: 0,
			next: 0,
			rotateLeft: 0,
			rotateRight: 1,
			flipHorizontal: 0,
			flipVertical: 0,
		},
		hidden() {
			viewer.destroy();
			document.body.removeChild(container);
		},
	});

	viewer.show();
}
