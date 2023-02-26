function SimpleTiles(parent){
	// Setup canvas and rendering context
	this.canvas = document.createElement('canvas');
	this.canvas.width = 150;
	this.canvas.height = 150;
	this.ctx = this.canvas.getContext("2d");
	console.debug('ctx created with sucess');
	parent.appendChild(this.canvas);

	// Game logic and animation should run separetly

	// Setup tick loop
	const fps = 1000 / 45;	// 30 is the desired fps, setInterval will cause 15ms 
	this.gameLoop = 0;
	this.renderLoop = 0;
	this.lastTick = performance.now();
	this.tick();
	setInterval(() => this.tick(), fps);

	// Setup animation loop
	const drawLoop = () => {
		this.draw();
		requestAnimationFrame(drawLoop);
	};
	requestAnimationFrame(drawLoop);
}

SimpleTiles.prototype.tick = function(){
	if (document.hidden) {
		// Do not run main game logic if tab is hidden
		// Keep tracking last tick, we need this in case user changes tab
		this.lastTick = performance.now();
		return;
	}

	// The actual interval of calling the function is never going to be precise
	// So we calculate the time difference between now and the last execution
	const deltaTime = performance.now() - this.lastTick;

	// Actual game logic
	console.debug(`game loop, deltaTime: ${deltaTime}, gameLoop: ${this.gameLoop}`);

	// Recapture performance.now() so we don't consider the time it took to execute game loop
	this.lastTick = performance.now();
	this.gameLoop++;
}

SimpleTiles.prototype.draw = function(timestamp){
	// Do not render if there is no update
	if (this.gameLoop <= this.renderLoop) {
		console.debug('render skipped');
		return;
	}

	// Actual rendering
	console.debug('render');

	// Rendering setup 
	const keyTiles = [
		{ key: 'a', color: '#f00' },
		{ key: 's', color: '#0f0' },
		{ key: 'd', color: '#00f' },
		{ key: 'f', color: '#ff0' },
	];
	const tileWidth = this.canvas.width / keyTiles.length;
	const canvasHeight = this.canvas.height;

	// Render keyTiles
	let xOffset = 0;
	const keyTileHeight = 40;
	for (const keyTile of keyTiles) {

		const drawHeight = canvasHeight - keyTileHeight;
		this.ctx.fillStyle = keyTile.color;
		this.ctx.fillRect(xOffset, drawHeight, tileWidth, keyTileHeight);

		// Render keys
		const key = keyTile.key.toUpperCase();
		this.ctx.font = '12px Verdana';
		this.ctx.textBaseline = 'middle';
		const keySize = this.ctx.measureText(key);
		this.ctx.fillStyle = '#fff';
		this.ctx.fillText(key,
			(xOffset + (tileWidth / 2)) - (keySize.width / 2),
			(drawHeight + (keyTileHeight / 2)));

		xOffset += tileWidth;
	}

	// Updates last rendered loop
	this.renderLoop = this.gameLoop;
}
